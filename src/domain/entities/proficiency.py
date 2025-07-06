from dataclasses import dataclass
from uuid import UUID
from typing import Optional


@dataclass
class Proficiency:
    id: UUID
    name: str
    description: Optional[str]
