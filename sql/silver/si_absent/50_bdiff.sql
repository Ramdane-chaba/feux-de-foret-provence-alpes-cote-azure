-- Aucun export BDIFF : tables de feux vides, au même schéma que sql/silver/50_bdiff.sql.
CREATE OR REPLACE TABLE silver.fait_feu (
    annee                       INTEGER,
    numero                      VARCHAR,
    code_dep                    VARCHAR,
    code_insee                  VARCHAR,
    alerte                      TIMESTAMP,
    jour_alerte                 DATE,
    surface_parcourue_ha        DOUBLE,
    surface_foret_ha            DOUBLE,
    surface_maquis_garrigues_ha DOUBLE,
    precision_surfaces          VARCHAR,
    nature                      VARCHAR,
    est_marseille               BOOLEAN,
    _fichier_source             VARCHAR
);

CREATE OR REPLACE TABLE silver.rejet_bdiff (
    _fichier_source  VARCHAR,
    _date_chargement TIMESTAMP,
    motif            VARCHAR
);

CREATE OR REPLACE TABLE silver.dim_commune (
    commune_sk      VARCHAR,
    code_insee      VARCHAR,
    nom             VARCHAR,
    code_dep        VARCHAR,
    valide_du       DATE,
    valide_au       DATE,
    est_courant     BOOLEAN,
    origine_version VARCHAR
);
