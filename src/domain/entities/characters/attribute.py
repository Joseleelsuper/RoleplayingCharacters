from dataclasses import dataclass
from uuid import UUID


@dataclass
class Attribute:
    character_id: UUID
    strength: int
    dexterity: int
    constitution: int
    intelligence: int
    wisdom: int
    charisma: int
