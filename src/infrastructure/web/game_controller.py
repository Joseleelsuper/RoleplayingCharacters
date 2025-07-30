"""
Endpoint para obtener todos los datos de un juego específico.

Este módulo proporciona un endpoint para obtener todos los datos
de un juego específico en una sola petición.
"""

from fastapi import APIRouter
from typing import Dict, List, Any
from src.infrastructure.apis.rpg_service import RPGDataService

router = APIRouter()

@router.get("/api/game-data", tags=["Games API"])
async def get_game_data(game_type: str = "custom") -> Dict[str, List[Dict[str, Any]]]:
    """
    Endpoint para obtener todos los datos de un juego específico.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        Dict[str, List[Dict[str, Any]]]: Diccionario con todos los datos por categoría
    """
    return await RPGDataService.get_all_game_data(game_type)

@router.get("/api/game-types", tags=["Games API"])
async def get_game_types() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener los tipos de juego disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de tipos de juego
    """
    return [
        {
            "id": "dnd5e",
            "name": "Dungeons & Dragons 5e",
            "description": "Sistema de rol de fantasía medieval, 5ª edición"
        },
        {
            "id": "pathfinder",
            "name": "Pathfinder 2e",
            "description": "Sistema de rol de fantasía medieval, 2ª edición"
        },
        {
            "id": "wod",
            "name": "World of Darkness",
            "description": "Sistema de rol de horror gótico"
        },
        {
            "id": "custom",
            "name": "Custom",
            "description": "Sistema personalizado con opciones avanzadas"
        },
        {
            "id": "custom",
            "name": "Personalizado",
            "description": "Sistema de rol personalizado"
        }
    ]
