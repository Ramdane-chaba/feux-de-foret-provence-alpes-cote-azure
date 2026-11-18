-- gold.mart_jour_departement : un département de métropole × un jour, TOUS les jours (Q3, Q4, Q5).
--   niveau      : NULL hors saison (pas de bulletin ne veut pas dire danger faible).
--   nb_feux…    : NULL quand les feux de ce département et de cette année ne sont pas chargés
--                 (pas d'export BDIFF, ou 2026 non publiée) ; 0 seulement quand on sait qu'il n'y a eu aucun feu.
--   météo       : stations du département (2 premiers chiffres de NUM_POSTE) ayant une mesure ce jour-là ;
--                 pluie de la veille en moyenne (RR de J-1 s'arrête à 06 h FU le jour J), TX et FXI3S en maximum,
--                 UN en minimum.

-- Couverture de la BDIFF : départements et années présents dans les exports chargés.
CREATE OR REPLACE TABLE gold.couverture_bdiff AS
SELECT d.code_dep, a.annee
FROM (SELECT DISTINCT code_dep FROM silver.fait_feu) d
CROSS JOIN (SELECT DISTINCT annee FROM silver.fait_feu) a;

CREATE OR REPLACE TEMP TABLE feux_jour AS
SELECT
    code_dep,
    jour_alerte                                                AS jour,
    count(*)                                                   AS nb_feux,
    coalesce(sum(surface_parcourue_ha), 0)                     AS surface_ha,
    count(*) FILTER (WHERE NOT est_marseille)                  AS nb_feux_hors_marseille,
    coalesce(sum(surface_parcourue_ha) FILTER (WHERE NOT est_marseille), 0) AS surface_ha_hors_marseille
FROM silver.fait_feu
GROUP BY ALL;

CREATE OR REPLACE TEMP TABLE meteo_jour AS
SELECT
    s.code_dep,
    m.jour,
    count(DISTINCT m.num_poste)    AS nb_stations,
    avg(m.rr_mm)                   AS rr_mm_moyen,
    max(m.tx_c)                    AS tx_max_c,
    max(m.fxi3s_ms)                AS fxi3s_max_ms,
    min(m.un_pct)                  AS un_min_pct
FROM silver.fait_meteo_jour m
JOIN silver.dim_station s USING (num_poste)
WHERE m.rr_mm IS NOT NULL OR m.tx_c IS NOT NULL OR m.fxi3s_ms IS NOT NULL OR m.un_pct IS NOT NULL
GROUP BY ALL;

CREATE OR REPLACE TABLE gold.mart_jour_departement AS
SELECT
    d.code_dep,
    d.nom                                       AS nom_departement,
    d.est_paca,
    j.jour,
    j.annee,
    j.mois,
    j.jour_semaine,
    n.niveau,
    c.code_dep IS NOT NULL                      AS feux_connus,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.nb_feux, 0) END                   AS nb_feux,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.surface_ha, 0) END                AS surface_ha,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.nb_feux_hors_marseille, 0) END    AS nb_feux_hors_marseille,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.surface_ha_hors_marseille, 0) END AS surface_ha_hors_marseille,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.nb_feux, 0) >= 1 END              AS jour_avec_feu,
    CASE WHEN c.code_dep IS NOT NULL THEN coalesce(f.nb_feux_hors_marseille, 0) >= 1 END AS jour_avec_feu_hors_marseille,
    veille.rr_mm_moyen                          AS rr_veille_mm,
    m.tx_max_c,
    m.fxi3s_max_ms,
    m.un_min_pct,
    coalesce(m.nb_stations, 0)                  AS nb_stations
FROM silver.dim_departement d
CROSS JOIN silver.dim_jour j
LEFT JOIN silver.fait_niveau_danger n ON n.code_dep = d.code_dep AND n.jour_danger = j.jour
LEFT JOIN gold.couverture_bdiff c     ON c.code_dep = d.code_dep AND c.annee = j.annee
LEFT JOIN feux_jour f                 ON f.code_dep = d.code_dep AND f.jour = j.jour
LEFT JOIN meteo_jour m                ON m.code_dep = d.code_dep AND m.jour = j.jour
LEFT JOIN meteo_jour veille           ON veille.code_dep = d.code_dep AND veille.jour = j.jour - 1
WHERE d.est_metropole;
