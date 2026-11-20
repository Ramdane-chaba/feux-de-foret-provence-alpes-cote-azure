"""Télécharge les fichiers sources dans data/raw/.

Les URL de la climatologie et des interventions sont lues dans l'API de data.gouv.fr
(jamais écrites en dur). Un fichier déjà présent n'est pas retéléchargé.
La BDIFF ne se télécharge pas : le site impose un formulaire (dépôt manuel dans data/raw/bdiff/).
"""

import json
import re
import urllib.request
from pathlib import Path

from pipeline.config import (
    CLIMATO_GROUPES,
    CLIMATO_PERIODES,
    CONTOURS_URL,
    DEPARTEMENT_SDIS,
    DEPARTEMENTS_CLIMATO,
    MDF_ANNEES,
)
from pipeline.chemins import DATA_RAW

API_DATASET = "https://www.data.gouv.fr/api/1/datasets/{id}/"
MDF_DATASET = "692f01d38fef6c5815d9262a"
CLIMATO_DATASET = "6569b51ae64326786e4e8e1a"
INTERVENTIONS_DATASET = "53699736a3a729239d204c29"


def ressources(dataset_id: str) -> list[dict]:
    with urllib.request.urlopen(API_DATASET.format(id=dataset_id), timeout=60) as reponse:
        return json.load(reponse)["resources"]


def telecharger(url: str, cible: Path) -> None:
    if cible.exists():
        print(f"  déjà présent : {cible.name}")
        return
    cible.parent.mkdir(parents=True, exist_ok=True)
    partiel = cible.with_suffix(cible.suffix + ".part")
    urllib.request.urlretrieve(url, partiel)
    partiel.replace(cible)
    print(f"  téléchargé : {cible.name}")


def telecharger_mdf() -> None:
    print("Météo des forêts")
    titres = {r["title"]: r["url"] for r in ressources(MDF_DATASET)}
    for annee in MDF_ANNEES:
        url = titres[f"mdf.{annee}"]
        telecharger(url, DATA_RAW / "meteo-des-forets" / Path(url).name)


def telecharger_climato(departements: list[str] = DEPARTEMENTS_CLIMATO) -> None:
    print("Données climatologiques quotidiennes")
    titres = {r["title"]: r["url"] for r in ressources(CLIMATO_DATASET)}
    for dep in departements:
        for periode in CLIMATO_PERIODES:
            for groupe in CLIMATO_GROUPES:
                titre = f"QUOT_departement_{dep}_periode_{periode}_{groupe}"
                if titre not in titres:
                    raise KeyError(f"ressource absente de data.gouv : {titre}")
                url = titres[titre]
                telecharger(url, DATA_RAW / "climatologie" / Path(url).name)


def telecharger_interventions() -> None:
    print("Interventions SDIS")
    for r in ressources(INTERVENTIONS_DATASET):
        # Titres « interventions-SIS-2024 » ou « Interventions-SIS-2013 ».
        # Les noms de fichier ne sont pas uniques (2012 et 2013 : interventions.csv) : on nomme par l'année du titre.
        trouve = re.fullmatch(r"interventions-SIS-(\d{4})", r["title"], flags=re.IGNORECASE)
        if trouve:
            telecharger(r["url"], DATA_RAW / "interventions" / f"interventions_{trouve.group(1)}.csv")


def telecharger_contours(dep: str = DEPARTEMENT_SDIS) -> Path:
    """Contours des communes du département (GeoJSON), pour la carte de l'application web.

    N'est pas appelé par main() : le pipeline de données n'en a pas besoin (pipeline/exporter_web.py l'appelle).
    """
    cible = DATA_RAW / "geo" / f"communes_{dep}.geojson"
    telecharger(CONTOURS_URL.format(dep=dep), cible)
    return cible


def main() -> None:
    telecharger_mdf()
    telecharger_climato()
    telecharger_interventions()
    bdiff = DATA_RAW / "bdiff"
    if not any(bdiff.glob("*.zip")) and not any(bdiff.glob("*.csv")):
        print(f"BDIFF : aucun export dans {bdiff} (téléchargement manuel sur bdiff.agriculture.gouv.fr)")


if __name__ == "__main__":
    main()
