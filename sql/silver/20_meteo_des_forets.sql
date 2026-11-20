-- Météo des forêts -> silver.fait_niveau_danger (un département × un jour du danger).
-- D016 : jour_danger = date de diffusion + 1 jour. On garde niveau_j1 seulement.
-- nom_dep (2024, 2026) et dep_nom (2025) sont harmonisés en nom_departement.
CREATE OR REPLACE TEMP TABLE mdf_controle AS
SELECT
    b.*,
    silver.code_dep(b.num_dep)                                     AS code_dep,
    coalesce(b.nom_dep, b.dep_nom)                                 AS nom_departement,
    try_strptime(b.date, '%Y-%m-%dT%H:%M:%SZ')                     AS diffusion_utc,
    CAST(try_strptime(b.date, '%Y-%m-%dT%H:%M:%SZ') AS DATE) + 1   AS jour_danger,
    try_cast(b.niveau_j1 AS INTEGER)                               AS niveau,
    CASE
        WHEN silver.code_dep(b.num_dep) IS NULL                    THEN 'code département vide'
        WHEN try_strptime(b.date, '%Y-%m-%dT%H:%M:%SZ') IS NULL    THEN 'date de diffusion illisible'
        WHEN try_cast(b.niveau_j1 AS INTEGER) IS NULL              THEN 'niveau_j1 non numérique'
    END                                                            AS motif
FROM bronze.meteo_des_forets b;

CREATE OR REPLACE TEMP TABLE mdf_rang AS
SELECT *, row_number() OVER (PARTITION BY code_dep, jour_danger ORDER BY diffusion_utc DESC, _fichier_source) AS rang
FROM mdf_controle
WHERE motif IS NULL;

CREATE OR REPLACE TABLE silver.fait_niveau_danger AS
SELECT code_dep, jour_danger, diffusion_utc, niveau, nom_departement, _fichier_source
FROM mdf_rang
WHERE rang = 1;

-- File de rejet : les lignes de bronze telles quelles, plus le motif.
CREATE OR REPLACE TABLE silver.rejet_meteo_des_forets AS
SELECT * EXCLUDE (code_dep, nom_departement, diffusion_utc, jour_danger, niveau)
FROM mdf_controle
WHERE motif IS NOT NULL
UNION ALL BY NAME
SELECT * EXCLUDE (code_dep, nom_departement, diffusion_utc, jour_danger, niveau, rang, motif),
       'doublon (code_dep, jour_danger) : bulletin le plus récent gardé' AS motif
FROM mdf_rang
WHERE rang > 1;
