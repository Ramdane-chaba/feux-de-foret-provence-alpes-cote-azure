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
