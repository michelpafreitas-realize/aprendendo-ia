"""Capítulo 01: Pensar em Sistemas.

O conteúdo é intencionalmente independente do motor. Um próximo capítulo pode
seguir o mesmo contrato: ``run(player, ui)``.
"""

from core.models import Player
from core.ui import TerminalUI


MISSION_IDS = [
    "intent",
    "spec",
    "decomposition",
    "agents",
    "validation",
    "boss",
]


def _done(player: Player, mission_id: str) -> bool:
    return mission_id in player.completed_missions


def _complete(player: Player, mission_id: str, xp: int) -> None:
    player.earn(xp, mission_id)


def _header(ui: TerminalUI, player: Player, current: int) -> None:
    ui.clear()
    ui.title("CAPÍTULO 01 / PENSAR EM SISTEMAS", "O OPERADOR E A MÁQUINA", f"nível {player.level} · missão {current}/6")
    ui.progress(current - 1, 6)


def run(player: Player, ui: TerminalUI) -> None:
    """Executa o capítulo inteiro; pode ser repetido sem perder progresso."""
    _intro(player, ui)
    if not _mission_intent(player, ui):
        return
    if not _mission_spec(player, ui):
        return
    if not _mission_decomposition(player, ui):
        return
    if not _mission_agents(player, ui):
        return
    if not _mission_validation(player, ui):
        return
    if _boss(player, ui):
        player.earn(0, "chapter:01")


def _intro(player: Player, ui: TerminalUI) -> None:
    _header(ui, player, 1)
    ui.type_line("  O futuro não precisa de mais gente apertando botões mais rápido.", color=ui.CYAN)
    ui.type_line("  Precisa de gente capaz de orientar sistemas inteligentes.", color=ui.WHITE)
    ui.panel("PROTOCOLO DO CAPÍTULO", [
        "Você vai aprender a:                               ",
        "  → declarar uma intenção que a IA consiga executar ",
        "  → cortar um problema em fatias testáveis          ",
        "  → montar uma equipe de agentes                    ",
        "  → desconfiar de resultados que parecem bons       ",
    ], ui.BLUE)
    ui.write("\n  Não existe aula para assistir. Só decisões para tomar.")
    ui.pause("entre no laboratório")


def _mission_intent(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 1)
    ui.panel("PORTAL DA INTENÇÃO", [
        "Uma pessoa diz:                                      ",
        '"Quero uma plataforma de estudos com IA."             ',
        "                                                      ",
        "A frase aponta para uma direção, mas ainda não guia   ",
        "nenhum agente de produção. Qual próximo passo é melhor?",
    ], ui.MAGENTA)
    choice = ui.choose("O que você faz com a intenção?", [
        "Pedir para a IA começar a escrever o código.",
        "Perguntar: para quem, qual transformação e como saberemos que funcionou?",
        "Escolher primeiro o framework mais moderno.",
    ])
    if choice is None:
        return False
    if choice == 1:
        ui.feedback(True, "DIREÇÃO ENCONTRADA", [
            "Intenção é uma bússola; produção precisa de destino.",
            "Você adicionou usuário, transformação e evidência.",
            "Essa é a matéria-prima de uma boa especificação.",
        ], 100)
        _complete(player, "intent", 100)
    else:
        ui.feedback(False, "A IA RECEBEU UM NEVOEIRO", [
            "Código ou ferramenta antes do resultado cria movimento sem direção.",
            "Volte sempre para: quem muda, o que muda e qual prova esperamos.",
        ], 40)
        _complete(player, "intent", 40)
    ui.pause()
    return True


def _mission_spec(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 2)
    ui.panel("FORJA DA ESPECIFICAÇÃO", [
        "Objetivo: criar um tutor de programação por IA.",
        "A IA pergunta qual formato deve produzir.",
        "Qual especificação deixa menos espaço para adivinhação?",
    ], ui.YELLOW)
    choice = ui.choose("Escolha o pacote de instruções", [
        "Faça um tutor incrível, moderno e fácil de usar.",
        "Para iniciantes: gerar uma missão curta, exigir uma decisão do aluno e explicar o porquê em até 80 palavras.",
        "Use Python, banco de dados e uma interface bonita.",
    ])
    if choice is None:
        return False
    if choice == 1:
        ui.feedback(True, "CONTRATO ACEITO", [
            "A especificação trouxe público, ação, saída e limite.",
            "Limites não diminuem a IA: aumentam a chance de obter algo útil.",
        ], 100)
        _complete(player, "spec", 100)
    else:
        ui.feedback(False, "ESPECIFICAÇÃO FRÁGIL", [
            "Adjetivos e lista de tecnologias não definem uma experiência.",
            "Inclua comportamento observável e critérios de aceitação.",
        ], 40)
        _complete(player, "spec", 40)
    ui.pause()
    return True


def _mission_decomposition(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 3)
    ui.panel("MAPA DE DECOMPOSIÇÃO", [
        "O produto: um simulador de entrevista com um agente de IA.",
        "Você tem uma tarde para criar o primeiro protótipo.",
        "Qual mapa reduz risco e entrega uma fatia real?",
    ], ui.CYAN)
    choice = ui.choose("Escolha a ordem de ataque", [
        "Construir login → pagamentos → painel → simulação.",
        "Definir toda a arquitetura → escolher stack → depois pensar na experiência.",
        "Uma simulação simples → registrar resposta → gerar feedback → testar com uma pessoa.",
    ])
    if choice is None:
        return False
    if choice == 2:
        ui.feedback(True, "FATIA VIVA", [
            "Você colocou o ciclo de valor antes da infraestrutura.",
            "Cada etapa produz algo que pode ser observado e criticado.",
            "Problemas grandes ficam menores quando o aprendizado é rápido.",
        ], 120)
        _complete(player, "decomposition", 120)
    else:
        ui.feedback(False, "MAPA SEM CHEGADA", [
            "Partes isoladas podem consumir tempo sem provar o valor.",
            "Procure a menor fatia que atravessa a experiência inteira.",
        ], 40)
        _complete(player, "decomposition", 40)
    ui.pause()
    return True


def _mission_agents(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 4)
    ui.panel("SALA DE AGENTES", [
        "Você tem quatro agentes disponíveis:",
        "  👁 EXPLORADOR  · encontra contexto e riscos",
        "  🔨 CONSTRUTOR  · produz uma primeira versão",
        "  🧪 CRÍTICO      · tenta quebrar a solução",
        "  🧭 SINTETIZADOR · organiza decisões e próximos passos",
    ], ui.BLUE)
    choice = ui.choose("Qual sequência é mais segura?", [
        "Construtor sozinho até terminar; revisão no final.",
        "Explorador → Construtor → Crítico → Sintetizador.",
        "Crítico primeiro, sem contexto, para garantir rigor.",
    ])
    if choice is None:
        return False
    if choice == 1:
        ui.feedback(True, "EQUIPE ORQUESTRADA", [
            "Cada agente tem um papel, uma entrada e um tipo de saída.",
            "A crítica acontece antes de você confundir protótipo com produto.",
            "Orquestrar não é delegar tudo: é desenhar o fluxo de decisões.",
        ], 120)
        _complete(player, "agents", 120)
    else:
        ui.feedback(False, "AGENTES SEM CONTEXTO", [
            "Um agente poderoso ainda pode acelerar uma direção errada.",
            "Defina papéis e faça as saídas alimentarem a próxima etapa.",
        ], 40)
        _complete(player, "agents", 40)
    ui.pause()
    return True


def _mission_validation(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 5)
    ui.panel("ARENA DA VALIDAÇÃO", [
        "A IA entregou um plano muito convincente para seu produto.",
        "Ele tem palavras certas, estrutura limpa e parece pronto.",
        "Qual é a primeira reação de um produtor AI-native?",
    ], ui.RED)
    choice = ui.choose("Escolha seu próximo movimento", [
        "Publicar: a resposta está bem escrita, então deve estar correta.",
        "Pedir uma resposta ainda mais longa para aumentar a confiança.",
        "Criar exemplos, casos-limite e um teste pequeno contra o mundo real.",
    ])
    if choice is None:
        return False
    if choice == 2:
        ui.feedback(True, "REALIDADE DETECTADA", [
            "Fluência é aparência; evidência é confiança.",
            "Teste o caminho feliz, o caminho estranho e o caso que você teme.",
            "Validação transforma uma geração em uma decisão responsável.",
        ], 120)
        _complete(player, "validation", 120)
    else:
        ui.feedback(False, "RESPOSTA BONITA DEMAIS", [
            "A IA pode estar certa, errada ou inventando com muita segurança.",
            "A pergunta seguinte deve ser: como verificamos isso?",
        ], 40)
        _complete(player, "validation", 40)
    ui.pause()
    return True


def _boss(player: Player, ui: TerminalUI) -> bool:
    _header(ui, player, 6)
    ui.panel("BOSS · A PRIMEIRA PRODUÇÃO", [
        "Agora você vai usar o sistema, não apenas reconhecer conceitos.",
        "Escolha uma ideia que gostaria de produzir com IA.",
        "O laboratório vai convertê-la em um brief de primeira versão.",
    ], ui.MAGENTA)
    idea = ui.text_input("Descreva sua ideia em uma frase", player.project_idea or "um laboratório de estudos com IA")
    player.project_idea = idea
    audience = ui.choose("Quem precisa sentir a mudança primeiro?", [
        "Eu mesmo, para resolver um problema recorrente.",
        "Uma pessoa específica com uma necessidade clara.",
        "Todo mundo que possa achar interessante.",
    ])
    if audience is None:
        return False
    audience_labels = ["você", "uma pessoa específica", "um público amplo"]
    proof = ui.choose("Que evidência faria você acreditar que funcionou?", [
        "A interface parece profissional.",
        "A pessoa completa uma tarefa concreta mais rápido ou melhor.",
        "A IA diz que a solução está pronta.",
    ])
    if proof is None:
        return False
    proof_labels = ["a aparência", "uma tarefa concreta", "a opinião da IA"]
    player.project_spec = {
        "ideia": idea,
        "primeiro_usuario": audience_labels[audience],
        "evidencia": proof_labels[proof],
        "primeira_fatia": "um fluxo completo pequeno, observável e testável",
        "agentes": "explorar → construir → criticar → sintetizar",
    }
    _complete(player, "boss", 200)
    if "ARQUITETO DE INTENÇÕES" not in player.badges:
        player.badges.append("ARQUITETO DE INTENÇÕES")
    _header(ui, player, 6)
    ui.panel("BRIEF MATERIALIZADO", [
        f"IDEIA:       {idea[:45]}",
        f"PRIMEIRO:    {audience_labels[audience]}",
        f"EVIDÊNCIA:   {proof_labels[proof]}",
        "FATIA 01:    um fluxo completo pequeno e testável",
        "ORQUESTRA:   explorar → construir → criticar → sintetizar",
    ], ui.GREEN)
    ui.write("\n  Você não aprendeu a pedir código. Aprendeu a criar direção.")
    ui.write("  O próximo capítulo pode ensinar como transformar este brief em um sistema vivo.")
    ui.write(f"\n  TOTAL: {player.xp} XP   ·   INSÍGNIA: ARQUITETO DE INTENÇÕES")
    ui.pause("salvar sua primeira produção")
    return True
