"""Reconstruit la base data/sdis13.duckdb : une seule commande, relançable.

    uv run python -m pipeline.construire              (télécharge ce qui manque, puis construit)
    uv run python -m pipeline.construire --hors-ligne (construit avec les fichiers présents)
"""

import sys
import uuid
from datetime import datetime
from pathlib import Path

import duckdb

from pipeline import telecharger
from pipeline.bronze import charger_bronze
from pipeline.chemins import BASE, SQL


def table_existe(con: duckdb.DuckDBPyConnection, schema: str, table: str) -> bool:
    requete = "SELECT count(*) FROM duckdb_tables() WHERE schema_name = ? AND table_name = ?"
    return con.execute(requete, [schema, table]).fetchone()[0] > 0


def executer_couche(con: duckdb.DuckDBPyConnection, couche: str) -> None:
    """Exécute les fichiers sql/<couche>/*.sql dans l'ordre de leur nom.

    Quand la table bronze d'une source manque (BDIFF non déposée), le fichier du même nom
    dans sql/<couche>/si_absent/ est exécuté à la place : il crée les tables vides.
    """
    for fichier in sorted((SQL / couche).glob("*.sql")):
        remplacant = SQL / couche / "si_absent" / fichier.name
        if remplacant.exists() and not table_existe(con, "bronze", fichier.stem.split("_", 1)[1]):
            print(f"  {couche}/{fichier.name} : source absente, tables vides ({remplacant.relative_to(SQL)})")
            fichier = remplacant
        else:
            print(f"  {couche}/{fichier.name}")
        con.execute(fichier.read_text(encoding="utf-8"))


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
        print("Silver")
        executer_couche(con, "silver")
    return run_id


if __name__ == "__main__":
    construire(telecharger_sources="--hors-ligne" not in sys.argv)
