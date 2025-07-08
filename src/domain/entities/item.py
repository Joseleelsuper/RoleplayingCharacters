from dataclasses import dataclass
from uuid import UUID
from typing import Optional


@dataclass
class Item:
    id: UUID
    name: str
    description: Optional[str]
