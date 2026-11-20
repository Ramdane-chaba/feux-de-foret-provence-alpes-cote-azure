# Feux de forêt – Provence-Alpes-Côte d'Azur

Projet UE01 – Stratégie business data-driven, module Modélisation et pipeline de données (HETIC 2026-2027).

Réponse à la commande de la direction du **SDIS 13 (Bouches-du-Rhône)** : saison feux 2027.

- **Arbitrage 1** : où concentrer les moyens humains et financiers pour lutter contre les départs de feu ?
- **Arbitrage 2** : à partir de quel niveau de la Météo des forêts déclencher le dispositif renforcé (patrouilles, guet, etc.) ?
- **Comparaison attendue** : le département, les autres départements de la région PACA et le reste du territoire national.
- **Échéance** : 11 décembre 2026.

## Voir les résultats

- **Application publiée** : [sdis13-feux-2027.netlify.app](https://sdis13-feux-2027.netlify.app/). Elle contient un récit en cinq étapes, un simulateur de seuil et de budget, une carte des communes, un calendrier des saisons et une synthèse imprimable. Rien à installer : les données sont déjà chargées.
- **Recommandation au SDIS 13** : [`docs/recommandation.md`](docs/recommandation.md). Elle donne le seuil de déclenchement, le budget en jours de renfort, les communes et les heures à renforcer, la comparaison avec PACA et la France, et les limites.
- **Indicateurs** : [`kpi/02_fiches_indicateurs.md`](kpi/02_fiches_indicateurs.md) pour I1, I2 et I3, à partir des objectifs SMART de [`kpi/01_objectifs.md`](kpi/01_objectifs.md).

## Reconstruire les données

Prérequis : [`uv`](https://docs.astral.sh/uv/), et l'export BDIFF téléchargé à la main sur [bdiff.agriculture.gouv.fr](https://bdiff.agriculture.gouv.fr/incendies) puis déposé dans `data/raw/bdiff/`. Le détail est dans [`docs/pipeline.md`](docs/pipeline.md).

```
uv run python -m pipeline.construire   # télécharge les autres sources, construit la base et les exports
uv run pytest                          # lance les tests
```

Pour lancer l'application en local (Node 20 ou plus), voir [`dashboard/web/README.md`](dashboard/web/README.md).

## Rôles

| Membre | Rôle | Responsable de |
|---|---|---|
| Ramdane CHABA | Chef de projet et responsable sources | Dépôt, tickets, checkpoints, journal des décisions ; inventaire, fiches d'identité, matrice questions × sources |
| Ghiles MEKDAM | Responsable qualité et conformité | Règles de qualité, tests, données personnelles |
| Ouissem AOUIMEUR | Responsable pipeline et modèle | Chargement, consolidation, entrepôt |

À trois, le rôle de responsable sources est cumulé avec celui de chef de projet, comme le prévoit l'énoncé.
Un rôle confie la responsabilité d'un domaine (relecture et validation des tickets qui en relèvent) ; il ne limite pas le travail de chacun à ce domaine.
Tout changement de rôle est consigné et expliqué dans [`docs/decisions.md`](docs/decisions.md).

## Organisation du dépôt

| Dossier / fichier | Contenu |
|---|---|
| `docs/recommandation.md` | Recommandation au SDIS 13 pour la saison 2027 |
| `docs/analyse/` | Analyses individuelles de la commande (`commande-prenom-nom.md`) |
| `docs/sources/` | Fiches d'identité des sources, inventaire, matrice questions × sources |
| `docs/modele-donnees.md` | Modèle de données (schéma en étoile) et choix de la stack |
| `docs/pipeline.md` | Lancement du pipeline, couches bronze, silver et gold, lineage, export, limites |
| `docs/qualite/` | Rapport de qualité généré par le pipeline |
| `docs/glossaire.md` | Glossaire du projet |
| `docs/decisions.md` | Journal des décisions |
| `kpi/` | Diagnostic stratégique, objectifs SMART de chaque membre, fiches d'indicateurs |
| `pipeline/` | Code Python du pipeline : téléchargement, chargement, contrôles de qualité, exports |
| `sql/` | Transformations SQL des couches bronze, silver et gold |
| `tests/` | Tests `pytest` du pipeline, des exports et des indicateurs |
| `dashboard/web/` | Application web (React), publiée sur [sdis13-feux-2027.netlify.app](https://sdis13-feux-2027.netlify.app/) |
| `dashboard/SDIS13/` | Tableau de bord Power BI (projet `.pbip`) |
| `powerbi/` | Rapport Power BI sur les exports Parquet (projet `.pbip`) |
| `data/` | Données téléchargées et reconstruites (non versionnées) |

## Conventions de travail

- Une branche par ticket, des commits atomiques depuis son propre compte.
- Toute modification passe par une pull request relue par le responsable du rôle concerné.
- Messages de commit au format `type(périmètre): description`, par exemple `docs(sources): ajouter la fiche de la BDIFF`.
