# AI-NATIVE LAB

## Capítulo 01 — Pensar em Sistemas

Um capítulo jogável para aprender produção com IA sem começar por sintaxe. Você aprende a transformar intenção em especificação, decompor problemas, orquestrar agentes e validar resultados.

O projeto usa apenas Python 3 e a biblioteca padrão. Não precisa de internet, API key ou dependências externas.

## Rodar no Ubuntu

```bash
cd ai-native-lab
chmod +x run.sh
./run.sh
```

Ou, diretamente:

```bash
python3 main.py
```

Para rodar os testes:

```bash
python3 -m unittest discover -s tests -v
```

## O que existe neste capítulo

- **Portal da intenção**: transformar um desejo vago em uma missão clara.
- **Forja da especificação**: escolher resultado, restrições e evidências de sucesso.
- **Mapa de decomposição**: quebrar um problema em fatias que podem ser produzidas e verificadas.
- **Orquestração de agentes**: decidir quando explorar, construir, criticar e sintetizar.
- **Arena da validação**: detectar respostas plausíveis, mas não confiáveis.
- **Boss final**: montar um mini-brief AI-native para um produto próprio.

## Estrutura para próximos capítulos

```text
ai-native-lab/
├── main.py                 # ponto de entrada
├── run.sh                  # inicializador para Ubuntu
├── core/
│   ├── engine.py           # ciclo do jogo e registro de progresso
│   ├── models.py           # dados de jogador e capítulos
│   ├── storage.py          # salvamento local
│   └── ui.py               # interface visual ANSI
├── chapters/
│   └── chapter_01.py       # conteúdo do primeiro capítulo
├── tests/                  # testes sem dependências externas
└── data/                   # progresso local criado em runtime
```

Para criar o Capítulo 02, adicione `chapters/chapter_02.py` com uma função `run(player, ui)` e registre o capítulo em `main.py`. O motor já separa navegação, interface, estado e conteúdo.

## Controles

- Digite o número da opção e pressione Enter.
- `q` sai durante os menus.
- O progresso é salvo em `data/progress.json`.

## Ideia pedagógica

O sistema não simula que a IA é mágica. Cada missão força um comportamento de produção: declarar intenção, tornar critérios observáveis, dividir o trabalho, dar contexto ao agente, pedir crítica e verificar o resultado no mundo real.
