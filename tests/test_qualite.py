"""Barrière de qualité : aucune règle bloquante en échec sur les vraies données, arrêt sur une règle block."""

import duckdb
import pytest

from pipeline.qualite import REGLES, EchecBloquant, Resultat, barriere, ecrire_rapport, evaluer


@pytest.fixture(scope="module")
def resultats(con):
    return evaluer(con, "extraction") + evaluer(con, "modele")


def test_aucune_regle_bloquante_en_echec(resultats):
    echecs = [(r.regle.nom, r.regle.portee, r.valeur) for r in resultats if r.regle.severite == "block" and r.statut == "echec"]
    assert echecs == []


def test_chaque_regle_a_selecteur_predicat_seuil_severite():
    for regle in REGLES:
        assert regle.portee and regle.requete and regle.operateur in ("=", "<=", ">=")
        assert regle.seuil is not None and regle.severite in ("block", "warn")


def test_nc_compte_en_warn(resultats):
    (nc,) = [r for r in resultats if "N.C." in r.regle.nom]
    assert (nc.regle.severite, nc.statut, nc.valeur) == ("warn", "echec", 1)


def test_bdiff_absente_non_evaluable(con, resultats):
    if con.execute("SELECT count(*) FROM silver.fait_feu").fetchone()[0]:
        pytest.skip("export BDIFF présent")
    volume = [r for r in resultats if r.regle.nom.startswith("Volume : feux")]
    assert [r.statut for r in volume] == ["non evaluable"]


def base_synthetique(heure_diffusion: int) -> duckdb.DuckDBPyConnection:
    con = duckdb.connect(":memory:")
    con.execute("CREATE SCHEMA silver")
    con.execute(
        "CREATE TABLE silver.fait_niveau_danger AS SELECT '13' AS code_dep, DATE '2025-07-02' AS jour_danger, "
        f"TIMESTAMP '2025-07-01 {heure_diffusion:02d}:30:00' AS diffusion_utc, 3 AS niveau"
    )
    return con


def test_d016_diffusion_apres_22h_bloque():
    (regle,) = [r for r in REGLES if r.nom.startswith("D016")]
    assert regle.severite == "block"
    for heure, attendu in ((15, 0), (22, 1), (23, 1)):
        con = base_synthetique(heure)
        assert con.execute(regle.requete).fetchone()[0] == attendu
        con.close()


def test_barriere_arrete_sur_echec_bloquant():
    # Base vide : les tables bronze n'existent pas, les règles block d'extraction échouent sans planter.
    con = duckdb.connect(":memory:")
    con.execute("CREATE SCHEMA bronze")
    resultats: list[Resultat] = []
    with pytest.raises(EchecBloquant):
        barriere(con, "extraction", resultats)
    assert any(r.statut == "echec" and r.regle.severite == "block" for r in resultats)
    con.close()


def test_rapport_genere(con, resultats, tmp_path):
    chemin = tmp_path / "rapport.md"
    ecrire_rapport(con, resultats, chemin, "test", None)
    texte = chemin.read_text(encoding="utf-8")
    assert "| Règle | Portée | Seuil | Résultat | Sévérité | Décision |" in texte
    assert "« N.C. »" in texte and "Chute de plus de 30 %" in texte
    assert "Ce que les indicateurs peuvent et ne peuvent pas affirmer" in texte
    assert "D005" in texte
