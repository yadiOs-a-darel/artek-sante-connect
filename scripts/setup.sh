#!/bin/bash
set -euo pipefail

echo "🏥 Installation ARTEK Connect Santé — Environnement de développement"

PYTHON=""
for candidate in python3.12 python3.11 python3; do
    if command -v "$candidate" >/dev/null; then
        version=$("$candidate" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        major=$(echo "$version" | cut -d. -f1)
        minor=$(echo "$version" | cut -d. -f2)
        if [ "$major" -eq 3 ] && [ "$minor" -ge 11 ] && [ "$minor" -le 12 ]; then
            PYTHON="$candidate"
            break
        fi
    fi
done
[ -n "$PYTHON" ] || { echo "❌ Python 3.11 ou 3.12 requis (python3.14 non supporté)"; echo "   Installez : sudo apt install python3.12 python3.12-venv"; exit 1; }
echo "🐍 Python détecté : $PYTHON ($($PYTHON --version))"
command -v node >/dev/null || { echo "❌ Node.js 20 requis"; exit 1; }
command -v docker >/dev/null || { echo "❌ Docker requis"; exit 1; }

echo "✅ Prérequis OK"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Fichier .env créé"
fi

echo "🐍 Installation backend Python..."
cd apps/backend
$PYTHON -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ../..

echo "📦 Installation packages JS/TS..."
if command -v pnpm >/dev/null; then
    pnpm install
else
    npx pnpm@8.15.0 install
fi

echo "🐳 Démarrage services Docker..."
docker compose up -d db redis mongo influxdb mosquitto || docker-compose up -d db redis mongo influxdb mosquitto
sleep 5

echo "✅ Installation complète !"
echo ""
echo "Commandes disponibles:"
echo "  make dev       — Démarrer tous les services"
echo "  make test      — Lancer les tests"
echo ""
echo "Frontend : http://localhost:3000 (Vite + TanStack Router)"
echo "API      : http://localhost:8000/api/docs"
