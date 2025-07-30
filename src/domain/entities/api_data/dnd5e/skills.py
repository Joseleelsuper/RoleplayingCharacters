from dataclasses import dataclass
from typing import List

from src.domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class AbilityScoreRef:
    index: str
    name: str
    url: str


@dataclass
class Skills:
    count: int
    results: List[ResultsTemplate]

    def __post_init__(self):
        if self.results and isinstance(self.results[0], dict):
            self.results = [ResultsTemplate(**result) for result in self.results]


@dataclass
class Skill:
    index: str
    name: str
    desc: List[str]
    ability_score: AbilityScoreRef
    url: str
    updated_at: str
