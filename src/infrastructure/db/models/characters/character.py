from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..base import Base


class CharacterModel(Base):
    __tablename__ = "characters"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    player_name = Column(String(100))
    level = Column(Integer, nullable=False, default=1)
    alignment_id = Column(PG_UUID(as_uuid=True), ForeignKey("alignments.id"))
    race_id = Column(PG_UUID(as_uuid=True), ForeignKey("races.id"))
    class_id = Column(PG_UUID(as_uuid=True), ForeignKey("classes.id"))
    background_id = Column(PG_UUID(as_uuid=True), ForeignKey("backgrounds.id"))
    experience = Column(BigInteger, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    user = relationship("UserModel", back_populates="characters")
    attributes = relationship(
        "AttributeModel", uselist=False, back_populates="character"
    )
