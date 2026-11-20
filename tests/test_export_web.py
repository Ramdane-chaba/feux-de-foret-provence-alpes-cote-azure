"""Les JSON de l'application web (pipeline/exporter_web.py) portent les chiffres des fiches d'indicateurs.

Deux séries de contrôles :
  1. les valeurs de contrôle des fiches (kpi/02_fiches_indicateurs.md) se retrouvent dans les JSON ;
  2. les cinq affirmations du récit de l'application (« L'histoire en 5 étapes ») sont vraies dans les
     données. Si une nouvelle version des sources en rend une fausse, ce test échoue : il faut alors
     réécrire le titre de l'étape dans dashboard/web/src/pages/Recit.tsx, pas adapter le test.
"""

import json
from statistics import mean, median

import pytest

from conftest import scalaire
from pipeline.exporter_web import contours, exporter_web, glossaire, identifiant, simplifier


@pytest.fixture(scope="module")
def web(con, exports, tmp_path_factory):
    """Les JSON écrits dans un dossier provisoire, lus en dictionnaires : {nom du fichier: contenu}."""
    if not scalaire(con, "SELECT count(*) FROM silver.fait_feu"):
        pytest.skip("export BDIFF absent : pas de feux à exporter")
    dossier = tmp_path_factory.mktemp("web")
    fichiers = exporter_web(exports, dossier, hors_ligne=True)
    return {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in fichiers if f.suffix == ".json"}


def ligne_seuil(web, seuil: int, annee: int, perimetre: str = "departement") -> dict:
    return next(
        l for l in web["seuils"]["lignes"]
        if l["seuil"] == seuil and l["annee"] == annee and l["perimetre"] == perimetre
    )


# --- 1. Valeurs de contrôle des fiches ---


def test_fichiers_ecrits(web):
    assert {"accueil", "recit", "seuils", "jours", "carte", "synthese", "glossaire", "meta"} <= set(web)


def test_accueil_chiffres_des_fiches(web):
    a = web["accueil"]
    assert (a["feux"], a["feux_periode"], a["feux_couverts"]) == (489, 355, 177)
    assert (a["jours_renfort"], a["jours_bulletin"]) == (78, 240)
    assert a["seuil_reference"] == 3


@pytest.mark.parametrize(
    "seuil, couverts, jours_renfort, sans_feu",
    [(2, 315, 181, 50), (3, 177, 78, 12), (4, 46, 10, 1)],
)
def test_seuils_i3(web, seuil, couverts, jours_renfort, sans_feu):
    lignes = [ligne_seuil(web, seuil, annee) for annee in (2024, 2025)]
    assert sum(l["feux_couverts"] for l in lignes) == couverts
    assert sum(l["feux_periode"] for l in lignes) == 355
    assert sum(l["jours_renfort"] for l in lignes) == jours_renfort
    assert sum(l["jours_renfort_sans_feu"] for l in lignes) == sans_feu
    for l in lignes:
        assert l["feux_couverts"] + l["feux_manques"] == l["feux_periode"]
        assert l["jours_renfort_avec_feu"] + l["jours_renfort_sans_feu"] == l["jours_renfort"]


def test_seuils_hors_marseille(web):
    lignes = [ligne_seuil(web, 3, annee, "hors_marseille") for annee in (2024, 2025)]
    assert sum(l["feux_periode"] for l in lignes) == 325


def test_synthese_i1_i2(web):
    s = web["synthese"]
    assert (s["i1"]["numerateur"], s["i1"]["denominateur"]) == (16, 242)
    assert (s["i1_autres"]["numerateur"], s["i1_autres"]["denominateur"]) == (8, 208)
    assert (s["i2"]["numerateur"], s["i2"]["denominateur"]) == (113, 177)
    assert s["feux_hors_periode"] == 134
    assert sum(h["nb_feux"] for h in s["feux_par_heure"]) == s["feux"]
    assert len(s["feux_par_heure"]) == 24


def test_jours_coherents_avec_les_seuils(web):
    jours = web["jours"]["jours"]
    assert len(jours) == 240
    assert sum(j["nb_feux"] for j in jours) == 355
    assert sum(j["nb_feux"] for j in jours if j["niveau"] >= 3) == 177
    assert sum(j["nb_feux_hors_marseille"] for j in jours) == 325


def test_carte_coherente_avec_la_bdiff(web, con):
    carte = web["carte"]
    assert carte["annees"] == list(range(2006, 2026))
    total = scalaire(con, "SELECT count(*) FROM silver.fait_feu WHERE code_dep = '13'")
    assert sum(c["nb_feux"] for c in carte["communes"]) == total
    assert sum(c["prioritaire"] for c in carte["communes"]) == 18
    for c in carte["communes"]:
        assert sum(c["feux_par_annee"]) == sum(c["feux_par_mois"]) == sum(c["feux_par_heure"]) == c["nb_feux"]


# --- 2. Les affirmations du récit ---


def test_recit_etape_1_plus_de_feux_les_annees_seches(web):
    annees = web["recit"]["annees"]
    assert all(a["jours_pluie_mesuree"] >= a["jours"] - 1 for a in annees), "pluie mesurée presque tous les jours"
    mediane_pluie = median(a["pluie_mm"] for a in annees)
    seches = [a["nb_feux"] for a in annees if a["pluie_mm"] < mediane_pluie]
    arrosees = [a["nb_feux"] for a in annees if a["pluie_mm"] >= mediane_pluie]
    assert mean(seches) > 1.2 * mean(arrosees)


def test_recit_etape_2_les_communes_prioritaires_font_la_moitie_des_feux(web):
    communes = web["recit"]["communes_hors_marseille"]
    prioritaires = sum(c["nb_feux"] for c in communes if c["prioritaire"])
    assert sum(c["prioritaire"] for c in communes) == 18
    assert 0.5 <= prioritaires / sum(c["nb_feux"] for c in communes) < 0.55
    # Les 18 communes prioritaires sont bien les 18 premières du classement (le graphique trace un trait après elles).
    assert all(c["prioritaire"] for c in communes[:18])


def test_recit_etape_3_la_moitie_des_feux_part_sans_renfort(web):
    a = web["accueil"]
    assert 0.45 <= (a["feux_periode"] - a["feux_couverts"]) / a["feux_periode"] <= 0.55


def test_recit_etape_4_feux_manques_par_temps_chaud_et_sec(web):
    sous_seuil = [j for j in web["jours"]["jours"] if j["niveau"] < web["jours"]["seuil_reference"]]
    avec = [j for j in sous_seuil if j["nb_feux"] > 0]
    sans = [j for j in sous_seuil if j["nb_feux"] == 0]
    assert mean(j["tx_max_c"] for j in avec) > mean(j["tx_max_c"] for j in sans) + 1
    assert mean(j["un_min_pct"] for j in avec) < mean(j["un_min_pct"] for j in sans)
    assert mean(j["rr_veille_mm"] for j in avec) < mean(j["rr_veille_mm"] for j in sans)


def test_recit_etape_5_chaque_niveau_de_plus_couvre_moins_de_feux(web):
    couverts = [sum(ligne_seuil(web, s, a)["feux_couverts"] for a in (2024, 2025)) for s in (2, 3, 4)]
    assert couverts == sorted(couverts, reverse=True)
    assert couverts[2] < couverts[1] / 2


# --- Glossaire et fond de carte ---


def test_glossaire_termes_de_l_application():
    termes = {t["id"]: t for t in glossaire()["termes"]}
    # Identifiants utilisés par dashboard/web/src/components/Glossaire.tsx.
    for attendu in (
        "seuil-de-declenchement", "jour-de-renfort", "feu-manque", "grand-feu", "bmpm", "niveau-j-1",
        "fausse-alerte", "dispositif-renforce", "meteo-des-forets", "date-de-premiere-alerte", "depart-de-feu",
    ):
        assert attendu in termes, attendu
        assert len(termes[attendu]["definition"]) > 40
    assert "[" not in termes["bmpm"]["regle"] and "`" not in termes["jour-de-renfort"]["definition"]


def test_identifiant():
    assert identifiant("Feu manqué") == "feu-manque"
    assert identifiant("BMPM (Bataillon de marins-pompiers de Marseille)") == "bmpm"
    assert identifiant("Niveau J+1") == "niveau-j-1"


def test_simplifier_garde_les_extremites_et_les_ecarts():
    ligne = [[0, 0], [1, 0.00001], [2, 0], [3, 1], [4, 0]]
    simple = simplifier(ligne, 0.001)
    assert simple[0] == [0, 0] and simple[-1] == [4, 0]
    assert [3, 1] in simple and [1, 0.00001] not in simple


def test_contours_allege_le_geojson(tmp_path):
    carre = [[5.0 + i / 1000, 43.0] for i in range(50)] + [[5.05, 43.05], [5.0, 43.05], [5.0, 43.0]]
    source = tmp_path / "communes.geojson"
    source.write_text(json.dumps({"type": "FeatureCollection", "features": [{
        "type": "Feature", "properties": {"code": "13999", "nom": "Essai", "autre": 1},
        "geometry": {"type": "Polygon", "coordinates": [carre]},
    }]}), encoding="utf-8")
    feature = contours(source)["features"][0]
    anneau = feature["geometry"]["coordinates"][0][0]
    assert feature["properties"] == {"code": "13999", "nom": "Essai"}
    assert feature["geometry"]["type"] == "MultiPolygon"
    assert anneau[0] == anneau[-1] and 4 <= len(anneau) < len(carre)
