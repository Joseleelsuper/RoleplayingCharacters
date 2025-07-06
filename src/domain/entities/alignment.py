from dataclasses import dataclass
from uuid import UUID


@dataclass
class Alignment:
    id: UUID
    name: str
