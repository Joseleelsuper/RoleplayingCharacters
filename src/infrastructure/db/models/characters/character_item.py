from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..base import Base


class CharacterItemModel(Base):
    __tablename__ = "character_items"
    character_id = Column(
        PG_UUID(as_uuid=True), ForeignKey("characters.id"), primary_key=True
    )
    item_id = Column(PG_UUID(as_uuid=True), ForeignKey("items.id"), primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)
    equipped_flag = Column(Boolean, nullable=False, default=False)
