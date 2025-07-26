from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class Proficiencies:
    count: int
    results: List[ResultsTemplate]


@dataclass
class ReferenceRef:
    index: str
    name: str
    url: str


@dataclass
class Proficiency:
    index: str
    type: str
    name: str
    classes: List[ResultsTemplate]
    races: List[ResultsTemplate]
    url: str
    reference: ReferenceRef
    updated_at: str
