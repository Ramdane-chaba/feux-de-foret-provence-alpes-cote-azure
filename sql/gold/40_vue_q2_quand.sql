-- gold.v_q2_quand : feux par mois, jour de la semaine et heure de la première alerte (Q2, D011).
-- La date de première alerte remplace l'heure réelle de départ du feu (l'alerte arrive après le départ).
CREATE OR REPLACE VIEW gold.v_q2_quand AS
SELECT
    code_dep,
    annee,
    month(alerte)                                             AS mois,
    isodow(alerte)                                            AS jour_semaine,  -- 1 = lundi … 7 = dimanche
    hour(alerte)                                              AS heure,
    count(*)                                                  AS nb_feux,
    count(*) FILTER (WHERE NOT est_marseille)                 AS nb_feux_hors_marseille,
    coalesce(sum(surface_parcourue_ha), 0)                    AS surface_ha
FROM silver.fait_feu
GROUP BY ALL;
