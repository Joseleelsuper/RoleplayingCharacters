"""
Pruebas para los endpoints de generación de PDF de personajes.

Se mockea el servicio de PDF para evitar dependencias externas y archivos.
"""

from __future__ import annotations

from typing import Any, Dict

from fastapi.testclient import TestClient
from pytest import MonkeyPatch


def _make_min_character(client: TestClient) -> str:
    payload = {
        "name": "Test Char",
        "player_name": "Tester",
        "level": 1,
        "experience": 0,
        "is_anonymous": True,
        "attributes": {
            "strength": 10,
            "dexterity": 10,
            "constitution": 10,
            "intelligence": 10,
            "wisdom": 10,
            "charisma": 10,
        },
        "skills": [],
        "languages": [],
        "proficiencies": [],
        "items": [],
        "spells": [],
    }
    resp = client.post("/api/characters", json=payload)
    assert resp.status_code == 200
    return resp.json()["id"]


def test_pdf_download_and_store(client: TestClient, monkeypatch: MonkeyPatch) -> None:
    """Debe permitir descargar y guardar el PDF usando un servicio mockeado."""

    class _FakePDF:
        def __init__(self, *_: Any, **__: Any) -> None:
            pass

        def generate_pdf(self, character: Dict[str, Any]) -> bytes:  # noqa: ARG002
            return b"%PDF-1.4\n%mock\n%%EOF"

        def save_pdf(self, output_bytes: bytes, rel_output_path):  # noqa: ARG002, ANN001
            # Devolver una ruta simulada
            return rel_output_path

    monkeypatch.setattr(
        "src.application.services.pdf_service.CharacterPDFService",
        _FakePDF,
        raising=False,
    )

    char_id = _make_min_character(client)

    # Descarga directa
    r1 = client.get(f"/api/characters/{char_id}/pdf")
    assert r1.status_code == 200
    assert r1.headers.get("content-type", "").startswith("application/pdf")

    # Almacenamiento y URL
    r2 = client.post(f"/api/characters/{char_id}/pdf/store")
    assert r2.status_code == 200
    data = r2.json()
    assert data.get("success") is True
    assert "cdn_url" in data
