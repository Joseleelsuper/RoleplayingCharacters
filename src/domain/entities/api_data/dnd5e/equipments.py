from dataclasses import dataclass
from typing import List

from domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


@dataclass
class EquipmentCategoryRef:
    index: str
    name: str
    url: str


@dataclass
class GearCategoryRef:
    index: str
    name: str
    url: str


@dataclass
class Cost:
    quantity: int
    unit: str


@dataclass
class Equipments:
    count: int
    results: List[ResultsTemplate]


@dataclass
class Equipment:
    index: str
    name: str
    equipment_category: EquipmentCategoryRef
    gear_category: GearCategoryRef
    cost: Cost
    weight: float
    url: str
    updated_at: str
    desc: list
    special: list
    contents: list
    properties: list
