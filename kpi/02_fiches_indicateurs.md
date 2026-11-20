# Fiches d'indicateurs

Dernière mise à jour : 2026-11-19
Un indicateur par objectif SMART de [01_objectifs.md](01_objectifs.md). Pour chacun :
1. la formule (numérateur, dénominateur, paramètres) ;
2. un paramètre dont on change la valeur : ce qui change dans la fiche, décision comprise, et ce qui ne change pas ;
3. la source exacte, la ligne de faisabilité mesurée dans les données, et le proxy avec son biais quand un terme n'a pas de champ.

## Les données ouvertes

| Source | Fichier exact | Lignes | Champs utilisés |
|---|---|---|---|
| **BDIFF** | Export CSV du 2026-11-19 sur `bdiff.agriculture.gouv.fr/incendies`, critères : première alerte du 2006-01-01 00:00 au 2025-12-31 23:59, région Provence-Alpes-Côte d'Azur, type de feu « F » (feux de forêt). Fichier `Incendies.csv` dans le ZIP : séparateur `;`, 3 lignes d'information avant les titres. | 10 789 feux, dont **4 302 dans le 13** et **489 dans le 13 en 2024-2025** | `Année`, `Département`, `Code INSEE`, `Nom de la commune`, `Date de première alerte` (date et heure), `Surface parcourue (m2)`, `Précision des surfaces` |
| **Météo des forêts** | Archives Météo-France sur data.gouv.fr, fichiers des saisons 2024 et 2025 (`.csv.gz`, séparateur `,`) | 240 bulletins pour le 13 sur 2024-2025 (120 par saison) | `date` (diffusion, UTC), `num_dep`, `niveau_j1` |

**Jointure** entre les deux (D016) : un feu alerté le jour J est rattaché au `niveau_j1` du bulletin diffusé le jour J-1. Les bulletins couvrent les jours du 4 juin au 1er octobre 2024 et du 4 juin au 1er octobre 2025.

**Constat commun à O2 et O3** : sur les 489 feux du 13 en 2024-2025, **134 (27,4 %) sont partis hors de la période de publication** de l'indice. Ils n'ont aucun niveau de danger et sortent du calcul de tout indicateur qui utilise un seuil.

---

## I1 – Part des grands feux dans les communes prioritaires (objectif O1)

### 1. Formule

| | |
|---|---|
| **Numérateur** | Nombre de départs de feu de la BDIFF dans les communes prioritaires dont `Surface parcourue (m2)` dépasse **S** |
| **Dénominateur** | Nombre de départs de feu de la BDIFF dans les communes prioritaires, sur la même période |
| **Unité** | % des feux |
| **Paramètres** | **S**, le seuil de surface (10 000 m², soit 1 ha) ; **la liste des communes prioritaires** (les 18 communes qui regroupent 51 % des feux de 2006 à 2025) ; **le périmètre** (hors Marseille, `Code INSEE` 13055, D005) ; **la période** (2024-2025) |
| **Valeur actuelle** | 16 / 242 = **6,6 %** (garde-fou de la condition : 8 / 208 = 3,8 % dans les autres communes) |

### 2. Changer un paramètre : S

| S | Communes prioritaires | Autres communes | Feux au numérateur |
|---|---|---|---|
| 0,5 ha | 8,3 % (20 / 242) | 5,8 % (12 / 208) | 20 |
| **1 ha (retenu)** | **6,6 % (16 / 242)** | **3,8 % (8 / 208)** | **16** |
| 5 ha | 2,1 % (5 / 242) | 1,4 % (3 / 208) | 5 |

- **Ce qui change** : le numérateur, la valeur, la situation de référence de l'objectif et le sens du chiffre. À 0,5 ha, on compte des feux encore petits, et l'indicateur suit surtout la rapidité d'intervention. À 5 ha, il suit les feux devenus dangereux, mais il n'en reste que 5 sur deux saisons (0 en 2024) : une variation d'un seul feu fait bouger le taux de 0,4 point, et la décision (« le renfort limite-t-il les grands feux ? ») ne peut plus se lire sur une saison.
- **Ce qui ne change pas** : le dénominateur (242), la liste des communes, la source et les champs, la ligne de faisabilité, et l'écart entre communes prioritaires et autres communes, qui reste dans le même sens quel que soit S.

### 3. Source, faisabilité, proxy

- **Source** : BDIFF, export ci-dessus, champs `Code INSEE` et `Surface parcourue (m2)`.
- **Ligne de faisabilité** : **2 101 lignes utilisables sur 2 101 (100 %)** pour les 18 communes de 2006 à 2025, et **242 sur 242** en 2024-2025 : `Code INSEE` et `Surface parcourue (m2)` sont toujours renseignés, aucune surface n'est à 0. Sur ces 242 feux, la surface est **mesurée** pour 169 et **estimée** pour 73 (30 %).
- **Proxy** : l'objectif vise les feux **repérés trop tard**, et aucun champ ne le dit. Le proxy est « surface parcourue supérieure à 1 ha ».
- **Biais et sens** : un feu peut dépasser 1 ha à cause du vent, de la végétation ou d'un accès difficile, même repéré tôt. Le proxy **surestime** donc les échecs du guet et des patrouilles. Les surfaces estimées (30 %) ajoutent une imprécision autour du seuil de 1 ha, sans sens défini.

---

## I2 – Part des alertes dans les plages de patrouille (objectif O2)

### 1. Formule

| | |
|---|---|
| **Numérateur** | Nombre de départs de feu du 13, partis un jour déclenché (`niveau_j1` de la veille ≥ **N**), dont l'heure de `Date de première alerte` tombe dans les plages de patrouille **P** |
| **Dénominateur** | Nombre de départs de feu du 13 partis un jour déclenché (`niveau_j1` de la veille ≥ **N**) |
| **Unité** | % des feux des jours déclenchés |
| **Paramètres** | **P**, les plages horaires couvertes par les patrouilles (inconnues, à collecter : 12 h - 20 h pris comme exemple) ; **N**, le seuil de déclenchement (inconnu, D013 : niveau 3 pris comme exemple) ; **le périmètre** (13 entier ou hors Marseille) ; **la période** (2024-2025) |
| **Valeur actuelle** | Avec N = 3 et P = 12 h - 20 h : 113 / 177 = **63,8 %** |

### 2. Changer un paramètre : P

| Plages P (N = 3) | Durée | Valeur |
|---|---|---|
| 10 h - 20 h | 10 h | 70,1 % (124 / 177) |
| **12 h - 20 h (exemple retenu)** | **8 h** | **63,8 % (113 / 177)** |
| 13 h - 19 h | 6 h | 53,7 % (95 / 177) |

- **Ce qui change** : le numérateur, la valeur et la décision. Passer de 8 h à 6 h de patrouille fait perdre 10 points de couverture. Passer de 8 h à 10 h n'en fait gagner que 6, parce que les alertes se concentrent entre 14 h et 18 h (73 des 177 feux). La fiche donne donc à la direction le prix, en couverture, de chaque heure de patrouille retirée ou ajoutée.
- **Ce qui ne change pas** : le dénominateur (177 feux un jour de niveau 3 ou plus), le seuil N, la source, les champs et la ligne de faisabilité.

### 3. Source, faisabilité, proxy

- **Sources** : BDIFF (`Date de première alerte`, `Département`) et Météo des forêts (`date`, `num_dep`, `niveau_j1`), fichiers ci-dessus.
- **Ligne de faisabilité** : **355 lignes utilisables sur 489 (72,6 %)** pour le 13 en 2024-2025. Les 134 autres feux sont partis hors de la période de publication de l'indice et n'ont pas de jour déclenché possible. `Date de première alerte` est toujours renseignée, avec l'heure. Une seule alerte est à minuit pile en 2024-2025 (heure peut-être absente) : elle est gardée. Au niveau 3, il reste 177 feux.
- **Proxy** : l'objectif vise l'heure de **départ** du feu, et aucun champ ne la donne. Le proxy est l'heure de première alerte (D011).
- **Biais et sens** : l'alerte arrive après le départ du feu. Des plages calées sur les heures d'alerte sont donc plus tardives que les vrais départs. L'indicateur **surestime** la part des départs réellement couverts par les patrouilles.
- **Point non vérifié** : le fuseau horaire de `Date de première alerte` (heure locale ou UTC) n'est pas indiqué. Une erreur de deux heures en été déplacerait toutes les plages.

---

## I3 – Part des feux couverts par le seuil (objectif O3)

### 1. Formule

| | |
|---|---|
| **Numérateur** | Nombre de départs de feu du 13 partis un jour J dont le `niveau_j1` du bulletin diffusé la veille est supérieur ou égal à **N** |
| **Dénominateur** | Nombre de départs de feu du 13 partis un jour couvert par un bulletin (période de publication de l'indice) |
| **Unité** | % des feux de la période de publication |
| **Paramètres** | **N**, le seuil de déclenchement (2, 3 ou 4) ; **le périmètre** (13 entier ou hors Marseille, D005) ; **la période** (2024-2025, les deux saisons croisables, D012) |
| **Valeur actuelle** | Au seuil actuel : **à mesurer** (seuil inconnu, D013). Pour chaque seuil possible : voir ci-dessous |

### 2. Changer un paramètre : N

| N | Feux couverts (2024-2025) | 2024 | 2025 | Jours de renfort (2024-2025) | Jours de renfort sans feu |
|---|---|---|---|---|---|
| 2 | 88,7 % (315 / 355) | 86,4 % | 90,7 % | 181 sur 240 | 50 (27,6 %) |
| **3** | **49,9 % (177 / 355)** | **29,0 %** | **67,4 %** | **78 sur 240** | **12 (15,4 %)** |
| 4 | 13,0 % (46 / 355) | 0,0 % | 23,8 % | 10 sur 240 | 1 (10,0 %) |

- **Ce qui change** quand N passe de 3 à 4 : le numérateur (177 → 46 feux), la valeur (49,9 % → 13,0 %), le nombre de jours de renfort (78 → 10) et la décision. Au niveau 4, le renfort coûte 8 fois moins de jours, mais 87 % des feux partent hors renfort, et aucun en 2024 n'aurait été couvert. Au niveau 2, presque tous les feux sont couverts, mais le renfort tient les trois quarts de la saison. La valeur de N fixe donc à la fois l'indicateur et le coût. Le choix se fait avec la condition de l'objectif (« sans dépasser [J] jours »), pas avec l'indicateur seul.
- **Ce qui ne change pas** : le dénominateur (355 feux), la source, les champs, la jointure D016 et la ligne de faisabilité.
- **Ce que le tableau montre aussi** : au grain du département, les jours de renfort sans aucun feu sont minoritaires (15,4 % au niveau 3). Le premier défaut du seuil n'est pas de déclencher pour rien, mais de laisser partir des feux hors renfort.

### 3. Source, faisabilité, proxy

- **Sources** : BDIFF (`Date de première alerte`, `Département`, `Code INSEE` pour le périmètre hors Marseille) et Météo des forêts (`date`, `num_dep`, `niveau_j1`), fichiers ci-dessus.
- **Ligne de faisabilité** : **355 lignes utilisables sur 489 (72,6 %)** pour le 13 en 2024-2025 (162 sur 225 en 2024, 193 sur 264 en 2025). Les 134 autres feux sont hors de la période de publication. Côté Météo des forêts, 240 bulletins sur 240 ont un `niveau_j1` renseigné entre 1 et 4. Hors Marseille : 325 lignes utilisables sur 450 (72,2 %), et des valeurs à moins d'un point de celles du 13 entier (49,5 % au niveau 3).
- **Proxy** : « jour de dispositif renforcé » n'a pas de champ, car aucune source n'enregistre les jours où le SDIS a réellement renforcé. Le proxy est « jour où le niveau prévu la veille atteint N ». L'indicateur mesure donc la couverture d'une **règle**, pas celle du dispositif réel.
- **Biais et sens** : si le SDIS renforce aussi certains jours sous le seuil (décision d'un chef de centre, alerte locale), la couverture réelle est plus haute que la règle. L'indicateur la **sous-estime**. Le second proxy, l'heure de première alerte à la place du départ, ne change le jour du feu que pour les alertes juste après minuit (14 feux sur 355 entre 0 h et 1 h) : biais faible, sans sens défini.
