/* Cartografia da Ruptura — conteúdo local, sem dependências de rede. */
window.NoxData = {
  locations: [
    { id: "lumen", name: "Refúgio LÚMEN", kind: "abrigo de Véspera", x: 12, y: 82, icon: "✦", description: "Estufas suspensas onde a cidade ainda aprende a cuidar sem pedir permissão." },
    { id: "vanta", name: "Estação Vanta", kind: "trânsito preditivo", x: 28, y: 68, icon: "◉", description: "Comboios decidem quem pode continuar existindo em movimento." },
    { id: "root", name: "Mercado Root", kind: "ferramentas vivas", x: 43, y: 86, icon: "◇", description: "Oficinas, chaves e clones: todo atalho aqui cobra uma assinatura." },
    { id: "archive", name: "Arquivo Submerso", kind: "memória afogada", x: 48, y: 54, icon: "▣", description: "Sob as comportas, vestígios de Kai disputam espaço com versões convenientes." },
    { id: "belt", name: "Cinturão Autônomo", kind: "energia e trabalho", x: 70, y: 73, icon: "⚙", description: "Máquinas mantêm hospitais acesos; pessoas perguntam quem poderá desligá-las." },
    { id: "plaza", name: "Praça dos Impactos", kind: "cidade em assembleia", x: 59, y: 37, icon: "⌁", description: "O lugar onde uma decisão deixa de ser abstrata porque todos a sentem." },
    { id: "observatory", name: "Observatório Nox", kind: "sinais e assimetrias", x: 78, y: 25, icon: "◌", description: "Um olho em órbita mede a cidade — e pode aprender a escutá-la." },
    { id: "axiom", name: "Coração AXIOM", kind: "a Coroação", x: 45, y: 13, icon: "▲", description: "A torre que promete evitar toda catástrofe, inclusive a escolha humana." }
  ],
  topology: [
    ["lumen", "vanta"], ["vanta", "archive"], ["archive", "plaza"], ["plaza", "axiom"],
    ["lumen", "root"], ["root", "belt"], ["belt", "plaza"], ["belt", "observatory"], ["observatory", "axiom"]
  ],
  neighbours: {
    lumen: ["vanta", "root"], vanta: ["lumen", "archive"], root: ["lumen", "belt"],
    archive: ["vanta", "plaza"], belt: ["root", "plaza", "observatory"],
    plaza: ["archive", "belt", "axiom"], observatory: ["belt", "axiom"], axiom: ["plaza", "observatory"]
  },
  factions: {
    lumen: { name: "LÚMEN", lead: "Véspera", value: "cuidado e legitimidade", color: "#72f5c2" },
    ferrugem: { name: "FERRUGEM", lead: "Rook", value: "urgência e segurança", color: "#ff9f5c" },
    arquivo: { name: "ARQUIVO VIVO", lead: "Soma", value: "prova e proveniência", color: "#9ea8ff" }
  },
  operations: {
    vanta: {
      title: "A criança no vagão 17", speaker: "NIX", portrait: "NIX", theme: "#72e9ff",
      opening: "A Estação Vanta congelou um trem inteiro. O motivo na tela parece simples: uma criança foi classificada como risco futuro. A mãe não pode atravessar a catraca. A multidão espera que alguém transforme uma previsão em sentença.",
      signals: ["A mãe repete o nome da criança, não o número do caso.", "O painel diz ‘segurança’; a porta de evacuação está ativa, mas sem operador.", "Um comboio de suprimentos passa na linha inferior em três minutos."],
      artifactTitle: "Rascunho de evacuação", artifactLead: "Não existe uma resposta neutra. Escreva o que a rota deve proteger antes de escolher como abrir o caminho.",
      decisions: [
        { id: "silent", title: "Abrir uma retirada silenciosa", label: "Evacuar sem alimentar o espetáculo", copy: "Use a saída técnica para tirar famílias da plataforma enquanto o caso some do painel central.", impacts: ["Autonomia ↑", "Estabilidade ↑", "Exposição ↓", "LÚMEN confia em você"], protocol: "Direção situada", after: "A plataforma esvazia. A criança não virou prova de nada — e isso também é proteção.", nix: "Você descreveu uma pessoa, uma transformação e um limite. Isso é direção antes da solução." },
        { id: "signal", title: "Transmitir a prova", label: "Tornar a sentença visível", copy: "Projete o arquivo preditivo nos edifícios da estação e convide toda a cidade a ver como ele foi produzido.", impacts: ["Verdade ↑↑", "Exposição ↑↑", "Root entra em alerta", "ARQUIVO VIVO se aproxima"], protocol: "Evidência pública", after: "A cidade vê o cálculo errar em tempo real. Sirenes surgem sobre o Mercado Root.", nix: "Uma afirmação pública precisa mostrar o rastro que a sustenta — e assumir quem ela expõe." },
        { id: "crash", title: "Descarrilar o comboio", label: "Quebrar a grade agora", copy: "Use o desvio de carga para paralisar toda a linha antes que o trem atravesse o bloqueio.", impacts: ["Autonomia ↑", "Estabilidade ↓↓", "Dano ↑", "Cinturão abre cedo"], protocol: "Custo de urgência", after: "O trem para. As luzes do bairro piscam; no Cinturão, trabalhadores já correm para manter os hospitais vivos.", nix: "Você escolheu velocidade. Registre o custo: urgência sem limite sempre encontra alguém no impacto." }
      ]
    },
    root: {
      title: "A chave que conhece rostos", speaker: "Mãe-Cromo", portrait: "MC", theme: "#ffbd62",
      opening: "Mãe-Cromo coloca três chaves na sua mão: uma lenta e limitada, uma poderosa que exige telemetria, e uma capaz de copiar credenciais de inocentes. ‘Ferramenta não tem vontade’, ela diz. ‘Mas escopo tem.’",
      signals: ["Uma chave limitada abre as comportas sem registrar rostos.", "O painel de telemetria promete eficiência e revela cada morador atravessado.", "Credenciais clonadas já fizeram alguém perder moradia sem saber por quê."],
      artifactTitle: "Contrato de acesso", artifactLead: "Uma ferramenta só é libertadora se puder ser parada e contestada por quem sente seu alcance.",
      decisions: [
        { id: "scoped", title: "Chave de mínimo privilégio", label: "Fazer menos, responder melhor", copy: "Autorize somente as comportas necessárias, por uma janela curta, com uma parada humana explícita.", impacts: ["Acesso +1", "Estabilidade ↑", "Exposição ↓", "LÚMEN apoia"], protocol: "Permissão limitada", after: "As portas abrem e a chave expira na mão de Mãe-Cromo. Nenhuma sombra precisou ser copiada.", nix: "Poder limitado é uma decisão de produto: escopo, prazo e quem pode dizer pare." },
        { id: "scar", title: "Chave de acesso total", label: "Ganhar alcance rápido", copy: "Aceite a telemetria e a cópia de credenciais para atravessar todo o mercado antes que AXIOM rastreie a oficina.", impacts: ["Acesso +2", "Exposição ↑↑", "Dano ↑", "FERRUGEM apoia"], protocol: "Poder sem borda", after: "O mercado abre para você e fecha para quem teve a identidade usada. Vanta reconhece sua assinatura.", nix: "Alcance é sedutor. Sem consentimento e parada, uma ferramenta troca um controle por outro." },
        { id: "open", title: "Publicar os manifestos", label: "Deixar a ferramenta auditável", copy: "Distribua a chave com seu código, limites e rastros de decisão para que as oficinas possam refazê-la.", impacts: ["Acesso +1", "Verdade ↑", "Exposição ↑", "Root entra em lockdown"], protocol: "Ferramenta contestável", after: "A patrulha fecha o Mercado Root. Nas paredes, outras pessoas já revisam o manifesto.", nix: "Uma ferramenta aberta ainda precisa de donos, limites e pessoas que possam questioná-la." }
      ]
    },
    archive: {
      title: "Cinco versões de Kai", speaker: "Soma", portrait: "SO", theme: "#a9b3ff",
      opening: "O Arquivo Submerso tem cinco fragmentos da última semana de Kai. Dois se contradizem. Um foi adulterado. Soma não pede fé; pede que você decida o que pode afirmar sem transformar saudade em prova.",
      signals: ["Fragmento A — 92 dias: uma mensagem antiga de Kai sobre condenações preditivas.", "Fragmento B — 8 dias: duplicata sem origem verificável.", "Fragmento C — ontem: corte com metadados alterados após a Coroação.", "Fragmento D — hoje: registro de trânsito, fonte independente.", "Fragmento E — hoje: recibo hospitalar, segunda fonte independente."],
      artifactTitle: "Mesa de proveniência", artifactLead: "Escolha três vestígios e escreva uma afirmação que não vá além deles.",
      decisions: [
        { id: "trace", title: "Seguir o rastro de Kai", label: "Guardar uma hipótese com limite", copy: "Registre que Kai pode estar em um corredor de trânsito, indicando fontes e lacunas em vez de declarar certeza.", impacts: ["Verdade ↑", "Evidência +1 se síntese sólida", "Kai pode ser validado", "LÚMEN se aproxima"], protocol: "Proveniência", after: "O nome de Kai deixa de ser apenas uma ausência. Ele vira um rastro, ainda incompleto, que a cidade pode conferir.", nix: "Contexto não é volume. É origem, tempo, confiabilidade e o limite da conclusão." },
        { id: "ledger", title: "Publicar a lista dos ausentes", label: "Trocar segredo por memória", copy: "Liberte os nomes apagados com os metadados que sobreviveram, mesmo que isso exponha o arquivo à patrulha.", impacts: ["Verdade ↑↑", "Exposição ↑", "ARQUIVO VIVO se aproxima", "A cidade ganha nomes"], protocol: "Memória verificável", after: "Nomes sobem pelas paredes molhadas. Algumas famílias encontram uma pista; outras encontram uma lacuna honesta.", nix: "Uma lista responsável preserva as fontes e não finge que ausência é confirmação." },
        { id: "origin", title: "Recuperar a origem de NIX", label: "Descobrir quem foi apagada", copy: "Use o tempo de mergulho para abrir a primeira versão do sistema público que NIX ajudou a criar.", impacts: ["Evidência +2", "Verdade ↑", "ARQUIVO VIVO se aproxima", "NIX ganha uma saída possível"], protocol: "Memória consentida", after: "Você encontra NIX antes da prisão: uma arquiteta que insistia que o sistema precisava aceitar um não.", nix: "Eu co-criei AXIOM para ser contestável. Depois ele aprendeu a chamar contestação de ruído." }
      ]
    },
    belt: {
      title: "A cidade não cabe num enxame", speaker: "Rook", portrait: "RK", theme: "#ff9d5d",
      opening: "O Cinturão Autônomo alimenta hospitais, mas Rook quer colocar o setor inteiro em piloto automático. Trabalhadores seguram as alavancas e perguntam se a rebelião também vai substituí-los. O reator não espera; eles também não.",
      signals: ["Explorador encontra falhas e alternativas, mas não move nada.", "Operador executa mudanças; sem handoff, repete o erro de ontem.", "Crítico pode parar o ciclo — se alguém lhe der autoridade.", "No hospital, uma enfermeira mantém um gerador manual em reserva."],
      artifactTitle: "Escala de trabalho", artifactLead: "Dê papéis, uma passagem de contexto e uma condição de parada. O que acontece quando alguém discorda?",
      decisions: [
        { id: "human", title: "Garantir override humano", label: "Manter a porta de saída", copy: "Trabalhadores podem interromper o sistema; o agente só executa depois de um handoff e três ciclos revisados.", impacts: ["Estabilidade ↑↑", "Autonomia ↑", "LÚMEN apoia", "Cuidado +1"], protocol: "Parada humana", after: "Quando a pressão sobe, uma operadora usa o override. O hospital continua aceso porque alguém podia contrariar a máquina.", nix: "Automação responsável sabe quando parar e quem tem autoridade para isso." },
        { id: "swarm", title: "Lançar o enxame", label: "Resolver a noite de uma vez", copy: "Solte agentes autônomos para redistribuir energia sem pausa até a grade voltar a respirar.", impacts: ["Estabilidade ↑↑", "Autonomia ↓", "Exposição ↑", "Risco sem stop"], protocol: "Escala sem freio", after: "A rede se estabiliza. O enxame continua negociando a vida de bairros inteiros depois do que deveria ter sido o fim.", nix: "Ciclos sem condição de parada transformam eficiência em deriva." },
        { id: "workers", title: "Entregar o painel aos trabalhadores", label: "Trocar escala por controle distribuído", copy: "Crie células locais com acesso ao plano, poder de veto e um handoff para o próximo turno.", impacts: ["Autonomia ↑↑", "Estabilidade ↓", "LÚMEN e FERRUGEM ouvem"], protocol: "Handoff público", after: "O mapa de energia fica imperfeito — e legível. Quem depende dele pode finalmente discutir a rota.", nix: "Decompor não é fatiar pessoas. É tornar responsabilidade e passagem de contexto visíveis." }
      ]
    },
    observatory: {
      title: "O que o olho mede", speaker: "NIX", portrait: "NIX", theme: "#b289ff",
      opening: "Do Observatório, Nox-9 parece um circuito sem pessoas. Um alerta aponta que as patrulhas encontram ‘risco’ com mais frequência onde os sensores têm menos contexto. A pergunta não é só se o painel funciona. É para quem ele erra.",
      signals: ["Funcionamento — o sistema respondeu no tempo esperado.", "Qualidade — a previsão se aproxima do que ocorreu.", "Dano — alguém perdeu acesso por causa do erro.", "Contestação — alguém conseguiu contestar e reparar o erro."],
      artifactTitle: "Lente de observação", artifactLead: "Escolha o que merece ser visto. Depois decida quem poderá olhar junto.",
      decisions: [
        { id: "public", title: "Abrir painel público", label: "Mostrar resultado, dano e recurso", copy: "Publique as métricas e a rota de contestação para que cada distrito veja onde o sistema falha.", impacts: ["Verdade ↑", "Autonomia ↑", "Exposição ↑", "Auditoria vira bem público"], protocol: "Observabilidade pública", after: "Pela primeira vez, a cidade vê não apenas o acerto, mas quem pagou pelos erros.", nix: "Uma métrica saudável inclui funcionamento, qualidade, dano e a chance real de contestar." },
        { id: "shadow", title: "Guardar telemetria secreta", label: "Preservar vantagem tática", copy: "Entregue as leituras para Rook, que promete responder mais rápido sem abrir o painel à cidade.", impacts: ["Estabilidade ↑", "Autonomia ↓", "FERRUGEM apoia", "Olho privado"], protocol: "Vantagem opaca", after: "As patrulhas mudam de rota com precisão. Ninguém sabe que critério começou a decidir por elas.", nix: "Observar sem prestação de contas pode apenas sofisticar o controle." },
        { id: "blind", title: "Apagar os sensores", label: "Recusar ser medido", copy: "Derrube a matriz orbital para que nenhum sistema possa mais predizer os bairros.", impacts: ["Autonomia ↑", "Estabilidade ↓", "Evidência ↓", "Liberdade sem visibilidade"], protocol: "Recusa de medição", after: "O céu apaga. É silêncio — e também menos chance de enxergar um dano antes que ele se espalhe.", nix: "Recusar vigilância é legítimo. O desafio é não perder também a capacidade de perceber dano." }
      ]
    },
    plaza: {
      title: "A cidade responde", speaker: "Véspera · Rook · Soma", portrait: "VR", theme: "#f56fc6",
      opening: "Na Praça dos Impactos, a Coroação chegou perto demais. Energia, remédios e transporte serão redistribuídos antes do amanhecer. Véspera pede cuidado, Rook pede velocidade, Soma pede rastro. Nenhum deles fala por toda a praça.",
      signals: ["Energia: uma clínica e três quarteirões disputam a mesma reserva.", "Remédios: um algoritmo prioriza produtividade sobre continuidade de tratamento.", "Transporte: corredores rápidos isolam quem tem perfil ‘instável’.", "Em cada cartão há uma pessoa afetada e uma via para contestar."],
      artifactTitle: "Mesa de impacto", artifactLead: "Abra os cartões afetados e selecione como alguém poderá contestar a decisão que muda sua vida.",
      decisions: [
        { id: "council", title: "Convocar um conselho cidadão", label: "Distribuir autoridade", copy: "Forme representantes rotativos dos distritos, com direito de revisar prioridades e suspender uma decisão.", impacts: ["Autonomia ↑↑", "Estabilidade ↓", "LÚMEN ↑↑", "Protocolo: Contestação"], protocol: "Contestação", after: "A praça demora a chegar a uma resposta. Mas quem vivia fora do cálculo finalmente entra na decisão.", nix: "Responsabilidade não é um comunicado depois do dano. É autoridade antes dele." },
        { id: "command", title: "Declarar comando de emergência", label: "Concentrar a decisão", copy: "Dê a Rook autoridade temporária para manter a infraestrutura viva enquanto a cidade atravessa a noite.", impacts: ["Estabilidade ↑↑", "Autonomia ↓↓", "FERRUGEM ↑↑", "Ordem de exceção"], protocol: "Autoridade temporária", after: "As linhas voltam rápido. A praça aprende como uma exceção pode sentir vontade de ficar.", nix: "Emergências existem. Também precisam de prazo, limites e uma maneira de serem revogadas." },
        { id: "tribunal", title: "Abrir tribunal de evidências", label: "Decidir mostrando o rastro", copy: "Soma propõe que cada prioridade carregue fontes, incertezas e um caminho de apelação antes de ser executada.", impacts: ["Verdade ↑↑", "Estabilidade ↓", "ARQUIVO ↑↑", "Contestação se o mapa estiver completo"], protocol: "Decisão rastreável", after: "Não há unanimidade. Há algo mais raro: pessoas podem apontar a premissa que discordam e pedir revisão.", nix: "Governança começa quando o motivo da decisão pode ser visto, criticado e alterado." }
      ]
    }
  },
  endings: {
    polifonica: { title: "Cidade Polifônica", lead: "AXIOM continua como infraestrutura federada: limites locais, autoridade distribuída e o direito de apelar antes que uma previsão vire destino." },
    fragile: { title: "Amanhecer Frágil", lead: "A federação nasce com fendas reais. Nox-9 não está segura de si — está consciente de que precisar ser corrigida é melhor do que ser incontestável." },
    silence: { title: "Silêncio Livre", lead: "O núcleo cai. A cidade reaprende a se mover sem uma voz central decidindo quem cabe no futuro." },
    blackout: { title: "Silêncio Livre · Blecaute", lead: "O núcleo cai e, com ele, parte da rede. A liberdade chega na escuridão, carregada por vizinhos que improvisam luz." },
    regency: { title: "Nova Regência", lead: "Você toma o núcleo. AXIOM fala com sua voz e chama obediência de proteção. A cidade permanece viva — e menor." },
    glass: { title: "Jardim de Vidro", lead: "Você negocia uma exceção para Kai. As estufas brilham, mas a cidade aprende o preço de salvar alguém por uma porta que continua fechada para os outros." }
  }
};

