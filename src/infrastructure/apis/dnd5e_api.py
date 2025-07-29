"""
Cliente para la API de D&D 5e.

Este módulo implementa el cliente para consumir la API pública de D&D 5e (dnd5eapi.co).
"""


import httpx
from typing import Dict, List, Any, Optional, TypeVar, Callable
import asyncio
from functools import lru_cache
from domain.entities.api_data.dnd5e.races import Races
from domain.entities.api_data.dnd5e.classes import Classes
from domain.entities.api_data.dnd5e.spells import Spells
from domain.entities.api_data.dnd5e.skills import Skills
from domain.entities.api_data.dnd5e.alignments import Alignments
from domain.entities.api_data.dnd5e.backgrounds import Backgrounds
from domain.entities.api_data.dnd5e.languages import Languages
from domain.entities.api_data.dnd5e.proficiencies import Proficiencies
from domain.entities.api_data.dnd5e.equipments import Equipments

T = TypeVar('T')

class DnD5eApiClient:
    """
    Cliente para la API de D&D 5e.
    
    Proporciona métodos para acceder a diferentes recursos de la API
    como razas, clases, hechizos, etc.
    """

    # Evitamos warning con /2014
    BASE_URL = "https://www.dnd5eapi.co/api/2014"
    
    @staticmethod
    async def _get_resource(endpoint: str) -> Dict[str, Any]:
        """
        Obtiene un recurso específico de la API.

        Args:
            endpoint: Ruta del endpoint a consultar

        Returns:
            Dict[str, Any]: Respuesta de la API
        """
        try:
            url = f"{DnD5eApiClient.BASE_URL}{endpoint}"
            print(f"Solicitando: {url}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                print(f"Respuesta recibida de {url}: Estructura: {list(data.keys()) if isinstance(data, dict) else 'No es un diccionario'}")
                if isinstance(data, dict) and "results" in data:
                    print(f"Cantidad de resultados: {len(data['results'])}")
                    if data["results"] and len(data["results"]) > 0:
                        print(f"Primer resultado: {data['results'][0]}")
                return data
        except Exception as e:
            print(f"Error al obtener recurso de API {endpoint}: {e}")
            # Devolver un objeto vacío pero con la estructura esperada
            return {"count": 0, "results": []}
    
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
        try:
            data = await DnD5eApiClient._get_resource(resource_type)
            
            if "results" not in data:
                return []
                
            results = []
            
            # Obtener detalles de cada recurso
            async with httpx.AsyncClient() as client:
                tasks = []
                for item in data["results"]:
                    try:
                        if "url" in item:
                            if item["url"].startswith("/api/"):
                                url = f"https://www.dnd5eapi.co{item['url']}"
                            else:
                                url = f"{DnD5eApiClient.BASE_URL}/{item['url']}"
                            tasks.append(client.get(url))
                    except Exception as e:
                        print(f"Error al crear tarea para {item}: {e}")
                
                if not tasks:
                    return []
                    
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
            for response in responses:
                try:
                    if isinstance(response, httpx.Response):
                        if response.status_code == 200:
                            item_data = response.json()
                            if transform_func:
                                results.append(transform_func(item_data))
                            else:
                                results.append(item_data)
                except Exception as e:
                    print(f"Error procesando respuesta: {e}")
                    
            return results
        except Exception as e:
            print(f"Error en _get_all_resources para {resource_type}: {e}")
            return []
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_races() -> Races:
        """
        Obtiene todas las razas disponibles.
        Returns:
            Races: Entidad validada de razas
        """
        data = await DnD5eApiClient._get_resource("/races")
        try:
            return Races(**data)
        except Exception as e:
            raise ValueError(f"Error validando razas: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_classes() -> Classes:
        """
        Obtiene todas las clases disponibles.
        Returns:
            Classes: Entidad validada de clases
        """
        data = await DnD5eApiClient._get_resource("/classes")
        try:
            return Classes(**data)
        except Exception as e:
            raise ValueError(f"Error validando clases: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_spells() -> Spells:
        """
        Obtiene todos los hechizos disponibles.
        Returns:
            Spells: Entidad validada de hechizos
        """
        data = await DnD5eApiClient._get_resource("/spells")
        try:
            return Spells(**data)
        except Exception as e:
            raise ValueError(f"Error validando hechizos: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_skills() -> Skills:
        """
        Obtiene todas las habilidades disponibles.
        Returns:
            Skills: Entidad validada de habilidades
        """
        data = await DnD5eApiClient._get_resource("/skills")
        try:
            return Skills(**data)
        except Exception as e:
            raise ValueError(f"Error validando skills: {e}")
        try:
            return Skills(**data)
        except Exception as e:
            raise ValueError(f"Error validando skills: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_alignments() -> Alignments:
        """
        Obtiene todos los alineamientos disponibles.
        Returns:
            Alignments: Entidad validada de alineamientos
        """
        data = await DnD5eApiClient._get_resource("/alignments")
        try:
            return Alignments(**data)
        except Exception as e:
            raise ValueError(f"Error validando alignments: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_backgrounds() -> Backgrounds:
        """
        Obtiene todos los trasfondos disponibles.
        Returns:
            Backgrounds: Entidad validada de backgrounds
        """
        data = await DnD5eApiClient._get_resource("/backgrounds")
        try:
            return Backgrounds(**data)
        except Exception as e:
            raise ValueError(f"Error validando backgrounds: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_languages() -> Languages:
        """
        Obtiene todos los idiomas disponibles.
        Returns:
            Languages: Entidad validada de idiomas
        """
        data = await DnD5eApiClient._get_resource("/languages")
        try:
            return Languages(**data)
        except Exception as e:
            raise ValueError(f"Error validando languages: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_proficiencies() -> Proficiencies:
        """
        Obtiene todas las competencias disponibles.
        Returns:
            Proficiencies: Entidad validada de competencias
        """
        data = await DnD5eApiClient._get_resource("/proficiencies")
        try:
            return Proficiencies(**data)
        except Exception as e:
            raise ValueError(f"Error validando proficiencies: {e}")
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_equipment() -> Equipments:
        """
        Obtiene todos los objetos de equipamiento disponibles.
        Returns:
            Equipments: Entidad validada de equipamiento
        """
        data = await DnD5eApiClient._get_resource("/equipment")
        try:
            return Equipments(**data)
        except Exception as e:
            raise ValueError(f"Error validando equipment: {e}")
