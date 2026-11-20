-- gold.mart_commune_annee : une commune × une année (Q1, reformulée au grain de la commune, D010).
-- Le rang est calculé dans le département et l'année, sur le nombre de feux puis la surface.
-- Marseille est gardée et marquée (D005).
CREATE OR REPLACE TABLE gold.mart_commune_annee AS
SELECT
    f.code_dep,
    f.code_insee,
    c.nom                                                     AS nom_commune,
    f.annee,
    bool_or(f.est_marseille)                                  AS est_marseille,
    count(*)                                                  AS nb_feux,
    coalesce(sum(f.surface_parcourue_ha), 0)                  AS surface_ha,
    rank() OVER (
        PARTITION BY f.code_dep, f.annee
        ORDER BY count(*) DESC, coalesce(sum(f.surface_parcourue_ha), 0) DESC
    )                                                         AS rang_dans_departement
FROM silver.fait_feu f
LEFT JOIN silver.dim_commune c ON c.code_insee = f.code_insee AND c.est_courant
GROUP BY f.code_dep, f.code_insee, c.nom, f.annee;
