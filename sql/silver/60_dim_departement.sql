-- Départements : métropole et Corse d'après la Météo des forêts (nom le plus récent),
-- complétés par les départements d'outre-mer des interventions (absents de la Météo des forêts).
CREATE OR REPLACE TABLE silver.dim_departement AS
WITH mdf AS (
    SELECT code_dep, arg_max(nom_departement, diffusion_utc) AS nom, 'Météo des forêts' AS origine
    FROM silver.fait_niveau_danger
    GROUP BY code_dep
), outre_mer AS (
    SELECT code_dep, departement_source AS nom, 'Interventions SDIS' AS origine
    FROM silver.dim_service
    WHERE type = 'SDIS' AND code_dep NOT IN (SELECT code_dep FROM mdf)
)
SELECT
    code_dep,
    nom,
    code_dep IN ('04', '05', '06', '13', '83', '84') AS est_paca,
    length(code_dep) = 2                             AS est_metropole,
    origine
FROM (SELECT * FROM mdf UNION ALL SELECT * FROM outre_mer);
