"""
Casos de uso de autenticación para el dominio de usuarios.

Este módulo contiene los casos de uso relacionados con autenticación de usuarios,
siguiendo el patrón de arquitectura hexagonal donde los casos de uso están en la
capa de aplicación y orquestan las operaciones del dominio.
"""

import logging
from typing import Optional
from uuid import uuid4, UUID
from datetime import datetime

import bcrypt
from sqlalchemy import text, exists

from ..contracts import (
    RegisterUserCommand,
    LoginUserCommand,
    UserDto,
    AuthResponse
)
from ..infrastructure.db.database import SessionLocal
from ..infrastructure.db.models.user import UserModel

logger = logging.getLogger(__name__)


class UserRepository:
    """
    Repositorio para operaciones de usuarios con PostgreSQL usando consultas preparadas.
    
    Utiliza SQLAlchemy ORM y consultas preparadas explícitas para máxima seguridad
    y rendimiento, evitando inyección SQL y optimizando las consultas.
    """
    
    def __init__(self):
        pass
    
    def email_exists(self, email: str) -> bool:
        """
        Verifica si un email ya existe en la base de datos usando consulta preparada.
        
        Args:
            email: Email a verificar
            
        Returns:
            bool: True si el email existe, False en caso contrario
        """
        try:
            with SessionLocal() as db:
                # Usar exists() para optimizar la consulta - solo verifica existencia
                result = db.query(
                    exists().where(UserModel.email == email)
                ).scalar()
                return result
        except Exception as e:
            logger.error(f"Error verificando email: {e}")
            return False
    
    def username_exists(self, username: str) -> bool:
        """
        Verifica si un nombre de usuario ya existe usando consulta preparada.
        
        Args:
            username: Nombre de usuario a verificar
            
        Returns:
            bool: True si el username existe, False en caso contrario
        """
        try:
            with SessionLocal() as db:
                # Usar exists() para optimizar la consulta - solo verifica existencia
                result = db.query(
                    exists().where(UserModel.username == username)
                ).scalar()
                return result
        except Exception as e:
            logger.error(f"Error verificando username: {e}")
            return False
    
    def create_user(self, user_id: str, username: str, email: str, password_hash: str, created_at: datetime) -> bool:
        """
        Crea un nuevo usuario en la base de datos usando consulta preparada.
        
        Args:
            user_id: ID único del usuario
            username: Nombre de usuario
            email: Email del usuario
            password_hash: Hash de la contraseña
            created_at: Fecha de creación
            
        Returns:
            bool: True si se creó exitosamente, False en caso contrario
        """
        try:
            with SessionLocal() as db:
                # Convertir string UUID a UUID object
                uuid_obj = UUID(user_id)
                
                # Usar consulta preparada con parámetros nombrados para inserción
                insert_query = text("""
                    INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
                    VALUES (:id, :username, :email, :password_hash, :created_at, :updated_at)
                """)
                
                db.execute(insert_query, {
                    'id': uuid_obj,
                    'username': username,
                    'email': email,
                    'password_hash': password_hash,
                    'created_at': created_at,
                    'updated_at': created_at
                })
                
                db.commit()
                logger.info(f"Usuario creado exitosamente: {email}")
                return True
        except Exception as e:
            logger.error(f"Error creando usuario: {e}")
            return False
    
    def find_user_by_email(self, email: str) -> Optional[dict]:
        """
        Busca un usuario por email usando consulta preparada.
        
        Args:
            email: Email del usuario a buscar
            
        Returns:
            dict: Datos del usuario si existe, None en caso contrario
        """
        try:
            with SessionLocal() as db:
                # Usar consulta preparada con parámetros nombrados
                select_query = text("""
                    SELECT id, username, email, password_hash, created_at
                    FROM users 
                    WHERE email = :email
                    LIMIT 1
                """)
                
                result = db.execute(select_query, {'email': email}).fetchone()
                
                if result:
                    return {
                        "id": str(result.id),
                        "username": result.username,
                        "email": result.email,
                        "password_hash": result.password_hash,
                        "created_at": result.created_at.isoformat()
                    }
        except Exception as e:
            logger.error(f"Error buscando usuario por email: {e}")
            
        return None
    
    def find_user_by_id(self, user_id: str) -> Optional[dict]:
        """
        Busca un usuario por ID usando consulta preparada.
        
        Args:
            user_id: ID del usuario a buscar
            
        Returns:
            dict: Datos del usuario si existe, None en caso contrario
        """
        try:
            with SessionLocal() as db:
                # Usar consulta preparada con parámetros nombrados
                select_query = text("""
                    SELECT id, username, email, created_at
                    FROM users 
                    WHERE id = :user_id
                    LIMIT 1
                """)
                
                uuid_obj = UUID(user_id)
                result = db.execute(select_query, {'user_id': uuid_obj}).fetchone()
                
                if result:
                    return {
                        "id": str(result.id),
                        "username": result.username,
                        "email": result.email,
                        "created_at": result.created_at.isoformat()
                    }
        except Exception as e:
            logger.error(f"Error buscando usuario por ID: {e}")
            
        return None


class AuthenticationService:
    """
    Servicio de autenticación que maneja los casos de uso relacionados con usuarios.
    
    Este servicio actúa como capa de aplicación, orquestando las operaciones
    del dominio usando PostgreSQL como persistencia.
    """

    def __init__(self):
        """Inicializa el servicio de autenticación."""
        self._user_repository = UserRepository()
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

    def register_user(self, command: RegisterUserCommand) -> AuthResponse:
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
                return AuthResponse(
                    success=False,
                    message="El email ya está registrado"
                )
            
            # Verificar si el username ya existe
            if self._user_repository.username_exists(command.username):
                return AuthResponse(
                    success=False,
                    message="El nombre de usuario ya está en uso"
                )
            
            # Crear nuevo usuario
            password_hash = self.hash_password(command.password)
            user_id = str(uuid4())
            now = datetime.utcnow()
            
            # Guardar en base de datos
            if not self._user_repository.create_user(user_id, command.username, command.email, password_hash, now):
                return AuthResponse(
                    success=False,
                    message="Error al crear el usuario"
                )
            
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
            
            return AuthResponse(
                success=True,
                message="Usuario registrado exitosamente",
                token=session_token,
                user=user_dto
            )
            
        except Exception as e:
            return AuthResponse(
                success=False,
                message=f"Error interno: {str(e)}"
            )

    def login_user(self, command: LoginUserCommand) -> AuthResponse:
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
                return AuthResponse(
                    success=False,
                    message="Credenciales inválidas"
                )
            
            # Verificar contraseña
            if not self.verify_password(command.password, user_data['password_hash']):
                return AuthResponse(
                    success=False,
                    message="Credenciales inválidas"
                )
            
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
            
            return AuthResponse(
                success=True,
                message="Login exitoso",
                token=session_token,
                user=user_dto
            )
            
        except Exception as e:
            return AuthResponse(
                success=False,
                message=f"Error interno: {str(e)}"
            )

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


# Instancia global del servicio de autenticación
auth_service = AuthenticationService()
