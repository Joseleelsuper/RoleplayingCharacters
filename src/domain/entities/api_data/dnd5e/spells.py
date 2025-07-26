from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class DamageTypeRef:
    index: str
    name: str
    url: str


@dataclass
class Damage:
    damage_type: DamageTypeRef
    damage_at_slot_level: dict[str, str]


@dataclass
class SchoolRef:
    index: str
    name: str
    url: str


@dataclass
class ClassRef:
    index: str
    name: str
    url: str


@dataclass
class SubclassRef:
    index: str
    name: str
    url: str


@dataclass
class Spells:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Spell:
    index: str
    name: str
    desc: list[str]
    higher_level: list[str]
    range: str
    components: list[str]
    material: str
    ritual: bool
    duration: str
    concentration: bool
    casting_time: str
    level: int
    attack_type: str
    damage: Damage
    school: SchoolRef
    classes: list[ClassRef]
    subclasses: list[SubclassRef]
    url: str
    updated_at: str
