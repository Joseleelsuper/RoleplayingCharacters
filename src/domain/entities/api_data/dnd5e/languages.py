from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class Languages:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Language:
    index: str
    name: str
    type: str
    typical_speakers: List[str]
    script: str
    url: str
    updated_at: str
