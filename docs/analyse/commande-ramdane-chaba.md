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
