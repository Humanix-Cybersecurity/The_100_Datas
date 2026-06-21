#!/bin/bash
# Double-clique ce fichier (macOS) pour lancer la présentation.
# Il sert TOUJOURS le bon dossier (celui où il se trouve) sur le port 8800.
cd "$(dirname "$0")" || exit 1
PORT=8800
echo "◢◤ PROTOCOLE CASSANDRA — présentation"
echo "Serveur sur http://localhost:$PORT"
echo "Ouvre cette adresse dans ton navigateur, puis Cmd+Shift+R pour rafraîchir sans cache."
echo "(Ctrl+C pour arrêter.)"
# tente d'ouvrir le navigateur automatiquement (macOS)
( sleep 1; command -v open >/dev/null && open "http://localhost:$PORT" ) &
exec python3 -m http.server "$PORT"
