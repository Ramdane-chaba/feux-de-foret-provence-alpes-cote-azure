-- gold.ref_communes_prioritaires : les 18 communes prioritaires de l'objectif O1 (Q1 Où, kpi/01_objectifs.md).
-- Liste arrêtée sur la BDIFF 2006-2025, hors Marseille : ces 18 communes regroupent 51 % des feux du 13.
-- Codes INSEE relevés dans silver.dim_commune (2026-11-19). La liste est figée ici, et non recalculée,
-- pour que l'indicateur I1 porte toujours sur les mêmes communes d'une saison à l'autre.
CREATE OR REPLACE TABLE gold.ref_communes_prioritaires AS
SELECT * FROM (VALUES
    ('13001', 'Aix-en-Provence'),
    ('13005', 'Aubagne'),
    ('13007', 'Auriol'),
    ('13019', 'Cabriès'),
    ('13028', 'La Ciotat'),
    ('13039', 'Fos-sur-Mer'),
    ('13040', 'Fuveau'),
    ('13041', 'Gardanne'),
    ('13047', 'Istres'),
    ('13051', 'Lançon-Provence'),
    ('13056', 'Martigues'),
    ('13063', 'Miramas'),
    ('13071', 'Les Pennes-Mirabeau'),
    ('13077', 'Port-de-Bouc'),
    ('13081', 'Rognac'),
    ('13103', 'Salon-de-Provence'),
    ('13106', 'Septèmes-les-Vallons'),
    ('13117', 'Vitrolles')
) AS t(code_insee, nom_commune);
