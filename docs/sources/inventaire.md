# Inventaire des sources

Dernière mise à jour : 2026-11-17

Questions (numérotation commune proposée par Ramdane, à valider par le groupe) : **Q1** Où concentrer les moyens · **Q2** Quand surviennent les feux · **Q3** Seuil de la Météo des forêts · **Q4** Budget (jours de renfort, feux manqués) · **Q5** Comparaison avec PACA et la France.

| Source | Explorée par | Pertinente pour nos questions ? | Ce que nous avons découvert |
|---|---|---|---|
| [Archives de la Météo des forêts](fiche-archives-meteo-des-forets.md) (Météo-France) | Ghiles Mekdam | **Oui** : Q3, Q4 et Q5. Non pour Q1 (une seule valeur par département). | Seulement 3 saisons archivées (2024, 2025, 2026, de juin à septembre), aucun fichier 2023. La colonne `date` est la date de diffusion : le niveau `niveau_j1` concerne le lendemain. Le format change chaque année (séparateur, nom de colonne, code département `1` ou `01`). Le danger augmente nettement dans le 13 : 0 jour « très élevé » en 2024, 10 en 2025, 16 en 2026. |
| [BDIFF](fiche-bdiff-ouissem-aouimeur.md) (ministère de l'Agriculture, IGN) | Ouissem Aouimeur | **Oui** : Q1, Q2, Q5, et Q3 et Q4 une fois croisée avec la Météo des forêts. | Un feu par ligne, avec commune (code INSEE), date d'alerte et surface. 10 789 feux en PACA de 2006 à 2025, dont 40 % dans le 13 ; le Var a moins de feux mais plus de surface brûlée. Surfaces en m² dans le fichier. Cause inconnue dans 37 % des feux du 13. Export limité à 30 000 lignes. Marseille représente 5 % des feux du 13. Licence non ouverte : usage commercial interdit. |
| [Données climatologiques de base quotidiennes](fiche-donnees-climatologiques-quotidiennes.md) (Météo-France) | Ramdane Chaba | **En partie** : Q3 indirectement (rallonger l'historique en recalculant un indice proche de l'IFM), Q2 et Q5. Non pour Q1 et Q4. | Une ligne par station et par jour, sur des décennies. Pluie, température et vent dans un fichier, humidité dans un autre. Toutes les stations ne mesurent pas tout. La pluie du jour J va de 6 h le jour J à 6 h le lendemain. Les codes qualité sont déformés par l'API data.gouv : lire les CSV d'origine. 1,2 million de lignes pour le 13 seul. |
| [Interventions réalisées par les services d'incendie et de secours](fiche-interventions-sdis.md) (ministère de l'Intérieur) | Ramdane Chaba | **En partie** : Q5 seulement. | Totaux annuels par service, sans date ni commune : impossible à croiser avec la Météo des forêts. Le SDIS 13 et le BMPM (Marseille) ont des lignes séparées. Les « feux de végétation » sont des interventions, pas des feux de forêt. La colonne manque certaines années (2010, 2013). Environ 18 mois de décalage de publication. |

**Quelles questions de vos analyses n'ont encore aucune source ?**
- **Q4 Budget** : le coût d'une journée de dispositif renforcé, le budget de la saison et le seuil actuel sont des données internes au SDIS 13, absentes de l'open data. Il faudra les demander à la direction ou poser des hypothèses documentées.
- **Q1 à l'échelle du massif** : la BDIFF localise les feux à la commune, mais aucune source explorée ne donne le contour des massifs. Les pistes du défi (BD Forêt, plans de protection des forêts contre l'incendie) restent à explorer.

**Quelle source vous a surpris, et pourquoi ?**
La Météo des forêts. C'est l'indice au cœur de la commande, mais son archive ouverte ne compte que trois saisons, et seulement deux (2024 et 2025) peuvent être croisées avec les feux de la BDIFF, qui s'arrête en 2025. Sa date est décalée d'un jour par rapport au danger qu'elle annonce, et elle ne distingue aucune zone à l'intérieur du département.

**Quelle source semble utile mais inexploitable dans le temps du projet ?**
Les données climatologiques quotidiennes à l'échelle de la France. Elles permettraient de rallonger l'historique du seuil sur des décennies, mais le volume (1,2 million de lignes pour le seul 13) et le recalcul d'un indice proche de l'IFM, dont la faisabilité n'est pas vérifiée, dépassent le temps du projet. Elles restent exploitables pour le 13 ou pour PACA.
