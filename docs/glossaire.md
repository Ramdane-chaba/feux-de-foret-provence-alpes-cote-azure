# Glossaire — Provence-Alpes-Côte d'Azur

Dernière mise à jour : 2026-11-16

Version 0, construite à partir des trois analyses individuelles de la commande (Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur). Les doublons ont été fusionnés ; la ligne « Ajouté par » indique qui a proposé chaque terme. Tant qu'une définition n'est pas confirmée par la documentation d'un producteur ou par une décision du groupe, son statut reste « à vérifier ».

## Commune (code INSEE)

- **Définition :** plus petite division administrative du territoire, identifiée par un code à cinq chiffres attribué par l'INSEE. C'est le niveau auquel la plupart des sources localisent un départ de feu.
- **Sources et colonnes :** à compléter à l'ouverture des sources (bases de feux, référentiel INSEE des communes).
- **Divergences :** les codes changent d'une année à l'autre à cause des fusions de communes. Un feu de 2017 peut porter un code qui n'existe plus aujourd'hui.
- **Règle retenue :** à décider. Proposition : rattacher chaque feu au référentiel INSEE de son année, puis le convertir vers le référentiel le plus récent.
- **Unité ou granularité :** une commune.
- **Exemple :** à compléter.
- **Statut :** proposé.
- **Origine de la définition :** INSEE (Code officiel géographique), à confirmer.
- **Ajouté par :** Ouissem Aouimeur, 2026-11-16.

## Danger élevé (niveau de danger)

- **Définition :** un des niveaux de l'échelle de la Météo des forêts. Dans la commande, l'expression est employée par les chefs de centre (« l'indice annonce souvent un danger élevé ») ; elle s'oppose à l'indice « au plus bas », c'est-à-dire le niveau le plus faible.
- **Sources et colonnes :** Météo des forêts (Météo-France), colonne du niveau de danger, à identifier.
- **Divergences :** « danger élevé » peut désigner le niveau nommé « élevé » seulement, ou « élevé et au-dessus » (élevé + très élevé). Il faut aussi savoir si les chefs de centre parlent du niveau prévu la veille ou de celui du jour.
- **Règle retenue :** à décider, après échange avec la direction.
- **Unité ou granularité :** un niveau, pour un jour et un département.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** échelle à quatre niveaux de la Météo des forêts (faible, modéré, élevé, très élevé), d'après les communications publiques de Météo-France ; sens employé par les chefs de centre à confirmer.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Départ de feu

- **Définition :** feu qui démarre dans un espace naturel, à un lieu et à un moment donnés, quelle que soit la surface qu'il brûle ensuite. C'est l'événement que la direction cherche à prévenir et à combattre.
- **Sources et colonnes :** à compléter à l'ouverture des sources (bases de feux, données d'intervention du SDIS).
- **Divergences :** une base de feux recense des feux de forêt (avec parfois un seuil de surface ou de type de végétation), alors que les données d'un SDIS recensent des interventions. Un petit feu éteint en quelques minutes peut figurer dans l'une et pas dans l'autre. La localisation peut être un point précis ou seulement la commune.
- **Règle retenue :** à décider. Question à poser à la direction : compte-t-elle tous les départs de feu, ou seulement ceux qui ont donné lieu à une intervention ?
- **Unité ou granularité :** un feu (date, heure, lieu).
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Département (territoire du SDIS 13)

- **Définition :** dans la commande, les Bouches-du-Rhône, territoire dont le SDIS 13 a la charge.
- **Sources et colonnes :** à compléter (code département dans les bases de feux et dans la Météo des forêts).
- **Divergences :** le département INSEE 13 et le territoire défendu par le SDIS 13 ne coïncident pas : Marseille est défendue par le Bataillon de marins-pompiers de Marseille, et non par le SDIS. Compter les feux du code 13 sans distinction attribuerait au SDIS des feux qu'il ne combat pas.
- **Règle retenue :** à décider. Faut-il exclure Marseille des analyses du SDIS 13, ou la garder pour les comparaisons avec les autres départements ? Décision à consigner dans le journal.
- **Unité ou granularité :** un département ; une commune pour exclure Marseille.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande ; périmètre du SDIS 13 à confirmer auprès de la direction.
- **Ajouté par :** Ghiles Mekdam, Ouissem Aouimeur, 2026-11-16.

## Dispositif renforcé

- **Définition :** ensemble de moyens supplémentaires que le SDIS active les jours où le danger est jugé élevé : patrouilles, guet, pré-positionnement de moyens.
- **Sources et colonnes :** donnée interne au SDIS 13, probablement absente de l'open data.
- **Divergences :** aucune repérée pour l'instant.
- **Règle retenue :** à décider. À demander au SDIS : la liste exacte des moyens, le coût d'une journée, et la possibilité de ne le déclencher que sur une partie du département.
- **Unité ou granularité :** une journée de déclenchement, sur tout ou partie du département.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** commande de la direction du SDIS 13.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Feu de forêt

- **Définition :** incendie qui touche un espace naturel boisé ou couvert de végétation (forêt, mais aussi, selon les définitions, garrigue, maquis et landes).
- **Sources et colonnes :** BDIFF (base nationale), Prométhée (base des départements méditerranéens) ; colonnes à identifier.
- **Divergences :** pour Prométhée, un feu de garrigue est un feu de forêt méditerranéenne ; la BDIFF s'appuie sur une définition de la forêt (couvert arboré minimal, surface minimale) et classe certains espaces à part. En Provence, inclure ou non la garrigue et le maquis change fortement le nombre de feux.
- **Règle retenue :** à décider après lecture des documentations de la BDIFF et de Prométhée.
- **Unité ou granularité :** un feu.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** documentations de la BDIFF et de Prométhée, à lire en détail.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Indice forêt météo (IFM)

- **Définition :** indice calculé à partir des conditions météorologiques (température, humidité, vent, pluie) qui estime la facilité avec laquelle un feu peut démarrer et se propager. C'est la base de calcul de la Météo des forêts.
- **Sources et colonnes :** Météo-France, à identifier.
- **Divergences :** l'IFM est une valeur numérique continue, alors que la Météo des forêts la traduit en niveaux de danger en tenant compte d'autres éléments (surface forestière, activités humaines).
- **Règle retenue :** à décider. Proposition : utiliser l'IFM comme donnée de remplacement pour les années antérieures à la Météo des forêts (avant 2023), si l'historique de celle-ci est trop court.
- **Unité ou granularité :** une valeur par jour et par point ou zone de calcul, à confirmer.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** Météo-France.
- **Ajouté par :** Ouissem Aouimeur, 2026-11-16.

## Massif

- **Définition :** grand ensemble naturel du département, souvent boisé ou couvert de garrigue (par exemple les Calanques, la Sainte-Victoire, les Alpilles). C'est une échelle possible pour concentrer les patrouilles et le guet.
- **Sources et colonnes :** à compléter (découpage des massifs, éventuellement dans les plans de protection des forêts contre l'incendie).
- **Divergences :** pas de liste ni de limites officielles identifiées pour l'instant ; un massif peut s'étendre sur plusieurs communes.
- **Règle retenue :** à décider.
- **Unité ou granularité :** un massif (contour géographique).
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Météo des forêts

- **Définition :** prévision quotidienne du danger de feu de forêt publiée par Météo-France pendant la saison, sur une échelle de quatre niveaux (faible, modéré, élevé, très élevé). Elle s'appuie sur l'indice forêt météo et tient compte de la surface forestière et des zones d'activité humaine de chaque département.
- **Sources et colonnes :** Météo-France, à identifier.
- **Divergences :** les analyses supposaient un découpage par zones à l'intérieur du département ; les premières recherches indiquent une publication par département. Le niveau est publié pour le lendemain et le surlendemain : il faut savoir lequel est utilisé pour déclencher le dispositif.
- **Règle retenue :** à décider.
- **Unité ou granularité :** un niveau par jour et par département (à confirmer).
- **Exemple :** à compléter.
- **Statut :** à vérifier (date de lancement annoncée en juin 2023, à confirmer).
- **Origine de la définition :** communications publiques de Météo-France.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Moyens humains et financiers

- **Définition :** effectifs (sapeurs-pompiers, vigies, patrouilleurs), matériels et budget dont dispose le SDIS 13 pour la saison feux.
- **Sources et colonnes :** données internes au SDIS 13.
- **Divergences :** aucune repérée pour l'instant.
- **Règle retenue :** à décider. À demander : quels moyens peuvent réellement être déplacés d'une zone à l'autre, et où ils se trouvent aujourd'hui (centres de secours, postes de guet).
- **Unité ou granularité :** un moyen, ou un montant de budget pour une saison.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** commande de la direction du SDIS 13.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, 2026-11-16.

## Patrouille et guet

- **Définition :** surveillance des massifs pour repérer un départ de feu le plus tôt possible : le guet depuis des postes fixes (tours de guet), les patrouilles par des équipes mobiles.
- **Sources et colonnes :** données internes au SDIS 13.
- **Divergences :** aucune repérée pour l'instant.
- **Règle retenue :** à décider.
- **Unité ou granularité :** un poste de guet ou une patrouille, par jour.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ouissem Aouimeur, 2026-11-16.

## Région

- **Définition :** la région Provence-Alpes-Côte d'Azur, avec laquelle la direction veut comparer les Bouches-du-Rhône.
- **Sources et colonnes :** référentiel INSEE.
- **Divergences :** aucune repérée.
- **Règle retenue :** six départements : Alpes-de-Haute-Provence (04), Hautes-Alpes (05), Alpes-Maritimes (06), Bouches-du-Rhône (13), Var (83), Vaucluse (84).
- **Unité ou granularité :** un département.
- **Exemple :** à compléter.
- **Statut :** proposé.
- **Origine de la définition :** découpage administratif INSEE.
- **Ajouté par :** Ramdane Chaba, 2026-11-16.

## Saison feux (été)

- **Définition :** la période de l'année où le risque de feu de forêt est le plus fort, que la commande appelle « l'été », approximativement de juin à septembre.
- **Sources et colonnes :** arrêtés préfectoraux, calendrier du SDIS 13, période de publication de la Météo des forêts.
- **Divergences :** les dates officielles (réglementation, publication de la Météo des forêts) peuvent différer de la période où les feux ont réellement lieu, et la commande parle aussi de préparer « le printemps ».
- **Règle retenue :** à décider.
- **Unité ou granularité :** une période (date de début, date de fin) par année.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Seuil de déclenchement

- **Définition :** le niveau de la Météo des forêts à partir duquel le SDIS 13 déclenche le dispositif renforcé. La commande indique que le seuil actuel ne convient pas.
- **Sources et colonnes :** donnée interne au SDIS 13.
- **Divergences :** le seuil peut porter sur le niveau prévu la veille ou celui du jour ; il peut être unique pour tout le département ou différent selon les zones.
- **Règle retenue :** à décider. À demander : la valeur du seuil actuel et la façon dont il est appliqué.
- **Unité ou granularité :** un niveau de la Météo des forêts.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** commande de la direction du SDIS 13.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Surface brûlée

- **Définition :** la surface parcourue par un feu, en hectares. Elle permet de distinguer les nombreux petits feux des grands incendies.
- **Sources et colonnes :** bases de feux, colonnes à identifier.
- **Divergences :** la surface peut être mesurée (relevé de terrain, image satellite) ou estimée ; elle peut ne compter que la forêt ou toute la végétation brûlée.
- **Règle retenue :** à décider.
- **Unité ou granularité :** hectare, par feu.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ouissem Aouimeur, 2026-11-16.

## Territoire national

- **Définition :** le reste de la France, auquel la direction veut comparer les Bouches-du-Rhône.
- **Sources et colonnes :** référentiel INSEE.
- **Divergences :** la France métropolitaine seule, ou avec les départements d'outre-mer ? La Météo des forêts et les bases de feux ne couvrent pas forcément l'outre-mer. Il faut aussi préciser ce qu'on compare : nombre de feux, surface brûlée, feux rapportés à la surface forestière, ou comportement de l'indice.
- **Règle retenue :** à décider. Proposition : France métropolitaine.
- **Unité ou granularité :** un département.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, 2026-11-16.
