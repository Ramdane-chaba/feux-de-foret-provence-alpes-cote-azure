# Feux de forêt – Provence-Alpes-Côte d'Azur

Projet UE01 – Stratégie business data-driven, module Modélisation et pipeline de données (HETIC 2026-2027).

Réponse à la commande de la direction du **SDIS 13 (Bouches-du-Rhône)** : saison feux 2027.

- **Arbitrage 1** : où concentrer les moyens humains et financiers pour lutter contre les départs de feu ?
- **Arbitrage 2** : à partir de quel niveau de la Météo des forêts déclencher le dispositif renforcé (patrouilles, guet, etc.) ?
- **Comparaison attendue** : le département, les autres départements de la région PACA et le reste du territoire national.
- **Échéance** : 11 décembre 2026.

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
| `docs/analyse/` | Analyses individuelles de la commande (`commande-prenom-nom.md`) |
| `docs/sources/` | Fiches d'identité des sources, inventaire, matrice questions × sources |
| `docs/glossaire.md` | Glossaire du projet |
| `docs/decisions.md` | Journal des décisions |

## Conventions de travail

- Une branche par ticket, des commits atomiques depuis son propre compte.
- Toute modification passe par une pull request relue par le responsable du rôle concerné.
- Messages de commit au format `type(périmètre): description`, par exemple `docs(sources): ajouter la fiche de la BDIFF`.
