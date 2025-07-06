from dataclasses import dataclass
from uuid import UUID


@dataclass
class CharacterItem:
    character_id: UUID
    item_id: UUID
    quantity: int
    equipped_flag: bool
