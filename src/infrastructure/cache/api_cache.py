"""
Sistema de caché en memoria para APIs externas.

Este módulo implementa un sistema de caché simple en memoria
para evitar peticiones repetidas a APIs externas.
"""

import time
from typing import Dict, Any, Optional, TypeVar, Callable, Awaitable
from functools import wraps

T = TypeVar('T')


class ApiCache:
    """
    Sistema de caché en memoria con expiración por tiempo.
    """
    
    def __init__(self, default_ttl: int = 300):
        """
        Inicializa el sistema de caché.
        
        Args:
            default_ttl: Tiempo de vida por defecto en segundos (5 minutos)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = default_ttl
    
    def _is_expired(self, cache_entry: Dict[str, Any]) -> bool:
        """
        Verifica si una entrada del caché ha expirado.
        
        Args:
            cache_entry: Entrada del caché con timestamp y data
            
        Returns:
            bool: True si ha expirado, False en caso contrario
        """
        return time.time() > cache_entry["expires_at"]
    
    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del caché.
        
        Args:
            key: Clave del caché
            
        Returns:
            Valor almacenado o None si no existe o ha expirado
        """
        if key not in self._cache:
            return None
        
        cache_entry = self._cache[key]
        
        if self._is_expired(cache_entry):
            del self._cache[key]
            return None
        
        return cache_entry["data"]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Almacena un valor en el caché.
        
        Args:
            key: Clave del caché
            value: Valor a almacenar
            ttl: Tiempo de vida en segundos (usa default_ttl si no se especifica)
        """
        ttl = ttl or self._default_ttl
        expires_at = time.time() + ttl
        
        self._cache[key] = {
            "data": value,
            "expires_at": expires_at,
            "created_at": time.time()
        }
    
    def clear(self) -> None:
        """Limpia todo el caché."""
        self._cache.clear()
    
    def delete(self, key: str) -> bool:
        """
        Elimina una entrada específica del caché.
        
        Args:
            key: Clave a eliminar
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del caché.
        
        Returns:
            Dict con estadísticas del caché
        """
        total_entries = len(self._cache)
        expired_entries = sum(1 for entry in self._cache.values() if self._is_expired(entry))
        active_entries = total_entries - expired_entries
        
        return {
            "total_entries": total_entries,
            "active_entries": active_entries,
            "expired_entries": expired_entries,
            "cache_size_bytes": sum(len(str(entry)) for entry in self._cache.values())
        }


# Instancia global del caché
api_cache = ApiCache(default_ttl=600)  # 10 minutos de caché


def cached_api_call(cache_key: str, ttl: Optional[int] = None):
    """
    Decorador para cachear llamadas a APIs externas.
    
    Args:
        cache_key: Clave base para el caché (se pueden añadir parámetros)
        ttl: Tiempo de vida del caché en segundos
        
    Returns:
        Decorador que cachea el resultado de la función
    """
    def decorator(func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # Generar clave única basada en función y parámetros
            params_key = str(sorted(kwargs.items())) if kwargs else ""
            full_cache_key = f"{cache_key}:{params_key}"
            
            # Intentar obtener del caché
            cached_result = api_cache.get(full_cache_key)
            if cached_result is not None:
                return cached_result
            
            # Si no está en caché, ejecutar función original
            result = await func(*args, **kwargs)
            
            # Guardar en caché
            api_cache.set(full_cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def clear_game_cache(game_type: str) -> int:
    """
    Limpia el caché para un tipo de juego específico.
    
    Args:
        game_type: Tipo de juego para limpiar del caché
        
    Returns:
        int: Número de entradas eliminadas
    """
    keys_to_delete = []
    for key in api_cache._cache.keys():
        if game_type in key or f"game_type={game_type}" in key:
            keys_to_delete.append(key)
    
    deleted_count = 0
    for key in keys_to_delete:
        if api_cache.delete(key):
            deleted_count += 1
    
    return deleted_count
