from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..base import Base


class CharacterLanguageModel(Base):
    __tablename__ = "character_languages"
    character_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("characters.id"), primary_key=True
    )
    language_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("languages.id"), primary_key=True
    )
