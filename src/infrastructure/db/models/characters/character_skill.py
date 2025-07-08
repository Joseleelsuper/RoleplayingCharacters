from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..base import Base


class CharacterSkillModel(Base):
    __tablename__ = "character_skills"
    character_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("characters.id"), primary_key=True
    )
    skill_id = Column(PG_UUID(as_uuid=True), ForeignKey("skills.id"), primary_key=True)
    proficiency_bonus = Column(Integer, nullable=False)
