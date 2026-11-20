"""Paramètres du pipeline."""

import os

MDF_ANNEES = (2024, 2025, 2026)

# Séparateur relevé dans la fiche de la Météo des forêts et vérifié à l'ouverture des fichiers.
MDF_SEPARATEURS = {
    "mdf_2024.csv.gz": ",",
    "mdf_2025.csv.gz": ",",
    "mdf_2026.csv.gz": ";",
}

# Départements dont on charge la climatologie : 13 par défaut.
# Pour PACA : variable d'environnement CLIMATO_DEPARTEMENTS=13,04,05,06,83,84
DEPARTEMENTS_CLIMATO = [
    d.strip() for d in os.environ.get("CLIMATO_DEPARTEMENTS", "13").split(",") if d.strip()
]
CLIMATO_PERIODES = ("1950-2024", "2025-2026")
CLIMATO_GROUPES = ("RR-T-Vent", "autres-parametres")

PACA = ("04", "05", "06", "13", "83", "84")
