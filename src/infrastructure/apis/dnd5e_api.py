"""
Cliente para la API de D&D 5e.

Este módulo implementa el cliente para consumir la API pública de D&D 5e (dnd5eapi.co).
"""

import httpx
from typing import Dict, List, Any, Optional, TypeVar, Callable
import asyncio
from functools import lru_cache

T = TypeVar('T')

class DnD5eApiClient:
    """
    Cliente para la API de D&D 5e.
    
    Proporciona métodos para acceder a diferentes recursos de la API
    como razas, clases, hechizos, etc.
    """

    BASE_URL = "https://www.dnd5eapi.co/api"
    
    @staticmethod
    async def _get_resource(endpoint: str) -> Dict[str, Any]:
        """
        Obtiene un recurso específico de la API.

        Args:
            endpoint: Ruta del endpoint a consultar

        Returns:
            Dict[str, Any]: Respuesta de la API
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{DnD5eApiClient.BASE_URL}/{endpoint}")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    async def _get_all_resources(resource_type: str, transform_func: Optional[Callable[[Dict[str, Any]], T]] = None) -> List[T]:
        """
        Obtiene todos los recursos de un tipo específico.

        Args:
            resource_type: Tipo de recurso a obtener
            transform_func: Función opcional para transformar cada recurso

        Returns:
            List[T]: Lista de recursos transformados
        """
        data = await DnD5eApiClient._get_resource(resource_type)
        
        if "results" not in data:
            return []
            
        results = []
        
        # Obtener detalles de cada recurso
        async with httpx.AsyncClient() as client:
            tasks = []
            for item in data["results"]:
                if item["url"].startswith("/api/"):
                    url = f"https://www.dnd5eapi.co{item['url']}"
                else:
                    url = f"{DnD5eApiClient.BASE_URL}/{item['url']}"
                tasks.append(client.get(url))
                
            responses = await asyncio.gather(*tasks)
            
        for response in responses:
            if response.status_code == 200:
                item_data = response.json()
                if transform_func:
                    results.append(transform_func(item_data))
                else:
                    results.append(item_data)
                    
        return results
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_races() -> List[Dict[str, Any]]:
        """
        Obtiene todas las razas disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de razas
        """
        def transform_race(race: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "id": race["index"],
                "name": race["name"],
                "description": f"{race['name']} - {', '.join(trait['name'] for trait in race.get('traits', []))}",
                "speed": race.get("speed", 30),
                "ability_bonuses": [
                    {"ability_score": bonus.get("ability_score", {}).get("name", ""),
                     "bonus": bonus.get("bonus", 0)} 
                    for bonus in race.get("ability_bonuses", [])
                ],
                "source": "dnd5e"
            }
            
        return await DnD5eApiClient._get_all_resources("races", transform_race)
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_classes() -> List[Dict[str, Any]]:
        """
        Obtiene todas las clases disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de clases
        """
        def transform_class(class_data: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "id": class_data["index"],
                "name": class_data["name"],
                "description": f"{class_data['name']} - Hit Die: d{class_data.get('hit_die', '?')}",
                "hit_die": class_data.get("hit_die", 8),
                "proficiencies": [prof.get("name", "") for prof in class_data.get("proficiencies", [])],
                "source": "dnd5e"
            }
            
        return await DnD5eApiClient._get_all_resources("classes", transform_class)
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_spells() -> List[Dict[str, Any]]:
        """
        Obtiene todos los hechizos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de hechizos
        """
        def transform_spell(spell: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "id": spell["index"],
                "name": spell["name"],
                "level": spell.get("level", 0),
                "school": spell.get("school", {}).get("name", "Unknown"),
                "description": spell.get("desc", [""])[0][:100] if spell.get("desc") else "",
                "source": "dnd5e"
            }
            
        # Debido a la cantidad de hechizos, limitamos a un conjunto manejable
        data = await DnD5eApiClient._get_resource("spells")
        
        if "results" not in data:
            return []
            
        results = []
        
        # Tomar solo los primeros 20 hechizos para no sobrecargar la API
        selected_items = data["results"][:20] if len(data["results"]) > 20 else data["results"]
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for item in selected_items:
                if item["url"].startswith("/api/"):
                    url = f"https://www.dnd5eapi.co{item['url']}"
                else:
                    url = f"{DnD5eApiClient.BASE_URL}/{item['url']}"
                tasks.append(client.get(url))
                
            responses = await asyncio.gather(*tasks)
            
        for response in responses:
            if response.status_code == 200:
                spell_data = response.json()
                results.append(transform_spell(spell_data))
                    
        return results
    
    @staticmethod
    # Eliminamos el cache para que se actualice correctamente
    # @lru_cache(maxsize=1)
    async def get_skills() -> List[Dict[str, Any]]:
        """
        Obtiene todas las habilidades disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de habilidades
        """
        def transform_skill(skill: Dict[str, Any]) -> Dict[str, Any]:
            # Mapeo de ability_score.name a nuestros nombres de atributos
            attribute_mapping = {
                "STR": "strength",
                "DEX": "dexterity",
                "CON": "constitution",
                "INT": "intelligence",
                "WIS": "wisdom",
                "CHA": "charisma"
            }
            
            ability_score = skill.get("ability_score", {}).get("name", "")
            attribute = attribute_mapping.get(ability_score, "")
            
            return {
                "id": skill["index"],
                "name": skill["name"],
                "attribute": attribute,
                "description": skill.get("desc", [""])[0][:100] if skill.get("desc") else "",
                "source": "dnd5e"
            }
            
        return await DnD5eApiClient._get_all_resources("skills", transform_skill)
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_alignments() -> List[Dict[str, Any]]:
        """
        Obtiene todos los alineamientos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de alineamientos
        """
        def transform_alignment(alignment: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "id": alignment["index"],
                "name": alignment["name"],
                "description": alignment.get("desc", ""),
                "source": "dnd5e"
            }
            
        return await DnD5eApiClient._get_all_resources("alignments", transform_alignment)
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_backgrounds() -> List[Dict[str, Any]]:
        """
        Obtiene todos los trasfondos disponibles.

        Nota: La API de D&D 5e no tiene endpoint para backgrounds,
        por lo que devolvemos una lista estática basada en el SRD.

        Returns:
            List[Dict[str, Any]]: Lista de trasfondos
        """
        # Lista estática de backgrounds del SRD de D&D 5e
        backgrounds = [
            {
                "id": "acolyte",
                "name": "Acolyte",
                "description": "You have spent your life in service to a temple.",
                "source": "dnd5e"
            },
            {
                "id": "criminal",
                "name": "Criminal",
                "description": "You have a history of breaking the law.",
                "source": "dnd5e"
            },
            {
                "id": "folk-hero",
                "name": "Folk Hero",
                "description": "You come from a humble social rank, but are destined for much more.",
                "source": "dnd5e"
            },
            {
                "id": "noble",
                "name": "Noble",
                "description": "You were born into a family of wealth, power, and privilege.",
                "source": "dnd5e"
            },
            {
                "id": "sage",
                "name": "Sage",
                "description": "You spent years learning the lore of the multiverse.",
                "source": "dnd5e"
            },
            {
                "id": "soldier",
                "name": "Soldier",
                "description": "War has been your life for as long as you care to remember.",
                "source": "dnd5e"
            }
        ]
        
        return backgrounds
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_languages() -> List[Dict[str, Any]]:
        """
        Obtiene todos los idiomas disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de idiomas
        """
        def transform_language(language: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "id": language["index"],
                "name": language["name"],
                "description": f"Script: {language.get('script', 'None')}, Type: {language.get('type', 'Unknown')}",
                "script": language.get("script", ""),
                "source": "dnd5e"
            }
            
        return await DnD5eApiClient._get_all_resources("languages", transform_language)
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_proficiencies() -> List[Dict[str, Any]]:
        """
        Obtiene todas las competencias disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de competencias
        """
        # La API tiene demasiadas proficiencies, así que las filtramos por tipo
        data = await DnD5eApiClient._get_resource("proficiencies")
        
        if "results" not in data:
            return []
        
        proficiency_types = {
            "Armor": "armor",
            "Weapons": "weapon",
            "Tools": "tool",
            "Saving Throw": "saving_throw",
            "Skill": "skill"
        }
        
        results = []
        
        # Seleccionar solo algunas proficiencies representativas por tipo
        selected_profs = []
        for item in data["results"]:
            for key, value in proficiency_types.items():
                if key in item["name"]:
                    if len([p for p in selected_profs if key in p["name"]]) < 5:  # Máximo 5 por tipo
                        selected_profs.append(item)
                    break
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for item in selected_profs:
                if item["url"].startswith("/api/"):
                    url = f"https://www.dnd5eapi.co{item['url']}"
                else:
                    url = f"{DnD5eApiClient.BASE_URL}/{item['url']}"
                tasks.append(client.get(url))
                
            responses = await asyncio.gather(*tasks)
            
        for response in responses:
            if response.status_code == 200:
                prof_data = response.json()
                
                # Determinar el tipo de proficiency
                prof_type = "other"
                for key, value in proficiency_types.items():
                    if key in prof_data["name"]:
                        prof_type = value
                        break
                        
                results.append({
                    "id": prof_data["index"],
                    "name": prof_data["name"],
                    "type": prof_type,
                    "source": "dnd5e"
                })
                    
        return results
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_equipment() -> List[Dict[str, Any]]:
        """
        Obtiene todos los objetos de equipamiento disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de objetos
        """
        data = await DnD5eApiClient._get_resource("equipment")
        
        if "results" not in data:
            return []
        
        # Mapeo de categorías de equipamiento
        equipment_types = {
            "Weapon": "weapon",
            "Armor": "armor",
            "Adventuring Gear": "gear",
            "Tools": "tool",
            "Mounts and Vehicles": "mount",
        }
        
        results = []
        
        # Seleccionar algunos objetos representativos (máximo 20)
        selected_items = data["results"][:20] if len(data["results"]) > 20 else data["results"]
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for item in selected_items:
                if item["url"].startswith("/api/"):
                    url = f"https://www.dnd5eapi.co{item['url']}"
                else:
                    url = f"{DnD5eApiClient.BASE_URL}/{item['url']}"
                tasks.append(client.get(url))
                
            responses = await asyncio.gather(*tasks)
            
        for response in responses:
            if response.status_code == 200:
                item_data = response.json()
                
                # Determinar el tipo de objeto
                item_type = "gear"  # Valor por defecto
                for category, mapped_type in equipment_types.items():
                    if "equipment_category" in item_data and category in item_data["equipment_category"].get("name", ""):
                        item_type = mapped_type
                        break
                
                results.append({
                    "id": item_data["index"],
                    "name": item_data["name"],
                    "type": item_type,
                    "rarity": "common",  # La API no tiene campo de rareza
                    "description": item_data.get("desc", [""])[0][:100] if item_data.get("desc") else "",
                    "source": "dnd5e"
                })
                    
        return results
