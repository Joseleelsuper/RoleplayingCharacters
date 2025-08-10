"""
Configuración de dependencias para la capa de infraestructura.

Este módulo centraliza la configuración de dependencias siguiendo
los principios de inversión de dependencias de la arquitectura hexagonal.
"""

from typing import Optional, Callable
from src.contracts import (
    AuthenticationServiceInterface,
    UserDto
)


class DependencyContainer:
    """
    Contenedor de dependencias que gestiona las instancias de servicios.
    
    Este contenedor actúa como punto central para la inyección de dependencias,
    permitiendo que la infraestructura acceda a los servicios de aplicación
    sin violar la arquitectura hexagonal.
    """
    
    def __init__(self):
        """Inicializa el contenedor con las dependencias básicas."""
        self._auth_service: Optional[AuthenticationServiceInterface] = None
        self._auth_service_factory: Optional[Callable[[], AuthenticationServiceInterface]] = None
    
    def set_auth_service_factory(self, factory: Callable[[], AuthenticationServiceInterface]) -> None:
        """
        Configura una factory para crear el servicio de autenticación.
        
        Args:
            factory: Factory function que crea el servicio de autenticación
        """
        self._auth_service_factory = factory
        self._auth_service = None  # Reset para forzar recreación
    
    def get_auth_service(self) -> AuthenticationServiceInterface:
        """
        Obtiene la instancia del servicio de autenticación.
        
        Returns:
            AuthenticationServiceInterface: Servicio de autenticación configurado
            
        Raises:
            RuntimeError: Si no se ha configurado el servicio de autenticación
        """
        if self._auth_service is None:
            if self._auth_service_factory is None:
                raise RuntimeError(
                    "No se ha configurado el servicio de autenticación. "
                    "Configura el servicio usando set_auth_service_factory() o configure_auth_service()"
                )
            
            self._auth_service = self._auth_service_factory()
        return self._auth_service
    
    def configure_auth_service(self, service: AuthenticationServiceInterface) -> None:
        """
        Configura un servicio de autenticación personalizado.
        
        Args:
            service: Implementación del servicio de autenticación
        """
        self._auth_service = service


# Instancia global del contenedor de dependencias
dependency_container = DependencyContainer()


def get_auth_service() -> AuthenticationServiceInterface:
    """
    Función helper para obtener el servicio de autenticación.
    
    Returns:
        AuthenticationServiceInterface: Servicio de autenticación
    """
    return dependency_container.get_auth_service()


def get_current_user_from_session(session_token: str) -> Optional[UserDto]:
    """
    Obtiene el usuario actual desde un token de sesión.
    
    Args:
        session_token: Token de sesión del usuario
        
    Returns:
        UserDto o None si no hay usuario autenticado
    """
    if not session_token:
        return None
    
    auth_service = get_auth_service()
    return auth_service.get_user_by_session(session_token)
