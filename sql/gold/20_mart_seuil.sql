-- gold.mart_seuil : un département × une saison × un seuil (2, 3, 4) × un périmètre (Q3, Q4, Q5).
-- Un jour est « déclenché » pour le seuil s si niveau >= s. Seuls les jours avec bulletin comptent.
-- Saisons 2024 et 2025 seulement : la BDIFF 2026 n'est pas publiée (D012).
-- Périmètre : tout le département, ou sans Marseille (D005 non tranchée ; la Météo des forêts, elle,
-- reste celle de tout le département).
-- Les colonnes de feux sont NULL quand les feux du département ne sont pas chargés.
-- Feux manqués comptés de deux façons (glossaire) : en feux (feux_manques) et en jours (jours_avec_feu_manques).
CREATE OR REPLACE TABLE gold.mart_seuil AS
WITH jours AS (
    SELECT code_dep, nom_departement, est_paca, annee, jour, niveau, feux_connus,
           'departement' AS perimetre, nb_feux, surface_ha
    FROM gold.mart_jour_departement
    WHERE niveau IS NOT NULL AND annee IN (2024, 2025)
    UNION ALL
    SELECT code_dep, nom_departement, est_paca, annee, jour, niveau, feux_connus,
           'hors_marseille' AS perimetre, nb_feux_hors_marseille, surface_ha_hors_marseille
    FROM gold.mart_jour_departement
    WHERE niveau IS NOT NULL AND annee IN (2024, 2025)
)
SELECT
    j.code_dep,
    j.nom_departement,
    j.est_paca,
    j.annee,
    s.seuil,
    j.perimetre,
    bool_and(j.feux_connus)                                              AS feux_connus,
    count(*)                                                             AS jours_bulletin,
    count(*) FILTER (WHERE j.niveau >= s.seuil)                          AS jours_declenches,
    CASE WHEN bool_and(j.feux_connus) THEN
        count(*) FILTER (WHERE j.niveau >= s.seuil AND j.nb_feux >= 1) END AS jours_declenches_avec_feu,
    CASE WHEN bool_and(j.feux_connus) THEN
        count(*) FILTER (WHERE j.niveau >= s.seuil AND j.nb_feux = 0) END  AS fausses_alertes,
    CASE WHEN bool_and(j.feux_connus) THEN
        coalesce(sum(j.nb_feux) FILTER (WHERE j.niveau < s.seuil), 0) END  AS feux_manques,
    CASE WHEN bool_and(j.feux_connus) THEN
        count(*) FILTER (WHERE j.niveau < s.seuil AND j.nb_feux >= 1) END  AS jours_avec_feu_manques,
    CASE WHEN bool_and(j.feux_connus) THEN
        coalesce(sum(j.surface_ha) FILTER (WHERE j.niveau < s.seuil), 0) END AS surface_manquee_ha
FROM jours j
CROSS JOIN (VALUES (2), (3), (4)) AS s(seuil)
GROUP BY ALL;
