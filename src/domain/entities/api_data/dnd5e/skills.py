from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class AbilityScoreRef:
    index: str
    name: str
    url: str


@dataclass
class Skills:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Skill:
    index: str
    name: str
    desc: List[str]
    ability_score: AbilityScoreRef
    url: str
    updated_at: str
