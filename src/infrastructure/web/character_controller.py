"""
Controlador para endpoints relacionados con los personajes.

Este módulo contiene los endpoints HTTP para la gestión de personajes,
incluyendo creación, edición y visualización de personajes.
"""

from pathlib import Path
from fastapi import APIRouter, Request, Body, HTTPException, Depends, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from src.infrastructure.template_helpers import render_template_with_translations
from src.infrastructure.db.database import get_db
from src.application.services.character_service import CharacterService
from src.domain.schemas.character import (
    CharacterCreate,
    CharacterResponse,
    CharacterListResponse,
    CharacterSearchRequest
)
from typing import Dict, List, Any, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

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


@router.get("/characters/{character_id}", response_class=HTMLResponse, tags=["Characters"])
async def get_character_detail_page(
    character_id: int,
    request: Request,
    db: Session = Depends(get_db)
) -> HTMLResponse:
    """
    Endpoint que devuelve la página de detalles de un personaje.

    Args:
        character_id: ID del personaje
        request: Objeto Request de FastAPI
        db: Sesión de base de datos

    Returns:
        HTMLResponse: HTML con la página de detalles del personaje
    """
    try:
        service = CharacterService(db)
        character = service.get_character_by_id(character_id)
        
        if not character:
            raise HTTPException(status_code=404, detail="Personaje no encontrado")
        
        return templates.TemplateResponse(
            "my-character.html",
            {"request": request, "character": character}
        )
        
    except Exception as e:
        logger.error(f"Error al obtener detalles del personaje {character_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


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


@router.post("/api/characters", response_model=CharacterResponse, tags=["Characters API"])
async def create_character(
    character_data: CharacterCreate,
    user_id: Optional[str] = Query(None, description="ID del usuario (opcional para personajes anónimos)"),
    db: Session = Depends(get_db)
) -> CharacterResponse:
    """
    Endpoint para crear un nuevo personaje.
    
    Permite crear personajes tanto para usuarios registrados como anónimos.
    Si no se proporciona user_id, el personaje se marca como anónimo.

    Args:
        character_data: Datos del personaje a crear
        user_id: ID del usuario (opcional)
        db: Sesión de base de datos

    Returns:
        CharacterResponse: El personaje creado
    """
    try:
        service = CharacterService(db)
        user_uuid = UUID(user_id) if user_id else None
        
        character = service.create_character(character_data, user_uuid)
        logger.info(f"Personaje creado exitosamente: {character.id}")
        
        return character
        
    except ValueError as e:
        logger.error(f"Error de validación al crear personaje: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error interno al crear personaje: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/characters/{character_id}", response_model=CharacterResponse, tags=["Characters API"])
async def get_character(
    character_id: UUID,
    user_id: Optional[str] = Query(None, description="ID del usuario para verificar permisos"),
    db: Session = Depends(get_db)
) -> CharacterResponse:
    """
    Obtiene un personaje específico por su ID.
    
    Args:
        character_id: ID del personaje
        user_id: ID del usuario (opcional)
        db: Sesión de base de datos
        
    Returns:
        CharacterResponse: Datos del personaje
    """
    try:
        service = CharacterService(db)
        user_uuid = UUID(user_id) if user_id else None
        
        # Verificar permisos de acceso
        if not service.can_user_access_character(character_id, user_uuid):
            raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este personaje")
        
        character = service.get_character(character_id)
        if not character:
            raise HTTPException(status_code=404, detail="Personaje no encontrado")
            
        return character
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener personaje {character_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/users/{user_id}/characters", response_model=CharacterListResponse, tags=["Characters API"])
async def get_user_characters(
    user_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    db: Session = Depends(get_db)
) -> CharacterListResponse:
    """
    Obtiene los personajes de un usuario específico.
    
    Args:
        user_id: ID del usuario
        page: Número de página
        page_size: Tamaño de página
        db: Sesión de base de datos
        
    Returns:
        CharacterListResponse: Lista paginada de personajes del usuario
    """
    try:
        service = CharacterService(db)
        return service.get_user_characters(user_id, page, page_size)
        
    except Exception as e:
        logger.error(f"Error al obtener personajes del usuario {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/api/characters/search", response_model=CharacterListResponse, tags=["Characters API"])
async def search_characters(
    search_request: CharacterSearchRequest,
    db: Session = Depends(get_db)
) -> CharacterListResponse:
    """
    Busca personajes según los criterios especificados.
    
    Args:
        search_request: Criterios de búsqueda
        db: Sesión de base de datos
        
    Returns:
        CharacterListResponse: Lista paginada de personajes encontrados
    """
    try:
        service = CharacterService(db)
        return service.search_characters(search_request)
        
    except Exception as e:
        logger.error(f"Error en búsqueda de personajes: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/api/characters", response_model=CharacterListResponse, tags=["Characters API"])
async def get_public_characters(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    db: Session = Depends(get_db)
) -> CharacterListResponse:
    """
    Obtiene todos los personajes públicos para el buscador general.
    
    Args:
        page: Número de página
        page_size: Tamaño de página
        db: Sesión de base de datos
        
    Returns:
        CharacterListResponse: Lista paginada de personajes públicos
    """
    try:
        service = CharacterService(db)
        return service.get_public_characters(page, page_size)
        
    except Exception as e:
        logger.error(f"Error al obtener personajes públicos: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/api/characters/{character_id}", tags=["Characters API"])
async def delete_character(
    character_id: UUID,
    user_id: Optional[str] = Query(None, description="ID del usuario (opcional para personajes anónimos)"),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Elimina un personaje.
    
    Args:
        character_id: ID del personaje a eliminar
        user_id: ID del usuario (opcional)
        db: Sesión de base de datos
        
    Returns:
        Dict[str, str]: Mensaje de confirmación
    """
    try:
        service = CharacterService(db)
        user_uuid = UUID(user_id) if user_id else None
        
        if service.delete_character(character_id, user_uuid):
            return {"message": "Personaje eliminado exitosamente"}
        else:
            raise HTTPException(status_code=404, detail="Personaje no encontrado o sin permisos")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar personaje {character_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
