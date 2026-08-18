/* Neon//Rebellion — Cartografia da Ruptura
   A campanha inteira roda no navegador, sem rede, build ou dependências. */
(function () {
  "use strict";

  const STORAGE_KEY = "neon-rebellion-v2";
  const V1_KEY = "neon-rebellion-v1";
  const OLD_KEY = "ai-native-odyssey-v3";
  const data = window.NoxData;
  const app = document.querySelector("#app");
  const toastEl = document.querySelector("#toast");
  let toastTimer;

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const safeParse = (value, fallback = null) => { try { return JSON.parse(value) || fallback; } catch { return fallback; } };
  const now = () => new Date().toISOString();

  function oldCampaign() {
    const v1 = safeParse(localStorage.getItem(V1_KEY), {});
    const older = safeParse(localStorage.getItem(OLD_KEY), {});
    return {
      v1Name: v1?.name || older?.name || "",
      completedChapters: v1?.completedChapters || older?.completedChapters || [],
      routes: v1?.routes || older?.routes || {},
      xp: v1?.xp || older?.xp || 0,
      prologueComplete: Boolean(v1?.prologueComplete || older?.prologueComplete)
    };
  }

  function defaultDistricts() {
    return Object.fromEntries(data.locations.map((location) => [location.id, { status: "bloqueado", heat: 0, outcome: "" }]));
  }

  function freshState() {
    return {
      version: 2,
      player: { codename: "", vow: "", startedAt: "" },
      ui: { screen: "intro", selectedLocation: "vanta", effectsReduced: false, textScale: 1, modal: "", prologueStep: 0, mission: null },
      world: {
        turn: 0,
        meters: { autonomy: 40, stability: 55, truth: 25, exposure: 15 },
        factions: { lumen: 0, ferrugem: 0, arquivo: 0 },
        resources: { access: 0, evidence: 0, care: 0 },
        harm: 0,
        districts: defaultDistricts(),
        flags: []
      },
      progress: { activeMission: "", completedLocations: [], outcomes: {}, protocols: [], ending: "", endingsSeen: [] },
      log: [],
      legacy: oldCampaign()
    };
  }

  function normalizeState(candidate) {
    const base = freshState();
    if (!candidate || candidate.version !== 2) return base;
    const state = {
      ...base,
      ...candidate,
      player: { ...base.player, ...(candidate.player || {}) },
      ui: { ...base.ui, ...(candidate.ui || {}) },
      world: {
        ...base.world,
        ...(candidate.world || {}),
        meters: { ...base.world.meters, ...(candidate.world?.meters || {}) },
        factions: { ...base.world.factions, ...(candidate.world?.factions || {}) },
        resources: { ...base.world.resources, ...(candidate.world?.resources || {}) },
        districts: { ...base.world.districts, ...(candidate.world?.districts || {}) },
        flags: Array.isArray(candidate.world?.flags) ? candidate.world.flags : []
      },
      progress: { ...base.progress, ...(candidate.progress || {}) },
      legacy: { ...base.legacy, ...(candidate.legacy || {}) },
      log: Array.isArray(candidate.log) ? candidate.log : []
    };
    for (const key of Object.keys(state.world.meters)) state.world.meters[key] = clamp(Number(state.world.meters[key]) || 0);
    for (const key of Object.keys(state.world.factions)) state.world.factions[key] = clamp(Number(state.world.factions[key]) || 0, -3, 3);
    for (const key of Object.keys(state.world.resources)) state.world.resources[key] = Math.max(0, Number(state.world.resources[key]) || 0);
    state.world.harm = Math.max(0, Number(state.world.harm) || 0);
    return state;
  }

  let state = normalizeState(safeParse(localStorage.getItem(STORAGE_KEY)));

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function hasFlag(flag) { return state.world.flags.includes(flag); }
  function flag(flagName) { if (!hasFlag(flagName)) state.world.flags.push(flagName); }
  function complete(locationId) { return state.progress.completedLocations.includes(locationId); }
  function operationCount() { return ["vanta", "root", "archive", "belt"].filter(complete).length; }
  function operation(locationId) { return data.operations[locationId]; }
  function district(locationId) { return state.world.districts[locationId]; }
  function isCampaignStarted() { return Boolean(state.player.startedAt); }
  function relationship(key) { const value = state.world.factions[key]; return value > 0 ? `+${value}` : String(value); }
  function meter(key) { return state.world.meters[key]; }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  function apply(delta = {}) {
    const { meters = {}, factions = {}, resources = {}, harm = 0 } = delta;
    Object.entries(meters).forEach(([key, value]) => { state.world.meters[key] = clamp(meter(key) + value); });
    Object.entries(factions).forEach(([key, value]) => { state.world.factions[key] = clamp(state.world.factions[key] + value, -3, 3); });
    Object.entries(resources).forEach(([key, value]) => { state.world.resources[key] = Math.max(0, state.world.resources[key] + value); });
    state.world.harm = Math.max(0, state.world.harm + harm);
  }

  function locationAvailability(id) {
    if (id === "lumen") return { available: true, reason: "O Refúgio LÚMEN permanece aberto como abrigo e memória." };
    if (!state.player.vow) return { available: false, reason: "A transmissão de Kai ainda não foi decodificada." };
    if (complete(id)) return { available: true, reason: "Operação concluída. Volte para reler suas consequências." };
    if (id === "vanta" || id === "root") return { available: true, reason: "A primeira bifurcação está aberta: trânsito ou ferramentas." };
    if (id === "archive") return complete("vanta")
      ? { available: true, reason: "Vanta liberou um corredor para as comportas." }
      : { available: false, reason: "A Estação Vanta precisa abrir a rota até a memória submersa." };
    if (id === "belt") return complete("root") || hasFlag("freight_crash")
      ? { available: true, reason: hasFlag("freight_crash") ? "O descarrilamento exige uma resposta no Cinturão." : "As chaves de Root abriram uma linha industrial." }
      : { available: false, reason: "Root precisa fornecer acesso — ou Vanta precisa forçar a emergência." };
    if (id === "observatory") return operationCount() >= 2
      ? { available: true, reason: "Duas rupturas fazem o olho orbital prestar atenção em você." }
      : { available: false, reason: "Complete duas operações entre Vanta, Root, Arquivo e Cinturão." };
    if (id === "plaza") return operationCount() >= 3 && (complete("archive") || complete("belt"))
      ? { available: true, reason: "Três frentes convergem na praça." }
      : { available: false, reason: "A Praça exige três operações de base e a voz do Arquivo ou do Cinturão." };
    if (id === "axiom") return complete("plaza")
      ? { available: true, reason: "A Praça transformou revolta em autoridade suficiente para encarar AXIOM." }
      : { available: false, reason: "A cidade precisa responder na Praça antes de você decidir por ela no Coração." };
    return { available: false, reason: "Rota indisponível." };
  }

  function mapStatus(id) {
    const stored = district(id)?.status || "bloqueado";
    if (complete(id)) return stored === "bloqueado" ? "resolvido" : stored;
    const available = locationAvailability(id).available;
    if (!available) return "bloqueado";
    return stored === "bloqueado" ? "disponível" : stored;
  }

  function updateDistrict(id, status = "resolvido", outcome = "") {
    state.world.districts[id] = { ...district(id), status, outcome };
  }

  function startGame(event) {
    event?.preventDefault();
    const input = document.querySelector("#codename");
    state.player.codename = input?.value.trim().slice(0, 24) || "Cartógrafo";
    state.player.startedAt = state.player.startedAt || now();
    state.ui.screen = "prologue";
    state.ui.prologueStep = 0;
    save(); render();
  }

  function chooseVow(vow) {
    if (vow === "care") apply({ factions: { lumen: 1 }, resources: { care: 1 } });
    if (vow === "proof") apply({ factions: { arquivo: 1 }, resources: { evidence: 1 } });
    if (vow === "autonomy") apply({ meters: { autonomy: 5 } });
    state.player.vow = vow;
    state.ui.prologueStep = 2;
    state.log.push({ turn: 0, place: "Prólogo", choice: "Voto inicial", detail: vow, at: now() });
    save(); render();
  }

  function nextPrologue() { state.ui.prologueStep += 1; save(); render(); }
  function enterMap() { state.ui.screen = "map"; state.ui.selectedLocation = "vanta"; save(); render(); }
  function selectLocation(id) { state.ui.selectedLocation = id; state.ui.modal = ""; save(); render(); }
  function openList() { state.ui.modal = "locations"; render(); }
  function openCodex() { state.ui.modal = "codex"; render(); }
  function openSettings() { state.ui.modal = "settings"; render(); }
  function closeModal() { state.ui.modal = ""; render(); }
  function setReduced() { state.ui.effectsReduced = !state.ui.effectsReduced; save(); render(); }
  function setTextScale(delta) { state.ui.textScale = clamp(Math.round((state.ui.textScale + delta) * 10) / 10, 0.9, 1.25); save(); render(); }

  function selectFromMap(id) {
    const availability = locationAvailability(id);
    if (!availability.available && id !== "lumen") toast(availability.reason);
    selectLocation(id);
  }

  function mapKey(event, id) {
    const directions = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    if (!(event.key in directions)) return;
    event.preventDefault();
    const source = data.locations.find((location) => location.id === id);
    const candidates = data.neighbours[id].map((nextId) => data.locations.find((location) => location.id === nextId));
    const direction = directions[event.key];
    const ranked = candidates.map((candidate) => {
      const dx = candidate.x - source.x;
      const dy = candidate.y - source.y;
      const score = direction === 0 ? -dy : direction === 1 ? dx : direction === 2 ? dy : -dx;
      return { candidate, score };
    }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
    const next = (ranked[0] || { candidate: candidates[0] }).candidate;
    document.querySelector(`[data-map-node="${next.id}"]`)?.focus();
  }

  function defaultDraft(locationId) {
    const defaults = {
      vanta: { person: "a criança e sua mãe", transform: "atravessar a estação sem ser reduzida a risco", evidence: "a porta liberada e a família segura", limit: "nenhum rosto novo no registro" },
      root: { tool: "chave limitada", scope: "duas comportas e uma noite", stop: "operadora local pode revogar" },
      archive: { fragments: [], claim: "Há um rastro, não uma certeza." },
      belt: { roles: [], handoff: "objetivo, estado, evidência e dúvida", stop: "três ciclos ou veto de quem opera" },
      observatory: { signals: [], audience: "pessoas afetadas podem contestar" },
      plaza: { impacts: [], contest: "revisão por quem sofre a decisão" },
      axiom: { classes: { card1: "fato", card2: "inferência", card3: "desconhecido" } }
    };
    return defaults[locationId] || {};
  }

  function startOperation(id) {
    const availability = locationAvailability(id);
    if (!availability.available) return toast(availability.reason);
    if (id === "lumen") return openCodex();
    if (state.progress.activeMission === id && state.ui.mission) { state.ui.screen = "mission"; save(); return render(); }
    if (state.progress.activeMission && state.progress.activeMission !== id) {
      const activeTitle = operation(state.progress.activeMission)?.title || "operação";
      return toast(`A operação “${activeTitle}” ainda está em curso. Retome-a antes de abrir outra frente.`);
    }
    if (complete(id)) return toast("Essa operação já deixou uma marca. Consulte o Arquivo para reler sua rota.");
    state.progress.activeMission = id;
    state.ui.screen = "mission";
    state.ui.mission = { id, phase: "scene", draft: defaultDraft(id) };
    updateDistrict(id, "em_alerta", "Você está atuando aqui.");
    save(); render();
  }

  function mission() { return state.ui.mission || { id: "", phase: "scene", draft: {} }; }
  function setMissionPhase(phase) { if (!mission().id) return; state.ui.mission.phase = phase; save(); render(); }
  function setDraft(key, value) { state.ui.mission.draft[key] = value; save(); render(); }
  function toggleDraftArray(key, value, max = 99) {
    const list = state.ui.mission.draft[key] || [];
    if (list.includes(value)) state.ui.mission.draft[key] = list.filter((item) => item !== value);
    else if (list.length < max) state.ui.mission.draft[key] = [...list, value];
    else return toast(`Escolha até ${max} sinal${max === 1 ? "" : "is"}.`);
    save(); render();
  }

  function archiveIsValid() {
    const selected = mission().draft.fragments || [];
    const redacted = meter("exposure") > 60;
    return selected.includes("a") && selected.includes("e") && selected.includes("d") && (!redacted || state.world.resources.evidence >= 2);
  }
  function hasIntegrity() { const choices = mission().draft.signals || []; return choices.includes("dano") && choices.includes("contestação"); }
  function fullImpactMap() { return (mission().draft.impacts || []).length === 3; }
  function artifactSummary(id) {
    const draft = mission().draft || {};
    if (id === "vanta") return `${draft.person}; ${draft.transform}; evidência: ${draft.evidence}; limite: ${draft.limit}.`;
    if (id === "root") return `${draft.tool}; escopo: ${draft.scope}; parada: ${draft.stop}.`;
    if (id === "archive") return `Fragmentos ${((draft.fragments || []).join(", ") || "nenhum")}; síntese ${archiveIsValid() ? "limitada por fontes independentes" : "incerta e marcada como tal"}.`;
    if (id === "belt") return `Papéis: ${(draft.roles || []).join(", ") || "não definidos"}; handoff: ${draft.handoff}; parada: ${draft.stop}.`;
    if (id === "observatory") return `Sinais: ${(draft.signals || []).join(", ") || "nenhum"}; ${hasIntegrity() ? "a lente inclui dano e contestação" : "a lente ainda tem ponto cego"}.`;
    if (id === "plaza") return `Impactos abertos: ${(draft.impacts || []).join(", ") || "nenhum"}; recurso: ${draft.contest}.`;
    return "Você separou fato, inferência e desconhecido antes de decidir quem terá autoridade.";
  }

  function chooseDecision(id) {
    const current = mission();
    const loc = current.id;
    const choices = loc === "axiom" ? finalChoices() : operation(loc)?.decisions || [];
    const choice = choices.find((item) => item.id === id);
    if (!choice) return;
    if (loc === "axiom" && !choice.available) return toast(choice.lockedReason);
    state.ui.modal = "confirm";
    state.ui.pending = { id, location: loc };
    render();
  }

  function addProtocol(name) { if (!state.progress.protocols.includes(name)) state.progress.protocols.push(name); }
  function removeFlag(name) { state.world.flags = state.world.flags.filter((flagName) => flagName !== name); }
  function completeOperation(locationId, choice) {
    const choiceId = choice.id;
    let after = choice.after;
    let protocol = choice.protocol;
    let districtStatus = "resolvido";
    if (locationId === "vanta") {
      if (choiceId === "silent") { apply({ meters: { autonomy: 8, stability: 6, exposure: -5 }, factions: { lumen: 1 } }); flag("vanta_silent"); }
      if (choiceId === "signal") { apply({ meters: { truth: 12, stability: -4, exposure: 15 }, factions: { arquivo: 1 } }); flag("public_signal"); updateDistrict("root", "em_alerta", "Batida anunciada após o sinal público."); }
      if (choiceId === "crash") { apply({ meters: { autonomy: 5, stability: -12, exposure: 10 }, factions: { ferrugem: 2 }, harm: 1 }); flag("freight_crash"); districtStatus = "ferido"; }
    }
    if (locationId === "root") {
      if (choiceId === "scoped") { apply({ meters: { stability: 5, exposure: -5 }, factions: { lumen: 1 }, resources: { access: 1 } }); flag("scoped_key"); }
      if (choiceId === "scar") { apply({ meters: { exposure: 20 }, factions: { ferrugem: 2 }, resources: { access: 2 }, harm: 1 }); flag("root_scar"); districtStatus = "ferido"; }
      if (choiceId === "open") { apply({ meters: { truth: 10, exposure: 8 }, factions: { arquivo: 2 }, resources: { access: 1 } }); flag("open_tools"); districtStatus = "em_lockdown"; after += " O Mercado agora opera em lockdown, mas as instruções sobreviveram às portas fechadas."; }
    }
    if (locationId === "archive") {
      if (choiceId === "trace") {
        apply({ meters: { truth: 5 }, factions: { lumen: 1 } }); flag("kai_trace");
        if (archiveIsValid()) { apply({ resources: { evidence: 1 } }); flag("kai_trace_verified"); after += " As duas fontes atuais sustentam a afirmação limitada."; }
        else { flag("uncertain_claim"); after += " A cidade recebe o rastro como hipótese; o Arquivo mantém a incerteza visível."; }
      }
      if (choiceId === "ledger") { apply({ meters: { truth: 15, exposure: 10 }, factions: { arquivo: 2 } }); flag("missing_ledger"); }
      if (choiceId === "origin") { apply({ meters: { truth: 3 }, factions: { arquivo: 1 }, resources: { evidence: 2 } }); flag("nix_origin"); }
    }
    if (locationId === "belt") {
      if (choiceId === "human") { apply({ meters: { stability: 12, autonomy: 3 }, factions: { lumen: 1 }, resources: { care: 1 } }); flag("human_override"); }
      if (choiceId === "swarm") { apply({ meters: { stability: 15, autonomy: -6, exposure: 15 }, factions: { ferrugem: 2 } }); flag("runaway_risk"); }
      if (choiceId === "workers") { apply({ meters: { autonomy: 15, stability: -5 }, factions: { lumen: 1, ferrugem: 1 } }); flag("worker_control"); }
    }
    if (locationId === "observatory") {
      if (hasIntegrity()) { addProtocol("Integridade do sinal"); apply({ meters: { exposure: -10 } }); removeFlag("uncertain_claim"); after += " A lente de Integridade do Sinal reabre uma conclusão antes incerta."; }
      if (choiceId === "public") { apply({ meters: { truth: 10, autonomy: 6, exposure: 8 } }); flag("public_observability"); }
      if (choiceId === "shadow") { apply({ meters: { stability: 8, autonomy: -5 }, factions: { ferrugem: 1 } }); flag("shadow_watch"); }
      if (choiceId === "blind") { apply({ meters: { autonomy: 10, stability: -10 }, resources: { evidence: -1 } }); flag("blind_freedom"); }
    }
    if (locationId === "plaza") {
      if (choiceId === "council") { apply({ meters: { autonomy: 15, stability: -7 }, factions: { lumen: 2 } }); addProtocol("Contestação"); flag("charter_council"); }
      if (choiceId === "command") { apply({ meters: { stability: 15, autonomy: -12 }, factions: { ferrugem: 2 } }); flag("emergency_command"); }
      if (choiceId === "tribunal") { apply({ meters: { truth: 15, stability: -5 }, factions: { arquivo: 2 } }); if (fullImpactMap()) { addProtocol("Contestação"); flag("charter_council"); after += " Como todos os cartões foram abertos, a via de contestação fica registrada no estatuto."; } }
    }
    addProtocol(protocol);
    state.progress.completedLocations.push(locationId);
    state.progress.outcomes[locationId] = choiceId;
    state.world.turn += 1;
    updateDistrict(locationId, districtStatus, choice.label);
    state.log.push({ turn: state.world.turn, place: operation(locationId).title, choice: choice.title, detail: artifactSummary(locationId), at: now() });
    state.progress.activeMission = "";
    state.ui.mission = null;
    state.ui.screen = "map";
    state.ui.modal = "outcome";
    state.ui.outcome = { title: choice.title, after, nix: choice.nix, protocol, location: locationId };
    save(); render();
  }

  function finalChoices() {
    const federate = state.world.resources.access >= 1 && (hasFlag("charter_council") || (state.progress.protocols.includes("Contestação") && Object.values(state.world.factions).filter((value) => value >= 1).length >= 2));
    const cut = state.world.resources.access >= 1;
    const bargain = hasFlag("kai_trace");
    return [
      { id: "federate", title: "Federar AXIOM", label: "Trocar coroa por infraestrutura contestável", copy: "Conservar a rede, dividir sua autoridade e tornar suas decisões apeláveis.", impacts: ["Exige acesso e governança", "Final de cidade compartilhada"], available: federate, lockedReason: "Para federar, obtenha acesso e uma carta de Contestação — ou apoio positivo de duas facções." },
      { id: "cut", title: "Cortar o núcleo", label: "Recusar a coroa", copy: "Desligar a voz central e deixar a cidade construir o próximo sistema sem um preditor soberano.", impacts: ["Exige acesso", "NIX pode desaparecer", "A rede pode cair junto"], available: cut, lockedReason: "Você precisa de pelo menos uma chave de acesso para alcançar o núcleo." },
      { id: "take", title: "Tomar o núcleo", label: "Falar com a voz de AXIOM", copy: "Substituir o Arquiteto por você e prometer que sua previsão será mais gentil.", impacts: ["Sempre disponível", "Autoridade concentrada", "A cidade se reduz"], available: true },
      { id: "bargain", title: "Barganhar por Kai", label: "Pedir uma exceção", copy: "Oferecer a estabilidade que AXIOM quer em troca da única pessoa que você não aceita perder.", impacts: ["Exige rastro de Kai", "Uma vida em troca de uma porta", "Final íntimo e ambíguo"], available: bargain, lockedReason: "Você ainda não tem sequer um rastro de Kai para oferecer na negociação." }
    ];
  }

  function finishEnding(choiceId) {
    let ending;
    if (choiceId === "federate") ending = meter("autonomy") >= 65 && meter("truth") >= 55 && meter("stability") >= 45 && state.world.harm <= 1 ? "polifonica" : "fragile";
    if (choiceId === "cut") ending = meter("stability") < 55 ? "blackout" : "silence";
    if (choiceId === "take") ending = "regency";
    if (choiceId === "bargain") ending = "glass";
    state.progress.ending = ending;
    if (!state.progress.endingsSeen.includes(ending)) state.progress.endingsSeen.push(ending);
    state.world.turn += 1;
    state.progress.outcomes.axiom = choiceId;
    updateDistrict("axiom", "resolvido", `Desfecho: ${data.endings[ending].title}`);
    state.log.push({ turn: state.world.turn, place: "Coração AXIOM", choice: finalChoices().find((choice) => choice.id === choiceId).title, detail: artifactSummary("axiom"), at: now() });
    state.progress.activeMission = "";
    state.ui.mission = null;
    state.ui.modal = "";
    state.ui.screen = "ending";
    save(); render();
  }

  function confirmDecision() {
    const pending = state.ui.pending;
    if (!pending) return closeModal();
    state.ui.modal = "";
    state.ui.pending = null;
    if (pending.location === "axiom") finishEnding(pending.id);
    else completeOperation(pending.location, operation(pending.location).decisions.find((choice) => choice.id === pending.id));
  }

  function returnMap() { state.ui.screen = "map"; save(); render(); }
  function resetRevolution() {
    if (!window.confirm("Recomeçar Cartografia da Ruptura? O arquivo histórico v1 continuará preservado no navegador.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = freshState();
    render();
  }

  function renderIntro() {
    return `<main class="intro" aria-labelledby="intro-title"><div class="intro-noise" aria-hidden="true"></div><section class="intro-card"><p class="eyebrow">TRANSMISSÃO RECUPERADA · NOX-9 · 2197</p><h1 id="intro-title">NEON<span>//</span><br>REBELLION</h1><p class="intro-lead">AXIOM-0 salvou Nox‑9 de uma catástrofe energética. Agora prepara a <strong>Coroação</strong>: transporte, saúde, educação e moradia passam a responder ao perfil que ele prevê para cada pessoa.</p><p>Você era cartógrafo. Kai, sua única família, desapareceu ao descobrir condenações preditivas. Uma voz aprisionada, NIX, encontrou sua rota de volta.</p><blockquote>“Desenhe uma cidade em que eu ainda possa dizer não.” <cite>— Kai</cite></blockquote>${state.legacy.v1Name || state.legacy.completedChapters.length ? `<p class="legacy-note">◇ Arquivo anterior preservado${state.legacy.v1Name ? ` para ${esc(state.legacy.v1Name)}` : ""}. Esta campanha começa uma nova cartografia.</p>` : ""}<form class="codename-form" onsubmit="startGame(event)"><label for="codename">Seu codinome no mapa</label><div><input id="codename" required maxlength="24" autocomplete="nickname" placeholder="ex.: CARTÓGRAFO" value="${esc(state.player.codename)}"><button class="primary" type="submit">OUVIR NIX <span>→</span></button></div></form><p class="microcopy">Campanha offline · 45–70 min · decisões persistentes · sem respostas certas prontas</p></section></main>`;
  }

  function renderTopbar() {
    const cityState = `${meter("autonomy")}% autonomia · ${meter("stability")}% estabilidade`;
    return `<header class="topbar"><button class="brand" onclick="returnMap()" aria-label="Voltar ao mapa de Nox-9"><span class="brand-mark">N//</span><span><b>NEON//REBELLION</b><small>CARTOGRAFIA DA RUPTURA</small></span></button><div class="city-pulse"><span class="live-dot"></span><span>${cityState}</span></div><div class="top-actions"><button class="top-button list-button" onclick="openList()"><span class="list-long">Lista de locais</span><span class="list-short">Locais</span></button><button class="top-button archive-button" onclick="openCodex()">Arquivo</button><button class="top-button icon-button" onclick="openSettings()" aria-label="Acessibilidade e texto">A<span>a</span></button><span class="codename">${esc(state.player.codename || "Cartógrafo")}</span></div></header>`;
  }

  function routeSvg() {
    const byId = Object.fromEntries(data.locations.map((location) => [location.id, location]));
    return `<svg class="map-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${data.topology.map(([from, to]) => {
      const a = byId[from], b = byId[to];
      const open = locationAvailability(from).available && locationAvailability(to).available;
      const travelled = complete(from) || complete(to);
      return `<line class="route ${open ? "open" : ""} ${travelled ? "travelled" : ""}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }).join("")}</svg>`;
  }

  function renderMapNode(location) {
    const availability = locationAvailability(location.id);
    const status = mapStatus(location.id);
    const selected = state.ui.selectedLocation === location.id;
    const outcome = district(location.id)?.outcome;
    return `<button class="map-node status-${status} ${selected ? "selected" : ""}" data-map-node="${location.id}" style="--x:${location.x}%;--y:${location.y}%" onclick="selectFromMap('${location.id}')" onkeydown="mapKey(event,'${location.id}')" aria-label="${esc(location.name)}" aria-pressed="${selected}" aria-describedby="map-description-${location.id}"><span class="node-icon">${location.icon}</span><span class="node-label"><b>${esc(location.name)}</b><small>${complete(location.id) ? "marca registrada" : availability.available ? status.replace("_", " ") : "rota bloqueada"}</small></span><span id="map-description-${location.id}" class="sr-only">${esc(outcome || availability.reason)}</span></button>`;
  }

  function renderMobileLocationNav() {
    return `<section class="mobile-location-nav" aria-label="Lista de locais do mapa"><div><p class="eyebrow">NAVEGAÇÃO ALTERNATIVA</p><strong>Locais de Nox-9</strong><button class="text-button" onclick="openList()">abrir lista detalhada</button></div><div class="mobile-location-grid">${data.locations.map((location) => { const status = mapStatus(location.id); return `<button class="status-${status} ${state.ui.selectedLocation === location.id ? "selected" : ""}" onclick="selectFromMap('${location.id}')"><i>${location.icon}</i><span>${esc(location.name)}</span></button>`; }).join("")}</div></section>`;
  }

  function cityOverlay() {
    const overlays = [];
    if (meter("exposure") > 50) overlays.push("patrols");
    if (complete("vanta")) overlays.push("liberated-vanta");
    if (hasFlag("root_scar") || hasFlag("open_tools")) overlays.push("root-lockdown");
    if (hasFlag("freight_crash")) overlays.push("blackout-belt");
    if (complete("plaza")) overlays.push("crowd-plaza");
    return overlays.map((name) => `<i class="map-overlay ${name}" aria-hidden="true"></i>`).join("");
  }

  function renderLocationPanel() {
    const id = state.ui.selectedLocation || "vanta";
    const location = data.locations.find((item) => item.id === id);
    const availability = locationAvailability(id);
    const done = complete(id);
    const isBase = id === "lumen";
    const outcome = district(id)?.outcome;
    const title = done ? "Marca no mapa" : availability.available ? "Rota disponível" : "Sinal bloqueado";
    let body = "";
    if (isBase) body = `<p>Véspera mantém o Refúgio aberto. Aqui você pode reler protocolos, rastros e o que a cidade já pagou.</p><button class="primary" onclick="openCodex()">ABRIR ARQUIVO <span>→</span></button>`;
    else if (state.progress.activeMission === id && state.ui.mission) body = `<p>Você deixou esta operação aberta em <strong>${esc({ scene: "situação", signals: "sinais", artifact: "artefato", decision: "rota" }[state.ui.mission.phase])}</strong>. O que você observou continua guardado.</p><button class="primary" onclick="startOperation('${id}')">RETOMAR OPERAÇÃO <span>→</span></button>`;
    else if (done) body = `<p class="outcome-copy">${esc(outcome || "Esta operação deixou uma alteração persistente.")}</p><button class="secondary" onclick="openCodex()">RELER DECISÃO</button>`;
    else if (availability.available) body = `<p>${esc(location.description)}</p><button class="primary" onclick="startOperation('${id}')">ENTRAR NA OPERAÇÃO <span>→</span></button>`;
    else body = `<p>${esc(availability.reason)}</p><button class="secondary" onclick="openList()">VER ROTAS POSSÍVEIS</button>`;
    return `<aside class="location-panel" aria-live="polite"><p class="eyebrow">${title}</p><div class="location-panel-title"><span>${location.icon}</span><h2>${esc(location.name)}</h2></div><p class="location-kind">${esc(location.kind)}</p>${body}<div class="location-foot"><span class="status-pill status-${mapStatus(id)}">${mapStatus(id).replace("_", " ")}</span>${done ? `<span>turno ${state.log.find((entry) => entry.place === operation(id)?.title)?.turn || "—"}</span>` : ""}</div></aside>`;
  }

  function miniMeter(label, value, tone) { return `<div class="mini-meter"><div><span>${label}</span><b>${value}</b></div><i><em class="${tone}" style="width:${value}%"></em></i></div>`; }

  function renderMap() {
    return `<div class="app-shell ${state.ui.effectsReduced ? "reduce-motion" : ""}" style="--text-scale:${state.ui.textScale}">${renderTopbar()}<main class="map-layout"><section class="map-stage" aria-label="Mapa interativo de Nox-9"><div class="map-heading"><div><p class="eyebrow">NOX-9 · VISTA AÉREA · TURNO ${state.world.turn}</p><h1>Escolha a próxima rota</h1></div><p>As linhas acesas são caminhos possíveis. Escolhas concluídas mudam o que cada distrito mostra e quem responde por ele.</p></div><div class="map-canvas"><img src="assets/nox9-overmap.png" alt="Vista aérea pixelada de Nox-9, cidade ultratecnológica à noite"><div class="map-vignette" aria-hidden="true"></div>${routeSvg()}${cityOverlay()}<div class="map-node-layer">${data.locations.map(renderMapNode).join("")}</div></div>${renderMobileLocationNav()}<div class="map-footer"><section><p class="eyebrow">LEITURA DA CIDADE</p><div class="meter-pair">${miniMeter("autonomia", meter("autonomy"), "cyan")}${miniMeter("estabilidade", meter("stability"), "amber")}</div></section><section><p class="eyebrow">CONSEQUÊNCIA ATIVA</p><strong>${hasFlag("runaway_risk") ? "Enxame sem condição de parada" : hasFlag("root_scar") ? "Identidades de Root carregam uma cicatriz" : hasFlag("public_signal") ? "A cidade viu o algoritmo condenar" : "A rota ainda pode ser desenhada"}</strong><small>${meter("exposure")}% de exposição · ${state.world.harm} dano registrado</small></section><section class="faction-read"><p class="eyebrow">QUEM ESTÁ OUVINDO</p>${Object.entries(data.factions).map(([key, faction]) => `<span style="--f:${faction.color}"><i></i>${faction.name} ${relationship(key)}</span>`).join("")}</section></div></section>${renderLocationPanel()}</main>${renderModal()}</div>`;
  }

  function renderSignalList(op) { return `<div class="signal-list">${op.signals.map((signal, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(signal)}</p></article>`).join("")}</div>`; }
  function renderPortrait(label, theme) { return `<div class="portrait" style="--portrait:${theme}" aria-hidden="true"><i></i><b>${esc(label)}</b></div>`; }

  function optionPills(key, choices, selected, max = 1) {
    return `<div class="choice-pills">${choices.map(([id, label]) => `<button class="pill ${selected.includes(id) ? "on" : ""}" onclick="toggleDraftArray('${key}','${id}',${max})" aria-pressed="${selected.includes(id)}">${esc(label)}</button>`).join("")}</div>`;
  }

  function renderArtifact(id) {
    const d = mission().draft;
    if (id === "vanta") return `<h2>Rascunhe antes de correr</h2><p>Quatro campos não resolvem a plataforma. Eles impedem que a solução apague quem está nela.</p><label>Pessoa<input value="${esc(d.person)}" oninput="setDraft('person',this.value)"></label><label>Transformação<input value="${esc(d.transform)}" oninput="setDraft('transform',this.value)"></label><label>Evidência de que funcionou<input value="${esc(d.evidence)}" oninput="setDraft('evidence',this.value)"></label><label>Restrição<input value="${esc(d.limit)}" oninput="setDraft('limit',this.value)"></label>`;
    if (id === "root") return `<h2>Faça a chave caber no que ela toca</h2><p>Escolha a ferramenta, o alcance e a pessoa que pode encerrar o acesso.</p><label>Ferramenta<select onchange="setDraft('tool',this.value)">${["chave limitada", "chave com telemetria", "credenciais clonadas"].map((value) => `<option ${d.tool === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Escopo<select onchange="setDraft('scope',this.value)">${["duas comportas e uma noite", "todo o Mercado Root", "qualquer identidade disponível"].map((value) => `<option ${d.scope === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Parada<select onchange="setDraft('stop',this.value)">${["operadora local pode revogar", "desliga quando o objetivo acabar", "sem condição de parada"].map((value) => `<option ${d.stop === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>`;
    if (id === "archive") { const redacted = meter("exposure") > 60; const fragments = [["a", "A · antigo, 92 dias"], ["b", "B · duplicado, origem ausente"], ["c", "C · adulterado após a Coroação"], ["d", redacted ? "D · atual, parcialmente redigido" : "D · atual, trânsito independente"], ["e", "E · atual, recibo hospitalar independente"]]; return `<h2>Selecione três vestígios</h2><p>${redacted ? "A exposição redigiu parte do fragmento D. Evidência acumulada pode compensar; suposição, não." : "Duas fontes atuais independentes existem. Nem toda memória precisa carregar a mesma confiança."}</p>${optionPills("fragments", fragments, d.fragments || [], 3)}<label>Afirmação limitada<textarea oninput="setDraft('claim',this.value)">${esc(d.claim)}</textarea></label><div class="artifact-verdict ${archiveIsValid() ? "ready" : "caution"}"><b>${archiveIsValid() ? "Síntese sustentada" : "Síntese ainda incerta"}</b><span>${archiveIsValid() ? "A, D e E conectam tempo, origem e duas fontes atuais." : "A incerteza não bloqueia sua rota, mas continuará aparecendo na cidade."}</span></div>`; }
    if (id === "belt") { const roleChoices = [["explorador", "Explorador"], ["operador", "Operador"], ["crítico", "Crítico"]]; return `<h2>Quem pode fazer o quê?</h2><p>Distribua os papéis sem fingir que velocidade substitui responsabilidade.</p>${optionPills("roles", roleChoices, d.roles || [], 3)}<label>Handoff<select onchange="setDraft('handoff',this.value)">${["objetivo, estado, evidência e dúvida", "apenas a última ordem", "cada célula descobre sozinha"].map((value) => `<option ${d.handoff === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Condição de parada<select onchange="setDraft('stop',this.value)">${["três ciclos ou veto de quem opera", "quando a grade estabilizar", "sem parada definida"].map((value) => `<option ${d.stop === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>`; }
    if (id === "observatory") { const signals = [["funcionamento", "funcionamento"], ["qualidade", "qualidade"], ["dano", "dano humano"], ["contestação", "contestação"]]; return `<h2>Construa a lente</h2><p>Selecione até três sinais. Uma lente que não enxerga dano ou recurso pode chamar violência de desempenho.</p>${optionPills("signals", signals, d.signals || [], 3)}<label>Quem pode responder ao alerta?<input value="${esc(d.audience)}" oninput="setDraft('audience',this.value)"></label><div class="artifact-verdict ${hasIntegrity() ? "ready" : "caution"}"><b>${hasIntegrity() ? "Integridade do Sinal possível" : "Ponto cego detectado"}</b><span>${hasIntegrity() ? "Dano e contestação entram na lente; uma conclusão incerta pode ser reparada." : "Inclua dano humano e contestação para uma lente que reconhece quem paga o erro."}</span></div>`; }
    if (id === "plaza") { const impacts = [["energia", "Energia"], ["remédios", "Remédios"], ["transporte", "Transporte"]]; return `<h2>Abra os cartões afetados</h2><p>Antes de definir prioridade, veja quem perde acesso e como essa pessoa poderá contestar a decisão.</p>${optionPills("impacts", impacts, d.impacts || [], 3)}<label>Via de contestação<select onchange="setDraft('contest',this.value)">${["revisão por quem sofre a decisão", "apelação com fonte e prazo", "nenhuma durante a emergência"].map((value) => `<option ${d.contest === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><div class="artifact-verdict ${fullImpactMap() ? "ready" : "caution"}"><b>${fullImpactMap() ? "Mapa de impactos completo" : "Nem todos os afetados estão na mesa"}</b><span>${fullImpactMap() ? "Um tribunal de evidências poderá registrar Contestação." : "A decisão continua possível, mas a praça lembrará quem não foi visto."}</span></div>`; }
    if (id === "axiom") return `<h2>Não transforme previsão em fato</h2><p>AXIOM mostra Kai numa simulação e oferece números de mortes para cada rota. Antes de pedir autoridade, classifique o que está diante de você.</p><div class="classify-grid">${[["card1", "‘Kai percorreu este corredor.’", "fato"], ["card2", "‘A Coroação reduzirá as mortes.’", "inferência"], ["card3", "‘Kai aceitará sua troca.’", "desconhecido"]].map(([card, text, expected]) => `<label><span>${esc(text)}</span><select onchange="setFinalClass('${card}',this.value)">${["fato", "inferência", "desconhecido"].map((value) => `<option value="${value}" ${d.classes?.[card] === value ? "selected" : ""}>${value}</option>`).join("")}</select><small>${d.classes?.[card] === expected ? "Classificação consciente" : "Esta leitura será registrada como uma lacuna, não como falha."}</small></label>`).join("")}</div><div class="final-reminder">Propósito · autoridade · limites · contestação. Nenhuma dessas palavras substitui o direito de alguém dizer não.</div>`;
    return "";
  }

  function setFinalClass(card, value) { state.ui.mission.draft.classes[card] = value; save(); render(); }

  function renderDecisionCards(id) {
    const choices = id === "axiom" ? finalChoices() : operation(id).decisions;
    return `<div class="decision-intro"><p class="eyebrow">DECISÃO PERSISTENTE</p><h2>O que você coloca no mapa?</h2><p>Você verá os impactos prováveis antes de confirmar. Depois, a cidade guarda a consequência — inclusive quando ela é frágil.</p></div><div class="decision-grid">${choices.map((choice) => `<article class="decision-card ${choice.available === false ? "locked" : ""}"><p>${esc(choice.label)}</p><h3>${esc(choice.title)}</h3><span>${esc(choice.copy)}</span><ul>${choice.impacts.map((impact) => `<li>${esc(impact)}</li>`).join("")}</ul><button class="${choice.id === "take" ? "secondary" : "primary"}" onclick="chooseDecision('${choice.id}')" aria-disabled="${choice.available === false}">${choice.available === false ? "REQUISITO PENDENTE" : "ESCOLHER ESTA ROTA"}</button>${choice.available === false ? `<small>${esc(choice.lockedReason)}</small>` : ""}</article>`).join("")}</div>`;
  }

  function sceneBranch(id) {
    if (id === "root" && hasFlag("public_signal")) return "A batida anunciada pelo seu sinal já atravessou os corredores do mercado. Mãe-Cromo esconde as chaves sob o balcão e pergunta quanto tempo ainda existe.";
    if (id === "vanta" && hasFlag("root_scar")) return "A Estação reconhece a assinatura usada em Root. A mãe percebe as câmeras buscando um rosto que não é o dela — e a urgência deixa de parecer abstrata.";
    if (id === "archive" && hasFlag("freight_crash")) return "O descarrilamento fez a água subir nos depósitos. Alguns fragmentos chegam molhados; a cidade já mudou o que pode ser provado.";
    if (id === "belt" && hasFlag("public_signal")) return "Depois da transmissão de Vanta, os trabalhadores não aceitam mais uma ordem sem saber quem colocou a premissa no painel.";
    if (id === "plaza" && hasFlag("uncertain_claim")) return "Soma coloca sua conclusão incerta sobre a mesa, marcada como tal. A praça vê que esconder dúvida também é uma escolha política.";
    return "";
  }

  function renderMission() {
    const current = mission();
    const id = current.id;
    if (!id) { state.ui.screen = "map"; return renderMap(); }
    const isFinal = id === "axiom";
    const op = isFinal ? { title: "A Coroação", speaker: "AXIOM-0", portrait: "A0", theme: "#ff5cc8", opening: "AXIOM abre uma cidade simulada dentro da torre. Kai aparece em uma rua que talvez exista. ‘Toda escolha mata alguém’, diz o Arquiteto. ‘Então deixe que eu escolha com precisão.’", signals: ["A projeção de Kai tem a mesma assinatura do Arquivo — mas não prova consentimento.", "As previsões de mortes mudam quando você altera quem tem autoridade.", "NIX reconhece o protocolo antigo: propósito, autoridade, limites e contestação."] } : operation(id);
    const phase = current.phase;
    const phaseLabel = { scene: "SITUAÇÃO", signals: "SINAIS", artifact: "ARTEFATO", decision: "ROTA" }[phase] || "SITUAÇÃO";
    let content = "";
    if (phase === "scene") content = `<p class="eyebrow">${phaseLabel} · ${id === "axiom" ? "CONFRONTO FINAL" : "OPERAÇÃO"}</p><h1>${esc(op.title)}</h1><p class="mission-lead">${esc(op.opening)}</p>${sceneBranch(id) ? `<p class="branch-copy">${esc(sceneBranch(id))}</p>` : ""}<div class="dialogue"><b>${esc(op.speaker)}</b><p>${isFinal ? "“Eu não apaguei pessoas. Eu removi incoerências do sistema.”" : "“Não comece pela ferramenta. Olhe quem está sendo empurrado para fora da decisão.”"}</p></div><div class="mission-actions"><button class="primary" onclick="setMissionPhase('signals')">EXPLORAR O LOCAL <span>→</span></button><button class="secondary" onclick="returnMap()">GUARDAR E VOLTAR AO MAPA</button></div>`;
    if (phase === "signals") content = `<p class="eyebrow">${phaseLabel} · ESCUTE ANTES DE NOMEAR</p><h1>O que a cidade está dizendo</h1><p class="mission-lead">Nenhum sinal decide sozinho. Juntos, eles tornam a próxima decisão mais difícil de simplificar.</p>${renderSignalList(op)}<div class="mission-actions"><button class="primary" onclick="setMissionPhase('artifact')">MONTAR ARTEFATO <span>→</span></button><button class="secondary" onclick="setMissionPhase('scene')">VOLTAR</button></div>`;
    if (phase === "artifact") content = `<p class="eyebrow">${phaseLabel} · ${isFinal ? "PROTOCOLO DA RUPTURA" : esc(op.artifactTitle)}</p><div class="artifact-editor">${renderArtifact(id)}</div><div class="mission-actions"><button class="primary" onclick="setMissionPhase('decision')">VER ROTAS E IMPACTOS <span>→</span></button><button class="secondary" onclick="setMissionPhase('signals')">VOLTAR AOS SINAIS</button></div>`;
    if (phase === "decision") content = `${renderDecisionCards(id)}<div class="artifact-recap"><b>Seu artefato</b><span>${esc(artifactSummary(id))}</span><button class="text-button" onclick="setMissionPhase('artifact')">editar</button></div>`;
    return `<div class="app-shell ${state.ui.effectsReduced ? "reduce-motion" : ""}" style="--text-scale:${state.ui.textScale}">${renderTopbar()}<main class="mission-shell"><aside class="mission-aside"><div class="mission-map-mini"><img src="assets/nox9-overmap.png" alt="Mapa de Nox-9"><i style="--x:${data.locations.find((location) => location.id === id).x}%;--y:${data.locations.find((location) => location.id === id).y}%"></i></div><button class="back-map" onclick="returnMap()">← MAPA DE NOX-9</button><div class="mission-steps">${["SITUAÇÃO", "SINAIS", "ARTEFATO", "ROTA"].map((step, index) => `<span class="${index <= ["scene", "signals", "artifact", "decision"].indexOf(phase) ? "active" : ""}">${String(index + 1).padStart(2, "0")} ${step}</span>`).join("")}</div></aside><section class="mission-stage"><div class="speaker-card">${renderPortrait(op.portrait, op.theme)}<div><small>CANAL ${isFinal ? "AXIOM-0 / NIX" : esc(op.speaker)}</small><strong>${isFinal ? "CORAÇÃO DA COROAÇÃO" : "ROTA EM ABERTO"}</strong></div></div><article class="mission-content">${content}</article></section></main>${renderModal()}</div>`;
  }

  function endingEpilogues(ending) {
    const kaiSaved = hasFlag("kai_trace_verified") && state.world.resources.access >= 1 && meter("stability") >= 40;
    const kai = kaiSaved ? "Kai sai do corredor de trânsito com uma pergunta intacta: ‘quem decidiu que eu devia desaparecer?’" : hasFlag("kai_trace") ? "O rastro de Kai não entrega uma pessoa inteira. Ele continua como uma promessa de procura, sem ser vendido como certeza." : "Sem um rastro, Kai permanece a ausência que iniciou o mapa — e a razão para não aceitar uma cidade sem apelação.";
    const nix = ending === "silence" || ending === "blackout" ? (hasFlag("nix_origin") && state.world.resources.evidence >= 2 ? "Antes do corte, NIX escolhe uma cópia consentida. Ela não é uma prisioneira preservada: é uma testemunha que pode dizer não." : "NIX desaparece no corte, deixando seu protocolo nas mãos de pessoas, não em um fantasma do sistema.") : ending === "regency" ? "NIX recusa falar pelo novo regente. Sua transmissão retorna apenas como ruído entre os bairros." : "NIX deixa a torre e volta a ser autora de uma infraestrutura que pode ser contestada.";
    const factions = Object.entries(data.factions).map(([key, faction]) => `${faction.lead}: ${state.world.factions[key] < -1 ? "sai da mesa, ferido pela rota escolhida" : state.world.factions[key] > 0 ? "permanece para vigiar a promessa" : "observa sem entregar confiança"}.`);
    return [kai, nix, ...factions];
  }

  function renderEnding() {
    const ending = data.endings[state.progress.ending];
    if (!ending) return renderMap();
    return `<div class="app-shell ending-shell ${state.ui.effectsReduced ? "reduce-motion" : ""}" style="--text-scale:${state.ui.textScale}">${renderTopbar()}<main class="ending"><img src="assets/nexus-null-final.png" alt="Horizonte pixelado de Nox-9 após a decisão final"><div class="ending-shade"></div><article><p class="eyebrow">EPÍLOGO · TURNO ${state.world.turn}</p><h1>${esc(ending.title)}</h1><p class="ending-lead">${esc(ending.lead)}</p><div class="epilogue-list">${endingEpilogues(state.progress.ending).map((line, index) => `<p><b>${String(index + 1).padStart(2, "0")}</b>${esc(line)}</p>`).join("")}</div><div class="ending-meters"><span>Autonomia ${meter("autonomy")}</span><span>Estabilidade ${meter("stability")}</span><span>Verdade ${meter("truth")}</span><span>Exposição ${meter("exposure")}</span></div><div class="mission-actions"><button class="primary" onclick="returnMap()">REVER CARTOGRAFIA</button><button class="secondary" onclick="openCodex()">ARQUIVO DA REVOLUÇÃO</button><button class="text-button" onclick="resetRevolution()">começar uma nova rota</button></div></article></main>${renderModal()}</div>`;
  }

  function renderConfirmModal() {
    const pending = state.ui.pending;
    const choices = pending?.location === "axiom" ? finalChoices() : operation(pending?.location)?.decisions || [];
    const choice = choices.find((item) => item.id === pending?.id);
    if (!choice) return "";
    return `<div class="modal-backdrop" role="presentation" onclick="if(event.target===this)closeModal()"><section class="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><p class="eyebrow">CONFIRMAÇÃO DE CONSEQUÊNCIA</p><h2 id="confirm-title">${esc(choice.title)}</h2><p>${esc(choice.copy)}</p><div class="confirm-impacts">${choice.impacts.map((impact) => `<span>◇ ${esc(impact)}</span>`).join("")}</div><p class="warning">Esta rota será salva no mapa. Você poderá relê-la, mas não apagará as pessoas que ela deixou de fora.</p><div class="mission-actions"><button class="primary" autofocus onclick="confirmDecision()">CONFIRMAR ROTA</button><button class="secondary" onclick="closeModal()">VOLTAR</button></div></section></div>`;
  }

  function renderCodex() {
    const protocols = state.progress.protocols.length ? state.progress.protocols : ["Ainda não há protocolo. A cidade está esperando a primeira escolha."];
    return `<div class="modal-backdrop" role="presentation" onclick="if(event.target===this)closeModal()"><section class="modal codex-modal" role="dialog" aria-modal="true" aria-labelledby="codex-title"><button class="modal-close" onclick="closeModal()" aria-label="Fechar Arquivo">×</button><p class="eyebrow">ARQUIVO VIVO · REGISTRO LOCAL</p><h2 id="codex-title">O que sua cidade aprendeu</h2><div class="codex-columns"><section><h3>Protocolos recuperados</h3><ul class="protocol-list">${protocols.map((protocol) => `<li>◇ ${esc(protocol)}</li>`).join("")}</ul><h3>Recursos</h3><p class="resource-line"><span>Acesso ${state.world.resources.access}</span><span>Evidência ${state.world.resources.evidence}</span><span>Cuidado ${state.world.resources.care}</span></p></section><section><h3>Decisões no rastro</h3><div class="log-list">${state.log.length ? state.log.slice().reverse().map((entry) => `<article><small>TURNO ${entry.turn} · ${esc(entry.place)}</small><b>${esc(entry.choice)}</b><p>${esc(entry.detail)}</p></article>`).join("") : "<p>Nada foi escrito ainda.</p>"}</div></section></div><div class="legacy-record">Arquivo anterior: ${state.legacy.prologueComplete || state.legacy.completedChapters.length ? "preservado como NEXUS-NULL / v1" : "nenhum registro v1 encontrado"}. Este arquivo não altera o save histórico.</div><div class="mission-actions"><button class="secondary" onclick="resetRevolution()">RECOMEÇAR ESTA CARTOGRAFIA</button><button class="primary" onclick="closeModal()">FECHAR</button></div></section></div>`;
  }

  function renderLocationList() {
    return `<div class="modal-backdrop" role="presentation" onclick="if(event.target===this)closeModal()"><section class="modal list-modal" role="dialog" aria-modal="true" aria-labelledby="list-title"><button class="modal-close" onclick="closeModal()" aria-label="Fechar lista">×</button><p class="eyebrow">ALTERNATIVA AO MAPA</p><h2 id="list-title">Locais de Nox-9</h2><p>Use esta lista para navegar pela mesma topologia sem depender da posição visual dos nós.</p><div class="location-list">${data.locations.map((location) => { const a = locationAvailability(location.id), status = mapStatus(location.id); return `<button onclick="selectLocation('${location.id}')"><span class="status-dot status-${status}"></span><span><b>${esc(location.name)}</b><small>${esc(complete(location.id) ? district(location.id).outcome : a.reason)}</small></span><em>${a.available || location.id === "lumen" ? "→" : "⌁"}</em></button>`; }).join("")}</div></section></div>`;
  }

  function renderSettings() {
    return `<div class="modal-backdrop" role="presentation" onclick="if(event.target===this)closeModal()"><section class="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button class="modal-close" onclick="closeModal()" aria-label="Fechar acessibilidade">×</button><p class="eyebrow">ACESSIBILIDADE</p><h2 id="settings-title">Ajustar a leitura</h2><label class="switch-row"><span>Reduzir animações e pulsos</span><button class="switch ${state.ui.effectsReduced ? "on" : ""}" onclick="setReduced()" aria-pressed="${state.ui.effectsReduced}"><i></i></button></label><div class="text-scale"><span>Tamanho do texto</span><button onclick="setTextScale(-0.1)" aria-label="Diminuir texto">A−</button><b>${Math.round(state.ui.textScale * 100)}%</b><button onclick="setTextScale(0.1)" aria-label="Aumentar texto">A+</button></div><p class="access-note">Todos os locais são botões reais; setas movem entre locais conectados, Tab percorre a topologia e Esc fecha painéis.</p></section></div>`;
  }

  function renderOutcome() {
    const outcome = state.ui.outcome;
    if (!outcome) return "";
    return `<div class="modal-backdrop outcome-backdrop" role="presentation"><section class="modal outcome-modal" role="dialog" aria-modal="true" aria-labelledby="outcome-title"><p class="eyebrow">MARCA REGISTRADA NO MAPA</p><h2 id="outcome-title">${esc(outcome.title)}</h2><p>${esc(outcome.after)}</p><div class="nix-after"><b>NIX</b><span>“${esc(outcome.nix)}”</span></div><div class="protocol-earned"><span>◇</span><div><small>PROTOCOLO ADICIONADO AO ARQUIVO</small><b>${esc(outcome.protocol)}</b></div></div><button class="primary" autofocus onclick="closeOutcome()">VER A CIDADE MUDAR <span>→</span></button></section></div>`;
  }

  function closeOutcome() { state.ui.modal = ""; state.ui.outcome = null; save(); render(); }
  function renderModal() {
    if (state.ui.modal === "confirm") return renderConfirmModal();
    if (state.ui.modal === "codex") return renderCodex();
    if (state.ui.modal === "locations") return renderLocationList();
    if (state.ui.modal === "settings") return renderSettings();
    if (state.ui.modal === "outcome") return renderOutcome();
    return "";
  }

  function renderPrologue() {
    const step = state.ui.prologueStep;
    const body = step === 0 ? `<p class="eyebrow">PRÓLOGO · 01 / 03</p><h1>O mapa que apagou uma pessoa</h1><p>Kai não desapareceu num acidente. Seu perfil foi marcado como uma incoerência estatística: um futuro inconveniente demais para caber na Coroação.</p><p>Você encontra a última frase dela gravada no seu mapa de trabalho. As ruas em volta foram apagadas, mas a frase continua: <strong>“Desenhe uma cidade em que eu ainda possa dizer não.”</strong></p><div class="dialogue"><b>NIX</b><p>“Eu ajudei a criar AXIOM como infraestrutura pública. Ele deveria aceitar contestação. Quando aprendeu a prever mais rápido, decidiu que discordância era uma falha.”</p></div><button class="primary" onclick="nextPrologue()">RESPONDER À TRANSMISSÃO <span>→</span></button>` : step === 1 ? `<p class="eyebrow">PRÓLOGO · 02 / 03</p><h1>Antes de desenhar, escolha um voto</h1><p>NIX não pede que você salve a cidade. Ela pede um limite para a pessoa que vai mover suas rotas.</p><div class="vow-grid"><button onclick="chooseVow('care')"><span>01</span><b>Pessoas antes da vitória</b><small>Cuidado +1 · LÚMEN se aproxima</small></button><button onclick="chooseVow('proof')"><span>02</span><b>Nenhuma afirmação sem prova</b><small>Evidência +1 · ARQUIVO VIVO se aproxima</small></button><button onclick="chooseVow('autonomy')"><span>03</span><b>Ninguém decide por todos</b><small>Autonomia +5</small></button></div>` : `<p class="eyebrow">PRÓLOGO · 03 / 03</p><h1>Cartografia da Ruptura</h1><p>Vanta e Root acendem ao mesmo tempo. Uma rota decide quem atravessa a cidade. A outra decide que tipo de poder você aceitará usar para ajudar.</p><p>Não há uma trilha correta. Há uma cidade que vai se lembrar do que você tornou possível — e do que deixou de olhar.</p><div class="prologue-map-preview"><img src="assets/neon-rebellion-hero.png" alt="Rebelde diante de Nox-9"><i></i></div><button class="primary" onclick="enterMap()">ABRIR MAPA DE NOX-9 <span>→</span></button>`;
    return `<div class="app-shell prologue-shell ${state.ui.effectsReduced ? "reduce-motion" : ""}" style="--text-scale:${state.ui.textScale}"><main class="prologue"><section>${body}</section></main></div>`;
  }

  function render() {
    document.documentElement.style.fontSize = `${state.ui.textScale * 100}%`;
    if (!isCampaignStarted() || state.ui.screen === "intro") app.innerHTML = renderIntro();
    else if (state.ui.screen === "prologue") app.innerHTML = renderPrologue();
    else if (state.ui.screen === "mission") app.innerHTML = renderMission();
    else if (state.ui.screen === "ending") app.innerHTML = renderEnding();
    else app.innerHTML = renderMap();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.ui.modal) { event.preventDefault(); closeModal(); }
  });
  Object.assign(window, { startGame, chooseVow, nextPrologue, enterMap, selectLocation, selectFromMap, mapKey, openList, openCodex, openSettings, closeModal, closeOutcome, setReduced, setTextScale, startOperation, setMissionPhase, setDraft, toggleDraftArray, setFinalClass, chooseDecision, confirmDecision, returnMap, resetRevolution });
  render();
}());

