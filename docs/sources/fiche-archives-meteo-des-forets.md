# Fiche d'identité — Archives de la Météo des forêts

Explorée par : Ghiles Mekdam, le 2026-11-17.

- **Fiche de la source :** [Archives de la Météo des forêts sur data.gouv.fr](https://www.data.gouv.fr/datasets/692f01d38fef6c5815d9262a)
- **Documentation :** présentation PDF de Météo-France (fournie avec le jeu de données) et [portail documentaire Open Data de Météo-France](https://confluence-meteofrance.atlassian.net/wiki/spaces/OpenDataMeteoFrance/pages/874741792/Donn+es+expertis+es).
- **Fichiers ouverts :** `mdf_2024.csv.gz`, `mdf_2025.csv.gz`, `mdf_2026.csv.gz` (en entier), `DONNEES_EXPERTISEES_MeteoDesForets_departements.geojson`.

| Rubrique | Valeur |
|---|---|
| Propriétaire et système | Météo-France. Le jeu est publié sur data.gouv.fr ; les fichiers CSV sont hébergés sur l'espace de stockage de Météo-France. Le niveau de danger est calculé par les prévisionnistes de Météo-France à partir de l'Indice de danger intégré (IFM complété par l'état de sécheresse de la végétation), puis ajusté selon la surface forestière et les zones sensibles de chaque département. |
| Mode d'accès (export, API, téléchargement) et format | Téléchargement direct, sans compte. Un fichier CSV compressé (`.csv.gz`) par année. Ressources annexes : contour des départements (GeoJSON), présentation (PDF), échantillons (ZIP). Une API temps réel existe sur le portail API de Météo-France : non vérifiée, car elle demande la création d'un compte et ne contient pas l'historique. |
| Grain (une ligne = ?) | Un bulletin quotidien × un département. Chaque ligne porte deux niveaux : `niveau_j1` (danger prévu pour le lendemain) et `niveau_j2` (pour le surlendemain). Vérifié : aucun doublon (jour, département) dans les trois fichiers. |
| Emprise géographique | France hexagonale et Corse : 96 départements (dont 2A et 2B). Pas d'outre-mer. Aucune zone plus fine que le département. |
| Période réellement couverte par les données | Saisons 2024, 2025 et 2026 uniquement : du 2024-06-03 au 2024-09-30 (120 bulletins), du 2025-06-03 au 2025-09-30 (120), du 2026-05-28 au 2026-10-05 (131). Aucun jour manquant à l'intérieur de chaque saison. Aucune donnée d'octobre à mai, et pas de fichier 2023, bien que le dispositif existe depuis 2023. |
| Date de dernière mise à jour affichée sur la fiche | 2026-10-05 (métadonnées data.gouv.fr du jeu de données). |
| Fréquence de mise à jour | Quotidienne pendant la saison : la fiche data.gouv.fr indique « quotidienne », et la documentation précise que le fichier de l'année en cours est mis à jour chaque jour pendant la période à risque (juin à septembre). Les fichiers des années passées ne changent plus. |
| Volumétrie | Très faible. 2024 : 11 520 lignes (40 Ko compressé) ; 2025 : 11 520 lignes (44 Ko) ; 2026 : 12 576 lignes (50 Ko). Total : 35 616 lignes, 5 colonnes. Soit 371 lignes pour les Bouches-du-Rhône. |
| Clés disponibles (sur quoi pourra-t-on joindre ?) | **Code département** (`num_dep`) + **date** (`date`). Pour joindre avec les feux, il faut construire la clé (département, jour du danger) : le jour du danger est le jour de diffusion + 1 pour `niveau_j1`. Le GeoJSON se joint par son champ `code`. |
| Données personnelles | Aucune : uniquement des niveaux de danger météorologique agrégés par département. Vérifié sur les 5 colonnes des trois fichiers. |
| Licence | Licence Ouverte d'Etalab 2.0, sans redevance. Mention obligatoire : « Météo-France ». |
| Questions de votre analyse auxquelles elle pourrait répondre | **Q3** (part des jours avec feu pour chaque niveau) et **Q4** (jours de renfort selon le seuil) : oui, c'est la source centrale, à croiser avec une base de feux (BDIFF). **Q2** (le 13 comparé à PACA et à la France à niveau égal) : oui, tous les départements sont présents. **Q1** (zones de concentration des feux dans le 13) : non, la source ne descend pas sous le département. |

## Ce que j'ai découvert en ouvrant les fichiers

1. **La colonne `date` n'est pas le jour du danger.** C'est l'heure de production du bulletin, en fin d'après-midi, notée en UTC (par exemple `2025-06-03T14:50:06Z`, soit 16 h 50 à Paris). Le danger de `niveau_j1` s'applique au **lendemain**. Une jointure directe sur `date` avec une base de feux décalerait tout d'un jour.
2. **Le format change d'une année à l'autre.** Le séparateur est la virgule en 2024 et 2025, le point-virgule en 2026. La colonne du nom s'appelle `nom_dep` en 2024 et 2026, mais `dep_nom` en 2025. Le code département est écrit `1` en 2024 et 2025, `01` en 2026. Les noms de colonnes diffèrent aussi de la documentation, qui annonce `Reference_time` et `dep_code`. Le chargement devra harmoniser ces trois points.
3. **Les niveaux sont codés de 1 à 4.** D'après la documentation de Météo-France : 1 = faible (vert), 2 = modéré (jaune), 3 = élevé (orange), 4 = très élevé (rouge).
4. **L'historique est très court.** Trois saisons seulement, soit 371 jours pour le 13. Pour fixer un seuil, c'est peu, surtout pour le niveau 4, qui est rare. L'Indice forêt météo (IFM), disponible sur une période plus longue, pourrait servir de donnée de remplacement.
5. **Une seule valeur pour tout le département.** On ne pourra pas fixer de seuil différent par zone ou par massif à partir de cette source. On ne pourra pas non plus exclure Marseille, défendue par les marins-pompiers et non par le SDIS 13.
6. **Le danger a nettement augmenté dans le 13 sur les trois saisons** (niveau prévu pour le lendemain, nombre de jours) :

| Saison | Faible (1) | Modéré (2) | Élevé (3) | Très élevé (4) |
|---|---|---|---|---|
| 2024 | 33 | 68 | 19 | 0 |
| 2025 | 26 | 35 | 49 | 10 |
| 2026 | 11 | 57 | 47 | 16 |
