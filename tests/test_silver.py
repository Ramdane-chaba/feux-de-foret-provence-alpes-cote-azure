"""Silver : règles de nettoyage, chiffres des fiches, aucune ligne perdue en silence."""

import pytest

from conftest import scalaire
from pipeline.chemins import DATA_RAW


# --- Aucune perte silencieuse : bronze = silver + rejets ----------------------------------------

def test_mdf_aucune_ligne_perdue(con):
    bronze = scalaire(con, "SELECT count(*) FROM bronze.meteo_des_forets")
    silver = scalaire(con, "SELECT count(*) FROM silver.fait_niveau_danger")
    rejets = scalaire(con, "SELECT count(*) FROM silver.rejet_meteo_des_forets")
    assert bronze == silver + rejets == 35_616


def test_interventions_aucune_ligne_perdue(con):
    bronze = scalaire(con, "SELECT count(*) FROM bronze.interventions")
    silver = scalaire(con, "SELECT count(*) FROM silver.fait_interventions_an")
    rejets = scalaire(con, "SELECT count(*) FROM silver.rejet_interventions")
    assert bronze == silver + rejets


def test_climato_aucune_ligne_perdue(con):
    bronze = scalaire(con, "SELECT count(*) FROM bronze.climato_rr_t_vent WHERE AAAAMMJJ >= '20060101'")
    silver = scalaire(con, "SELECT count(*) FROM silver.fait_meteo_jour")
    rejets = scalaire(con, "SELECT count(*) FROM silver.rejet_climatologie")
    assert bronze == silver + rejets


def test_rejets_ont_un_motif(con):
    for table in ("rejet_meteo_des_forets", "rejet_interventions", "rejet_climatologie", "rejet_bdiff"):
        assert scalaire(con, f"SELECT count(*) FROM silver.{table} WHERE motif IS NULL") == 0


# --- Météo des forêts -----------------------------------------------------------------------------

def test_mdf_codes_departement_sur_2_caracteres(con):
    assert scalaire(con, "SELECT count(*) FROM silver.fait_niveau_danger WHERE length(code_dep) <> 2") == 0
    assert scalaire(con, "SELECT count(DISTINCT code_dep) FROM silver.fait_niveau_danger") == 96


def test_mdf_jour_danger_est_le_lendemain_de_la_diffusion(con):
    ecarts = scalaire(
        con, "SELECT count(*) FROM silver.fait_niveau_danger WHERE jour_danger <> CAST(diffusion_utc AS DATE) + 1"
    )
    assert ecarts == 0
    # Premier bulletin 2025 diffusé le 2025-06-03 (fiche) : danger du 2025-06-04.
    assert scalaire(
        con, "SELECT min(jour_danger) FROM silver.fait_niveau_danger WHERE year(diffusion_utc) = 2025"
    ).isoformat() == "2025-06-04"


def test_mdf_nom_harmonise(con):
    assert scalaire(con, "SELECT count(*) FROM silver.fait_niveau_danger WHERE nom_departement IS NULL") == 0


def test_mdf_niveaux_du_13_comme_la_fiche(con):
    lignes = con.execute(
        "SELECT year(jour_danger), niveau, count(*) FROM silver.fait_niveau_danger "
        "WHERE code_dep = '13' GROUP BY ALL ORDER BY ALL"
    ).fetchall()
    obtenu = {(a, n): c for a, n, c in lignes}
    attendu = {
        (2024, 1): 33, (2024, 2): 68, (2024, 3): 19,
        (2025, 1): 26, (2025, 2): 35, (2025, 3): 49, (2025, 4): 10,
        (2026, 1): 11, (2026, 2): 57, (2026, 3): 47, (2026, 4): 16,
    }
    assert obtenu == attendu


# --- Interventions --------------------------------------------------------------------------------

def test_interventions_mapping_conforme_aux_fichiers(con):
    """Le mapping année par année correspond aux en-têtes réels des fichiers."""
    mapping = con.execute(
        "SELECT annee, nb_colonnes, colonne_feux_vegetation IS NOT NULL FROM silver.interventions_mapping"
    ).fetchall()
    assert len(mapping) == 17
    for annee, nb_colonnes, a_feux_vegetation in mapping:
        fichier = DATA_RAW / "interventions" / f"interventions_{annee}.csv"
        entete = fichier.read_text(encoding="latin-1").splitlines()[0].split(";")
        assert len(entete) == nb_colonnes, annee
        assert ("Feux de végétations" in entete) == a_feux_vegetation, annee
    assert dict((a, n) for a, n, _ in mapping)[2024] == 71


def test_interventions_chiffres_de_la_fiche(con):
    lignes = con.execute(
        "SELECT annee, code_service, feux_vegetation FROM silver.fait_interventions_an "
        "WHERE code_service IN ('13', 'BMPM') AND annee IN (2008, 2009, 2014, 2019, 2022, 2024)"
    ).fetchall()
    obtenu = {(a, s): v for a, s, v in lignes}
    attendu = {
        (2008, "13"): 3142, (2009, "13"): 3258, (2014, "13"): 2117,
        (2019, "13"): 2525, (2022, "13"): 2516, (2024, "13"): 1403,
        (2009, "BMPM"): 1960, (2019, "BMPM"): 858, (2022, "BMPM"): 699, (2024, "BMPM"): 431,
    }
    assert {k: obtenu[k] for k in attendu} == attendu


def test_interventions_feux_vegetation_null_quand_colonne_absente(con):
    lignes = con.execute(
        "SELECT annee, count(*), count(feux_vegetation), count(*) FILTER (WHERE feux_vegetation = 0) "
        "FROM silver.fait_interventions_an WHERE annee BETWEEN 2010 AND 2013 GROUP BY annee"
    ).fetchall()
    assert len(lignes) == 4
    assert all(renseignes == 0 and zeros == 0 for _, _, renseignes, zeros in lignes)


def test_interventions_nc_garde_la_ligne_a_null(con):
    # Martinique 2018 : « N.C. » (non communiqué) -> ligne gardée, valeur NULL, drapeau levé.
    ligne = con.execute(
        "SELECT feux_vegetation, feux_vegetation_nc FROM silver.fait_interventions_an "
        "WHERE annee = 2018 AND code_service = '972'"
    ).fetchall()
    assert ligne == [(None, True)]
    assert scalaire(con, "SELECT count(*) FROM silver.rejet_interventions") == 0
    nc_bronze = scalaire(con, "SELECT count(*) FROM bronze.interventions WHERE trim(\"Feux de végétations\") = 'N.C.'")
    assert scalaire(con, "SELECT count(*) FROM silver.fait_interventions_an WHERE feux_vegetation_nc") == nc_bronze


def test_interventions_cle_unique(con):
    assert scalaire(
        con,
        "SELECT count(*) FROM (SELECT annee, code_service FROM silver.fait_interventions_an GROUP BY ALL HAVING count(*) > 1)",
    ) == 0


def test_bmpm_et_bspp_sont_des_services(con):
    services = dict(
        con.execute("SELECT code_service, code_dep FROM silver.dim_service WHERE type <> 'SDIS'").fetchall()
    )
    assert services == {"BMPM": "13", "BSPP": None}
    assert scalaire(con, "SELECT count(*) FROM silver.dim_departement WHERE code_dep IN ('BMPM', 'BSPP')") == 0
    # 4 -> 04 et 2a -> 2A
    assert scalaire(con, "SELECT count(*) FROM silver.dim_service WHERE code_service IN ('04', '2A', '2B')") == 3


# --- Climatologie ---------------------------------------------------------------------------------

def test_climato_cle_unique(con):
    assert scalaire(
        con,
        "SELECT count(*) - count(DISTINCT (num_poste, jour)) FROM silver.fait_meteo_jour",
    ) == 0


def test_climato_exemple_de_la_fiche(con):
    # 2025-07-15 : 20 stations dans le 13, FXI3S = 16,7 m/s au Bec de l'Aigle, TX entre 31,8 et 37,9 °C.
    assert scalaire(con, "SELECT count(*) FROM silver.fait_meteo_jour WHERE jour = '2025-07-15'") == 20
    assert scalaire(
        con,
        "SELECT fxi3s_ms FROM silver.fait_meteo_jour JOIN silver.dim_station USING (num_poste) "
        "WHERE jour = '2025-07-15' AND nom = 'BEC DE L AIGLE'",
    ) == pytest.approx(16.7)
    tx = con.execute("SELECT min(tx_c), max(tx_c) FROM silver.fait_meteo_jour WHERE jour = '2025-07-15'").fetchone()
    assert tx == pytest.approx((31.8, 37.9))


def test_climato_code_qualite_2_mis_a_null(con):
    douteuses = scalaire(
        con, "SELECT count(*) FROM bronze.climato_rr_t_vent WHERE AAAAMMJJ >= '20060101' AND QRR = '2' AND RR IS NOT NULL"
    )
    nulles = scalaire(
        con,
        "SELECT count(*) FROM silver.fait_meteo_jour f JOIN bronze.climato_rr_t_vent b "
        "ON b.NUM_POSTE = f.num_poste AND b.AAAAMMJJ = strftime(f.jour, '%Y%m%d') "
        "WHERE b.QRR = '2' AND f.rr_mm IS NULL",
    )
    assert douteuses == nulles


def test_station_rattachee_au_departement_par_num_poste(con):
    assert scalaire(con, "SELECT count(*) FROM silver.dim_station WHERE code_dep <> left(num_poste, 2)") == 0


# --- Dimensions -----------------------------------------------------------------------------------

def test_dim_jour_complete(con):
    assert scalaire(con, "SELECT count(*) FROM silver.dim_jour") == 7_670
    assert scalaire(con, "SELECT max(jour) - min(jour) + 1 FROM silver.dim_jour") == 7_670


def test_dim_departement(con):
    paca = [r[0] for r in con.execute("SELECT code_dep FROM silver.dim_departement WHERE est_paca ORDER BY 1").fetchall()]
    assert paca == ["04", "05", "06", "13", "83", "84"]
    assert scalaire(con, "SELECT count(*) FROM silver.dim_departement WHERE est_metropole") == 96


def test_dim_commune_prete_pour_scd2(con):
    colonnes = {c[0] for c in con.execute("DESCRIBE silver.dim_commune").fetchall()}
    assert {"commune_sk", "code_insee", "valide_du", "valide_au", "est_courant"} <= colonnes
    # Une seule version par commune tant qu'aucun COG n'est chargé.
    assert scalaire(con, "SELECT count(*) FROM silver.dim_commune WHERE NOT est_courant OR valide_au IS NOT NULL") == 0


def test_fait_feu_schema_meme_sans_bdiff(con):
    colonnes = {c[0] for c in con.execute("DESCRIBE silver.fait_feu").fetchall()}
    assert {"annee", "numero", "code_dep", "code_insee", "jour_alerte", "surface_parcourue_ha", "est_marseille"} <= colonnes


# --- Fonctions de nettoyage (cas absents des fichiers actuels) ------------------------------------

@pytest.mark.parametrize(
    "expression, attendu",
    [
        ("silver.code_dep('1')", "01"),
        ("silver.code_dep('4')", "04"),
        ("silver.code_dep('2a')", "2A"),
        ("silver.code_dep('13')", "13"),
        ("silver.code_dep('971')", "971"),
        ("silver.entier_texte('1?403')", 1403),
        ("silver.entier_texte('3 142')", 3142),
        ("silver.entier_texte('N.C.')", None),
        ("silver.mesure('12.5', '2')", None),
        ("silver.mesure('12.5', '1')", 12.5),
        ("silver.mesure('12.5', NULL)", 12.5),
    ],
)
def test_fonctions_silver(con, expression, attendu):
    assert scalaire(con, f"SELECT {expression}") == attendu
