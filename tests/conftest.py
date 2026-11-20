"""Construit une base de test complète une fois par session, à partir de data/raw/."""

import duckdb
import pytest

from pipeline.chemins import DATA_RAW
from pipeline.construire import construire


@pytest.fixture(scope="session")
def base(tmp_path_factory):
    """(chemin de la base, run_id de l'exécution)."""
    if not (DATA_RAW / "meteo-des-forets").exists():
        pytest.skip("data/raw/ vide : lancer `uv run python -m pipeline.telecharger`")
    chemin = tmp_path_factory.mktemp("base") / "test.duckdb"
    return chemin, construire(chemin, telecharger_sources=False, rapport=None)


@pytest.fixture(scope="session")
def run_id(base):
    return base[1]


@pytest.fixture(scope="session")
def con(base):
    con = duckdb.connect(str(base[0]), read_only=True)
    yield con
    con.close()


def scalaire(con, requete: str, parametres=None):
    return con.execute(requete, parametres or []).fetchone()[0]
