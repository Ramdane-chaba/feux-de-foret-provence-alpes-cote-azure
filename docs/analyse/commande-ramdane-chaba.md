# Analyse de la commande - Ramdane CHABA

## 1. Les questions

Quatre questions dont la réponse aiderait la direction à trancher.

> [!test] Test
> Le test : si la réponse est X, la direction fait A ; si elle est Y, elle fait B. Si A et B sont identiques, ce n'est pas une question analytique pertinente.

1. Pour décider où mettre les moyens, la direction a besoin de savoir si les départs de feu dans le 13 reviennent toujours dans les mêmes communes / massifs d'une année sur l'autre ou s'ils sont éparpillés.
   Si ce sont souvent les mêmes zones → on y concentre les patrouilles et le guet. Si c'est dispersé → on garde une couverture sur tout le département.

2. Pour décider quand renforcer, la direction a besoin de savoir s'il y a des périodes où les départs de feu sont plus nombreux (mois, jours de la semaine, heures).
   Si oui → on renforce seulement sur ces créneaux et on économise le reste du temps. Si non → il faut renforcer toute la journée les jours déclenchés.

3. Pour choisir à quel niveau de la Météo des forêts on déclenche le dispositif renforcé, la direction a besoin de savoir pour chaque niveau combien de jours ont eu au moins un départ de feu dans le 13, combien de jours on aurait déclenché pour rien, combien de feux sont partis un jour où on n'aurait pas déclenché, et combien de jours de renfort ça ferait sur une saison.
   Selon la réponse, on garde le seuil actuel, on le monte (trop de fausses alertes / trop cher) ou on le baisse (trop de feux ratés).

4. Pour savoir si le 13 doit avoir son propre seuil, la direction a besoin de savoir si l'indice "marche" pareil chez nous que dans les autres départements de PACA et en France (même niveau d'indice = même nombre de feux ?).
   Si c'est pareil → on peut reprendre un seuil commun et ce que font les autres SDIS. Si le 13 a plus (ou moins) de feux à niveau égal → seuil spécifique au département.

## 2. Les termes inconnus

Les mots de la commande que vous ne savez pas définir précisément, ou qui peuvent se comprendre de plusieurs façons.

| Terme | Ce que je crois qu'il veut dire | Ce qu'il faudrait vérifier |
|---|---|---|
| Météo des forêts | Indice de danger feu de forêt de Météo-France, avec plusieurs niveaux | Combien de niveaux, à quelle échelle (département, zone, massif), prévision pour le jour même ou le lendemain, depuis quand ça existe |
| Seuil actuel | Le niveau d'indice à partir duquel le SDIS 13 déclenche aujourd'hui | La valeur exacte, et si c'est le même partout dans le département |
| Danger élevé | Un niveau de l'indice | Nom officiel d'un niveau ou juste une façon de parler des chefs de centre ? |
| Feu de forêt | Incendie en forêt | Différence avec feu de végétation / d'espace naturel, surface minimum pour être compté ? |
| Départ de feu | Endroit et moment où le feu démarre | Est-ce qu'un petit feu éteint tout de suite compte ? Localisation précise ou juste la commune ? |
| Dispositif renforcé | Patrouilles, guet, moyens en plus les jours à risque | Ce qu'il y a dedans exactement et combien ça coûte par jour |
| Moyens humains et financiers | Les pompiers / vigies et le budget de la saison | Qu'est-ce qui peut vraiment être déplacé d'une zone à l'autre ? |
| Été | La saison des feux, à peu près juin à septembre | Dates de début et fin retenues par le SDIS |
| Région | PACA | Liste des départements à comparer (04, 05, 06, 13, 83, 84) |
| Se situer par rapport au national | Comparer le 13 aux autres départements | Comparer quoi ? Nombre de feux, surface brûlée, feux par rapport à la surface de forêt, comportement de l'indice ? |

## 3. Les besoins

La décision à éclairer, en une phrase :

Savoir où et quand concentrer les moyens du SDIS 13 en 2027, et à partir de quel niveau de la Météo des forêts déclencher le dispositif renforcé, sans dépasser le budget.

Ce qui manque dans la commande pour y répondre (une information, une précision, une hypothèse à confirmer) :
- le seuil actuel (sinon on ne peut pas dire s'il est bon ou pas)
- combien coûte une journée de dispositif renforcé et le budget total → combien de jours on peut se permettre
- ce que la direction préfère éviter : déclencher pour rien ou rater un feu ?
- leur définition d'un feu de forêt (surface mini, type de végétation)
- à quelle échelle ils veulent décider : tout le département, par zone météo, par massif, par secteur de caserne ?
- où sont les moyens aujourd'hui (casernes, tours de guet)
- depuis quand la Météo des forêts existe : si c'est récent on aura peu de saisons pour fixer un seuil, à confirmer

## 4. Les données

Pour chaque question, la donnée qu'il vous faudrait idéalement pour répondre.

| Question | Donnée idéale | Grain (une ligne = ?) | Période | Fraîcheur | Emprise géographique |
|---|---|---|---|---|---|
| 1 | Départs de feu avec localisation précise (coordonnées ou commune + massif), date, surface brûlée | Un départ de feu | 10 saisons minimum pour voir ce qui se répète | Jusqu'à l'été 2026 inclus | 13 à la commune / massif, + PACA et France pour comparer |
| 2 | Départs de feu avec date et heure de début (ou d'alerte) | Un départ de feu | 10 saisons minimum | Jusqu'à l'été 2026 inclus | 13, + PACA pour comparer |
| 3 | Niveau de l'indice par jour et par zone + nombre de départs de feu et surface brûlée ce jour-là dans la zone + coût d'une journée de renfort | Un jour x une zone de l'indice | Toutes les saisons depuis que l'indice existe | Jusqu'à l'été 2026 inclus | 13, au découpage de l'indice |
| 4 | Même chose que la 3 mais pour tous les départements | Un jour x une zone de l'indice | Toutes les saisons depuis que l'indice existe | Jusqu'à l'été 2026 inclus | Tous les départements de PACA + France métropolitaine |

## 5. Confrontation avec les sources

Mes questions (sections 1 et 4) face aux sources de l'inventaire du groupe, au 2026-11-17. Les numéros sont ceux de mon analyse ; correspondance avec la liste commune proposée (D004) : mon Q1 = Q1 Où, mon Q2 = Q2 Quand, mon Q3 = Q3 Seuil + Q4 Budget, mon Q4 = Q5 Comparaison.

Sources (fiches dans `docs/sources/`) :
- **MdF** : Archives de la Météo des forêts (fiche de Ghiles)
- **BDIFF** : Base de données sur les incendies de forêt (fiche de Ouissem)
- **Climato** : Données climatologiques de base quotidiennes (ma fiche)
- **SDIS** : Interventions des services d'incendie et de secours (ma fiche)

### 5.1 Matrice

| Question | MdF | BDIFF | Climato | SDIS |
|---|---|---|---|---|
| **Q1 Où** : les feux du 13 reviennent-ils dans les mêmes communes / massifs ? | **absent** : une seule valeur par département, rien sur le lieu des feux (rubrique « Emprise géographique ») | **partiel** : un feu par ligne avec le code INSEE de la commune (rubriques « Grain » et « Clés disponibles »), sur 2006-2025 donc plus de 10 saisons. Mais localisation à la commune, pas au massif, et 2026 pas encore publiée (rubrique « Période réellement couverte ») | **absent** : des stations météo, rien sur le lieu des feux (rubrique « Grain ») | **absent** : totaux annuels par service, sans commune (rubrique « Grain ») |
| **Q2 Quand** : mois, jours de la semaine, heures | **absent** : donne un niveau de danger, pas des feux (rubrique « Grain ») | **partiel** : date d'alerte pour chaque feu, donc mois et jour de la semaine possibles (rubrique « Clés disponibles »). L'heure n'est pas citée dans la fiche : **inconnu** pour les heures. La date d'alerte n'est pas forcément l'heure de départ du feu (section « Pour le glossaire »). 2026 absente | **partiel** : donne les conditions météo de chaque jour (`RR`, `TX`, `FXI3S`), utile pour expliquer les jours à feux, mais ne compte pas les feux (rubrique « Questions ») | **absent** : totaux annuels, sans date (rubrique « Grain ») |
| **Q3 Seuil et jours de renfort** : pour chaque niveau, jours avec feu, fausses alertes, feux manqués, nombre de jours de renfort | **partiel** : le bon grain, un jour × un département, avec `niveau_j1` (rubrique « Grain »). Mais seulement 3 saisons, 2024, 2025 et 2026, de fin mai ou juin à fin septembre ou début octobre (rubrique « Période réellement couverte »), une seule valeur pour tout le 13 (section « Ce que j'ai découvert », point 5), et `date` = jour de diffusion, pas jour du danger (même section, point 1) | **partiel** : les feux par jour et par département via la date d'alerte (rubrique « Clés disponibles »), mais pas le niveau de l'indice. Croisée avec MdF, seules 2024 et 2025 se recouvrent, car 2026 n'est pas publiée (rubrique « Période réellement couverte ») | **partiel** : donnée indirecte. Pas le niveau de la Météo des forêts, mais pluie, température, vent et humidité jour par jour pour recalculer un indice proche (rubrique « Questions »). Date de début non vérifiée (rubrique « Période réellement couverte ») | **absent** : totaux annuels, impossible à croiser avec un jour (rubrique « Grain ») |
| **Q4 Comparaison** : l'indice « marche »-t-il pareil dans le 13, en PACA et en France ? | **partiel** : les 96 départements de l'Hexagone et de la Corse (rubrique « Emprise géographique »), mais 3 saisons seulement (rubrique « Période réellement couverte ») | **partiel** : toute la France (rubrique « Emprise géographique »), mais seul l'export PACA a été ouvert, et un export est limité à 30 000 lignes, donc plusieurs exports seront nécessaires pour la France (rubrique « Mode d'accès et format ») | **partiel** : un fichier par département pour toute la France (rubrique « Emprise géographique »), mais 1,2 million de lignes pour le 13 seul (rubrique « Volumétrie ») | **partiel** : un total par service et par an, colonne `Feux de végétations`, pour comparer les départements entre eux. Mais grain annuel, ce sont des interventions et non des feux de forêt, et la colonne manque en 2010 et 2013 (section « Ce que j'ai remarqué ») |

Les coûts demandés en Q3 (coût d'une journée de dispositif renforcé) et le seuil actuel ne sont dans **aucune** source : ce sont des données internes au SDIS 13.

### 5.2 Décisions

Aucune de mes questions n'a de source « complet ».

**Q1 Où → approximer**
- Proxy : la commune du feu (BDIFF) à la place du massif.
- Ce qu'il mesure mal : une grande commune peut couvrir plusieurs massifs, et un massif s'étend souvent sur plusieurs communes. On verra si des communes reviennent chaque année, pas des massifs. Et la saison 2026 manque.

**Q2 Quand → vérifier d'abord, puis approximer**
- Les heures sont « inconnu » : il faut d'abord ouvrir le fichier BDIFF pour voir s'il contient une heure d'alerte.
- Ensuite, on utilisera la date (et l'heure si elle existe) d'alerte à la place de l'heure de départ. Ce proxy mesure mal le vrai départ : l'alerte arrive après le début du feu.

**Q3 Seuil et jours de renfort → approximer + collecter**
- Approximer : croiser MdF et BDIFF sur 2024 et 2025, soit 240 jours pour le 13, en décalant la date MdF d'un jour. C'est peu, surtout pour le niveau 4, qui est rare.
- Pour rallonger, recalculer un indice proche de l'IFM avec Climato. Ce qu'il mesure mal : ce n'est pas le niveau officiel (pas l'ajustement des prévisionnistes de Météo-France), et on n'a que des valeurs quotidiennes. La faisabilité est à vérifier.
- Collecter : demander à la direction le coût d'une journée de dispositif renforcé et le seuil actuel. Sans eux, on ne peut pas chiffrer les jours de renfort en budget.

**Q4 Comparaison → renoncer en partie (reformuler)**
- Comparaison jour par jour seulement entre le 13 et les 5 autres départements de PACA, sur 2024-2025 (MdF et BDIFF).
- Pour la France, comparaison à un grain plus large : nombre de feux par an (BDIFF) et interventions par an (SDIS), sans croiser avec l'indice. Le croisement national jour par jour demanderait trop d'exports BDIFF et trop de volume Climato pour le temps du projet.
