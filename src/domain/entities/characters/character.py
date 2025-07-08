from dataclasses import dataclass
from uuid import UUID
from datetime import datetime
from typing import Optional


@dataclass
class Character:
    id: UUID
    user_id: UUID
    name: str
    player_name: Optional[str]
    level: int
    alignment_id: Optional[UUID]
    race_id: Optional[UUID]
    class_id: Optional[UUID]
    background_id: Optional[UUID]
    experience: int
    created_at: datetime
    updated_at: datetime
