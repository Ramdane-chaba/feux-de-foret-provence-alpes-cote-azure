-- BDIFF -> silver.fait_feu (un feu) et silver.dim_commune.
-- NON VÉRIFIÉ SUR FICHIER : aucun export n'a encore été déposé dans data/raw/bdiff/. Les noms de colonnes
-- viennent de la fiche BDIFF et du glossaire ; le contrôle de schéma (qualite.py) bloque si l'export diffère.
-- Sans export, construire.py exécute sql/silver/si_absent/50_bdiff.sql à la place.
CREATE OR REPLACE TEMP TABLE bdiff_controle AS
SELECT
    b.*,
    try_cast(b."Année" AS INTEGER)                                            AS annee,
    trim(b."Numéro")                                                          AS numero,
    silver.code_dep(b."Département")                                          AS code_dep,
    trim(b."Code INSEE")                                                      AS code_insee,
    try_cast(b."Date de première alerte" AS TIMESTAMP)                        AS alerte,
    try_cast(b."Surface parcourue (m2)" AS DOUBLE)                            AS surface_parcourue_m2,
    try_cast(b."Surface forêt (m2)" AS DOUBLE)                                AS surface_foret_m2,
    try_cast(b."Surface maquis garrigues (m2)" AS DOUBLE)                     AS surface_maquis_m2,
    CASE
        WHEN try_cast(b."Année" AS INTEGER) IS NULL                           THEN 'Année illisible'
        WHEN b."Numéro" IS NULL                                               THEN 'Numéro vide'
        WHEN b."Code INSEE" IS NULL                                           THEN 'Code INSEE vide'
        WHEN try_cast(b."Date de première alerte" AS TIMESTAMP) IS NULL       THEN 'Date de première alerte illisible'
        WHEN b."Surface parcourue (m2)" IS NOT NULL
             AND try_cast(b."Surface parcourue (m2)" AS DOUBLE) IS NULL       THEN 'Surface parcourue non numérique'
    END                                                                       AS motif
FROM bronze.bdiff b;

-- Clé Année + Numéro : un recouvrement d'exports crée des doublons ; on garde une ligne, les autres vont au rejet.
CREATE OR REPLACE TEMP TABLE bdiff_rang AS
SELECT *, row_number() OVER (PARTITION BY annee, numero ORDER BY _fichier_source) AS rang
FROM bdiff_controle
WHERE motif IS NULL;

CREATE OR REPLACE TABLE silver.fait_feu AS
SELECT
    annee,
    numero,
    code_dep,
    code_insee,
    alerte,
    CAST(alerte AS DATE)           AS jour_alerte,
    surface_parcourue_m2 / 10000   AS surface_parcourue_ha,
    surface_foret_m2 / 10000       AS surface_foret_ha,
    surface_maquis_m2 / 10000      AS surface_maquis_garrigues_ha,
    "Précision des surfaces"       AS precision_surfaces,
    "Nature"                       AS nature,
    code_insee = '13055'           AS est_marseille,  -- D005 : marqué, jamais supprimé
    _fichier_source
FROM bdiff_rang
WHERE rang = 1;

CREATE OR REPLACE TABLE silver.rejet_bdiff AS
SELECT * EXCLUDE (annee, numero, code_dep, code_insee, alerte, surface_parcourue_m2, surface_foret_m2, surface_maquis_m2)
FROM bdiff_controle
WHERE motif IS NOT NULL
UNION ALL BY NAME
SELECT * EXCLUDE (annee, numero, code_dep, code_insee, alerte, surface_parcourue_m2, surface_foret_m2, surface_maquis_m2, rang, motif),
       'doublon (Année, Numéro) : recouvrement d''exports' AS motif
FROM bdiff_rang
WHERE rang > 1;

-- dim_commune préparée en SCD type 2 (valide_du, valide_au, est_courant).
-- Sans référentiel COG chargé, aucun historique n'est inventé : une seule version par commune,
-- ouverte (valide_au NULL), avec le nom le plus récent vu dans la BDIFF.
CREATE OR REPLACE TABLE silver.dim_commune AS
SELECT
    code_insee || '#1'                       AS commune_sk,
    code_insee,
    arg_max("Nom de la commune", alerte)     AS nom,
    arg_max(code_dep, alerte)                AS code_dep,
    min(CAST(alerte AS DATE))                AS valide_du,
    CAST(NULL AS DATE)                       AS valide_au,
    TRUE                                     AS est_courant,
    'BDIFF (sans COG)'                       AS origine_version
FROM bdiff_rang
WHERE rang = 1
GROUP BY code_insee;
