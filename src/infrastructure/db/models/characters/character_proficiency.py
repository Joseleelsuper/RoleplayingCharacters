from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..base import Base


class CharacterProficiencyModel(Base):
    __tablename__ = "character_proficiencies"
    character_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("characters.id"), primary_key=True
    )
    proficiency_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("proficiencies.id"), primary_key=True
    )
