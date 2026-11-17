# Glossaire — Provence-Alpes-Côte d'Azur

Dernière mise à jour : 2026-11-17 (confrontation des questions aux sources : colonnes réelles, divergences et nouveaux termes)

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
- **Sources et colonnes :** Météo des forêts, colonnes `niveau_j1` et `niveau_j2` : 1 = faible, 2 = modéré, 3 = élevé, 4 = très élevé.
- **Divergences :** « danger élevé » peut désigner le niveau 3 seulement, ou « 3 et au-dessus » (élevé + très élevé). Il faut aussi savoir si les chefs de centre parlent du niveau prévu la veille ou de celui du jour.
- **Règle retenue :** à décider, après échange avec la direction.
- **Unité ou granularité :** un niveau, pour un jour et un département.
- **Exemple :** Bouches-du-Rhône, saison 2025 : 49 jours au niveau 3 et 10 jours au niveau 4 (`niveau_j1`).
- **Statut :** à vérifier (codes confirmés par la documentation ; sens employé par les chefs de centre à confirmer).
- **Origine de la définition :** documentation Open Data de Météo-France (archives de la Météo des forêts).
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Date de première alerte

- **Définition :** le moment où les secours sont prévenus d'un feu. Ce n'est pas forcément le moment exact où le feu a démarré.
- **Sources et colonnes :** BDIFF, colonne `Date de première alerte` (date et heure).
- **Divergences :** la Météo des forêts date ses bulletins par leur diffusion (`date`), la veille du jour du danger ; les données climatologiques datent la pluie de 6 h le jour J à 6 h le lendemain (`AAAAMMJJ`). Les trois « jours » ne se recouvrent pas.
- **Règle retenue :** jointure avec la Météo des forêts sur `date` + 1 ([journal des décisions, D016](decisions.md), à décider).
- **Unité ou granularité :** date et heure, à la minute.
- **Exemple :** feu 2025-421 à Istres : `2025-01-04 21:48:00`.
- **Statut :** proposé.
- **Origine de la définition :** document `Définitions.pdf` de la BDIFF (relevé par Ouissem Aouimeur).
- **Ajouté par :** Ouissem Aouimeur, 2026-11-17.

## Départ de feu

- **Définition :** feu qui démarre dans un espace naturel, à un lieu et à un moment donnés, quelle que soit la surface qu'il brûle ensuite. C'est l'événement que la direction cherche à prévenir et à combattre.
- **Sources et colonnes :** BDIFF, une ligne par feu (`Année`, `Numéro`, `Code INSEE`, `Date de première alerte`) ; interventions SDIS, colonne `Feux de végétations` (un total annuel d'interventions).
- **Divergences :** la BDIFF recense des feux de forêt, localisés à la commune (pas de coordonnées), datés par la première alerte et non par l'heure réelle du départ. Les interventions SDIS comptent des interventions sur toute végétation, en total annuel. Un même feu peut donner plusieurs interventions, et un petit feu de bord de route peut figurer dans l'une et pas dans l'autre.
- **Règle retenue :** à décider. Question à poser à la direction : compte-t-elle tous les départs de feu, ou seulement ceux qui ont donné lieu à une intervention ?
- **Unité ou granularité :** un feu (date, heure, lieu).
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** analyses individuelles de la commande.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Département (territoire du SDIS 13)

- **Définition :** dans la commande, les Bouches-du-Rhône, territoire dont le SDIS 13 a la charge.
- **Sources et colonnes :** Météo des forêts `num_dep` (écrit `1` ou `01` selon l'année) ; BDIFF `Département` (`01`, `2A`…) et `Code INSEE` ; interventions SDIS `Numéro` (`13` pour le SDIS 13, `BMPM` pour Marseille) ; données climatologiques, deux premiers chiffres de `NUM_POSTE`.
- **Divergences :** le département INSEE 13 et le territoire défendu par le SDIS 13 ne coïncident pas : Marseille est défendue par le Bataillon de marins-pompiers de Marseille (BMPM), qui a sa propre ligne dans les interventions SDIS. La Météo des forêts ne donne qu'une valeur pour tout le département, Marseille comprise.
- **Règle retenue :** à décider ([journal des décisions, D005](decisions.md)) : périmètre du SDIS 13 seul (Marseille exclue par le `Code INSEE` 13055) ou département entier, BMPM compris.
- **Unité ou granularité :** un département ; une commune pour exclure Marseille.
- **Exemple :** interventions 2024, `Feux de végétations` : 1 403 pour la ligne `13`, 431 pour la ligne `BMPM`.
- **Statut :** proposé.
- **Origine de la définition :** fiche interventions SDIS (ligne BMPM), fiche BDIFF ; périmètre à confirmer auprès de la direction.
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

## Fausse alerte

- **Définition :** un jour où le dispositif renforcé aurait été déclenché, parce que le niveau de la Météo des forêts atteignait le seuil, sans qu'aucun départ de feu ne survienne. C'est la première plainte des chefs de centre (« l'indice annonce souvent un danger élevé alors qu'aucun feu ne se déclare »).
- **Sources et colonnes :** calculée en croisant `niveau_j1` (Météo des forêts) et `Date de première alerte` (BDIFF), par jour et par département.
- **Divergences :** dépend du seuil choisi, du périmètre (Marseille comprise ou non, D005) et de ce qu'on compte comme départ de feu (tous les feux de la BDIFF, ou seulement ceux au-dessus d'une surface).
- **Règle retenue :** à décider (Q4, [journal des décisions, D013](decisions.md)).
- **Unité ou granularité :** un jour, pour un département et un seuil donnés.
- **Exemple :** à compléter après le croisement 2024-2025.
- **Statut :** proposé.
- **Origine de la définition :** commande de la direction ; analyse de Ramdane Chaba (question 3) ; décision du groupe à venir.
- **Ajouté par :** Ramdane Chaba, 2026-11-17.

## Feu de forêt

- **Définition :** incendie qui touche un espace naturel boisé ou couvert de végétation (forêt, mais aussi, selon les définitions, garrigue, maquis et landes).
- **Sources et colonnes :** BDIFF, filtre « Type de feu : F » de l'export ; la surface est ventilée en `Surface forêt (m2)`, `Surface maquis garrigues (m2)`, `Autres surfaces naturelles hors forêt (m2)`, `Surfaces agricoles (m2)`… ; interventions SDIS, `Feux de végétations`.
- **Divergences :** d'après le document de définitions de la BDIFF, dans le Sud-Est un feu de garrigue ou de maquis compte comme un feu de forêt (colonne `Surface maquis garrigues (m2)` distincte). Les interventions SDIS comptent les « feux de végétations », catégorie plus large (broussailles, champs, bords de route) et non définie sur la fiche data.gouv : les deux chiffres ne sont pas comparables.
- **Règle retenue :** à décider. Proposition : un feu de forêt est un feu recensé par la BDIFF, garrigue et maquis compris.
- **Unité ou granularité :** un feu.
- **Exemple :** à compléter.
- **Statut :** à vérifier.
- **Origine de la définition :** document `Définitions.pdf` fourni dans l'export de la BDIFF (relevé par Ouissem Aouimeur) ; fiche interventions SDIS.
- **Ajouté par :** Ghiles Mekdam, Ramdane Chaba, Ouissem Aouimeur, 2026-11-16.

## Feu manqué

- **Définition :** un départ de feu survenu un jour où le niveau de la Météo des forêts était sous le seuil de déclenchement : le dispositif renforcé n'aurait pas été en place. C'est la seconde plainte des chefs de centre (« des feux partis des jours où l'indice était au plus bas »).
- **Sources et colonnes :** calculé en croisant `Date de première alerte` (BDIFF) et `niveau_j1` (Météo des forêts, jour du danger = `date` + 1, D016).
- **Divergences :** on peut compter des feux (un jour avec trois feux compte trois fois) ou des jours avec feu (compte une fois) ; les deux mesures ne donnent pas le même résultat.
- **Règle retenue :** à décider (Q4, [journal des décisions, D013](decisions.md)).
- **Unité ou granularité :** un feu, ou un jour avec feu, pour un seuil donné.
- **Exemple :** à compléter après le croisement 2024-2025.
- **Statut :** proposé.
- **Origine de la définition :** commande de la direction ; analyses de Ramdane Chaba (question 3) et d'Ouissem Aouimeur (question 3) ; décision du groupe à venir.
- **Ajouté par :** Ramdane Chaba, Ouissem Aouimeur, 2026-11-17.

## Feu de végétation (intervention)

- **Définition :** catégorie d'intervention des services d'incendie et de secours qui regroupe les feux touchant de la végétation, quelle qu'elle soit. C'est un nombre d'interventions, pas un nombre de feux.
- **Sources et colonnes :** interventions SDIS, colonne `Feux de végétations` (total annuel par service).
- **Divergences :** à ne pas confondre avec le feu de forêt de la BDIFF. La catégorie n'est pas définie sur la fiche data.gouv ; elle est absente des fichiers 2010 et 2013.
- **Règle retenue :** ne pas additionner ni comparer directement avec les feux de la BDIFF.
- **Unité ou granularité :** un nombre d'interventions, par service et par année.
- **Exemple :** SDIS 13, 2024 : 1 403 ; BMPM, 2024 : 431.
- **Statut :** à vérifier (définition du producteur non trouvée).
- **Origine de la définition :** fiche interventions SDIS.
- **Ajouté par :** Ramdane Chaba, 2026-11-17.

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

- **Définition :** prévision quotidienne du danger de feu de forêt publiée par Météo-France pendant la saison, depuis 2023, sur une échelle de quatre niveaux (faible, modéré, élevé, très élevé). Elle s'appuie sur l'Indice de danger intégré (IFM complété par l'état de sécheresse de la végétation) et tient compte de la surface forestière et des zones sensibles de chaque département.
- **Sources et colonnes :** archives de la Météo des forêts : `date` (date et heure de diffusion du bulletin, en UTC), `num_dep`, `niveau_j1` (danger prévu pour le lendemain), `niveau_j2` (pour le surlendemain), `nom_dep` (`dep_nom` en 2025).
- **Divergences :** les trois analyses supposaient un découpage par zones à l'intérieur du département : il n'existe que par département. La date du fichier n'est pas le jour du danger : `niveau_j1` s'applique au jour suivant la diffusion. L'archive ouverte commence en 2024, alors que le dispositif existe depuis 2023.
- **Règle retenue :** jour du danger = `date` + 1 pour `niveau_j1` ([journal des décisions, D016](decisions.md), à décider).
- **Unité ou granularité :** un niveau par bulletin quotidien et par département.
- **Exemple :** `2025-06-03T14:50:06Z,1,1,1,Ain` : bulletin du 3 juin 2025, danger faible (1) dans l'Ain pour le 4 et le 5 juin.
- **Statut :** proposé (définition confirmée par la documentation de Météo-France).
- **Origine de la définition :** présentation PDF et documentation Open Data de Météo-France, fournies avec les archives.
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

## Nature (cause du feu)

- **Définition :** l'origine présumée d'un feu : accidentelle, involontaire (travaux, particulier), malveillance, naturelle, etc.
- **Sources et colonnes :** BDIFF, colonne `Nature`.
- **Divergences :** la colonne est souvent vide : cause inconnue pour 37 % des feux du 13 entre 2006 et 2025, et presque toujours avant 2000. Le formulaire de saisie a changé en 2023.
- **Règle retenue :** à décider. Proposition : traiter « vide » comme une catégorie « cause inconnue », sans l'exclure.
- **Unité ou granularité :** une catégorie, par feu.
- **Exemple :** feu 2025-421 à Istres : `Malveillance`.
- **Statut :** proposé.
- **Origine de la définition :** export CSV de la BDIFF (fiche BDIFF).
- **Ajouté par :** Ouissem Aouimeur, 2026-11-17.

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

## Rafale du jour

- **Définition :** la plus forte pointe de vent de la journée, mesurée à 10 m de hauteur. Le vent favorise la propagation des feux.
- **Sources et colonnes :** données climatologiques quotidiennes, colonne `FXI3S` (vent moyenné sur 3 secondes, en m/s) ; la colonne `FXI` (vent instantané) donne des valeurs un peu plus fortes.
- **Divergences :** deux mesures possibles, `FXI` et `FXI3S`.
- **Règle retenue :** `FXI3S` ([journal des décisions, D017](decisions.md), à décider).
- **Unité ou granularité :** m/s, par station et par jour.
- **Exemple :** Bec de l'Aigle, 2025-07-15 : `FXI3S` = 16,7 m/s (environ 60 km/h).
- **Statut :** proposé.
- **Origine de la définition :** descriptif `CLIMATOLOGIE_Donnees_quotidiennes_descriptif.pdf` de Météo-France.
- **Ajouté par :** Ramdane Chaba, 2026-11-17.

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
- **Sources et colonnes :** BDIFF, `Surface parcourue (m2)` (surface totale), ventilée en `Surface forêt (m2)`, `Surface maquis garrigues (m2)`, etc. ; `Précision des surfaces` indique « Estimées » ou « Mesurées ».
- **Divergences :** le fichier donne les surfaces en m², le site de la BDIFF les affiche en hectares. Une partie des surfaces est estimée, une autre mesurée. La surface totale inclut aussi des surfaces agricoles ou artificialisées.
- **Règle retenue :** à décider. Proposition : utiliser `Surface parcourue (m2)` convertie en hectares (÷ 10 000).
- **Unité ou granularité :** hectare, par feu.
- **Exemple :** feu 2025-421 à Istres : `Surface parcourue (m2)` = 200 (0,02 ha), dont 173 m² de forêt, surfaces « Mesurées ».
- **Statut :** proposé.
- **Origine de la définition :** export CSV de la BDIFF (fiche BDIFF).
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
