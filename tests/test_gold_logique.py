"""Gold sur un petit jeu silver construit à la main : calcul des seuils, Marseille, jours sans feu.

Ne dépend d'aucun fichier : vérifie la logique des marts tant que l'export BDIFF n'est pas déposé.
"""

import duckdb
import pytest

from pipeline.chemins import SQL

# 13, saison 2024 réduite à 4 jours de bulletin (danger des 2024-07-01 à 2024-07-04) :
#   07-01 niveau 1, 1 feu (Aix)          -> feu manqué pour tous les seuils
#   07-02 niveau 2, aucun feu            -> fausse alerte au seuil 2
#   07-03 niveau 3, 1 feu à Marseille    -> déclenché avec feu (département), fausse alerte hors Marseille
#   07-04 niveau 4, 2 feux (Aix)         -> déclenché avec feu
SILVER = """
CREATE SCHEMA silver; CREATE SCHEMA gold;
CREATE TABLE silver.dim_departement AS
    SELECT '13' AS code_dep, 'Bouches-du-Rhône' AS nom, TRUE AS est_paca, TRUE AS est_metropole, 'test' AS origine;
CREATE TABLE silver.dim_jour AS
    SELECT CAST(j AS DATE) AS jour, year(j) AS annee, month(j) AS mois, isodow(j) AS jour_semaine
    FROM generate_series(DATE '2024-06-30', DATE '2024-07-05', INTERVAL 1 DAY) t(j);
CREATE TABLE silver.fait_niveau_danger AS
    SELECT '13' AS code_dep, DATE '2024-07-01' + CAST(i AS INTEGER) AS jour_danger,
           TIMESTAMP '2024-06-30 15:00:00' + to_days(CAST(i AS INTEGER)) AS diffusion_utc,
           CAST(i AS INTEGER) + 1 AS niveau, 'Bouches-du-Rhône' AS nom_departement, 'test' AS _fichier_source
    FROM range(4) t(i);
CREATE TABLE silver.fait_feu AS SELECT * FROM (VALUES
    (2024, 'a', '13', '13001', TIMESTAMP '2024-07-01 14:00:00', DATE '2024-07-01', 1.0, FALSE),
    (2024, 'b', '13', '13055', TIMESTAMP '2024-07-03 15:00:00', DATE '2024-07-03', 5.0, TRUE),
    (2024, 'c', '13', '13001', TIMESTAMP '2024-07-04 13:00:00', DATE '2024-07-04', 2.0, FALSE),
    (2024, 'd', '13', '13001', TIMESTAMP '2024-07-04 16:00:00', DATE '2024-07-04', 3.0, FALSE)
) t(annee, numero, code_dep, code_insee, alerte, jour_alerte, surface_parcourue_ha, est_marseille);
CREATE TABLE silver.dim_commune AS SELECT * FROM (VALUES ('13001', 'Aix-en-Provence', TRUE), ('13055', 'Marseille', TRUE))
    t(code_insee, nom, est_courant);
CREATE TABLE silver.dim_station AS SELECT '13001009' AS num_poste, '13' AS code_dep;
CREATE TABLE silver.fait_meteo_jour AS SELECT * FROM (VALUES
    ('13001009', DATE '2024-06-30', 4.0, 30.0, 3.0, 10.0, 40.0)
) t(num_poste, jour, rr_mm, tx_c, ffm_ms, fxi3s_ms, un_pct);
"""


@pytest.fixture(scope="module")
def gold():
    con = duckdb.connect(":memory:")
    con.execute(SILVER)
    for fichier in sorted((SQL / "gold").glob("*.sql")):
        con.execute(fichier.read_text(encoding="utf-8"))
    yield con
    con.close()


def test_jours_sans_feu_presents(gold):
    lignes = gold.execute("SELECT jour, nb_feux, niveau FROM gold.mart_jour_departement ORDER BY jour").fetchall()
    assert [(str(j), n) for j, n, _ in lignes] == [
        ("2024-06-30", 0), ("2024-07-01", 1), ("2024-07-02", 0),
        ("2024-07-03", 1), ("2024-07-04", 2), ("2024-07-05", 0),
    ]
    # Hors saison (06-30 et 07-05) : pas de bulletin, niveau NULL.
    assert [n for _, _, n in lignes] == [None, 1, 2, 3, 4, None]


def test_pluie_de_la_veille(gold):
    assert gold.execute(
        "SELECT rr_veille_mm FROM gold.mart_jour_departement WHERE jour = '2024-07-01'"
    ).fetchone()[0] == 4.0


@pytest.mark.parametrize(
    "seuil, perimetre, attendu",
    [
        # (jours_declenches, avec_feu, fausses_alertes, feux_manques, jours_avec_feu_manques, surface_manquee_ha)
        (2, "departement", (3, 2, 1, 1, 1, 1.0)),
        (3, "departement", (2, 2, 0, 1, 1, 1.0)),
        (4, "departement", (1, 1, 0, 2, 2, 6.0)),
        (3, "hors_marseille", (2, 1, 1, 1, 1, 1.0)),
        (4, "hors_marseille", (1, 1, 0, 1, 1, 1.0)),
    ],
)
def test_mart_seuil(gold, seuil, perimetre, attendu):
    ligne = gold.execute(
        "SELECT jours_declenches, jours_declenches_avec_feu, fausses_alertes, feux_manques, jours_avec_feu_manques, surface_manquee_ha "
        "FROM gold.mart_seuil WHERE seuil = ? AND perimetre = ?",
        [seuil, perimetre],
    ).fetchone()
    assert ligne == attendu


def test_feux_manques_en_feux_et_en_jours(gold):
    # Un jour manqué compte au moins un feu manqué.
    lignes = gold.execute("SELECT feux_manques, jours_avec_feu_manques FROM gold.mart_seuil").fetchall()
    assert all(feux >= jours for feux, jours in lignes)


def test_jours_avec_feu_manques_plusieurs_feux_le_meme_jour():
    con = duckdb.connect(":memory:")
    con.execute(SILVER)
    # 2 feux de plus le 07-01 (niveau 1) : 3 feux manqués ce jour-là, mais 1 seul jour.
    con.execute("""INSERT INTO silver.fait_feu VALUES
        (2024, 'e', '13', '13001', TIMESTAMP '2024-07-01 10:00:00', DATE '2024-07-01', 1.0, FALSE),
        (2024, 'f', '13', '13001', TIMESTAMP '2024-07-01 11:00:00', DATE '2024-07-01', 1.0, FALSE)""")
    for fichier in sorted((SQL / "gold").glob("*.sql")):
        con.execute(fichier.read_text(encoding="utf-8"))
    ligne = con.execute(
        "SELECT feux_manques, jours_avec_feu_manques FROM gold.mart_seuil WHERE seuil = 2 AND perimetre = 'departement'"
    ).fetchone()
    assert ligne == (3, 1)
    con.close()


def test_commune_annee_rang(gold):
    lignes = gold.execute(
        "SELECT nom_commune, nb_feux, rang_dans_departement, est_marseille FROM gold.mart_commune_annee ORDER BY 3"
    ).fetchall()
    assert lignes == [("Aix-en-Provence", 3, 1, False), ("Marseille", 1, 2, True)]


def test_vue_q2(gold):
    heures = gold.execute("SELECT heure, sum(nb_feux) FROM gold.v_q2_quand GROUP BY 1 ORDER BY 1").fetchall()
    assert heures == [(13, 1), (14, 1), (15, 1), (16, 1)]


def test_fait_feu_enrichi(gold):
    # Un feu par ligne, avec le niveau de son jour (D016) et l'heure d'alerte ; Aix (13001) est prioritaire.
    lignes = gold.execute(
        "SELECT numero, jour, heure, niveau, dans_periode_bulletin, surface_ha, est_marseille, est_commune_prioritaire "
        "FROM gold.fait_feu_enrichi ORDER BY numero"
    ).fetchall()
    assert [l[0] for l in lignes] == ["a", "b", "c", "d"]
    assert [(l[2], l[3], l[4]) for l in lignes] == [(14, 1, True), (15, 3, True), (13, 4, True), (16, 4, True)]
    assert [(l[6], l[7]) for l in lignes] == [(False, True), (True, False), (False, True), (False, True)]


def test_fait_feu_enrichi_niveau_null_hors_periode(gold):
    # Un feu un jour sans bulletin garde un niveau NULL, jamais 1.
    gold.execute(
        "INSERT INTO silver.fait_feu VALUES "
        "(2024, 'e', '13', '13001', TIMESTAMP '2024-06-30 10:00:00', DATE '2024-06-30', 0.1, FALSE)"
    )
    gold.execute((SQL / "gold" / "50_fait_feu_enrichi.sql").read_text(encoding="utf-8"))
    assert gold.execute(
        "SELECT niveau, dans_periode_bulletin FROM gold.fait_feu_enrichi WHERE numero = 'e'"
    ).fetchone() == (None, False)
    gold.execute("DELETE FROM silver.fait_feu WHERE numero = 'e'")
    gold.execute((SQL / "gold" / "50_fait_feu_enrichi.sql").read_text(encoding="utf-8"))
