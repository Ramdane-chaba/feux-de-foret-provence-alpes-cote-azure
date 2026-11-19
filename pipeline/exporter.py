"""Exporte les tables gold en fichiers Parquet, lus par le rapport Power BI.

Un fichier par table, dans data/exports/ : <table>.parquet. Chaque fichier est écrit sous un nom
provisoire (.part) puis renommé : Power BI ne lit jamais un fichier à moitié écrit.
Les colonnes HUGEINT (sommes d'entiers dans DuckDB) sont converties en BIGINT : Power BI ne connaît pas
les entiers sur 128 bits, et DuckDB les écrirait sinon en DOUBLE.
"""

from pathlib import Path

import duckdb

from pipeline.chemins import EXPORTS

# Tables et vues de gold lues par Power BI. gold.couverture_bdiff est une table de travail : elle n'est pas exportée.
# fait_feu_enrichi (un feu par ligne) sert les indicateurs I1 et I2, que les marts agrégés ne permettent pas de calculer.
TABLES_EXPORTEES = (
    "fait_feu_enrichi",
    "ref_communes_prioritaires",
    "mart_jour_departement",
    "mart_seuil",
    "mart_commune_annee",
    "v_q2_quand",
)


def colonnes(con: duckdb.DuckDBPyConnection, schema: str, table: str) -> list[tuple[str, str]]:
    """(nom, type) des colonnes d'une table ou d'une vue, dans l'ordre."""
    return con.execute(
        "SELECT column_name, data_type FROM duckdb_columns() "
        "WHERE schema_name = ? AND table_name = ? ORDER BY column_index",
        [schema, table],
    ).fetchall()


def requete_export(con: duckdb.DuckDBPyConnection, table: str) -> str:
    selection = ", ".join(
        f'CAST("{nom}" AS BIGINT) AS "{nom}"' if type_ == "HUGEINT" else f'"{nom}"'
        for nom, type_ in colonnes(con, "gold", table)
    )
    # Tri sur toutes les colonnes : deux exécutions sur les mêmes données donnent le même fichier.
    return f"SELECT {selection} FROM gold.{table} ORDER BY ALL"


def exporter_parquet(con: duckdb.DuckDBPyConnection, dossier: Path = EXPORTS) -> list[Path]:
    """Écrit un fichier Parquet par table de TABLES_EXPORTEES et renvoie leurs chemins."""
    dossier.mkdir(parents=True, exist_ok=True)
    fichiers = []
    for table in TABLES_EXPORTEES:
        cible = dossier / f"{table}.parquet"
        partiel = dossier / f"{table}.parquet.part"
        chemin_sql = str(partiel).replace("'", "''")
        con.execute(f"COPY ({requete_export(con, table)}) TO '{chemin_sql}' (FORMAT parquet, COMPRESSION zstd)")
        partiel.replace(cible)
        print(f"  {cible.name}")
        fichiers.append(cible)
    return fichiers
