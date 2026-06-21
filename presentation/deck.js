/* ════════════════════════════════════════════════════════════════
   PROTOCOLE CASSANDRA, moteur de présentation
   Navigation • compte à rebours global (8h) • timer de phase •
   indices • plein écran • son optionnel • aide. 100% autonome.
   ════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LS = {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    del: (k) => localStorage.removeItem(k),
  };
  const GAME_HOURS = 7.5;   // 09h30 -> 17h00 (chrono tourne pendant le déjeuner)

  const slides = $$(".slide");
  const stage = $("#stage");
  let idx = 0;

  // ── Son (optionnel, désactivé par défaut) ──────────────────────
  let muted = LS.get("ark_mute") !== "0";
  let actx = null;
  function beep(freq = 440, dur = 0.06, type = "square", gain = 0.04) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = gain;
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) {}
  }
  const chime = () => { beep(523, .08); setTimeout(() => beep(784, .12), 90); };

  // ── Navigation ─────────────────────────────────────────────────
  function show(i, dir = 1) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === idx && slides[idx].classList.contains("active")) { syncHash(); return; }
    slides.forEach((s) => s.classList.remove("active"));
    idx = i;
    const s = slides[idx];
    s.classList.add("active");
    s.style.setProperty("--dir", dir);
    syncHash();
    renderDots();
    renderCounter();
    renderPhase();
    if (s.dataset.boot !== undefined) typeBoot(s);
    beep(dir > 0 ? 660 : 520, .04);
  }
  const next = () => show(idx + 1, 1);
  const prev = () => show(idx - 1, -1);
  const syncHash = () => { history.replaceState(null, "", "#" + (idx + 1)); LS.set("ark_slide", idx); };

  // ── Compte à rebours global (Abattage) ─────────────────────────
  const clkEl = $("#globalClock"), clkVal = $("#gv");
  function startGame(force) {
    if (LS.get("ark_deadline") && !force) return;
    LS.set("ark_deadline", String(Date.now() + GAME_HOURS * 3600e3));
    chime();
  }
  function resetGame() { LS.del("ark_deadline"); document.body.classList.remove("alarm"); }
  function tickGlobal() {
    const dl = Number(LS.get("ark_deadline"));
    if (!dl) { clkEl.classList.add("idle"); clkVal.textContent = hms(GAME_HOURS * 3600e3);
               document.body.classList.remove("alarm"); return; }
    clkEl.classList.remove("idle");
    const left = dl - Date.now();
    if (left <= 0) { clkVal.textContent = "ABATTAGE EN COURS"; document.body.classList.add("alarm"); return; }
    clkVal.textContent = hms(left);
    document.body.classList.toggle("alarm", left < 60 * 60e3);
  }

  // ── Timer de phase (par slide) ─────────────────────────────────
  const pName = $("#pName"), pTime = $("#pTime");
  function phaseKey() { return slides[idx].id || ("s" + idx); }
  function togglePhase() {
    const mins = Number(slides[idx].dataset.minutes || 0);
    if (!mins) return;
    const running = LS.get("ark_phase_id") === phaseKey() && LS.get("ark_phase_end");
    if (running) { LS.del("ark_phase_end"); LS.del("ark_phase_id"); }       // reset
    else { LS.set("ark_phase_end", String(Date.now() + mins * 60e3)); LS.set("ark_phase_id", phaseKey()); chime(); }
    renderPhase(); tickPhase();
  }
  function renderPhase() {
    const mins = Number(slides[idx].dataset.minutes || 0);
    const label = slides[idx].dataset.pname || ",";
    pName.textContent = mins ? `PHASE : ${label} · ${mins} min` : ",";
    $("#phaseCtl").style.visibility = mins ? "visible" : "hidden";
  }
  function tickPhase() {
    const mins = Number(slides[idx].dataset.minutes || 0);
    pTime.className = "ptime";
    if (!mins) { pTime.textContent = "--:--"; pTime.classList.add("idle"); return; }
    const running = LS.get("ark_phase_id") === phaseKey() && LS.get("ark_phase_end");
    if (!running) { pTime.textContent = mmss(mins * 60e3); pTime.classList.add("idle"); return; }
    const left = Number(LS.get("ark_phase_end")) - Date.now();
    if (left <= 0) { pTime.textContent = "00:00"; pTime.classList.add("over"); return; }
    pTime.textContent = mmss(left);
    if (left < mins * 60e3 * 0.2) pTime.classList.add("warn");
  }

  // ── Indices ────────────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".hintbtn");
    if (!b || b.classList.contains("used")) return;
    const box = $(".hintbox", b.closest(".hints"));
    const p = document.createElement("p");
    p.textContent = b.dataset.hint;
    box.appendChild(p);
    b.classList.add("used");
    beep(380, .06, "sine", .05);
  });

  // ── Boot typewriter ────────────────────────────────────────────
  function typeBoot(s) {
    const el = $(".boot", s);
    if (!el || el.dataset.done) return;
    el.dataset.done = "1";
    const full = el.getAttribute("data-text") || "";
    el.textContent = "";
    el.classList.add("cursor");
    let i = 0;
    (function step() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i += full[i] === "\n" ? 1 : 1;
        const d = full[i - 1] === "\n" ? 90 : 14 + Math.random() * 22;
        if (i % 3 === 0) beep(1200, .008, "square", .015);
        setTimeout(step, d);
      } else { el.classList.remove("cursor"); }
    })();
  }

  // ── HUD: dots & compteur ───────────────────────────────────────
  function renderDots() {
    const wrap = $("#dots"); wrap.innerHTML = "";
    slides.forEach((s, i) => {
      const d = document.createElement("div");
      d.className = "dot" + (s.dataset.break !== undefined ? " break" : "")
        + (i === idx ? " act" : i < idx ? " done" : "");
      d.title = s.dataset.pname || s.dataset.time || "";
      d.onclick = () => show(i, i > idx ? 1 : -1);
      wrap.appendChild(d);
    });
  }
  function renderCounter() {
    $("#counter").innerHTML = `<b>${idx + 1}</b> / ${slides.length}`
      + (slides[idx].dataset.time ? ` · ${slides[idx].dataset.time}` : "");
  }

  // ── Helpers temps ──────────────────────────────────────────────
  const pad = (n) => String(n).padStart(2, "0");
  function hms(ms) { const s = Math.floor(ms / 1e3); return `${pad(s/3600|0)}:${pad((s%3600)/60|0)}:${pad(s%60)}`; }
  function mmss(ms) { const s = Math.max(0, Math.floor(ms / 1e3)); return `${pad(s/60|0)}:${pad(s%60)}`; }

  // ── Plein écran ────────────────────────────────────────────────
  function fs() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }

  // ── Aide ───────────────────────────────────────────────────────
  const help = $("#help");
  const toggleHelp = () => help.classList.toggle("show");

  // ── Raccourcis clavier ─────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case " ": case "PageDown": case "n": next(); break;
      case "ArrowLeft": case "PageUp": case "p": prev(); break;
      case "Home": show(0); break;
      case "End": show(slides.length - 1); break;
      case "f": case "F": fs(); break;
      case "g": case "G": startGame(false); tickGlobal(); break;
      case "t": case "T": togglePhase(); break;
      case "m": case "M": muted = !muted; LS.set("ark_mute", muted ? "1" : "0"); flash(muted ? "🔇 SON COUPÉ" : "🔊 SON ACTIVÉ"); if (!muted) chime(); break;
      case "h": case "H": case "?": toggleHelp(); break;
      case "Escape": help.classList.remove("show"); break;
      case "r": case "R":
        if (confirm("Réinitialiser TOUT (compte à rebours + timers) ?")) { resetGame(); LS.del("ark_phase_end"); LS.del("ark_phase_id"); tickGlobal(); renderPhase(); tickPhase(); flash("⟲ RÉINITIALISÉ"); }
        break;
    }
  });

  // boutons d'action dans les slides
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    if (a.dataset.action === "start-game") { startGame(true); tickGlobal(); flash("⏱️ COMPTE À REBOURS LANCÉ"); next(); }
    if (a.dataset.action === "next") next();
  });
  $$(".nav-arrow").forEach((b) => b.onclick = () => b.classList.contains("next") ? next() : prev());
  const phaseBtn = $("#phaseBtn");
  if (phaseBtn) phaseBtn.onclick = togglePhase;   // bouton ▶/↺ du timer de phase

  // petit toast
  let toastT;
  function flash(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t);
      Object.assign(t.style, { position: "fixed", bottom: "70px", left: "50%", transform: "translateX(-50%)",
        background: "rgba(8,18,24,.95)", border: "1px solid var(--green-dim)", color: "var(--green)",
        padding: "10px 18px", borderRadius: "6px", zIndex: 90, letterSpacing: "1px", fontSize: ".9rem" }); }
    t.textContent = msg; t.style.opacity = "1";
    clearTimeout(toastT); toastT = setTimeout(() => t.style.opacity = "0", 1600);
  }

  // ── Démarrage ──────────────────────────────────────────────────
  const fromHash = parseInt(location.hash.slice(1), 10);
  const fromLS = parseInt(LS.get("ark_slide"), 10);
  let start = (fromHash ? fromHash - 1 : (fromLS || 0)) || 0;
  start = Math.max(0, Math.min(slides.length - 1, start));
  idx = -1;                       // force le premier rendu (slide 1 a déjà .active en HTML)
  show(start);
  tickGlobal(); tickPhase();
  setInterval(() => { tickGlobal(); tickPhase(); }, 1000);
})();
