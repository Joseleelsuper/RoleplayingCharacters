from typing import List
from dataclasses import dataclass

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate

@dataclass
class Races:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Race:
    index: str
    name: str
    speed: int
    ability_bonuses: List[
        dict[
            str, 
            dict[str, str] | int
        ]
    ]
    type: str
    typical_speakers: List[str]
    script: str
    url: str
    updated_at: str