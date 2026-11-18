-- Interventions SDIS -> silver.fait_interventions_an (un service × une année) et silver.dim_service.

-- Mapping année par année, relevé dans les en-têtes des fichiers d'origine (2026-11-18) :
-- 70 colonnes (2008-2009), 16 (2010-2013), 71 (2014-2024) ; « Feux de végétations » absente de 2010 à 2013.
CREATE OR REPLACE TABLE silver.interventions_mapping AS
SELECT * FROM (VALUES
    (2008, 70, 'Feux de végétations'), (2009, 70, 'Feux de végétations'),
    (2010, 16, NULL), (2011, 16, NULL), (2012, 16, NULL), (2013, 16, NULL),
    (2014, 71, 'Feux de végétations'), (2015, 71, 'Feux de végétations'), (2016, 71, 'Feux de végétations'),
    (2017, 71, 'Feux de végétations'), (2018, 71, 'Feux de végétations'), (2019, 71, 'Feux de végétations'),
    (2020, 71, 'Feux de végétations'), (2021, 71, 'Feux de végétations'), (2022, 71, 'Feux de végétations'),
    (2023, 71, 'Feux de végétations'), (2024, 71, 'Feux de végétations')
) AS t(annee, nb_colonnes, colonne_feux_vegetation);

CREATE OR REPLACE TEMP TABLE interventions_controle AS
SELECT
    b.*,
    try_cast(b."Année" AS INTEGER)                                        AS annee,
    CASE WHEN b."Numéro" IN ('BMPM', 'BSPP') THEN b."Numéro" ELSE silver.code_dep(b."Numéro") END
                                                                          AS code_service,
    -- NULL (jamais 0) quand la colonne n'existe pas cette année-là, que la cellule est vide
    -- ou qu'elle vaut « N.C. » (non communiqué : manquant déguisé, compté dans le rapport de qualité).
    CASE WHEN m.colonne_feux_vegetation IS NOT NULL THEN silver.entier_texte(b."Feux de végétations") END
                                                                          AS feux_vegetation,
    coalesce(trim(b."Feux de végétations") = 'N.C.', FALSE)               AS feux_vegetation_nc,
    CASE
        WHEN m.annee IS NULL                                              THEN 'année absente du mapping'
        WHEN b."Année" <> regexp_extract(b._fichier_source, '(\d{4})', 1) THEN 'année différente de celle du fichier'
        WHEN b."Numéro" IS NULL                                           THEN 'Numéro vide'
        WHEN m.colonne_feux_vegetation IS NOT NULL
             AND b."Feux de végétations" IS NOT NULL
             AND trim(b."Feux de végétations") <> 'N.C.'
             AND silver.entier_texte(b."Feux de végétations") IS NULL     THEN 'Feux de végétations non numérique'
    END                                                                   AS motif
FROM bronze.interventions b
LEFT JOIN silver.interventions_mapping m ON m.annee = try_cast(b."Année" AS INTEGER);

CREATE OR REPLACE TEMP TABLE interventions_rang AS
SELECT *, row_number() OVER (PARTITION BY annee, code_service ORDER BY _fichier_source) AS rang
FROM interventions_controle
WHERE motif IS NULL;

CREATE OR REPLACE TABLE silver.fait_interventions_an AS
SELECT annee, code_service, feux_vegetation, feux_vegetation_nc, _fichier_source
FROM interventions_rang
WHERE rang = 1;

CREATE OR REPLACE TABLE silver.rejet_interventions AS
SELECT * EXCLUDE (annee, code_service, feux_vegetation, feux_vegetation_nc)
FROM interventions_controle
WHERE motif IS NOT NULL
UNION ALL BY NAME
SELECT * EXCLUDE (annee, code_service, feux_vegetation, feux_vegetation_nc, rang, motif), 'doublon (annee, code_service)' AS motif
FROM interventions_rang
WHERE rang > 1;

-- BMPM et BSPP sont des services, pas des départements : BMPM est rattaché au 13 (Marseille),
-- BSPP à aucun département (Paris et petite couronne).
CREATE OR REPLACE TABLE silver.dim_service AS
SELECT
    code_service,
    CASE code_service WHEN 'BMPM' THEN '13' WHEN 'BSPP' THEN NULL ELSE code_service END AS code_dep,
    CASE WHEN code_service IN ('BMPM', 'BSPP') THEN code_service ELSE 'SDIS' END        AS type,
    arg_max("Département", annee)                                                       AS departement_source
FROM interventions_controle
WHERE motif IS NULL
GROUP BY code_service;
