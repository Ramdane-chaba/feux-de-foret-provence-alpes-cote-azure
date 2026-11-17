# Fiche source - Interventions réalisées par les services d'incendie et de secours

Explorée par : Ramdane CHABA, le 2026-11-17
Lien : https://www.data.gouv.fr/datasets/interventions-realisees-par-les-services-d-incendie-et-de-secours

Questions : numérotation commune proposée au groupe (à valider) — Q1 Où, Q2 Quand, Q3 Seuil, Q4 Budget (jours de renfort / feux manqués), Q5 Comparaison PACA / France.

## Fichiers ouverts

Le jeu contient un fichier CSV par année, de 2008 à 2024. Chaque fichier porte un titre sur data.gouv (« interventions-SIS-2008 », « Interventions-SIS-2013 »…). Je les ai lus avec l'API tabulaire de data.gouv.fr.

| Année | Ouvert ? | Colonnes (hors index de l'API) | Colonne « Feux de végétations » |
|---|---|---|---|
| 2008 | oui | 70 | oui |
| 2009 | oui | 70 | oui |
| 2010 | oui | 16 | **non** (seulement « Incendies », tous types confondus) |
| 2011 | **non vérifié : fichier non lu** (l'API tabulaire renvoie une erreur) | — | — |
| 2012 | **non vérifié : fichier non lu** (l'API tabulaire renvoie une erreur) | — | — |
| 2013 | oui | 16 | **non** (seulement « Incendies ») |
| 2014 | oui | 71 | oui |
| 2015 à 2018 | **non vérifié : fichiers non ouverts** | — | — |
| 2019 | oui | 71 | oui |
| 2020, 2021 | **non vérifié : fichiers non ouverts** | — | — |
| 2022 | oui | 71 | oui |
| 2023 | **non vérifié : fichier non lu** (l'API tabulaire renvoie une erreur ; la fiche data.gouv signale aussi la ressource comme indisponible lors de son dernier contrôle) | — | — |
| 2024 | oui | 69 | oui |

Pour 2008 : la ressource s'appelle « interventions-SIS-2008 », le fichier `interventions2008.csv`, et il a été ajouté sur data.gouv le 2020-10-21, donc bien après l'année concernée. La colonne `Année` vaut 2008 sur les 20 premières lignes lues (sur 98) ; les autres lignes n'ont pas été vérifiées. Même chose pour 2009 : `Année` = 2009 sur les 25 premières lignes lues (sur 98).

| Rubrique | Valeur |
|---|---|
| Propriétaire et système | Ministère de l'Intérieur. D'après la fiche data.gouv, les données sont collectées chaque année par la DGSCGC (sécurité civile) auprès des SDIS, de la BSPP (Paris et petite couronne) et du BMPM (Marseille) |
| Mode d'accès et format | Téléchargement direct sur data.gouv.fr, un fichier CSV par année. Aussi lisible par l'API tabulaire de data.gouv.fr (JSON), sauf pour 2011, 2012 et 2023 qui renvoient une erreur |
| Grain (une ligne = ?) | Un service d'incendie et de secours × une année. Ce sont des totaux annuels : pas de détail par feu, par jour ni par commune |
| Emprise géographique | France métropolitaine + DOM, par département. Le BMPM (Marseille) et la BSPP (Paris) ont leur propre ligne |
| Période réellement couverte | Fichiers de 2008 à 2024 sur la page. Années ouvertes : 2008, 2009, 2010, 2013, 2014, 2019, 2022, 2024. Le détail « Feux de végétations » est présent en 2008, 2009, 2014, 2019, 2022 et 2024, et absent en 2010 et 2013. Les autres années ne sont pas vérifiées (voir tableau au-dessus) : on ne peut pas encore affirmer que la série 2014-2024 est complète, ni que 2011 et 2012 ont le même format que 2010 et 2013 |
| Date de dernière mise à jour affichée | 2026-07-02 (ajout du fichier 2024) |
| Fréquence de mise à jour | Annuelle (indiquée sur la fiche data.gouv). Environ 18 mois de décalage : les données 2024 ont été publiées le 2026-07-02, donc 2025 et 2026 ne sont pas encore disponibles |
| Volumétrie | Environ 100 lignes par fichier : 98 en 2008, 2009, 2010 et 2013 ; 99 en 2014, 2019, 2022 et 2024. Fichier 2024 : environ 30 Ko. Très léger |
| Clés disponibles | `Année` + `Numéro` (code département). Attention : `4` au lieu de `04` en 2024, et `BMPM` / `BSPP` pour les deux unités militaires → à normaliser avant de joindre avec le COG ou les autres sources |
| Données personnelles | Aucune : chiffres agrégés par département et par an |
| Licence | Licence Ouverte / Open Licence **version 1.0** (identifiant « fr-lo » sur data.gouv, distinct de « lov2 » qui désigne la version 2.0) |
| Questions auxquelles elle pourrait répondre | **Q5 Comparaison, en partie seulement** : la colonne `Feux de végétations` permet de comparer le nombre annuel d'interventions sur des feux de végétation entre le SDIS 13, les autres départements de PACA et la France, pour les années où elle existe. Elle ne répond **pas** à Q1 Où (pas de commune), Q2 Quand (pas de date), Q3 Seuil ni Q4 Budget (pas de jour, donc impossible de croiser avec la Météo des forêts) |

## Ce que j'ai remarqué en ouvrant les fichiers

**Le format change selon les années**
Le nombre de colonnes varie (16, 69, 70, 71) et la colonne « Feux de végétations » n'existe pas en 2010 ni en 2013. Il faudra mapper les colonnes année par année au chargement.

**Le SDIS 13 et Marseille sont sur deux lignes séparées**
Les Bouches-du-Rhône ont une ligne `Numéro` = 13 (SDIS 13) et une ligne `Numéro` = BMPM (marins-pompiers de Marseille). Vérifié pour 2009, 2010, 2019, 2022 et 2024 ; pour 2008, 2013 et 2014, seule la ligne 13 a été relevée.

| Année | Feux de végétations — ligne 13 (SDIS 13) | Feux de végétations — ligne BMPM |
|---|---|---|
| 2008 | 3 142 | non relevé |
| 2009 | 3 258 | 1 960 |
| 2014 | 2 117 | non relevé |
| 2019 | 2 525 | 858 |
| 2022 | 2 516 | 699 |
| 2024 | 1 403 | 431 |

**À décider en groupe (à noter dans le journal des décisions)** : pour comparer le département 13 aux autres départements, faut-il prendre la ligne 13 seule (périmètre du SDIS 13, qui est notre commanditaire) ou additionner les lignes 13 et BMPM (tout le département, comme pour les autres départements qui n'ont qu'une ligne) ? Les deux choix donnent des chiffres différents (en 2024 : 1 403 contre 1 834). Même question pour Paris et la petite couronne avec la BSPP.

**Qualité (à transmettre à Ghiles)**
- Les nombres sont lus en texte avec un séparateur de milliers (`2 117`, ou un caractère illisible `1?403` en 2024, vus via l'API) : conversion en entier à prévoir.
- Les accents sont abîmés dans les noms de colonnes du fichier 2024 lus via l'API (« ŕ » au lieu de « à », « hyménoptčres ») : probable problème d'encodage, à confirmer en téléchargeant le CSV d'origine.
- La colonne `Catégorie` change de forme : un chiffre en 2010 et 2013 (`1`), une lettre en 2024 (`A`, `C`), vide pour BMPM et BSPP.
- « Feux de végétations » est une catégorie d'**interventions**, pas un nombre de feux de forêt. Sa définition (types de végétation inclus) n'est pas donnée sur la fiche data.gouv : non vérifiée. Ce chiffre n'est donc pas comparable directement aux feux de la BDIFF.
- Trois fichiers (2011, 2012, 2023) ne sont pas lisibles par l'API tabulaire : il faudra les télécharger directement pour les vérifier.
