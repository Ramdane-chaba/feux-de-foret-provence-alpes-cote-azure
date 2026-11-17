# Fiche source - BDIFF

**Explorée par :** Ouissem Aouimeur, le 2026-11-17
**Lien :** https://bdiff.agriculture.gouv.fr/incendies
**Fichiers ouverts :**
- export CSV de la région PACA, du 2006-01-01 au 2025-12-31 (fichier principal) ;
- export CSV du département 13, du 1973-01-01 au 2025-12-31 (pour voir jusqu'où remonte la source).

La BDIFF (Base de données sur les incendies de forêt en France) est la liste officielle des feux de forêt en France. Chaque feu y a sa fiche.

| Rubrique | Valeur |
|---|---|
| Propriétaire et système | Le ministère de l'Agriculture est le propriétaire. Le site est fait et hébergé par l'IGN. Ce sont les pompiers et les services de l'État qui remplissent les fiches. |
| Mode d'accès et format | On cherche les feux sur le site (par date ou par lieu), puis on clique sur « Télécharger : CSV ». On reçoit un fichier ZIP avec un CSV dedans (séparateur `;`, 3 lignes d'informations avant les titres des colonnes). Un export ne peut pas dépasser 30 000 lignes : le site bloque le bouton CSV au-delà. Pour la comparaison avec toute la France de 2006 à 2025, il faudra donc faire plusieurs exports, par région ou par période. |
| Grain (une ligne = ?) | Un feu de forêt. |
| Emprise géographique | Toute la France. Dans mon fichier principal : la région PACA, soit 6 départements et 856 communes. |
| Période réellement couverte | La source remonte à 1973 : dans l'export du 13, le premier feu date du 1973-03-02. Dans mon fichier PACA : du 2006-01-01 au 2025-11-29. L'année 2026 n'est pas encore publiée. |
| Date de dernière mise à jour affichée | Non vérifiée : le site n'affiche pas de date de mise à jour. |
| Fréquence de mise à jour | Non affichée telle quelle. Le site indique « Année(s) en cours de saisie : 2026 » et « Les années en cours de saisie ne sont pas diffusées » : les données sont donc publiées par année complète, mais la date exacte de publication n'est pas donnée. |
| Volumétrie | 10 789 feux en PACA entre 2006 et 2025, avec 24 colonnes. Pour comparaison, il y a 42 527 feux en PACA si on remonte à 1973. |
| Clés disponibles | Le code INSEE de la commune, pour relier avec d'autres données sur les communes. Le département et la date de l'alerte, pour relier avec la Météo des forêts. Attention, d'après la fiche Météo des forêts du groupe : la date de ce fichier est la date de diffusion, et le niveau concerne le lendemain. Il faut donc joindre la date d'alerte à la date de diffusion + 1 jour. Le code département y est aussi écrit 1 ou 01 selon les années, alors que la BDIFF écrit 01 : il faudra harmoniser. L'année avec le numéro du feu, qui donne un identifiant unique (aucun doublon). |
| Données personnelles | Non. Il n'y a pas de noms ni d'adresses, seulement la commune. |
| Licence | Aucune licence nommée : ce n'est ni la Licence Ouverte Etalab, ni l'ODbL. Les conditions sont dans le fichier `Mention légales.pdf` fourni dans le ZIP, à la section 7 « Utilisation, reproduction et droits d'auteur ». La réutilisation est autorisée à des fins personnelles, associatives ou professionnelles. La vente, la location et les usages commerciaux ou publicitaires sont interdits, et la source doit être citée. Notre usage, un projet pédagogique non commercial, respecte ces conditions. |
| Questions de mon analyse | **Q1** (où ont lieu les feux) : oui. **Q2 et Q3** (le seuil de l'indice) : en partie. On a la date et le département de chaque feu, mais pas le niveau de l'indice, il faut une autre source. **Q4** (la comparaison avec la région) : oui, on a les 6 départements. |

## Ce que j'ai remarqué en ouvrant le fichier

**Le 13 est le département de PACA qui a le plus de feux, mais pas celui où ça brûle le plus.**

| Département | Feux (2006-2025) | Feux par an | Surface brûlée | Cause inconnue |
|---|---|---|---|---|
| 13 - Bouches-du-Rhône | 4 302 | 215 | 15 394 ha | 37 % |
| 83 - Var | 2 685 | 134 | 19 842 ha | 9 % |
| 06 - Alpes-Maritimes | 1 899 | 95 | 5 393 ha | 36 % |
| 04 - Alpes-de-Haute-Provence | 940 | 47 | 3 856 ha | 19 % |
| 84 - Vaucluse | 672 | 34 | 2 371 ha | 64 % |
| 05 - Hautes-Alpes | 291 | 15 | 689 ha | 21 % |

Le 13 compte 40 % des feux de la région. Le Var en a moins, mais il a plus de surface brûlée : ses feux sont plus grands. C'est intéressant pour la question 1 (où mettre les moyens).

Autres remarques :
- **La cause du feu manque souvent** : elle n'est pas remplie dans 30 % des cas en PACA, et 37 % dans le 13. Pour le Vaucluse, c'est 64 %.
- **Il y a beaucoup de tout petits feux** : 65 % des feux brûlent 0,1 hectare ou moins. Seulement 63 feux dépassent 100 hectares. Le plus grand fait 6 832 ha, à Gonfaron (83) en 2021.
- **Les surfaces sont en m² dans le fichier**, alors que le site les affiche en hectares. Il faudra convertir.
- **Le formulaire a changé en 2023**, donc certaines colonnes ne sont pas pareilles avant et après.
- **Les feux sont surtout en juillet et en août** (44 % des feux), mais il y en a aussi beaucoup en mars et en juin.
- **Le nombre de feux change beaucoup d'une année à l'autre** : de 237 feux (2014) à 910 feux (2023).
- **Marseille est incluse dans le 13** : 217 feux (5 % des feux du 13) et 1 730 ha sont sur la commune de Marseille (code INSEE 13055). Or Marseille semble défendue par les marins-pompiers, et non par le SDIS 13. Comme la BDIFF donne le code INSEE de chaque feu, on pourra exclure Marseille si le groupe le décide. La Météo des forêts, qui est à l'échelle du département, ne le permet pas.

## Pourquoi je n'ai pas pris depuis 1973

- La Météo des forêts existe depuis 2023, et ses archives ouvertes ne commencent qu'en 2024 : les vieux feux ne servent pas pour la question du seuil.
- Avant 2000, la cause manque presque toujours.
- La BDIFF couvre toute la France depuis 2006. Avec la même période partout, on pourra comparer avec le reste du pays.

Ce choix doit être noté dans le journal des décisions du groupe.

## Pour le glossaire

D'après le document de définitions de la BDIFF :
- **Feu de forêt** : dans le Sud-Est, un feu dans la garrigue ou le maquis compte aussi comme un feu de forêt.
- **Date d'alerte** : le moment où les pompiers sont prévenus, pas forcément le moment exact où le feu démarre.
