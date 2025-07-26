from typing import List
from dataclasses import dataclass

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class ProficiencyRef:
    index: str
    name: str
    url: str


@dataclass
class AbilityScoreRef:
    index: str
    name: str
    url: str


@dataclass
class SavingThrowRef:
    index: str
    name: str
    url: str


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
class OptionReference:
    option_type: str
    item: ProficiencyRef


@dataclass
class OptionCountedReference:
    option_type: str
    count: int
    of: EquipmentRef


@dataclass
class EquipmentCategoryRef:
    index: str
    name: str
    url: str


@dataclass
class ChoiceFromEquipmentCategory:
    desc: str
    choose: int
    type: str
    from_: EquipmentCategoryRef


@dataclass
class Choice:
    option_type: str
    choice: ChoiceFromEquipmentCategory


@dataclass
class OptionSet:
    option_set_type: str
    options: List[OptionReference]


@dataclass
class ProficiencyChoice:
    desc: str
    choose: int
    type: str
    from_: OptionSet


@dataclass
class StartingEquipmentOption:
    desc: str
    choose: int
    type: str
    from_: OptionSet


@dataclass
class MultiClassingPrerequisite:
    ability_score: AbilityScoreRef
    minimum_score: int


@dataclass
class MultiClassing:
    prerequisites: List[MultiClassingPrerequisite]
    proficiencies: List[ProficiencyRef]


@dataclass
class SubclassRef:
    index: str
    name: str
    url: str


@dataclass
class Classes:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Class:
    index: str
    name: str
    hit_die: int
    proficiency_choices: List[ProficiencyChoice]
    proficiencies: List[ProficiencyRef]
    saving_throws: List[SavingThrowRef]
    starting_equipment: List[StartingEquipment]
    starting_equipment_options: List[StartingEquipmentOption]
    class_levels: str
    multi_classing: MultiClassing
    subclasses: List[SubclassRef]
    url: str
    updated_at: str
