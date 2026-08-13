import json
import tempfile
import unittest
from io import StringIO
from pathlib import Path

from core.models import Player
from core.storage import ProgressStore
from core.ui import TerminalUI


class ProgressStoreTests(unittest.TestCase):
    def test_round_trip_preserves_player(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "progress.json"
            store = ProgressStore(path)
            player = Player(name="Lia", xp=140, level=2, badges=["Teste"], project_idea="um produto")
            player.completed_missions.append("intent")
            store.save(player)
            loaded = store.load()
            self.assertEqual(loaded.name, "Lia")
            self.assertEqual(loaded.xp, 140)
            self.assertEqual(loaded.completed_missions, ["intent"])
            self.assertEqual(loaded.project_idea, "um produto")


class TerminalUITests(unittest.TestCase):
    def test_choose_accepts_a_valid_option_after_invalid_input(self):
        answers = iter(["x", "2"])
        output = StringIO()
        ui = TerminalUI(input_fn=lambda _: next(answers), output=output)
        self.assertEqual(ui.choose("teste", ["um", "dois"]), 1)
        self.assertIn("Escolha uma opção válida", output.getvalue())

    def test_player_level_scales_with_xp(self):
        player = Player()
        player.earn(250, "mission")
        self.assertEqual(player.level, 3)
        self.assertIn("mission", player.completed_missions)


if __name__ == "__main__":
    unittest.main()

