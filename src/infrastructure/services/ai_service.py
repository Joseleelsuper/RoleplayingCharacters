"""
Servicio para integrar llamadas a modelos de IA (Groq) para asistir en la creación de personajes.

Se usa la API compatible con OpenAI de Groq vía HTTPX sin SDK externo.
"""

from __future__ import annotations

import json
from typing import Any, Optional

import httpx

from src.infrastructure.config import settings


class AIServiceError(Exception):
    pass


class AIService:
    def __init__(self, api_key: Optional[str] | None = None, base_url: Optional[str] | None = None, model: Optional[str] | None = None):
        self.api_key = api_key or settings.groq_api_key
        self.base_url = (base_url or settings.groq_base_url).rstrip("/")
        self.model = model or settings.groq_model
        if not self.api_key:
            raise AIServiceError("GROQ_API_KEY no configurada")

    async def _post_chat(self, messages: list[dict[str, str]], response_format: Optional[dict[str, Any]] = None, temperature: float = 0.3, max_tokens: int = 1500) -> dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            # OpenAI-compatible structured output
            payload["response_format"] = response_format

        timeout = httpx.Timeout(15.0, read=30.0)
        async with httpx.AsyncClient(timeout=timeout, base_url=self.base_url) as client:
            resp = await client.post("/chat/completions", headers=headers, json=payload)
            if resp.status_code >= 400:
                raise AIServiceError(f"Error IA {resp.status_code}: {resp.text[:300]}")
            return resp.json()

    @staticmethod
    def character_json_schema() -> dict[str, Any]:
        """JSON Schema mínimo que el modelo debe seguir para devolver un personaje aplicable en el frontend."""
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "character_plan",
                "schema": {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "name": {"type": "string"},
                        "player_name": {"type": "string"},
                        "game_type": {"type": "string", "enum": ["dnd5e", "pathfinder", "wod", "custom"]},
                        "level": {"type": "integer", "minimum": 1, "maximum": 20},
                        "race": {"type": "string"},
                        "class": {"type": "string"},
                        "background": {"type": "string"},
                        "alignment": {"type": "string"},
                        "attributes": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "strength": {"type": "integer"},
                                "dexterity": {"type": "integer"},
                                "constitution": {"type": "integer"},
                                "intelligence": {"type": "integer"},
                                "wisdom": {"type": "integer"},
                                "charisma": {"type": "integer"}
                            }
                        },
                        "skills": {"type": "array", "items": {"type": "string"}},
                        "languages": {"type": "array", "items": {"type": "string"}},
                        "proficiencies": {"type": "array", "items": {"type": "string"}},
                        "items": {"type": "array", "items": {"type": "string"}},
                        "spells": {"type": "array", "items": {"type": "string"}},
                        "rationale": {"type": "string"}
                    }
                }
            }
        }

    @staticmethod
    def build_system_prompt() -> str:
        return (
            "Eres un asistente experto en creación de personajes de rol. "
            "Por defecto responde SOLO con texto plano, sin tablas ni listas extensas, y sin bloques de código. "
            "Sé directo y conciso: un único párrafo es preferible, con la información suficiente para entender el concepto. "
            "Cuando explícitamente se te pida salida estructurada, sigue estrictamente el esquema JSON indicado y devuelve exclusivamente JSON. "
            "Usa únicamente opciones válidas del juego indicado. "
            "Detecta la intención del usuario: si pide CAMBIAR datos del personaje (p. ej., seleccionar raza/clase/skills, ajustar atributos, añadir conjuros), deja claro que es una solicitud de cambio; "
            "si es una CONSULTA, ofrece consejo. En el flujo de consejo no generes JSON ni órdenes de UI; describe brevemente qué harías y por qué."
        )

    async def advise(
        self,
        game_type: str,
        user_prompt: str,
        options_snapshot: dict[str, Any],
        *,
        history: Optional[list[dict[str, str]]] = None,
        current_state: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        messages: list[dict[str, str]] = [
            {"role": "system", "content": self.build_system_prompt()},
        ]
        if history:
            for m in history:
                role = m.get("role") or "user"
                content = str(m.get("content", ""))
                if role in {"user", "assistant", "system"} and content:
                    messages.append({"role": role, "content": content})
        state_text = json.dumps(current_state)[:4000] if current_state else "{}"
        messages.append(
            {
                "role": "user",
                "content": (
                    "Juego: {game}.\n"
                    "Estado actual (si existe): {state}.\n"
                    "Opciones disponibles (resumen): {opts}.\n"
                    "Petición del usuario: {prompt}.\n"
                    "Primero identifica la intención (CONSULTA vs CAMBIOS). Si detectas CAMBIOS, explica en una frase qué cambiarías y por qué, y aclara que para aplicar cambios debe usarse la opción de autocompletar con IA. "
                    "Si es CONSULTA, da un consejo breve. No generes tablas, ni JSON, ni pasos detallados; un solo párrafo."
                ).format(
                    game=game_type,
                    state=state_text,
                    opts=json.dumps(options_snapshot)[:6000],
                    prompt=user_prompt,
                ),
            }
        )
        data = await self._post_chat(messages, response_format=None, temperature=0.4, max_tokens=900)
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"message": content}

    async def auto_build(
        self,
        preferences: dict[str, Any],
        options_snapshot: dict[str, Any],
        *,
        history: Optional[list[dict[str, str]]] = None,
        current_state: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        game_type = preferences.get("game_type", "custom")
        messages: list[dict[str, str]] = [
            {"role": "system", "content": self.build_system_prompt()},
        ]
        if history:
            for m in history:
                role = m.get("role") or "user"
                content = str(m.get("content", ""))
                if role in {"user", "assistant", "system"} and content:
                    messages.append({"role": role, "content": content})
        state_text = json.dumps(current_state)[:4000] if current_state else "{}"
        messages.append(
            {
                "role": "user",
                "content": (
                    "Crea un personaje completo para el juego '{game}'.\n"
                    "Ten en cuenta estas preferencias (pueden estar vacías): {prefs}.\n"
                    "Estado actual aportado por el usuario (si existe): {state}.\n"
                    "Estas son las opciones válidas actuales (ids o nombres): {opts}.\n"
                    "Devuelve exclusivamente JSON que siga el esquema."
                ).format(
                    game=game_type,
                    prefs=json.dumps(preferences),
                    state=state_text,
                    opts=json.dumps(options_snapshot)[:6000],
                ),
            }
        )
        # Primer intento: JSON Schema estructurado
        try:
            data = await self._post_chat(messages, response_format=self.character_json_schema(), temperature=0.2, max_tokens=1200)
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            return json.loads(content)
        except Exception:
            # Segundo intento: json_object (algunos proveedores no soportan json_schema)
            try:
                messages_fallback = [
                    {"role": "system", "content": self.build_system_prompt()},
                    {
                        "role": "user",
                        "content": (
                            "Crea un personaje completo para el juego '{game}'.\n"
                            "Preferencias: {prefs}.\n"
                            "Opciones válidas: {opts}.\n"
                            "Devuelve SOLO un objeto JSON válido con campos: "
                            "name, player_name, game_type, level, race, class, background, alignment, "
                            "attributes{{strength,dexterity,constitution,intelligence,wisdom,charisma}}, "
                            "skills[], languages[], proficiencies[], items[], spells[], rationale"
                        ).format(game=game_type, prefs=json.dumps(preferences), opts=json.dumps(options_snapshot)[:6000]),
                    },
                ]
                data2 = await self._post_chat(messages_fallback, response_format={"type": "json_object"}, temperature=0.2, max_tokens=1200)
                content2 = data2.get("choices", [{}])[0].get("message", {}).get("content", "{}")
                return json.loads(content2)
            except Exception as e2:
                return {"error": f"No se pudo generar JSON estructurado: {e2}"}
