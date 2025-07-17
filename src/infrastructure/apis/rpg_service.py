"""
Servicio centralizado para las APIs de juegos de rol.

Este módulo proporciona una interfaz unificada para acceder a los datos
de diferentes sistemas de juegos de rol (D&D 5e, Pathfinder 2e, World of Darkness).
"""

from typing import Dict, List, Any
from .dnd5e_api import DnD5eApiClient
from .pathfinder_api import PathfinderApiClient
from .wod_api import WorldOfDarknessClient

class RPGGameType:
    """Tipos de juegos de rol soportados."""
    DND5E = "dnd5e"
    PATHFINDER = "pathfinder"
    WOD = "wod"
    CUSTOM = "custom"

class RPGDataService:
    """
    Servicio centralizado para las APIs de juegos de rol.
    
    Esta clase proporciona métodos para obtener datos de diferentes sistemas
    de juegos de rol a través de una interfaz unificada.
    """
    
    @staticmethod
    async def get_races(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene las razas disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de razas
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_races()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_ancestries()
        elif game_type == RPGGameType.WOD:
            return WorldOfDarknessClient.get_clans()
        else:
            # Para juegos personalizados o si no se reconoce el tipo, datos simulados
            return [
                {"id": 1, "name": "Human", "description": "Versatile and adaptable", "source": "custom"},
                {"id": 2, "name": "Elf", "description": "Graceful and long-lived", "source": "custom"},
                {"id": 3, "name": "Dwarf", "description": "Strong and sturdy", "source": "custom"},
                {"id": 4, "name": "Halfling", "description": "Small and nimble", "source": "custom"},
                {"id": 5, "name": "Gnome", "description": "Curious and inventive", "source": "custom"}
            ]
    
    @staticmethod
    async def get_classes(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene las clases disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de clases
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_classes()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_classes()
        else:
            # Para WoD y juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Fighter", "description": "Master of weapons and armor", "source": "custom"},
                {"id": 2, "name": "Wizard", "description": "Scholar of magical arts", "source": "custom"},
                {"id": 3, "name": "Rogue", "description": "Expert in stealth and trickery", "source": "custom"},
                {"id": 4, "name": "Cleric", "description": "Divine spellcaster and healer", "source": "custom"},
                {"id": 5, "name": "Ranger", "description": "Hunter and tracker", "source": "custom"}
            ]
    
    @staticmethod
    async def get_backgrounds(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene los trasfondos disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de trasfondos
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_backgrounds()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_backgrounds()
        elif game_type == RPGGameType.WOD:
            return WorldOfDarknessClient.get_backgrounds()
        else:
            # Para juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Noble", "description": "Born to wealth and privilege", "source": "custom"},
                {"id": 2, "name": "Acolyte", "description": "Served in a temple", "source": "custom"},
                {"id": 3, "name": "Criminal", "description": "Has a criminal past", "source": "custom"},
                {"id": 4, "name": "Soldier", "description": "Trained in military", "source": "custom"},
                {"id": 5, "name": "Sage", "description": "Scholar and researcher", "source": "custom"}
            ]
    
    @staticmethod
    async def get_alignments(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene los alineamientos disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de alineamientos
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_alignments()
        else:
            # Pathfinder, WoD y juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Lawful Good", "description": "Honor and compassion", "source": "custom"},
                {"id": 2, "name": "Neutral Good", "description": "Do the best good", "source": "custom"},
                {"id": 3, "name": "Chaotic Good", "description": "Freedom and kindness", "source": "custom"},
                {"id": 4, "name": "Lawful Neutral", "description": "Order above all", "source": "custom"},
                {"id": 5, "name": "True Neutral", "description": "Balance in all things", "source": "custom"},
                {"id": 6, "name": "Chaotic Neutral", "description": "Freedom above all", "source": "custom"},
                {"id": 7, "name": "Lawful Evil", "description": "Methodical conquest", "source": "custom"},
                {"id": 8, "name": "Neutral Evil", "description": "Selfish interest", "source": "custom"},
                {"id": 9, "name": "Chaotic Evil", "description": "Destruction and chaos", "source": "custom"}
            ]
    
    @staticmethod
    async def get_skills(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene las habilidades disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de habilidades
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_skills()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_skills()
        elif game_type == RPGGameType.WOD:
            return WorldOfDarknessClient.get_abilities()
        else:
            # Para juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Acrobatics", "attribute": "dexterity", "source": "custom"},
                {"id": 2, "name": "Animal Handling", "attribute": "wisdom", "source": "custom"},
                {"id": 3, "name": "Arcana", "attribute": "intelligence", "source": "custom"},
                {"id": 4, "name": "Athletics", "attribute": "strength", "source": "custom"},
                {"id": 5, "name": "Deception", "attribute": "charisma", "source": "custom"},
                {"id": 6, "name": "History", "attribute": "intelligence", "source": "custom"},
                {"id": 7, "name": "Insight", "attribute": "wisdom", "source": "custom"},
                {"id": 8, "name": "Intimidation", "attribute": "charisma", "source": "custom"}
            ]
    
    @staticmethod
    async def get_languages(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene los idiomas disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de idiomas
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_languages()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_languages()
        else:
            # Para WoD y juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Common", "description": "The common tongue of humans", "source": "custom"},
                {"id": 2, "name": "Elvish", "description": "The language of elves", "source": "custom"},
                {"id": 3, "name": "Dwarvish", "description": "The language of dwarves", "source": "custom"},
                {"id": 4, "name": "Giant", "description": "The language of giants", "source": "custom"},
                {"id": 5, "name": "Gnomish", "description": "The language of gnomes", "source": "custom"}
            ]
    
    @staticmethod
    async def get_proficiencies(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene las competencias disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de competencias
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_proficiencies()
        else:
            # Para Pathfinder, WoD y juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Light Armor", "type": "armor", "source": "custom"},
                {"id": 2, "name": "Medium Armor", "type": "armor", "source": "custom"},
                {"id": 3, "name": "Heavy Armor", "type": "armor", "source": "custom"},
                {"id": 4, "name": "Shields", "type": "armor", "source": "custom"},
                {"id": 5, "name": "Simple Weapons", "type": "weapon", "source": "custom"},
                {"id": 6, "name": "Martial Weapons", "type": "weapon", "source": "custom"}
            ]
    
    @staticmethod
    async def get_spells(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene los hechizos disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de hechizos
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_spells()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_spells()
        elif game_type == RPGGameType.WOD:
            return WorldOfDarknessClient.get_disciplines()
        else:
            # Para juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Magic Missile", "level": 1, "school": "Evocation", "source": "custom"},
                {"id": 2, "name": "Fireball", "level": 3, "school": "Evocation", "source": "custom"},
                {"id": 3, "name": "Cure Wounds", "level": 1, "school": "Evocation", "source": "custom"},
                {"id": 4, "name": "Detect Magic", "level": 1, "school": "Divination", "source": "custom"},
                {"id": 5, "name": "Invisibility", "level": 2, "school": "Illusion", "source": "custom"}
            ]
    
    @staticmethod
    async def get_items(game_type: str) -> List[Dict[str, Any]]:
        """
        Obtiene los objetos disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            List[Dict[str, Any]]: Lista de objetos
        """
        if game_type == RPGGameType.DND5E:
            return await DnD5eApiClient.get_equipment()
        elif game_type == RPGGameType.PATHFINDER:
            return await PathfinderApiClient.get_equipment()
        else:
            # Para WoD y juegos personalizados, datos simulados
            return [
                {"id": 1, "name": "Potion of Healing", "type": "consumable", "rarity": "common", "source": "custom"},
                {"id": 2, "name": "Longsword", "type": "weapon", "rarity": "common", "source": "custom"},
                {"id": 3, "name": "Shield", "type": "armor", "rarity": "common", "source": "custom"},
                {"id": 4, "name": "Rope", "type": "gear", "rarity": "common", "source": "custom"},
                {"id": 5, "name": "Lantern", "type": "gear", "rarity": "common", "source": "custom"}
            ]
    
    @staticmethod
    async def get_all_game_data(game_type: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Obtiene todos los datos disponibles para el tipo de juego especificado.

        Args:
            game_type: Tipo de juego (dnd5e, pathfinder, wod o custom)

        Returns:
            Dict[str, List[Dict[str, Any]]]: Diccionario con todos los datos por categoría
        """
        races = await RPGDataService.get_races(game_type)
        classes = await RPGDataService.get_classes(game_type)
        backgrounds = await RPGDataService.get_backgrounds(game_type)
        alignments = await RPGDataService.get_alignments(game_type)
        skills = await RPGDataService.get_skills(game_type)
        languages = await RPGDataService.get_languages(game_type)
        proficiencies = await RPGDataService.get_proficiencies(game_type)
        spells = await RPGDataService.get_spells(game_type)
        items = await RPGDataService.get_items(game_type)
        
        return {
            "races": races,
            "classes": classes,
            "backgrounds": backgrounds,
            "alignments": alignments,
            "skills": skills,
            "languages": languages,
            "proficiencies": proficiencies,
            "spells": spells,
            "items": items
        }
