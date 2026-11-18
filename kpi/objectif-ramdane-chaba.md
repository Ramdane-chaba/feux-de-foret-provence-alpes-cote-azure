# Objectif – Ramdane CHABA

Dernière mise à jour : 2026-11-18
Question de départ : ma question 2 (« Quand »), liste commune **Q2 Quand** (voir la [matrice](../docs/sources/matrice.md)).

> Pour décider quand renforcer, la direction a besoin de savoir s'il y a des périodes où les départs de feu sont plus nombreux (mois, jours de la semaine, heures).

## 1. La décision que la réponse permet de prendre

Renforcer seulement sur certains créneaux (mois, jours, plages horaires) les jours où le dispositif est déclenché, ou renforcer toute la journée. Ça touche directement la contrainte de budget de la commande : moins d'heures de patrouille pour le même nombre de jours déclenchés.

## 2. Trois formulations

| | Formulation |
|---|---|
| **Action** (pas un objectif) | Placer les patrouilles du dispositif renforcé sur les heures où les feux partent le plus. |
| **Objectif** (pas SMART) | Concentrer les heures de patrouille sur les créneaux où partent la plupart des feux des jours déclenchés. |
| **Objectif SMART** | D'ici la fin de l'été 2027, les jours où le dispositif renforcé est déclenché dans le 13, faire passer de [a %] à [b %] la part des départs de feu (première alerte) qui tombent dans les plages horaires couvertes par les patrouilles, **sans augmenter le nombre total d'heures de patrouille** par rapport à l'été 2026. |

## 3. Le même objectif, critère par critère

- **Spécifique** : les jours déclenchés dans le 13 ; les départs de feu datés par `Date de première alerte` (BDIFF), qui contient l'heure ; la part qui tombe dans les plages couvertes.
- **Mesurable** : la part passe de [a %] à [b %].
- **Atteignable** : [b %] est fixée avec la direction une fois [a %] connue, pas avant.
- **Réaliste** : la condition « sans augmenter le nombre total d'heures de patrouille » empêche d'atteindre la cible en patrouillant toute la journée.
- **Temporel** : d'ici la fin de l'été 2027.

## 4. Situation de référence

- **[a %] : à mesurer.** Il faut deux informations :
  - les heures de première alerte des feux des jours de danger élevé, dans la BDIFF (2024-2025 pour croiser avec la Météo des forêts) : disponible, pas encore calculé ;
  - les plages horaires actuellement couvertes par les patrouilles du SDIS 13 : **aucune source, à collecter auprès de la direction**.
- **Nombre d'heures de patrouille à l'été 2026 : à collecter auprès de la direction.**

## 5. Test de cohérence : comment atteindre l'objectif sans faire avancer la stratégie ?

1. **En déplaçant les patrouilles sur les heures d'alerte, pas sur les heures de départ.** L'alerte arrive après le départ du feu (D011) : on pourrait « couvrir » les alertes sans être présent au moment où le feu part. → Limite à signaler ; l'écart alerte / départ n'est pas mesurable avec nos sources.
2. **En réduisant le nombre de jours déclenchés.** Si on ne déclenche que les jours les plus extrêmes, il est plus facile de couvrir leurs créneaux, mais davantage de feux partent les jours non déclenchés. → L'objectif doit rester lié à l'objectif de groupe sur le seuil (ne pas augmenter les feux manqués).
3. **En comptant les feux sans regarder leur surface.** Couvrir beaucoup de petits feux peut laisser partir les grands. → Ajouter une variante en surface brûlée (part de la surface des feux partis dans les plages couvertes).

## 6. Limites

- Deux saisons seulement se croisent (2024 et 2025) ; la saison 2026 n'est pas publiée dans la BDIFF.
- Les plages de patrouille actuelles et les heures de patrouille ne sont dans aucune source.
- Hors saison (avant juin, après septembre), il n'y a pas d'indice, donc pas de « jour déclenché » au sens de la Météo des forêts.
