-- Lecture d'un fichier de données climatologiques quotidiennes (séparateur `;`, UTF-8).
SELECT *, '{nom}' AS _fichier_source, TIMESTAMP '{date_chargement}' AS _date_chargement
FROM read_csv('{chemin}', delim = ';', header = true, all_varchar = true)
