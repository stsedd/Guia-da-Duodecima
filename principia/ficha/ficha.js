/* ==========================================================================
   GUIA DA DUODÉCIMA · Ficha (janela "Minhas Fichas")

   - Regras: motor.js, copiado da Ficha Oficial (mesmos números, mesmas ações).
   - Dados: dados.js, lidos do Duodécima Core (com a cópia do Guia de reserva).
   - Este arquivo: armazenamento, importação/exportação, capa, painel de recursos,
     abas, gaveta e diálogos. Cada aba fica no seu arquivo (geral.js, poderes.js…).
   - Formato: o mesmo JSON da Ficha Oficial (schemaVersion 24). Fichas antigas
     passam pela mesma migração da oficial.
   ========================================================================== */
(() => {
  'use strict';

  const VERSAO = '1.1.0';
  const DB_NOME = 'guia_fichas_v2';
  const DB_ANTIGO = 'principia_fichas_v1';
  const HQ = 'assets/principia/hq/';
  const ARTE_GRUPO = { 'Triunviro': 'a-triunviros', 'Dii Consentis': 'a-dii-consentis', 'Dii Inferi': 'a-dii-inferi', 'Alati': 'a-alati', 'Ventis': 'a-ventis', 'Numina': 'a-numina' };
  const ACENTOS = [
    { id: 'legio', nome: 'Vermelho da Legião', c: '#d3112a', dia: '#b10e24', ink: '#fff' },
    { id: 'triunviros', nome: 'Ouro dos Triúnviros', c: '#d9a93a', dia: '#8a6418', ink: '#1c1205' },
    { id: 'consentis', nome: 'Púrpura dos Dii Consentis', c: '#b0457e', dia: '#8e2f62', ink: '#fff' },
    { id: 'inferi', nome: 'Violeta dos Dii Inferi', c: '#8a63d6', dia: '#5b3aa8', ink: '#fff' },
    { id: 'alati', nome: 'Bronze dos Alati', c: '#e0702a', dia: '#a84a12', ink: '#1c0d04' },
    { id: 'ventis', nome: 'Azul dos Ventis', c: '#4a9ade', dia: '#21679f', ink: '#04121e' },
    { id: 'numina', nome: 'Verde dos Numina', c: '#5aa866', dia: '#2f7a3d', ink: '#051207' }
  ];
  const ABAS = [
    ['geral', 'Visão geral'], ['poderes', 'Poderes'], ['arsenal', 'Arsenal'], ['magia', 'Magia'],
    ['companheiros', 'Companheiros'], ['roma', 'Roma'], ['diario', 'Diário']
  ];
  const ICO = {
    d20: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2.5 20.5 7.2v9.6L12 21.5 3.5 16.8V7.2z"/><path d="M12 2.5 7.5 15h9z"/><path d="M3.5 7.2 7.5 15l-4 1.8M20.5 7.2 16.5 15l4 1.8M7.5 15 12 21.5 16.5 15"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
    starO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.5 7 9 4.1-1.5 7-4.8 7-9V6z"/></svg>',
    target: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/></svg>'
  };

  function start() {
    const P = window.PRINCIPIA;
    const A = P && P.api;
    if (!A) return;
    const { esc, toast, WM, store } = A;
    const $ = (s, r = document) => r.querySelector(s);
    const win = $('.os-ficha');
    const body = $('#osFichaBody');
    const fileEl = $('#osFichaFile');
    const subEl = $('#osFichaSub');
    if (!win || !body || !fileEl || !WM.get('ficha')) return;
    const layer = document.createElement('div');
    layer.className = 'fg fg-layer';
    win.append(layer);
    fileEl.setAttribute('accept', '.json,application/json');

    const S = {
      dados: null, erroDados: null, carregando: false,
      lista: [], atual: null, rec: null, M: null, D: null,
      aba: (a => a === 'evolucao' ? 'geral' : a)(store.get('guia_ficha_aba', 'geral')),
      drawer: null, dialog: null, menu: false,
      criando: null, oficial: [], salvoEm: null, salvando: false,
      fx: {}, prev: {}, versaoSessao: new Set(), hudAberto: false
    };
    const FG = window.FichaGuia = { S, abas: {}, acoes: {}, ICO, esc, VERSAO };

    /* ---------------------------------------------------------------- utilidades */
    const sinal = n => (Number(n) >= 0 ? '+' : '−') + Math.abs(Number(n) || 0);
    const uid = p => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const num = v => Number(v) || 0;
    const attrsLista = [['for', 'FOR', 'Força'], ['des', 'DES', 'Destreza'], ['con', 'CON', 'Constituição'], ['int', 'INT', 'Inteligência'], ['fe', 'FÉ', 'Fé'], ['car', 'CAR', 'Carisma']];
    const godDe = id => (S.D?.gods || []).find(g => g.id === id) || null;
    const arteDe = godId => { const g = godDe(godId); return HQ + (ARTE_GRUPO[g?.group] || 'a-legio') + '.webp'; };
    const acentoDe = s => {
      const id = s?.appearance?.guiaAccent || 'legio';
      return ACENTOS.find(a => a.id === id) || ACENTOS[0];
    };
    Object.assign(FG, { sinal, uid, clamp, num, attrsLista, godDe, arteDe, ACENTOS, HQ });
    /* Mão de cartas: até 5 no Guia (a Ficha Oficial usa 3; decisão da Staff em 25/11/2026, em teste).
       O motor copiado continua com as 3 da Oficial, então a mão é lida por aqui. */
    FG.MAO = 5;
    FG.cartasNaMao = M => {
      const set = M.effectiveAbilitySet();
      const todas = [...(set?.passives || []), ...(set?.actives || [])];
      const porChave = new Map(todas.map(a => [M.abilityKey(a), a]));
      return (M.state.abilityDeck || []).slice(0, FG.MAO).map(k => porChave.get(k)).filter(Boolean);
    };
    /* Imagens embutidas na ficha (data URL, às vezes centenas de KB cada) viram um endereço curto em
       memória (blob:) criado uma vez só. Assim cada redesenho gera um HTML leve e o navegador reaproveita
       a imagem já decodificada, sem piscar nem travar no celular. O JSON da ficha não muda. */
    const blobs = new Map();
    FG.src = url => {
      const u = String(url || '');
      if (!u.startsWith('data:') || u.length < 4096) return esc(u);
      let b = blobs.get(u);
      if (!b) {
        try {
          const i = u.indexOf(','), cab = u.slice(5, i);
          const bin = /;base64/i.test(cab) ? atob(u.slice(i + 1)) : decodeURIComponent(u.slice(i + 1));
          const arr = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
          b = URL.createObjectURL(new Blob([arr], { type: cab.split(';')[0] || 'image/png' }));
        } catch { return esc(u); }
        blobs.set(u, b);
        if (blobs.size > 300) { const [k, v] = blobs.entries().next().value; URL.revokeObjectURL(v); blobs.delete(k); }
      }
      return b;
    };

    /* ---------------------------------------------------------------- banco do navegador */
    function abrirDb(nome, versao, upgrade) {
      return new Promise((res, rej) => {
        if (!window.indexedDB) { rej(new Error('Este navegador não tem IndexedDB.')); return; }
        const r = indexedDB.open(nome, versao);
        r.onupgradeneeded = () => upgrade && upgrade(r.result);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    let dbp = null;
    const db = () => dbp || (dbp = abrirDb(DB_NOME, 1, d => {
      if (!d.objectStoreNames.contains('fichas')) d.createObjectStore('fichas', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('versoes')) { const v = d.createObjectStore('versoes', { keyPath: 'vid', autoIncrement: true }); v.createIndex('ficha', 'fichaId'); }
    }));
    async function tx(store, modo, fn) {
      const d = await db();
      return new Promise((res, rej) => {
        const t = d.transaction(store, modo);
        const out = fn(t.objectStore(store));
        t.oncomplete = () => res(out && 'result' in out ? out.result : undefined);
        t.onerror = () => rej(t.error);
        t.onabort = () => rej(t.error || new Error('Gravação interrompida.'));
      });
    }
    const dbTodas = () => tx('fichas', 'readonly', st => st.getAll());
    const dbPut = rec => tx('fichas', 'readwrite', st => st.put(rec));
    const dbDel = id => tx('fichas', 'readwrite', st => st.delete(id));
    async function guardarVersao(rec, motivo) {
      try {
        await tx('versoes', 'readwrite', st => st.add({ fichaId: rec.id, em: new Date().toISOString(), motivo, nome: rec.nome, data: JSON.parse(JSON.stringify(rec.data)) }));
        const todas = await tx('versoes', 'readonly', st => st.index('ficha').getAll(rec.id));
        const sobra = (todas || []).sort((a, b) => a.vid - b.vid).slice(0, -12);
        if (sobra.length) await tx('versoes', 'readwrite', st => { sobra.forEach(v => st.delete(v.vid)); });
      } catch (e) { console.warn('[Ficha] versão não guardada', e); }
    }
    const versoesDe = id => tx('versoes', 'readonly', st => st.index('ficha').getAll(id)).then(v => (v || []).sort((a, b) => b.vid - a.vid));
    Object.assign(FG, { versoesDe, dbPut, guardarVersao });
    // Fichas guardadas na conta de outra pessoa (computador compartilhado) não aparecem para quem está logado agora.
    const visivel = r => !FG.nuvem?.visivel || FG.nuvem.visivel(r);
    const lista = () => S.lista.filter(visivel);
    FG.listaVisivel = lista;

    /* Fichas importadas na prévia antiga (principia_fichas_v1) entram aqui uma única vez. */
    async function migrarPreviaAntiga() {
      if (store.get('guia_ficha_previa_migrada') === '1') return;
      try {
        const d = await abrirDb(DB_ANTIGO, 1, x => { if (!x.objectStoreNames.contains('fichas')) x.createObjectStore('fichas', { keyPath: 'id' }); });
        const antigas = await new Promise(res => { const r = d.transaction('fichas', 'readonly').objectStore('fichas').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); });
        for (const a of antigas) if (a?.data) await dbPut({ id: a.id, nome: a.name || a.data.name || 'Personagem', atualizadoEm: a.importedAt || new Date().toISOString(), origem: 'previa', data: a.data });
        d.close();
      } catch (e) { console.warn('[Ficha] prévia antiga não lida', e); }
      store.set('guia_ficha_previa_migrada', '1');
    }

    /* Fichas da Ficha Oficial no mesmo navegador (mesmo site no GitHub Pages). Só leitura. */
    async function lerFichasOficiais() {
      const out = [];
      const ler = async chave => {
        try {
          const raw = localStorage.getItem(chave);
          if (raw) return JSON.parse(raw);
          const d = await abrirDb('duodecima_character_large_v1', 1, x => { if (!x.objectStoreNames.contains('sheets')) x.createObjectStore('sheets'); });
          const v = await new Promise(res => { const r = d.transaction('sheets', 'readonly').objectStore('sheets').get(chave); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); });
          d.close();
          return v;
        } catch { return null; }
      };
      try {
        const reg = JSON.parse(localStorage.getItem('duodecima_character_registry_v1') || 'null');
        const itens = Array.isArray(reg?.characters) ? reg.characters : Array.isArray(reg?.items) ? reg.items : Array.isArray(reg) ? reg : [];
        for (const it of itens) {
          const chave = it.storageKey || it.key || (it.id ? `duodecima_character_v1_${it.id}` : null);
          if (!chave || it.deletedAt || it.trashed) continue;
          const data = await ler(chave);
          if (data && (data.name || data.isCreated)) out.push({ chave, nome: data.name || it.name || 'Personagem', data });
        }
        if (!out.length) {
          const data = await ler('duodecima_universal_stage4_v24');
          if (data && (data.name || data.isCreated)) out.push({ chave: 'duodecima_universal_stage4_v24', nome: data.name || 'Personagem', data });
        }
      } catch (e) { console.warn('[Ficha] não li a Ficha Oficial deste navegador', e); }
      return out;
    }

    /* ---------------------------------------------------------------- motor por personagem */
    function criarMotor(data) {
      const dadosP = window.FichaDados.prepararParaPersonagem(S.dados, data);
      const M = window.FichaMotor(dadosP, {
        save: () => agendarSalvar(),
        render: () => agendarRender(),
        notify: msg => toast(msg),
        prompt: (q, d) => window.prompt(q, d)
      });
      M.state = M.migrate(data || {});
      // A migração oficial corta a mão em 3 cartas; no Guia a mão guarda até FG.MAO (decisão da Staff).
      if (Array.isArray(data?.abilityDeck)) M.state.abilityDeck = [...new Set(data.abilityDeck.filter(x => typeof x === 'string'))].slice(0, FG.MAO);
      if (M.state.isCreated) M.syncCurrentCaps();
      return { M, D: dadosP };
    }
    FG.recriarMotor = () => {
      if (!S.M) return;
      const data = JSON.parse(JSON.stringify(S.M.state));
      const x = criarMotor(data);
      S.M = x.M; S.D = x.D;
    };
    function validarJson(data) {
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('O arquivo não é uma ficha.');
      if (!(data.baseAttributes || data.godId || data.originType || data.name)) throw new Error('O arquivo não parece uma ficha da Duodécima.');
      return data;
    }
    // Passa qualquer JSON de ficha pela migração oficial e devolve o estado pronto para guardar.
    FG.normalizar = data => JSON.parse(JSON.stringify(criarMotor(validarJson(data)).M.state));

    /* ---------------------------------------------------------------- carregar e abrir */
    // Uma carga só: quem chegar durante a carga espera a mesma promessa.
    let cargaDados = null;
    function garantirDados() {
      // Espera a carga inteira (regras + lista + última ficha aberta), não só as regras: senão quem chega
      // no meio (Criar ficha, ficha da Staff) é atropelado pela abertura da última ficha.
      if (cargaDados) return cargaDados;
      if (S.dados) return Promise.resolve();
      return cargaDados || (cargaDados = carregarDados().finally(() => { cargaDados = null; }));
    }
    // "Criar ficha" na barra do Guia: espera as regras e abre a criação.
    FG.novaFicha = async () => { await garantirDados(); if (S.dados) { FG.acoes.nova(); render(); } };
    async function carregarDados() {
      S.carregando = true;
      render();
      try {
        S.dados = await window.FichaDados.carregar();
        S.D = S.dados;
        await migrarPreviaAntiga();
        S.lista = (await dbTodas()).sort((a, b) => String(b.atualizadoEm).localeCompare(String(a.atualizadoEm)));
        S.oficial = await lerFichasOficiais();
        const alvo = store.get('guia_ficha_atual', '') || lista()[0]?.id;
        if (alvo && lista().some(r => r.id === alvo)) await abrir(alvo, true);
        else if (lista()[0]) await abrir(lista()[0].id, true);
        S.erroDados = null;
      } catch (e) {
        console.error('[Ficha]', e);
        S.erroDados = e?.message || String(e);
      }
      S.carregando = false;
      render();
      if (S.dados) FG.nuvem?.sincronizar?.();
    }
    async function abrir(id, silencioso) {
      const rec = S.lista.find(r => r.id === id);
      if (!rec) return;
      const x = criarMotor(rec.data);
      S.atual = id; S.rec = rec; S.M = x.M; S.D = x.D; S.drawer = null; S.criando = null; S.prev = {};
      store.set('guia_ficha_atual', id);
      if (!S.versaoSessao.has(id)) { S.versaoSessao.add(id); guardarVersao(rec, 'Ao abrir'); }
      if (!silencioso) render();
    }
    FG.abrir = abrir;
    // Ficha aberta só para consulta (Staff vendo a ficha de um jogador): não entra na lista, não é salva
    // neste navegador nem enviada à conta; some ao trocar de ficha ou em "Sair".
    FG.abrirTemporaria = async (data, rotulo) => {
      await garantirDados();
      const x = criarMotor(validarJson(data));
      S.rec = { id: 'temporaria', nome: x.M.state.name || 'Ficha', temporaria: true, rotulo: rotulo || 'só leitura', data: x.M.state };
      S.atual = null; S.M = x.M; S.D = x.D; S.drawer = null; S.criando = null; S.prev = {};
      render();
    };
    async function adicionarFicha(data, origem, opcoes = {}) {
      const x = criarMotor(validarJson(data));
      const rec = { id: uid('ficha'), nome: x.M.state.name || 'Personagem sem nome', atualizadoEm: new Date().toISOString(), origem, data: JSON.parse(JSON.stringify(x.M.state)) };
      if (opcoes.nuvem) rec.nuvem = opcoes.nuvem;
      await dbPut(rec);
      S.lista.unshift(rec);
      if (opcoes.abrir !== false) await abrir(rec.id, true);
      return rec;
    }
    FG.adicionarFicha = adicionarFicha;
    async function substituirFicha(rec, data, motivo = 'Antes de substituir por JSON') {
      await guardarVersao(rec, motivo);
      const x = criarMotor(validarJson(data));
      rec.data = JSON.parse(JSON.stringify(x.M.state));
      // Conteúdo novo: data própria, para a conta saber que precisa receber esta ficha.
      rec.data.updatedAt = new Date().toISOString();
      rec.nome = x.M.state.name || rec.nome;
      rec.atualizadoEm = rec.data.updatedAt;
      await dbPut(rec);
      await abrir(rec.id, true);
      FG.nuvem?.aoSalvar?.(rec, motivo);
    }
    FG.substituirFicha = substituirFicha;

    /* ---------------------------------------------------------------- salvar */
    let timerSalvar = null;
    function agendarSalvar() {
      if (!S.M || !S.rec || S.rec.temporaria) return;
      S.salvando = true;
      marcarSalvo();
      clearTimeout(timerSalvar);
      timerSalvar = setTimeout(salvarAgora, 500);
    }
    FG.salvar = agendarSalvar;
    async function salvarAgora() {
      clearTimeout(timerSalvar);
      if (!S.M || !S.rec || S.rec.temporaria) return;
      const rec = S.rec;
      if (S.M.state.roma) S.M.state.roma.fame = S.M.fameTotal();
      rec.data = JSON.parse(JSON.stringify(S.M.state));
      rec.data.updatedAt = new Date().toISOString();
      rec.nome = rec.data.name || rec.nome;
      rec.atualizadoEm = rec.data.updatedAt;
      try {
        await dbPut(rec);
        S.salvoEm = new Date();
        S.salvando = false;
        const ultima = Number(store.get('guia_ficha_versao_' + rec.id, '0'));
        if (Date.now() - ultima > 15 * 60 * 1000) { store.set('guia_ficha_versao_' + rec.id, String(Date.now())); guardarVersao(rec, 'Automática'); }
        FG.nuvem?.aoSalvar?.(rec);
      } catch (e) {
        S.salvando = false;
        toast('Não consegui salvar a ficha neste aparelho: ' + (e?.message || e));
      }
      marcarSalvo();
    }
    function marcarSalvo() {
      const el = $('.fg-save', body);
      if (!el) return;
      // Com a conta ativa, o selo mostra o estado da sincronização (nuvem.js); sem ela, o do navegador.
      const n = FG.nuvem?.rotulo?.(S.rec, S.salvando);
      for (const c of ['is-saving', 'is-ok', 'is-warn', 'is-bad', 'is-local']) el.classList.toggle(c, n ? n.classe === c : c === 'is-saving' && S.salvando);
      // "Navegador" confundia: para o jogador, o que importa é se a ficha está só aqui ou na conta.
      el.lastElementChild.textContent = n ? n.texto : S.salvando ? 'Salvando…' : 'Salva neste aparelho';
      el.title = n?.dica || (window.PRINCIPIA?.online?.ativo ? 'A ficha está salva só neste aparelho. Entre com o Discord para salvar na conta e abrir em qualquer lugar.' : 'A ficha está salva neste aparelho. Exporte o JSON para ter uma cópia.');
    }
    FG.marcarSalvo = marcarSalvo;
    window.addEventListener('beforeunload', () => { if (S.salvando) salvarAgora(); });

    /* ---------------------------------------------------------------- desenho */
    let renderFila = false;
    function agendarRender() {
      if (renderFila) return;
      renderFila = true;
      const run = () => { if (!renderFila) return; renderFila = false; render(); };
      requestAnimationFrame(run);
      setTimeout(run, 60);
    }
    FG.render = agendarRender;

    function aplicarAcento() {
      const a = acentoDe(S.M?.state);
      const dia = document.documentElement.dataset.theme === 'light';
      win.style.setProperty('--fg-accent', dia ? a.dia : a.c);
      win.style.setProperty('--fg-accent-ink', a.ink);
    }

    function topo() {
      const opts = lista().map(r => `<option value="${esc(r.id)}"${r.id === S.atual ? ' selected' : ''}>${esc(r.nome)}</option>`).join('');
      const nuvem = !!FG.nuvem?.ativa?.();
      return `<div class="fg-top">
        ${lista().length || S.rec?.temporaria ? `<select class="fg-in" data-a="trocar" aria-label="Personagem">${S.criando?.nova ? '<option selected>Nova ficha (em criação)</option>' : ''}${S.rec?.temporaria ? `<option selected>${esc(S.rec.nome)} (${esc(S.rec.rotulo)})</option>` : ''}${opts}</select>` : '<b class="fg-anton" style="font-size:20px">Minhas Fichas</b>'}
        <button class="fg-btn fg-btn--sm" type="button" data-a="nova">${ICO.plus}Nova</button>
        <button class="fg-btn fg-btn--sm" type="button" data-a="importar">Importar JSON</button>
        <span class="fg-spacer"></span>
        ${S.rec?.temporaria ? `<span class="fg-chip" title="Mudanças nesta ficha não são salvas">Só leitura · nada é salvo</span><button class="fg-btn fg-btn--sm" type="button" data-a="sair-temporaria">Sair</button>` : ''}
        ${S.M && S.rec && !S.criando && !S.rec.temporaria ? (nuvem
          ? `<button class="fg-save fg-save--btn" type="button" data-a="nuvem" role="status"><i></i><span>Salva neste aparelho</span></button>`
          : `<span class="fg-save" role="status"><i></i><span>Salva neste aparelho</span></span>`) : ''}
        <div class="fg-menu">
          <button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="menu" aria-label="Mais opções" aria-expanded="${S.menu}">${ICO.more}</button>
          <div class="fg-menu-list" role="menu"${S.menu ? '' : ' hidden'}>
            ${nuvem ? `<button class="fg-btn" type="button" role="menuitem" data-a="nuvem">Ficha na conta${FG.nuvem.faltando?.() ? ` (${FG.nuvem.faltando()} para baixar)` : ''}</button>` : ''}
            ${S.M ? `<button class="fg-btn" type="button" role="menuitem" data-a="exportar">Exportar JSON</button>
            <button class="fg-btn" type="button" role="menuitem" data-a="versoes">Versões salvas</button>
            <button class="fg-btn" type="button" role="menuitem" data-a="aparencia">Cor de destaque</button>` : ''}
            ${S.oficial.length ? `<button class="fg-btn" type="button" role="menuitem" data-a="oficial">Trazer da Ficha Oficial (${S.oficial.length})</button>` : ''}
            <button class="fg-btn" type="button" role="menuitem" data-a="guia-ao-lado">Abrir o Guia ao lado</button>
            ${S.M ? `<button class="fg-btn fg-btn--danger" type="button" role="menuitem" data-a="excluir">Excluir esta ficha</button>` : ''}
          </div>
        </div>
      </div>`;
    }

    function boasVindas() {
      return `<div class="fg-welcome">
        <span class="fg-seal" aria-hidden="true"></span>
        <h2>Sua ficha no Guia</h2>
        <p>Crie um personagem do zero, importe o JSON exportado pela Ficha Oficial ou traga as fichas que já estão neste navegador. As contas são as mesmas da Ficha Oficial.</p>
        <div class="fg-actions" style="justify-content:center">
          <button class="fg-btn fg-btn--pri" type="button" data-a="nova">${ICO.plus}Criar personagem</button>
          <button class="fg-btn" type="button" data-a="importar">Importar JSON</button>
          ${S.oficial.length ? `<button class="fg-btn" type="button" data-a="oficial">Trazer da Ficha Oficial (${S.oficial.length})</button>` : ''}
        </div>
        <p class="fg-muted" style="font-size:12.5px">${FG.nuvem?.ativa?.() ? 'Com a conta do Discord, a ficha fica salva na sua conta e abre em qualquer aparelho. Exportar o JSON continua sendo uma cópia de segurança extra.' : 'A ficha fica salva neste navegador, com cópias automáticas das últimas versões. Exportar o JSON continua sendo a cópia de segurança fora dele.'}</p>
      </div>`;
    }

    // Ficha só neste navegador, com a conta ativa: um aviso por ficha (some em "Agora não").
    function avisoConta() {
      if (!FG.nuvem?.ativa?.() || !S.rec || S.rec.temporaria || FG.nuvem.ligada(S.rec) || store.get('guia_ficha_aviso_conta_' + S.rec.id) === '1') return '';
      return `<div class="fg-aviso-conta" role="note"><span><b>${esc(S.rec.nome)}</b> ainda não está salva na sua conta: por enquanto, só existe neste aparelho. Salve na conta para abrir a ficha em qualquer lugar e para a fama aparecer na Tabula Famae.</span>
        <span class="fg-aviso-conta-acoes"><button class="fg-btn fg-btn--sm fg-btn--pri" type="button" data-a="nuvem">Salvar na conta</button><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="aviso-conta-fechar">Agora não</button></span></div>`;
    }

    function capa() {
      const M = S.M, s = M.state, g = M.god();
      const h = s.history || {};
      const mortal = M.isMortal();
      const tipo = s.lineage?.type || 'normal';
      const sub = M.secondaryGod();
      const kicker = mortal ? 'Mortal da Névoa'
        : tipo === 'direct' && sub ? `Legado direto · ${g.name} e ${sub.name}`
        : tipo === 'compound' && sub ? `Legado composto · ${g.name} e ${sub.name}`
        : `Prole de ${g?.name || '—'} · ${M.isTriumvir(s.godId) ? 'Triúnviros' : (g?.group || '')}`;
      const banner = h.bannerUrl
        ? `<img class="fg-hero-img" src="${FG.src(h.bannerUrl)}" alt="" style="object-position:${num(h.bannerPositionX ?? 50)}% ${num(h.bannerPositionY ?? 50)}%">`
        : `<img class="fg-hero-img is-art" src="${arteDe(s.godId)}" alt="">`;
      const retrato = h.portraitUrl ? `<img src="${FG.src(h.portraitUrl)}" alt="Retrato de ${esc(s.name)}">` : `<span class="fg-ini" aria-hidden="true">${esc(M.initials(s.name || '?'))}</span>`;
      const fama = M.fameTotal();
      const banda = M.fameBand();
      const rank = (S.D.roma?.legionRanks || []).find(r => r.id === s.roma?.legionRank);
      // "Outro / acima disso" é só a opção da lista: o cargo de verdade é o que foi escrito em "Outro cargo".
      const cargoProprio = (rank?.id === 'outro' || s.roma?.religioRank === 'outro') ? String(s.roma?.customRank || '').trim() : '';
      // Nível muda o tempo todo no servidor: fica à mão, com − / + e campo para digitar.
      const nivel = `<span class="fg-nivel" role="group" aria-label="Nível do personagem">
          <button type="button" data-a="nivel" data-d="-1" aria-label="Diminuir nível">−</button>
          <label>Nível <input type="number" inputmode="numeric" min="1" max="100" step="1" data-a="nivel-campo" value="${s.level}" aria-label="Nível"></label>
          <button type="button" data-a="nivel" data-d="1" aria-label="Aumentar nível">+</button>
        </span>`;
      const chips = [
        nivel,
        `<span class="fg-chip">BP ${sinal(M.bp())}</span>`,
        s.roma?.rebentoApproved ? '<span class="fg-chip fg-chip--gold">Rebento de Roma</span>' : '',
        banda?.name && fama ? `<span class="fg-chip">${esc(banda.name)} · ${sinal(fama)} fama</span>` : '',
        rank?.id && rank.id !== 'outro' ? `<span class="fg-chip">${esc(rank.name)}</span>` : '',
        cargoProprio ? `<span class="fg-chip">${esc(cargoProprio)}</span>` : '',
        s.roma?.cohort ? `<span class="fg-chip">${esc(s.roma.cohort)}</span>` : '',
        s.player ? `<span class="fg-chip">Jogador(a): ${esc(s.player)}</span>` : ''
      ].join('');
      // Como um perfil do Discord: a capa inteira em cima, o retrato metade sobre ela e o resto da identidade abaixo.
      return `<header class="fg-hero">
        <div class="fg-capa">
          ${banner}
          <div class="fg-hero-tools"><button class="fg-btn fg-btn--sm" type="button" data-a="aba" data-aba="diario">${ICO.edit}Capa e retrato</button></div>
        </div>
        <div class="fg-hero-in">
          <div class="fg-portrait">${retrato}<button class="fg-lvl" type="button" data-a="nivel-foco" title="Mudar o nível" aria-label="Nível ${s.level}: mudar">${s.level}</button></div>
          <div class="fg-id">
            <span class="fg-kicker">${esc(kicker)}</span>
            <h1 class="fg-name">${esc(s.name || 'Sem nome')}</h1>
            ${h.tagline ? `<p class="fg-tagline">${esc(h.tagline)}</p>` : ''}
            <div class="fg-chips">${chips}</div>
          </div>
        </div>
      </header>`;
    }

    function stat(kind, rotulo, icone, valor, max, nota, notaCls, barra, ajuste) {
      const fx = S.fx[kind] || '';
      return `<div class="fg-stat ${fx}" data-stat="${kind}">
        <div class="fg-stat-top"><span class="fg-label" style="display:inline-flex;align-items:center;gap:6px">${icone}${esc(rotulo)}</span>${ajuste ? '<span class="fg-label" aria-hidden="true" style="opacity:.6">±</span>' : ''}</div>
        <div class="fg-stat-num"><b>${valor}</b>${max != null ? `<small>/ ${max}</small>` : ''}</div>
        ${barra || ''}
        ${nota ? `<span class="fg-stat-note ${notaCls || ''}" title="${esc(nota)}">${esc(nota)}</span>` : ''}
        ${ajuste || ''}
      </div>`;
    }
    const ajusteBtns = alvo => `<div class="fg-stat-adj">
      <button type="button" data-a="ajuste" data-alvo="${alvo}" data-d="-5" aria-label="Menos 5">−5</button>
      <button type="button" data-a="ajuste" data-alvo="${alvo}" data-d="-1" aria-label="Menos 1">−1</button>
      <input type="text" inputmode="numeric" data-a="ajuste-campo" data-tecla data-alvo="${alvo}" placeholder="±" aria-label="Somar ou subtrair (ex.: -7, +3)">
      <button type="button" data-a="ajuste" data-alvo="${alvo}" data-d="1" aria-label="Mais 1">+1</button>
      <button type="button" data-a="ajuste" data-alvo="${alvo}" data-d="5" aria-label="Mais 5">+5</button>
    </div>`;
    function hud() {
      const M = S.M, s = M.state;
      const hpM = M.hpMax(), enM = M.energyMax();
      const pct = (v, m) => (m > 0 ? clamp(Math.round(v / m * 100), 0, 100) : 0) + '%';
      const morte = s.currentHp === 0 ? (s.death?.dead ? 'Morto' : s.death?.stable ? 'Estável em 0 HP' : 'Em 0 HP · testes contra a morte') : '';
      const eb = M.energyBand(), sb = M.sanityBand();
      const prevHp = S.prev.hp ?? s.currentHp;
      const partes = [
        stat('hp', 'Vida', ICO.heart, s.currentHp, hpM, morte || (s.exhaustion >= 5 ? 'Exaustão 5: HP máximo pela metade' : ''), morte ? 'is-bad' : '',
          `<div class="fg-bar"><i class="is-ghost" style="width:${pct(prevHp, hpM)}"></i><i style="width:${pct(s.currentHp, hpM)}"></i></div>`, ajusteBtns('hp')),
        stat('en', 'Energia', ICO.bolt, enM > 0 ? s.currentEnergy : '—', enM > 0 ? enM : null, eb?.name, /inconsciente/i.test(eb?.name || '') ? 'is-bad' : /desgast|exaust/i.test(eb?.name || '') ? 'is-warn' : '',
          enM > 0 ? `<div class="fg-bar fg-bar--en"><i style="width:${pct(s.currentEnergy, enM)}"></i></div>` : '', enM > 0 ? ajusteBtns('en') : ''),
        stat('san', 'Sanidade', ICO.eye, s.currentSanity, 100, sb?.name, /estável/i.test(sb?.name || '') ? 'is-ok' : /beira|perdido|louc/i.test(sb?.name || '') ? 'is-bad' : 'is-warn',
          `<div class="fg-bar fg-bar--san"><i style="width:${pct(s.currentSanity, 100)}"></i></div>`, ajusteBtns('san'))
      ];
      for (const r of M.hudResources()) {
        const max = M.resourceMaxFor(r), v = M.resourceValue(r), key = M.resourceKey(r);
        const pips = max > 0 && max <= 16 ? `<div class="fg-pips" aria-label="${v} de ${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</div>` : `<div class="fg-bar fg-bar--en"><i style="width:${pct(v, max)}"></i></div>`;
        partes.push(stat('rec-' + key, r.name, '', v, max, r.reset?.text ? 'Zera: ' + r.reset.text : '', '', pips,
          `<div class="fg-stat-adj"><button type="button" data-a="recurso" data-key="${esc(key)}" data-d="-1" aria-label="Menos 1 de ${esc(r.name)}">−1</button><button type="button" data-a="recurso" data-key="${esc(key)}" data-d="1" aria-label="Mais 1 de ${esc(r.name)}">+1</button></div>`));
      }
      partes.push(stat('def', 'Defesa', ICO.shield, sinal(M.defenseBonus()), null, `RD ${M.damageReduction()} · rolar 1d20 ${sinal(M.defenseBonus())}`, '', ''));
      partes.push(stat('dt', M.hasSheetCasting() ? 'DT' : 'Iniciativa', ICO.target, M.hasSheetCasting() ? M.castDT() : sinal(M.initiativeBonus()), null,
        M.hasSheetCasting() ? `Conjuração 1d20 ${sinal(M.castAttack())}` : 'Sem conjuração', '', ''));
      return `<div class="fg-hud${S.hudAberto ? ' is-open' : ''}" data-a="hud-toque">${partes.join('')}</div>`;
    }

    function abas() {
      const M = S.M, s = M.state;
      const set = M.effectiveAbilitySet();
      const cont = {
        poderes: (set?.passives?.length || 0) + (set?.actives?.length || 0),
        arsenal: (s.weapons?.length || 0) + (s.inventory?.items?.length || 0) + (s.armor?.equipped ? 1 : 0) + (s.shield?.equipped ? 1 : 0),
        magia: s.magic?.enabled ? (s.magic.spells || []).length : 0,
        companheiros: (s.familiars?.entries || []).length,
        // Na Visão geral, o número avisa o que ainda dá para gastar (pontos de atributo e talentos padrão).
        geral: Math.max(0, M.remainingLevelPoints() || 0) + Math.max(0, (M.talentSlotsEarned() || 0) - (M.standardTalentsUsed() || 0))
      };
      return `<nav class="fg-tabs" role="tablist" aria-label="Partes da ficha">${ABAS.map(([k, n]) => {
        if (k === 'magia' && !s.magic?.enabled && !M.isMortal()) return `<button class="fg-tab" type="button" role="tab" aria-selected="${S.aba === k}" data-a="aba" data-aba="${k}">${ICO.lock}${n}</button>`;
        return `<button class="fg-tab" type="button" role="tab" aria-selected="${S.aba === k}" data-a="aba" data-aba="${k}">${n}${cont[k] ? ` <small>${cont[k]}</small>` : ''}</button>`;
      }).join('')}</nav>`;
    }

    function ctx() { return { M: S.M, s: S.M?.state ?? null, D: S.D, S, FG, esc, ICO, sinal, num, clamp, uid, attrsLista }; }
    FG.ctx = ctx;

    function render() {
      aplicarAcento();
      const rolagem = body.scrollTop;
      let html = topo();
      if (S.carregando && !S.dados) html += '<div class="fg-loading"><span class="fg-spin" aria-hidden="true"></span>Carregando as regras do Core…</div>';
      else if (S.erroDados) html += `<div class="fg-welcome"><h2>Sem regras</h2><p>Não consegui carregar o Duodécima Core: ${esc(S.erroDados)}</p><button class="fg-btn fg-btn--pri" type="button" data-a="recarregar">Tentar de novo</button></div>`;
      else if (S.criando && FG.abas.criacao) html += FG.abas.criacao.render(ctx());
      else if (!S.M) html += boasVindas();
      else if (!S.M.state.isCreated && FG.abas.criacao) { S.criando = S.criando || { passo: 0 }; html += FG.abas.criacao.render(ctx()); }
      else {
        const aba = FG.abas[S.aba] ? S.aba : 'geral';
        let conteudo = '';
        try { conteudo = FG.abas[aba] ? FG.abas[aba].render(ctx()) : ''; }
        catch (e) { console.error('[Ficha] erro ao desenhar a aba', aba, e); conteudo = `<div class="fg-note fg-note--warn">Esta parte da ficha não abriu: ${esc(e?.message || e)}. Os dados continuam salvos.</div>`; }
        html += `${avisoConta()}${capa()}${hud()}${abas()}<div class="fg-pane" role="tabpanel">${conteudo}</div>`;
      }
      body.innerHTML = `<div class="fg">${html}</div>`;
      medirDock();
      body.scrollTop = rolagem;
      if (subEl) subEl.textContent = S.M ? (S.M.state.name || 'Sem nome') : 'Ficha da Duodécima';
      renderCamada();
      marcarSalvo();
      if (S.M) { S.prev.hp = S.M.state.currentHp; }
      if (Object.keys(S.fx).length) setTimeout(() => { S.fx = {}; }, 900);
    }
    FG.renderAgora = render;

    // A barra do topo e o painel de recursos mudam de altura (largura da janela, painel aberto no celular);
    // as abas ficam presas logo abaixo deles.
    const vigia = 'ResizeObserver' in window ? new ResizeObserver(() => medirDock(true)) : null;
    function medirDock(soMedir) {
      const raiz = body.firstElementChild;
      if (!raiz) return;
      const topo = raiz.querySelector('.fg-top'), hudEl = raiz.querySelector('.fg-hud');
      // No celular a barra do topo rola junto e só o painel fica preso (ver ficha.css).
      const a = topo && getComputedStyle(topo).position === 'sticky' ? topo.offsetHeight : 0;
      raiz.style.setProperty('--fg-top-h', a + 'px');
      raiz.style.setProperty('--fg-tabs-top', (a + (hudEl ? hudEl.offsetHeight : 0)) + 'px');
      if (vigia && !soMedir) { vigia.disconnect(); [body, topo, hudEl].forEach(e => e && vigia.observe(e)); }
    }

    /* ---------------------------------------------------------------- gaveta e diálogo */
    function renderCamada() {
      let html = '';
      if (S.drawer && S.M) {
        const fn = FG.gavetas?.[S.drawer.tipo];
        let conteudo = '';
        try { conteudo = fn ? fn(ctx(), S.drawer) : ''; } catch (e) { console.error(e); conteudo = `<div class="fg-drawer-body"><p>Não consegui abrir: ${esc(e?.message || e)}</p></div>`; }
        if (conteudo) html += `<div class="fg-drawer-back" data-a="fechar-gaveta"></div><aside class="fg-drawer" role="dialog" aria-modal="true">${conteudo}</aside>`;
        else S.drawer = null;
      }
      if (S.dialog) {
        const d = S.dialog;
        html += `<div class="fg-dialog" role="alertdialog" aria-modal="true" aria-labelledby="fgDlgT"><div class="fg-dialog-box">
          <h3 id="fgDlgT">${esc(d.titulo)}</h3>
          ${d.html || `<p>${esc(d.texto || '')}</p>`}
          <div class="fg-actions" style="justify-content:flex-end">${(d.botoes || []).map((b, i) => `<button class="fg-btn${b.pri ? ' fg-btn--pri' : ''}${b.perigo ? ' fg-btn--danger' : ''}" type="button" data-a="dlg" data-i="${i}">${esc(b.texto)}</button>`).join('')}</div>
        </div></div>`;
      }
      layer.innerHTML = html;
      // A camada cobre só o corpo da janela (a barra de título muda de altura no celular).
      if (html) layer.style.top = body.offsetTop + 'px';
      const foco = layer.querySelector('.fg-dialog [data-a="dlg"]:last-child, .fg-drawer .fg-btn');
      if (foco && (S.dialog || S.drawerFoco)) { foco.focus({ preventScroll: true }); S.drawerFoco = false; }
    }
    FG.abrirGaveta = (tipo, extra) => { S.drawer = { tipo, ...(extra || {}) }; S.drawerFoco = true; S.menu = false; renderCamada(); };
    FG.fecharGaveta = () => { S.drawer = null; renderCamada(); };
    FG.dialogo = opts => new Promise(res => { S.dialog = { ...opts, res }; renderCamada(); });
    FG.confirmar = (titulo, texto, sim = 'Confirmar', perigo = false) => FG.dialogo({ titulo, texto, botoes: [{ texto: 'Cancelar', v: false }, { texto: sim, v: true, pri: !perigo, perigo }] });

    /* ---------------------------------------------------------------- ações gerais */
    const acoes = FG.acoes;
    acoes.recarregar = () => { S.erroDados = null; garantirDados(); };
    acoes.trocar = async el => { await salvarAgora(); await abrir(el.value); };
    acoes.menu = () => { S.menu = !S.menu; render(); };
    acoes.importar = () => { S.menu = false; fileEl.value = ''; fileEl.click(); };
    acoes.nova = () => {
      S.menu = false;
      const x = criarMotor({});
      S.M = x.M; S.D = x.D; S.rec = null; S.atual = null; S.criando = { passo: 0, nova: true };
      render();
    };
    acoes.aba = el => { S.aba = el.dataset.aba; store.set('guia_ficha_aba', S.aba); S.drawer = null; render(); body.scrollTop = Math.min(body.scrollTop, inicioDoPainel()); };
    // Rolagem em que o começo da aba aparece logo abaixo da barra, do painel e das abas presas.
    function inicioDoPainel() {
      const pane = body.querySelector('.fg-pane'), tabs = body.querySelector('.fg-tabs');
      if (!pane || !tabs) return 0;
      const presas = parseFloat(body.firstElementChild?.style.getPropertyValue('--fg-tabs-top')) || 0;
      // Abas presas (desktop): o painel começa abaixo delas. Abas soltas (celular): as abas ficam visíveis.
      return Math.max(0, getComputedStyle(tabs).position === 'sticky' ? pane.offsetTop - presas - tabs.offsetHeight : tabs.offsetTop - presas);
    }
    acoes['fechar-gaveta'] = () => FG.fecharGaveta();
    acoes.dlg = el => { const d = S.dialog; if (!d) return; const b = d.botoes[Number(el.dataset.i)]; S.dialog = null; renderCamada(); d.res(b?.v); };
    acoes['guia-ao-lado'] = () => { S.menu = false; render(); A.tile ? A.tile(A.engineKey?.() || 'personagem') : A.openPage('personagem'); };
    acoes.exportar = () => {
      S.menu = false; render();
      salvarAgora();
      const s = S.M.state;
      const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `duodecima-${String(s.name || 'personagem').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'personagem'}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      toast('JSON exportado. Ele abre também na Ficha Oficial.');
    };
    acoes.excluir = async () => {
      S.menu = false; render();
      if (!S.rec) return;
      if (S.rec.temporaria) return acoes['sair-temporaria']();
      // Ficha guardada na conta: a pergunta é outra (só daqui ou também da conta) e fica com nuvem.js.
      const naConta = FG.nuvem?.ligada?.(S.rec);
      const ok = naConta ? await FG.nuvem.confirmarExclusao(S.rec)
        : await FG.confirmar('Excluir esta ficha?', `${S.rec.nome} sai deste aparelho. As versões salvas ficam guardadas por segurança; exporte o JSON antes se quiser uma cópia.`, 'Excluir', true);
      if (!ok) return;
      await guardarVersao(S.rec, 'Antes de excluir');
      await dbDel(S.rec.id);
      S.lista = S.lista.filter(r => r.id !== S.rec.id);
      S.M = null; S.rec = null; S.atual = null;
      store.del('guia_ficha_atual');
      if (lista()[0]) await abrir(lista()[0].id, true);
      render();
      toast(ok === 'conta' ? 'Ficha excluída deste aparelho e da conta.' : 'Ficha excluída deste aparelho.');
    };
    acoes.oficial = () => {
      S.menu = false;
      FG.abrirGaveta('oficial');
    };
    acoes['trazer-oficial'] = async el => {
      const item = S.oficial[Number(el.dataset.i)];
      if (!item) return;
      const existe = S.lista.find(r => r.nome === item.nome);
      if (existe) {
        const v = await FG.dialogo({ titulo: 'Já existe uma ficha com esse nome', texto: `${item.nome} já está no Guia. Substituir pela versão da Ficha Oficial ou trazer como outra ficha?`, botoes: [{ texto: 'Cancelar', v: null }, { texto: 'Trazer como outra', v: 'nova' }, { texto: 'Substituir', v: 'subst', pri: true }] });
        if (!v) return;
        if (v === 'subst') { await substituirFicha(existe, item.data); toast(`${item.nome} atualizado com a Ficha Oficial.`); S.drawer = null; render(); return; }
      }
      await adicionarFicha(item.data, 'oficial');
      toast(`${item.nome} trazido da Ficha Oficial.`);
      S.drawer = null;
      render();
    };
    acoes.versoes = async () => {
      if (S.rec?.temporaria) { S.menu = false; render(); toast('Esta ficha está aberta só para consulta e não tem versões aqui.'); return; }
      S.menu = false; render();
      FG.abrirGaveta('versoes', { lista: await versoesDe(S.rec.id), conta: FG.nuvem?.ligada?.(S.rec) ? 'carregando' : null });
      if (FG.nuvem?.ligada?.(S.rec)) {
        const conta = await FG.nuvem.versoes(S.rec).catch(e => ({ erro: e?.message || String(e) }));
        if (S.drawer?.tipo === 'versoes') { S.drawer.conta = conta; renderCamada(); }
      }
    };
    acoes['restaurar-versao'] = async el => {
      const v = (S.drawer?.lista || []).find(x => String(x.vid) === el.dataset.vid);
      if (!v) return;
      const ok = await FG.confirmar('Restaurar esta versão?', `A ficha volta ao estado de ${new Date(v.em).toLocaleString('pt-BR')}. A versão atual fica guardada antes.`, 'Restaurar');
      if (!ok) return;
      await substituirFicha(S.rec, v.data, 'Antes de restaurar uma versão');
      S.drawer = null;
      render();
      toast('Versão restaurada.');
    };
    acoes.aparencia = () => { S.menu = false; render(); FG.abrirGaveta('aparencia'); };
    acoes['acento'] = el => {
      S.M.state.appearance = { ...(S.M.state.appearance || {}), guiaAccent: el.dataset.id };
      agendarSalvar(); render();
    };
    acoes['nivel-campo'] = (el, ev) => {
      if (!S.M || ev.type !== 'change') return;
      const n = clamp(Math.round(Number(el.value) || S.M.state.level || 1), 1, 100);
      S.M.state.level = n;
      S.M.syncCurrentCaps();
      agendarSalvar(); render();
    };
    acoes['sair-temporaria'] = async () => { const v = lista()[0]; if (v) await abrir(v.id, true); else { S.M = null; S.rec = null; S.atual = null; } render(); };
    acoes['aviso-conta-fechar'] = () => { if (S.rec) store.set('guia_ficha_aviso_conta_' + S.rec.id, '1'); render(); };
    acoes['nivel-foco'] = () => { const i = body.querySelector('.fg-nivel input'); if (i) { i.focus(); i.select(); } };
    acoes['hud-toque'] =(el, ev) => { if (ev.type !== 'click' || ev.target.closest('button,input')) return; if (window.matchMedia('(max-width: 760px)').matches || body.clientWidth < 760) { S.hudAberto = !S.hudAberto; render(); } };
    function aplicarAjuste(alvo, delta, absoluto) {
      const M = S.M, s = M.state;
      if (alvo === 'hp') {
        const antes = s.currentHp;
        M.setHp(absoluto != null ? absoluto : s.currentHp + delta);
        if (s.currentHp < antes) S.fx.hp = 'is-hit'; else if (s.currentHp > antes) S.fx.hp = 'is-heal';
      } else if (alvo === 'en') {
        const antes = s.currentEnergy;
        M.setEnergy(absoluto != null ? absoluto : s.currentEnergy + delta);
        if (s.currentEnergy < antes) S.fx.en = 'is-hit'; else if (s.currentEnergy > antes) S.fx.en = 'is-heal';
      } else if (alvo === 'san') {
        const antes = s.currentSanity;
        M.setSanity(absoluto != null ? absoluto : s.currentSanity + delta);
        if (s.currentSanity < antes) S.fx.san = 'is-hit'; else if (s.currentSanity > antes) S.fx.san = 'is-heal';
      }
      agendarSalvar(); render();
    }
    acoes.ajuste = el => aplicarAjuste(el.dataset.alvo, Number(el.dataset.d));
    acoes['ajuste-campo'] = (el, ev) => {
      if (ev.type !== 'keydown' || ev.key !== 'Enter') return;
      ev.preventDefault();
      const t = String(el.value || '').trim().replace(',', '.').replace('−', '-');
      if (!t) return;
      const n = Number(t.replace(/^[+=]/, ''));
      if (!Number.isFinite(n)) { toast('Use um número, como -7 ou +3 (ou =20 para definir).'); return; }
      if (t.startsWith('=')) aplicarAjuste(el.dataset.alvo, 0, n);
      else aplicarAjuste(el.dataset.alvo, n);
    };
    acoes.recurso = el => {
      const r = S.M.hudResources().concat(S.M.targetResources()).find(x => S.M.resourceKey(x) === el.dataset.key);
      if (!r) return;
      S.M.setResourceValue(r, S.M.resourceValue(r) + Number(el.dataset.d));
      agendarSalvar(); render();
    };

    /* Campo genérico: data-a="campo" data-path="history.summary" (listas por id: weapons[id=x].name).
       data-tipo: texto (padrão) · num · bool · int. data-calc: recalcula a ficha (HP, energia…) e redesenha. */
    function caminho(obj, path, criar) {
      const partes = String(path).split('.');
      let alvo = obj;
      for (let i = 0; i < partes.length - 1; i++) {
        const p = partes[i];
        const m = p.match(/^(\w+)\[id=([^\]]+)\]$/);
        if (m) { alvo = (alvo[m[1]] || []).find(x => String(x.id) === m[2]); }
        else { if (alvo[p] == null && criar) alvo[p] = /^\d+$/.test(partes[i + 1]) ? {} : {}; alvo = alvo[p]; }
        if (alvo == null) return null;
      }
      return { alvo, chave: partes[partes.length - 1] };
    }
    FG.ler = (obj, path) => { const c = caminho(obj, path); return c ? c.alvo[c.chave] : undefined; };
    FG.gravar = (obj, path, valor) => { const c = caminho(obj, path, true); if (c) c.alvo[c.chave] = valor; return !!c; };
    acoes.campo = (el, ev) => {
      if (!S.M) return;
      const tipo = el.dataset.tipo || 'texto';
      let v;
      if (el.type === 'checkbox') v = el.checked;
      else if (tipo === 'num' || tipo === 'int') {
        v = el.value === '' ? 0 : Number(String(el.value).replace(',', '.'));
        if (!Number.isFinite(v)) v = 0;
        if (tipo === 'int') v = Math.round(v);
        if (el.min !== '' && el.min != null) v = Math.max(Number(el.min), v);
        if (el.max !== '' && el.max != null) v = Math.min(Number(el.max), v);
      } else v = el.value;
      FG.gravar(S.M.state, el.dataset.path, v);
      if (el.dataset.calc !== undefined) { S.M.syncCurrentCaps(); agendarSalvar(); if (ev.type !== 'input') render(); }
      else { agendarSalvar(); if (el.dataset.render !== undefined && ev.type !== 'input') render(); }
    };

    /* Gavetas gerais */
    FG.gavetas = FG.gavetas || {};
    FG.gavetas.oficial = c => `<div class="fg-drawer-body">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="fg-kicker">Ficha Oficial</span><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button></div>
      <h3>Trazer fichas deste navegador</h3>
      <p class="fg-muted">A Ficha Oficial guarda os personagens neste mesmo navegador. Trazer faz uma cópia para o Guia; a Ficha Oficial não muda.</p>
      <div class="fg-rows">${S.oficial.map((o, i) => `<div class="fg-row"><div class="fg-row-main"><b>${esc(o.nome)}</b><small>${esc(godDe(o.data.godId)?.name || (o.data.originType === 'mortal' ? 'Mortal da Névoa' : ''))} · nível ${num(o.data.level) || 1}</small></div><button class="fg-btn fg-btn--sm fg-btn--pri" type="button" data-a="trazer-oficial" data-i="${i}">Trazer</button></div>`).join('') || '<p class="fg-empty-line">Nenhuma ficha encontrada.</p>'}</div>
    </div>`;
    FG.gavetas.versoes = (c, d) => `<div class="fg-drawer-body">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="fg-kicker">Segurança</span><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button></div>
      <h3>Versões salvas</h3>
      ${d.conta ? `<div class="fg-sec-head"><b class="fg-label">Na conta</b></div>
      <p class="fg-muted" style="font-size:12.5px">A conta guarda a ficha anterior a cada 15 minutos de uso e antes de restaurar, substituir ou tirar da conta. Ficam as 20 mais recentes, em qualquer aparelho.</p>
      <div class="fg-rows">${d.conta === 'carregando' ? '<p class="fg-empty-line">Consultando a conta…</p>'
        : d.conta.erro ? `<p class="fg-empty-line">${esc(d.conta.erro)}</p>`
        : d.conta.map(v => `<div class="fg-row"><div class="fg-row-main"><b>${v.salva_em ? new Date(v.salva_em).toLocaleString('pt-BR') : 'Sem data'}</b><small>${esc(v.motivo || '')} · revisão ${num(v.revisao)}</small></div><button class="fg-btn fg-btn--sm" type="button" data-a="restaurar-versao-conta" data-id="${esc(v.id)}">Restaurar</button></div>`).join('') || '<p class="fg-empty-line">Nenhuma versão na conta ainda.</p>'}</div>
      <div class="fg-sec-head"><b class="fg-label">Neste navegador</b></div>` : ''}
      <p class="fg-muted">O Guia guarda uma cópia ao abrir a ficha, a cada 15 minutos de uso e antes de substituir ou excluir. Ficam as 12 mais recentes.</p>
      <div class="fg-rows">${(d.lista || []).map(v => `<div class="fg-row"><div class="fg-row-main"><b>${new Date(v.em).toLocaleString('pt-BR')}</b><small>${esc(v.motivo || '')} · nível ${num(v.data?.level) || 1} · ${num(v.data?.currentHp)} HP</small></div><button class="fg-btn fg-btn--sm" type="button" data-a="restaurar-versao" data-vid="${v.vid}">Restaurar</button></div>`).join('') || '<p class="fg-empty-line">Nenhuma versão ainda.</p>'}</div>
    </div>`;
    FG.gavetas.aparencia = c => {
      const atual = acentoDe(c.s).id;
      return `<div class="fg-drawer-body">
        <div style="display:flex;justify-content:space-between;align-items:center"><span class="fg-kicker">Aparência</span><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button></div>
        <h3>Cor de destaque</h3>
        <p class="fg-muted">Noite e Dia seguem o botão de tema do Guia. A cor de destaque é desta ficha: o vermelho da Legião é o padrão, e cada grupo de deuses tem a sua.</p>
        <div class="fg-rows">${ACENTOS.map(a => `<button class="fg-row" type="button" data-a="acento" data-id="${a.id}" aria-pressed="${a.id === atual}" style="cursor:pointer;text-align:left;${a.id === atual ? 'border-color:' + a.c : ''}"><i style="width:28px;height:28px;border-radius:8px;flex:none;background:${a.c}"></i><span class="fg-row-main"><b>${esc(a.nome)}</b></span>${a.id === atual ? '<small class="fg-label">em uso</small>' : ''}</button>`).join('')}</div>
      </div>`;
    };

    /* ---------------------------------------------------------------- eventos */
    function despachar(ev) {
      const el = ev.target.closest('[data-a]');
      if (!el || !(body.contains(el) || layer.contains(el))) return;
      const nome = el.dataset.a;
      const fn = acoes[nome];
      if (!fn) return;
      if (ev.type === 'keydown' && el.getAttribute('role') === 'button' && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); fn(el, ev, ctx()); return; }
      const tag = el.tagName;
      const campo = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (ev.type === 'click' && campo && el.type !== 'checkbox' && el.type !== 'radio') return;
      if (ev.type === 'change' && !campo) return;
      if (ev.type === 'input' && !(campo && el.dataset.vivo !== undefined)) return;
      if (ev.type === 'keydown' && !(campo && el.dataset.tecla !== undefined)) return;
      if (ev.type === 'click' && tag === 'BUTTON') ev.preventDefault();
      try { fn(el, ev, ctx()); } catch (e) { console.error('[Ficha]', nome, e); toast('Algo deu errado: ' + (e?.message || e)); }
    }
    for (const alvo of [body, layer]) {
      alvo.addEventListener('click', despachar);
      alvo.addEventListener('change', despachar);
      alvo.addEventListener('input', despachar);
      alvo.addEventListener('keydown', ev => { if (ev.key === 'Escape' && (S.drawer || S.dialog)) { if (S.dialog) { const d = S.dialog; S.dialog = null; renderCamada(); d.res(null); } else FG.fecharGaveta(); return; } despachar(ev); });
    }
    document.addEventListener('click', ev => { if (S.menu && !ev.target.closest('.fg-menu')) { S.menu = false; render(); } });

    fileEl.addEventListener('change', async () => {
      const files = [...(fileEl.files || [])];
      if (!files.length) return;
      await garantirDados();
      if (!S.dados || S.erroDados) {
        toast('Não consegui carregar as regras da ficha. Tente novamente antes de importar.');
        return;
      }
      for (const f of files) {
        try {
          if (f.size > 25 * 1024 * 1024) throw new Error('arquivo grande demais (máx. 25 MB).');
          const data = validarJson(JSON.parse(await f.text()));
          const existe = S.lista.find(r => r.nome === (data.name || ''));
          if (existe) {
            const v = await FG.dialogo({ titulo: 'Já existe uma ficha com esse nome', texto: `${existe.nome} já está no Guia. Substituir pelo arquivo ou criar outra ficha?`, botoes: [{ texto: 'Cancelar', v: null }, { texto: 'Criar outra', v: 'nova' }, { texto: 'Substituir', v: 'subst', pri: true }] });
            if (!v) continue;
            if (v === 'subst') { await substituirFicha(existe, data); toast(`${existe.nome} substituído pelo arquivo. A versão anterior ficou guardada.`); continue; }
          }
          const rec = await adicionarFicha(data, 'json');
          toast(`${rec.nome} importado.`);
        } catch (e) { toast(`Não consegui ler ${f.name}: ${e?.message || e}`); }
      }
      render();
    });
    body.addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); win.classList.add('is-drop'); } });
    body.addEventListener('dragleave', e => { if (!body.contains(e.relatedTarget)) win.classList.remove('is-drop'); });
    body.addEventListener('drop', e => {
      win.classList.remove('is-drop');
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      const dt = new DataTransfer();
      [...e.dataTransfer.files].forEach(f => dt.items.add(f));
      fileEl.files = dt.files;
      fileEl.dispatchEvent(new Event('change'));
    });
    new MutationObserver(() => { if (S.M) { aplicarAcento(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ---------------------------------------------------------------- janela */
    P.hooks = P.hooks || {};
    P.hooks.ficha = { open() { if (!S.dados) garantirDados(); else { render(); FG.nuvem?.sincronizar?.(); } } };
    // A Visão geral do Guia ("Lado a lado") e os links de regra abrem o Guia ao lado.
    FG.abrirRegra = (pagina, ancora) => (A.openBeside ? A.openBeside(pagina, ancora || null) : A.openPage(pagina, ancora || null));
    FG.salvarAgora = salvarAgora;
    FG.carregarDados = garantirDados;
    FG.renderCamada = renderCamada;
    window.dispatchEvent(new CustomEvent('fichaguia:pronta'));
  }

  if (window.PRINCIPIA && window.PRINCIPIA.api) start();
  else window.addEventListener('principia:ready', start, { once: true });
})();
