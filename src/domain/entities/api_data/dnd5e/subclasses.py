from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate

@dataclass
class Subclasses:
    count: int
    results: List[ResultsTemplate]

@dataclass
class SubclassClassRef:
    index: str
    name: str
    url: str

@dataclass
class Subclass:
    index: str
    class_: SubclassClassRef
    name: str
    subclass_flavor: str
    desc: List[str]
    subclass_levels: str
    url: str
    updated_at: str
    spells: list
