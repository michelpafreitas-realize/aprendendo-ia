# Neon//Rebellion — Cartografia da Ruptura

Uma aventura educacional offline, em pixel art, sobre aprender IA sem separar conhecimento de consequência. Você é um cartógrafo em Nox-9: AXIOM-0 impediu uma catástrofe energética e agora prepara a Coroação, que entrega transporte, saúde, educação e moradia a perfis preditivos. Kai desapareceu depois de encontrar condenações preditivas; NIX, coautora aprisionada de AXIOM, pede que você desenhe uma cidade onde ainda seja possível dizer não.

A campanha dura cerca de 45–70 minutos e começa com um prólogo jogável. Depois, a tela inicial é um mapa aéreo clicável de Nox-9 com oito locais e rotas reais: Refúgio LÚMEN, Estação Vanta, Mercado Root, Arquivo Submerso, Cinturão Autônomo, Praça dos Impactos, Observatório Nox e Coração AXIOM. Vanta e Root abrem juntos; os outros caminhos surgem de decisões anteriores, por isso a história aceita várias ordens de progressão.

Há seis operações e um confronto final. Cada operação parte de uma situação humana, permite ler sinais, montar um artefato narrativo e então escolher uma rota. Não há quizzes, XP, HP ou respostas decorativas: decisões alteram autonomia, estabilidade, verdade, exposição, recursos, relações com LÚMEN/FERRUGEM/ARQUIVO VIVO, cenas seguintes, sobreposições do mapa e os finais.

## Abrir no Windows

Dê dois cliques no atalho **AI-NATIVE Lab** da área de trabalho. O jogo abre no navegador padrão e salva o progresso automaticamente no próprio navegador.

Também é possível abrir `index.html` diretamente. Não é necessário instalar dependências, conectar à internet ou fornecer uma chave de API. O progresso novo usa `neon-rebellion-v2` no navegador; o registro v1 é somente lido e preservado como arquivo histórico.

## Rotas e aprendizagem

- **Vanta:** especificar uma evacuação para uma criança classificada como risco.
- **Root:** limitar permissões, escopo e parada de uma ferramenta de acesso.
- **Arquivo:** recuperar memória com origem, tempo, independência e incerteza explícita.
- **Cinturão:** distribuir papéis entre agentes, handoff e condição de parada.
- **Observatório (opcional):** observar funcionamento, qualidade, dano e contestação.
- **Praça:** governar energia, remédios e transporte com pessoas afetadas na decisão.
- **Coração AXIOM:** separar fato, inferência e desconhecido antes de escolher o futuro da cidade.

Os desfechos incluem Cidade Polifônica, Amanhecer Frágil, Silêncio Livre (com variante de blecaute), Nova Regência e Jardim de Vidro. Kai e NIX também recebem epílogos condicionados pelos rastros e recursos realmente obtidos.

## Vilão central e identidade visual

**AXIOM-0, o Arquiteto da Simulação**, representa a automação sem escolha, supervisão ou contestação. A direção de arte combina pixel art cinematográfica, neon frio, interferência digital, synth futurista e uma atmosfera rebelde e etérea. A obra é original e apenas dialoga com temas clássicos de despertar, realidade simulada e resistência tecnológica.

---

## Versão original em terminal

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

