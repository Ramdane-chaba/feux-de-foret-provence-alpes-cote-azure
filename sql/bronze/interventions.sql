-- Lecture d'un fichier annuel des interventions SDIS (séparateur `;`, Latin-1).
-- 16 à 71 colonnes selon l'année : l'union par nom garde chaque colonne telle qu'elle est nommée.
SELECT *, '{nom}' AS _fichier_source, TIMESTAMP '{date_chargement}' AS _date_chargement
FROM read_csv('{chemin}', delim = ';', header = true, all_varchar = true, encoding = 'latin-1')
