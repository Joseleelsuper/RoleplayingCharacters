"""
Endpoints de IA para asistencia en creación de personajes.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.infrastructure.config import settings
from src.infrastructure.services.ai_service import AIService, AIServiceError
from src.infrastructure.apis.rpg_service import RPGDataService


router = APIRouter()


class AdviceRequest(BaseModel):
    game_type: str = Field(default="custom")
    prompt: str


class AutoBuildRequest(BaseModel):
    game_type: str = Field(default="custom")
    preferences: Dict[str, Any] = Field(default_factory=dict)


async def _options_snapshot(game_type: str) -> Dict[str, Any]:
    data = await RPGDataService.get_all_game_data(game_type)
    # Reducir snapshot a {name, id} para cada lista para evitar payloads enormes
    def slim(lst):
        out = []
        for it in lst or []:
            out.append({
                "id": it.get("id") if isinstance(it, dict) else getattr(it, "id", None),
                "name": it.get("name") if isinstance(it, dict) else getattr(it, "name", None),
                "index": it.get("index") if isinstance(it, dict) else getattr(it, "index", None),
                "level": it.get("level") if isinstance(it, dict) else getattr(it, "level", None),
            })
        return out

    return {k: slim(v) for k, v in data.items()}


@router.post("/api/ai/advice", tags=["AI"], summary="Consejo de IA en texto")
async def ai_advice(body: AdviceRequest):
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="IA no configurada (GROQ_API_KEY ausente)")
    try:
        ai = AIService()
        snapshot = await _options_snapshot(body.game_type)
        res = await ai.advise(body.game_type, body.prompt, snapshot)
        return res
    except AIServiceError as e:
        raise HTTPException(status_code=502, detail=f"Proveedor IA: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo inesperado: {e}")


@router.post("/api/ai/auto-build", tags=["AI"], summary="Plan JSON de personaje por IA")
async def ai_auto_build(body: AutoBuildRequest):
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="IA no configurada (GROQ_API_KEY ausente)")
    try:
        ai = AIService()
        prefs = {**body.preferences, "game_type": body.game_type}
        snapshot = await _options_snapshot(body.game_type)
        plan = await ai.auto_build(prefs, snapshot)
        # Validación mínima
        if not isinstance(plan, dict):
            return {"error": "Formato de respuesta no válido", "raw": plan}
        plan.setdefault("game_type", body.game_type)
        return plan
    except AIServiceError as e:
        raise HTTPException(status_code=502, detail=f"Proveedor IA: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo inesperado: {e}")
