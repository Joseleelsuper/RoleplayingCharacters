from typing import List
from dataclasses import dataclass

@dataclass
class ResultsTemplate:
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
    proficiency_choices: List[object]
    proficiencies: List[object]
    saving_throws: List[object]
    starting_equipment: List[object]
    starting_equipment_options: List[object]
    class_levels: str
    multi_classing: dict[List[str], object]
    subclasses: List[object]
    url: str
    updated_at: str

@dataclass
class Spells:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Skills:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Alignments:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Backgrounds:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Languages:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Proficiencies:
    count: int
    results: List[ResultsTemplate]

@dataclass
class Equipments:
    count: int
    results: List[ResultsTemplate]