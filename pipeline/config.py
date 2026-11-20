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

# --- Application web (pipeline/exporter_web.py) ---
# Paramètres des indicateurs, repris de kpi/02_fiches_indicateurs.md. Ils sont écrits dans les JSON :
# l'application ne contient aucun de ces chiffres en dur.
DEPARTEMENT_SDIS = "13"
SAISONS_CROISEES = (2024, 2025)      # saisons où la Météo des forêts et la BDIFF se croisent (D012)
SEUIL_REFERENCE = 3                  # seuil pris comme exemple : le seuil actuel est inconnu (D013)
SEUILS = (2, 3, 4)
GRAND_FEU_HA = 1.0                   # I1 : un « grand feu » dépasse 1 ha
PLAGE_PATROUILLE = (12, 20)          # I2 : alertes de 12 h à 20 h (exemple, plages réelles inconnues)
# Contours des communes : API Découpage administratif (geo.api.gouv.fr), licence ouverte.
CONTOURS_URL = "https://geo.api.gouv.fr/departements/{dep}/communes?format=geojson&geometry=contour&fields=code,nom"
CONTOURS_TOLERANCE_DEG = 0.0006      # simplification des contours (environ 60 m) : fichier 10 fois plus léger
