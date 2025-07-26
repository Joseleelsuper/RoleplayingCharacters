from typing import List
from dataclasses import dataclass

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class AbilityScoreRef:
    index: str
    name: str
    url: str


@dataclass
class AbilityBonus:
    ability_score: AbilityScoreRef
    bonus: int


@dataclass
class LanguageRef:
    index: str
    name: str
    url: str


@dataclass
class TraitRef:
    index: str
    name: str
    url: str


@dataclass
class SubraceRef:
    index: str
    name: str
    url: str


@dataclass
class Races:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Race:
    index: str
    name: str
    speed: int
    ability_bonuses: List[AbilityBonus]
    alignment: str
    age: str
    size: str
    size_description: str
    starting_proficiencies: List[ResultsTemplate]
    languages: List[LanguageRef]
    language_desc: str
    traits: List[TraitRef]
    subraces: List[SubraceRef]
    url: str
    updated_at: str
