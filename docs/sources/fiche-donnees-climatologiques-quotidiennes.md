# Fiche source - Données climatologiques de base quotidiennes (Météo-France)

Explorée par : Ramdane CHABA, le 2026-11-17
Lien : https://www.data.gouv.fr/datasets/donnees-climatologiques-de-base-quotidiennes
Source hors de la liste du défi (le défi cite « Données de changement climatique » sur meteo.data.gouv.fr, pas ce jeu-là).
Fichiers ouverts (via l'API tabulaire de data.gouv.fr) :
- `QUOT_departement_13_periode_2025-2026_RR-T-Vent`
- `QUOT_departement_13_periode_1950-2024_RR-T-Vent`
- `QUOT_departement_13_periode_2025-2026_autres-parametres`

Documentation lue : `CLIMATOLOGIE_Donnees_quotidiennes_descriptif.pdf` (4 pages, daté du 2026-06-03 d'après le nom du fichier, téléchargé depuis la fiche data.gouv).

Questions : numérotation commune proposée au groupe (à valider) — Q1 Où, Q2 Quand, Q3 Seuil, Q4 Budget (jours de renfort / feux manqués), Q5 Comparaison PACA / France.

| Rubrique | Valeur |
|---|---|
| Propriétaire et système | Météo-France. Données de son réseau de stations météo, avec un contrôle qualité climatologique d'après la fiche data.gouv |
| Mode d'accès et format | Téléchargement direct sans compte, CSV compressé (`.csv.gz`), un fichier par département, par période et par groupe de paramètres. D'après le descriptif : sur meteo.data.gouv.fr les paramètres sont répartis en deux fichiers (`RR-T-Vent` et `autres-parametres`), alors que le portail API de Météo-France les donne en un seul. Aussi lisible par l'API tabulaire de data.gouv.fr |
| Grain (une ligne = ?) | Une station météo × un jour. Vérifié : colonnes `NUM_POSTE` (station) et `AAAAMMJJ` (« date de la mesure » d'après le descriptif) |
| Emprise géographique | Toutes les stations de métropole et d'outre-mer, un fichier par département. Pour le 13 : 20 stations présentes le 2025-07-15 (Aix, Arles, Aubagne, Cassis, Istres, Marignane, Marseille, Salon, Trets, Vauvenargues…) |
| Période réellement couverte | Trois fichiers pour le 13 : avant 1949, 1950-2024, 2025-2026. Fin vérifiée : **2026-11-13** (dernière date du fichier 2025-2026). **Date de début : non vérifiée** (le tri et les filtres sur la date ont échoué sur le fichier 1950-2024 avec l'API tabulaire ; il faudra télécharger le fichier et calculer le minimum de `AAAAMMJJ`) |
| Date de dernière mise à jour affichée | 2026-11-15 (métadonnées du jeu sur data.gouv.fr) |
| Fréquence de mise à jour | D'après la fiche data.gouv : quotidienne pour les deux dernières années, mensuelle de 1950 à N-2, annuelle pour avant 1950. Le fichier 2025-2026 du 13 a été modifié le 2026-11-16, ce qui est cohérent |
| Volumétrie | 13 : fichier 1950-2024 `RR-T-Vent` = **1 197 064 lignes** (15,3 Mo compressé) ; fichier 2025-2026 `RR-T-Vent` = 13 629 lignes (0,5 Mo) ; fichier 2025-2026 `autres-parametres` = 13 630 lignes. Gérable si on se limite à PACA. **Pour la comparaison nationale (96 départements), le volume devient important : le 13 seul fait 1,2 million de lignes. C'est une limite à prendre en compte** |
| Clés disponibles | `AAAAMMJJ` (jour) + `NUM_POSTE` (station). D'après le descriptif, `NUM_POSTE` est un « numéro de poste Météo-France sur 8 chiffres (ddnnnpp avec dd = numéro de département, nnn = numéro de commune et pp = précision poste) ». **Incohérence dans le descriptif** : « ddnnnpp » ne fait que 7 caractères pour 8 chiffres annoncés. Les 20 numéros relevés pour le 13 font bien 8 chiffres (ex. 13001009 = 13 / 001 / 009), donc en pratique la précision poste occupe 3 chiffres (format réel `ddnnnppp`). Les 5 premiers chiffres donnent département + numéro de commune, comme un code INSEE (13001 Aix, 13004 Arles, 13055 Marseille, 13103 Salon). **Limite** : la fiche Météo-France du poste 34142001 (Lodève) indique comme commune actuelle Olmet-et-Villecun, donc une station déplacée peut garder son ancien numéro. Pour un rattachement sûr, utiliser `LAT` / `LON`. Le code commune doit aussi être pris au bon millésime du COG (fusions de communes) |
| Données personnelles | Aucune : mesures météo par station. Les seuls noms sont des noms de lieux |
| Licence | Licence Ouverte / Open Licence **version 2.0** (identifiant « lov2 » sur data.gouv) |
| Questions auxquelles elle pourrait répondre | **Q3 Seuil : oui, mais indirectement.** La direction demande un niveau de la Météo des forêts, et cette source ne donne pas ce niveau. Ces données permettent de rallonger l'historique (la Météo des forêts ne couvre que 2024-2026, d'après la fiche de Ghiles) en recalculant un indice proche de l'IFM. Les variables météo de base sont présentes : pluie (`RR`), température (`TX`), vent (`FFM`) dans `RR-T-Vent`, et humidité de l'air (`UN`, `UM`, en %) dans `autres-parametres` (vérifié dans le descriptif). La méthode de calcul exacte de l'IFM, et la possibilité de la reproduire avec des valeurs quotidiennes, ne sont pas vérifiées. **Q2 Quand** : aide à expliquer pourquoi certains jours ont plus de feux. **Q5 Comparaison** : possible, un fichier par département pour toute la France, mais volume important (voir Volumétrie). **Q1 Où** et **Q4 Budget** : non |

## Ce que j'ai remarqué en ouvrant les fichiers et le descriptif

**Colonnes utiles (sens et unités vérifiés dans le descriptif)**

| Colonne | Fichier | Sens | Unité |
|---|---|---|---|
| `RR` | RR-T-Vent | pluie tombée en 24 h, de 06 h FU le jour J à 06 h FU le jour J+1, affectée au jour J | mm |
| `TX` | RR-T-Vent | température maximale sous abri | °C |
| `TN` | RR-T-Vent | température minimale sous abri | °C |
| `TM` | RR-T-Vent | moyenne des températures horaires sous abri | °C |
| `FFM` | RR-T-Vent | vent moyen du jour (moyenné sur 10 min, à 10 m) | m/s |
| `FXI` | RR-T-Vent | maximum quotidien de la force maximale horaire du vent instantané, à 10 m | m/s |
| `DXI` | RR-T-Vent | direction de `FXI` | degrés (0-360) |
| `FXI3S` | RR-T-Vent | maximum quotidien de la force maximale horaire du vent moyenné sur 3 s, à 10 m. Le descriptif précise : « champ utilisé pour caractériser la rafale quotidienne » | m/s |
| `UN` / `UM` / `UX` | autres-parametres | humidité relative minimale / moyenne / maximale du jour | % |
| `DHUMI40` | autres-parametres | durée avec humidité ≤ 40 % | minutes |

**Codes qualité** (colonnes `Q` + nom du paramètre, d'après le descriptif) : 9 = donnée filtrée (premiers contrôles passés), 0 = protégée (validée définitivement), 1 = validée, 2 = douteuse en cours de vérification. → Règle qualité possible : écarter les valeurs de code 2.

**Piège 1 : la journée de pluie n'est pas le jour calendaire.** `RR` du jour J couvre de 06 h FU le jour J à 06 h FU le lendemain. Pour un feu parti l'après-midi du jour J, la pluie « du jour J » inclut donc la nuit suivante, après le départ du feu. Pour savoir s'il avait plu avant un feu, il faut regarder `RR` de J-1, qui s'arrête à 06 h FU le jour J.

**Piège 2 : l'API tabulaire déforme les codes qualité.** Lus via l'API data.gouv, certains codes qualité apparaissent en `true` au lieu d'un chiffre (`QTN: true`, `QTX: true`), alors que le descriptif annonce des valeurs 0, 1, 2 ou 9. Pour le chargement, il faudra lire les CSV d'origine et non passer par l'API.

**Toutes les stations ne mesurent pas tout** (relevé du 2025-07-15, 20 stations) :
- 16 stations ont une valeur `FFM`, 4 non (Cuges-les-Pins, La Destrousse, Marseille-Obs, St Chamas)
- 19 ont une valeur `TX` ; Cap Couronne n'a ni `RR` ni `TX` ce jour-là, seulement le vent (`FFM`, `FXI`)

→ Pour avoir une valeur par jour pour le 13, il faudra choisir des stations de référence ou faire une moyenne, en gérant les manques (point qualité pour Ghiles).

**Marseille est dedans**
Deux stations portent le numéro de commune 13055 (Marseille) : Marseille-Obs et Marseille. Si on décide d'exclure Marseille du périmètre SDIS 13, on peut le faire ici avec les coordonnées ou le numéro de poste, contrairement à la Météo des forêts qui ne donne qu'une valeur par département.

**Exemple de journée** : le 2025-07-15, aucune pluie (`RR` = 0) sur les 19 stations du 13 qui la mesurent, `TX` entre 31,8 et 37,9 °C, rafale du jour (`FXI3S`, le champ que le descriptif désigne pour la rafale) jusqu'à 16,7 m/s au Bec de l'Aigle, soit environ 60 km/h. À titre de comparaison, `FXI` (vent instantané) y vaut 18,1 m/s : `FXI` est toujours un peu plus fort que `FXI3S` sur les stations relevées ce jour-là. Pour le projet, on utilisera `FXI3S`, conformément au descriptif.

## À faire
- Télécharger le fichier 1950-2024 du 13 et calculer la date minimale de `AAAAMMJJ` (date de début réelle), et la date de début de chaque station.
