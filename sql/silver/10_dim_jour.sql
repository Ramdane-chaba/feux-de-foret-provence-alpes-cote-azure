-- Un jour par ligne, du 2006-01-01 (début de la BDIFF retenue, D006) au 2026-12-31.
CREATE OR REPLACE TABLE silver.dim_jour AS
SELECT
    CAST(jour AS DATE)  AS jour,
    year(jour)          AS annee,
    month(jour)         AS mois,
    isodow(jour)        AS jour_semaine  -- 1 = lundi … 7 = dimanche
FROM generate_series(DATE '2006-01-01', DATE '2026-12-31', INTERVAL 1 DAY) AS t(jour);
