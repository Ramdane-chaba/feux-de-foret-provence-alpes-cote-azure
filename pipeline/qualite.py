"""Barrière de qualité : chaque règle a un sélecteur (portée), un prédicat, un seuil et une sévérité.

Deux moments :
- « extraction » : juste après bronze (schéma des fichiers, volumes) ;
- « modele »     : après silver et gold (clés, niveaux, orphelins, complétude, D016).

Une règle « block » qui échoue arrête le pipeline (EchecBloquant). Une règle « warn » est signalée.
Le rapport docs/qualite/rapport-qualite.md est écrit à chaque exécution, même en cas d'arrêt.
"""

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import duckdb

from pipeline.config import PACA


class EchecBloquant(Exception):
    pass


@dataclass
class Regle:
    moment: str  # extraction | modele
    nom: str
    portee: str  # sélecteur : table et lignes concernées
    requete: str  # prédicat : renvoie un nombre
    operateur: str  # = | <= | >=
    seuil: int | float
    severite: str  # block | warn
    decision_ok: str = "accepté"
    decision_ko: str = ""
    requiert: str | None = None  # table qui doit être non vide pour que la règle soit évaluable


@dataclass
class Resultat:
    regle: Regle
    valeur: float | None
    statut: str  # ok | echec | non evaluable

    @property
    def decision(self) -> str:
        if self.statut == "ok":
            return self.regle.decision_ok
        if self.statut == "non evaluable":
            return "non évaluable (source absente) : à relancer après dépôt"
        if self.regle.decision_ko:
            return self.regle.decision_ko
        return "pipeline arrêté" if self.regle.severite == "block" else "signalé, le pipeline continue"


# --- Règles ---------------------------------------------------------------------------------------

def schema(table: str, colonnes: list[str], requiert: str | None = None) -> list[Regle]:
    liste = ", ".join("'" + c.replace("'", "''") + "'" for c in colonnes)
    remplies = " + ".join(f'(count("{c}") = 0)::INT' for c in colonnes)
    return [
        Regle(
            "extraction",
            f"Schéma : colonnes attendues présentes ({len(colonnes)})",
            f"bronze.{table} : {', '.join(colonnes)}",
            f"SELECT count(*) FROM unnest([{liste}]) AS t(colonne) WHERE colonne NOT IN "
            f"(SELECT column_name FROM information_schema.columns WHERE table_schema = 'bronze' AND table_name = '{table}')",
            "=", 0, "block", requiert=requiert,
        ),
        Regle(
            "extraction",
            "Schéma : colonnes attendues renseignées dans chaque fichier",
            f"bronze.{table}, par _fichier_source",
            f"SELECT coalesce(sum(manques), 0) FROM (SELECT {remplies} AS manques FROM bronze.{table} GROUP BY _fichier_source)",
            "=", 0, "block", requiert=requiert,
        ),
        Regle(
            "extraction",
            "Schéma : toutes les colonnes source en texte (aucun typage en bronze)",
            f"bronze.{table}",
            f"SELECT count(*) FROM information_schema.columns WHERE table_schema = 'bronze' AND table_name = '{table}' "
            "AND NOT starts_with(column_name, '_') AND data_type <> 'VARCHAR'",
            "=", 0, "block", requiert=requiert,
        ),
    ]


def unicite(table: str, cle: str, requiert: str | None = None) -> Regle:
    return Regle(
        "modele", f"Unicité de la clé ({cle})", f"silver.{table}",
        f"SELECT count(*) - count(DISTINCT ({cle})) FROM silver.{table}",
        "=", 0, "block", requiert=requiert,
    )


def orphelins(table: str, condition: str = "code_dep IS NOT NULL", requiert: str | None = None) -> Regle:
    return Regle(
        "modele", "Orphelins : code département absent de dim_departement", f"silver.{table} ({condition})",
        f"SELECT count(*) FROM silver.{table} WHERE {condition} "
        "AND code_dep NOT IN (SELECT code_dep FROM silver.dim_departement)",
        "=", 0, "block", requiert=requiert,
    )


PACA_SQL = ", ".join(f"'{d}'" for d in PACA)

REGLES: list[Regle] = [
    # Schéma, juste après l'extraction
    *schema("meteo_des_forets", ["date", "num_dep", "niveau_j1", "niveau_j2"]),
    Regle(
        "extraction", "Schéma : nom du département présent (nom_dep ou dep_nom) dans chaque fichier",
        "bronze.meteo_des_forets, par _fichier_source",
        "SELECT count(*) FROM (SELECT _fichier_source FROM bronze.meteo_des_forets GROUP BY 1 "
        "HAVING count(coalesce(nom_dep, dep_nom)) = 0)",
        "=", 0, "block",
    ),
    *schema("climato_rr_t_vent", ["NUM_POSTE", "NOM_USUEL", "LAT", "LON", "ALTI", "AAAAMMJJ",
                                  "RR", "QRR", "TX", "QTX", "FFM", "QFFM", "FXI3S", "QFXI3S"]),
    *schema("climato_autres_parametres", ["NUM_POSTE", "AAAAMMJJ", "UN", "QUN"]),
    *schema("interventions", ["Année", "Numéro", "Département"]),
    *schema("bdiff", ["Année", "Numéro", "Département", "Code INSEE", "Nom de la commune",
                      "Date de première alerte", "Surface parcourue (m2)", "Surface forêt (m2)",
                      "Surface maquis garrigues (m2)", "Précision des surfaces", "Nature"], requiert="bronze.bdiff"),
    # Volumes contre les fiches (block sur la Météo des forêts, warn ailleurs)
    Regle("extraction", "Volume : Météo des forêts, total", "bronze.meteo_des_forets",
          "SELECT count(*) FROM bronze.meteo_des_forets", "=", 35_616, "block"),
    Regle("extraction", "Volume : Météo des forêts, Bouches-du-Rhône", "bronze.meteo_des_forets, num_dep = '13'",
          "SELECT count(*) FROM bronze.meteo_des_forets WHERE num_dep = '13'", "=", 371, "block"),
    Regle("extraction", "Volume : climatologie 13, RR-T-Vent 1950-2024", "bronze.climato_rr_t_vent, fichier Q_13 1950-2024",
          "SELECT count(*) FROM bronze.climato_rr_t_vent WHERE _fichier_source = 'Q_13_previous-1950-2024_RR-T-Vent.csv.gz'",
          "=", 1_197_064, "warn"),
    Regle("extraction", "Volume : interventions 2024", "bronze.interventions, Année = '2024'",
          "SELECT count(*) FROM bronze.interventions WHERE \"Année\" = '2024'", "=", 99, "warn"),
    Regle("modele", "Volume : feux en PACA de 2006 à 2025", "silver.fait_feu, PACA, 2006-2025",
          f"SELECT count(*) FROM silver.fait_feu WHERE code_dep IN ({PACA_SQL}) AND annee BETWEEN 2006 AND 2025",
          "=", 10_789, "warn", requiert="silver.fait_feu"),
    # Clés, niveaux, orphelins
    unicite("fait_niveau_danger", "code_dep, jour_danger"),
    unicite("fait_meteo_jour", "num_poste, jour"),
    unicite("fait_interventions_an", "annee, code_service"),
    unicite("fait_feu", "annee, numero", requiert="silver.fait_feu"),
    Regle("modele", "Niveau de danger entre 1 et 4", "silver.fait_niveau_danger",
          "SELECT count(*) FROM silver.fait_niveau_danger WHERE niveau NOT BETWEEN 1 AND 4", "=", 0, "block"),
    Regle("modele", "D016 : aucune diffusion après 22 h UTC", "silver.fait_niveau_danger",
          "SELECT count(*) FROM silver.fait_niveau_danger WHERE hour(diffusion_utc) >= 22", "=", 0, "block"),
    orphelins("fait_niveau_danger"),
    orphelins("fait_feu", requiert="silver.fait_feu"),
    orphelins("dim_station"),
    orphelins("dim_service"),
    orphelins("dim_commune", requiert="silver.dim_commune"),
    Regle("modele", "Feux sans jour d'alerte", "silver.fait_feu",
          "SELECT count(*) FROM silver.fait_feu WHERE jour_alerte IS NULL", "=", 0, "block", requiert="silver.fait_feu"),
    # Complétude par référentiel
    Regle("modele", "Complétude : chaque département de PACA présent chaque jour de chaque saison",
          "silver.fait_niveau_danger × jours de bulletin × 6 départements de PACA",
          f"""SELECT count(*) FROM (SELECT DISTINCT jour_danger FROM silver.fait_niveau_danger) j
              CROSS JOIN (SELECT unnest([{PACA_SQL}]) AS code_dep) d
              WHERE NOT EXISTS (SELECT 1 FROM silver.fait_niveau_danger n
                                WHERE n.jour_danger = j.jour_danger AND n.code_dep = d.code_dep)""",
          "=", 0, "block"),
    Regle("modele", "Complétude : chaque département de PACA présent chaque année dans la BDIFF",
          "silver.fait_feu × années 2006-2025 × 6 départements de PACA",
          f"""SELECT count(*) FROM range(2006, 2026) a(annee)
              CROSS JOIN (SELECT unnest([{PACA_SQL}]) AS code_dep) d
              WHERE NOT EXISTS (SELECT 1 FROM silver.fait_feu f WHERE f.annee = a.annee AND f.code_dep = d.code_dep)""",
          "=", 0, "warn", requiert="silver.fait_feu"),
    # Compteurs signalés (warn)
    Regle("modele", "Manquants déguisés : « N.C. » dans Feux de végétations", "silver.fait_interventions_an",
          "SELECT count(*) FROM silver.fait_interventions_an WHERE feux_vegetation_nc", "=", 0, "warn",
          decision_ko="valeur mise à NULL, ligne gardée"),
    Regle("modele", "Valeurs climatologiques douteuses (code qualité 2)", "silver.fait_meteo_jour",
          "SELECT count(*) FROM silver.fait_meteo_jour WHERE a_valeur_douteuse", "=", 0, "warn",
          decision_ko="valeurs mises à NULL, lignes gardées"),
    Regle("modele", "Chute de plus de 30 % du nombre de stations d'un jour à l'autre",
          "gold.mart_jour_departement, jours couverts par la climatologie",
          """WITH t AS (SELECT code_dep, jour, nb_stations,
                               lag(nb_stations) OVER (PARTITION BY code_dep ORDER BY jour) AS veille
                        FROM gold.mart_jour_departement
                        WHERE jour <= (SELECT max(jour) FROM silver.fait_meteo_jour))
             SELECT count(*) FROM t WHERE veille > 0 AND nb_stations < 0.7 * veille""",
          "=", 0, "warn"),
    *[
        Regle("modele", f"Lignes en file de rejet ({source})", f"silver.rejet_{source}",
              f"SELECT count(*) FROM silver.rejet_{source}", "=", 0, "warn",
              decision_ko="lignes gardées en file de rejet, à examiner")
        for source in ("meteo_des_forets", "climatologie", "interventions", "bdiff")
    ],
]


# --- Exécution ------------------------------------------------------------------------------------

def table_non_vide(con: duckdb.DuckDBPyConnection, nom: str) -> bool:
    schema_, table = nom.split(".")
    existe = con.execute(
        "SELECT count(*) FROM duckdb_tables() WHERE schema_name = ? AND table_name = ?", [schema_, table]
    ).fetchone()[0]
    return bool(existe) and con.execute(f"SELECT count(*) FROM {nom}").fetchone()[0] > 0


def verifier(regle: Regle, valeur: float) -> bool:
    return {"=": valeur == regle.seuil, "<=": valeur <= regle.seuil, ">=": valeur >= regle.seuil}[regle.operateur]


def evaluer(con: duckdb.DuckDBPyConnection, moment: str) -> list[Resultat]:
    resultats = []
    for regle in (r for r in REGLES if r.moment == moment):
        if regle.requiert and not table_non_vide(con, regle.requiert):
            resultats.append(Resultat(regle, None, "non evaluable"))
            continue
        try:
            valeur = con.execute(regle.requete).fetchone()[0]
        except duckdb.Error as erreur:  # ex. colonne absente : la règle échoue, elle ne plante pas
            print(f"  erreur SQL pour « {regle.nom} » : {erreur}")
            resultats.append(Resultat(regle, None, "echec"))
            continue
        resultats.append(Resultat(regle, valeur, "ok" if verifier(regle, valeur) else "echec"))
    return resultats


def barriere(con: duckdb.DuckDBPyConnection, moment: str, resultats: list[Resultat]) -> None:
    """Évalue les règles du moment, les ajoute à `resultats`, lève EchecBloquant si une règle block échoue."""
    nouveaux = evaluer(con, moment)
    resultats.extend(nouveaux)
    for r in nouveaux:
        if r.statut != "ok":
            print(f"  [{r.regle.severite}] {r.statut} : {r.regle.nom} ({r.regle.portee}) = {r.valeur}")
    bloquants = [r for r in nouveaux if r.statut == "echec" and r.regle.severite == "block"]
    if bloquants:
        raise EchecBloquant("; ".join(f"{r.regle.nom} = {r.valeur}" for r in bloquants))


# --- Rapport --------------------------------------------------------------------------------------

AFFIRMER = """## Ce que les indicateurs peuvent et ne peuvent pas affirmer

**Ils peuvent affirmer :**
- combien de jours chaque seuil (2, 3 ou 4) aurait déclenché le dispositif renforcé en 2024 et en 2025, par département : c'est le coût du seuil en **jours de renfort** (Q4, D013) ;
- une fois l'export BDIFF chargé, combien de ces jours ont connu au moins un feu, combien ont été des fausses alertes, et combien de feux (et de jours avec feu) sont partis sous le seuil ;
- la même chose pour le 13 et pour chaque autre département, sur les mêmes jours et avec la même règle de jointure (D016), donc de façon comparable (Q5) ;
- des volumes annuels d'interventions « Feux de végétations » par service, pour les années où la colonne existe.

**Ils ne peuvent pas affirmer :**
- **qu'un seuil est le bon** : deux saisons seulement (240 jours de bulletin pour le 13) et 10 jours de niveau 4 dans le 13 ; une différence entre seuils peut venir d'une saison particulière (D012) ;
- **un coût en euros** : le coût d'une journée de renfort, le budget et le seuil actuel sont inconnus (D013) ;
- **qu'un niveau a causé un feu** : on compare la prévision de la veille (`niveau_j1`) et la première alerte, pas l'heure réelle de départ (D011, D016) ;
- **un résultat « hors Marseille » pour la Météo des forêts** : le périmètre hors Marseille retire les feux de Marseille, mais le niveau de danger reste celui de tout le département (D005) ;
- **un niveau de danger hors saison** : sans bulletin, le niveau est inconnu, pas faible ;
- **un nombre de feux de forêt à partir des interventions** : « Feux de végétations » compte des interventions, pas des feux, et n'est pas comparable à la BDIFF ;
- **une météo représentative des autres départements** tant que la climatologie n'est chargée que pour le 13 (variable `CLIMATO_DEPARTEMENTS`).
"""


def formater(valeur: float | None) -> str:
    if valeur is None:
        return "—"
    if isinstance(valeur, float) and not valeur.is_integer():
        return f"{valeur:,.2f}".replace(",", " ")
    return f"{int(valeur):,}".replace(",", " ")


def ecrire_rapport(
    con: duckdb.DuckDBPyConnection, resultats: list[Resultat], chemin: Path, run_id: str, arret: str | None
) -> None:
    lignes = [
        "# Rapport de qualité",
        "",
        f"Généré par `pipeline/qualite.py` le {datetime.now():%Y-%m-%d %H:%M}, exécution `{run_id}`. "
        "Ne pas modifier à la main : relancer `uv run python -m pipeline.construire`.",
        "",
        f"**Résultat : {'ARRÊT — ' + arret if arret else 'aucune règle bloquante en échec'}.** "
        f"{sum(r.statut == 'ok' for r in resultats)} règles respectées, "
        f"{sum(r.statut == 'echec' for r in resultats)} en échec, "
        f"{sum(r.statut == 'non evaluable' for r in resultats)} non évaluables.",
        "",
        "## Règles",
        "",
        "| Règle | Portée | Seuil | Résultat | Sévérité | Décision |",
        "|---|---|---|---|---|---|",
    ]
    for r in resultats:
        resultat = {"ok": "✅", "echec": "❌", "non evaluable": "⏸"}[r.statut] + " " + formater(r.valeur)
        lignes.append(
            f"| {r.regle.nom} | {r.regle.portee} | {r.regle.operateur} {formater(r.regle.seuil)} "
            f"| {resultat} | {r.regle.severite} | {r.decision} |"
        )
    lignes += ["", "## Compteurs", ""]
    compteurs = [r for r in resultats if r.regle.severite == "warn" and r.regle.moment == "modele" and r.valeur is not None
                 and not r.regle.nom.startswith(("Volume", "Complétude"))]
    for r in compteurs:
        lignes.append(f"- {r.regle.nom} : **{formater(r.valeur)}**")
        if "N.C." in r.regle.nom and r.valeur:
            detail = con.execute(
                "SELECT string_agg(annee || ' service ' || code_service, ', ' ORDER BY annee) "
                "FROM silver.fait_interventions_an WHERE feux_vegetation_nc"
            ).fetchone()[0]
            lignes.append(f"  (lignes : {detail})")
    lignes += [
        "",
        "## Limites connues",
        "",
        "- **BDIFF** : export manuel (formulaire du site). Sans export dans `data/raw/bdiff/`, les tables de feux sont vides, "
        "les colonnes de feux de `gold` sont NULL (jamais 0) et les règles qui en dépendent sont « non évaluables ». "
        "Les noms de colonnes BDIFF viennent de la fiche, non vérifiés sur un fichier.",
        "- **Périmètre hors Marseille ([D005](../decisions.md))** : `mart_seuil` existe pour tout le département et sans Marseille. "
        "Sans Marseille, seuls les feux changent ; le niveau de la Météo des forêts reste celui de tout le département.",
        "- **Saison 2026** : la Météo des forêts la couvre, la BDIFF non : l'analyse du seuil porte sur 2024-2025 (D012).",
        "- **Seuil actuel et coût d'une journée de renfort** : inconnus (D013) ; les seuils sont exprimés en jours.",
        "",
        AFFIRMER,
    ]
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_text("\n".join(lignes), encoding="utf-8")
