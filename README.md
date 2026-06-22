# 🛰️ THE 100 · PROTOCOLE CASSANDRA — Escape Game Data/IA

> *Univers : The 100. Niveau : Data Analyst débutant. Journée : 09h30 → 17h00.*

```
  ◢◤ TRANSMISSION PRIORITAIRE · CONSEIL DE L'ARCHE ◢◤
  ────────────────────────────────────────────────
  97 ans après l'apocalypse nucléaire, les derniers
  survivants de l'humanité vivent sur l'ARCHE, une
  station spatiale à l'agonie. Le système de survie
  lâche. Pour économiser l'oxygène, le Conseil va
  déclencher l'ABATTAGE : des centaines d'habitants
  seront envoyés à la dérive dans l'espace, sur
  recommandation de l'IA CASSANDRA.

  L'ingénieure Elsa Reye a découvert que CASSANDRA est
  TRUQUÉE : elle condamne les ouvriers de Factory Station
  et épargne l'élite d'Alpha. Elsa a disparu. Avant de
  partir, elle a verrouillé ses preuves derrière 6 énigmes.

  Vous êtes l'équipe d'audit. L'Abattage tombe à 17h00 PILE.
  Prouvez le biais. Trouvez le coupable. ARRÊTEZ LE CULLING.
```

## 🎯 Votre mission

Récupérer **6 fragments de preuve** en analysant les données laissées par Elsa.
Chaque énigme vous donne un **code** de la forme `ARK{...}` à valider dans la
**Console du Conseil**. Le 6ᵉ fragment suspend l'Abattage et révèle le coupable.

---

## ✅ Prérequis

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installé et démarré.
  C'est tout : Python, pandas, PostgreSQL… **tout est dans les conteneurs**, rien d'autre à installer.
- Un navigateur web (Chrome, Firefox, Edge…).

---

## 🚀 1. Récupérer le projet

```bash
git clone git@github.com:Humanix-Cybersecurity/The_100_Datas.git
cd The_100_Datas
```

## 🐳 2. Lancer la mission (le jeu)

```bash
docker compose up --build
```

Patientez que les 4 services démarrent (le premier build prend 1 à 3 min), puis ouvrez :

| Service | URL | Accès |
|---|---|---|
| 🖥️ **Console du Conseil** (le jeu) | http://localhost:5005 | — |
| 🔬 **Terminal Go-Sci** (Jupyter) | http://localhost:8888 | token : `goscistation` |
| 🗄️ **Adminer** (SQL, acte III) | http://localhost:8080 | serveur `registre` · user `auditeur` · mdp `arche2152` · base `arche` |

> 💡 Gardez la **Console** ouverte en permanence : elle valide vos fragments,
> affiche le compte à rebours de l'Abattage et délivre des **indices** (avec malus).

## 🎥 3. Lancer la présentation (sur le projecteur)

La présentation rythme la journée (histoire, compte à rebours, indices). Au choix :

- **Le plus simple** : double-cliquez `presentation/lancer-presentation.command`
  (macOS). Elle s'ouvre sur http://localhost:8800.
- **Sinon**, en ligne de commande :
  ```bash
  cd presentation
  python3 -m http.server 8800
  # puis ouvrez http://localhost:8800
  ```

Touche `H` dans la présentation pour la liste des raccourcis (avancer, plein écran, etc.).

---

## 🧩 Les 6 actes

| # | Acte | Compétence | Où travailler ? |
|---|------|-----------|------|
| I | La fuite d'oxygène | Nettoyage (Pandas) | Jupyter · `01_nettoyage.ipynb` |
| II | L'unité fantôme | Agrégation (groupby) | Jupyter · `02_agregation.ipynb` |
| III | Le registre verrouillé | SQL (jointure) | Adminer |
| IV | Le message dans la courbe | Data Viz (matplotlib) | Jupyter · `04_visualisation.ipynb` |
| V | Le biais de CASSANDRA | Analyse & éthique IA | Jupyter · `05_biais.ipynb` |
| VI | Arrêter l'Abattage | Synthèse | Jupyter · `06_final.ipynb` |
| VII | Praimfaya : le dernier abri **(bonus)** | Fusion de données (`merge`) & filtres | Jupyter · `07_praimfaya.ipynb` |

> 🌍 L'**acte VII est un bonus** pour les équipes rapides : il apparaît dans la Console
> une fois les 6 premiers fragments validés. Plus difficile (il faut croiser 3 fichiers).

Chaque notebook vous guide. Quand vous trouvez un code `ARK{...}`, validez-le dans
la **Console**. Les actes se débloquent **dans l'ordre**.

---

## 🔄 Recommencer une partie

```bash
docker compose down -v   # le -v efface la progression et le compte à rebours
docker compose up --build
```

## 🆘 Dépannage

| Problème | Solution |
|---|---|
| La console n'est pas sur `:5000` | Normal : elle est sur **:5005** (le 5000 est pris par AirPlay sur macOS). |
| Erreur « port is already allocated » sur **8080** ou **5432** | Un autre service occupe ces ports. Arrêtez-le, ou changez le port hôte dans `docker-compose.yml`. |
| Jupyter demande un mot de passe | Utilisez le token `goscistation`. |
| Rien ne s'affiche | Vérifiez que **Docker Desktop est bien démarré**, puis relancez `docker compose up --build`. |

---

*« CASSANDRA ment. Les données ont été truquées. Suivez la trace. La preuve est dans les chiffres. » — E. Reye*
