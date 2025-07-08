from dataclasses import dataclass
from uuid import UUID


@dataclass
class CharacterSpell:
    character_id: UUID
    spell_id: UUID
    level_slot: int
    prepared_flag: bool
