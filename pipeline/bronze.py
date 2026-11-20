"""Couche bronze : charge chaque source dans DuckDB telle qu'elle arrive.

Une table par source (deux pour la climatologie, qui arrive en deux groupes de paramètres),
toutes les valeurs en texte, noms de colonnes d'origine, plus deux colonnes techniques :
_fichier_source et _date_chargement. Chaque fichier est inscrit dans bronze.journal_chargement.
"""

import hashlib
import shutil
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import duckdb

from pipeline.chemins import DATA_RAW, DATA_TMP, SQL
from pipeline.config import (
    CLIMATO_GROUPES,
    CLIMATO_PERIODES,
    DEPARTEMENTS_CLIMATO,
    MDF_SEPARATEURS,
)


@dataclass
class Fichier:
    chemin: Path  # fichier lu par DuckDB
    nom: str  # nom inscrit dans _fichier_source et le journal
    origine: Path  # fichier téléchargé (empreinte et taille), différent de chemin pour un ZIP
    options: dict


def sha256(chemin: Path) -> str:
    h = hashlib.sha256()
    with chemin.open("rb") as f:
        for bloc in iter(lambda: f.read(1 << 20), b""):
            h.update(bloc)
    return h.hexdigest()


def gabarit(nom: str) -> str:
    return (SQL / "bronze" / f"{nom}.sql").read_text(encoding="utf-8")


def charger_table(
    con: duckdb.DuckDBPyConnection,
    table: str,
    sql_lecture: str,
    fichiers: list[Fichier],
    run_id: str,
    date_chargement: datetime,
) -> None:
    """Empile les fichiers par nom de colonne dans bronze.<table> et les inscrit au journal."""
    lectures = [
        sql_lecture.format(
            chemin=f.chemin.as_posix(),
            nom=f.nom,
            date_chargement=date_chargement.isoformat(sep=" "),
            **f.options,
        )
        for f in fichiers
    ]
    con.execute(f"CREATE OR REPLACE TABLE bronze.{table} AS\n" + "\nUNION ALL BY NAME\n".join(lectures))
    comptes = dict(
        con.execute(f"SELECT _fichier_source, count(*) FROM bronze.{table} GROUP BY ALL").fetchall()
    )
    for f in fichiers:
        con.execute(
            "INSERT INTO bronze.journal_chargement VALUES (?, ?, ?, ?, ?, ?, 'charge')",
            [run_id, f.nom, sha256(f.origine), f.origine.stat().st_size, comptes.get(f.nom, 0), date_chargement],
        )
        print(f"  bronze.{table} <- {f.nom} : {comptes.get(f.nom, 0)} lignes")


def exiger(chemin: Path) -> Path:
    if not chemin.exists():
        raise FileNotFoundError(f"{chemin} absent : lancer `uv run python -m pipeline.telecharger`")
    return chemin


def fichiers_mdf() -> list[Fichier]:
    dossier = DATA_RAW / "meteo-des-forets"
    return [
        Fichier(exiger(dossier / nom), nom, dossier / nom, {"separateur": sep})
        for nom, sep in MDF_SEPARATEURS.items()
    ]


def fichiers_climato(groupe: str) -> list[Fichier]:
    dossier = DATA_RAW / "climatologie"
    fichiers = []
    for dep in DEPARTEMENTS_CLIMATO:
        for periode in CLIMATO_PERIODES:
            # Noms réels : Q_13_previous-1950-2024_RR-T-Vent.csv.gz, Q_13_latest-2025-2026_RR-T-Vent.csv.gz
            trouves = sorted(dossier.glob(f"Q_{dep}_*-{periode}_{groupe}.csv.gz"))
            if len(trouves) != 1:
                raise FileNotFoundError(
                    f"climatologie {dep} {periode} {groupe} : {len(trouves)} fichier(s) dans {dossier}"
                )
            fichiers.append(Fichier(trouves[0], trouves[0].name, trouves[0], {}))
    return fichiers


def fichiers_interventions() -> list[Fichier]:
    trouves = sorted((DATA_RAW / "interventions").glob("interventions_*.csv"))
    if not trouves:
        raise FileNotFoundError("aucun fichier d'interventions : lancer `uv run python -m pipeline.telecharger`")
    return [Fichier(f, f.name, f, {}) for f in trouves]


def encodage(chemin: Path) -> str:
    try:
        chemin.read_bytes().decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        return "latin-1"


def fichiers_bdiff() -> list[Fichier]:
    """Exports BDIFF déposés à la main : ZIP (contenant un CSV) ou CSV."""
    dossier = DATA_RAW / "bdiff"
    extrait = DATA_TMP / "bdiff"
    shutil.rmtree(extrait, ignore_errors=True)
    fichiers = []
    for archive in sorted(dossier.glob("*.zip")):
        with zipfile.ZipFile(archive) as z:
            for membre in z.namelist():
                if membre.lower().endswith(".csv"):
                    cible = extrait / archive.stem / Path(membre).name
                    cible.parent.mkdir(parents=True, exist_ok=True)
                    cible.write_bytes(z.read(membre))
                    nom = f"{archive.name}/{Path(membre).name}"
                    fichiers.append(Fichier(cible, nom, archive, {"encodage": encodage(cible)}))
    for csv in sorted(dossier.glob("*.csv")):
        fichiers.append(Fichier(csv, csv.name, csv, {"encodage": encodage(csv)}))
    return fichiers


def charger_bronze(con: duckdb.DuckDBPyConnection, run_id: str, date_chargement: datetime) -> None:
    con.execute(gabarit("00_schema"))

    print("Bronze : Météo des forêts")
    charger_table(con, "meteo_des_forets", gabarit("meteo_des_forets"), fichiers_mdf(), run_id, date_chargement)

    print("Bronze : données climatologiques quotidiennes")
    for groupe in CLIMATO_GROUPES:
        table = "climato_" + groupe.lower().replace("-", "_")
        charger_table(con, table, gabarit("climatologie"), fichiers_climato(groupe), run_id, date_chargement)

    print("Bronze : interventions SDIS")
    charger_table(con, "interventions", gabarit("interventions"), fichiers_interventions(), run_id, date_chargement)

    print("Bronze : BDIFF")
    bdiff = fichiers_bdiff()
    if bdiff:
        charger_table(con, "bdiff", gabarit("bdiff"), bdiff, run_id, date_chargement)
    else:
        # Pas d'échec : la BDIFF se télécharge à la main. Les couches suivantes savent qu'elle manque.
        con.execute("DROP TABLE IF EXISTS bronze.bdiff")
        con.execute(
            "INSERT INTO bronze.journal_chargement VALUES (?, 'bdiff', NULL, NULL, NULL, ?, 'absent')",
            [run_id, date_chargement],
        )
        print(
            f"  ATTENTION : aucun export BDIFF dans {DATA_RAW / 'bdiff'}. "
            "Le pipeline continue sans les feux (tables de feux vides)."
        )
