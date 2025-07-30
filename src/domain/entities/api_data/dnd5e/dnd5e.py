from dataclasses import dataclass
from typing import Optional


@dataclass
class ResultsTemplate:
    index: str
    name: str
    url: str
    level: Optional[int] = None
