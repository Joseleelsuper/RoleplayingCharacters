"""
Pruebas para los endpoints del API de juegos.

Estas pruebas validan /api/game-types y /api/game-data, con un stub
para evitar llamadas externas cuando sea necesario.
"""

from typing import Any, Dict, List

import pytest
from fastapi.testclient import TestClient

from index import app
from src.infrastructure.apis.rpg_service import RPGDataService


client = TestClient(app)


def test_get_game_types_returns_expected_ids() -> None:
    """Verifica que /api/game-types retorna los tipos esperados."""
    resp = client.get("/api/game-types")
    assert resp.status_code == 200
    data: List[Dict[str, Any]] = resp.json()
    assert isinstance(data, list)
    ids = {item["id"] for item in data}
    # Debe contener como mínimo estos ids
    for expected in {"dnd5e", "pathfinder", "wod", "custom"}:
        assert expected in ids


def test_get_game_data_custom_has_all_categories() -> None:
    """Verifica que /api/game-data con custom incluye todas las categorías clave."""
    resp = client.get("/api/game-data", params={"game_type": "custom"})
    assert resp.status_code == 200
    payload: Dict[str, List[Dict[str, Any]]] = resp.json()
    expected_keys = {
        "races",
        "classes",
        "backgrounds",
        "alignments",
        "skills",
        "languages",
        "proficiencies",
        "spells",
        "items",
    }
    assert expected_keys.issubset(payload.keys())
    # Todas las categorías deben ser listas
    for key in expected_keys:
        assert isinstance(payload[key], list)


def test_get_game_data_dnd5e_is_stubbed(monkeypatch: pytest.MonkeyPatch) -> None:
    """Stubbear RPGDataService.get_all_game_data para dnd5e y validar la respuesta."""

    async def fake_get_all(game_type: str) -> Dict[str, List[Dict[str, Any]]]:
        assert game_type == "dnd5e"
        return {
            "races": [{"id": "human", "name": "Human"}],
            "classes": [{"id": "fighter", "name": "Fighter"}],
            "backgrounds": [],
            "alignments": [],
            "skills": [],
            "languages": [],
            "proficiencies": [],
            "spells": [],
            "items": [],
        }

    monkeypatch.setattr(RPGDataService, "get_all_game_data", fake_get_all)

    resp = client.get("/api/game-data", params={"game_type": "dnd5e"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["races"][0]["id"] == "human"
    assert data["classes"][0]["name"] == "Fighter"
