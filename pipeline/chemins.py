from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
DATA_RAW = RACINE / "data" / "raw"
DATA_TMP = RACINE / "data" / "tmp"  # fichiers extraits des ZIP (jamais dans data/raw/)
BASE = RACINE / "data" / "sdis13.duckdb"
SQL = RACINE / "sql"
EXPORTS = RACINE / "data" / "exports"  # fichiers Parquet des tables gold, lus par Power BI
