# Application web SDIS 13 – saison feux 2027

Application de soutenance : un récit en cinq étapes, un simulateur de seuil, une carte animée, un calendrier des saisons et une synthèse imprimable. Elle complète le rapport Power BI (`dashboard/SDIS13/`) et lit les mêmes tables gold.

## Lancer

Prérequis : Node 20 ou plus, et les fichiers Parquet de `data/exports/` (produits par `uv run python -m pipeline.construire`).

```
cd dashboard/web
npm install
npm run donnees     # écrit les JSON dans public/data/ (télécharge le fond de carte s'il manque)
npm run dev         # http://localhost:5173
```

| Commande | Effet |
|---|---|
| `npm run donnees` | `uv run python -m pipeline.exporter_web` : les JSON de `public/data/` |
| `npm run dev` | serveur de développement |
| `npm run build` | vérifie les types puis construit `dist/` (site statique, chemins relatifs) |
| `npm run preview` | sert `dist/` |
| `npm run test` | tests de la logique du simulateur |

`public/data/` n'est pas versionné, comme le reste des données du dépôt : on le reconstruit avec `npm run donnees`.

## D'où viennent les chiffres

```
data/exports/*.parquet ──► pipeline/exporter_web.py ──► dashboard/web/public/data/*.json ──► pages
```

Aucun chiffre issu des données n'est écrit dans les composants. Les paramètres des indicateurs (seuil de référence, plage de patrouille, surface d'un grand feu) sont dans `pipeline/config.py` et recopiés dans les JSON. `src/constantes.ts` ne contient que des réglages d'affichage et la position de départ du curseur de budget.

| Fichier | Page | Contenu |
|---|---|---|
| `accueil.json` | Ouverture | les trois chiffres : feux 2024-2025, feux couverts au seuil de référence, jours de renfort |
| `recit.json` | Récit | feux et pluie par année, feux par commune hors Marseille |
| `seuils.json` | Récit, Simulateur, Synthèse | une ligne par périmètre × saison × seuil (`gold.mart_seuil` + feux de la période) |
| `jours.json` | Récit, Simulateur, Calendrier | un jour de bulletin par ligne : niveau, feux, météo |
| `carte.json` | Carte | par commune : feux et hectares par année, feux par mois et par heure |
| `communes-13.geojson` | Carte | contours simplifiés des communes (API Découpage administratif) |
| `synthese.json` | Récit, Synthèse | indicateurs I1 et I2, feux par heure |
| `glossaire.json` | partout | les entrées de `docs/glossaire.md` |
| `meta.json` | Ouverture, Carte, Synthèse | date de l'export, sources |

`tests/test_export_web.py` vérifie que les valeurs des fiches d'indicateurs se retrouvent dans les JSON, et que les cinq affirmations du récit sont vraies dans les données. Si un nouvel export rend une affirmation fausse, le test échoue : il faut alors réécrire le titre de l'étape dans `src/pages/Recit.tsx`.

## Organisation du code

| Dossier | Contenu |
|---|---|
| `src/types/donnees.ts` | types des JSON (TypeScript strict) |
| `src/lib/` | chargement à la demande avec cache (`donnees.ts`), logique du simulateur testée (`simulateur.ts`), formats français, statistiques, export PNG |
| `src/components/` | briques réutilisables : `KpiCard`, `ChartCard`, `SectionTitle`, `Legende`, états de chargement et d'erreur (`Briques.tsx`), infobulle, glossaire (`Terme`), mode présentation, braises et compteur |
| `src/charts/` | graphiques SVG : `Barres`, `GrilleFeux`, `NuageMeteo`, `BarresBudget`, `CalendrierSaison`, `CarteCommunes` |
| `src/pages/` | une page par fichier, chargée à la demande |
| `src/styles/` | jetons et socle, composants, pages, impression |

## Fonctions

- **Mode présentation** (bouton en haut à droite) : plein écran, navigation cachée, flèches du clavier. Dans le récit, les flèches passent d'abord d'une étape à l'autre. Échap pour quitter.
- **Export** : bouton « PNG » sur chaque graphique ; « Télécharger en PDF » sur la synthèse (impression du navigateur, deux pages A4).
- **Glossaire** : le « ? » à côté d'un terme ouvre sa définition, lue dans `docs/glossaire.md`.
- **Accessibilité** : navigation au clavier, infobulles au focus, descriptions des graphiques pour les lecteurs d'écran, animations coupées avec `prefers-reduced-motion`.

## Choix à connaître

- **Seuil de référence : niveau 3.** Le seuil actuel du SDIS 13 est inconnu (D013) ; l'application le dit sur chaque page concernée.
- **« Tient dans le budget »** : un seuil tient s'il ne dépasse le budget dans aucune des saisons mesurées. Une moyenne masquerait la saison la plus chargée (19 jours en 2024, 59 en 2025 au niveau 3).
- **Année sèche** (récit, étape 1) : cumul de pluie sous la médiane des années mesurées. La pluie est la moyenne quotidienne des stations Météo-France du département, cumulée sur l'année.
- **Couleurs des niveaux** : vert, jaune, orange, rouge comme la Météo des forêts, ajustées pour rester distinctes pour les daltoniens ; le niveau est toujours écrit en plus de la couleur.
