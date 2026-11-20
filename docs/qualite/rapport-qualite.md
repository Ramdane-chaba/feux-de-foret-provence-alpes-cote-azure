# Rapport de qualité

Généré par `pipeline/qualite.py` le 2026-11-18 16:47, exécution `1154ee53b32d`. Ne pas modifier à la main : relancer `uv run python -m pipeline.construire`.

**Résultat : aucune règle bloquante en échec.** 32 règles respectées, 1 en échec, 9 non évaluables.

## Règles

| Règle | Portée | Seuil | Résultat | Sévérité | Décision |
|---|---|---|---|---|---|
| Schéma : colonnes attendues présentes (4) | bronze.meteo_des_forets : date, num_dep, niveau_j1, niveau_j2 | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues renseignées dans chaque fichier | bronze.meteo_des_forets, par _fichier_source | = 0 | ✅ 0 | block | accepté |
| Schéma : toutes les colonnes source en texte (aucun typage en bronze) | bronze.meteo_des_forets | = 0 | ✅ 0 | block | accepté |
| Schéma : nom du département présent (nom_dep ou dep_nom) dans chaque fichier | bronze.meteo_des_forets, par _fichier_source | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues présentes (14) | bronze.climato_rr_t_vent : NUM_POSTE, NOM_USUEL, LAT, LON, ALTI, AAAAMMJJ, RR, QRR, TX, QTX, FFM, QFFM, FXI3S, QFXI3S | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues renseignées dans chaque fichier | bronze.climato_rr_t_vent, par _fichier_source | = 0 | ✅ 0 | block | accepté |
| Schéma : toutes les colonnes source en texte (aucun typage en bronze) | bronze.climato_rr_t_vent | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues présentes (4) | bronze.climato_autres_parametres : NUM_POSTE, AAAAMMJJ, UN, QUN | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues renseignées dans chaque fichier | bronze.climato_autres_parametres, par _fichier_source | = 0 | ✅ 0 | block | accepté |
| Schéma : toutes les colonnes source en texte (aucun typage en bronze) | bronze.climato_autres_parametres | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues présentes (3) | bronze.interventions : Année, Numéro, Département | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues renseignées dans chaque fichier | bronze.interventions, par _fichier_source | = 0 | ✅ 0 | block | accepté |
| Schéma : toutes les colonnes source en texte (aucun typage en bronze) | bronze.interventions | = 0 | ✅ 0 | block | accepté |
| Schéma : colonnes attendues présentes (11) | bronze.bdiff : Année, Numéro, Département, Code INSEE, Nom de la commune, Date de première alerte, Surface parcourue (m2), Surface forêt (m2), Surface maquis garrigues (m2), Précision des surfaces, Nature | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Schéma : colonnes attendues renseignées dans chaque fichier | bronze.bdiff, par _fichier_source | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Schéma : toutes les colonnes source en texte (aucun typage en bronze) | bronze.bdiff | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Volume : Météo des forêts, total | bronze.meteo_des_forets | = 35 616 | ✅ 35 616 | block | accepté |
| Volume : Météo des forêts, Bouches-du-Rhône | bronze.meteo_des_forets, num_dep = '13' | = 371 | ✅ 371 | block | accepté |
| Volume : climatologie 13, RR-T-Vent 1950-2024 | bronze.climato_rr_t_vent, fichier Q_13 1950-2024 | = 1 197 064 | ✅ 1 197 064 | warn | accepté |
| Volume : interventions 2024 | bronze.interventions, Année = '2024' | = 99 | ✅ 99 | warn | accepté |
| Volume : feux en PACA de 2006 à 2025 | silver.fait_feu, PACA, 2006-2025 | = 10 789 | ⏸ — | warn | non évaluable (source absente) : à relancer après dépôt |
| Unicité de la clé (code_dep, jour_danger) | silver.fait_niveau_danger | = 0 | ✅ 0 | block | accepté |
| Unicité de la clé (num_poste, jour) | silver.fait_meteo_jour | = 0 | ✅ 0 | block | accepté |
| Unicité de la clé (annee, code_service) | silver.fait_interventions_an | = 0 | ✅ 0 | block | accepté |
| Unicité de la clé (annee, numero) | silver.fait_feu | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Niveau de danger entre 1 et 4 | silver.fait_niveau_danger | = 0 | ✅ 0 | block | accepté |
| D016 : aucune diffusion après 22 h UTC | silver.fait_niveau_danger | = 0 | ✅ 0 | block | accepté |
| Orphelins : code département absent de dim_departement | silver.fait_niveau_danger (code_dep IS NOT NULL) | = 0 | ✅ 0 | block | accepté |
| Orphelins : code département absent de dim_departement | silver.fait_feu (code_dep IS NOT NULL) | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Orphelins : code département absent de dim_departement | silver.dim_station (code_dep IS NOT NULL) | = 0 | ✅ 0 | block | accepté |
| Orphelins : code département absent de dim_departement | silver.dim_service (code_dep IS NOT NULL) | = 0 | ✅ 0 | block | accepté |
| Orphelins : code département absent de dim_departement | silver.dim_commune (code_dep IS NOT NULL) | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Feux sans jour d'alerte | silver.fait_feu | = 0 | ⏸ — | block | non évaluable (source absente) : à relancer après dépôt |
| Complétude : chaque département de PACA présent chaque jour de chaque saison | silver.fait_niveau_danger × jours de bulletin × 6 départements de PACA | = 0 | ✅ 0 | block | accepté |
| Complétude : chaque département de PACA présent chaque année dans la BDIFF | silver.fait_feu × années 2006-2025 × 6 départements de PACA | = 0 | ⏸ — | warn | non évaluable (source absente) : à relancer après dépôt |
| Manquants déguisés : « N.C. » dans Feux de végétations | silver.fait_interventions_an | = 0 | ❌ 1 | warn | valeur mise à NULL, ligne gardée |
| Valeurs climatologiques douteuses (code qualité 2) | silver.fait_meteo_jour | = 0 | ✅ 0 | warn | accepté |
| Chute de plus de 30 % du nombre de stations d'un jour à l'autre | gold.mart_jour_departement, jours couverts par la climatologie | = 0 | ✅ 0 | warn | accepté |
| Lignes en file de rejet (meteo_des_forets) | silver.rejet_meteo_des_forets | = 0 | ✅ 0 | warn | accepté |
| Lignes en file de rejet (climatologie) | silver.rejet_climatologie | = 0 | ✅ 0 | warn | accepté |
| Lignes en file de rejet (interventions) | silver.rejet_interventions | = 0 | ✅ 0 | warn | accepté |
| Lignes en file de rejet (bdiff) | silver.rejet_bdiff | = 0 | ✅ 0 | warn | accepté |

## Compteurs

- Manquants déguisés : « N.C. » dans Feux de végétations : **1**
  (lignes : 2018 service 972)
- Valeurs climatologiques douteuses (code qualité 2) : **0**
- Chute de plus de 30 % du nombre de stations d'un jour à l'autre : **0**
- Lignes en file de rejet (meteo_des_forets) : **0**
- Lignes en file de rejet (climatologie) : **0**
- Lignes en file de rejet (interventions) : **0**
- Lignes en file de rejet (bdiff) : **0**

## Limites connues

- **BDIFF** : export manuel (formulaire du site). Sans export dans `data/raw/bdiff/`, les tables de feux sont vides, les colonnes de feux de `gold` sont NULL (jamais 0) et les règles qui en dépendent sont « non évaluables ». Les noms de colonnes BDIFF viennent de la fiche, non vérifiés sur un fichier.
- **Périmètre hors Marseille ([D005](../decisions.md))** : `mart_seuil` existe pour tout le département et sans Marseille. Sans Marseille, seuls les feux changent ; le niveau de la Météo des forêts reste celui de tout le département.
- **Saison 2026** : la Météo des forêts la couvre, la BDIFF non : l'analyse du seuil porte sur 2024-2025 (D012).
- **Seuil actuel et coût d'une journée de renfort** : inconnus (D013) ; les seuils sont exprimés en jours.

## Ce que les indicateurs peuvent et ne peuvent pas affirmer

**Ils peuvent affirmer :**
- combien de jours chaque seuil (2, 3 ou 4) aurait déclenché le dispositif renforcé en 2024 et en 2025, par département : c'est le coût du seuil en **jours de renfort** (Q4, D013) ;
- une fois l'export BDIFF chargé, combien de ces jours ont connu au moins un feu, combien ont été des fausses alertes, et combien de feux (et de jours avec feu) sont partis sous le seuil ;
- la même chose pour le 13 et pour chaque autre département, sur les mêmes jours et avec la même règle de jointure (D016), donc de façon comparable (Q5) ;
- des volumes annuels d'interventions « Feux de végétations » par service, pour les années où la colonne existe.

**Ils ne peuvent pas affirmer :**
- **qu'un seuil est le bon** : deux saisons seulement (240 jours de bulletin pour le 13) et 10 jours de niveau 4 dans le 13 ; une différence entre seuils peut venir d'une saison particulière (D012) ;
- **un coût en euros** : le coût d'une journée de renfort, le budget et le seuil actuel sont inconnus (D013) ;
- **qu'un niveau a causé un feu** : on compare la prévision de la veille (`niveau_j1`) et la première alerte, pas l'heure réelle de départ (D011, D016) ;
- **un résultat « hors Marseille » pour la Météo des forêts** : le périmètre hors Marseille retire les feux de Marseille, mais le niveau de danger reste celui de tout le département (D005) ;
- **un niveau de danger hors saison** : sans bulletin, le niveau est inconnu, pas faible ;
- **un nombre de feux de forêt à partir des interventions** : « Feux de végétations » compte des interventions, pas des feux, et n'est pas comparable à la BDIFF ;
- **une météo représentative des autres départements** tant que la climatologie n'est chargée que pour le 13 (variable `CLIMATO_DEPARTEMENTS`).
