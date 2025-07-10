"""
Interfaces para la capa de aplicación.

Este módulo contiene las interfaces que utiliza la capa de aplicación
para interactuar con las entidades del dominio.
"""

from typing import Optional
from dataclasses import dataclass


@dataclass
class CharacterInterface:
    """Interfaz para la entidad Character."""
    id: Optional[int]
    name: str
    race_id: int
    background_id: int
    alignment_id: int
    level: int
    description: str


@dataclass
class AttributeInterface:
    """Interfaz para la entidad Attribute."""
    id: Optional[int]
    character_id: int
    name: str
    value: int


@dataclass
class CharacterLanguageInterface:
    """Interfaz para la entidad CharacterLanguage."""
    id: Optional[int]
    character_id: int
    language_id: int


@dataclass
class CharacterProficiencyInterface:
    """Interfaz para la entidad CharacterProficiency."""
    id: Optional[int]
    character_id: int
    proficiency_id: int


@dataclass
class CharacterSkillInterface:
    """Interfaz para la entidad CharacterSkill."""
    id: Optional[int]
    character_id: int
    skill_id: int
    proficiency: bool


@dataclass
class CharacterSpellInterface:
    """Interfaz para la entidad CharacterSpell."""
    id: Optional[int]
    character_id: int
    spell_id: int


@dataclass
class CharacterItemInterface:
    """Interfaz para la entidad CharacterItem."""
    id: Optional[int]
    character_id: int
    item_id: int
    quantity: int
