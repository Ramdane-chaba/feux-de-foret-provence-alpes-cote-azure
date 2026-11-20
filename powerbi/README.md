# Rapport Power BI – SDIS 13, saison feux 2027

Dernière mise à jour : 2026-11-19

Le rapport lit les fichiers Parquet écrits par le pipeline dans `data/exports/` (voir [docs/pipeline.md](../docs/pipeline.md), section 6). Il est enregistré en projet Power BI (`.pbip`) : le modèle est en TMDL et le rapport en PBIR. Ce sont des fichiers texte, donc versionnés et relus comme le reste du dépôt.

```
powerbi/
├── SDIS13-Feux.pbip               ← le fichier à ouvrir dans Power BI Desktop
├── SDIS13-Feux.SemanticModel/     ← tables, relations et mesures (TMDL)
└── SDIS13-Feux.Report/            ← pages, visuels et thème (PBIR)
```

## Ouvrir le rapport

1. Construire les exports : `uv run python -m pipeline.construire` (avec l'export BDIFF dans `data/raw/bdiff/`). Vérifier que `data/exports/` contient `fait_feu_enrichi.parquet`, `mart_jour_departement.parquet` et `ref_communes_prioritaires.parquet`.
2. Copier le chemin complet du dossier, depuis la racine du dépôt :
   ```powershell
   (Resolve-Path data\exports).Path + "\"
   ```
3. Ouvrir `powerbi/SDIS13-Feux.pbip` dans Power BI Desktop.
4. *Accueil → Transformer les données → Modifier les paramètres* : coller le chemin dans `DossierExports` (il doit finir par `\`).
5. *Accueil → Actualiser*.

Si Power BI Desktop refuse d'ouvrir le fichier, activer dans *Fichier → Options et paramètres → Options → Fonctionnalités en préversion* les options sur le projet Power BI (.pbip), le format TMDL et le format PBIR, si elles y figurent, puis redémarrer.

Le chemin saisi à l'étape 4 est enregistré dans `SDIS13-Feux.SemanticModel/definition/expressions.tmdl`. Ce chemin est propre à chaque PC : ne pas committer ce changement.

## Les pages

| Page | Question | Contenu |
|---|---|---|
| Synthèse | toutes | I1, I2 et I3 aux valeurs des fiches, volumes, coût du seuil |
| Seuil (I3) | Q3, Q4 | segment N ; couverture par saison, coût en jours, jours sans feu, tableau d'arbitrage |
| Quand (I2) | Q2 | segments N, début et fin des patrouilles ; feux par heure dans et hors des plages |
| Où (I1) | Q1 | segment S ; garde-fou des autres communes, feux par commune, les 18 communes |
| Comparaison | Q5 | part des jours au niveau ≥ N dans chaque département ; feux et I3 dans les 6 départements de PACA |
| Méthode | — | sources, jointure D016, définitions, proxys et biais, limites |

Les pages Synthèse, Seuil, Quand et Où sont filtrées sur le 13 et les saisons 2024 et 2025 (filtres de page verrouillés). La page Comparaison est filtrée sur 2024 et 2025.

## Le modèle

| Table | Fichier | Rôle |
|---|---|---|
| `Feux` | `fait_feu_enrichi.parquet` | un feu par ligne, avec le niveau de danger de son jour : I1, I2, I3 |
| `Jours` | `mart_jour_departement.parquet` | un département par jour : jours de renfort, jours sans feu |
| `Communes prioritaires` | `ref_communes_prioritaires.parquet` | les 18 communes de l'objectif O1 |
| `Departement` | `mart_jour_departement.parquet` (un par code) | filtre commun à `Feux` et `Jours` |
| `Année` | 2006 à 2026 | filtre commun à `Feux` et `Jours` |
| `Seuil N`, `Début patrouille`, `Fin patrouille`, `Seuil surface` | tables de paramètres | valeurs proposées dans les segments |
| `Indicateurs` | — | les mesures |

`mart_seuil`, `mart_commune_annee` et `v_q2_quand` ne sont pas chargés : tout ce qu'ils contiennent se recalcule à partir de `Feux` et `Jours`. `mart_seuil` compte en plus chaque jour 6 fois (3 seuils × 2 périmètres), ce qui fausse toute somme faite sans filtre.

Sans choix dans un segment, les mesures prennent les valeurs des fiches : N = 3, patrouilles de 12 h à 20 h, S = 1 ha. Les filtres des mesures reprennent ceux de `tests/test_kpi_parquet.py`.

## Recette : les valeurs à retrouver

Après l'actualisation, la page Synthèse doit afficher les valeurs des fiches d'indicateurs, également vérifiées par `tests/test_kpi_parquet.py` :

| Carte | Valeur attendue |
|---|---|
| I1 | 6,6 % (16 feux de plus de 1 ha sur 242) |
| I2 | 63,8 % (113 alertes sur 177 feux) |
| I3 | 49,9 % (177 feux sur 355) |
| Départs de feu | 489 |
| Hors période de l'indice | 134 (27,4 %) |
| Jours de renfort | 78 (sur 240 jours avec bulletin) |
| Jours de renfort sans feu | 12 (15,4 %) |

Page Où : garde-fou des autres communes à 3,8 % (8 sur 208), concentration 2006-2025 autour de 51 %. Si une valeur diffère, le rapport ne doit pas être diffusé avant d'avoir trouvé pourquoi.

## Limites

- Les plages de patrouille, le seuil actuel et le coût d'une journée de renfort sont inconnus (D013) : les valeurs par défaut sont des exemples.
- Les feux ne sont chargés que pour PACA : pour les autres départements, la comparaison porte sur le niveau de danger seulement.
- Le fuseau horaire de l'heure de première alerte n'est pas vérifié (fiche I2).
