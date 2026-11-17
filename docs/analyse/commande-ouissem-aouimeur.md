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

## 5. Confronter mes questions aux sources

Sources de l'inventaire du groupe : **BDIFF** (fiche d'Ouissem), **Météo des forêts** (fiche de Ghiles), **Données climatologiques** (fiche de Ramdane), **Interventions SIS** (fiche de Ramdane).

Degrés : **complet** / **partiel** / **absent** / **inconnu**. Chaque degré cite la rubrique de la fiche ou la colonne du fichier qui le justifie.

### La matrice

| Question | BDIFF | Météo des forêts | Données climatologiques | Interventions SIS |
|---|---|---|---|---|
| **1. Où** sont les feux les plus fréquents et les plus étendus dans le 13 (communes ou massifs) | **partiel** : `Code INSEE`, `Date de première alerte` et `Surface parcourue (m2)` donnent chaque feu par commune. Mais le CSV n'a **pas de coordonnées** (aucune colonne de latitude ou longitude parmi les 24), et **pas de massif**. | **absent** : une seule valeur par département (`num_dep`), et aucun feu. | **absent** : des mesures météo par station (`NUM_POSTE`, `AAAAMMJJ`), et aucun feu. | **absent** : rubrique Grain = un service × une année, pas de commune. |
| **2. Seuil** : pour chaque niveau de l'indice, la part des jours avec au moins un feu | **partiel** : `Date de première alerte` et `Département` permettent de savoir quels jours ont eu un feu, mais la source ne contient pas le niveau de l'indice. | **partiel** : `niveau_j1` par `num_dep` et par jour, mais **seulement 3 saisons** (rubrique Période : 2024 à 2026, soit 371 jours pour le 13), de **juin à septembre** uniquement, et à l'échelle du **département**, pas d'une zone. | **partiel** (donnée indirecte) : `RR`, `TX`, `FFM`, `UN` permettraient de recalculer un indice proche de l'IFM sur une période plus longue, mais la méthode n'est pas vérifiée (rubrique Questions de la fiche). | **absent** : rubrique Grain = totaux annuels, pas de jour. |
| **3. Budget** : jours de renfort par seuil, feux partis sous le seuil, coût d'une journée | **partiel** : `Date de première alerte` permet de compter les feux partis sous un seuil, une fois croisée avec la Météo des forêts. Pas de coût. | **partiel** : `niveau_j1` permet de compter les jours où chaque niveau est atteint, sur 3 saisons seulement. Pas de coût. | **absent** : aucune colonne de coût ni de moyens. | **absent** : rubrique Grain = nombre d'interventions par an, pas de coût ni de jour. |
| **4. Comparaison** : à niveau égal, l'indice annonce-t-il aussi bien les feux dans le 13, en PACA et en France ? | **partiel** : `Département` et `Date de première alerte` couvrent toute la France, mais l'export est limité à 30 000 lignes (rubrique Mode d'accès), et la source ne contient pas le niveau de l'indice. | **partiel** : 96 départements (rubrique Emprise), mais 3 saisons seulement et pas d'outre-mer. | **partiel** (donnée indirecte) : un fichier par département pour toute la France, mais 1,2 million de lignes pour le 13 seul (rubrique Volumétrie). | **absent** : `Feux de végétations` donne des totaux annuels par département. Ça permet de comparer des volumes d'interventions, mais pas le comportement de l'indice « à niveau égal », car il n'y a pas de jour. |

**Aucune de mes questions n'a de source « complet ».** Chacune appelle donc une décision.

### Mes décisions

| Question | Décision | Pourquoi | Ce que ça coûte |
|---|---|---|---|
| **1. Où** | **renoncer en partie : reformuler au grain de la commune** | La BDIFF localise les feux à la commune (`Code INSEE`), pas au massif ni au point précis. La question devient : « dans quelles **communes** du 13 les feux sont-ils les plus fréquents et les plus étendus ? ». | On ne pourra pas parler de massifs, alors qu'un massif s'étend souvent sur plusieurs communes. Il faudra aussi décider si on garde Marseille (code `13055`), défendue par les marins-pompiers. |
| **2. Seuil** | **approximer** : croiser la BDIFF et la Météo des forêts sur les 3 saisons disponibles, puis chercher un historique plus long avec l'IFM (de Copernicus, ou recalculé avec les données climatologiques) | Les archives de la Météo des forêts ne commencent qu'en 2024. | 3 saisons, c'est peu, surtout pour le niveau 4, qui est rare. L'IFM mesure mal le danger réel : il ne prend en compte que la météo, alors que la Météo des forêts ajoute l'état de sécheresse de la végétation et un ajustement par département (d'après la fiche de Ghiles). |
| **3. Budget** | **collecter** le coût d'une journée de renfort auprès du SDIS 13, et en attendant **approximer** en comptant seulement les jours de renfort | Aucune source ne contient de coût. C'est une donnée interne au SDIS. | Sans le coût, on peut dire « ce seuil demande X jours de renfort », mais pas « ce seuil coûte X euros ». La direction devra faire elle-même la conversion. |
| **4. Comparaison** | **approximer** : comparer le 13, PACA et la France métropolitaine sur les 3 saisons communes (2024 à 2026), avec la BDIFF et la Météo des forêts | Ce sont les deux seules sources qui ont à la fois le jour et le département. | Seulement 3 saisons, et pas d'outre-mer. L'export national de la BDIFF devra être découpé en plusieurs fichiers à cause de la limite de 30 000 lignes. |

### L'écart entre ce que j'avais prévu et ce qui existe

- **Ce que j'avais bien prévu** : je me demandais depuis quelle date existe la Météo des forêts (section 2), et en effet son historique est court. J'avais aussi noté que le coût d'une journée de renfort manquait dans la commande (section 3) : aucune source ne le donne.
- **Ce que j'avais imaginé et qui n'existe pas** :
  - des feux avec leurs **coordonnées** ;
  - un **découpage en massifs** ;
  - un indice par **zone de prévision**. En réalité, il n'y a qu'une valeur par département.
- **Ce que je n'avais pas prévu** :
  - la date de la Météo des forêts est la date de diffusion, et le niveau concerne le lendemain ;
  - Marseille est défendue par les marins-pompiers, pas par le SDIS 13 ;
  - la cause du feu manque dans 37 % des cas pour le 13.