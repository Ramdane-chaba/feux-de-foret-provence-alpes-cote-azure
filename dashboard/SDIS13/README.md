# Tableau de bord SDIS 13 (projet Power BI)

Ouvrir `SDIS13.pbip` dans Power BI Desktop, cliquer sur **Actualiser**, puis appliquer le thème :
Afficher > Thèmes > Parcourir les thèmes > `theme-sdis13.json`.

Les données viennent de `data\exports\` du dépôt, produites par `python -m uv run python -m pipeline.construire`.
Si le dépôt est ailleurs : Transformer les données > Paramètres de la source de données > Modifier la source.

## Modèle en étoile

| Table | Type | Une ligne = | Relations |
|---|---|---|---|
| `fait_feu_enrichi` | Faits | un départ de feu, avec le niveau de danger du jour | → Calendrier (jour), → Departements (code_dep) |
| `mart_jour_departement` | Faits | un département × un jour : niveau, feux, météo | → Calendrier (jour), → Departements (code_dep) |
| `mart_seuil` | Faits (agrégé) | un département × une saison × un seuil | → Departements (code_dep) |
| `Calendrier` | Dimension | un jour, 2006-2026 (table calculée) | |
| `Departements` | Dimension | un département : code, nom, PACA | |

## Pages

1. Synthèse · 2. Indicateurs · 3. Le seuil · 4. Météo des feux manqués · 5. Où et quand · 6. Comparaison PACA · 7. Explorer

Les mesures des pages 1 à 5 sont figées sur le département 13 et, pour le croisement avec l'indice, sur les saisons 2024 et 2025.
Les pages 6 et 7 utilisent les dimensions et réagissent aux segments.

## Valeurs de contrôle (13, 2024-2025)

| Mesure | Valeur |
|---|---|
| I3 Part feux couverts N3 | 49,9 % |
| Jours de renfort N3 | 78 |
| Part fausses alertes N3 | 15,4 % |
| Part feux hors période indice | 27,4 % |
| I2 Part alertes plages patrouille | 63,8 % |
| I1 Part grands feux prioritaires | 6,6 % |
| I1 Garde-fou autres communes | 3,8 % |
| Feux 13 2025 / moyenne 2015-2024 | 264 / 259 |
