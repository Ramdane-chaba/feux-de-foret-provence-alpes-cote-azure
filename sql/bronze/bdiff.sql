-- Lecture d'un export BDIFF (fiche : séparateur `;`, 3 lignes d'information avant l'en-tête).
-- Fins de ligne mélangées dans l'export réel (2026-11-19) : LF pour les lignes d'information et l'en-tête,
-- CRLF pour les données. strict_mode = false laisse DuckDB lire les deux ; vérifié sur l'export PACA 2006-2025 :
-- 10 789 lignes, 24 colonnes, aucun retour chariot resté dans une valeur.
SELECT *, '{nom}' AS _fichier_source, TIMESTAMP '{date_chargement}' AS _date_chargement
FROM read_csv('{chemin}', delim = ';', skip = 3, header = true, all_varchar = true, encoding = '{encodage}',
              strict_mode = false)
