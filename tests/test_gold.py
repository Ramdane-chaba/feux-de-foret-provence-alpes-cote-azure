"""Gold : grain des marts, jours sans feu, seuils, agrégation météo."""

import warnings

import pytest

from conftest import scalaire


def feux_charges(con) -> bool:
    return scalaire(con, "SELECT count(*) FROM silver.fait_feu") > 0


# --- mart_jour_departement ------------------------------------------------------------------------

def test_jour_departement_tous_les_jours(con):
    # 96 départements de métropole × 7 670 jours, y compris les jours sans feu et hors saison.
    assert scalaire(con, "SELECT count(*) FROM gold.mart_jour_departement") == 96 * 7_670
    assert scalaire(
        con, "SELECT count(*) - count(DISTINCT (code_dep, jour)) FROM gold.mart_jour_departement"
    ) == 0


def test_niveau_null_hors_saison(con):
    # Un niveau seulement les jours avec bulletin : jamais « faible » par défaut.
    assert scalaire(con, "SELECT count(niveau) FROM gold.mart_jour_departement") == 35_616
    assert scalaire(
        con, "SELECT count(*) FROM gold.mart_jour_departement WHERE mois IN (1, 2, 3, 11, 12) AND niveau IS NOT NULL"
    ) == 0


def test_feux_null_quand_non_charges(con):
    # Pas de feux chargés pour un département et une année : NULL, jamais 0.
    assert scalaire(
        con, "SELECT count(*) FROM gold.mart_jour_departement WHERE NOT feux_connus AND nb_feux IS NOT NULL"
    ) == 0
    assert scalaire(
        con, "SELECT count(*) FROM gold.mart_jour_departement WHERE feux_connus AND nb_feux IS NULL"
    ) == 0


def test_feux_hors_marseille_inferieurs(con):
    assert scalaire(
        con, "SELECT count(*) FROM gold.mart_jour_departement WHERE nb_feux_hors_marseille > nb_feux"
    ) == 0


def test_meteo_exemple_de_la_fiche(con):
    # 2025-07-15 dans le 13 : 20 stations, TX max 37,9 °C, rafale >= 16,7 m/s (Bec de l'Aigle).
    ligne = con.execute(
        "SELECT nb_stations, tx_max_c, fxi3s_max_ms FROM gold.mart_jour_departement "
        "WHERE code_dep = '13' AND jour = '2025-07-15'"
    ).fetchone()
    assert ligne[0] == 20
    assert ligne[1] == pytest.approx(37.9)
    assert ligne[2] >= 16.7
    # Aucune pluie le 2025-07-15 (fiche) : la pluie de la veille du 2025-07-16 vaut 0.
    assert scalaire(
        con, "SELECT rr_veille_mm FROM gold.mart_jour_departement WHERE code_dep = '13' AND jour = '2025-07-16'"
    ) == pytest.approx(0.0)


def test_pluie_veille_est_la_moyenne_de_j_moins_1(con):
    ecarts = scalaire(
        con,
        """
        WITH attendu AS (
            SELECT s.code_dep, m.jour + 1 AS jour, avg(m.rr_mm) AS rr
            FROM silver.fait_meteo_jour m JOIN silver.dim_station s USING (num_poste)
            WHERE m.rr_mm IS NOT NULL OR m.tx_c IS NOT NULL OR m.fxi3s_ms IS NOT NULL OR m.un_pct IS NOT NULL
            GROUP BY ALL
        )
        SELECT count(*) FROM gold.mart_jour_departement g JOIN attendu a USING (code_dep, jour)
        WHERE g.rr_veille_mm IS DISTINCT FROM a.rr
        """,
    )
    assert ecarts == 0


def test_warn_chute_du_nombre_de_stations(con):
    """WARN : nb_stations chute de plus de 30 % d'un jour à l'autre (sur la période couverte par la climatologie)."""
    chutes = con.execute(
        """
        WITH t AS (
            SELECT code_dep, jour, nb_stations,
                   lag(nb_stations) OVER (PARTITION BY code_dep ORDER BY jour) AS veille
            FROM gold.mart_jour_departement
            WHERE jour <= (SELECT max(jour) FROM silver.fait_meteo_jour)
        )
        SELECT code_dep, jour, veille, nb_stations FROM t
        WHERE veille > 0 AND nb_stations < 0.7 * veille
        ORDER BY jour
        """
    ).fetchall()
    if chutes:
        warnings.warn(f"{len(chutes)} chute(s) de plus de 30 % du nombre de stations : {chutes[:5]}")


# --- mart_seuil -----------------------------------------------------------------------------------

def test_seuil_saisons_2024_2025_seulement(con):
    annees = [r[0] for r in con.execute("SELECT DISTINCT annee FROM gold.mart_seuil ORDER BY 1").fetchall()]
    assert annees == [2024, 2025]


def test_seuil_jours_declenches_du_13(con):
    # D'après les niveaux de la fiche : seuil 2 = niveaux 2 à 4, seuil 3 = niveaux 3 et 4.
    lignes = con.execute(
        "SELECT annee, seuil, jours_bulletin, jours_declenches FROM gold.mart_seuil "
        "WHERE code_dep = '13' AND perimetre = 'departement' ORDER BY annee, seuil"
    ).fetchall()
    assert lignes == [
        (2024, 2, 120, 87), (2024, 3, 120, 19), (2024, 4, 120, 0),
        (2025, 2, 120, 94), (2025, 3, 120, 59), (2025, 4, 120, 10),
    ]


def test_seuil_decroissant(con):
    assert scalaire(
        con,
        """
        SELECT count(*) FROM gold.mart_seuil a JOIN gold.mart_seuil b
          ON a.code_dep = b.code_dep AND a.annee = b.annee AND a.perimetre = b.perimetre AND b.seuil = a.seuil + 1
        WHERE b.jours_declenches > a.jours_declenches
        """,
    ) == 0


def test_seuil_comptes_coherents(con):
    if not feux_charges(con):
        assert scalaire(con, "SELECT count(fausses_alertes) + count(feux_manques) FROM gold.mart_seuil") == 0
        pytest.skip("BDIFF absente : colonnes de feux NULL (vérifié)")
    assert scalaire(
        con,
        "SELECT count(*) FROM gold.mart_seuil WHERE feux_connus "
        "AND jours_declenches_avec_feu + fausses_alertes <> jours_declenches",
    ) == 0


# --- Q1 et Q2 -------------------------------------------------------------------------------------

def test_mart_commune_annee_schema(con):
    colonnes = {c[0] for c in con.execute("DESCRIBE gold.mart_commune_annee").fetchall()}
    assert {"code_insee", "annee", "nb_feux", "surface_ha", "rang_dans_departement", "est_marseille"} <= colonnes


def test_vue_q2_schema(con):
    colonnes = {c[0] for c in con.execute("DESCRIBE gold.v_q2_quand").fetchall()}
    assert {"mois", "jour_semaine", "heure", "nb_feux", "nb_feux_hors_marseille"} <= colonnes
