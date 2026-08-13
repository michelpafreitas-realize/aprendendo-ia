import json
from dataclasses import asdict
from pathlib import Path

from .models import Player


class ProgressStore:
    """Persistência simples e portátil, sem dependências externas."""

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or Path(__file__).resolve().parents[1] / "data" / "progress.json"

    def load(self) -> Player:
        if not self.path.exists():
            return Player()
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            return Player(
                name=data.get("name", "Operador"),
                xp=int(data.get("xp", 0)),
                level=int(data.get("level", 1)),
                completed_missions=list(data.get("completed_missions", [])),
                badges=list(data.get("badges", [])),
                project_idea=data.get("project_idea", ""),
                project_spec=dict(data.get("project_spec", {})),
            )
        except (OSError, ValueError, TypeError, json.JSONDecodeError):
            return Player()

    def save(self, player: Player) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(asdict(player), ensure_ascii=False, indent=2), encoding="utf-8")

    def reset(self) -> Player:
        player = Player()
        self.save(player)
        return player

