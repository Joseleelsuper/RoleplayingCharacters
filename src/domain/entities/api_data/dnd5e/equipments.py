from dataclasses import dataclass
from typing import List

from src.domain.entities.api_data.dnd5e.dnd5e import ResultsTemplate


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

    def __post_init__(self):
        if self.results and isinstance(self.results[0], dict):
            self.results = [ResultsTemplate(**result) for result in self.results]


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
