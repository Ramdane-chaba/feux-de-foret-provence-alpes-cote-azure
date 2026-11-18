# Diagnostic stratégique – SDIS 13, saison feux 2027

Dernière mise à jour : 2026-11-18
Auteurs : Ramdane CHABA, Ghiles MEKDAM, Ouissem AOUIMEUR (brouillon à compléter en groupe)

Sources : la commande de la direction du SDIS 13, les fiches de `docs/sources/`, la [matrice](../docs/sources/matrice.md) et le [journal des décisions](../docs/decisions.md).
Statut « établi » = citation de la commande ou résultat vérifié dans nos fiches. Statut « supposé » = notre lecture, à confirmer.

## 1. Les quatre niveaux

| Niveau | Pour le SDIS 13 | Statut | Pièce |
|---|---|---|---|
| **Stratégie** | Lutter au mieux contre les départs de feu à l'été 2027, saison attendue au moins aussi forte que 2026 | établi | Commande : « où nous attendons autant de feux de forêt que l'été 2026, voire davantage » ; « pour lutter au mieux contre les départs de feu » |
| **Enjeu** | Le seuil actuel se trompe dans les deux sens (alerte sans feu, feu sans alerte), et le budget ne permet pas de renforcer partout tout l'été | établi | Commande : « l'indice annonce souvent un danger élevé alors qu'aucun feu ne se déclare » ; « des feux partis des jours où l'indice était au plus bas » ; « notre budget ne nous permet pas de renforcer le dispositif sur tout le département pendant tout l'été » |
| | Les chefs de centre ne sont pas d'accord entre eux sur ce qui ne va pas | établi | Commande : « Certains chefs de centre… D'autres… » |
| | Marseille est défendue par le BMPM, pas par le SDIS 13 : le périmètre du « département » n'est pas évident | établi | Fiche Interventions SDIS (lignes `13` et `BMPM` séparées) ; D005 |
| **Objectif** | Concentrer le dispositif renforcé sur les jours (et les zones) où le risque de départ de feu est réel, sans dépasser le budget | **supposé** | La commande pose deux questions et une contrainte, mais ne fixe aucune cible chiffrée |
| **Action** | Choisir le niveau de la Météo des forêts qui déclenche le dispositif renforcé, et choisir où concentrer les moyens | établi | Commande : « à partir de quel niveau de la Météo des forêts devons-nous déclencher le dispositif renforcé » ; « où faut-il concentrer nos moyens » |

## 2. L'hypothèse stratégique (sur le niveau supposé : l'objectif)

**Hypothèse** : le SDIS 13 cherche un seuil qui réduit à la fois les jours de renfort sans feu et les feux partis un jour sans renfort, sans augmenter le nombre total de jours de renfort.

- **Pièce qui la fonde** : les deux plaintes des chefs de centre (erreurs dans les deux sens) et la contrainte de budget, citées dans la commande.
- **Confirmée si** : sur les saisons 2024 et 2025, le croisement Météo des forêts × BDIFF pour le 13 montre à la fois des jours de danger élevé sans feu **et** des feux partis des jours de danger faible.
- **Infirmée si** : l'une des deux erreurs est pratiquement absente. Le problème serait alors d'un seul côté, et l'objectif devient « réduire cette erreur-là ».

**Verdict : les données ne permettent pas encore de trancher.**
- Le croisement Météo des forêts × BDIFF n'est pas encore calculé (pipeline non construit).
- Ce qu'on sait déjà (fiche Météo des forêts) : dans le 13, les niveaux 3 et 4 couvrent 78 jours sur les saisons 2024 et 2025 (19 + 0 en 2024, 49 + 10 en 2025), dont 10 jours de niveau 4.

## 3. Les limites, à reprendre dans l'objectif

1. **On ne connaît pas le seuil actuel** (D013). On peut mesurer les erreurs de chaque seuil possible, mais pas celles du seuil dont se plaint la direction tant qu'elle ne nous l'a pas donné.
2. **Deux saisons seulement se croisent** (2024 et 2025, soit 240 jours pour le 13, D012). La saison 2026, citée comme référence par la direction, n'est pas publiée dans la BDIFF.
3. **Le niveau 4 est rare** : 10 jours sur ces deux saisons. Un résultat sur ce niveau sera fragile.
4. **Hors saison, il n'y a pas d'indice** : les feux partis avant juin ou après septembre n'ont pas de niveau, alors que la commande parle aussi du printemps.
5. **La date d'alerte n'est pas l'heure de départ du feu** (D011).
