from sqlalchemy import Column, String, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from .base import Base


class RaceModel(Base):
    __tablename__ = "races"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)
    trait_json = Column(JSON)
