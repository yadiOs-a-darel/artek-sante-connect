#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/backend"

pick_python() {
  for candidate in \
    "${CONDA_PREFIX:+$CONDA_PREFIX/bin/python}" \
    "$HOME/anaconda3/bin/python" \
    "$HOME/miniconda3/bin/python" \
    ".venv/bin/python" \
    "python3" \
    "python"
  do
    [ -n "$candidate" ] && [ -x "$candidate" ] 2>/dev/null || continue
    if "$candidate" -c "import sqlalchemy" 2>/dev/null; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

PYTHON=$(pick_python) || {
  echo "❌ Aucun Python avec SQLAlchemy trouvé."
  echo ""
  echo "Activez votre env conda puis installez les dépendances :"
  echo "  conda activate base   # ou votre environnement"
  echo "  pip install -r requirements.txt"
  echo "  python -m scripts.seed"
  exit 1
}

echo "🐍 Utilisation de : $PYTHON"
exec "$PYTHON" -m scripts.seed
