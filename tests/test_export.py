"""Export Parquet : un fichier par table gold, même contenu, mêmes colonnes, mêmes types que dans DuckDB."""

import duckdb
import pytest

from conftest import scalaire
from pipeline.exporter import TABLES_EXPORTEES, colonnes, exporter_parquet


def parquet(dossier, table: str) -> str:
    return f"read_parquet('{dossier / f'{table}.parquet'}')"


def ecarts(con, table: str, fichier: str) -> int:
    """Lignes présentes d'un côté et pas de l'autre (doublons compris, NULL comparés comme égaux)."""
    return scalaire(
        con,
        f"SELECT (SELECT count(*) FROM (FROM gold.{table} EXCEPT ALL FROM {fichier})) "
        f"     + (SELECT count(*) FROM (FROM {fichier} EXCEPT ALL FROM gold.{table}))",
    )


# --- Sur une base synthétique (toujours exécutés, même sans data/raw/) -----------------------------

@pytest.fixture
def base_synthetique():
    con = duckdb.connect(":memory:")
    con.execute("CREATE SCHEMA gold")
    con.execute(
        "CREATE TABLE gold.mart_jour_departement AS "
        "SELECT * FROM (VALUES ('13', DATE '2025-07-15', 3, 2::BIGINT, true), "
        "                      ('13', DATE '2025-12-01', NULL, NULL, false)) "
        "AS t(code_dep, jour, niveau, nb_feux, feux_connus)"
    )
    # sum() d'un BIGINT donne un HUGEINT dans DuckDB.
    con.execute("CREATE TABLE gold.mart_seuil AS SELECT '13' AS code_dep, 3 AS seuil, sum(78::BIGINT) AS jours_declenches")
    con.execute("CREATE TABLE gold.mart_commune_annee AS SELECT '13055' AS code_insee, 'L''Isle' AS nom_commune, 1.5 AS surface_ha")
    con.execute("CREATE VIEW gold.v_q2_quand AS SELECT '13' AS code_dep, 14 AS heure, 7::BIGINT AS nb_feux")
    yield con
    con.close()


def test_un_fichier_par_table(base_synthetique, tmp_path):
    fichiers = exporter_parquet(base_synthetique, tmp_path / "exports")
    assert sorted(f.name for f in fichiers) == sorted(f"{t}.parquet" for t in TABLES_EXPORTEES)
    assert sorted(p.name for p in (tmp_path / "exports").iterdir()) == sorted(f.name for f in fichiers)


def test_contenu_identique_nulls_et_apostrophes(base_synthetique, tmp_path):
    exporter_parquet(base_synthetique, tmp_path)
    for table in TABLES_EXPORTEES:
        assert ecarts(base_synthetique, table, parquet(tmp_path, table)) == 0, table
    # Le NULL reste NULL (jamais 0) et le texte avec apostrophe est intact.
    assert scalaire(base_synthetique, f"SELECT count(*) FROM {parquet(tmp_path, 'mart_jour_departement')} WHERE nb_feux IS NULL") == 1
    assert scalaire(base_synthetique, f"SELECT nom_commune FROM {parquet(tmp_path, 'mart_commune_annee')}") == "L'Isle"


def test_hugeint_converti_en_bigint(base_synthetique, tmp_path):
    assert dict(colonnes(base_synthetique, "gold", "mart_seuil"))["jours_declenches"] == "HUGEINT"
    exporter_parquet(base_synthetique, tmp_path)
    types = {l[0]: l[1] for l in base_synthetique.execute(f"DESCRIBE SELECT * FROM {parquet(tmp_path, 'mart_seuil')}").fetchall()}
    assert types["jours_declenches"] == "BIGINT"
    assert scalaire(base_synthetique, f"SELECT jours_declenches FROM {parquet(tmp_path, 'mart_seuil')}") == 78


def test_relance_remplace_les_fichiers(base_synthetique, tmp_path):
    exporter_parquet(base_synthetique, tmp_path)
    base_synthetique.execute("INSERT INTO gold.mart_jour_departement VALUES ('13', DATE '2025-07-16', 4, 5, true)")
    exporter_parquet(base_synthetique, tmp_path)
    assert scalaire(base_synthetique, f"SELECT count(*) FROM {parquet(tmp_path, 'mart_jour_departement')}") == 3
    assert not list(tmp_path.glob("*.part"))


def test_chemin_avec_apostrophe(base_synthetique, tmp_path):
    dossier = tmp_path / "rapport d'été"
    exporter_parquet(base_synthetique, dossier)
    assert (dossier / "mart_seuil.parquet").exists()


# --- Sur la base construite à partir de data/raw/ (conftest) ----------------------------------------

def test_fichiers_generes_par_le_pipeline(exports):
    for table in TABLES_EXPORTEES:
        fichier = exports / f"{table}.parquet"
        assert fichier.exists() and fichier.stat().st_size > 0, table
    assert not list(exports.glob("*.part"))


@pytest.mark.parametrize("table", TABLES_EXPORTEES)
def test_memes_colonnes_et_types(con, exports, table):
    attendu = [(nom, "BIGINT" if type_ == "HUGEINT" else type_) for nom, type_ in colonnes(con, "gold", table)]
    lu = [ligne[:2] for ligne in con.execute(f"DESCRIBE SELECT * FROM {parquet(exports, table)}").fetchall()]
    assert lu == attendu


@pytest.mark.parametrize("table", TABLES_EXPORTEES)
def test_meme_nombre_de_lignes_et_meme_contenu(con, exports, table):
    fichier = parquet(exports, table)
    assert scalaire(con, f"SELECT count(*) FROM {fichier}") == scalaire(con, f"SELECT count(*) FROM gold.{table}")
    assert ecarts(con, table, fichier) == 0


def test_valeurs_des_fiches_dans_les_fichiers(con, exports):
    """Les chiffres des fiches d'indicateurs se retrouvent tels quels dans les fichiers lus par Power BI."""
    jours = parquet(exports, "mart_jour_departement")
    seuil = parquet(exports, "mart_seuil")
    assert scalaire(con, f"SELECT count(*) FROM {jours}") == 96 * 7_670
    # 240 bulletins pour le 13 sur 2024-2025, dont 78 au niveau 3 ou plus.
    assert scalaire(
        con, f"SELECT sum(jours_bulletin) FROM {seuil} WHERE code_dep = '13' AND seuil = 3 AND perimetre = 'departement'"
    ) == 240
    assert scalaire(
        con, f"SELECT sum(jours_declenches) FROM {seuil} WHERE code_dep = '13' AND seuil = 3 AND perimetre = 'departement'"
    ) == 78
    if not scalaire(con, "SELECT count(*) FROM silver.fait_feu"):
        pytest.skip("export BDIFF absent : pas de feux à comparer")
    # 489 feux dans le 13 en 2024-2025, dont 355 dans la période de publication et 177 un jour de niveau >= 3.
    assert scalaire(con, f"SELECT sum(nb_feux) FROM {jours} WHERE code_dep = '13' AND annee IN (2024, 2025)") == 489
    assert scalaire(
        con, f"SELECT sum(nb_feux) FROM {jours} WHERE code_dep = '13' AND annee IN (2024, 2025) AND niveau IS NOT NULL"
    ) == 355
    assert scalaire(
        con, f"SELECT sum(nb_feux) FROM {jours} WHERE code_dep = '13' AND annee IN (2024, 2025) AND niveau >= 3"
    ) == 177
