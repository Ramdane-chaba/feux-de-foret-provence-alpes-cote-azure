"""Exporte les fichiers JSON lus par l'application web (dashboard/web).

    uv run python -m pipeline.exporter_web              (télécharge le fond de carte s'il manque)
    uv run python -m pipeline.exporter_web --hors-ligne (n'utilise que les fichiers présents)

Les JSON sont calculés à partir des seuls fichiers Parquet de data/exports/ : l'application web et le
rapport Power BI lisent donc exactement les mêmes tables gold, déjà contrôlées par la barrière « modèle ».
Un fichier par page de l'application, pour que chaque page ne charge que ce qu'elle affiche.
Aucun chiffre n'est écrit à la main ici : les paramètres (seuil de référence, plage de patrouille,
surface d'un grand feu) viennent de pipeline/config.py et sont recopiés dans les JSON.
"""

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

import duckdb

from pipeline import telecharger
from pipeline.chemins import DATA_RAW, EXPORTS, RACINE, WEB_DATA
from pipeline.config import (
    CONTOURS_TOLERANCE_DEG,
    DEPARTEMENT_SDIS,
    GRAND_FEU_HA,
    PLAGE_PATROUILLE,
    SAISONS_CROISEES,
    SEUIL_REFERENCE,
    SEUILS,
)

GLOSSAIRE = RACINE / "docs" / "glossaire.md"
DEP = DEPARTEMENT_SDIS
SAISONS = ", ".join(str(a) for a in SAISONS_CROISEES)


class Lecteur:
    """Petites requêtes sur les fichiers Parquet de data/exports/."""

    def __init__(self, exports: Path):
        self.con = duckdb.connect()
        for fichier in sorted(exports.glob("*.parquet")):
            chemin = str(fichier).replace("'", "''")
            self.con.execute(f"CREATE VIEW {fichier.stem} AS SELECT * FROM read_parquet('{chemin}')")

    def lignes(self, requete: str) -> list[dict]:
        resultat = self.con.execute(requete)
        noms = [d[0] for d in resultat.description]
        return [dict(zip(noms, ligne)) for ligne in resultat.fetchall()]

    def ligne(self, requete: str) -> dict:
        return self.lignes(requete)[0]

    def valeur(self, requete: str):
        return self.con.execute(requete).fetchone()[0]


def arrondi(valeur: float | None, decimales: int = 2) -> float | None:
    return None if valeur is None else round(valeur, decimales)


# --- Les fichiers ---


def accueil(lec: Lecteur) -> dict:
    """Les trois chiffres de l'écran d'ouverture (13 entier, saisons croisées, seuil de référence)."""
    feux = lec.ligne(f"""
        SELECT count(*)                                              AS feux,
               count(*) FILTER (WHERE dans_periode_bulletin)         AS feux_periode,
               count(*) FILTER (WHERE niveau >= {SEUIL_REFERENCE})   AS feux_couverts
        FROM fait_feu_enrichi WHERE code_dep = '{DEP}' AND annee IN ({SAISONS})""")
    jours = lec.ligne(f"""
        SELECT sum(jours_declenches) AS jours_renfort, sum(jours_bulletin) AS jours_bulletin
        FROM mart_seuil
        WHERE code_dep = '{DEP}' AND perimetre = 'departement' AND seuil = {SEUIL_REFERENCE}
          AND annee IN ({SAISONS})""")
    return {
        "saisons": list(SAISONS_CROISEES),
        "seuil_reference": SEUIL_REFERENCE,
        "feux": feux["feux"],
        "feux_periode": feux["feux_periode"],
        "feux_couverts": feux["feux_couverts"],
        "jours_renfort": jours["jours_renfort"],
        "jours_bulletin": jours["jours_bulletin"],
        **lec.ligne(f"SELECT min(annee) AS annee_debut, max(annee) AS annee_fin FROM fait_feu_enrichi WHERE code_dep = '{DEP}'"),
    }


def recit(lec: Lecteur) -> dict:
    """Étapes 1 et 2 du récit : feux et pluie par année, feux par commune (2006-2025)."""
    annees = lec.lignes(f"""
        SELECT annee,
               sum(nb_feux)                 AS nb_feux,
               round(sum(surface_ha), 1)    AS surface_ha,
               round(sum(rr_veille_mm))     AS pluie_mm,
               count(rr_veille_mm)          AS jours_pluie_mesuree,
               count(*)                     AS jours
        FROM mart_jour_departement
        WHERE code_dep = '{DEP}' AND feux_connus
        GROUP BY annee ORDER BY annee""")
    communes = lec.lignes(f"""
        SELECT code_insee, any_value(nom_commune) AS nom, bool_or(est_commune_prioritaire) AS prioritaire,
               count(*) AS nb_feux, round(sum(surface_ha), 1) AS surface_ha
        FROM fait_feu_enrichi
        WHERE code_dep = '{DEP}' AND NOT est_marseille
        GROUP BY code_insee ORDER BY nb_feux DESC, surface_ha DESC""")
    return {
        "annees": annees,
        "communes_hors_marseille": communes,
        "feux_marseille": lec.valeur(
            f"SELECT count(*) FROM fait_feu_enrichi WHERE code_dep = '{DEP}' AND est_marseille"
        ),
    }


def seuils(lec: Lecteur) -> dict:
    """Simulateur : une ligne par périmètre × saison × seuil, avec les feux de la période de publication."""
    lignes = lec.lignes(f"""
        WITH periode AS (
            SELECT annee, 'departement' AS perimetre, count(*) AS feux_periode
            FROM fait_feu_enrichi
            WHERE code_dep = '{DEP}' AND dans_periode_bulletin AND annee IN ({SAISONS}) GROUP BY annee
            UNION ALL
            SELECT annee, 'hors_marseille', count(*)
            FROM fait_feu_enrichi
            WHERE code_dep = '{DEP}' AND dans_periode_bulletin AND NOT est_marseille AND annee IN ({SAISONS})
            GROUP BY annee
        )
        SELECT s.perimetre, s.annee, s.seuil, s.jours_bulletin,
               s.jours_declenches            AS jours_renfort,
               s.jours_declenches_avec_feu   AS jours_renfort_avec_feu,
               s.fausses_alertes             AS jours_renfort_sans_feu,
               p.feux_periode,
               p.feux_periode - s.feux_manques AS feux_couverts,
               s.feux_manques,
               s.jours_avec_feu_manques,
               round(s.surface_manquee_ha, 1) AS surface_manquee_ha
        FROM mart_seuil s JOIN periode p USING (annee, perimetre)
        WHERE s.code_dep = '{DEP}' AND s.feux_connus AND s.seuil IN ({", ".join(map(str, SEUILS))})
        ORDER BY s.perimetre, s.annee, s.seuil""")
    return {
        "saisons": list(SAISONS_CROISEES),
        "seuils": list(SEUILS),
        "seuil_reference": SEUIL_REFERENCE,
        "lignes": lignes,
    }


def jours(lec: Lecteur) -> dict:
    """Calendrier et étape 4 du récit : un jour de bulletin par ligne, avec le niveau, les feux et la météo."""
    lignes = lec.lignes(f"""
        SELECT strftime(jour, '%Y-%m-%d') AS jour, annee, niveau, nb_feux, nb_feux_hors_marseille,
               round(surface_ha, 2)      AS surface_ha,
               round(tx_max_c, 1)        AS tx_max_c,
               round(un_min_pct)         AS un_min_pct,
               round(rr_veille_mm, 1)    AS rr_veille_mm,
               round(fxi3s_max_ms, 1)    AS rafale_ms
        FROM mart_jour_departement
        WHERE code_dep = '{DEP}' AND niveau IS NOT NULL AND annee IN ({SAISONS})
        ORDER BY jour""")
    return {
        "saisons": list(SAISONS_CROISEES),
        "seuils": list(SEUILS),
        "seuil_reference": SEUIL_REFERENCE,
        "jours": lignes,
    }


def carte(lec: Lecteur) -> dict:
    """Carte : par commune du 13, les feux et les hectares par année, par mois et par heure d'alerte."""
    annees = [l["annee"] for l in lec.lignes(
        f"SELECT DISTINCT annee FROM fait_feu_enrichi WHERE code_dep = '{DEP}' ORDER BY annee")]
    rang = {a: i for i, a in enumerate(annees)}
    communes: dict[str, dict] = {}
    for l in lec.lignes(f"""
        SELECT code_insee, any_value(nom_commune) AS nom, bool_or(est_commune_prioritaire) AS prioritaire,
               bool_or(est_marseille) AS est_marseille, annee, mois, heure,
               count(*) AS nb_feux, sum(surface_ha) AS surface_ha
        FROM fait_feu_enrichi WHERE code_dep = '{DEP}'
        GROUP BY code_insee, annee, mois, heure"""):
        c = communes.setdefault(l["code_insee"], {
            "code": l["code_insee"], "nom": l["nom"], "prioritaire": False, "est_marseille": False,
            "nb_feux": 0, "surface_ha": 0.0,
            "feux_par_annee": [0] * len(annees), "ha_par_annee": [0.0] * len(annees),
            "feux_par_mois": [0] * 12, "feux_par_heure": [0] * 24,
        })
        c["prioritaire"] |= l["prioritaire"]
        c["est_marseille"] |= l["est_marseille"]
        c["nb_feux"] += l["nb_feux"]
        c["surface_ha"] += l["surface_ha"]
        c["feux_par_annee"][rang[l["annee"]]] += l["nb_feux"]
        c["ha_par_annee"][rang[l["annee"]]] += l["surface_ha"]
        c["feux_par_mois"][l["mois"] - 1] += l["nb_feux"]
        c["feux_par_heure"][l["heure"]] += l["nb_feux"]
    for c in communes.values():
        c["surface_ha"] = round(c["surface_ha"], 1)
        c["ha_par_annee"] = [round(v, 1) for v in c["ha_par_annee"]]
    return {"annees": annees, "communes": sorted(communes.values(), key=lambda c: c["code"])}


def synthese(lec: Lecteur) -> dict:
    """Synthèse : les indicateurs I1, I2 et I3 des fiches, avec leurs numérateurs et dénominateurs."""
    debut, fin = PLAGE_PATROUILLE
    f = lec.ligne(f"""
        SELECT
          count(*)                                                              AS feux,
          count(*) FILTER (WHERE NOT dans_periode_bulletin)                     AS feux_hors_periode,
          count(*) FILTER (WHERE dans_periode_bulletin)                         AS feux_periode,
          count(*) FILTER (WHERE niveau >= {SEUIL_REFERENCE})                   AS i2_denominateur,
          count(*) FILTER (WHERE niveau >= {SEUIL_REFERENCE}
                             AND heure >= {debut} AND heure < {fin})            AS i2_numerateur,
          count(*) FILTER (WHERE est_commune_prioritaire AND NOT est_marseille) AS i1_denominateur,
          count(*) FILTER (WHERE est_commune_prioritaire AND NOT est_marseille
                             AND surface_ha > {GRAND_FEU_HA})                   AS i1_numerateur,
          count(*) FILTER (WHERE NOT est_commune_prioritaire AND NOT est_marseille) AS i1_autres_denominateur,
          count(*) FILTER (WHERE NOT est_commune_prioritaire AND NOT est_marseille
                             AND surface_ha > {GRAND_FEU_HA})                   AS i1_autres_numerateur
        FROM fait_feu_enrichi WHERE code_dep = '{DEP}' AND annee IN ({SAISONS})""")
    heures = lec.lignes(f"""
        SELECT heure, count(*) AS nb_feux, count(*) FILTER (WHERE niveau >= {SEUIL_REFERENCE}) AS nb_feux_couverts
        FROM fait_feu_enrichi WHERE code_dep = '{DEP}' AND annee IN ({SAISONS})
        GROUP BY heure ORDER BY heure""")
    par_heure = [{"heure": h, "nb_feux": 0, "nb_feux_couverts": 0} for h in range(24)]
    for l in heures:
        par_heure[l["heure"]] = l
    historique = lec.ligne(f"""
        SELECT count(DISTINCT code_insee) FILTER (WHERE NOT est_marseille)                AS communes_avec_feu,
               count(DISTINCT code_insee) FILTER (WHERE est_commune_prioritaire)          AS communes_prioritaires,
               count(*) FILTER (WHERE NOT est_marseille)                                  AS feux_hors_marseille,
               count(*) FILTER (WHERE est_commune_prioritaire AND NOT est_marseille)      AS feux_prioritaires,
               min(annee) AS annee_debut, max(annee) AS annee_fin
        FROM fait_feu_enrichi WHERE code_dep = '{DEP}'""")
    return {
        "saisons": list(SAISONS_CROISEES),
        "seuil_reference": SEUIL_REFERENCE,
        "grand_feu_ha": GRAND_FEU_HA,
        "plage_patrouille": list(PLAGE_PATROUILLE),
        "feux": f["feux"],
        "feux_periode": f["feux_periode"],
        "feux_hors_periode": f["feux_hors_periode"],
        "i1": {"numerateur": f["i1_numerateur"], "denominateur": f["i1_denominateur"]},
        "i1_autres": {"numerateur": f["i1_autres_numerateur"], "denominateur": f["i1_autres_denominateur"]},
        "i2": {"numerateur": f["i2_numerateur"], "denominateur": f["i2_denominateur"]},
        "feux_par_heure": par_heure,
        "historique": historique,
    }


# --- Glossaire ---


def texte_brut(markdown: str) -> str:
    """Retire la mise en forme Markdown d'une ligne du glossaire (liens, code, gras)."""
    texte = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", markdown)
    return texte.replace("`", "").replace("**", "").strip()


def identifiant(titre: str) -> str:
    """« Feu manqué » → « feu-manque » ; le texte entre parenthèses ne compte pas."""
    base = re.sub(r"\(.*?\)", "", titre).strip().lower()
    for avec, sans in zip("àâäéèêëîïôöùûüç", "aaaeeeeiioouuuc"):
        base = base.replace(avec, sans)
    return re.sub(r"[^a-z0-9]+", "-", base).strip("-")


def glossaire(fichier: Path = GLOSSAIRE) -> dict:
    """Lit docs/glossaire.md : une entrée par titre « ## », avec ses rubriques « - **Rubrique :** texte »."""
    rubriques = {
        "Définition": "definition", "Règle retenue": "regle", "Exemple": "exemple",
        "Unité ou granularité": "unite", "Statut": "statut",
    }
    termes = []
    courant = None
    for ligne in fichier.read_text(encoding="utf-8").splitlines():
        if ligne.startswith("## "):
            titre = ligne[3:].strip()
            courant = {"id": identifiant(titre), "terme": titre}
            termes.append(courant)
        elif courant is not None and (trouve := re.match(r"- \*\*(.+?) :\*\*\s*(.*)", ligne)):
            cle = rubriques.get(trouve.group(1))
            if cle:
                courant[cle] = texte_brut(trouve.group(2))
    return {"source": "docs/glossaire.md", "termes": [t for t in termes if t.get("definition")]}


# --- Fond de carte ---


def simplifier(points: list[list[float]], tolerance: float) -> list[list[float]]:
    """Douglas-Peucker, sans récursion : garde les points qui s'écartent de plus de `tolerance` du tracé."""
    if len(points) < 5:
        return points
    garde = [False] * len(points)
    garde[0] = garde[-1] = True
    pile = [(0, len(points) - 1)]
    while pile:
        debut, fin = pile.pop()
        (x1, y1), (x2, y2) = points[debut], points[fin]
        dx, dy = x2 - x1, y2 - y1
        norme = (dx * dx + dy * dy) ** 0.5
        ecart_max, indice = 0.0, -1
        for i in range(debut + 1, fin):
            x, y = points[i]
            if norme == 0:
                ecart = ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
            else:
                ecart = abs(dy * (x - x1) - dx * (y - y1)) / norme
            if ecart > ecart_max:
                ecart_max, indice = ecart, i
        if ecart_max > tolerance:
            garde[indice] = True
            pile.extend(((debut, indice), (indice, fin)))
    return [p for p, g in zip(points, garde) if g]


def contours(source: Path, tolerance: float = CONTOURS_TOLERANCE_DEG) -> dict:
    """GeoJSON allégé : contours simplifiés, coordonnées à 4 décimales (environ 10 m), anneaux trop petits retirés."""
    brut = json.loads(source.read_text(encoding="utf-8"))

    def anneaux(polygone: list) -> list:
        resultat = []
        for anneau in polygone:
            # Un anneau fermé se simplifie en deux moitiés : le premier et le dernier point sont identiques.
            milieu = len(anneau) // 2
            simple = simplifier(anneau[: milieu + 1], tolerance)[:-1] + simplifier(anneau[milieu:], tolerance)
            if len(simple) >= 4:
                resultat.append([[round(x, 4), round(y, 4)] for x, y in simple])
        return resultat

    features = []
    for feature in brut["features"]:
        geometrie = feature["geometry"]
        if geometrie["type"] == "Polygon":
            polygones = [anneaux(geometrie["coordinates"])]
        else:
            polygones = [anneaux(p) for p in geometrie["coordinates"]]
        polygones = [p for p in polygones if p]
        features.append({
            "type": "Feature",
            "properties": {"code": feature["properties"]["code"], "nom": feature["properties"]["nom"]},
            "geometry": {"type": "MultiPolygon", "coordinates": polygones},
        })
    return {"type": "FeatureCollection", "features": features}


# --- Écriture ---


def ecrire(dossier: Path, nom: str, contenu: dict) -> Path:
    cible = dossier / nom
    partiel = dossier / f"{nom}.part"
    partiel.write_text(
        json.dumps(contenu, ensure_ascii=False, separators=(",", ":"), default=float), encoding="utf-8"
    )
    partiel.replace(cible)
    print(f"  {nom} ({cible.stat().st_size / 1024:.0f} ko)")
    return cible


def exporter_web(exports: Path = EXPORTS, dossier: Path = WEB_DATA, hors_ligne: bool = False) -> list[Path]:
    """Écrit les JSON de l'application et renvoie leurs chemins. Le fond de carte est facultatif."""
    if not (exports / "fait_feu_enrichi.parquet").exists():
        raise FileNotFoundError(f"{exports} est vide : lancer d'abord `uv run python -m pipeline.construire`")
    dossier.mkdir(parents=True, exist_ok=True)
    lec = Lecteur(exports)
    fichiers = [
        ecrire(dossier, "accueil.json", accueil(lec)),
        ecrire(dossier, "recit.json", recit(lec)),
        ecrire(dossier, "seuils.json", seuils(lec)),
        ecrire(dossier, "jours.json", jours(lec)),
        ecrire(dossier, "carte.json", carte(lec)),
        ecrire(dossier, "synthese.json", synthese(lec)),
        ecrire(dossier, "glossaire.json", glossaire()),
    ]
    source = DATA_RAW / "geo" / f"communes_{DEP}.geojson"
    if not source.exists() and not hors_ligne:
        try:
            telecharger.telecharger_contours(DEP)
        except OSError as erreur:
            print(f"  fond de carte non téléchargé ({erreur}) : la page Carte l'indiquera")
    fond = dossier / f"communes-{DEP}.geojson"
    if source.exists():
        fichiers.append(ecrire(dossier, fond.name, contours(source)))
    elif fond.exists():
        fond.unlink()  # pas de fond périmé : l'application affiche « fond de carte indisponible »
    fichiers.append(ecrire(dossier, "meta.json", {
        "genere_le": datetime.now().replace(microsecond=0).isoformat(),
        "date_export": date.today().isoformat(),
        "departement": DEP,
        "fond_de_carte": source.exists(),
        "sources": [
            {"nom": "BDIFF", "detail": "export PACA, feux de forêt, 2006-2025"},
            {"nom": "Météo des forêts", "detail": "archives Météo-France, saisons 2024 et 2025"},
            {"nom": "Données climatologiques quotidiennes", "detail": "Météo-France, stations du 13"},
            {"nom": "Contours des communes", "detail": "API Découpage administratif (geo.api.gouv.fr)"},
        ],
    }))
    return fichiers


if __name__ == "__main__":
    print(f"Export JSON pour l'application web : {WEB_DATA}")
    exporter_web(hors_ligne="--hors-ligne" in sys.argv)
