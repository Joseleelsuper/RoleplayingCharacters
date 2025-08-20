from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from .base import Base


class ClassModel(Base):
    """Modelo para las clases de personajes (Fighter, Wizard, etc.)"""
    __tablename__ = "classes"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    hit_die = Column(String(10))  # e.g., "d10", "d6"
    primary_ability = Column(String(50))  # e.g., "Strength", "Intelligence"
    saving_throw_proficiencies = Column(JSON)  # Lista de saving throws
    skill_proficiencies = Column(JSON)  # Lista de habilidades disponibles
    features = Column(JSON)  # Características de clase por nivel
    
    # Relación con personajes
    characters = relationship("CharacterModel", back_populates="character_class")