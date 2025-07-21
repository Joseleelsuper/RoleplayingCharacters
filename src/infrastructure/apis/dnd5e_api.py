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
    @lru_cache(maxsize=1)
    async def get_races() -> Dict[str, Any]:
        """
        Obtiene todas las razas disponibles de la edición 2014.

        Returns:
            Dict[str, Any]: Diccionario con el conteo y la lista de razas
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/races")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_classes() -> List[Dict[str, Any]]:
        """
        Obtiene todas las clases disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de clases
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/classes")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_spells() -> List[Dict[str, Any]]:
        """
        Obtiene todos los hechizos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de hechizos
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/spells")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_skills() -> List[Dict[str, Any]]:
        """
        Obtiene todas las habilidades disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de habilidades
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/skills")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_alignments() -> List[Dict[str, Any]]:
        """
        Obtiene todos los alineamientos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de alineamientos
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/alignments")
            response.raise_for_status()
            return response.json()
    
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
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/backgrounds")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_languages() -> List[Dict[str, Any]]:
        """
        Obtiene todos los idiomas disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de idiomas
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/languages")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_proficiencies() -> List[Dict[str, Any]]:
        """
        Obtiene todas las competencias disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de competencias
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/proficiencies")
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    @lru_cache(maxsize=1)
    async def get_equipment() -> List[Dict[str, Any]]:
        """
        Obtiene todos los objetos de equipamiento disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de objetos
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("https://www.dnd5eapi.co/api/2014/equipment")
            response.raise_for_status()
            return response.json()
