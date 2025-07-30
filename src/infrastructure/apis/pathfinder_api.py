"""
Cliente para la API de Pathfinder 2e.

Este módulo implementa el cliente para consumir la API pública de Pathfinder 2e (pf2etools).
"""

import httpx
from typing import Dict, List, Any, TypeVar
from functools import lru_cache

T = TypeVar('T')

class PathfinderApiClient:
    """
    Cliente para la API de Pathfinder 2e.
    
    Proporciona métodos para acceder a diferentes recursos de la API
    como ancestries (razas), clases, hechizos, etc.
    """

    BASE_URL = "https://api.pf2etools.com/v1"
    
    @staticmethod
    async def _get_resource(endpoint: str) -> List[Dict[str, Any]]:
        """
        Obtiene un recurso específico de la API.

        Args:
            endpoint: Ruta del endpoint a consultar

        Returns:
            List[Dict[str, Any]]: Respuesta de la API
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{PathfinderApiClient.BASE_URL}/{endpoint}")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_ancestries() -> List[Dict[str, Any]]:
        """
        Obtiene todas las ancestries (equivalente a razas) disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de ancestries
        """
        try:
            data = await PathfinderApiClient._get_resource("ancestries")
            
            if not data:
                return []
                
            results = []
            
            for item in data:
                results.append({
                    "id": item.get("_id", ""),
                    "name": item.get("name", "Unknown"),
                    "description": item.get("descriptionShort", "")[:200] if item.get("descriptionShort") else "",
                    "hp": item.get("hp", 0),
                    "size": item.get("size", []),
                    "source": "pathfinder"
                })
                    
            return results
        except Exception:
            # Si hay algún error con la API, devolvemos una lista vacía
            return []
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_backgrounds() -> List[Dict[str, Any]]:
        """
        Obtiene todos los backgrounds disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de backgrounds
        """
        try:
            data = await PathfinderApiClient._get_resource("backgrounds")
            
            if not data:
                return []
                
            results = []
            
            # Limitamos a 10 backgrounds para no saturar la respuesta
            selected_items = data[:10] if len(data) > 10 else data
            
            for item in selected_items:
                results.append({
                    "id": item.get("_id", ""),
                    "name": item.get("name", "Unknown"),
                    "description": item.get("descriptionShort", "")[:200] if item.get("descriptionShort") else "",
                    "source": "pathfinder"
                })
                    
            return results
        except Exception:
            # Si hay algún error con la API, devolvemos una lista vacía
            return []
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_classes() -> List[Dict[str, Any]]:
        """
        Obtiene todas las clases disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de clases
        """
        try:
            data = await PathfinderApiClient._get_resource("classes")
            
            if not data:
                return []
                
            results = []
            
            for item in data:
                results.append({
                    "id": item.get("_id", ""),
                    "name": item.get("name", "Unknown"),
                    "description": item.get("descriptionShort", "")[:200] if item.get("descriptionShort") else "",
                    "key_ability": item.get("keyAbility", []),
                    "source": "pathfinder"
                })
                    
            return results
        except Exception as e:
            # Si hay algún error con la API, imprimimos el error y devolvemos una lista vacía
            print(f"Error en get_classes: {e}")
            return []
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_skills() -> List[Dict[str, Any]]:
        """
        Obtiene todas las habilidades disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de habilidades
        """
        # Pathfinder 2e tiene 16 habilidades básicas
        pf2e_skills = [
            {
                "id": "acrobatics",
                "name": "Acrobatics",
                "attribute": "dexterity",
                "description": "Mantener el equilibrio y realizar hazañas de agilidad.",
                "source": "pathfinder"
            },
            {
                "id": "arcana",
                "name": "Arcana",
                "attribute": "intelligence",
                "description": "Conocimiento sobre magia arcana.",
                "source": "pathfinder"
            },
            {
                "id": "athletics",
                "name": "Athletics",
                "attribute": "strength",
                "description": "Escalar, nadar y realizar otras actividades físicas.",
                "source": "pathfinder"
            },
            {
                "id": "crafting",
                "name": "Crafting",
                "attribute": "intelligence",
                "description": "Crear y reparar objetos.",
                "source": "pathfinder"
            },
            {
                "id": "deception",
                "name": "Deception",
                "attribute": "charisma",
                "description": "Mentir y engañar a otros.",
                "source": "pathfinder"
            },
            {
                "id": "diplomacy",
                "name": "Diplomacy",
                "attribute": "charisma",
                "description": "Cambiar la actitud de otros mediante negociación.",
                "source": "pathfinder"
            },
            {
                "id": "intimidation",
                "name": "Intimidation",
                "attribute": "charisma",
                "description": "Influenciar a través del miedo.",
                "source": "pathfinder"
            },
            {
                "id": "lore",
                "name": "Lore",
                "attribute": "intelligence",
                "description": "Conocimiento especializado sobre un tema.",
                "source": "pathfinder"
            },
            {
                "id": "medicine",
                "name": "Medicine",
                "attribute": "wisdom",
                "description": "Tratar enfermedades y heridas.",
                "source": "pathfinder"
            },
            {
                "id": "nature",
                "name": "Nature",
                "attribute": "wisdom",
                "description": "Conocimiento sobre el mundo natural.",
                "source": "pathfinder"
            },
            {
                "id": "occultism",
                "name": "Occultism",
                "attribute": "intelligence",
                "description": "Conocimiento sobre lo paranormal.",
                "source": "pathfinder"
            },
            {
                "id": "performance",
                "name": "Performance",
                "attribute": "charisma",
                "description": "Impresionar a otros con arte.",
                "source": "pathfinder"
            },
            {
                "id": "religion",
                "name": "Religion",
                "attribute": "wisdom",
                "description": "Conocimiento sobre deidades y religión.",
                "source": "pathfinder"
            },
            {
                "id": "society",
                "name": "Society",
                "attribute": "intelligence",
                "description": "Conocimiento sobre civilizaciones e historia.",
                "source": "pathfinder"
            },
            {
                "id": "stealth",
                "name": "Stealth",
                "attribute": "dexterity",
                "description": "Moverse sin ser detectado.",
                "source": "pathfinder"
            },
            {
                "id": "survival",
                "name": "Survival",
                "attribute": "wisdom",
                "description": "Sobrevivir en la naturaleza.",
                "source": "pathfinder"
            },
        ]
        
        return pf2e_skills
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_spells() -> List[Dict[str, Any]]:
        """
        Obtiene una selección de hechizos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de hechizos
        """
        try:
            data = await PathfinderApiClient._get_resource("spells")
            
            if not data:
                return []
                
            results = []
            
            # Limitamos a 20 hechizos para no saturar la respuesta
            selected_items = data[:20] if len(data) > 20 else data
            
            for item in selected_items:
                # Mapeamos las tradiciones a escuelas para mantener consistencia
                tradition_to_school = {
                    "arcane": "Arcane",
                    "divine": "Divine",
                    "occult": "Occult",
                    "primal": "Primal"
                }
                
                traditions = item.get("traditions", [])
                school = "Unknown"
                if traditions and len(traditions) > 0:
                    school = tradition_to_school.get(traditions[0], "Unknown")
                
                results.append({
                    "id": item.get("_id", ""),
                    "name": item.get("name", "Unknown"),
                    "level": item.get("level", 0),
                    "school": school,
                    "description": item.get("description", "")[:200] if item.get("description") else "",
                    "source": "pathfinder"
                })
                    
            return results
        except Exception:
            # Si hay algún error con la API, devolvemos una lista vacía
            return []
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_equipment() -> List[Dict[str, Any]]:
        """
        Obtiene todos los objetos de equipamiento disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de objetos
        """
        try:
            data = await PathfinderApiClient._get_resource("equipment")
            
            if not data:
                return []
                
            results = []
            
            # Limitamos a 20 objetos para no saturar la respuesta
            selected_items = data[:20] if len(data) > 20 else data
            
            # Mapeo de categorías de equipamiento
            equipment_types = {
                "weapon": "weapon",
                "armor": "armor",
                "shield": "armor",
                "adventuring gear": "gear",
                "alchemical": "consumable",
                "staff": "magic",
                "wand": "magic",
                "scroll": "magic"
            }
            
            for item in selected_items:
                # Determinar el tipo de objeto
                item_type = "gear"  # Valor por defecto
                item_category = item.get("category", "").lower()
                for category, mapped_type in equipment_types.items():
                    if category in item_category:
                        item_type = mapped_type
                        break
                
                # Determinar la rareza
                rarity = item.get("rarity", "common").lower()
                if rarity not in ["common", "uncommon", "rare", "very rare", "legendary", "artifact"]:
                    rarity = "common"
                
                results.append({
                    "id": item.get("_id", ""),
                    "name": item.get("name", "Unknown"),
                    "type": item_type,
                    "rarity": rarity,
                    "description": item.get("description", "")[:200] if item.get("description") else "",
                    "source": "pathfinder"
                })
                    
            return results
        except Exception:
            # Si hay algún error con la API, devolvemos una lista vacía
            return []
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_languages() -> List[Dict[str, Any]]:
        """
        Obtiene todos los idiomas disponibles.

        Nota: Utilizamos una lista estática ya que la API de Pathfinder
        no tiene un endpoint específico para idiomas.

        Returns:
            List[Dict[str, Any]]: Lista de idiomas
        """
        # Lista de idiomas comunes en Pathfinder 2e
        pathfinder_languages = [
            {
                "id": "common",
                "name": "Common",
                "description": "El idioma hablado por humanos y ampliamente utilizado para el comercio.",
                "source": "pathfinder"
            },
            {
                "id": "dwarven",
                "name": "Dwarven",
                "description": "El idioma de los enanos.",
                "source": "pathfinder"
            },
            {
                "id": "elven",
                "name": "Elven",
                "description": "El idioma de los elfos.",
                "source": "pathfinder"
            },
            {
                "id": "gnomish",
                "name": "Gnomish",
                "description": "El idioma de los gnomos.",
                "source": "pathfinder"
            },
            {
                "id": "goblin",
                "name": "Goblin",
                "description": "El idioma de los goblins y otros goblinoides.",
                "source": "pathfinder"
            },
            {
                "id": "halfling",
                "name": "Halfling",
                "description": "El idioma de los halflings.",
                "source": "pathfinder"
            },
            {
                "id": "orcish",
                "name": "Orcish",
                "description": "El idioma de los orcos.",
                "source": "pathfinder"
            },
            {
                "id": "sylvan",
                "name": "Sylvan",
                "description": "El idioma de las fey y criaturas del bosque.",
                "source": "pathfinder"
            },
            {
                "id": "draconic",
                "name": "Draconic",
                "description": "El idioma de los dragones y sus descendientes.",
                "source": "pathfinder"
            },
            {
                "id": "celestial",
                "name": "Celestial",
                "description": "El idioma de los seres celestiales.",
                "source": "pathfinder"
            },
        ]
        
        return pathfinder_languages
