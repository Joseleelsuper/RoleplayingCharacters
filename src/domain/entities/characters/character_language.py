from dataclasses import dataclass
from uuid import UUID


@dataclass
class CharacterLanguage:
    character_id: UUID
    language_id: UUID
