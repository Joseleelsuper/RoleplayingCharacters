"""
Contratos compartidos entre las capas de la aplicación.

Este módulo contiene las interfaces y DTOs que pueden ser utilizados
por diferentes capas sin violar la arquitectura hexagonal.
"""

from typing import Optional, Protocol
from dataclasses import dataclass
from abc import ABC, abstractmethod


# DTOs para transferir datos entre capas
@dataclass
class UserDto:
    """
    DTO para transferir datos de usuario sin información sensible.
    
    Attributes:
        id: ID único del usuario
        username: Nombre de usuario
        email: Email del usuario
        created_at: Fecha de creación de la cuenta
    """
    id: str
    username: str
    email: str
    created_at: str


@dataclass
class RegisterUserCommand:
    """
    Comando para registrar un nuevo usuario.
    
    Attributes:
        username: Nombre de usuario único
        email: Email del usuario
        password: Contraseña del usuario
    """
    username: str
    email: str
    password: str


@dataclass
class LoginUserCommand:
    """
    Comando para autenticar un usuario.
    
    Attributes:
        email: Email del usuario
        password: Contraseña del usuario
    """
    email: str
    password: str


@dataclass
class AuthResponse:
    """
    Respuesta de operaciones de autenticación.
    
    Attributes:
        success: Indica si la operación fue exitosa
        message: Mensaje descriptivo del resultado
        token: Token de sesión (si es exitoso)
        user: Datos del usuario (si es exitoso)
    """
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[UserDto] = None


# Interfaces/Protocolos para servicios
class AuthenticationServiceInterface(Protocol):
    """
    Interfaz para el servicio de autenticación.
    
    Define el contrato que debe implementar cualquier servicio de autenticación.
    """
    
    def register_user(self, command: RegisterUserCommand) -> tuple[bool, str, Optional[UserDto]]:
        """
        Registra un nuevo usuario en el sistema.
        
        Args:
            command: Comando con los datos de registro
            
        Returns:
            tuple: (éxito, mensaje, usuario_dto o None)
        """
        ...
    
    def authenticate_user(self, command: LoginUserCommand) -> tuple[bool, str, Optional[UserDto]]:
        """
        Autentica un usuario existente.
        
        Args:
            command: Comando con las credenciales de login
            
        Returns:
            tuple: (éxito, mensaje, usuario_dto o None)
        """
        ...
    
    def get_user_by_session(self, session_token: str) -> Optional[UserDto]:
        """
        Obtiene un usuario por su token de sesión.
        
        Args:
            session_token: Token de sesión del usuario
            
        Returns:
            UserDto o None si no se encuentra el usuario
        """
        ...
    
    def create_session(self, session_token: str, user_dto: UserDto) -> None:
        """
        Crea una nueva sesión para un usuario.
        
        Args:
            session_token: Token único de sesión
            user_dto: DTO del usuario autenticado
        """
        ...
    
    def destroy_session(self, session_token: str) -> bool:
        """
        Destruye una sesión activa.
        
        Args:
            session_token: Token de sesión a eliminar
            
        Returns:
            bool: True si la sesión fue eliminada, False si no existía
        """
        ...


# Interfaces para repositorios (para uso futuro)
class UserRepositoryInterface(ABC):
    """
    Interfaz para el repositorio de usuarios.
    
    Define el contrato que debe implementar cualquier repositorio de usuarios.
    """
    
    @abstractmethod
    def find_by_email(self, email: str) -> Optional[UserDto]:
        """Busca un usuario por email."""
        pass
    
    @abstractmethod
    def find_by_username(self, username: str) -> Optional[UserDto]:
        """Busca un usuario por nombre de usuario."""
        pass
    
    @abstractmethod
    def save(self, user_data: RegisterUserCommand) -> UserDto:
        """Guarda un nuevo usuario."""
        pass
