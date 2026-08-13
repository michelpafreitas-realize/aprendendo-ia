from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Any


@dataclass
class Player:
    name: str = "Operador"
    xp: int = 0
    level: int = 1
    completed_missions: List[str] = field(default_factory=list)
    badges: List[str] = field(default_factory=list)
    project_idea: str = ""
    project_spec: Dict[str, Any] = field(default_factory=dict)

    def earn(self, amount: int, mission_id: Optional[str] = None) -> None:
        self.xp += amount
        self.level = max(1, self.xp // 100 + 1)
        if mission_id and mission_id not in self.completed_missions:
            self.completed_missions.append(mission_id)


@dataclass
class Chapter:
    number: str
    title: str
    runner: Callable[[Player, Any], None]

