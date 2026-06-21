"""
MAINFRAME, Console du Conseil de l'Arche
Cœur du jeu "Protocole CASSANDRA". Valide les flags, débloque les actes
séquentiellement, gère le compte à rebours de l'Abattage et les indices.

Mode mono-poste : chaque équipe lance son propre conteneur. L'état de
progression est persisté dans state/progress.json (volume Docker).
"""
import hashlib
import json
import os
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE = os.path.dirname(__file__)
STATE_DIR = os.path.join(BASE, "state")
STATE_FILE = os.path.join(STATE_DIR, "progress.json")

with open(os.path.join(BASE, "flags.json"), encoding="utf-8") as f:
    GAME = json.load(f)
ACTES = GAME["actes"]
COUNTDOWN_HOURS = GAME.get("countdown_hours", 7.5)


# ── État persistant ──────────────────────────────────────────────
def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, encoding="utf-8") as fh:
            return json.load(fh)
    state = {"started_at": datetime.now(timezone.utc).isoformat(),
             "solved": [], "hints_used": {}}
    save_state(state)
    return state


def save_state(state):
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2)


def normalize(flag):
    return flag.strip().upper().replace(" ", "")


def sha(flag):
    return hashlib.sha256(normalize(flag).encode()).hexdigest()


def current_index(state):
    """Index du premier acte non résolu (= acte actif)."""
    for i, acte in enumerate(ACTES):
        if acte["id"] not in state["solved"]:
            return i
    return len(ACTES)


# ── Vues ─────────────────────────────────────────────────────────
def deadline(state):
    start = datetime.fromisoformat(state["started_at"])
    return start + timedelta(hours=COUNTDOWN_HOURS)


@app.route("/")
def index():
    state = load_state()
    idx = current_index(state)
    actes_view = []
    for i, acte in enumerate(ACTES):
        solved = acte["id"] in state["solved"]
        available = i <= idx  # l'acte courant + tous les résolus
        actes_view.append({
            "num": i + 1,
            "id": acte["id"],
            "titre": acte["titre"],
            "competence": acte["competence"],
            "brief": acte["brief"] if available else None,
            "unlock": acte["unlock"] if solved else None,
            "solved": solved,
            "available": available,
            "hints_used": state["hints_used"].get(acte["id"], 0),
            "hints_total": len(acte["hints"]),
        })
    return render_template(
        "index.html",
        title=GAME["title"],
        actes=actes_view,
        solved_count=len(state["solved"]),
        total=len(ACTES),
        deadline_iso=deadline(state).isoformat(),
        finished=idx >= len(ACTES),
    )


@app.route("/submit", methods=["POST"])
def submit():
    state = load_state()
    idx = current_index(state)
    flag = request.form.get("flag", "")
    if idx >= len(ACTES):
        return jsonify(ok=False, msg="Tous les fragments sont déjà récupérés."), 400

    acte = ACTES[idx]
    if sha(flag) == acte["sha256"]:
        if acte["id"] not in state["solved"]:
            state["solved"].append(acte["id"])
            save_state(state)
        return jsonify(ok=True, unlock=acte["unlock"],
                       finished=current_index(state) >= len(ACTES))

    # Tolérance : accepter aussi un acte déjà débloqué (anti-frustration)
    for done in ACTES[:idx]:
        if sha(flag) == done["sha256"]:
            return jsonify(ok=False, msg="Fragment déjà validé. Passe au suivant !"), 200
    return jsonify(ok=False, msg="Code rejeté par le mainframe. Réessaie."), 200


@app.route("/hint/<acte_id>", methods=["POST"])
def hint(acte_id):
    state = load_state()
    acte = next((a for a in ACTES if a["id"] == acte_id), None)
    if not acte:
        return jsonify(ok=False), 404
    used = state["hints_used"].get(acte_id, 0)
    if used >= len(acte["hints"]):
        return jsonify(ok=False, msg="Plus d'indices disponibles."), 200
    text = acte["hints"][used]
    state["hints_used"][acte_id] = used + 1
    save_state(state)
    return jsonify(ok=True, hint=text, remaining=len(acte["hints"]) - used - 1)


@app.route("/reset", methods=["POST"])
def reset():
    """Réinitialise la partie (animateur)."""
    save_state({"started_at": datetime.now(timezone.utc).isoformat(),
                "solved": [], "hints_used": {}})
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
