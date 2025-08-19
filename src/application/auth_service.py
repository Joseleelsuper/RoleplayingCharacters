"""
Casos de uso de autenticación para el dominio de usuarios.

Este módulo contiene los casos de uso relacionados con autenticación de usuarios,
siguiendo el patrón de arquitectura hexagonal donde los casos de uso están en la
capa de aplicación y orquestan las operaciones del dominio.
"""

import logging
from typing import Optional, Tuple, Protocol
from uuid import uuid4
from datetime import datetime, timezone

import bcrypt

from ..contracts import (
    RegisterUserCommand,
    LoginUserCommand,
    UserDto,
)

logger = logging.getLogger(__name__)


class UserRepositoryProtocol(Protocol):
    """Protocolo mínimo del repositorio de usuarios usado por el servicio."""

    def email_exists(self, email: str) -> bool: ...
    def username_exists(self, username: str) -> bool: ...
    def create_user(self, user_id: str, username: str, email: str, password_hash: str, created_at: datetime) -> bool: ...
    def find_user_by_email(self, email: str) -> Optional[dict]: ...


class AuthenticationService:
    """
    Servicio de autenticación que maneja los casos de uso relacionados con usuarios.
    
    Este servicio actúa como capa de aplicación, orquestando las operaciones
    del dominio usando PostgreSQL como persistencia.
    """

    def __init__(self, user_repository: UserRepositoryProtocol):
        """Inicializa el servicio de autenticación."""
        self._user_repository = user_repository
        self._sessions_storage = {}  # Almacén temporal de sesiones: {token: user_dto}

    def hash_password(self, password: str) -> str:
        """
        Hashea una contraseña usando bcrypt con salt.
        
        Args:
            password: Contraseña en texto plano
            
        Returns:
            str: Hash de la contraseña
        """
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """
        Verifica una contraseña contra su hash.
        
        Args:
            password: Contraseña en texto plano
            hashed: Hash almacenado
            
        Returns:
            bool: True si la contraseña es correcta
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def register_user(self, command: RegisterUserCommand) -> Tuple[bool, str, Optional[UserDto]]:
        """
        Registra un nuevo usuario en el sistema usando PostgreSQL.
        
        Args:
            command: Comando con los datos de registro
            
        Returns:
            AuthResponse: Respuesta con el resultado de la operación
        """
        try:
            # Verificar si el email ya existe
            if self._user_repository.email_exists(command.email):
                return False, "El email ya está registrado", None
            
            # Verificar si el username ya existe
            if self._user_repository.username_exists(command.username):
                return False, "El nombre de usuario ya está en uso", None
            
            # Crear nuevo usuario
            password_hash = self.hash_password(command.password)
            user_id = str(uuid4())
            now = datetime.now(timezone.utc)
            
            # Guardar en base de datos
            if not self._user_repository.create_user(user_id, command.username, command.email, password_hash, now):
                return False, "Error al crear el usuario", None
            
            # Crear DTO de respuesta
            user_dto = UserDto(
                id=user_id,
                username=command.username,
                email=command.email,
                created_at=now.isoformat()
            )
            
            # Generar token de sesión
            session_token = str(uuid4())
            self.create_session(session_token, user_dto)
            
            return True, "Usuario registrado exitosamente", user_dto
            
        except Exception:
            return False, "Error interno", None

    def authenticate_user(self, command: LoginUserCommand) -> Tuple[bool, str, Optional[UserDto]]:
        """
        Autentica un usuario existente usando PostgreSQL.
        
        Args:
            command: Comando con las credenciales de login
            
        Returns:
            AuthResponse: Respuesta con el resultado de la operación
        """
        try:
            # Buscar usuario por email
            user_data = self._user_repository.find_user_by_email(command.email)
            
            if not user_data:
                return False, "Credenciales inválidas", None
            
            # Verificar contraseña
            if not self.verify_password(command.password, user_data['password_hash']):
                return False, "Credenciales inválidas", None
            
            # Crear DTO de respuesta
            user_dto = UserDto(
                id=user_data['id'],
                username=user_data['username'],
                email=user_data['email'],
                created_at=user_data['created_at']
            )
            
            # Generar token de sesión
            session_token = str(uuid4())
            self.create_session(session_token, user_dto)
            
            return True, "Login exitoso", user_dto
            
        except Exception:
            return False, "Error interno", None

    def get_user_by_session(self, session_token: str) -> Optional[UserDto]:
        """
        Obtiene un usuario por su token de sesión.
        
        Args:
            session_token: Token de sesión del usuario
            
        Returns:
            UserDto o None si no se encuentra el usuario
        """
        # Buscar sesión activa
        if session_token in self._sessions_storage:
            return self._sessions_storage[session_token]
        return None

    def create_session(self, session_token: str, user_dto: UserDto) -> None:
        """
        Crea una nueva sesión para un usuario.
        
        Args:
            session_token: Token único de sesión
            user_dto: DTO del usuario autenticado
        """
        self._sessions_storage[session_token] = user_dto

    def destroy_session(self, session_token: str) -> bool:
        """
        Destruye una sesión activa.
        
        Args:
            session_token: Token de sesión a eliminar
            
        Returns:
            bool: True si la sesión fue eliminada, False si no existía
        """
        if session_token in self._sessions_storage:
            del self._sessions_storage[session_token]
            return True
        return False
