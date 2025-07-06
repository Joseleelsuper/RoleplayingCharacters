from dataclasses import dataclass
from uuid import UUID
from typing import Optional


@dataclass
class Background:
    id: UUID
    name: str
    feature: Optional[str]
