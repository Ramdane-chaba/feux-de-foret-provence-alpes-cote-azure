# Objectif « Patrouiller aux heures des départs de feu » – Ramdane CHABA

Dernière mise à jour : 2026-11-18
Question de départ : ma question 2 (« Quand »), liste commune **Q2 Quand** (voir la [matrice](../docs/sources/matrice.md)).
Support : le [diagnostic du groupe](diagnostic.md).

> Pour décider quand renforcer, la direction a besoin de savoir s'il y a des périodes où les départs de feu sont plus nombreux (mois, jours de la semaine, heures).

## 1. La décision que la réponse permet de prendre

Renforcer seulement sur certaines plages horaires les jours où le dispositif est déclenché, ou renforcer toute la journée. Ça touche directement la contrainte de budget de la commande : moins d'heures de patrouille pour le même nombre de jours déclenchés.

## 2. Trois formulations

| | Formulation |
|---|---|
| **Action** (pas un objectif) | Placer les patrouilles du dispositif renforcé sur les heures où les feux partent le plus. |
| **Objectif** (pas SMART) | Concentrer les heures de patrouille sur les créneaux où partent la plupart des feux des jours déclenchés. |
| **Objectif SMART** | D'ici le 30 septembre 2027, pour les jours où le dispositif renforcé est déclenché dans le 13 (niveau de la Météo des forêts supérieur ou égal au seuil retenu), faire passer de [a %] à [b %] la part des départs de feu dont l'heure de première alerte tombe dans une plage couverte par les patrouilles, **sans augmenter le nombre total d'heures de patrouille** par rapport à l'été 2026. |

L'action décrit ce que je fais : elle peut être faite sans que rien ne change. L'objectif dit ce qu'on veut obtenir, mais on ne peut pas dire s'il est atteint. L'objectif SMART ajoute une valeur de départ, une cible, une échéance et une condition.

## 3. L'objectif SMART, critère par critère

| Critère | Comment l'objectif le respecte |
|---|---|
| **S**pécifique | **Jour déclenché** : jour où le niveau prévu (`niveau_j1` du bulletin diffusé la veille, [D016](../docs/decisions.md)) est supérieur ou égal au seuil retenu. Ce seuil est le seuil actuel du SDIS 13 tant que le groupe n'en a pas choisi un autre ; il n'est pas connu ([D013](../docs/decisions.md)). **Départs de feu comptés** : les feux de la BDIFF du 13 partis un jour déclenché. Les feux partis hors de la période de publication de l'indice (avant fin mai, après début octobre) sont **sortis du calcul** : aucun jour n'y peut être déclenché. **Heure** : celle de `Date de première alerte`, faute d'heure de départ ([D011](../docs/decisions.md)). |
| **M**esurable | La part passe de [a %] à [b %], et le nombre total d'heures de patrouille ne dépasse pas celui de l'été 2026. **À l'échéance, la BDIFF ne suffira pas** : une saison n'y est publiée qu'une fois la saisie terminée (2026 ne l'est toujours pas en novembre 2026). La mesure de l'été 2027 se fera donc avec les interventions du SDIS 13 lui-même ; à défaut, elle sera repoussée à la publication de la BDIFF 2027. |
| **A**tteignable | [b %] est fixée avec la direction une fois [a %] connue, pas avant. **L'échantillon sera petit** : seules 2024 et 2025 se croisent avec la Météo des forêts, et le 13 n'a que 78 jours de niveau 3 ou 4 sur ces deux saisons (fiche Météo des forêts). Le nombre de feux tombant ces jours-là sera plus faible encore : il faut le connaître avant de fixer une cible. |
| **R**éaliste | La condition « sans augmenter le nombre total d'heures de patrouille » empêche d'atteindre la cible en patrouillant toute la journée. L'objectif réorganise les moyens existants, sans en ajouter. |
| **T**emporel | Le 30 septembre 2027, fin de la saison que la direction prépare. |

## 4. Situation de référence

| Valeur | État | D'où elle viendra |
|---|---|---|
| **[a %]**, la part actuelle des alertes dans les plages couvertes | **à mesurer** | Heures de première alerte des feux des jours déclenchés, BDIFF 2024-2025 (vue `gold.v_q2_quand` du pipeline, branche `feat/pipeline-medaillon`, en attente de l'export BDIFF), croisées avec les plages actuelles de patrouille. |
| Plages horaires actuellement couvertes par les patrouilles | **à collecter** | Aucune source : à demander à la direction du SDIS 13. |
| Nombre total d'heures de patrouille à l'été 2026 | **à collecter** | Aucune source : à demander à la direction du SDIS 13. |
| Seuil actuel de déclenchement | **à collecter** | Aucune source ([D013](../docs/decisions.md)). En attendant, [a %] est calculée pour chaque seuil possible (2, 3, 4). |
| **Fuseau horaire** de `Date de première alerte` | **à vérifier** | La fiche BDIFF ne dit pas si l'heure est en heure locale ou en UTC, alors que la Météo des forêts est en UTC. Une erreur d'une ou deux heures déplacerait toutes les plages. |

## 5. Test de cohérence : comment atteindre l'objectif sans faire avancer la stratégie ?

| Piège | Pourquoi l'objectif serait atteint quand même | Comment s'en protéger |
|---|---|---|
| **1. Patrouiller aux heures d'alerte, pas de départ** | L'alerte arrive après le départ du feu (D011) : on « couvre » les alertes sans être là quand le feu part. | Limite à signaler ; l'écart alerte / départ n'est pas mesurable avec nos sources. |
| **2. Déclencher moins de jours** | Si on ne déclenche que les jours extrêmes, leurs créneaux sont plus faciles à couvrir, mais plus de feux partent les jours non déclenchés. | Lier l'objectif à celui du groupe sur le seuil : ne pas augmenter les feux partis un jour non déclenché. |
| **3. Compter les feux sans leur surface** | Couvrir beaucoup de petits feux peut laisser partir les grands. | Suivre aussi une variante en surface : la part de la surface brûlée par les feux partis dans les plages couvertes. |
| **4. Une saison 2027 calme** | Avec peu de jours déclenchés et peu de feux, la part bouge sans que les plages y soient pour rien. | Comparer avec ce que **les mêmes plages** auraient donné sur 2024 et 2025, pas avec une seule valeur. |

## 6. Limites

- Deux saisons seulement se croisent (2024 et 2025) ; la saison 2026 n'est pas publiée dans la BDIFF.
- Les plages de patrouille, les heures de patrouille et le seuil actuel ne sont dans aucune source : l'objectif reste incomplet tant que la direction ne les a pas donnés.
- L'heure d'alerte remplace l'heure de départ, et son fuseau horaire n'est pas vérifié.
- Hors de la période de publication de l'indice, il n'y a pas de jour déclenché : l'objectif ne dit rien des feux de printemps ou d'automne.
