/* ==========================================================================
   GUIA DA DUODÉCIMA · Contas, Tabula Famae e Praetorium (Supabase)

   - Login com o Discord (escopos "identify" e "guilds"). O banco confere se a conta
     está no servidor da Duodécima; ninguém lê cargos. Quem não está entra como visitante.
   - Membros cadastram personagens e lançam fama com o link da mensagem no Discord;
     a fama total e o título são calculados pelo banco (regras do Guia).
   - Praetorium: painel da Staff. Esconder o ícone é só conforto visual: quem decide
     o que cada conta pode ler ou mudar é o banco (RLS + funções em supabase/schema.sql).
   - Sem configuração em principia/online-config.js, o site segue em modo visitante.
   ========================================================================== */
(() => {
  'use strict';

  const CFG = window.DUODECIMA_ONLINE || {};
  const ON = !!(CFG.supabaseUrl && CFG.supabaseKey);
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js';
  const SUPABASE_SRI = 'sha384-BWcjm9OdFth9TbhCxZPdm+gAOUMAzQy9nmTs12ioXdCcbVnJaPMn+fMUoQCLt60R';

  const TITULOS = {
    rebento: 'Rebento de Roma Aeterna',
    famoso: 'Famoso',
    influente: 'Influente',
    conhecido: 'Conhecido',
    nenhum: 'Sem título',
    odiado: 'Odiado'
  };
  const PANTEOES = [['romano', 'Romano'], ['grego', 'Grego'], ['celta', 'Celta'], ['nordico', 'Nórdico'], ['egipcio', 'Egípcio'], ['outro', 'Outro']];
  const COORTES = ['Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta'];
  const DEGRAUS = [[25, 'conhecido'], [50, 'influente'], [80, 'famoso'], [100, 'rebento']];
  const ORDEM = ['odiado', 'nenhum', 'conhecido', 'influente', 'famoso', 'rebento'];
  const COLS = 'id,jogador_id,nome,linhagem,panteao,divindade,coorte,publico,fama,titulo,elegivel_rebento,titulo_minimo,rebento_confirmado,criado_em,excluido_em';

  function start() {
    const P = window.PRINCIPIA;
    const A = P && P.api;
    if (!A) return;
    const { esc, toast, WM } = A;
    const $ = (s, r = document) => r.querySelector(s);
    const html = document.documentElement;

    const S = {
      sb: null, session: null, conta: null, carregando: ON, erro: null, tokenVisto: null,
      deuses: null, meus: [], fama: {}, aberto: null, novo: false, editando: null,
      tabula: null, tabulaEm: 0, filtro: { q: '', titulo: '', coorte: '' },
      adm: { aba: 'personagens', q: '', personagens: [], perfis: [], papeis: {}, fama: [], auditoria: [], editando: null, novo: false, carregado: false }
    };

    /* ---------- utilidades ---------- */
    const sinal = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
    const data = iso => { try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return ''; } };
    const dataHora = iso => { try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
    const uid = () => S.session?.user?.id || null;
    const ehStaff = () => S.conta?.papel === 'admin' || S.conta?.papel === 'dono';
    const ehDono = () => S.conta?.papel === 'dono';
    const ehMembro = () => !!S.conta?.membro;
    const nomeDeus = id => (S.deuses || []).find(d => d.id === id)?.nome || id || '';
    const titulo = t => TITULOS[t || 'nenhum'] || TITULOS.nenhum;
    const badge = (t, eleg) => `<span class="on-badge on-badge--${esc(t || 'nenhum')}">${esc(titulo(t))}</span>${eleg ? '<span class="on-badge on-badge--eleg" title="Atingiu 100 de fama: a Staff confirma o título">Elegível a Rebento</span>' : ''}`;
    function prole(p) {
      const partes = [];
      if (p.divindade) partes.push(`${p.linhagem === 'legado' ? 'Legado' : 'Prole'} de ${nomeDeus(p.divindade)}`);
      else partes.push(p.linhagem === 'legado' ? 'Legado' : 'Ainda não reclamado');
      if (p.panteao && p.panteao !== 'romano') partes.push((PANTEOES.find(x => x[0] === p.panteao) || [, p.panteao])[1]);
      if (p.coorte) partes.push(`${p.coorte} Coorte`);
      return partes.join(' · ');
    }
    // Barra até o próximo título ACIMA do atual (o título pode vir antes da fama: reclamação, Centurião).
    function progresso(f, atual) {
      const nivel = ORDEM.indexOf(atual || 'nenhum');
      if (atual === 'rebento') return { pct: 100, txt: 'Rebento de Roma Aeterna' };
      const prox = DEGRAUS.find(([n, t]) => ORDEM.indexOf(t) > nivel && f < n);
      if (!prox) return { pct: 100, txt: 'Pode pleitear o Rebento com a Staff' };
      const base = f < 0 ? Math.min(f, -25) : ([...DEGRAUS].reverse().find(([n]) => f >= n)?.[0] || 0);
      const nome = prox[1] === 'rebento' ? 'Rebento (com a Staff)' : TITULOS[prox[1]];
      return { pct: Math.max(3, Math.min(100, Math.round(((f - base) / (prox[0] - base)) * 100))), txt: `faltam ${prox[0] - f} para ${nome}` };
    }
    function msgErro(e) {
      const m = String(e?.message || e || '');
      if (/row-level security|permission denied/i.test(m)) return 'Sem permissão para isso. Entre com uma conta que está no servidor da Duodécima.';
      if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sem conexão com o servidor das contas. Tente de novo em instantes.';
      if (/JWT expired|invalid JWT/i.test(m)) return 'Sua sessão expirou. Entre de novo com o Discord.';
      return m || 'Algo deu errado.';
    }
    const vazio = (titulo, texto, extra = '') => `<div class="on-empty"><span class="on-empty-seal" aria-hidden="true"></span><h2>${titulo}</h2><p>${texto}</p>${extra}</div>`;
    const carregando = txt => `<div class="on-loading" role="status"><span class="on-spin" aria-hidden="true"></span>${esc(txt)}</div>`;

    /* ---------- acesso ao banco (tudo passa por aqui) ---------- */
    const q = async p => { const { data, error } = await p; if (error) throw error; return data; };
    const db = {
      conta: () => q(S.sb.rpc('minha_conta')),
      verificar: token => q(S.sb.rpc('verificar_membro', { token_discord: token })),
      meus: id => q(S.sb.from('personagens_fama').select(COLS).eq('jogador_id', id).is('excluido_em', null).order('criado_em', { ascending: true })),
      fama: pid => q(S.sb.from('fama_registros').select('id,quantidade,motivo,link_discord,criado_em,criado_por,removido_em,motivo_remocao').eq('personagem_id', pid).order('criado_em', { ascending: false })),
      criar: row => q(S.sb.from('personagens').insert(row).select('id').single()),
      editar: (id, patch) => q(S.sb.from('personagens').update(patch).eq('id', id)),
      lancar: row => q(S.sb.from('fama_registros').insert(row)),
      remover: (id, motivo) => q(S.sb.rpc('remover_fama', { registro: id, motivo: motivo || null })),
      restaurar: id => q(S.sb.rpc('restaurar_fama', { registro: id })),
      tabula: () => q(S.sb.rpc('tabula_famae')),
      todos: () => q(S.sb.from('personagens_fama').select(COLS).order('fama', { ascending: false })),
      perfis: () => q(S.sb.from('perfis').select('id,discord_usuario,nome_exibicao,avatar_url,membro,membro_verificado_em,criado_em').order('criado_em', { ascending: true })),
      papeis: () => q(S.sb.from('papeis').select('usuario_id,papel')),
      famaRecente: () => q(S.sb.from('fama_registros').select('id,personagem_id,quantidade,motivo,link_discord,criado_em,criado_por,removido_em,removido_por,motivo_remocao').order('criado_em', { ascending: false }).limit(300)),
      auditoria: () => q(S.sb.from('auditoria').select('id,quando,quem,acao,tabela,registro,antes,depois').order('quando', { ascending: false }).limit(200)),
      definirMembro: (alvo, valor) => q(S.sb.rpc('definir_membro', { alvo, valor })),
      definirPapel: (alvo, novo) => q(S.sb.rpc('definir_papel', { alvo, novo })),
      excluirConta: () => q(S.sb.rpc('excluir_minha_conta'))
    };

    /* Lista de deuses do Core (a mesma do Guia), para o cadastro de personagem. */
    async function carregarDeuses() {
      if (S.deuses) return S.deuses;
      try {
        const C = await window.DUODECIMA_CORE_READY;
        const j = await fetch(`${C.baseUrl}/${C.manifest.files.gods}?v=${encodeURIComponent(C.version)}`).then(r => r.json());
        const grupos = Object.fromEntries((j.groups || []).map(g => [g.id, g]));
        S.deuses = (j.deities || []).filter(d => d.selectable !== false)
          .map(d => ({ id: d.id, nome: d.name, grupo: d.groupLabel || grupos[d.group]?.name || '', ordem: grupos[d.group]?.order ?? 99 }))
          .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
      } catch { S.deuses = []; }
      return S.deuses;
    }
    function opcoesDeuses(atual) {
      const porGrupo = new Map();
      for (const d of S.deuses || []) { if (!porGrupo.has(d.grupo)) porGrupo.set(d.grupo, []); porGrupo.get(d.grupo).push(d); }
      return `<option value="">Ainda não reclamado</option>` + [...porGrupo].map(([g, ds]) =>
        `<optgroup label="${esc(g)}">${ds.map(d => `<option value="${esc(d.id)}"${d.id === atual ? ' selected' : ''}>${esc(d.nome)}</option>`).join('')}</optgroup>`).join('');
    }
    const opcoes = (lista, atual, vazioTxt) => (vazioTxt !== undefined ? `<option value="">${esc(vazioTxt)}</option>` : '') +
      lista.map(([v, t]) => `<option value="${esc(v)}"${v === atual ? ' selected' : ''}>${esc(t)}</option>`).join('');
    const opCoortes = atual => opcoes(COORTES.map(c => [c, `${c} Coorte`]), atual || '', 'Sem coorte (probatio)');

    /* ---------- sessão ---------- */
    function carregarScript(src, integrity) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.crossOrigin = 'anonymous';
        if (integrity) s.integrity = integrity;
        s.onload = res;
        s.onerror = () => rej(new Error('Não consegui carregar o cliente das contas.'));
        document.head.append(s);
      });
    }
    function limparUrl() {
      const u = new URL(location.href);
      let mudou = false;
      for (const k of ['code', 'error', 'error_code', 'error_description', 'state']) if (u.searchParams.has(k)) { u.searchParams.delete(k); mudou = true; }
      if (mudou) history.replaceState(history.state, '', u.pathname + (u.search || '') + u.hash);
    }
    async function iniciar() {
      aplicar();
      if (!ON) return;
      const erroUrl = new URLSearchParams(location.search).get('error_description');
      try {
        await carregarScript(SUPABASE_JS, SUPABASE_SRI);
        S.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
          auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'duodecima-auth' }
        });
        // O Supabase pede que o callback não chame o próprio cliente na mesma volta (evita travar).
        S.sb.auth.onAuthStateChange((ev, session) => setTimeout(() => aoMudarSessao(ev, session), 0));
        const { data } = await S.sb.auth.getSession();
        await aoMudarSessao('INITIAL', data?.session || null);
      } catch (err) {
        S.erro = msgErro(err);
        S.carregando = false;
        aplicar();
      }
      limparUrl();
      if (erroUrl) toast(/denied|cancel/i.test(erroUrl) ? 'Login cancelado no Discord.' : `O Discord recusou o login: ${erroUrl}`);
      let voltar = false;
      try { voltar = sessionStorage.getItem('duodecima_pos_login') === '1'; sessionStorage.removeItem('duodecima_pos_login'); } catch {}
      if (voltar) setTimeout(() => A.openUtil('conta', null), 900);
    }
    let fila = Promise.resolve();
    function aoMudarSessao(ev, session) {
      fila = fila.then(async () => {
        const antes = uid();
        S.session = session;
        const token = session?.provider_token;
        if (token && token !== S.tokenVisto) {
          S.tokenVisto = token;
          try {
            const r = await db.verificar(token);
            toast(r?.membro ? 'Conta confirmada: você está no servidor da Duodécima.' : 'Você entrou como visitante: esta conta não está no servidor da Duodécima.');
          } catch (err) { toast(msgErro(err)); }
          await carregarConta();
        } else if (uid() !== antes || ev === 'INITIAL' || ev === 'USER_UPDATED') {
          await carregarConta();
        }
        S.carregando = false;
        aplicar();
      }).catch(err => { S.carregando = false; S.erro = msgErro(err); aplicar(); });
      return fila;
    }
    async function carregarConta() {
      S.tabula = null;
      if (!uid()) { S.conta = null; S.meus = []; S.fama = {}; S.adm.carregado = false; return; }
      try {
        S.conta = await db.conta();
        S.meus = ehMembro() ? await db.meus(uid()) : [];
        S.erro = null;
      } catch (err) { S.erro = msgErro(err); }
      if (ehMembro()) carregarDeuses().then(() => renderConta());
    }
    async function entrar() {
      if (!S.sb) { toast(ON ? 'As contas ainda estão carregando. Tente de novo em instantes.' : 'As contas ainda não foram ativadas neste site.'); return; }
      try { sessionStorage.setItem('duodecima_pos_login', '1'); } catch {}
      const { error } = await S.sb.auth.signInWithOAuth({ provider: 'discord', options: { scopes: 'guilds', redirectTo: location.origin + location.pathname } });
      if (error) toast(msgErro(error));
    }
    async function sair() {
      try { await S.sb?.auth.signOut(); } catch {}
      S.session = null; S.conta = null; S.meus = []; S.fama = {}; S.aberto = null; S.tabula = null;
      S.adm = { ...S.adm, carregado: false, personagens: [], perfis: [], papeis: {}, fama: [], auditoria: [] };
      aplicar();
      toast('Você saiu da conta.');
    }

    /* ---------- estado visual geral ---------- */
    function aplicar() {
      html.classList.toggle('on-logado', !!uid());
      html.classList.toggle('on-membro', ehMembro());
      html.classList.toggle('on-staff', ehStaff());
      renderChip();
      travarFicha();
      // A Minha Ficha (principia/ficha/nuvem.js) escuta isto para sincronizar com a conta certa.
      window.dispatchEvent(new CustomEvent('duodecima:conta'));
      if (WM.isOpen('conta')) renderConta();
      if (WM.isOpen('famae')) { renderFamae(); if (!S.tabula) carregarTabula(); }
      if (WM.isOpen('praetorium')) renderPraetorium();
      if (!ehStaff() && WM.isOpen('praetorium')) WM.close('praetorium');
    }

    /* Selo da conta no canto inferior esquerdo: avatar e @ do Discord. */
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'on-chip';
    chip.dataset.app = 'conta';
    document.body.append(chip);
    function renderChip() {
      const p = S.conta?.perfil;
      let cls = 'on-chip';
      let inner;
      if (S.carregando) { inner = '<span class="on-spin" aria-hidden="true"></span><span>Conta</span>'; cls += ' is-loading'; }
      else if (p) {
        inner = `${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="" referrerpolicy="no-referrer">` : '<span class="on-chip-ini" aria-hidden="true">' + esc((p.nome_exibicao || p.discord_usuario || '?').slice(0, 1).toUpperCase()) + '</span>'}<span>@${esc(p.discord_usuario || 'conta')}</span><i class="on-chip-dot" aria-hidden="true"></i>`;
        cls += ehStaff() ? ' is-staff' : ehMembro() ? ' is-membro' : ' is-visitante';
      } else {
        inner = '<svg class="os-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c1.2-3.6 3.9-5.4 7-5.4s5.8 1.8 7 5.4"/></svg><span>' + (ON ? 'Entrar' : 'Visitante') + '</span>';
        cls += ' is-out';
      }
      chip.className = cls;
      chip.title = p ? `${p.nome_exibicao || p.discord_usuario} · ${ehStaff() ? 'Staff' : ehMembro() ? 'membro da Duodécima' : 'visitante'}` : ON ? 'Entrar com o Discord' : 'Contas ainda não ativadas';
      chip.innerHTML = inner;
    }

    /* Minha Ficha é só para membros (com as contas ativadas). */
    function travarFicha() {
      const win = $('.os-ficha');
      if (!win) return;
      const travar = ON && !ehMembro();
      win.classList.toggle('on-locked', travar);
      let lock = $('.on-lock', win);
      if (!travar) { lock?.remove(); return; }
      if (!lock) { lock = document.createElement('div'); lock.className = 'on-lock'; $('.os-win-body', win)?.before(lock); }
      lock.innerHTML = S.carregando ? carregando('Conferindo sua conta…') : vazio('A ficha é para membros',
        uid() ? 'Sua conta do Discord não apareceu no servidor da Duodécima. Se você entrou no servidor agora, confira de novo.' : 'Entre com o Discord da Duodécima para usar a ficha. Visitantes continuam vendo o Guia inteiro e a Tabula Famae.',
        `<button class="os-btn os-btn--primary" type="button" data-app="conta">${uid() ? 'Abrir minha conta' : 'Entrar com o Discord'}</button>`);
    }

    /* ======================================================================
       Janela: Minha Conta
       ====================================================================== */
    const contaBody = $('#onContaBody');
    function renderConta() {
      if (!contaBody) return;
      if (!ON) {
        contaBody.innerHTML = vazio('As contas ainda não foram ativadas', 'Quando a Staff ligar o banco de dados, é aqui que você entra com o Discord, cadastra personagens e lança fama. Por enquanto, o Guia inteiro funciona como visitante.');
        return;
      }
      if (S.carregando) { contaBody.innerHTML = carregando('Abrindo sua conta…'); return; }
      if (!uid()) { contaBody.innerHTML = telaEntrar(); return; }
      const p = S.conta?.perfil || {};
      const status = ehDono() ? 'Dono' : ehStaff() ? 'Staff' : ehMembro() ? 'Membro' : 'Visitante';
      contaBody.innerHTML = `
        <header class="on-me">
          ${p.avatar_url ? `<img class="on-avatar" src="${esc(p.avatar_url)}" alt="" referrerpolicy="no-referrer">` : '<span class="on-avatar on-avatar--ini" aria-hidden="true">' + esc((p.nome_exibicao || '?').slice(0, 1)) + '</span>'}
          <div class="on-me-id"><b>${esc(p.nome_exibicao || p.discord_usuario || 'Conta')}</b><small>@${esc(p.discord_usuario || '')}</small></div>
          <span class="on-status on-status--${status.toLowerCase()}">${status}</span>
        </header>
        ${S.erro ? `<p class="on-alert" role="alert">${esc(S.erro)}</p>` : ''}
        ${ehMembro() ? secaoPersonagens() : avisoVisitante()}
        <footer class="on-foot">
          <button class="os-btn" type="button" data-on="sair">Sair</button>
          ${ehStaff() ? '<button class="os-btn" type="button" data-app="praetorium">Abrir o Praetorium</button>' : ''}
          <details class="on-danger"><summary>Excluir minha conta</summary>
            <p>Apaga o seu perfil, todos os seus personagens e os lançamentos de fama deles. Não dá para desfazer.</p>
            <button class="os-btn on-btn-danger" type="button" data-on="excluir-conta">Excluir minha conta e meus personagens</button>
          </details>
        </footer>`;
    }
    function telaEntrar() {
      return `<div class="on-login">
        <span class="on-empty-seal" aria-hidden="true"></span>
        <h2>Entre com o Discord</h2>
        <p>Quem está no servidor da Duodécima entra como <b>membro</b>: cadastra personagens, lança fama e, na próxima etapa, guarda a ficha aqui. Quem não está entra como <b>visitante</b> e continua vendo o Guia inteiro e a Tabula Famae.</p>
        <button class="os-btn on-btn-discord" type="button" data-on="entrar"><svg class="os-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14"/><path d="M10 8l4 4-4 4M14 12H4.5"/></svg>Entrar com o Discord</button>
        <button class="os-btn os-btn--ghost" type="button" data-on="fechar">Continuar como visitante</button>
        <details class="on-privacy"><summary>O que o site guarda</summary>
          <p>O seu ID, @, nome de exibição e avatar do Discord, e se a conta está no servidor da Duodécima (sim ou não, conferido no login). O site não lê cargos nem mensagens. O Discord manda a lista dos seus servidores só para essa conferência: o banco procura a Duodécima e não guarda o resto. O e-mail da conta fica apenas no sistema de login (Supabase). Você pode excluir a conta, com tudo o que está nela, aqui mesmo.</p>
        </details>
      </div>`;
    }
    function avisoVisitante() {
      const p = S.conta?.perfil;
      const expirou = p?.membro && !ehMembro();
      return `<section class="on-sec">${vazio(expirou ? 'Sua confirmação expirou' : 'Você está como visitante',
        expirou ? 'Faz tempo que o site não confere se a sua conta está no servidor. Entre de novo com o Discord para continuar como membro.'
          : 'Esta conta do Discord não apareceu no servidor da Duodécima. Você continua vendo o Guia e a Tabula Famae; personagens e ficha ficam para membros. Se entrou no servidor agora, confira de novo.',
        '<button class="os-btn os-btn--primary" type="button" data-on="entrar">Conferir de novo</button>')}</section>`;
    }
    function formPersonagem(p = {}, admin = false) {
      const perfis = admin ? S.adm.perfis : [];
      return `<form class="on-form" data-on-form="${admin ? (p.id ? 'adm-editar' : 'adm-novo') : 'novo'}"${p.id ? ` data-id="${esc(p.id)}"` : ''}>
        <label class="on-field on-field--wide"><span>Nome do personagem</span><input name="nome" required maxlength="80" value="${esc(p.nome || '')}" autocomplete="off"></label>
        <label class="on-field"><span>Linhagem</span><select name="linhagem">${opcoes([['prole', 'Prole divina'], ['legado', 'Legado']], p.linhagem || 'prole')}</select></label>
        <label class="on-field"><span>Panteão</span><select name="panteao">${opcoes(PANTEOES, p.panteao || 'romano')}</select></label>
        <label class="on-field"><span>Divindade (mecânica romana)</span><select name="divindade">${opcoesDeuses(p.divindade || '')}</select></label>
        <label class="on-field"><span>Coorte</span><select name="coorte">${opCoortes(p.coorte)}</select></label>
        ${admin ? `
        <label class="on-field"><span>Jogador</span><select name="jogador_id"><option value="">Cadastro da Staff (sem jogador)</option>${perfis.map(f => `<option value="${esc(f.id)}"${f.id === p.jogador_id ? ' selected' : ''}>@${esc(f.discord_usuario || f.nome_exibicao || f.id.slice(0, 8))}</option>`).join('')}</select></label>
        <label class="on-field"><span>Título mínimo (Staff)</span><select name="titulo_minimo">${opcoes([['conhecido', 'Conhecido'], ['influente', 'Influente (ex.: Centurião)'], ['famoso', 'Famoso']], p.titulo_minimo || '', 'Nenhum')}</select></label>
        <label class="on-check"><input type="checkbox" name="rebento_confirmado"${p.rebento_confirmado ? ' checked' : ''}> Rebento de Roma Aeterna confirmado</label>` : ''}
        <label class="on-check"><input type="checkbox" name="publico"${p.publico === false ? '' : ' checked'}> Aparece na Tabula Famae</label>
        ${admin ? '' : '<p class="on-hint">Gregos começam com −10 de fama e celtas com −15; filhos de Iuppiter, Bellona e Marte Ultor recebem +15 e o título de Conhecido. Isso entra sozinho: não lance de novo. Depois de salvar, linhagem, panteão e divindade só mudam com a Staff (a divindade pode ser escolhida uma vez, na reclamação).</p>'}
        <div class="on-actions"><button class="os-btn os-btn--primary" type="submit">${p.id ? 'Salvar' : 'Cadastrar personagem'}</button><button class="os-btn os-btn--ghost" type="button" data-on="${admin ? 'adm-cancelar' : 'cancelar-novo'}">Cancelar</button></div>
      </form>`;
    }
    function secaoPersonagens() {
      const lista = S.meus || [];
      return `<section class="on-sec">
        <div class="on-sec-head"><h3>Meus personagens</h3>${S.novo ? '' : '<button class="os-btn" type="button" data-on="novo">Novo personagem</button>'}</div>
        ${S.novo ? formPersonagem() : ''}
        ${lista.length ? lista.map(cartao).join('') : S.novo ? '' : '<p class="on-muted">Nenhum personagem ainda. Cadastre o primeiro para lançar fama e aparecer na Tabula Famae.</p>'}
      </section>`;
    }
    function cartao(p) {
      const aberto = S.aberto === p.id;
      const pr = progresso(p.fama, p.titulo);
      return `<article class="on-char${aberto ? ' is-open' : ''}" data-id="${esc(p.id)}">
        <button class="on-char-head" type="button" data-on="abrir" aria-expanded="${aberto}">
          <span class="on-char-id"><b>${esc(p.nome)}</b><small>${esc(prole(p))}</small></span>
          <span class="on-char-fama"><b>${sinal(p.fama)}</b><small>fama</small></span>
        </button>
        <div class="on-char-meta">${badge(p.titulo, p.elegivel_rebento)}<span class="on-bar" title="${esc(pr.txt)}"><i style="width:${pr.pct}%"></i></span><small>${esc(pr.txt)}</small></div>
        ${aberto ? detalhes(p) : ''}
      </article>`;
    }
    function detalhes(p) {
      const regs = S.fama[p.id];
      const base = (p.panteao === 'grego' ? -10 : p.panteao === 'celta' ? -15 : 0) + (p.panteao === 'romano' && p.linhagem === 'prole' && ['iuppiter', 'bellona', 'marte'].includes(p.divindade) ? 15 : 0);
      const editando = S.editando === p.id;
      return `<div class="on-char-body">
        <form class="on-form on-form--fama" data-on-form="fama" data-id="${esc(p.id)}">
          <label class="on-field on-field--qtd"><span>Fama</span><input name="quantidade" type="number" step="1" min="-500" max="500" required placeholder="+5"></label>
          <label class="on-field on-field--wide"><span>Motivo</span><input name="motivo" required minlength="3" maxlength="300" placeholder="Ex.: missão da ponte de Nazzano" autocomplete="off"></label>
          <label class="on-field on-field--wide"><span>Link da mensagem no Discord</span><input name="link" type="url" required maxlength="200" placeholder="https://discord.com/channels/…" autocomplete="off" spellcheck="false"></label>
          <p class="on-hint">No Discord: botão direito na mensagem (ou toque longo no celular) → <b>Copiar link da mensagem</b>. Fama negativa também entra aqui, com sinal de menos.</p>
          <div class="on-actions"><button class="os-btn os-btn--primary" type="submit">Lançar fama</button></div>
        </form>
        <h4 class="on-sub">Histórico</h4>
        <ul class="on-regs">
          ${base ? `<li class="on-reg on-reg--base"><b>${sinal(base)}</b><span>Fama inicial (${p.panteao === 'romano' ? 'reclamação' : 'panteão ' + esc((PANTEOES.find(x => x[0] === p.panteao) || [, ''])[1].toLowerCase())})</span><small>automática</small></li>` : ''}
          ${!regs ? `<li class="on-reg">${carregando('Carregando…')}</li>` : regs.length ? regs.map(r => `<li class="on-reg${r.removido_em ? ' is-removido' : ''}">
              <b>${sinal(r.quantidade)}</b>
              <span>${esc(r.motivo)}${r.removido_em ? ` <em>removido${r.motivo_remocao ? ': ' + esc(r.motivo_remocao) : ''}</em>` : ''}</span>
              <small>${data(r.criado_em)} · <a href="${esc(r.link_discord)}" target="_blank" rel="noopener noreferrer">ver no Discord</a></small>
              ${!r.removido_em && r.criado_por === uid() ? `<button class="on-x" type="button" data-on="remover-fama" data-reg="${esc(r.id)}" title="Remover este lançamento" aria-label="Remover este lançamento">×</button>` : ''}
            </li>`).join('') : '<li class="on-reg on-muted">Nenhum lançamento ainda.</li>'}
        </ul>
        ${editando ? `<form class="on-form" data-on-form="editar" data-id="${esc(p.id)}">
            <label class="on-field on-field--wide"><span>Nome</span><input name="nome" required maxlength="80" value="${esc(p.nome)}"></label>
            <label class="on-field"><span>Coorte</span><select name="coorte">${opCoortes(p.coorte)}</select></label>
            ${p.divindade ? '' : `<label class="on-field"><span>Divindade (reclamação)</span><select name="divindade">${opcoesDeuses('')}</select></label>`}
            <label class="on-check"><input type="checkbox" name="publico"${p.publico ? ' checked' : ''}> Aparece na Tabula Famae</label>
            <div class="on-actions"><button class="os-btn os-btn--primary" type="submit">Salvar</button><button class="os-btn os-btn--ghost" type="button" data-on="cancelar-editar">Cancelar</button></div>
          </form>` : `<div class="on-actions on-actions--end">
            <button class="os-btn os-btn--ghost" type="button" data-on="editar">Editar</button>
            <button class="os-btn os-btn--ghost on-btn-danger" type="button" data-on="excluir-personagem">Excluir personagem</button>
          </div>`}
      </div>`;
    }
    async function abrirPersonagem(id) {
      S.aberto = S.aberto === id ? null : id;
      S.editando = null;
      renderConta();
      if (S.aberto) await recarregarFama(id);
    }
    async function recarregarFama(id) {
      try { S.fama[id] = await db.fama(id); } catch (err) { S.fama[id] = []; toast(msgErro(err)); }
      renderConta();
    }
    // Imagens das fichas (Storage) não somem junto com a conta no banco: apaga antes, pasta por pasta.
    async function apagarImagensDaConta() {
      const pasta = uid();
      if (!S.sb || !pasta) return;
      const st = S.sb.storage.from('fichas');
      for (let volta = 0; volta < 20; volta++) {
        const { data, error } = await st.list(pasta, { limit: 100 });
        if (error || !data?.length) return;
        const { error: e2 } = await st.remove(data.map(f => `${pasta}/${f.name}`));
        if (e2) return;
      }
    }
    async function recarregarMeus() {
      try { S.meus = await db.meus(uid()); } catch (err) { toast(msgErro(err)); }
      S.tabula = null;
      renderConta();
    }
    const valores = form => Object.fromEntries(new FormData(form).entries());
    async function enviar(form, fn, ok) {
      const btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      try { await fn(); if (ok) toast(ok); return true; }
      catch (err) { toast(msgErro(err)); return false; }
      finally { if (btn) btn.disabled = false; }
    }

    contaBody?.addEventListener('submit', async e => {
      const form = e.target.closest('[data-on-form]');
      if (!form) return;
      e.preventDefault();
      const v = valores(form);
      const tipo = form.dataset.onForm;
      const id = form.dataset.id;
      if (tipo === 'novo') {
        const row = { jogador_id: uid(), nome: v.nome.trim(), linhagem: v.linhagem, panteao: v.panteao, divindade: v.divindade || null, coorte: v.coorte || null, publico: !!v.publico };
        if (await enviar(form, () => db.criar(row), `${row.nome} cadastrado.`)) { S.novo = false; await recarregarMeus(); }
      } else if (tipo === 'editar') {
        const patch = { nome: v.nome.trim(), coorte: v.coorte || null, publico: !!v.publico };
        if (v.divindade) patch.divindade = v.divindade;
        if (await enviar(form, () => db.editar(id, patch), 'Personagem atualizado.')) { S.editando = null; await recarregarMeus(); }
      } else if (tipo === 'fama') {
        const qtd = parseInt(v.quantidade, 10);
        if (!qtd) { toast('Use um número diferente de zero.'); return; }
        const row = { personagem_id: id, quantidade: qtd, motivo: v.motivo.trim(), link_discord: v.link.trim() };
        if (await enviar(form, () => db.lancar(row), `${sinal(qtd)} de fama lançado.`)) { form.reset(); await recarregarMeus(); await recarregarFama(id); }
      }
    });
    contaBody?.addEventListener('click', async e => {
      const b = e.target.closest('[data-on]');
      if (!b) return;
      const act = b.dataset.on;
      const id = b.closest('[data-id]')?.dataset.id;
      if (act === 'entrar') return entrar();
      if (act === 'fechar') return WM.close('conta');
      if (act === 'sair') return sair();
      if (act === 'novo') { S.novo = true; await carregarDeuses(); renderConta(); contaBody.querySelector('[data-on-form="novo"] input')?.focus(); return; }
      if (act === 'cancelar-novo') { S.novo = false; return renderConta(); }
      if (act === 'abrir') return abrirPersonagem(id);
      if (act === 'editar') { S.editando = id; await carregarDeuses(); return renderConta(); }
      if (act === 'cancelar-editar') { S.editando = null; return renderConta(); }
      if (act === 'remover-fama') {
        if (!confirm('Remover este lançamento de fama? Ele continua no histórico como removido.')) return;
        try { await db.remover(b.dataset.reg); toast('Lançamento removido.'); await recarregarMeus(); await recarregarFama(id); } catch (err) { toast(msgErro(err)); }
        return;
      }
      if (act === 'excluir-personagem') {
        const p = S.meus.find(x => x.id === id);
        if (!confirm(`Excluir ${p?.nome || 'este personagem'}? Ele some da sua conta e da Tabula Famae. Só a Staff consegue restaurar.`)) return;
        try { await db.editar(id, { excluido_em: new Date().toISOString() }); S.aberto = null; toast('Personagem excluído.'); await recarregarMeus(); } catch (err) { toast(msgErro(err)); }
        return;
      }
      if (act === 'excluir-conta') {
        if (!confirm('Excluir a sua conta, todos os seus personagens e os lançamentos de fama deles? Não dá para desfazer.')) return;
        if (prompt('Para confirmar, digite EXCLUIR') !== 'EXCLUIR') { toast('Exclusão cancelada.'); return; }
        try { await apagarImagensDaConta(); await db.excluirConta(); await sair(); toast('Conta excluída.'); } catch (err) { toast(msgErro(err)); }
      }
    });

    /* ======================================================================
       Janela: Tabula Famae
       ====================================================================== */
    const famaeBody = $('#onFamaeBody');
    async function carregarTabula(forcar) {
      if (!S.sb) return;
      if (!forcar && S.tabula && Date.now() - S.tabulaEm < 60000) return;
      try { S.tabula = await db.tabula(); S.tabulaEm = Date.now(); }
      catch (err) { S.tabula = S.tabula || []; toast(msgErro(err)); }
      await carregarDeuses();
      renderFamae();
    }
    function renderFamae() {
      if (!famaeBody) return;
      if (!ON) { famaeBody.innerHTML = vazio('A Tabula Famae ainda não está ativa', 'O ranking de fama aparece aqui quando as contas forem ativadas: cada membro cadastra os personagens e lança a fama com o link da mensagem no Discord.'); return; }
      if (!S.tabula) { famaeBody.innerHTML = carregando('Abrindo a Tabula Famae…'); return; }
      const f = S.filtro;
      const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const qn = norm(f.q);
      const linhas = S.tabula.filter(r => (!qn || norm(`${r.nome} ${r.jogador || ''} ${nomeDeus(r.divindade)}`).includes(qn))
        && (!f.titulo || (r.titulo || 'nenhum') === f.titulo) && (!f.coorte || (r.coorte || '-') === f.coorte));
      const ferramentas = `<div class="on-tools" role="search">
          <input type="search" data-on-filtro="q" value="${esc(f.q)}" placeholder="Buscar personagem, jogador ou deus" aria-label="Buscar na Tabula Famae">
          <select data-on-filtro="titulo" aria-label="Filtrar por título">${opcoes(Object.entries(TITULOS), f.titulo, 'Todos os títulos')}</select>
          <select data-on-filtro="coorte" aria-label="Filtrar por coorte">${opcoes([...COORTES.map(c => [c, `${c} Coorte`]), ['-', 'Sem coorte']], f.coorte, 'Todas as coortes')}</select>
          <button class="os-btn os-btn--ghost" type="button" data-on="atualizar" title="Atualizar">Atualizar</button>
        </div>`;
      famaeBody.innerHTML = `
        <header class="on-famae-head"><small>LEGIO XII FULMINATA</small><h2>Tabula Famae</h2><p>A fama dos legionários, somada a cada missão, bênção e escândalo.</p></header>
        ${ferramentas}
        ${S.tabula.length ? (linhas.length ? `<ol class="on-rank">${linhas.map(r => `<li class="on-rank-row${r.posicao <= 3 ? ' is-top is-top' + r.posicao : ''}">
            <span class="on-pos">${r.posicao}</span>
            <span class="on-rank-id"><b>${esc(r.nome)}</b><small>${esc(prole(r))}</small>${r.jogador ? `<small class="on-rank-player">${r.jogador_avatar ? `<img src="${esc(r.jogador_avatar)}" alt="" referrerpolicy="no-referrer">` : ''}@${esc(r.jogador)}</small>` : ''}</span>
            <span class="on-rank-title">${badge(r.titulo, r.elegivel_rebento)}</span>
            <span class="on-rank-fama"><b>${sinal(r.fama)}</b><small>fama</small></span>
          </li>`).join('')}</ol>` : '<p class="on-muted on-center">Nenhum personagem com esses filtros.</p>')
          : '<p class="on-muted on-center">Ainda não há personagens na Tabula Famae.</p>'}
        <p class="on-note">Títulos pela fama: Odiado abaixo de 0 (gregos, celtas e filhos de Netuno até 25), Conhecido a partir de 25, Influente a partir de 50, Famoso a partir de 80. Rebento de Roma Aeterna só com a confirmação da Staff. Requisitos narrativos de cada título (missão, MVP, cargo de Legionário) continuam valendo e são conferidos pela Staff.${uid() && !ehMembro() ? '' : !uid() ? ' Os @ dos jogadores aparecem só para membros logados.' : ''}</p>`;
    }
    famaeBody?.addEventListener('input', e => {
      const el = e.target.closest('[data-on-filtro]');
      if (!el) return;
      S.filtro[el.dataset.onFiltro] = el.value;
      const pos = el.selectionStart;
      renderFamae();
      const novo = famaeBody.querySelector(`[data-on-filtro="${el.dataset.onFiltro}"]`);
      if (novo && el.tagName === 'INPUT') { novo.focus(); try { novo.setSelectionRange(pos, pos); } catch {} }
    });
    famaeBody?.addEventListener('click', e => { if (e.target.closest('[data-on="atualizar"]')) carregarTabula(true); });

    /* ======================================================================
       Janela: Praetorium (Staff)
       ====================================================================== */
    const admBody = $('#onAdmBody');
    async function carregarAdm() {
      if (!S.sb || !ehStaff()) return;
      try {
        const [personagens, perfis, papeis, fama, auditoria] = await Promise.all([db.todos(), db.perfis(), db.papeis(), db.famaRecente(), db.auditoria()]);
        Object.assign(S.adm, { personagens, perfis, fama, auditoria, papeis: Object.fromEntries(papeis.map(p => [p.usuario_id, p.papel])), carregado: true });
      } catch (err) { toast(msgErro(err)); }
      await carregarDeuses();
      renderPraetorium();
    }
    const perfilDe = id => S.adm.perfis.find(p => p.id === id);
    const arroba = id => { const p = perfilDe(id); return p ? '@' + (p.discord_usuario || p.nome_exibicao) : id ? 'conta excluída' : 'Staff'; };
    const nomePersonagem = id => S.adm.personagens.find(p => p.id === id)?.nome || 'personagem excluído';
    function renderPraetorium() {
      if (!admBody) return;
      if (!ehStaff()) { admBody.innerHTML = vazio('Área da Staff', 'O Praetorium abre só para contas da Staff.'); return; }
      if (!S.adm.carregado) { admBody.innerHTML = carregando('Abrindo o Praetorium…'); return; }
      const abas = [['personagens', 'Personagens', S.adm.personagens.filter(p => !p.excluido_em).length], ['fama', 'Fama', S.adm.fama.length], ['jogadores', 'Jogadores', S.adm.perfis.length], ['auditoria', 'Auditoria', S.adm.auditoria.length]];
      const corpo = { personagens: admPersonagens, fama: admFama, jogadores: admJogadores, auditoria: admAuditoria }[S.adm.aba] || admPersonagens;
      admBody.innerHTML = `
        <nav class="on-tabs" role="tablist">${abas.map(([k, t, n]) => `<button type="button" role="tab" aria-selected="${S.adm.aba === k}" data-on="aba" data-aba="${k}">${t}<small>${n}</small></button>`).join('')}
          <button class="os-btn os-btn--ghost on-tabs-refresh" type="button" data-on="adm-atualizar">Atualizar</button></nav>
        <div class="on-tools"><input type="search" data-on-adm-q value="${esc(S.adm.q)}" placeholder="Filtrar" aria-label="Filtrar"></div>
        ${corpo()}`;
    }
    const filtraAdm = txt => { const n = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); return !S.adm.q || n(txt).includes(n(S.adm.q)); };
    function admPersonagens() {
      const lista = S.adm.personagens.filter(p => filtraAdm(`${p.nome} ${arroba(p.jogador_id)} ${nomeDeus(p.divindade)}`));
      return `<div class="on-sec-head"><h3>Personagens</h3>${S.adm.novo ? '' : '<button class="os-btn" type="button" data-on="adm-novo">Cadastrar personagem</button>'}</div>
        ${S.adm.novo ? formPersonagem({}, true) : ''}
        <div class="on-table" role="table">${lista.map(p => S.adm.editando === p.id ? formPersonagem(p, true) : `
          <div class="on-tr${p.excluido_em ? ' is-removido' : ''}" role="row" data-id="${esc(p.id)}">
            <span class="on-td on-td--main"><b>${esc(p.nome)}</b><small>${esc(prole(p))} · ${esc(arroba(p.jogador_id))}${p.publico ? '' : ' · oculto da Tabula'}${p.excluido_em ? ' · excluído em ' + data(p.excluido_em) : ''}</small></span>
            <span class="on-td">${badge(p.titulo, p.elegivel_rebento)}${p.titulo_minimo ? `<small class="on-muted">mínimo: ${esc(titulo(p.titulo_minimo))}</small>` : ''}</span>
            <span class="on-td on-td--num">${sinal(p.fama)}</span>
            <span class="on-td on-td--act">${p.excluido_em ? '<button class="os-btn os-btn--ghost" type="button" data-on="adm-restaurar">Restaurar</button>' : '<button class="os-btn os-btn--ghost" type="button" data-on="adm-editar">Editar</button><button class="os-btn os-btn--ghost on-btn-danger" type="button" data-on="adm-excluir">Excluir</button>'}</span>
          </div>`).join('') || '<p class="on-muted">Nenhum personagem.</p>'}</div>`;
    }
    function admFama() {
      const lista = S.adm.fama.filter(r => filtraAdm(`${nomePersonagem(r.personagem_id)} ${r.motivo} ${arroba(r.criado_por)}`));
      const vivos = S.adm.personagens.filter(p => !p.excluido_em);
      return `<form class="on-form on-form--fama" data-on-form="adm-fama">
          <label class="on-field"><span>Personagem</span><select name="personagem_id" required><option value="">Escolha…</option>${vivos.map(p => `<option value="${esc(p.id)}">${esc(p.nome)}</option>`).join('')}</select></label>
          <label class="on-field on-field--qtd"><span>Fama</span><input name="quantidade" type="number" step="1" min="-500" max="500" required></label>
          <label class="on-field on-field--wide"><span>Motivo</span><input name="motivo" required minlength="3" maxlength="300" autocomplete="off"></label>
          <label class="on-field on-field--wide"><span>Link da mensagem no Discord</span><input name="link" type="url" required maxlength="200" autocomplete="off"></label>
          <div class="on-actions"><button class="os-btn os-btn--primary" type="submit">Lançar fama</button></div>
        </form>
        <div class="on-table" role="table">${lista.map(r => `
          <div class="on-tr${r.removido_em ? ' is-removido' : ''}" role="row" data-reg="${esc(r.id)}">
            <span class="on-td on-td--num">${sinal(r.quantidade)}</span>
            <span class="on-td on-td--main"><b>${esc(nomePersonagem(r.personagem_id))}</b><small>${esc(r.motivo)} · ${esc(arroba(r.criado_por))} · ${dataHora(r.criado_em)}${r.removido_em ? ` · removido por ${esc(arroba(r.removido_por))}${r.motivo_remocao ? ': ' + esc(r.motivo_remocao) : ''}` : ''}</small></span>
            <span class="on-td on-td--act"><a class="os-btn os-btn--ghost" href="${esc(r.link_discord)}" target="_blank" rel="noopener noreferrer">Discord</a>${r.removido_em ? '<button class="os-btn os-btn--ghost" type="button" data-on="adm-restaurar-fama">Restaurar</button>' : '<button class="os-btn os-btn--ghost on-btn-danger" type="button" data-on="adm-remover-fama">Remover</button>'}</span>
          </div>`).join('') || '<p class="on-muted">Nenhum lançamento.</p>'}</div>`;
    }
    function admJogadores() {
      const lista = S.adm.perfis.filter(p => filtraAdm(`${p.discord_usuario} ${p.nome_exibicao}`));
      const validade = 90 * 864e5;
      return `<div class="on-table" role="table">${lista.map(p => {
        const papel = S.adm.papeis[p.id] || '';
        const membro = p.membro && p.membro_verificado_em && Date.now() - new Date(p.membro_verificado_em) < validade;
        const qtd = S.adm.personagens.filter(c => c.jogador_id === p.id && !c.excluido_em).length;
        return `<div class="on-tr" role="row" data-perfil="${esc(p.id)}">
          <span class="on-td on-td--main on-td--player">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${esc(p.nome_exibicao || p.discord_usuario)}</b><small>@${esc(p.discord_usuario || '')} · ${qtd} ${qtd === 1 ? 'personagem' : 'personagens'} · desde ${data(p.criado_em)}</small></span>
          <span class="on-td"><span class="on-status on-status--${membro ? 'membro' : 'visitante'}">${membro ? 'Membro' : 'Visitante'}</span>${p.membro_verificado_em ? `<small class="on-muted">conferido em ${data(p.membro_verificado_em)}</small>` : ''}</span>
          <span class="on-td on-td--act">
            <button class="os-btn os-btn--ghost" type="button" data-on="adm-membro" data-valor="${membro ? '0' : '1'}">${membro ? 'Marcar visitante' : 'Marcar membro'}</button>
            ${ehDono() ? `<select data-on-papel aria-label="Papel de @${esc(p.discord_usuario || '')}">${opcoes([['admin', 'Staff'], ['dono', 'Dono']], papel, 'Jogador')}</select>` : papel ? `<span class="on-status on-status--staff">${papel === 'dono' ? 'Dono' : 'Staff'}</span>` : ''}
          </span>
        </div>`;
      }).join('') || '<p class="on-muted">Ninguém ainda.</p>'}</div>`;
    }
    function resumoAuditoria(a) {
      const r = a.depois || a.antes || {};
      if (a.tabela === 'personagens') {
        if (a.acao === 'update' && a.antes && a.depois) {
          const mud = Object.keys(a.depois).filter(k => JSON.stringify(a.depois[k]) !== JSON.stringify(a.antes[k]));
          return `${r.nome}: ${mud.map(k => `${k} ${JSON.stringify(a.antes[k])} → ${JSON.stringify(a.depois[k])}`).join(', ')}`;
        }
        return r.nome || '';
      }
      if (a.tabela === 'fama_registros') {
        if (a.acao === 'update') return `${nomePersonagem(r.personagem_id)}: ${sinal(r.quantidade)} ${a.depois?.removido_em ? 'removido' : 'restaurado'}`;
        return `${nomePersonagem(r.personagem_id)}: ${sinal(r.quantidade)} (${r.motivo})`;
      }
      if (a.tabela === 'papeis') return `${arroba(r.usuario_id)} → ${a.acao === 'delete' ? 'jogador' : r.papel}`;
      if (a.tabela === 'perfis') {
        if (a.acao !== 'update') return `@${r.discord_usuario || ''} ${a.acao === 'insert' ? 'entrou pela primeira vez' : 'excluiu a conta'}`;
        if (a.antes?.membro !== a.depois?.membro) return `@${r.discord_usuario || ''} agora é ${a.depois?.membro ? 'membro' : 'visitante'}`;
        return `@${r.discord_usuario || ''} atualizou o perfil do Discord`;
      }
      return '';
    }
    function admAuditoria() {
      const acao = { insert: 'criou', update: 'alterou', delete: 'apagou' };
      const tabela = { personagens: 'personagem', fama_registros: 'fama', papeis: 'papel', perfis: 'conta' };
      const lista = S.adm.auditoria.filter(a => filtraAdm(`${arroba(a.quem)} ${a.tabela} ${resumoAuditoria(a)}`));
      return `<ul class="on-audit">${lista.map(a => `<li><small>${dataHora(a.quando)}</small><b>${esc(a.quem ? arroba(a.quem) : 'sistema')}</b> ${acao[a.acao] || a.acao} ${tabela[a.tabela] || a.tabela}<span>${esc(resumoAuditoria(a))}</span></li>`).join('') || '<li class="on-muted">Nada registrado.</li>'}</ul>
        <p class="on-note">Os 200 registros mais recentes. O histórico completo fica na tabela "auditoria" do Supabase.</p>`;
    }
    admBody?.addEventListener('input', e => {
      if (!e.target.matches('[data-on-adm-q]')) return;
      S.adm.q = e.target.value;
      const pos = e.target.selectionStart;
      renderPraetorium();
      const novo = admBody.querySelector('[data-on-adm-q]');
      novo?.focus();
      try { novo?.setSelectionRange(pos, pos); } catch {}
    });
    admBody?.addEventListener('change', async e => {
      const sel = e.target.closest('[data-on-papel]');
      if (!sel) return;
      const alvo = sel.closest('[data-perfil]')?.dataset.perfil;
      const novo = sel.value || null;
      if (!confirm(`Mudar o papel de ${arroba(alvo)} para ${novo === 'dono' ? 'Dono' : novo === 'admin' ? 'Staff' : 'Jogador'}?`)) { renderPraetorium(); return; }
      try { await db.definirPapel(alvo, novo); toast('Papel atualizado.'); await carregarAdm(); if (alvo === uid()) { await carregarConta(); aplicar(); } } catch (err) { toast(msgErro(err)); renderPraetorium(); }
    });
    admBody?.addEventListener('submit', async e => {
      const form = e.target.closest('[data-on-form]');
      if (!form) return;
      e.preventDefault();
      const v = valores(form);
      const tipo = form.dataset.onForm;
      if (tipo === 'adm-novo' || tipo === 'adm-editar') {
        const row = { nome: v.nome.trim(), linhagem: v.linhagem, panteao: v.panteao, divindade: v.divindade || null, coorte: v.coorte || null,
          jogador_id: v.jogador_id || null, titulo_minimo: v.titulo_minimo || null, rebento_confirmado: !!v.rebento_confirmado, publico: !!v.publico };
        const ok = await enviar(form, () => tipo === 'adm-novo' ? db.criar(row) : db.editar(form.dataset.id, row), tipo === 'adm-novo' ? `${row.nome} cadastrado.` : 'Personagem atualizado.');
        if (ok) { S.adm.novo = false; S.adm.editando = null; S.tabula = null; await carregarAdm(); if (row.jogador_id === uid()) recarregarMeus(); }
      } else if (tipo === 'adm-fama') {
        const qtd = parseInt(v.quantidade, 10);
        if (!qtd) { toast('Use um número diferente de zero.'); return; }
        if (await enviar(form, () => db.lancar({ personagem_id: v.personagem_id, quantidade: qtd, motivo: v.motivo.trim(), link_discord: v.link.trim() }), `${sinal(qtd)} de fama lançado.`)) { S.tabula = null; await carregarAdm(); }
      }
    });
    admBody?.addEventListener('click', async e => {
      const b = e.target.closest('[data-on]');
      if (!b) return;
      const act = b.dataset.on;
      const id = b.closest('[data-id]')?.dataset.id;
      const reg = b.closest('[data-reg]')?.dataset.reg;
      const alvo = b.closest('[data-perfil]')?.dataset.perfil;
      const feito = async (fn, ok) => { try { await fn(); toast(ok); S.tabula = null; await carregarAdm(); } catch (err) { toast(msgErro(err)); } };
      if (act === 'aba') { S.adm.aba = b.dataset.aba; S.adm.q = ''; return renderPraetorium(); }
      if (act === 'adm-atualizar') { S.adm.carregado = false; renderPraetorium(); return carregarAdm(); }
      if (act === 'adm-novo') { S.adm.novo = true; S.adm.editando = null; return renderPraetorium(); }
      if (act === 'adm-editar') { S.adm.editando = id; S.adm.novo = false; return renderPraetorium(); }
      if (act === 'adm-cancelar') { S.adm.editando = null; S.adm.novo = false; return renderPraetorium(); }
      if (act === 'adm-excluir') { if (confirm('Excluir este personagem? Ele some da Tabula Famae e da conta do jogador; dá para restaurar aqui.')) await feito(() => db.editar(id, { excluido_em: new Date().toISOString() }), 'Personagem excluído.'); return; }
      if (act === 'adm-restaurar') return feito(() => db.editar(id, { excluido_em: null }), 'Personagem restaurado.');
      if (act === 'adm-remover-fama') { const m = prompt('Motivo da remoção (aparece para o jogador):', ''); if (m === null) return; return feito(() => db.remover(reg, m.trim()), 'Lançamento removido.'); }
      if (act === 'adm-restaurar-fama') return feito(() => db.restaurar(reg), 'Lançamento restaurado.');
      if (act === 'adm-membro') return feito(() => db.definirMembro(alvo, b.dataset.valor === '1'), 'Situação atualizada.');
    });

    /* ---------- integração com as janelas do Guia ---------- */
    P.hooks = P.hooks || {};
    P.hooks.conta = { open() { renderConta(); if (uid() && ehMembro() && !S.deuses) carregarDeuses().then(renderConta); } };
    P.hooks.famae = { open() { renderFamae(); carregarTabula(); } };
    P.hooks.praetorium = { open() { renderPraetorium(); if (!S.adm.carregado) carregarAdm(); } };
    const fichaHook = P.hooks.ficha;
    if (fichaHook) P.hooks.ficha = { ...fichaHook, open() { travarFicha(); return fichaHook.open?.(); } };

    // Para depuração no console e testes: o estado e as funções de dados.
    P.online = { ativo: ON, estado: S, db, aplicar, entrar, sair, recarregarMeus: () => (uid() && ehMembro() ? recarregarMeus() : null) };
    iniciar();
  }

  if (window.PRINCIPIA && window.PRINCIPIA.api) start();
  else window.addEventListener('principia:ready', start, { once: true });
})();
