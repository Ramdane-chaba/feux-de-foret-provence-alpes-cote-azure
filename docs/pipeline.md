# Pipeline de données

Dernière mise à jour : 2026-11-20

Ce document explique comment reconstruire la base `data/sdis13.duckdb` à partir des sources, ce que contient chaque couche, et ce que le pipeline ne sait pas faire. Il met en œuvre le [modèle de données](modele-donnees.md) (branche `docs/modele-donnees`) et la pile de [D018](decisions.md) : Python 3.13, `uv`, DuckDB, `pytest`.

## 1. Lancer le pipeline

Prérequis : [`uv`](https://docs.astral.sh/uv/) dans le PATH. `uv` installe lui-même Python 3.13 et les dépendances.

```
uv run python -m pipeline.construire
```

Cette seule commande :

1. télécharge dans `data/raw/` ce qui manque (Météo des forêts, climatologie, interventions SDIS), en lisant les URL dans l'API de data.gouv.fr ;
2. charge bronze, contrôle le schéma et les volumes (barrière « extraction ») ;
3. construit silver puis gold ;
4. contrôle le modèle (barrière « modèle ») et écrit [`docs/qualite/rapport-qualite.md`](qualite/rapport-qualite.md) ;
5. exporte les tables gold en Parquet dans `data/exports/`, pour Power BI (section 6).

Elle se relance sans risque : toutes les tables sont recréées (`CREATE OR REPLACE`), sauf le journal de chargement, qui garde l'historique. Une reconstruction complète prend environ 45 secondes.

| Besoin | Commande |
|---|---|
| Reconstruire sans réseau (fichiers déjà présents) | `uv run python -m pipeline.construire --hors-ligne` |
| Télécharger seulement | `uv run python -m pipeline.telecharger` |
| Lancer les tests | `uv run pytest` |
| Charger la climatologie de toute la région PACA | `CLIMATO_DEPARTEMENTS=13,04,05,06,83,84`, puis la commande ci-dessus |

**BDIFF** : le site impose un formulaire, donc l'export se télécharge à la main sur [bdiff.agriculture.gouv.fr](https://bdiff.agriculture.gouv.fr/incendies) et se dépose dans `data/raw/bdiff/` (ZIP ou CSV). Sans export, le pipeline ne s'arrête pas : il le signale, crée des tables de feux vides et marque « non évaluables » les règles de qualité qui en dépendent.

Si une règle de qualité « block » échoue, le pipeline s'arrête avec un code de sortie 1 et le rapport indique la règle en cause.

## 2. Les trois couches

| Couche | Schéma DuckDB | Ce qu'on y fait | Ce qu'on n'y fait pas | Fichiers |
|---|---|---|---|---|
| Bronze | `bronze` | Copier chaque fichier tel qu'il arrive : toutes les valeurs en texte, noms de colonnes d'origine, plus `_fichier_source` et `_date_chargement` | Aucun typage, aucun renommage, aucun filtre | `pipeline/bronze.py`, `sql/bronze/` |
| Silver | `silver` | Typer, harmoniser (code département sur 2 caractères, `nom_dep`/`dep_nom`), appliquer les règles des fiches et des décisions, construire l'étoile (faits + dimensions), envoyer les lignes non conformes en file de rejet | Aucun calcul de taux ou de seuil | `sql/silver/` |
| Gold | `gold` | Compter, agréger, comparer les seuils : les tables qui répondent à Q1 à Q5 | Aucun nettoyage | `sql/gold/` |

Les fichiers SQL de chaque couche s'exécutent dans l'ordre de leur nom (`10_…`, `20_…`). Quand une source manque (BDIFF), le fichier du même nom dans `sql/silver/si_absent/` le remplace et crée des tables vides au même schéma.

### Correspondance avec le modèle de Ghiles

| Modèle (`modele-donnees.md`) | Ce pipeline | Différence |
|---|---|---|
| `data/raw/` | `data/raw/` + schéma `bronze` | Bronze ajoute une copie des fichiers bruts dans DuckDB, avec le journal de chargement : on peut contrôler le schéma et les volumes avant toute transformation |
| `staging` + `core` | `silver` | Le nettoyage (staging) et l'étoile (core) sont réunis dans une seule couche ; les files de rejet y sont ajoutées |
| `marts` | `gold` | Même contenu |

Cette architecture est proposée comme décision D019 dans la description de la PR.

## 3. Lineage : de la source à la table qui répond

```mermaid
flowchart LR
  subgraph Sources
    MDF[Météo des forêts<br/>mdf_2024-2026.csv.gz]
    CLI[Climatologie<br/>Q_13_*_RR-T-Vent<br/>Q_13_*_autres-parametres]
    INT[Interventions SDIS<br/>interventions_2008-2024.csv]
    BD[BDIFF<br/>export manuel]
  end
  subgraph Bronze
    bMDF[meteo_des_forets]
    bRR[climato_rr_t_vent]
    bAP[climato_autres_parametres]
    bINT[interventions]
    bBD[bdiff]
  end
  subgraph Silver
    fND[fait_niveau_danger]
    fMJ[fait_meteo_jour]
    dST[dim_station]
    fIA[fait_interventions_an]
    dSV[dim_service]
    fFE[fait_feu]
    dCO[dim_commune]
    dDE[dim_departement]
    dJO[dim_jour]
  end
  subgraph Gold
    mJD[mart_jour_departement]
    mSE[mart_seuil]
    mCA[mart_commune_annee]
    vQ2[v_q2_quand]
    rCP[ref_communes_prioritaires]
    fFE2[fait_feu_enrichi]
  end
  MDF --> bMDF --> fND
  CLI --> bRR --> fMJ
  CLI --> bAP --> fMJ
  bRR --> dST
  INT --> bINT --> fIA
  bINT --> dSV
  BD --> bBD --> fFE
  bBD --> dCO
  fND --> dDE
  dSV --> dDE
  dDE --> mJD
  dJO --> mJD
  fND --> mJD
  fFE --> mJD
  fMJ --> mJD
  dST --> mJD
  mJD --> mSE
  fFE --> mCA
  dCO --> mCA
  fFE --> vQ2
  fFE --> fFE2
  fND --> fFE2
  dCO --> fFE2
  rCP --> fFE2
```

| Table gold | Répond à | Construite à partir de |
|---|---|---|
| `mart_jour_departement` | Q3, Q4, Q5 | `dim_departement` × `dim_jour`, `fait_niveau_danger`, `fait_feu`, `fait_meteo_jour` + `dim_station` |
| `mart_seuil` | Q3, Q4, Q5 | `mart_jour_departement` (saisons 2024 et 2025) |
| `mart_commune_annee` | Q1 (D010) | `fait_feu`, `dim_commune` |
| `v_q2_quand` (vue) | Q2 (D011) | `fait_feu` |
| `fait_feu_enrichi` | Q1, Q2, Q3, Q4 : les indicateurs I1, I2 et I3, un feu par ligne | `fait_feu`, `fait_niveau_danger` (D016), `dim_commune`, `ref_communes_prioritaires` |
| `ref_communes_prioritaires` | Q1 : les 18 communes de l'objectif O1 | liste figée (codes INSEE) |

Les interventions (`fait_interventions_an`) servent directement la comparaison des volumes annuels de Q5 (D014), sans lien avec l'indice.

### Règles appliquées en silver

| Règle | Où | Origine |
|---|---|---|
| Code département sur 2 caractères (`1` → `01`, `2a` → `2A`) | macro `silver.code_dep` | modèle, fiches |
| Jour du danger = date de diffusion + 1 jour ; `niveau_j1` seulement | `20_meteo_des_forets.sql` | D016 |
| Valeur climatologique à NULL si son code qualité vaut 2 | macro `silver.mesure` | fiche climatologie |
| Rafale du jour = `FXI3S` | `30_climatologie.sql` | D017 |
| Station rattachée au département par les 2 premiers chiffres de `NUM_POSTE` | `dim_station` | modèle |
| Interventions mappées année par année (16, 70 ou 71 colonnes) ; « Feux de végétations » NULL (jamais 0) quand la colonne manque ou vaut `N.C.` | `silver.interventions_mapping` | fiche interventions, en-têtes réels |
| Nombres en texte (`3 142`, `1?403`) convertis en entiers | macro `silver.entier_texte` | fichiers réels |
| BMPM et BSPP sont des services, pas des départements | `dim_service` | D005, fiche interventions |
| BDIFF : clé `Année` + `Numéro`, doublons en file de rejet, m² → ha, `est_marseille` | `50_bdiff.sql` | fiche BDIFF, D005 |
| `dim_commune` préparée en SCD type 2 (`valide_du`, `valide_au`, `est_courant`) | `50_bdiff.sql` | cours (étoile historisée) |

Une ligne non conforme n'est jamais supprimée en silence : elle va dans `silver.rejet_<source>` avec son motif. Les tests vérifient que bronze = silver + rejets pour chaque source.

## 4. Journal de chargement

`bronze.journal_chargement` reçoit une ligne par fichier et par exécution :

| Colonne | Contenu |
|---|---|
| `run_id` | identifiant de l'exécution |
| `fichier` | nom du fichier (pour un ZIP BDIFF : `archive.zip/fichier.csv`) |
| `empreinte_sha256` | empreinte du fichier téléchargé : elle change si la source a été mise à jour |
| `taille_octets` | taille du fichier |
| `nb_lignes` | lignes chargées en bronze |
| `date_chargement` | date et heure de l'exécution |
| `statut` | `charge`, ou `absent` pour une BDIFF non déposée |

## 5. Qualité

Les règles sont dans `pipeline/qualite.py`. Chacune a une portée (la table et les lignes concernées), un prédicat (une requête qui renvoie un nombre), un seuil et une sévérité :

- **block** : un échec arrête le pipeline (schéma, volumes de la Météo des forêts, unicité des clés, niveaux de 1 à 4, diffusion avant 22 h UTC pour D016, orphelins, complétude de la Météo des forêts en PACA) ;
- **warn** : un échec est signalé dans le rapport, le pipeline continue (autres volumes, complétude de la BDIFF, `N.C.`, valeurs douteuses, chutes de plus de 30 % du nombre de stations, lignes en file de rejet).

Le rapport [`docs/qualite/rapport-qualite.md`](qualite/rapport-qualite.md) est régénéré à chaque exécution.

## 6. Export pour Power BI

Le rapport Power BI ne lit pas la base DuckDB : il lit un fichier Parquet par table gold, écrit dans `data/exports/` à la fin de chaque exécution (`pipeline/exporter.py`).

| Fichier | Table gold |
|---|---|
| `fait_feu_enrichi.parquet` | `gold.fait_feu_enrichi` |
| `ref_communes_prioritaires.parquet` | `gold.ref_communes_prioritaires` |
| `mart_jour_departement.parquet` | `gold.mart_jour_departement` |
| `mart_seuil.parquet` | `gold.mart_seuil` |
| `mart_commune_annee.parquet` | `gold.mart_commune_annee` |
| `v_q2_quand.parquet` | `gold.v_q2_quand` (vue) |

Dans Power BI Desktop : *Obtenir des données → Parquet*, puis le fichier.

### Calculer les indicateurs dans Power BI

Les marts sont agrégés (par jour, par commune et par année, par heure) : ils ne suffisent pas pour I1, qui compte les feux de plus de 1 ha par commune, ni pour I2, qui croise l'heure d'alerte et le niveau du jour. `fait_feu_enrichi` garde un feu par ligne (10 789 lignes pour l'export PACA 2006-2025), avec le niveau de danger de son jour. Les trois indicateurs s'y calculent en mesures, et leurs paramètres (S, P, N) peuvent devenir des segments du rapport.

Filtre commun : `code_dep = "13"` et `annee` dans 2024, 2025.

| Indicateur | Numérateur | Dénominateur | Valeur attendue |
|---|---|---|---|
| **I1** (O1) | feux avec `est_commune_prioritaire` et `surface_ha > S`, hors Marseille (`est_marseille` faux) | feux avec `est_commune_prioritaire`, hors Marseille | S = 1 ha : 16 / 242 = 6,6 % (autres communes : 8 / 208 = 3,8 %) |
| **I2** (O2) | feux avec `niveau >= N` et `heure` dans P | feux avec `niveau >= N` | N = 3, P = 12 h - 20 h : 113 / 177 = 63,8 % |
| **I3** (O3) | feux avec `niveau >= N` | feux avec `dans_periode_bulletin` | N = 3 : 177 / 355 = 49,9 % |

Le coût d'I3 en jours de renfort (78 jours au niveau 3 sur 2024-2025) se lit dans `mart_seuil` (`jours_declenches`), et les jours sans feu dans `mart_jour_departement`.

`niveau` vaut NULL pour un feu parti hors de la période de publication de l'indice (134 des 489 feux du 13 en 2024-2025) : ces feux sortent du dénominateur d'I2 et d'I3, comme dans les fiches. `heure` vient de la date de première alerte (D011), dont le fuseau horaire n'est pas vérifié.

La liste des 18 communes prioritaires est figée dans `sql/gold/45_ref_communes_prioritaires.sql`, et non recalculée à chaque exécution : I1 porte ainsi toujours sur les mêmes communes d'une saison à l'autre.

- **L'export n'a lieu qu'après la barrière « modèle »** : si une règle « block » échoue, aucun fichier n'est réécrit et les fichiers de l'exécution précédente restent en place.
- **Aucun fichier à moitié écrit** : chaque fichier est écrit sous un nom provisoire (`.part`), puis renommé.
- **Types** : les colonnes `HUGEINT` (sommes d'entiers dans DuckDB) sont exportées en `BIGINT`, que Power BI sait lire. Les autres types sont conservés : dates, booléens, NULL et codes en texte (`13055`).
- **Lignes triées sur toutes les colonnes** : deux exécutions sur les mêmes données donnent le même contenu.
- `data/exports/` n'est pas versionné, comme le reste de `data/`.

Les tests (`tests/test_export.py`) vérifient, pour chaque table, que le fichier existe, qu'il a les mêmes colonnes, les mêmes types et exactement les mêmes lignes que la table gold, et que les chiffres des fiches d'indicateurs s'y retrouvent (240 bulletins du 13 sur 2024-2025, 78 jours au niveau 3 ou plus, 489 feux, dont 355 dans la période de publication et 177 un jour de niveau 3 ou plus). `tests/test_kpi_parquet.py` recalcule I1, I2 et I3 à partir des seuls fichiers Parquet, pour chaque valeur de paramètre des fiches, et retrouve les valeurs des fiches.

## 7. Export pour l'application web

L'application web (`dashboard/web/`, voir son [README](../dashboard/web/README.md)) lit des fichiers JSON, un par page, écrits par `pipeline/exporter_web.py` :

```
uv run python -m pipeline.exporter_web              (télécharge le fond de carte s'il manque)
uv run python -m pipeline.exporter_web --hors-ligne (n'utilise que les fichiers présents)
```

- **Source : les fichiers Parquet de `data/exports/`**, pas la base DuckDB. L'application et le rapport Power BI lisent donc les mêmes tables gold, déjà passées par la barrière « modèle ». La commande se lance après `pipeline.construire`.
- **Paramètres dans `pipeline/config.py`** : seuil de référence (niveau 3, le seuil actuel étant inconnu, D013), plage de patrouille (12 h - 20 h), surface d'un grand feu (1 ha). Ils sont recopiés dans les JSON : l'application ne contient aucun de ces chiffres.
- **Fond de carte** : les contours des communes du 13 viennent de l'API Découpage administratif (`geo.api.gouv.fr`), sont gardés dans `data/raw/geo/`, puis simplifiés (environ 60 m) pour passer de 1,4 Mo à 140 ko. Sans réseau et sans fichier, l'export continue et la page Carte indique que le fond manque.
- **Glossaire** : `glossaire.json` est lu dans `docs/glossaire.md` (définition, règle, exemple, statut de chaque entrée).
- `dashboard/web/public/data/` n'est pas versionné.

`tests/test_export_web.py` vérifie que les valeurs des fiches d'indicateurs se retrouvent dans les JSON (489 feux, 177 couverts sur 355, 78 jours de renfort, I1 et I2), et que les cinq affirmations du récit de l'application restent vraies dans les données.

## 8. Limites connues

- **BDIFF manuelle** : sans export déposé, les tables de feux sont vides et les colonnes de feux de gold valent NULL (jamais 0) : `feux_connus` indique si les feux d'un département et d'une année sont chargés. Le chargement a été vérifié sur l'export PACA 2006-2025 du 2026-11-19 (10 789 feux). Cet export mélange deux fins de ligne (LF pour l'en-tête, CRLF pour les données) : la lecture bronze utilise `strict_mode = false`, sans quoi DuckDB refuse le fichier.
- **Saison 2026 absente de la BDIFF** : la Météo des forêts couvre 2026, mais la BDIFF n'est pas publiée. L'analyse du seuil porte sur 2024 et 2025 seulement (D012).
- **Seuil actuel et coût d'une journée de renfort inconnus** (D013) : `mart_seuil` donne des jours de renfort, de fausses alertes et de feux manqués, pas des euros.
- **Périmètre hors Marseille** ([D005](decisions.md), non tranchée) : `mart_seuil` existe pour tout le département et sans Marseille. Sans Marseille, seuls les feux changent : le niveau de la Météo des forêts reste celui de tout le département, qui ne peut pas être séparé.
- **`dim_departement` construite sans le GeoJSON prévu par le modèle** : les 96 départements de métropole et leurs noms viennent de la Météo des forêts, les 5 départements d'outre-mer des interventions SDIS. Le GeoJSON n'est utile que pour une carte ; il pourra être ajouté sans changer les clés.
- **Climatologie à partir de 2006 en silver** (comme `dim_jour`, D006) ; bronze garde tout depuis 1950. La période reste à fixer si D012 rallonge l'historique.
- **Climatologie du 13 seulement par défaut** : la météo des autres départements de PACA est NULL tant que `CLIMATO_DEPARTEMENTS` ne les inclut pas. Les stations de Corse commencent par `20`, qui n'est pas un code de `dim_departement` : à traiter si on les charge.
- **Feux manqués** : comptés en feux (`feux_manques`) et en jours (`jours_avec_feu_manques`), car les deux mesures ne donnent pas le même résultat (glossaire).
- **`dim_commune`** : une seule version par commune tant qu'aucun référentiel COG n'est chargé ; aucun historique n'est inventé.
