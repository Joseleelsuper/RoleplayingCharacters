from dataclasses import dataclass
from typing import List, Union

from src.domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class EquipmentRef:
    index: str
    name: str
    url: str


@dataclass
class StartingEquipment:
    equipment: EquipmentRef
    quantity: int


@dataclass
class OptionString:
    option_type: str
    string: str


@dataclass
class OptionIdeal:
    option_type: str
    desc: str
    alignments: List[ResultsTemplate]


@dataclass
class OptionsArray:
    option_set_type: str
    options: List[Union[OptionString, OptionIdeal]]


@dataclass
class FromResourceList:
    option_set_type: str
    resource_list_url: str


@dataclass
class FromEquipmentCategory:
    option_set_type: str
    equipment_category: ResultsTemplate


@dataclass
class OptionFrom:
    choose: int
    type: str
    from_: Union[OptionsArray, FromResourceList, FromEquipmentCategory]


@dataclass
class Feature:
    name: str
    desc: List[str]


@dataclass
class Backgrounds:
    count: int
    results: List[ResultsTemplate]

    def __post_init__(self):
        if self.results and isinstance(self.results[0], dict):
            self.results = [ResultsTemplate(**result) for result in self.results]


@dataclass
class Background:
    index: str
    name: str
    starting_proficiencies: List[ResultsTemplate]
    language_options: OptionFrom
    starting_equipment: List[StartingEquipment]
    starting_equipment_options: List[OptionFrom]
    feature: Feature
    personality_traits: OptionFrom
    ideals: OptionFrom
    bonds: OptionFrom
    flaws: OptionFrom
    url: str
    updated_at: str
