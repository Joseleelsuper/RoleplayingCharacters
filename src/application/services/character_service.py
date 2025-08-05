from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from ...domain.schemas.character import (
    CharacterCreate,
    CharacterResponse,
    CharacterListResponse,
    CharacterSearchRequest
)
from ...infrastructure.repositories.character_repository import CharacterRepository
from ...infrastructure.db.database import get_db
import logging

logger = logging.getLogger(__name__)


class CharacterService:
    """Servicio para manejar la lógica de negocio de personajes"""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CharacterRepository(db)
    
    def create_character(self, character_data: CharacterCreate, user_id: Optional[UUID] = None) -> CharacterResponse:
        """
        Crea un nuevo personaje.
        
        Args:
            character_data: Datos del personaje a crear
            user_id: ID del usuario (None para personajes anónimos)
            
        Returns:
            CharacterResponse: Datos del personaje creado
        """
        try:
            # Si no hay user_id, marcar como anónimo
            if user_id is None:
                character_data.is_anonymous = True
            
            # Validar datos del personaje
            self._validate_character_data(character_data)
            
            # Crear el personaje
            character = self.repository.create_character(character_data, user_id)
            
            logger.info(f"Personaje creado: {character.id} ({'anónimo' if character.is_anonymous else f'usuario {user_id}'})")
            
            return self.repository._character_to_response(character)
            
        except Exception as e:
            logger.error(f"Error al crear personaje: {e}")
            self.db.rollback()
            raise
    
    def get_character(self, character_id: UUID) -> Optional[CharacterResponse]:
        """
        Obtiene un personaje por su ID.
        
        Args:
            character_id: ID del personaje
            
        Returns:
            CharacterResponse o None si no se encuentra
        """
        character = self.repository.get_character_by_id(character_id)
        if character:
            return self.repository._character_to_response(character)
        return None
    
    def get_user_characters(self, user_id: UUID, page: int = 1, page_size: int = 20) -> CharacterListResponse:
        """
        Obtiene los personajes de un usuario específico.
        
        Args:
            user_id: ID del usuario
            page: Número de página
            page_size: Tamaño de página
            
        Returns:
            CharacterListResponse: Lista paginada de personajes
        """
        return self.repository.get_characters_by_user(user_id, page, page_size)
    
    def search_characters(self, search_request: CharacterSearchRequest) -> CharacterListResponse:
        """
        Busca personajes según los criterios especificados.
        
        Args:
            search_request: Criterios de búsqueda
            
        Returns:
            CharacterListResponse: Lista paginada de personajes encontrados
        """
        return self.repository.search_characters(search_request)
    
    def get_public_characters(self, page: int = 1, page_size: int = 20) -> CharacterListResponse:
        """
        Obtiene todos los personajes públicos para el buscador general.
        
        Args:
            page: Número de página
            page_size: Tamaño de página
            
        Returns:
            CharacterListResponse: Lista paginada de personajes públicos
        """
        return self.repository.get_public_characters(page, page_size)
    
    def delete_character(self, character_id: UUID, user_id: Optional[UUID] = None) -> bool:
        """
        Elimina un personaje.
        
        Args:
            character_id: ID del personaje a eliminar
            user_id: ID del usuario (None para personajes anónimos)
            
        Returns:
            bool: True si se eliminó correctamente, False si no se encontró o no se tiene permiso
        """
        try:
            result = self.repository.delete_character(character_id, user_id)
            if result:
                logger.info(f"Personaje eliminado: {character_id}")
            else:
                logger.warning(f"Intento de eliminar personaje sin permisos: {character_id}")
            return result
        except Exception as e:
            logger.error(f"Error al eliminar personaje {character_id}: {e}")
            self.db.rollback()
            raise
    
    def can_user_access_character(self, character_id: UUID, user_id: Optional[UUID] = None) -> bool:
        """
        Verifica si un usuario puede acceder a un personaje específico.
        
        Args:
            character_id: ID del personaje
            user_id: ID del usuario (None para acceso anónimo)
            
        Returns:
            bool: True si puede acceder, False en caso contrario
        """
        character = self.repository.get_character_by_id(character_id)
        if not character:
            return False
        
        # Los personajes anónimos son accesibles por todos
        if character.is_anonymous:
            return True
        
        # Los personajes de usuario solo son accesibles por su propietario
        return character.user_id == user_id
    
    def _validate_character_data(self, character_data: CharacterCreate) -> None:
        """
        Valida los datos del personaje antes de crearlo.
        
        Args:
            character_data: Datos del personaje a validar
            
        Raises:
            ValueError: Si los datos no son válidos
        """
        # Validar nombre del personaje
        if not character_data.name or len(character_data.name.strip()) == 0:
            raise ValueError("El nombre del personaje es obligatorio")
        
        # Validar nivel
        if character_data.level < 1 or character_data.level > 20:
            raise ValueError("El nivel debe estar entre 1 y 20")
        
        # Validar experiencia
        if character_data.experience < 0:
            raise ValueError("La experiencia no puede ser negativa")
        
        # Validar atributos si se proporcionan
        if character_data.attributes:
            for attr_name in ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']:
                attr_value = getattr(character_data.attributes, attr_name)
                if attr_value < 1 or attr_value > 20:
                    raise ValueError(f"El atributo {attr_name} debe estar entre 1 y 20")
        
        logger.debug(f"Datos del personaje validados correctamente: {character_data.name}")


def get_character_service(db: Session = None) -> CharacterService:
    """
    Factory function para obtener una instancia del servicio de personajes.
    
    Args:
        db: Sesión de base de datos (opcional, se creará una nueva si no se proporciona)
        
    Returns:
        CharacterService: Instancia del servicio
    """
    if db is None:
        db = next(get_db())
    return CharacterService(db)