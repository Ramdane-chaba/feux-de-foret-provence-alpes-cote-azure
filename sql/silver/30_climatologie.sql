-- Données climatologiques -> silver.fait_meteo_jour (une station × un jour) et silver.dim_station.
-- RR du jour J couvre de 06 h FU le jour J à 06 h FU le jour J+1 (descriptif Météo-France) :
-- la pluie tombée avant un feu du jour J se lit sur le jour J-1 (fait en gold).
-- Rafale du jour : FXI3S (D017). Une valeur dont le code qualité vaut 2 est mise à NULL.
-- Période : à partir de 2006, comme dim_jour (D006 ; à revoir si D012 rallonge l'historique).
CREATE OR REPLACE TEMP TABLE climato_controle AS
SELECT
    r.*,
    a.UN,
    a.QUN,
    CAST(try_strptime(r.AAAAMMJJ, '%Y%m%d') AS DATE)                           AS jour,
    CASE
        WHEN r.NUM_POSTE IS NULL OR NOT regexp_matches(r.NUM_POSTE, '^[0-9]{8}$') THEN 'NUM_POSTE invalide'
        WHEN try_strptime(r.AAAAMMJJ, '%Y%m%d') IS NULL                         THEN 'AAAAMMJJ illisible'
        WHEN r.RR    IS NOT NULL AND try_cast(r.RR    AS DOUBLE) IS NULL          THEN 'RR non numérique'
        WHEN r.TX    IS NOT NULL AND try_cast(r.TX    AS DOUBLE) IS NULL          THEN 'TX non numérique'
        WHEN r.FFM   IS NOT NULL AND try_cast(r.FFM   AS DOUBLE) IS NULL          THEN 'FFM non numérique'
        WHEN r.FXI3S IS NOT NULL AND try_cast(r.FXI3S AS DOUBLE) IS NULL          THEN 'FXI3S non numérique'
        WHEN a.UN    IS NOT NULL AND try_cast(a.UN    AS DOUBLE) IS NULL          THEN 'UN non numérique'
    END                                                                        AS motif
FROM bronze.climato_rr_t_vent r
LEFT JOIN bronze.climato_autres_parametres a USING (NUM_POSTE, AAAAMMJJ)
WHERE r.AAAAMMJJ >= '20060101'
   OR try_strptime(r.AAAAMMJJ, '%Y%m%d') IS NULL;

CREATE OR REPLACE TABLE silver.fait_meteo_jour AS
SELECT
    NUM_POSTE                       AS num_poste,
    jour,
    silver.mesure(RR, QRR)          AS rr_mm,
    silver.mesure(TX, QTX)          AS tx_c,
    silver.mesure(FFM, QFFM)        AS ffm_ms,
    silver.mesure(FXI3S, QFXI3S)    AS fxi3s_ms,
    silver.mesure(UN, QUN)          AS un_pct,
    coalesce(QRR = '2' OR QTX = '2' OR QFFM = '2' OR QFXI3S = '2' OR QUN = '2', FALSE) AS a_valeur_douteuse
FROM climato_controle
WHERE motif IS NULL;

CREATE OR REPLACE TABLE silver.rejet_climatologie AS
SELECT * EXCLUDE (jour)
FROM climato_controle
WHERE motif IS NOT NULL;

-- Une station : nom et position de sa ligne la plus récente. Département = 2 premiers chiffres
-- de NUM_POSTE, jamais la commune (le numéro de commune du poste n'est pas forcément sa commune actuelle).
CREATE OR REPLACE TABLE silver.dim_station AS
SELECT
    NUM_POSTE                                       AS num_poste,
    arg_max(NOM_USUEL, AAAAMMJJ)                    AS nom,
    try_cast(arg_max(LAT, AAAAMMJJ) AS DOUBLE)      AS lat,
    try_cast(arg_max(LON, AAAAMMJJ) AS DOUBLE)      AS lon,
    try_cast(arg_max(ALTI, AAAAMMJJ) AS INTEGER)    AS altitude_m,
    left(NUM_POSTE, 2)                              AS code_dep,
    CAST(strptime(min(AAAAMMJJ), '%Y%m%d') AS DATE) AS premiere_mesure,
    CAST(strptime(max(AAAAMMJJ), '%Y%m%d') AS DATE) AS derniere_mesure
FROM bronze.climato_rr_t_vent
WHERE regexp_matches(NUM_POSTE, '^[0-9]{8}$')
  AND try_strptime(AAAAMMJJ, '%Y%m%d') IS NOT NULL
GROUP BY NUM_POSTE;
