-- Couche bronze : les fichiers tels qu'ils arrivent. Aucun typage, aucun renommage, aucun filtre.
CREATE SCHEMA IF NOT EXISTS bronze;
CREATE SCHEMA IF NOT EXISTS silver;
CREATE SCHEMA IF NOT EXISTS gold;

-- Journal des chargements : une ligne par fichier et par exécution (run_id).
-- C'est la seule table qui n'est pas recréée : elle garde l'historique des exécutions.
CREATE TABLE IF NOT EXISTS bronze.journal_chargement (
    run_id          VARCHAR   NOT NULL,
    fichier         VARCHAR   NOT NULL,
    empreinte_sha256 VARCHAR,
    taille_octets   BIGINT,
    nb_lignes       BIGINT,
    date_chargement TIMESTAMP NOT NULL,
    statut          VARCHAR   NOT NULL  -- charge | absent
);
