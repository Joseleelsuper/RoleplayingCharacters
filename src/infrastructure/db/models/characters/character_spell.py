from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..base import Base


class CharacterSpellModel(Base):
    __tablename__ = "character_spells"
    character_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("characters.id"), primary_key=True
    )
    spell_id = Column(PG_UUID(as_uuid=True), ForeignKey("spells.id"), primary_key=True)
    level_slot = Column(Integer, nullable=False)
    prepared_flag = Column(Boolean, nullable=False, default=False)
