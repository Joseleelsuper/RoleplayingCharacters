from dataclasses import dataclass
from uuid import UUID


@dataclass
class CharacterSkill:
    character_id: UUID
    skill_id: UUID
    proficiency_bonus: int
