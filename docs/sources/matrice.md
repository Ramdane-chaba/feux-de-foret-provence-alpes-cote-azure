# Matrice questions × sources — v0

Dernière mise à jour : 2026-11-17

Une ligne par question retenue par le groupe (liste commune D004), une colonne par source de l'[inventaire](inventaire.md). Construite à partir des trois matrices individuelles (section 5 des analyses de Ghiles, Ramdane et Ouissem). Chaque degré cite la rubrique de la fiche ou la colonne du fichier qui le justifie.

Degrés : **complet** (répond au grain, sur la période et l'emprise voulues) · **partiel** (grain trop large, période trop courte, emprise incomplète ou donnée indirecte) · **absent** (rien d'utile) · **inconnu** (non vérifié).

## Les questions retenues

Quand plusieurs membres ont posé la même question, elle est fusionnée ; la colonne « Posée par » garde le numéro de chacun dans son analyse.

| Question | Posée par | Formulation retenue |
|---|---|---|
| **Q1 Où** | Ghiles (1), Ramdane (1), Ouissem (1) | Dans quelles communes ou quels massifs du 13 les départs de feu sont-ils les plus fréquents et les plus étendus, et ces zones reviennent-elles d'une année sur l'autre ? |
| **Q2 Quand** | Ramdane (2) | À quels mois, jours de la semaine et heures les départs de feu sont-ils les plus nombreux ? |
| **Q3 Seuil** | Ghiles (3), Ramdane (3, première partie), Ouissem (2) | Pour chaque niveau de la Météo des forêts, quelle part des jours a connu au moins un départ de feu dans le 13 ? |
| **Q4 Budget** | Ghiles (4), Ramdane (3, seconde partie), Ouissem (3) | Pour chaque seuil possible, combien de jours de renfort par été, combien de fausses alertes et de feux manqués, et pour quel coût ? |
| **Q5 Comparaison** | Ghiles (2), Ramdane (4), Ouissem (4) | À niveau de danger égal, le 13 connaît-il plus de départs de feu que les autres départements de PACA et que la France ? |

## La matrice

| Question | Météo des forêts | BDIFF | Données climatologiques quotidiennes | Interventions SDIS |
|---|---|---|---|---|
| **Q1 Où** | **absent** : une seule valeur par département (`num_dep`), aucune donnée de feu | **partiel** : un feu par ligne avec `Code INSEE`, `Date de première alerte`, `Surface parcourue (m2)`, sur 2006-2025 ; aucune colonne de coordonnées ni de massif parmi les 24 colonnes, et 2026 non publiée | **absent** : mesures par station (`NUM_POSTE`, `AAAAMMJJ`), aucune donnée de feu | **absent** : un service × une année (rubrique « Grain »), aucune commune |
| **Q2 Quand** | **absent** : un niveau de danger, pas des feux (rubrique « Grain ») ; publié seulement de fin mai à début octobre | **partiel** : `Date de première alerte` donne la date **et l'heure** de chaque feu (ex. `2025-01-04 21:48:00`), donc mois, jour de la semaine et heure ; mais l'alerte n'est pas le départ du feu, et 2026 n'est pas publiée | **partiel** : donnée indirecte ; conditions de chaque jour (`RR`, `TX`, `FXI3S`) pour expliquer les jours à feux, sans compter les feux | **absent** : totaux annuels (`Année`), aucune date |
| **Q3 Seuil** | **partiel** : `niveau_j1` par jour pour `num_dep` = 13 (jour du danger = `date` + 1) ; trois saisons (2024-2026), sans 2023, une seule valeur pour tout le 13 | **partiel** : jours avec feu dans le 13 (`Département`, `Date de première alerte`), mais pas le niveau ; 2026 non publiée, donc seules 2024 et 2025 se croisent avec la Météo des forêts | **partiel** : donnée indirecte ; `RR`, `TX`, `FFM`, `UN` permettraient de recalculer un indice proche de l'IFM sur une longue période, méthode non vérifiée (rubrique « Questions ») | **absent** : grain annuel, impossible à croiser avec un jour |
| **Q4 Budget** | **partiel** : jours au-dessus de chaque seuil comptés avec `niveau_j1`, sur trois saisons ; aucun coût | **partiel** : feux manqués comptés par jointure avec la Météo des forêts (`Date de première alerte`), sur 2024-2025 ; aucun coût | **partiel** *(tranché, voir plus bas)* : indirect pour compter des jours au-dessus d'un seuil sur une longue période (même limite que Q3) ; aucune colonne de coût ni de moyens | **absent** : nombre d'interventions par an, ni jour ni coût |
| **Q5 Comparaison** | **partiel** : `niveau_j1` pour les 96 départements de l'Hexagone et de la Corse, trois saisons seulement, pas d'outre-mer | **partiel** : `Département` et `Date de première alerte` pour toute la France ; export limité à 30 000 lignes ; aucune surface forestière par département | **partiel** : donnée indirecte, un fichier par département, mais 1,2 million de lignes pour le 13 seul (rubrique « Volumétrie ») | **partiel** *(tranché, voir plus bas)* : `Feux de végétations` par `Numéro` et `Année` pour comparer des volumes d'interventions ; grain annuel, colonne absente en 2010 et 2013 |

**Aucune donnée de coût :** le coût d'une journée de dispositif renforcé, le budget de la saison et le seuil actuel ne figurent dans aucune source. Ce sont des données internes au SDIS 13.

## Les divergences entre nos matrices, et comment elles ont été tranchées

Pour chaque cellule où nos degrés différaient, nous sommes retournés au fichier.

| Cellule | Ghiles | Ramdane | Ouissem | Degré retenu | Ce que dit le fichier |
|---|---|---|---|---|---|
| Q2 × BDIFF (heures) | — | partiel, **inconnu** pour les heures | — | **partiel** | L'export CSV de la BDIFF (ouvert le 2026-11-17) contient l'heure dans `Date de première alerte` (ex. `2025-01-04 21:48:00`). L'« inconnu » est levé. Le degré reste partiel : alerte ≠ départ, et 2026 manque alors que l'idéal de Ramdane allait jusqu'à l'été 2026. |
| Q4 × Données climatologiques | partiel | partiel | absent | **partiel** | Le fichier `RR-T-Vent` et le fichier `autres-parametres` contiennent `RR`, `TX`, `FFM`, `UN` : ils servent indirectement à compter des jours au-dessus d'un seuil sur une période longue, comme pour Q3. Ouissem a raison sur le coût : aucune colonne de coût ni de moyens. |
| Q5 × Interventions SDIS | partiel | partiel | absent | **partiel** | `Feux de végétations` permet une comparaison des volumes entre départements, ce qui sert la question reformulée (D014). Ouissem a raison sur le fond : sans jour, la colonne ne permet pas de comparer « à niveau de danger égal ». |
| Q3 × Météo des forêts (période) | 2 saisons croisables | 2 saisons croisables | « les 3 saisons disponibles » | **partiel, 2 saisons croisables** | La Météo des forêts couvre 2024-2026, mais la BDIFF s'arrête en 2025 (« Année(s) en cours de saisie : 2026 ») : seules 2024 et 2025 se croisent. Même correction pour Q5. |

## Lecture par question : les manques

- **Aucune question n'a de source « complet ».** Chacune appelle une décision, consignée dans le [journal des décisions](../decisions.md) : D010 (Q1), D011 (Q2), D012 (Q3), D013 (Q4), D014 (Q5).
- **Q4 Budget** a le manque le plus grave : coût, budget et seuil actuel n'existent dans aucune source ouverte.
- **Manques transverses** : la saison 2023 de la Météo des forêts, la saison 2026 de la BDIFF, le contour des massifs, la surface forestière par département.

## Lecture par source : à quoi sert chacune ?

- **BDIFF** : la source pivot, utile pour les cinq questions. Toute analyse des feux passe par elle.
- **Météo des forêts** : indispensable pour Q3, Q4 et Q5, mais sur une période courte.
- **Données climatologiques quotidiennes** : jamais « complet », toujours indirecte. À garder comme base d'un proxy pour rallonger l'historique (Q3, Q4). À interroger pour une question que nous n'avons pas posée : *quelles conditions météo précédaient les feux partis les jours où l'indice était faible ?* C'est la plainte des chefs de centre (« des feux partis des jours où l'indice était au plus bas »).
- **Interventions SDIS** : ne sert qu'à Q5, en partie. À interroger plutôt qu'à écarter : comparer ses `Feux de végétations` aux feux de la BDIFF du 13 répondrait à une question non posée, *quelle part de l'activité du SDIS 13 sur les feux de végétation la BDIFF ne voit-elle pas ?* C'est aussi la seule source qui sépare le SDIS 13 du BMPM.
