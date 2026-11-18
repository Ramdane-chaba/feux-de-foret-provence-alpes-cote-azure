"""Reconstruit la base data/sdis13.duckdb : une seule commande, relançable.

    uv run python -m pipeline.construire
"""

import sys
import uuid
from datetime import datetime
from pathlib import Path

import duckdb

from pipeline import telecharger
from pipeline.bronze import charger_bronze
from pipeline.chemins import BASE


def construire(base: Path = BASE, telecharger_sources: bool = True) -> str:
    """Construit la base et renvoie l'identifiant de l'exécution."""
    if telecharger_sources:
        try:
            telecharger.main()
        except OSError as erreur:
            print(f"Téléchargement impossible ({erreur}) : on continue avec les fichiers présents.")
    run_id = uuid.uuid4().hex[:12]
    date_chargement = datetime.now().replace(microsecond=0)
    base.parent.mkdir(parents=True, exist_ok=True)
    with duckdb.connect(str(base)) as con:
        print(f"Exécution {run_id}")
        charger_bronze(con, run_id, date_chargement)
    return run_id


if __name__ == "__main__":
    construire(telecharger_sources="--hors-ligne" not in sys.argv)
