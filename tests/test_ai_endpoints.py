"""
Pruebas para los endpoints de IA.

Se mockea el servicio de IA y la API key para evitar llamadas externas.
"""

from __future__ import annotations

from typing import Any, Dict

from fastapi.testclient import TestClient
from pytest import MonkeyPatch


def test_ai_advice_unconfigured(client: TestClient, monkeypatch: MonkeyPatch) -> None:
    """Debe devolver 503 si no hay GROQ_API_KEY configurada."""
    from src.infrastructure.config import settings

    monkeypatch.setattr(settings, "groq_api_key", None, raising=False)

    resp = client.post(
        "/api/ai/advice",
        json={"prompt": "Consejo rápido", "game_type": "custom"},
    )
    assert resp.status_code == 503
    data = resp.json()
    assert "IA no configurada" in data.get("detail", "")


def test_ai_advice_success(client: TestClient, monkeypatch: MonkeyPatch) -> None:
    """Consejo de IA exitoso con servicio mockeado."""
    from src.infrastructure.config import settings

    class _FakeAI:
        def __init__(self, *_: Any, **__: Any) -> None:
            pass

        async def advise(
            self,
            game_type: str,
            prompt: str,
            snapshot: Dict[str, Any],
            *,
            history: list[dict[str, str]] | None = None,
            current_state: Dict[str, Any] | None = None,
        ) -> Dict[str, Any]:
            return {"message": f"Consejo para {game_type}: OK"}

    # Ensure controller sees an API key and uses our fake service
    monkeypatch.setattr(settings, "groq_api_key", "test-key", raising=False)
    # Patch the symbol used by the controller module, not the source module
    monkeypatch.setattr(
        "src.infrastructure.web.ai_controller.AIService", _FakeAI, raising=False
    )
    # Stub RPGDataService snapshot to avoid external calls
    async def _fake_snapshot(_: str) -> dict[str, Any]:
        return {
            "classes": [{"id": "fighter", "name": "Fighter"}],
            "races": [{"id": "human", "name": "Human"}],
            "backgrounds": [{"id": "soldier", "name": "Soldier"}],
        }
    monkeypatch.setattr(
        "src.infrastructure.web.ai_controller.RPGDataService.get_all_game_data",
        lambda game_type: _fake_snapshot(game_type),
        raising=False,
    )

    resp = client.post(
        "/api/ai/advice",
        json={
            "prompt": "¿Qué clase recomiendas?",
            "game_type": "custom",
            "history": [],
            "current_state": {},
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("message", "").startswith("Consejo para custom:")


def test_ai_auto_build_success(client: TestClient, monkeypatch: MonkeyPatch) -> None:
    """Autogeneración JSON de personaje con servicio mockeado."""
    from src.infrastructure.config import settings

    class _FakeAI:
        def __init__(self, *_: Any, **__: Any) -> None:
            pass

        async def auto_build(
            self,
            preferences: Dict[str, Any],
            snapshot: Dict[str, Any],
            *,
            history: list[dict[str, str]] | None = None,
            current_state: Dict[str, Any] | None = None,
        ) -> Dict[str, Any]:
            return {
                "name": "Aeryn",
                "player_name": "Tester",
                "game_type": preferences.get("game_type", "custom"),
                "level": 1,
                "race": "Human",
                "class": "Fighter",
                "background": "Soldier",
                "alignment": "Neutral",
                "attributes": {
                    "strength": 15,
                    "dexterity": 12,
                    "constitution": 14,
                    "intelligence": 10,
                    "wisdom": 10,
                    "charisma": 8,
                },
                "skills": ["Athletics"],
                "languages": ["Common"],
                "proficiencies": ["All armor"],
                "items": ["Longsword"],
                "spells": [],
                "rationale": "Build básico de guerrero",
            }

    # Ensure controller sees an API key and uses our fake service
    monkeypatch.setattr(settings, "groq_api_key", "test-key", raising=False)
    # Patch the symbol used by the controller module, not the source module
    monkeypatch.setattr(
        "src.infrastructure.web.ai_controller.AIService", _FakeAI, raising=False
    )
    # Stub RPGDataService snapshot to avoid external calls
    async def _fake_snapshot(_: str) -> dict[str, Any]:
        return {
            "classes": [{"id": "fighter", "name": "Fighter"}],
            "races": [{"id": "human", "name": "Human"}],
            "backgrounds": [{"id": "soldier", "name": "Soldier"}],
        }
    monkeypatch.setattr(
        "src.infrastructure.web.ai_controller.RPGDataService.get_all_game_data",
        lambda game_type: _fake_snapshot(game_type),
        raising=False,
    )

    resp = client.post(
        "/api/ai/auto-build",
        json={
            "game_type": "custom",
            "preferences": {"style": "martial"},
            "history": [],
            "current_state": {},
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    expected_keys = {
        "name",
        "player_name",
        "game_type",
        "level",
        "race",
        "class",
        "background",
        "alignment",
        "attributes",
        "skills",
        "languages",
        "proficiencies",
        "items",
        "spells",
        "rationale",
    }
    assert expected_keys.issubset(set(data.keys()))
