# Objectif - Ouissem Aouimeur

**Rédigé par :** Ouissem Aouimeur, le 2026-11-18
**Supports :**
- le diagnostic du groupe (`kpi/diagnostic.md`) ;
- la matrice questions × sources (`docs/sources/matrice.md`) ;
- l'export BDIFF du département 13, de 2006 à 2025.

---

## 0. La question de départ

**Ma question analytique** (question 1 de mon analyse, Q1 Où de la matrice du groupe, reformulée à la commune parce que la BDIFF n'a ni massifs ni coordonnées) :

> Dans quelles communes du 13 les départs de feu sont-ils les plus fréquents et les plus étendus ?

**Ce que la réponse m'a appris** (diagnostic, hypothèse confirmée) : **18 communes sur 113 regroupent 51 % des feux du 13** de 2006 à 2025, hors Marseille. La plupart de ces communes restent en tête d'une décennie à l'autre.

---

## 1. La décision que la réponse permet de prendre

**Dans quelles communes placer en priorité le dispositif renforcé** (patrouilles, guet).

Le budget ne permet pas de renforcer tout le département pendant tout l'été, comme le dit la commande. La direction doit donc choisir où mettre ses moyens, et notre question lui donne une liste de communes où le faire.

---

## 2. Trois formulations, de l'action à l'objectif SMART

### Formulation 1 : une action (ce n'est pas un objectif)

> Concentrer les patrouilles et le guet sur les communes où il y a le plus de départs de feu.

**Pourquoi ce n'est pas un objectif :** cette phrase dit ce qu'on **fait**, pas le résultat qu'on **cherche à obtenir**. On peut faire cette action parfaitement, et ne rien améliorer. À la fin de l'été, on ne pourrait pas dire si c'est réussi ou raté.

### Formulation 2 : un objectif (mais pas SMART)

> Limiter la taille des feux dans les communes les plus touchées.

**Ce qu'elle ajoute :** elle dit enfin **le résultat visé**. Le guet et les patrouilles servent à **repérer un feu tôt**, et un feu repéré tôt reste petit.

**Pourquoi ce n'est pas encore SMART :**
- **quelles** communes ?
- « limiter » de **combien** ?
- **pour quand** ?
- **à partir de quelle valeur** de départ ?
- comment être sûr qu'on ne déplace pas juste le problème ailleurs ?

### Formulation 3 : un objectif SMART

> **D'ici la fin de l'été 2027, faire passer de 6,6 % à [b %] la part des départs de feu qui dépassent 1 hectare dans les 18 communes prioritaires du 13, sans augmenter cette part dans les autres communes du département.**

**Ce qu'elle ajoute :**

| Élément | Dans la phrase |
|---|---|
| Un **résultat** chiffré | la part des feux de plus de 1 ha, de 6,6 % à [b %] |
| Un **périmètre** précis | les 18 communes prioritaires (liste ci-dessous) |
| Une **échéance** | la fin de l'été 2027 |
| Une **condition** | sans augmenter cette part dans les autres communes |

---

## 3. L'objectif SMART, critère par critère

| Critère | Comment notre objectif le respecte |
|---|---|
| **S**pécifique | Il porte sur un indicateur précis (la part des feux de plus de 1 ha) et sur une liste fixe de 18 communes. Le seuil de 1 hectare sépare les feux arrêtés tôt de ceux qui ont eu le temps de s'étendre. |
| **M**esurable | Il se calcule avec la colonne `Surface parcourue (m2)` de la BDIFF (1 ha = 10 000 m²) et la colonne `Code INSEE` pour la commune. |
| **A**tteignable | La cible [b %] **n'est pas fixée par moi** : elle sera choisie **avec la direction**, une fois la situation de référence connue, comme le recommande le cours. |
| **R**éaliste | La condition « sans augmenter cette part ailleurs » empêche de réussir en vidant les autres communes de leurs moyens. L'objectif reste dans le budget : on concentre les moyens existants, sans en ajouter. |
| **T**emporel | La fin de l'été 2027, la saison que la direction prépare. Le bilan pourra se faire quand la BDIFF publiera la saison 2027. |

### Les 18 communes prioritaires

Ce sont les communes qui regroupent ensemble la moitié des départs de feu du 13, de 2006 à 2025, hors Marseille :

| Rang | Commune | Feux 2006-2025 |
|---|---|---|
| 1 | Martigues | 303 |
| 2 | Aix-en-Provence | 253 |
| 3 | Istres | 177 |
| 4 | Miramas | 134 |
| 5 | La Ciotat | 124 |
| 6 | Les Pennes-Mirabeau | 119 |
| 7 | Aubagne | 105 |
| 8 | Fuveau | 104 |
| 9 | Septèmes-les-Vallons | 92 |
| 10 | Gardanne | 88 |
| 11 | Fos-sur-Mer | 88 |
| 12 | Port-de-Bouc | 81 |
| 13 | Auriol | 77 |
| 14 | Lançon-Provence | 76 |
| 15 | Salon-de-Provence | 74 |
| 16 | Rognac | 73 |
| 17 | Vitrolles | 70 |
| 18 | Cabriès | 63 |
| | **Total** | **2 101 feux, soit 51 % des feux du 13** |

---

## 4. La situation de référence

Sans valeur de départ mesurée, un objectif n'est pas testable. La nôtre est **mesurée** dans la BDIFF, et non inventée.

**Période retenue : 2024 et 2025.** Ce sont les deux saisons que l'on peut croiser avec la Météo des forêts, ce qui permettra plus tard de comparer à niveau de danger égal.

| | Communes prioritaires (18) | Autres communes (95) |
|---|---|---|
| Feux en 2024-2025 | 242 | 208 |
| Dont feux de plus de 1 ha | 16 | 8 |
| **Part des feux de plus de 1 ha** | **6,6 %** | **3,8 %** |
| Surface brûlée en 2024-2025 | 899 ha | 116 ha |

Le détail par saison :

| Saison | Communes prioritaires | Autres communes |
|---|---|---|
| 2024 | 3,0 % (3 feux sur 100) | 2,9 % (3 feux sur 102) |
| 2025 | 9,2 % (13 feux sur 142) | 4,7 % (5 feux sur 106) |

**La valeur de départ retenue est 6,6 %.** La valeur à surveiller dans les autres communes est **3,8 %**.

**Ce qu'il faut savoir sur ce chiffre :**
- Il repose sur **peu de feux** : 16 feux de plus de 1 ha. Un ou deux grands feux de plus ou de moins le font beaucoup bouger.
- Il **varie énormément d'une année à l'autre**. Il passe de 3,0 % en 2024 à 9,2 % en 2025. Sur 2006-2025, il va de **2,1 % à 17,7 %** selon l'année, avec une moyenne de 7,5 %.
- Il est calculé **sans Marseille**. Si le groupe décide de garder Marseille (décision au journal), il faudra le recalculer.

---

## 5. Test de cohérence : comment atteindre l'objectif sans faire avancer la stratégie ?

La stratégie du SDIS est de **lutter au mieux contre les départs de feu avec un budget limité**. Voici quatre façons d'« atteindre » notre objectif sans que cette stratégie avance :

| Piège | Pourquoi l'objectif serait atteint quand même | Comment s'en protéger |
|---|---|---|
| **1. Un été plus humide** | Avec plus de pluie, les feux s'étendent moins, même sans rien changer au dispositif. La baisse viendrait de la météo, pas du SDIS. | Comparer **à niveau de danger égal**, grâce à la Météo des forêts : la part des feux de plus de 1 ha **les jours de niveau 3 et 4**. |
| **2. Plus de petits feux déclarés** | Si les services saisissent davantage de micro-feux dans la BDIFF, la part des feux de plus de 1 ha baisse toute seule, alors que les grands feux restent aussi nombreux. | Suivre aussi le **nombre** de feux de plus de 1 ha et la **surface brûlée totale**, pas seulement la part. |
| **3. Changer la liste des communes** | Si on retire de la liste une commune qui a eu un grand feu, le chiffre s'améliore artificiellement. | **Fixer la liste des 18 communes avant l'été 2027** et ne plus la toucher. |
| **4. Déplacer le problème** | Si tous les moyens partent dans les 18 communes, les feux peuvent grandir ailleurs. | C'est le rôle de la **condition** : la part ne doit pas dépasser 3,8 % dans les autres communes. |

---

## 6. Les limites de cet objectif

- **Une seule saison ne suffit pas pour juger.** Le chiffre varie de 2 % à 18 % selon l'année. Un bon ou un mauvais résultat en 2027 pourrait venir du hasard. Il faudra plusieurs saisons pour conclure.
- **On ne sait pas si le dispositif renforcé a été déployé dans ces communes en 2024 et 2025.** La situation de référence mélange donc des jours avec et sans renfort.
- **Le seuil de 1 ha est mon choix.** Il est à proposer au groupe et à noter dans le journal des décisions, puis à discuter avec la direction.
- **La commune n'est pas le massif.** Un feu peut démarrer dans une commune prioritaire et brûler surtout dans une commune voisine.
- **Cet objectif ne répond qu'au « où ».** La question du seuil de la Météo des forêts demande un autre objectif, à construire par le groupe.
