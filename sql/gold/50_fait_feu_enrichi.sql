-- gold.fait_feu_enrichi : un départ de feu de la BDIFF par ligne, avec le niveau de danger du jour.
-- Grain fin exporté pour Power BI : les trois indicateurs (kpi/02_fiches_indicateurs.md) s'y calculent
-- en mesures, quel que soit le paramètre choisi (seuil S en hectares, plages horaires P, seuil N).
--   I1 : part des feux de plus de S ha dans les communes prioritaires (est_commune_prioritaire, surface_ha)
--   I2 : part des feux d'un jour de niveau >= N dont l'heure d'alerte tombe dans P (niveau, heure)
--   I3 : part des feux de la période de publication partis un jour de niveau >= N (niveau, dans_periode_bulletin)
-- niveau : niveau_j1 du bulletin diffusé la veille (D016, jour_danger = jour de l'alerte) ;
--          NULL hors période de publication (pas de bulletin ne veut pas dire danger faible).
-- heure, jour : tirés de la date de première alerte, qui remplace l'heure de départ du feu (D011).
CREATE OR REPLACE TABLE gold.fait_feu_enrichi AS
SELECT
    f.annee,
    f.numero,
    f.code_dep,
    f.code_insee,
    c.nom                                       AS nom_commune,
    f.alerte,
    f.jour_alerte                               AS jour,
    month(f.alerte)                             AS mois,
    isodow(f.alerte)                            AS jour_semaine,  -- 1 = lundi … 7 = dimanche
    hour(f.alerte)                              AS heure,
    n.niveau,
    n.niveau IS NOT NULL                        AS dans_periode_bulletin,
    f.surface_parcourue_ha                      AS surface_ha,
    f.est_marseille,
    p.code_insee IS NOT NULL                    AS est_commune_prioritaire
FROM silver.fait_feu f
LEFT JOIN silver.dim_commune c               ON c.code_insee = f.code_insee AND c.est_courant
LEFT JOIN silver.fait_niveau_danger n        ON n.code_dep = f.code_dep AND n.jour_danger = f.jour_alerte
LEFT JOIN gold.ref_communes_prioritaires p   ON p.code_insee = f.code_insee;
