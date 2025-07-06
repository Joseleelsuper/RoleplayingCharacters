from dataclasses import dataclass
from uuid import UUID
from typing import Optional


@dataclass
class Race:
    id: UUID
    name: str
    trait_json: Optional[dict]
