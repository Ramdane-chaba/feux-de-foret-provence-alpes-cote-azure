# Analyse de la commande - Ouissem Aouimeur

## 1. Les questions

Quatre questions dont la réponse aiderait la direction à trancher.

> [!test] Test
> Le test : si la réponse est X, la direction fait A ; si elle est Y, elle fait B. Si A et B sont identiques, ce n'est pas une question analytique pertinente.

1. **Pour décider où concentrer ses moyens, la direction a besoin de savoir dans quelles communes ou quels massifs du 13 les départs de feu sont les plus fréquents et les plus étendus.**
   Si quelques zones concentrent les feux, elle y place la surveillance et les patrouilles. Si les feux sont répartis partout, elle répartit les moyens et mise sur la prévention.

2. **Pour décider à quel seuil déclencher le dispositif renforcé, la direction a besoin de savoir, pour chaque niveau de la Météo des forêts, quelle part des jours a connu au moins un départ de feu.**
   Si cette part augmente nettement à partir d'un niveau, elle place le seuil à ce niveau. Si elle reste à peu près la même à tous les niveaux, l'indice seul ne suffit pas et elle doit le combiner avec un autre critère (zone, période).

3. **Pour décider d'un seuil qui tient dans le budget, la direction a besoin de savoir, pour chaque seuil possible, combien de jours de renfort il faudrait par été et combien de feux sont partis sous ce seuil.**
   Un seuil bas coûte cher mais laisse passer peu de feux. Un seuil haut coûte moins cher mais en laisse passer davantage. Elle choisit le seuil qui rentre dans le budget avec le moins de feux manqués.

4. **Pour savoir si elle peut se fier à l'indice, la direction a besoin de savoir si, à niveau égal, il annonce aussi bien les feux dans le 13 que dans les autres départements de PACA (04, 05, 06, 83, 84) et en France.**
   Si l'indice marche ailleurs mais pas dans le 13, le problème est local : elle adapte le seuil au département. S'il marche mal partout, elle ne s'appuie pas uniquement sur lui.

## 2. Les termes inconnus

Les mots de la commande que vous ne savez pas définir précisément, ou qui peuvent se comprendre de plusieurs façons.

| Terme | Ce que je crois qu'il veut dire | Ce qu'il faudrait vérifier |
|---|---|---|
| Départ de feu | Un feu qui démarre dans la nature, à un endroit et à un moment donnés | Compte-t-on tous les feux, même éteints en quelques minutes, ou seulement ceux qui ont donné lieu à une intervention ? |
| Feu de forêt | Un feu qui brûle de la végétation | Seulement la forêt, ou aussi la garrigue, le maquis et les broussailles ? |
| Météo des forêts | Un indice de Météo-France qui annonce le danger de feu selon la météo | Combien de niveaux, sur quelle zone géographique, depuis quelle date ? |
| Danger élevé | Un des niveaux hauts de la Météo des forêts | De quel niveau exact parlent les chefs de centre ? Du niveau prévu la veille ou de celui du jour ? |
| Dispositif renforcé | Des moyens supplémentaires mis en place les jours à risque | Quels moyens concrètement, et combien coûte une journée ? |
| Patrouille / guet | La surveillance des massifs pour repérer un feu tôt | Postes fixes ou équipes mobiles ? Sur quel territoire ? |
| Massif | Une grande zone naturelle du département (Calanques, Sainte-Victoire…) | Quelle est la liste officielle et où sont les limites de chaque massif ? |
| Département | Les Bouches-du-Rhône | Le territoire du SDIS 13 est-il exactement celui du code INSEE 13 ? Marseille semble défendue par les marins-pompiers, pas par le SDIS. |

## 3. Les besoins

La décision à éclairer, en une phrase : **où renforcer les moyens et à partir de quel niveau de la Météo des forêts déclencher le dispositif renforcé, sans dépasser le budget de l'été 2027.**

Ce qui manque dans la commande pour y répondre (une information, une précision, une hypothèse à confirmer) :
- le budget disponible et le coût d'une journée de dispositif renforcé ;
- le seuil actuellement utilisé, pour pouvoir le comparer à d'autres seuils ;
- ce que la direction appelle un « départ de feu » : tous les feux ou seulement ceux avec une intervention ;
- le territoire exact couvert par le SDIS 13, à confirmer (Marseille en fait-elle partie ?) ;
- les moyens actuels et leur emplacement (centres de secours, postes de guet).

## 4. Les données

Pour chaque question, la donnée qu'il vous faudrait idéalement pour répondre.

| Question | Donnée idéale | Grain (une ligne = ?) | Période | Fraîcheur | Emprise géographique |
|---|---|---|---|---|---|
| 1 | Historique des départs de feu avec leur lieu et leur surface brûlée, plus le découpage des massifs | Un feu : date, commune, coordonnées, surface brûlée, cause | Au moins 10 ans, jusqu'à l'été 2026 | Annuelle, après chaque saison | Bouches-du-Rhône |
| 2 | Niveau quotidien de la Météo des forêts, croisé avec les départs de feu du même jour | Un jour dans une zone de prévision : niveau de l'indice, nombre de feux | Toutes les saisons depuis la création de l'indice | Quotidienne en saison | Bouches-du-Rhône |
| 3 | Les mêmes données que la question 2, plus le coût d'une journée de renfort | Un jour dans une zone : niveau, feux ; un type de moyen : coût par jour | Les mêmes années que Q2, budget 2027 | Annuelle | Bouches-du-Rhône |
| 4 | Niveau quotidien de l'indice et départs de feu, pour tous les départements | Un jour dans un département : niveau de l'indice, nombre de feux | Les mêmes années que Q2 | Annuelle | France entière (PACA en détail) |
