from .models import Chapter, Player
from .storage import ProgressStore
from .ui import TerminalUI


class GameEngine:
    def __init__(self, ui: TerminalUI, store: ProgressStore, chapters: list[Chapter]) -> None:
        self.ui = ui
        self.store = store
        self.chapters = chapters
        self.player = self.store.load()

    def run(self) -> None:
        self.ui.clear()
        self.ui.title("AI-NATIVE LAB / BOOT SEQUENCE", "PRODUZIR É DAR DIREÇÃO", "um laboratório jogável para a era da IA")
        self.ui.write("\n  A IA já sabe gerar muitas coisas. O diferencial agora é saber")
        self.ui.write("  escolher o que construir, organizar o trabalho e provar que funciona.")
        self.player.name = self.ui.text_input("Como devemos chamar você", self.player.name)
        self.store.save(self.player)

        while True:
            self.ui.clear()
            self._dashboard()
            options = [f"Abrir capítulo {chapter.number} — {chapter.title}" for chapter in self.chapters]
            options += ["Ver meu manifesto de produção", "Sair"]
            choice = self.ui.choose("Escolha seu próximo movimento", options, allow_quit=False)
            if choice is None or choice == len(options) - 1:
                self.ui.write("\n  Sessão encerrada. Sua próxima ideia continua esperando.\n")
                return
            if choice == len(options) - 2:
                self._manifest()
            else:
                chapter = self.chapters[choice]
                self.ui.clear()
                chapter.runner(self.player, self.ui)
                self.store.save(self.player)

    def _dashboard(self) -> None:
        self.ui.title("PAINEL DO OPERADOR", self.player.name.upper(), f"nível {self.player.level}  ·  {self.player.xp} XP")
        total = sum(1 for chapter in self.chapters for _ in [chapter])
        done = 1 if any(item.startswith("chapter:") for item in self.player.completed_missions) else 0
        self.ui.progress(done, total)
        self.ui.write("\n  MAPA DE CAPACIDADES")
        self.ui.write("  ◉ intenção       ◌ decomposição       ◌ agentes       ◌ validação")
        if self.player.badges:
            self.ui.write(f"\n  INSÍGNIAS: {' · '.join(self.player.badges)}")

    def _manifest(self) -> None:
        self.ui.clear()
        self.ui.title("REGISTRO DE CAMPO", "SEU MANIFESTO AI-NATIVE")
        lines = [
            "1. Começo pelo resultado, não pela ferramenta.",
            "2. Transformo intenção em evidência observável.",
            "3. Divido o trabalho em unidades pequenas e verificáveis.",
            "4. Uso agentes com papéis claros e contexto suficiente.",
            "5. Desconfio de respostas bonitas sem validação.",
        ]
        self.ui.panel("PRINCÍPIOS DESBLOQUEADOS", lines, self.ui.MAGENTA)
        self.ui.pause()
