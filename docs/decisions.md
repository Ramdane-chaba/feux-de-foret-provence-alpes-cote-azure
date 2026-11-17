# Journal des décisions

Chaque décision est datée, motivée et attribuée. Une décision remplacée n'est pas supprimée : on ajoute une nouvelle entrée qui la cite. Une décision encore ouverte porte le statut « à décider ».

---

## D001 – Répartition des rôles

- **Date** : 2026-11-16
- **Décidé par** : le groupe (Ramdane CHABA, Ghiles MEKDAM, Ouissem AOUIMEUR)
- **Décision** :
  - Ramdane CHABA : chef de projet et responsable sources
  - Ghiles MEKDAM : responsable qualité et conformité
  - Ouissem AOUIMEUR : responsable pipeline et modèle
- **Motif** : le groupe compte trois membres ; l'énoncé prévoit dans ce cas que le chef de projet prenne aussi la responsabilité des sources.
- **Statut** : décidé

---

## D002 – Nom du dépôt

- **Date** : 2026-11-16
- **Décidé par** : Ramdane CHABA (chef de projet)
- **Décision** : le dépôt, créé sous le nom `sdis13-meteo-des-forets`, est renommé `feux-de-foret-provence-alpes-cote-azure`.
- **Motif** : respecter le nom imposé par l'énoncé. On garde l'orthographe exacte de l'énoncé (« azure »), même si elle semble contenir une faute de frappe, pour que l'enseignante retrouve le dépôt.
- **Statut** : décidé

---

## D003 – Convention de nommage des branches

- **Date** : 2026-11-16
- **Décidé par** : Ramdane CHABA (chef de projet)
- **Décision** : les branches suivent le format `type/description`, avec le même type que le message de commit (`docs`, `feat`, `fix`, `test`). Exemples : `docs/fiche-bdiff`, `feat/chargement-bdiff`.
- **Motif** : deux formats coexistaient (`analyse/ramdane-chaba` et `docs/analyse-commande-ghiles-mekdam`). On garde celui qui est cohérent avec les messages de commit. La branche `analyse/ramdane-chaba` a été renommée `docs/analyse-commande-ramdane-chaba`.
- **Statut** : décidé

---

## D004 – Liste commune des questions analytiques

- **Date** : 2026-11-17
- **Proposé par** : Ramdane CHABA
- **Proposition** : chacun avait numéroté ses questions selon sa propre analyse, donc « Q2 » ou « Q3 » n'avaient pas le même sens dans nos fiches. Liste commune pour les fiches, l'inventaire et la matrice :
  - **Q1 Où** : où se concentrent les départs de feu dans le 13 ?
  - **Q2 Quand** : à quelles périodes (mois, jours, heures) ?
  - **Q3 Seuil** : à partir de quel niveau de la Météo des forêts la part des jours avec feu augmente-t-elle nettement ?
  - **Q4 Budget** : pour chaque seuil possible, combien de jours de renfort par saison et combien de feux manqués ?
  - **Q5 Comparaison** : comment le 13 se situe-t-il par rapport aux autres départements de PACA et à la France ?
- **À faire si validé** : reprendre cette numérotation dans les quatre fiches de sources avant l'inventaire.
- **Statut** : à décider (validation du groupe)

---

## D005 – Périmètre « département 13 » dans les comparaisons

- **Date** : 2026-11-17
- **Soulevé par** : Ouissem AOUIMEUR (analyse de la commande, fiche BDIFF) et Ramdane CHABA (fiche Interventions SDIS)
- **Question** : Marseille est défendue par le Bataillon de marins-pompiers de Marseille (BMPM), pas par le SDIS 13. Pour comparer le 13 aux autres départements, on prend :
  - (a) le périmètre du SDIS 13 seul, sans Marseille : c'est le périmètre de notre commanditaire ;
  - (b) tout le département, Marseille comprise : comparable aux autres départements qui n'ont qu'un service.
- **Impact selon les sources** :
  - Interventions SDIS : la ligne 13 et la ligne BMPM sont séparées (feux de végétation 2024 : 1 403 pour la ligne 13, 1 834 en ajoutant le BMPM).
  - BDIFF : Marseille (code INSEE 13055) compte 217 feux et 1 730 ha sur 2006-2025 d'après la fiche de Ouissem ; on peut l'exclure par le code commune.
  - Météo des forêts : une seule valeur pour tout le département, on ne peut pas exclure Marseille.
- **Statut** : à décider (groupe). Même question pour Paris et la petite couronne avec la BSPP.

---

## D006 – Période retenue pour la BDIFF

- **Date** : 2026-11-17
- **Proposé par** : Ouissem AOUIMEUR (fiche BDIFF)
- **Proposition** : exploiter la BDIFF de 2006 à 2025, et non depuis 1973.
- **Motifs** (fiche BDIFF) : les archives de la Météo des forêts ne commencent qu'en 2024, donc les vieux feux ne servent pas pour le seuil ; avant 2000, la cause manque presque toujours ; la BDIFF couvre toute la France depuis 2006, ce qui permet de comparer sur la même période partout.
- **Point d'attention** : les données climatologiques quotidiennes (fiche de Ramdane) remontent plus loin. Si on les utilise pour rallonger l'historique du seuil, il faudra peut-être revoir cette période pour le 13.
- **Statut** : à décider (groupe)

---

## D007 – Prométhée écartée

- **Date** : 2026-11-17
- **Décidé par** : Ramdane CHABA (responsable sources)
- **Décision** : pas de fiche d'exploitation pour Prométhée (base des feux en région méditerranéenne).
- **Motif** : le site promethee.com est hors ligne (testé le 2026-11-17). D'après Wikipédia, ses données ont été fusionnées avec la BDIFF en 2023 ; la fiche BDIFF de Ouissem le confirme indirectement : l'export du 13 commence le 1973-03-02, alors que la BDIFF ne centralise les données nationales que depuis 2006. On passe donc par la BDIFF. Prométhée sera citée dans l'inventaire comme source fermée.
- **Statut** : décidé

---

## D008 – Analyse de la commande de Ramdane hors de `main`

- **Date** : 2026-11-16
- **Décidé par** : Ramdane CHABA
- **Faits** : l'analyse a été mergée dans `main` par la PR #1, puis retirée de `main` (commit `0597456`). Elle reste sur la branche `docs/analyse-commande-ramdane-chaba`.
- **Motif** : à compléter.
- **Statut** : décidé

---

## D009 – Écarts à la règle de relecture

- **Date** : 2026-11-17
- **Constat** : le README impose que toute modification passe par une pull request relue par le responsable du rôle concerné. Les PR #1 (analyse de Ramdane) et #2 (fiches de sources de Ramdane) ont été mergées par leur auteur.
- **Décision** : à partir de maintenant, personne ne merge sa propre PR. Les PR de Ramdane sont relues et mergées par Ghiles ou Ouissem.
- **Statut** : décidé

---

## D010 – Q1 Où : reformuler au grain de la commune

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM, Ramdane CHABA, Ouissem AOUIMEUR (section 5 de leurs analyses), synthèse dans la [matrice](sources/matrice.md)
- **Question** : Q1 Où.
- **Manque** : la BDIFF localise chaque feu à la commune (`Code INSEE`), sans coordonnées ni massif. Aucune source de l'inventaire ne donne le contour des massifs.
- **Décision** : renoncer en partie. La question devient « dans quelles **communes** du 13 les départs de feu sont-ils les plus fréquents et les plus étendus, et reviennent-ils d'une année sur l'autre ? ». Si le temps le permet, collecter le contour des massifs (BD Forêt ou plans de protection des forêts contre l'incendie, cités dans le défi) pour regrouper les communes.
- **Raison** : Ghiles et Ramdane proposaient d'utiliser la commune comme proxy du massif, Ouissem de reformuler. Reformuler est plus honnête : on ne prétend pas parler de massifs avec une donnée qui ne les contient pas.
- **Ce qu'elle coûte** : la direction raisonne en massifs, pas en communes. Un massif s'étend sur plusieurs communes, et les grandes communes (Marseille, Aix-en-Provence, Arles avec la Camargue) mélangent des zones très différentes. Dépend aussi de D005 (Marseille).
- **Statut** : à décider (groupe)

---

## D011 – Q2 Quand : la date d'alerte comme proxy du départ du feu

- **Date** : 2026-11-17
- **Proposé par** : Ramdane CHABA (section 5 de son analyse) ; vérification de l'heure par Ghiles MEKDAM
- **Question** : Q2 Quand.
- **Manque** : la BDIFF date chaque feu par sa première alerte, pas par son heure réelle de départ. La saison 2026 n'est pas publiée. Ramdane avait noté les heures « inconnu » : l'export CSV ouvert le 2026-11-17 montre que `Date de première alerte` contient l'heure (ex. `2025-01-04 21:48:00`).
- **Décision** : approximer. Utiliser `Date de première alerte` (mois, jour de la semaine, heure) à la place du départ du feu, sur 2006-2025.
- **Raison** : c'est la seule date disponible pour chaque feu ; la vérification préalable demandée par Ramdane est faite.
- **Ce qu'elle coûte** : l'alerte arrive après le début du feu ; l'écart n'est pas mesurable avec nos sources. Pas de saison 2026.
- **Statut** : à décider (groupe)

---

## D012 – Q3 Seuil : deux saisons croisables, puis un proxy

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM, Ramdane CHABA, Ouissem AOUIMEUR (section 5 de leurs analyses)
- **Question** : Q3 Seuil.
- **Manque** : la Météo des forêts couvre 2024, 2025 et 2026, sans 2023 ; la BDIFF s'arrête en 2025. Seules **deux** saisons se croisent (240 jours pour le 13), et non trois comme l'écrivait l'analyse de Ouissem. Le niveau 4 n'apparaît que 10 jours dans le 13 sur ces deux saisons.
- **Décision** : approximer, puis collecter. Croiser Météo des forêts et BDIFF sur 2024-2025 (jointure D016). Rallonger l'historique avec l'Indice forêt météo (IFM, Copernicus, ou recalculé à partir des données climatologiques quotidiennes), après avoir vérifié la faisabilité du calcul. Demander la saison 2023 à Météo-France.
- **Raison** : deux saisons ne suffisent pas pour fixer un seuil solide, surtout pour les niveaux élevés.
- **Ce qu'elle coûte** : l'IFM ne reflète pas l'expertise des prévisionnistes ni l'ajustement par département de la Météo des forêts ; il faudra recréer quatre niveaux en fixant des bornes, ce qui ajoute une hypothèse. Si on rallonge l'historique, la période de D006 est à revoir pour le 13.
- **Statut** : à décider (groupe)

---

## D013 – Q4 Budget : collecter le coût, raisonner en jours de renfort

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM, Ramdane CHABA, Ouissem AOUIMEUR (section 5 de leurs analyses)
- **Question** : Q4 Budget.
- **Manque** : aucune source ne contient le coût d'une journée de dispositif renforcé, le budget de la saison ni le seuil actuel.
- **Décision** : collecter ces trois informations auprès de la direction du SDIS 13. En attendant, approximer : présenter chaque seuil en nombre de jours de renfort, de fausses alertes et de feux manqués, sans conversion en euros.
- **Raison** : ce sont des données internes au SDIS ; les trois analyses arrivent à la même conclusion.
- **Ce qu'elle coûte** : sans le coût, on peut dire « ce seuil demande X jours de renfort », pas « ce seuil coûte X euros » : la direction fera la conversion. Dépend du délai de réponse avant le 11 décembre.
- **Statut** : à décider (groupe)

---

## D014 – Q5 Comparaison : jour par jour sur 2024-2025, volumes annuels sur la durée

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM, Ramdane CHABA, Ouissem AOUIMEUR (section 5 de leurs analyses)
- **Question** : Q5 Comparaison.
- **Manque** : la Météo des forêts ne couvre que trois saisons (deux croisables) ; la BDIFF est limitée à 30 000 lignes par export ; les interventions SDIS sont annuelles ; aucune source ne donne la surface forestière par département.
- **Divergence** : Ramdane proposait de limiter la comparaison jour par jour à PACA et de comparer la France seulement à l'année ; Ouissem de comparer toute la France jour par jour sur trois saisons ; Ghiles de comparer tous les départements sur 2024-2025. Retour au fichier : un export BDIFF de toute la France pour 2025 compte **2 541 feux**, bien sous la limite de 30 000 lignes. La comparaison nationale jour par jour est donc faisable avec un export par année.
- **Décision** : approximer. Comparer le 13, les cinq autres départements de PACA et la France métropolitaine en jours avec feu par niveau de danger, sur 2024-2025 (Météo des forêts × BDIFF, un export BDIFF par année). Compléter par une comparaison des volumes annuels d'interventions (`Feux de végétations`) sur plusieurs années, sans lien avec l'indice. Collecter la surface forestière par département (Corine Land Cover ou BD Forêt) pour rapporter les feux à la forêt disponible.
- **Raison** : seules la Météo des forêts et la BDIFF ont à la fois le jour et le département.
- **Ce qu'elle coûte** : deux saisons ne distinguent pas une vraie différence d'une variation d'une année à l'autre. Sans surface forestière, un département très boisé paraîtra avoir plus de feux. Le nombre de feux 2024 pour la France reste à vérifier à l'export. Pas d'outre-mer. Dépend de D005 (périmètre du 13).
- **Statut** : à décider (groupe)

---

## D015 – Arbitrage des degrés divergents dans la matrice

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM, à partir des trois matrices individuelles
- **Question** : Q2, Q3, Q4 et Q5.
- **Manque** : nos matrices individuelles donnaient des degrés différents pour quatre cellules.
- **Décision** : après retour aux fichiers (détail dans la [matrice](sources/matrice.md), section « Les divergences ») :
  - Q2 × BDIFF : **partiel** (l'heure est bien présente ; l'« inconnu » est levé) ;
  - Q4 × données climatologiques : **partiel** (indirect, comme pour Q3), et non absent ;
  - Q5 × interventions SDIS : **partiel** (comparaison des volumes seulement), et non absent ;
  - Q3 et Q5 × Météo des forêts : **deux** saisons croisables avec la BDIFF, et non trois.
- **Raison** : la consigne demande de retourner au fichier quand les degrés divergent.
- **Ce qu'elle coûte** : les sections 5 des analyses individuelles gardent leurs degrés d'origine (elles ne sont pas corrigées) : la matrice du groupe fait foi.
- **Statut** : à décider (groupe)

---

## D016 – Jointure entre la Météo des forêts et les feux

- **Date** : 2026-11-17
- **Proposé par** : Ghiles MEKDAM (fiche Météo des forêts), repris par Ouissem AOUIMEUR (fiche BDIFF)
- **Question** : Q3, Q4 et Q5.
- **Manque** : la colonne `date` de la Météo des forêts est la date de diffusion du bulletin, et `niveau_j1` concerne le lendemain. Le code département s'écrit `1` ou `01` selon l'année.
- **Décision** : joindre le jour de `Date de première alerte` (BDIFF) au jour de `date` + 1 (Météo des forêts), sur le code département harmonisé à deux caractères (`01`, `2A`, `2B`, `13`…).
- **Raison** : une jointure directe sur la date décalerait toute l'analyse d'un jour.
- **Ce qu'elle coûte** : on utilise la prévision de la veille, pas un niveau observé le jour même.
- **Statut** : à décider (groupe)

---

## D017 – Rafale du jour : utiliser `FXI3S`

- **Date** : 2026-11-17
- **Proposé par** : Ramdane CHABA (fiche données climatologiques quotidiennes)
- **Question** : Q2 et Q3 (données climatologiques).
- **Manque** : le fichier contient deux mesures de vent fort, `FXI` et `FXI3S`.
- **Décision** : utiliser `FXI3S`.
- **Raison** : le descriptif de Météo-France le désigne comme le « champ utilisé pour caractériser la rafale quotidienne ».
- **Ce qu'elle coûte** : des valeurs un peu plus faibles que `FXI` (16,7 m/s contre 18,1 m/s au Bec de l'Aigle le 2025-07-15).
- **Statut** : à décider (groupe)
