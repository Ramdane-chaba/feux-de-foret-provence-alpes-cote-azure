"""Bronze : volumes des fiches, fichiers non modifiés, journal de chargement."""

import pytest

from conftest import scalaire


def test_mdf_volume_total(con):
    assert scalaire(con, "SELECT count(*) FROM bronze.meteo_des_forets") == 35_616


def test_mdf_volume_bouches_du_rhone(con):
    assert scalaire(con, "SELECT count(*) FROM bronze.meteo_des_forets WHERE num_dep = '13'") == 371


def test_mdf_non_modifie(con):
    # Écarts entre années relevés dans la fiche : conservés tels quels en bronze.
    par_fichier = dict(
        con.execute(
            "SELECT _fichier_source, count(nom_dep) || '/' || count(dep_nom) FROM bronze.meteo_des_forets GROUP BY ALL"
        ).fetchall()
    )
    assert par_fichier == {"mdf_2024.csv.gz": "11520/0", "mdf_2025.csv.gz": "0/11520", "mdf_2026.csv.gz": "12576/0"}
    assert scalaire(con, "SELECT count(*) FROM bronze.meteo_des_forets WHERE num_dep = '1'") == 240
    assert scalaire(con, "SELECT count(*) FROM bronze.meteo_des_forets WHERE num_dep = '01'") == 131


def test_climato_13_volume_1950_2024(con):
    n = scalaire(
        con,
        "SELECT count(*) FROM bronze.climato_rr_t_vent WHERE _fichier_source = 'Q_13_previous-1950-2024_RR-T-Vent.csv.gz'",
    )
    assert n == 1_197_064


def test_interventions_volume_2024(con):
    assert scalaire(con, "SELECT count(*) FROM bronze.interventions WHERE \"Année\" = '2024'") == 99


def test_interventions_accents_lus(con):
    # Encodage Latin-1 : la colonne garde son accent (pas de « vÃ©gÃ©tations »).
    colonnes = [c[0] for c in con.execute("DESCRIBE bronze.interventions").fetchall()]
    assert "Feux de végétations" in colonnes


@pytest.mark.parametrize(
    "table",
    ["meteo_des_forets", "climato_rr_t_vent", "climato_autres_parametres", "interventions"],
)
def test_bronze_tout_en_texte_avec_colonnes_techniques(con, table):
    types = dict(con.execute(f"SELECT column_name, column_type FROM (DESCRIBE bronze.{table})").fetchall())
    assert types.pop("_date_chargement") == "TIMESTAMP"
    assert types.pop("_fichier_source") == "VARCHAR"
    assert set(types.values()) == {"VARCHAR"}


def test_journal_une_ligne_par_fichier(con, run_id):
    lignes = con.execute(
        "SELECT fichier, empreinte_sha256, taille_octets, nb_lignes, statut "
        "FROM bronze.journal_chargement WHERE run_id = ?",
        [run_id],
    ).fetchall()
    charges = [l for l in lignes if l[4] == "charge"]
    # 3 Météo des forêts + 4 climatologie + 17 interventions, plus les exports BDIFF quand il y en a.
    bdiff = [l for l in charges if not l[0].startswith(("mdf_", "Q_", "interventions_"))]
    assert len(charges) == 3 + 4 + 17 + len(bdiff)
    assert all(len(l[1]) == 64 and l[2] > 0 and l[3] > 0 for l in charges)
    # Le journal compte les mêmes lignes que les tables.
    assert sum(l[3] for l in charges if l[0].startswith("mdf_")) == 35_616


def test_bdiff_absente_journalisee(con, run_id):
    if scalaire(con, "SELECT count(*) FROM duckdb_tables() WHERE schema_name = 'bronze' AND table_name = 'bdiff'"):
        pytest.skip("export BDIFF présent")
    statuts = con.execute(
        "SELECT statut FROM bronze.journal_chargement WHERE run_id = ? AND fichier = 'bdiff'", [run_id]
    ).fetchall()
    assert statuts == [("absent",)]
