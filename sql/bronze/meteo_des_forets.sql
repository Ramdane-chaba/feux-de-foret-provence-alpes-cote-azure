-- Lecture d'un fichier de la Météo des forêts (fiche : `,` en 2024-2025, `;` en 2026, UTF-8).
-- Les colonnes gardent leur nom d'origine : `nom_dep` (2024, 2026) et `dep_nom` (2025) coexistent.
SELECT *, '{nom}' AS _fichier_source, TIMESTAMP '{date_chargement}' AS _date_chargement
FROM read_csv('{chemin}', delim = '{separateur}', header = true, all_varchar = true)
