"""
Casos de uso relacionados con los personajes.

Este módulo contiene los casos de uso para la gestión de personajes,
incluyendo creación, edición y visualización de personajes.
"""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional

from src.application.interfaces import (
    CharacterInterface,
    AttributeInterface,
    CharacterLanguageInterface,
    CharacterProficiencyInterface,
    CharacterSkillInterface,
    CharacterSpellInterface,
    CharacterItemInterface
)


@dataclass
class GetCharacterDataRequest:
    """Clase para solicitar datos necesarios para crear un personaje."""
    pass


@dataclass
class CreateCharacterRequest:
    """Clase para solicitar la creación de un nuevo personaje."""
    name: str
    race_id: int
    background_id: int
    alignment_id: int
    level: int
    description: Optional[str] = None
    attributes: Optional[Dict[str, int]] = None
    skills: Optional[List[int]] = None
    languages: Optional[List[int]] = None
    proficiencies: Optional[List[int]] = None
    spells: Optional[List[int]] = None
    items: Optional[List[int]] = None
    
    def __post_init__(self):
        """Inicializa campos que son None como colecciones vacías."""
        if self.attributes is None:
            self.attributes = {}
        if self.skills is None:
            self.skills = []
        if self.languages is None:
            self.languages = []
        if self.proficiencies is None:
            self.proficiencies = []
        if self.spells is None:
            self.spells = []
        if self.items is None:
            self.items = []


class GetCharacterDataUseCase:
    """Caso de uso para obtener los datos necesarios para crear un personaje."""
    
    def __init__(self, race_repository, background_repository, alignment_repository,
                 skill_repository, language_repository, proficiency_repository,
                 spell_repository, item_repository):
        self.race_repository = race_repository
        self.background_repository = background_repository
        self.alignment_repository = alignment_repository
        self.skill_repository = skill_repository
        self.language_repository = language_repository
        self.proficiency_repository = proficiency_repository
        self.spell_repository = spell_repository
        self.item_repository = item_repository
    
    async def execute(self, request: GetCharacterDataRequest) -> Dict[str, List[Any]]:
        """
        Obtiene todos los datos necesarios para crear un personaje.
        
        Args:
            request: Solicitud para obtener los datos
            
        Returns:
            Dict[str, List[Any]]: Diccionario con todos los datos necesarios
        """
        races = await self.race_repository.get_all()
        backgrounds = await self.background_repository.get_all()
        alignments = await self.alignment_repository.get_all()
        skills = await self.skill_repository.get_all()
        languages = await self.language_repository.get_all()
        proficiencies = await self.proficiency_repository.get_all()
        spells = await self.spell_repository.get_all()
        items = await self.item_repository.get_all()
        
        return {
            "races": races,
            "backgrounds": backgrounds,
            "alignments": alignments,
            "skills": skills,
            "languages": languages,
            "proficiencies": proficiencies,
            "spells": spells,
            "items": items
        }


class CreateCharacterUseCase:
    """Caso de uso para crear un nuevo personaje."""
    
    def __init__(self, character_repository, attribute_repository,
                 character_skill_repository, character_language_repository,
                 character_proficiency_repository, character_spell_repository,
                 character_item_repository):
        self.character_repository = character_repository
        self.attribute_repository = attribute_repository
        self.character_skill_repository = character_skill_repository
        self.character_language_repository = character_language_repository
        self.character_proficiency_repository = character_proficiency_repository
        self.character_spell_repository = character_spell_repository
        self.character_item_repository = character_item_repository
    
    async def execute(self, request: CreateCharacterRequest) -> CharacterInterface:
        """
        Crea un nuevo personaje con todos sus datos asociados.
        
        Args:
            request: Datos del personaje a crear
            
        Returns:
            Character: El personaje creado
        """
        # Crear el personaje principal
        character = CharacterInterface(
            id=None,  # ID generado por la BD
            name=request.name,
            race_id=request.race_id,
            background_id=request.background_id,
            alignment_id=request.alignment_id,
            level=request.level,
            description=request.description or ""
        )
        
        # Guardar el personaje para obtener el ID
        created_character = await self.character_repository.create(character)
        
        # Crear y guardar los atributos
        if request.attributes:
            for name, value in request.attributes.items():
                attribute = AttributeInterface(
                    id=None,
                    character_id=created_character.id,
                    name=name,
                    value=value
                )
                await self.attribute_repository.create(attribute)
        
        # Crear y guardar las habilidades
        if request.skills:
            for skill_id in request.skills:
                character_skill = CharacterSkillInterface(
                    id=None,
                    character_id=created_character.id,
                    skill_id=skill_id,
                    proficiency=True
                )
                await self.character_skill_repository.create(character_skill)
        
        # Crear y guardar los idiomas
        if request.languages:
            for language_id in request.languages:
                character_language = CharacterLanguageInterface(
                    id=None,
                    character_id=created_character.id,
                    language_id=language_id
                )
                await self.character_language_repository.create(character_language)
        
        # Crear y guardar las competencias
        if request.proficiencies:
            for proficiency_id in request.proficiencies:
                character_proficiency = CharacterProficiencyInterface(
                    id=None,
                    character_id=created_character.id,
                    proficiency_id=proficiency_id
                )
                await self.character_proficiency_repository.create(character_proficiency)
        
        # Crear y guardar los hechizos
        if request.spells:
            for spell_id in request.spells:
                character_spell = CharacterSpellInterface(
                    id=None,
                    character_id=created_character.id,
                    spell_id=spell_id
                )
                await self.character_spell_repository.create(character_spell)
        
        # Crear y guardar los objetos
        if request.items:
            for item_id in request.items:
                character_item = CharacterItemInterface(
                    id=None,
                    character_id=created_character.id,
                    item_id=item_id,
                    quantity=1  # Valor por defecto
                )
                await self.character_item_repository.create(character_item)
        
        return created_character
