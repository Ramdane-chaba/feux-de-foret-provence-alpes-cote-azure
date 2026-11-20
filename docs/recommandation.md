# Recommandation au SDIS 13 – saison feux 2027

Dernière mise à jour : 2026-11-20
Pour : la direction du SDIS 13 (Bouches-du-Rhône).
Application de présentation : [sdis13-feux-2027.netlify.app](https://sdis13-feux-2027.netlify.app/) (récit, simulateur de seuil, carte, calendrier, synthèse imprimable).

Cette note répond aux deux arbitrages de la commande :

- **Arbitrage 1** : où concentrer les moyens humains et financiers ;
- **Arbitrage 2** : à partir de quel niveau de la Météo des forêts déclencher le dispositif renforcé.

Tous les chiffres sont recalculés par le [pipeline](pipeline.md) à partir de sources ouvertes, et vérifiés par les tests (`tests/test_kpi_parquet.py`, `tests/test_export_web.py`). Les indicateurs I1, I2 et I3 sont définis dans les [fiches d'indicateurs](../kpi/02_fiches_indicateurs.md).

## En bref

1. **Déclencher le dispositif renforcé à partir du niveau 3 de la Météo des forêts, et ne pas monter au niveau 4.** Au niveau 3, le renfort couvre la moitié des feux (49,9 %) pour 78 jours sur deux saisons. Au niveau 4, il ne coûte plus que 10 jours, mais 87 % des feux partent hors renfort, et aucun feu de 2024 n'aurait été couvert.
2. **Prévoir un budget en jours de renfort qui varie d'une saison à l'autre.** Au même seuil, le niveau 3 a déclenché 19 jours en 2024 et 59 jours en 2025. Un seuil fixe ne tient pas un budget fixe : il faut une réserve pour les étés secs, ou un plafond de jours au-delà duquel on relève le seuil.
3. **Concentrer patrouilles et guet sur 18 communes et sur l'après-midi.** Ces 18 communes, sur 113 touchées, regroupent 51 % des feux depuis 2006 (hors Marseille). Les jours de niveau 3 ou plus, 63,8 % des alertes tombent entre 12 h et 20 h.

## 1. Quels jours renforcer : le seuil (arbitrage 2)

Feux du 13 sur les saisons 2024 et 2025, les deux seules où la BDIFF et les bulletins de la Météo des forêts se croisent (D012). Un feu est « couvert » s'il part un jour où le niveau prévu la veille atteint le seuil (D016).

| Seuil | Feux couverts (2024-2025) | Jours de renfort en 2024 | Jours de renfort en 2025 | Jours de renfort sans aucun feu |
|---|---|---|---|---|
| Niveau 2 ou plus | 88,7 % (315 / 355) | 87 sur 120 | 94 sur 120 | 50 sur 181 (27,6 %) |
| **Niveau 3 ou plus** | **49,9 % (177 / 355)** | **19 sur 120** | **59 sur 120** | **12 sur 78 (15,4 %)** |
| Niveau 4 ou plus | 13,0 % (46 / 355) | 0 sur 120 | 10 sur 120 | 1 sur 10 (10,0 %) |

**Ce que nous en tirons :**

- **Le niveau 3 est le meilleur compromis.** Le niveau 2 couvre presque tous les feux, mais tient le renfort les trois quarts de l'été. Le niveau 4 ne couvre plus qu'un feu sur huit.
- **Le premier défaut du seuil n'est pas de déclencher pour rien.** Au niveau 3, seuls 15,4 % des jours de renfort sont sans feu. Le vrai coût, ce sont les feux partis un jour sans renfort : 178 sur 355.
- **Le nombre de jours varie trop pour un budget fixe.** Au niveau 3 : 16 % des jours de la saison 2024, 49 % de ceux de 2025. C'est l'hypothèse de l'objectif O3, confirmée par les données.

Le [simulateur](https://sdis13-feux-2027.netlify.app/#/simulateur) permet de tester chaque seuil avec un budget en jours.

## 2. Où concentrer les moyens (arbitrage 1)

De 2006 à 2025, hors Marseille (défendue par le Bataillon de marins-pompiers, D005), **18 communes sur 113 regroupent 2 101 des 4 085 feux (51 %)**. Ce sont presque toujours les mêmes d'une année à l'autre :

Martigues (303 feux), Aix-en-Provence (253), Istres (177), Miramas (134), La Ciotat (124), Les Pennes-Mirabeau (119), Aubagne (105), Fuveau (104), Septèmes-les-Vallons (92), Fos-sur-Mer (88), Gardanne (88), Port-de-Bouc (81), Auriol (77), Lançon-Provence (76), Salon-de-Provence (74), Rognac (73), Vitrolles (70), Cabriès (63).

- **Indicateur I1** (objectif O1) : en 2024-2025, 6,6 % des feux de ces communes ont dépassé 1 ha (16 sur 242), contre 3,8 % ailleurs (8 sur 208). L'objectif est de faire baisser cette part sans la faire monter dans les autres communes.
- La [carte](https://sdis13-feux-2027.netlify.app/#/carte) montre ces communes année par année.

## 3. À quelle heure patrouiller

Les jours de niveau 3 ou plus, les alertes se concentrent entre 14 h et 18 h (73 des 177 feux).

| Plage de patrouille | Durée | Alertes couvertes (I2) |
|---|---|---|
| 10 h - 20 h | 10 h | 70,1 % |
| **12 h - 20 h** | **8 h** | **63,8 %** |
| 13 h - 19 h | 6 h | 53,7 % |

Passer de 8 h à 6 h de patrouille fait perdre 10 points de couverture, alors que passer de 8 h à 10 h n'en fait gagner que 6. **Nous recommandons une plage de 12 h à 20 h les jours déclenchés**, à ajuster avec les plages réelles du SDIS, que nous n'avons pas.

## 4. Le 13 face à la région et au reste du pays

| | Bouches-du-Rhône | Reste de PACA | France |
|---|---|---|---|
| Feux de forêt 2006-2025 (BDIFF) | 4 302, soit 40 % des feux de PACA | Var 2 685, Alpes-Maritimes 1 899, Alpes-de-Haute-Provence 940, Vaucluse 672, Hautes-Alpes 291 | – |
| Part des feux de plus de 1 ha | 8,2 % | de 9,2 % (Var) à 23,0 % (Alpes-de-Haute-Provence) | – |
| Jours de niveau 3 ou plus (2024-2025) | 32,5 % | Vaucluse 33,3 %, Var 30,8 %, autres départements 5 % ou moins | 3,1 % (96 départements) |
| Interventions pour feux de végétation (SDIS) | 1ᵉʳ service de France en 2022 et 2023, 3ᵉ en 2024 | – | – |

**Le 13 est le département de PACA qui a le plus de départs de feu, mais ses feux restent plus petits qu'ailleurs.** L'enjeu est donc d'abord la détection et l'attaque rapide, ce que visent les patrouilles et le guet, plus que la lutte contre de grands incendies. Les jours de danger élevé y sont dix fois plus fréquents que dans la moyenne nationale : le renfort ne peut pas y être exceptionnel.

## 5. Ce qui manque pour conclure

Trois informations ne sont détenues que par la direction. Elles fixent les cibles des objectifs ([01_objectifs.md](../kpi/01_objectifs.md)) :

- **le seuil de déclenchement actuel**, pour mesurer la situation de départ (D013) ;
- **le budget de la saison et le coût d'une journée de renfort**, pour traduire les jours en euros et fixer le plafond [J] de l'objectif O3 ;
- **les plages horaires et le nombre d'heures de patrouille de l'été 2026**, pour l'objectif O2.

## 6. Limites

- **Deux saisons seulement** pour le seuil (2024 et 2025) : la BDIFF de 2026 n'est pas encore publiée, et les archives de la Météo des forêts ne remontent pas avant 2024 (D012). Le niveau 4 n'apparaît que 10 jours sur ces deux saisons : les conclusions sur ce niveau restent fragiles.
- **27,4 % des feux du 13 (134 sur 489) partent hors de la période de publication de l'indice** (avant le 4 juin ou après le 1er octobre). Aucun seuil ne les couvre : ils relèvent du dispositif ordinaire.
- **Des proxys, faute de champ direct** : l'heure de première alerte remplace l'heure de départ (D011), et le niveau prévu la veille remplace les jours réellement renforcés. Leurs biais sont décrits dans les [fiches d'indicateurs](../kpi/02_fiches_indicateurs.md).
- **Un point non vérifié** : le fuseau horaire de l'heure d'alerte dans la BDIFF.

## Suivre la saison 2027

| Indicateur | Valeur de référence (2024-2025) | Ce qu'il dit |
|---|---|---|
| **I1** – grands feux dans les communes prioritaires | 6,6 % | si le renfort limite les feux qui dépassent 1 ha |
| **I2** – alertes dans les plages de patrouille | 63,8 % (niveau 3, 12 h - 20 h) | si les patrouilles tombent aux bonnes heures |
| **I3** – feux couverts par le seuil | 49,9 % (niveau 3) | quelle part des feux le seuil retenu couvre |

Il suffit de relancer le pipeline avec l'export BDIFF de la saison 2027 pour recalculer les trois indicateurs.
