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
from pipeline.chemins import BASE, RACINE, SQL
from pipeline.qualite import EchecBloquant, barriere, ecrire_rapport

RAPPORT = RACINE / "docs" / "qualite" / "rapport-qualite.md"


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


def construire(base: Path = BASE, telecharger_sources: bool = True, rapport: Path | None = RAPPORT) -> str:
    """Construit la base, écrit le rapport de qualité et renvoie l'identifiant de l'exécution.

    Lève EchecBloquant si une règle de qualité « block » échoue (le rapport est écrit quand même).
    """
    if telecharger_sources:
        try:
            telecharger.main()
        except OSError as erreur:
            print(f"Téléchargement impossible ({erreur}) : on continue avec les fichiers présents.")
    run_id = uuid.uuid4().hex[:12]
    date_chargement = datetime.now().replace(microsecond=0)
    base.parent.mkdir(parents=True, exist_ok=True)
    resultats = []
    with duckdb.connect(str(base)) as con:
        print(f"Exécution {run_id}")
        arret = None
        try:
            charger_bronze(con, run_id, date_chargement)
            print("Qualité : extraction")
            barriere(con, "extraction", resultats)
            print("Silver")
            executer_couche(con, "silver")
            print("Gold")
            executer_couche(con, "gold")
            print("Qualité : modèle")
            barriere(con, "modele", resultats)
        except EchecBloquant as echec:
            arret = str(echec)
            raise
        finally:
            if rapport is not None:
                ecrire_rapport(con, resultats, rapport, run_id, arret)
                print(f"Rapport de qualité : {rapport}")
    return run_id


if __name__ == "__main__":
    try:
        construire(telecharger_sources="--hors-ligne" not in sys.argv)
    except EchecBloquant as echec:
        print(f"ARRÊT : règle de qualité bloquante en échec : {echec}")
        sys.exit(1)
