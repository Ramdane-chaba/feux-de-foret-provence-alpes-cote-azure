-- Fonctions communes à la couche silver.

-- Code département sur 2 caractères : 1 -> 01, 4 -> 04, 2a -> 2A ; 971 reste tel quel.
CREATE OR REPLACE MACRO silver.code_dep(x) AS
    CASE
        WHEN x IS NULL OR trim(x) = '' THEN NULL
        WHEN length(trim(x)) <= 2 THEN upper(lpad(trim(x), 2, '0'))
        ELSE upper(trim(x))
    END;

-- Nombre écrit en texte avec un séparateur de milliers : espace (2008-2023) ou `?` (2024, octet 0x3F dans le fichier).
CREATE OR REPLACE MACRO silver.entier_texte(x) AS
    try_cast(regexp_replace(trim(x), '[ ?]', '', 'g') AS BIGINT);

-- Valeur climatologique : NULL si son code qualité vaut 2 (douteuse, en cours de vérification).
CREATE OR REPLACE MACRO silver.mesure(valeur, code_qualite) AS
    CASE WHEN code_qualite = '2' THEN NULL ELSE try_cast(valeur AS DOUBLE) END;
