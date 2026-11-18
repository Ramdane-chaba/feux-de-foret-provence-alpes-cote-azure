# De ma question à un objectif – Ghiles MEKDAM

Exercice 2, le 2026-11-18.
Supports : ma question analytique 4 ([analyse de la commande](../docs/analyse/commande-ghiles-mekdam.md), Q4 Budget dans la liste commune) et le [diagnostic stratégique](diagnostic.md) du groupe.

## Ma question analytique

> Pour chaque seuil de déclenchement possible, combien de jours de dispositif renforcé aurait-il fallu par été, et quelle part des départs de feu ce dispositif aurait-il couverte ?

Je pars de cette question plutôt que de celle sur les fausses alertes, car elle relie directement les deux contraintes de la commande : le seuil et le budget. Dans les archives de la Météo des forêts, un même seuil (niveau 3) donne 19 jours de renfort en 2024 et 59 en 2025. Le nombre de jours ne peut donc pas être laissé de côté.

## 1. La décision que la réponse permet de prendre

**Quel niveau de la Météo des forêts adopter comme seuil de déclenchement en 2027**, c'est-à-dire celui qui couvre le plus de départs de feu pour un nombre de jours de renfort que le budget peut financer.

Si aucun seuil n'atteint ce compromis, la réponse conduit à une autre décision : ne plus renforcer tout le département les jours de déclenchement, mais seulement les zones prioritaires.

## 2. Trois formulations

| | Formulation |
|---|---|
| **Une action** (ce n'est pas un objectif) | Calculer, pour chaque niveau de la Météo des forêts, le nombre de jours de renfort par saison et la part des départs de feu qui seraient partis un jour de renfort. |
| **Un objectif** (pas encore SMART) | Couvrir davantage de départs de feu avec le dispositif renforcé, sans dépasser le budget de la saison. |
| **Un objectif SMART** | D'ici la fin de la saison feux 2027 (30 septembre 2027), faire passer de **[a %]** à **[b %]** la part des départs de feu des Bouches-du-Rhône survenus un jour de dispositif renforcé, **sans dépasser [J] jours de renfort** sur la saison. |

L'action décrit ce que je fais. Elle sera faite même si rien ne change sur le terrain. L'objectif dit ce qu'on veut obtenir, mais on ne peut pas savoir s'il est atteint. L'objectif SMART ajoute une valeur de départ, une cible, une échéance et une condition.

## 3. L'objectif SMART, critère par critère

- **Spécifique** : les départs de feu de la BDIFF dans le 13, rattachés au jour de leur `Date de première alerte`. Un jour est « de renfort » si le niveau prévu pour ce jour (`niveau_j1` du bulletin diffusé la veille, [D016](../docs/decisions.md)) est supérieur ou égal au seuil.
- **Mesurable** : la part passe de [a %] à [b %], et le nombre de jours de renfort reste sous [J].
- **Atteignable** : je ne fixe [b %] qu'une fois [a %] mesurée. C'est la direction qui la valide, pas moi.
- **Réaliste** : la condition « sans dépasser [J] jours » empêche de gagner en abaissant le seuil au niveau 1. Renforcer tous les jours couvrirait 100 % des feux, mais coûterait toute la saison.
- **Temporel** : la saison feux 2027, jusqu'au 30 septembre 2027.

## 4. La situation de référence

| Valeur | État | D'où elle viendra |
|---|---|---|
| **[a %]**, la part actuelle des feux couverts | **à mesurer** | Croisement BDIFF × Météo des forêts sur 2024 et 2025, au seuil actuel. Ce seuil n'est pas donné dans la commande ([D013](../docs/decisions.md)) : je calcule donc [a %] pour chaque seuil possible (2, 3, 4), et je retiendrai la valeur du seuil actuel quand il sera connu. |
| **[J]**, le nombre maximal de jours de renfort | **à mesurer** | Budget de la saison divisé par le coût d'une journée de renfort. Aucune source ouverte ne contient ces deux montants : ils sont à demander à la direction du SDIS 13. |
| Jours de renfort par seuil | **mesuré en partie** | Archives de la Météo des forêts, 13 : au niveau 3 ou plus, 19 jours en 2024, 59 en 2025, 63 en 2026 ; au niveau 4, 0, 10 et 16 jours. |

## 5. Test de cohérence : comment atteindre l'objectif sans faire avancer la stratégie ?

1. **En renforçant tout le département les jours déclenchés, sans regarder où partent les feux.** La part des feux couverts monte, mais les moyens restent répartis partout, alors que la commande demande aussi où les concentrer. → Je relie cet objectif à la question 1 (Où) : à nombre de jours égal, un renfort limité aux communes prioritaires coûte moins cher et peut couvrir plus de jours.
2. **En comptant les feux sans regarder leur surface.** Couvrir beaucoup de petits feux (65 % des feux de PACA brûlent 0,1 ha ou moins, d'après la fiche BDIFF) peut laisser partir les grands. → J'ajoute une variante en surface : la part de la surface brûlée par des feux partis un jour de renfort.
3. **Avec une saison 2027 calme.** Si l'été 2027 est peu sec, peu de jours atteignent le seuil et les feux sont rares : la part peut bouger sans que le seuil y soit pour rien. → Je compare toujours la part obtenue avec celle que le même seuil aurait donnée sur 2024 et 2025, et non avec une seule valeur.

## 6. Ce que je retiens

- **L'objectif ne peut pas être vérifié avec la BDIFF dès la fin de l'été 2027.** La BDIFF ne publie une année qu'une fois la saisie terminée : 2026 n'est toujours pas publiée en novembre 2026. Pour vérifier l'objectif à l'automne 2027, il faudra les interventions du SDIS 13 lui-même. Sinon, l'échéance de mesure sera repoussée à la publication de la BDIFF 2027.
- **Les feux partis hors de la période de publication de l'indice** (avant fin mai, après début octobre) ne peuvent pas être couverts par un seuil. Je les compte à part et je les sors du calcul de [a %], sinon l'objectif mesurerait une chose sur laquelle le seuil n'a aucune prise.
