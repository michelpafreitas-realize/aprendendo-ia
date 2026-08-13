import os
import sys
import time
import textwrap
from typing import Iterable, Optional


class TerminalUI:
    """Camada visual: ANSI com fallback legível para terminais simples."""

    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    CYAN = "\033[96m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    MAGENTA = "\033[95m"
    WHITE = "\033[97m"

    def __init__(self, input_fn=input, output=None) -> None:
        self.input_fn = input_fn
        self.output = output or sys.stdout
        self.color = self.output.isatty() and os.environ.get("NO_COLOR") is None

    def _paint(self, text: str, color: str) -> str:
        return f"{color}{text}{self.RESET}" if self.color else text

    def clear(self) -> None:
        self.write("\033[2J\033[H" if self.color else "\n" * 2, end="")

    def write(self, text: str = "", end: str = "\n") -> None:
        self.output.write(text + end)
        self.output.flush()

    def pause(self, prompt: str = "Pressione Enter para continuar") -> None:
        self.input_fn(f"\n{self._paint('↳ ' + prompt, self.DIM)} ")

    def type_line(self, text: str, delay: float = 0.0, color: str = "") -> None:
        decorated = self._paint(text, color) if color else text
        if delay <= 0 or not self.color:
            self.write(decorated)
            return
        for char in decorated:
            self.write(char, end="")
            time.sleep(delay)
        self.write()

    def title(self, eyebrow: str, heading: str, subheading: str = "") -> None:
        self.write()
        self.write(self._paint("╭────────────────────────────────────────────────────────────╮", self.CYAN))
        self.write(self._paint(f"│  {eyebrow:<58}│", self.CYAN))
        self.write(self._paint(f"│  {heading:<58}│", self.BOLD + self.WHITE))
        if subheading:
            self.write(self._paint(f"│  {subheading:<58}│", self.DIM))
        self.write(self._paint("╰────────────────────────────────────────────────────────────╯", self.CYAN))

    def panel(self, heading: str, lines: Iterable[str], color: str = "") -> None:
        wrapped = []
        for line in lines:
            wrapped.extend(textwrap.wrap(str(line), width=56, replace_whitespace=False) or [""])
        self.write(self._paint(f"\n┌─ {heading} " + "─" * max(1, 55 - len(heading)) + "┐", color or self.BLUE))
        for line in wrapped:
            self.write(f"│ {line:<58}│")
        self.write(self._paint("└" + "─" * 60 + "┘", color or self.BLUE))

    def progress(self, current: int, total: int, width: int = 28) -> None:
        filled = int(width * current / max(total, 1))
        bar = "█" * filled + "░" * (width - filled)
        self.write(self._paint(f"\n[{bar}] {current}/{total}", self.GREEN))

    def choose(self, question: str, options: list[str], allow_quit: bool = True) -> Optional[int]:
        self.write(self._paint(f"\n◆ {question}", self.BOLD + self.WHITE))
        for index, option in enumerate(options, 1):
            self.write(self._paint(f"  [{index}] ", self.CYAN) + option)
        suffix = " (q para sair)" if allow_quit else ""
        while True:
            answer = self.input_fn(self._paint(f"\n  sua decisão{suffix}: ", self.YELLOW)).strip().lstrip("\ufeff").lower()
            if allow_quit and answer == "q":
                return None
            if answer.isdigit() and 1 <= int(answer) <= len(options):
                return int(answer) - 1
            self.write(self._paint("  Escolha uma opção válida.", self.RED))

    def text_input(self, prompt: str, default: str = "") -> str:
        answer = self.input_fn(self._paint(f"\n◆ {prompt}: ", self.YELLOW)).strip().lstrip("\ufeff")
        return answer or default

    def feedback(self, good: bool, title: str, lines: Iterable[str], xp: int = 0) -> None:
        color = self.GREEN if good else self.YELLOW
        symbol = "✓" if good else "△"
        self.panel(f"{symbol} {title}", lines, color)
        if xp:
            self.write(self._paint(f"  +{xp} XP", self.MAGENTA))
