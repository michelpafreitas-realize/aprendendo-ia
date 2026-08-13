#!/usr/bin/env python3
"""Entrada do AI-NATIVE LAB."""

from core.engine import GameEngine
from core.models import Chapter
from core.storage import ProgressStore
from core.ui import TerminalUI
from chapters.chapter_01 import run as run_chapter_01


def main() -> None:
    ui = TerminalUI()
    store = ProgressStore()
    chapters = [Chapter("01", "Pensar em Sistemas", run_chapter_01)]
    GameEngine(ui=ui, store=store, chapters=chapters).run()


if __name__ == "__main__":
    main()

