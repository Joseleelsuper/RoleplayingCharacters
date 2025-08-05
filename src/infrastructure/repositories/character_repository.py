from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional
from uuid import UUID

from ..db.models import (
    CharacterModel,
    AttributeModel,
    CharacterSkillModel,
    CharacterLanguageModel,
    CharacterProficiencyModel,
    CharacterItemModel,
    CharacterSpellModel,
    UserModel
)
from ...domain.schemas.character import (
    CharacterCreate,
    CharacterSearchRequest,
    CharacterResponse,
    CharacterListResponse
)


class CharacterRepository:
    """Repositorio para operaciones de personajes en la base de datos"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_character(self, character_data: CharacterCreate, user_id: Optional[UUID] = None) -> CharacterModel:
        """Crea un nuevo personaje en la base de datos"""
        
        # Crear el personaje principal
        character = CharacterModel(
            user_id=user_id,
            name=character_data.name,
            player_name=character_data.player_name,
            level=character_data.level,
            alignment_id=character_data.alignment_id,
            race_id=character_data.race_id,
            class_id=character_data.class_id,
            background_id=character_data.background_id,
            experience=character_data.experience,
            is_anonymous=character_data.is_anonymous or user_id is None
        )
        
        self.db.add(character)
        self.db.flush()  # Para obtener el ID del personaje
        
        # Crear atributos si se proporcionan
        if character_data.attributes:
            attributes = AttributeModel(
                character_id=character.id,
                strength=character_data.attributes.strength,
                dexterity=character_data.attributes.dexterity,
                constitution=character_data.attributes.constitution,
                intelligence=character_data.attributes.intelligence,
                wisdom=character_data.attributes.wisdom,
                charisma=character_data.attributes.charisma
            )
            self.db.add(attributes)
        
        # Crear habilidades
        for skill_data in character_data.skills:
            skill = CharacterSkillModel(
                character_id=character.id,
                skill_id=skill_data.skill_id,
                proficiency_bonus=skill_data.proficiency_bonus
            )
            self.db.add(skill)
        
        # Crear idiomas
        for language_data in character_data.languages:
            language = CharacterLanguageModel(
                character_id=character.id,
                language_id=language_data.language_id
            )
            self.db.add(language)
        
        # Crear competencias
        for proficiency_data in character_data.proficiencies:
            proficiency = CharacterProficiencyModel(
                character_id=character.id,
                proficiency_id=proficiency_data.proficiency_id
            )
            self.db.add(proficiency)
        
        # Crear objetos
        for item_data in character_data.items:
            item = CharacterItemModel(
                character_id=character.id,
                item_id=item_data.item_id,
                quantity=item_data.quantity,
                equipped_flag=item_data.equipped_flag
            )
            self.db.add(item)
        
        # Crear hechizos
        for spell_data in character_data.spells:
            spell = CharacterSpellModel(
                character_id=character.id,
                spell_id=spell_data.spell_id,
                level_slot=spell_data.level_slot,
                prepared_flag=spell_data.prepared_flag
            )
            self.db.add(spell)
        
        self.db.commit()
        self.db.refresh(character)
        
        return character
    
    def get_character_by_id(self, character_id: UUID) -> Optional[CharacterModel]:
        """Obtiene un personaje por su ID"""
        return self.db.query(CharacterModel).options(
            joinedload(CharacterModel.attributes),
            joinedload(CharacterModel.user)
        ).filter(CharacterModel.id == character_id).first()
    
    def get_characters_by_user(self, user_id: UUID, page: int = 1, page_size: int = 20) -> CharacterListResponse:
        """Obtiene los personajes de un usuario específico"""
        query = self.db.query(CharacterModel).filter(
            CharacterModel.user_id == user_id
        ).options(
            joinedload(CharacterModel.attributes),
            joinedload(CharacterModel.user)
        )
        
        total = query.count()
        characters = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return CharacterListResponse(
            characters=[self._character_to_response(char) for char in characters],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
    
    def search_characters(self, search_request: CharacterSearchRequest) -> CharacterListResponse:
        """Busca personajes según los criterios especificados"""
        query = self.db.query(CharacterModel).options(
            joinedload(CharacterModel.attributes),
            joinedload(CharacterModel.user)
        )
        
        # Filtro por término de búsqueda (nombre del personaje o jugador)
        if search_request.query:
            search_term = f"%{search_request.query}%"
            query = query.filter(
                or_(
                    CharacterModel.name.ilike(search_term),
                    CharacterModel.player_name.ilike(search_term)
                )
            )
        
        # Filtro por raza
        if search_request.race_id:
            query = query.filter(CharacterModel.race_id == search_request.race_id)
        
        # Filtro por clase
        if search_request.class_id:
            query = query.filter(CharacterModel.class_id == search_request.class_id)
        
        # Filtro por nivel
        if search_request.level_min:
            query = query.filter(CharacterModel.level >= search_request.level_min)
        if search_request.level_max:
            query = query.filter(CharacterModel.level <= search_request.level_max)
        
        # Filtro para incluir/excluir personajes anónimos
        if not search_request.include_anonymous:
            query = query.filter(CharacterModel.is_anonymous == False)
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(CharacterModel.created_at.desc())
        
        total = query.count()
        characters = query.offset(
            (search_request.page - 1) * search_request.page_size
        ).limit(search_request.page_size).all()
        
        return CharacterListResponse(
            characters=[self._character_to_response(char) for char in characters],
            total=total,
            page=search_request.page,
            page_size=search_request.page_size,
            total_pages=(total + search_request.page_size - 1) // search_request.page_size
        )
    
    def get_public_characters(self, page: int = 1, page_size: int = 20) -> CharacterListResponse:
        """Obtiene todos los personajes públicos (para el buscador general)"""
        query = self.db.query(CharacterModel).options(
            joinedload(CharacterModel.attributes),
            joinedload(CharacterModel.user)
        ).order_by(CharacterModel.created_at.desc())
        
        total = query.count()
        characters = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return CharacterListResponse(
            characters=[self._character_to_response(char) for char in characters],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
    
    def delete_character(self, character_id: UUID, user_id: Optional[UUID] = None) -> bool:
        """Elimina un personaje (solo si pertenece al usuario o es anónimo)"""
        query = self.db.query(CharacterModel).filter(CharacterModel.id == character_id)
        
        # Si se proporciona user_id, verificar que el personaje pertenezca al usuario
        if user_id:
            query = query.filter(CharacterModel.user_id == user_id)
        else:
            # Si no hay user_id, solo permitir eliminar personajes anónimos
            query = query.filter(CharacterModel.is_anonymous == True)
        
        character = query.first()
        if character:
            self.db.delete(character)
            self.db.commit()
            return True
        return False
    
    def _character_to_response(self, character: CharacterModel) -> CharacterResponse:
        """Convierte un modelo de personaje a respuesta"""
        return CharacterResponse(
            id=character.id,
            user_id=character.user_id,
            name=character.name,
            player_name=character.player_name,
            level=character.level,
            alignment_id=character.alignment_id,
            race_id=character.race_id,
            class_id=character.class_id,
            background_id=character.background_id,
            experience=character.experience,
            is_anonymous=character.is_anonymous,
            created_at=character.created_at,
            updated_at=character.updated_at,
            username=character.user.username if character.user else "Anónimo"
        )