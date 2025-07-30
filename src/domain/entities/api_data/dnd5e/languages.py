from dataclasses import dataclass
from typing import List

from src.domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class Languages:
    count: int
    results: List[ResultsTemplate]

    def __post_init__(self):
        if self.results and isinstance(self.results[0], dict):
            self.results = [ResultsTemplate(**result) for result in self.results]


@dataclass
class Language:
    index: str
    name: str
    type: str
    typical_speakers: List[str]
    script: str
    url: str
    updated_at: str
