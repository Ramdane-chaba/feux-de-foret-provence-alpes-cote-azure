-- Lecture d'un export BDIFF (fiche : séparateur `;`, 3 lignes d'information avant l'en-tête).
SELECT *, '{nom}' AS _fichier_source, TIMESTAMP '{date_chargement}' AS _date_chargement
FROM read_csv('{chemin}', delim = ';', skip = 3, header = true, all_varchar = true, encoding = '{encodage}')
