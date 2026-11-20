"""Les trois indicateurs (kpi/02_fiches_indicateurs.md) se recalculent à partir des seuls fichiers Parquet.

Chaque requête ne lit que data/exports/ (jamais la base DuckDB) : c'est ce que fera Power BI.
Les valeurs attendues sont celles des fiches, mesurées sur la BDIFF et la Météo des forêts, 13, 2024-2025.
"""

import pytest

from conftest import scalaire


@pytest.fixture(scope="module")
def feux(con, exports):
    if not scalaire(con, "SELECT count(*) FROM silver.fait_feu"):
        pytest.skip("export BDIFF absent : pas de feux à compter")
    return f"read_parquet('{exports / 'fait_feu_enrichi.parquet'}')"


def compter(con, feux: str, filtre: str) -> int:
    return scalaire(con, f"SELECT count(*) FROM {feux} WHERE code_dep = '13' AND annee IN (2024, 2025) AND {filtre}")


def test_un_feu_par_ligne(con, feux):
    assert scalaire(con, f"SELECT count(*) FROM {feux}") == scalaire(con, "SELECT count(*) FROM silver.fait_feu")
    assert scalaire(con, f"SELECT count(*) - count(DISTINCT (annee, numero)) FROM {feux}") == 0


def test_communes_prioritaires(con, exports):
    ref = f"read_parquet('{exports / 'ref_communes_prioritaires.parquet'}')"
    assert scalaire(con, f"SELECT count(DISTINCT code_insee) FROM {ref}") == 18
    # Les 18 codes existent dans la BDIFF : aucune commune de la liste ne compte 0 feu par faute de frappe.
    assert scalaire(con, f"SELECT count(*) FROM {ref} WHERE code_insee NOT IN (SELECT code_insee FROM silver.dim_commune)") == 0


# --- I1 : part des feux de plus de S ha, communes prioritaires et autres communes, hors Marseille ---

@pytest.mark.parametrize(
    "seuil_ha, prioritaires, autres",
    [(0.5, (20, 242), (12, 208)), (1, (16, 242), (8, 208)), (5, (5, 242), (3, 208))],
)
def test_i1(con, feux, seuil_ha, prioritaires, autres):
    for prio, attendu in ((True, prioritaires), (False, autres)):
        base = f"NOT est_marseille AND est_commune_prioritaire = {prio}"
        assert (compter(con, feux, f"{base} AND surface_ha > {seuil_ha}"), compter(con, feux, base)) == attendu


# --- I2 : part des feux d'un jour de niveau >= 3 dont l'heure d'alerte tombe dans les plages P ---

@pytest.mark.parametrize("debut, fin, attendu", [(10, 20, 124), (12, 20, 113), (13, 19, 95)])
def test_i2(con, feux, debut, fin, attendu):
    assert compter(con, feux, "niveau >= 3") == 177
    assert compter(con, feux, f"niveau >= 3 AND heure >= {debut} AND heure < {fin}") == attendu


# --- I3 : part des feux de la période de publication partis un jour de niveau >= N ---

def test_i3_periode_de_publication(con, feux):
    assert compter(con, feux, "TRUE") == 489
    assert compter(con, feux, "dans_periode_bulletin") == 355
    assert compter(con, feux, "niveau IS NULL") == 134


@pytest.mark.parametrize("seuil, attendu", [(2, 315), (3, 177), (4, 46)])
def test_i3(con, feux, seuil, attendu):
    assert compter(con, feux, f"niveau >= {seuil}") == attendu


def test_i3_par_saison_et_hors_marseille(con, feux):
    assert (compter(con, feux, "annee = 2024 AND niveau >= 3"), compter(con, feux, "annee = 2024 AND dans_periode_bulletin")) == (47, 162)
    assert (compter(con, feux, "annee = 2025 AND niveau >= 3"), compter(con, feux, "annee = 2025 AND dans_periode_bulletin")) == (130, 193)
    hors_marseille = "NOT est_marseille AND "
    assert compter(con, feux, hors_marseille + "dans_periode_bulletin") == 325
    assert compter(con, feux, hors_marseille + "niveau >= 3") == 161


def test_niveau_identique_au_mart_jour_departement(con, feux, exports):
    """Le niveau porté par chaque feu est celui du jour dans mart_jour_departement (même jointure D016)."""
    jours = f"read_parquet('{exports / 'mart_jour_departement.parquet'}')"
    assert scalaire(
        con,
        f"SELECT count(*) FROM {feux} f JOIN {jours} j ON j.code_dep = f.code_dep AND j.jour = f.jour "
        "WHERE f.niveau IS DISTINCT FROM j.niveau",
    ) == 0
