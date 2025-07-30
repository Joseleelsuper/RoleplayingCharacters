"""
Controlador para endpoints relacionados con los personajes.

Este módulo contiene los endpoints HTTP para la gestión de personajes,
incluyendo creación, edición y visualización de personajes.
"""

from pathlib import Path
from fastapi import APIRouter, Request, Body, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from src.infrastructure.template_helpers import render_template_with_translations
from typing import Dict, List, Any

router = APIRouter()

# Configurar el directorio de templates
templates_dir = Path(__file__).parent.parent.parent.parent / "templates" / "html"
templates = Jinja2Templates(directory=str(templates_dir))


@router.get("/create-character", response_class=HTMLResponse, tags=["Characters"])
async def get_create_character_page(request: Request) -> HTMLResponse:
    """
    Endpoint que devuelve la página de creación de personajes.

    Args:
        request: Objeto Request de FastAPI para detectar el idioma

    Returns:
        HTMLResponse: HTML con la página de creación de personajes traducida
    """
    return render_template_with_translations(
        templates=templates, template_name="create-character.html", request=request,
        context={"_domain": "create-character"}
    )


@router.get("/api/races", tags=["Characters API"])
async def get_races(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las razas disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de razas
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_races(game_type)


@router.get("/api/backgrounds", tags=["Characters API"])
async def get_backgrounds(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los trasfondos disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de trasfondos
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_backgrounds(game_type)


@router.get("/api/alignments", tags=["Characters API"])
async def get_alignments(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los alineamientos disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de alineamientos
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_alignments(game_type)


@router.get("/api/skills", tags=["Characters API"])
async def get_skills(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las habilidades disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de habilidades
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_skills(game_type)


@router.get("/api/languages", tags=["Characters API"])
async def get_languages(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los idiomas disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de idiomas
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_languages(game_type)


@router.get("/api/proficiencies", tags=["Characters API"])
async def get_proficiencies(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las competencias disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de competencias
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_proficiencies(game_type)


@router.get("/api/spells", tags=["Characters API"])
async def get_spells(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los hechizos disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de hechizos
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_spells(game_type)


@router.get("/api/items", tags=["Characters API"])
async def get_items(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los objetos disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de objetos
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_items(game_type)


@router.get("/api/classes", tags=["Characters API"])
async def get_classes(game_type: str = "custom") -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las clases disponibles.

    Args:
        game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

    Returns:
        List[Dict[str, Any]]: Lista de clases
    """
    from src.infrastructure.apis.rpg_service import RPGDataService
    return await RPGDataService.get_classes(game_type)


@router.post("/api/characters", tags=["Characters API"])
async def create_character(character_data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Endpoint para crear un nuevo personaje.

    Args:
        character_data: Datos del personaje a crear

    Returns:
        Dict[str, Any]: El personaje creado con su ID
    """
    try:
        # Simulamos la creación de un personaje
        # En una implementación real, usaríamos los casos de uso y repositorios
        character_id = 123  # En un caso real, este ID vendría de la base de datos
        
        return {
            "id": character_id,
            "status": "success",
            "message": "Character created successfully",
            "character": {
                **character_data,
                "id": character_id,
                "created_at": "2025-07-13T12:00:00Z",
                "updated_at": "2025-07-13T12:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
