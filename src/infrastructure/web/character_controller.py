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
async def get_races() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las razas disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de razas
    """
    # Simulamos datos de razas para la interfaz
    return [
        {"id": 1, "name": "Human", "description": "Versatile and adaptable"},
        {"id": 2, "name": "Elf", "description": "Graceful and long-lived"},
        {"id": 3, "name": "Dwarf", "description": "Strong and sturdy"},
        {"id": 4, "name": "Halfling", "description": "Small and nimble"},
        {"id": 5, "name": "Gnome", "description": "Curious and inventive"}
    ]


@router.get("/api/backgrounds", tags=["Characters API"])
async def get_backgrounds() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los trasfondos disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de trasfondos
    """
    # Simulamos datos de trasfondos para la interfaz
    return [
        {"id": 1, "name": "Noble", "description": "Born to wealth and privilege"},
        {"id": 2, "name": "Acolyte", "description": "Served in a temple"},
        {"id": 3, "name": "Criminal", "description": "Has a criminal past"},
        {"id": 4, "name": "Soldier", "description": "Trained in military"},
        {"id": 5, "name": "Sage", "description": "Scholar and researcher"}
    ]


@router.get("/api/alignments", tags=["Characters API"])
async def get_alignments() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los alineamientos disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de alineamientos
    """
    # Simulamos datos de alineamientos para la interfaz
    return [
        {"id": 1, "name": "Lawful Good", "description": "Honor and compassion"},
        {"id": 2, "name": "Neutral Good", "description": "Do the best good"},
        {"id": 3, "name": "Chaotic Good", "description": "Freedom and kindness"},
        {"id": 4, "name": "Lawful Neutral", "description": "Order above all"},
        {"id": 5, "name": "True Neutral", "description": "Balance in all things"},
        {"id": 6, "name": "Chaotic Neutral", "description": "Freedom above all"},
        {"id": 7, "name": "Lawful Evil", "description": "Methodical conquest"},
        {"id": 8, "name": "Neutral Evil", "description": "Selfish interest"},
        {"id": 9, "name": "Chaotic Evil", "description": "Destruction and chaos"}
    ]


@router.get("/api/skills", tags=["Characters API"])
async def get_skills() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las habilidades disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de habilidades
    """
    # Simulamos datos de habilidades para la interfaz
    return [
        {"id": 1, "name": "Acrobatics", "attribute": "dexterity"},
        {"id": 2, "name": "Animal Handling", "attribute": "wisdom"},
        {"id": 3, "name": "Arcana", "attribute": "intelligence"},
        {"id": 4, "name": "Athletics", "attribute": "strength"},
        {"id": 5, "name": "Deception", "attribute": "charisma"},
        {"id": 6, "name": "History", "attribute": "intelligence"},
        {"id": 7, "name": "Insight", "attribute": "wisdom"},
        {"id": 8, "name": "Intimidation", "attribute": "charisma"},
        {"id": 9, "name": "Investigation", "attribute": "intelligence"},
        {"id": 10, "name": "Medicine", "attribute": "wisdom"},
        {"id": 11, "name": "Nature", "attribute": "intelligence"},
        {"id": 12, "name": "Perception", "attribute": "wisdom"},
        {"id": 13, "name": "Performance", "attribute": "charisma"},
        {"id": 14, "name": "Persuasion", "attribute": "charisma"},
        {"id": 15, "name": "Religion", "attribute": "intelligence"},
        {"id": 16, "name": "Sleight of Hand", "attribute": "dexterity"},
        {"id": 17, "name": "Stealth", "attribute": "dexterity"},
        {"id": 18, "name": "Survival", "attribute": "wisdom"}
    ]


@router.get("/api/languages", tags=["Characters API"])
async def get_languages() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los idiomas disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de idiomas
    """
    # Simulamos datos de idiomas para la interfaz
    return [
        {"id": 1, "name": "Common", "description": "The common tongue of humans"},
        {"id": 2, "name": "Elvish", "description": "The language of elves"},
        {"id": 3, "name": "Dwarvish", "description": "The language of dwarves"},
        {"id": 4, "name": "Giant", "description": "The language of giants"},
        {"id": 5, "name": "Gnomish", "description": "The language of gnomes"},
        {"id": 6, "name": "Goblin", "description": "The language of goblins"},
        {"id": 7, "name": "Halfling", "description": "The language of halflings"},
        {"id": 8, "name": "Orc", "description": "The language of orcs"},
        {"id": 9, "name": "Abyssal", "description": "The language of demons"},
        {"id": 10, "name": "Celestial", "description": "The language of celestials"}
    ]


@router.get("/api/proficiencies", tags=["Characters API"])
async def get_proficiencies() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todas las competencias disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de competencias
    """
    # Simulamos datos de competencias para la interfaz
    return [
        {"id": 1, "name": "Light Armor", "type": "armor"},
        {"id": 2, "name": "Medium Armor", "type": "armor"},
        {"id": 3, "name": "Heavy Armor", "type": "armor"},
        {"id": 4, "name": "Shields", "type": "armor"},
        {"id": 5, "name": "Simple Weapons", "type": "weapon"},
        {"id": 6, "name": "Martial Weapons", "type": "weapon"},
        {"id": 7, "name": "Alchemist's Supplies", "type": "tool"},
        {"id": 8, "name": "Brewer's Supplies", "type": "tool"},
        {"id": 9, "name": "Carpenter's Tools", "type": "tool"},
        {"id": 10, "name": "Cook's Utensils", "type": "tool"}
    ]


@router.get("/api/spells", tags=["Characters API"])
async def get_spells() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los hechizos disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de hechizos
    """
    # Simulamos datos de hechizos para la interfaz
    return [
        {"id": 1, "name": "Acid Splash", "level": 0, "school": "Conjuration"},
        {"id": 2, "name": "Chill Touch", "level": 0, "school": "Necromancy"},
        {"id": 3, "name": "Magic Missile", "level": 1, "school": "Evocation"},
        {"id": 4, "name": "Burning Hands", "level": 1, "school": "Evocation"},
        {"id": 5, "name": "Cure Wounds", "level": 1, "school": "Evocation"},
        {"id": 6, "name": "Detect Magic", "level": 1, "school": "Divination"},
        {"id": 7, "name": "Fireball", "level": 3, "school": "Evocation"},
        {"id": 8, "name": "Fly", "level": 3, "school": "Transmutation"}
    ]


@router.get("/api/items", tags=["Characters API"])
async def get_items() -> List[Dict[str, Any]]:
    """
    Endpoint para obtener todos los objetos disponibles.

    Returns:
        List[Dict[str, Any]]: Lista de objetos
    """
    # Simulamos datos de objetos para la interfaz
    return [
        {"id": 1, "name": "Potion of Healing", "type": "consumable", "rarity": "common"},
        {"id": 2, "name": "Longsword", "type": "weapon", "rarity": "common"},
        {"id": 3, "name": "Shield", "type": "armor", "rarity": "common"},
        {"id": 4, "name": "Rope", "type": "gear", "rarity": "common"},
        {"id": 5, "name": "Lantern", "type": "gear", "rarity": "common"},
        {"id": 6, "name": "Spellbook", "type": "gear", "rarity": "uncommon"},
        {"id": 7, "name": "Studded Leather", "type": "armor", "rarity": "common"},
        {"id": 8, "name": "Wand of Magic Missiles", "type": "magic", "rarity": "uncommon"},
        {"id": 9, "name": "Amulet of Health", "type": "magic", "rarity": "rare"},
        {"id": 10, "name": "Bag of Holding", "type": "magic", "rarity": "uncommon"}
    ]
    return [
        {"id": 1, "name": "Sword", "type": "weapon", "weight": 3},
        {"id": 2, "name": "Bow", "type": "weapon", "weight": 2},
        {"id": 3, "name": "Dagger", "type": "weapon", "weight": 1},
        {"id": 4, "name": "Shield", "type": "armor", "weight": 6},
        {"id": 5, "name": "Leather Armor", "type": "armor", "weight": 10},
        {"id": 6, "name": "Chain Mail", "type": "armor", "weight": 55},
        {"id": 7, "name": "Backpack", "type": "gear", "weight": 5},
        {"id": 8, "name": "Rope", "type": "gear", "weight": 10},
        {"id": 9, "name": "Torch", "type": "gear", "weight": 1},
        {"id": 10, "name": "Potion of Healing", "type": "consumable", "weight": 0.5}
    ]


@router.post("/api/characters", tags=["Characters API"])
async def create_character(character_data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Endpoint para crear un nuevo personaje.

    Args:
        character_data: Datos del personaje a crear

    Returns:
        Dict[str, Any]: El personaje creado con su ID
    """
    # Simulamos la creación de un personaje
    # En una implementación real, usaríamos los casos de uso y repositorios
    character_id = 1  # En un caso real, este ID vendría de la base de datos
    
    return {
        "id": character_id,
        **character_data,
        "created_at": "2025-07-11T12:00:00Z"
    }
    """
    Endpoint para crear un nuevo personaje.

    Args:
        character_data: Datos del personaje a crear

    Returns:
        Dict[str, Any]: Personaje creado con su ID
    """
    try:
        # Aquí se implementaría la lógica real para crear un personaje
        # Simulamos respuesta para la interfaz
        character_data["id"] = 123  # Simulamos ID generado
        return {
            "status": "success",
            "message": "Character created successfully",
            "character": character_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
