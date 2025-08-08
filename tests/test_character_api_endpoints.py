"""
Pruebas para los endpoints por categoría del API de personajes.

Se usan game_type=custom para evitar dependencias externas.
"""

from typing import Any

from fastapi.testclient import TestClient

from index import app

client = TestClient(app)


def _assert_list_of_dicts(endpoint: str) -> None:
    resp = client.get(endpoint, params={"game_type": "custom"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Elementos básicos con name
    if data:
        assert isinstance(data[0], dict)
        assert "name" in data[0]


def test_get_races() -> None:
    _assert_list_of_dicts("/api/races")


def test_get_classes() -> None:
    _assert_list_of_dicts("/api/classes")


def test_get_backgrounds() -> None:
    _assert_list_of_dicts("/api/backgrounds")


def test_get_alignments() -> None:
    _assert_list_of_dicts("/api/alignments")


def test_get_skills() -> None:
    _assert_list_of_dicts("/api/skills")


def test_get_languages() -> None:
    _assert_list_of_dicts("/api/languages")


def test_get_proficiencies() -> None:
    _assert_list_of_dicts("/api/proficiencies")


def test_get_spells() -> None:
    _assert_list_of_dicts("/api/spells")


def test_get_items() -> None:
    _assert_list_of_dicts("/api/items")
