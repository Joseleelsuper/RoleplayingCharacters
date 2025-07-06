from dataclasses import dataclass
from uuid import UUID


@dataclass
class CharacterProficiency:
    character_id: UUID
    proficiency_id: UUID
