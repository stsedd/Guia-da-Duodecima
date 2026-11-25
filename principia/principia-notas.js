/* ==========================================================================
   GUIA DA DUODÉCIMA · Notae (bloco de notas)
   - A janela Notae vira um caderno: várias notas, cada uma com cor, título
     (a primeira linha) e data da última edição.
   - Qualquer nota pode ser fixada na área de trabalho como nota adesiva:
     dá para ter várias abertas ao mesmo tempo, arrastar, redimensionar e
     trocar a cor. No celular, as notas ficam só no caderno.
   - Tudo fica neste navegador (localStorage "principia_notas_v2"). A nota
     única antiga ("principia_notes_v1") vira a primeira nota do caderno.
   ========================================================================== */
(() => {
  'use strict';

  const CHAVE = 'principia_notas_v2';
  const ANTIGA = 'principia_notes_v1';
  const CORES = [
    ['papiro', 'Papiro'], ['rosa', 'Rosa'], ['salvia', 'Sálvia'], ['ceu', 'Céu'], ['legiao', 'Vermelho da Legião']
  ];

  function start() {
    const P = window.PRINCIPIA;
    const A = P && P.api;
    if (!A) return;
    const { esc, svg, WM, isMobile } = A;
    const $ = (s, r = document) => r.querySelector(s);
    const corpo = $('.os-notes .os-notes-body');
    const desktop = $('#osDesktop');
    if (!corpo || !desktop) return;

    /* ---------------------------------------------------------------- dados */
    const agora = () => new Date().toISOString();
    const novoId = () => 'nota-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    function ler() {
      try {
        const d = JSON.parse(localStorage.getItem(CHAVE) || 'null');
        if (d && Array.isArray(d.notas)) return d;
      } catch {}
      let texto = '';
      try { texto = localStorage.getItem(ANTIGA) || ''; } catch {}
      const n = { id: novoId(), texto, cor: 'papiro', criada: agora(), editada: agora(), fixa: null };
      return { v: 2, notas: [n], atual: n.id };
    }
    const D = ler();
    let timer = 0;
    const status = txt => { const el = $('.nt-status', corpo); if (el) el.textContent = txt; };
    function salvar(agoraMesmo) {
      clearTimeout(timer);
      const fazer = () => {
        try { localStorage.setItem(CHAVE, JSON.stringify(D)); status('Salvo neste navegador.'); }
        catch { status('Não foi possível salvar. Copie suas anotações antes de sair.'); }
      };
      if (agoraMesmo) fazer(); else { status('Salvando…'); timer = setTimeout(fazer, 300); }
    }
    const nota = id => D.notas.find(n => n.id === id) || null;
    const titulo = n => (String(n.texto || '').split('\n').map(l => l.trim()).find(Boolean) || 'Nota sem título').slice(0, 48);
    const quando = iso => { try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
    if (!nota(D.atual)) D.atual = D.notas[0]?.id || null;

    /* ---------------------------------------------------------------- caderno (janela Notae) */
    function renderCaderno() {
      const atual = nota(D.atual);
      const lista = [...D.notas].sort((a, b) => String(b.editada).localeCompare(String(a.editada)));
      corpo.classList.add('is-caderno');
      corpo.innerHTML = `
        <aside class="nt-lista" aria-label="Notas">
          <button class="nt-nova" type="button" data-nt="nova">${svg('quill')}Nova nota</button>
          <div class="nt-itens" role="list">${lista.map(n => `<button class="nt-item nt-cor-${esc(n.cor)}${n.id === D.atual ? ' is-atual' : ''}" type="button" role="listitem" data-nt="abrir" data-id="${esc(n.id)}" aria-current="${n.id === D.atual}"><b>${esc(titulo(n))}</b><small>${esc(quando(n.editada))}${n.fixa ? ' · na área de trabalho' : ''}</small></button>`).join('')}</div>
        </aside>
        <div class="nt-editor">
          ${atual ? `<div class="nt-barra">
            <div class="nt-cores" role="group" aria-label="Cor da nota">${CORES.map(([c, nome]) => `<button class="nt-cor nt-cor-${c}${atual.cor === c ? ' is-on' : ''}" type="button" data-nt="cor" data-cor="${c}" title="${nome}" aria-label="Cor ${nome}" aria-pressed="${atual.cor === c}"></button>`).join('')}</div>
            <span class="nt-esp"></span>
            ${isMobile() ? '' : `<button class="os-btn os-btn--ghost nt-acao" type="button" data-nt="fixar">${atual.fixa ? 'Tirar da área de trabalho' : 'Fixar na área de trabalho'}</button>`}
            <button class="os-btn os-btn--ghost nt-acao nt-perigo" type="button" data-nt="excluir">Excluir</button>
          </div>
          <label class="os-vh" for="osNotesText">Texto da nota</label>
          <textarea id="osNotesText" class="nt-cor-${esc(atual.cor)}" placeholder="Escreva aqui… A primeira linha vira o título." maxlength="50000">${esc(atual.texto || '')}</textarea>` : '<p class="nt-vazio">Nenhuma nota. Crie a primeira em “Nova nota”.</p>'}
          <small class="nt-status" id="osNotesStatus" role="status">Salvo neste navegador.</small>
        </div>`;
    }
    function atualizarItem(n) {
      const it = corpo.querySelector(`.nt-item[data-id="${CSS.escape(n.id)}"]`);
      if (it) { it.querySelector('b').textContent = titulo(n); it.querySelector('small').textContent = quando(n.editada) + (n.fixa ? ' · na área de trabalho' : ''); }
    }
    function nova(fixar) {
      const n = { id: novoId(), texto: '', cor: CORES[D.notas.length % CORES.length][0], criada: agora(), editada: agora(), fixa: null };
      D.notas.push(n);
      D.atual = n.id;
      if (fixar) n.fixa = posicaoNova();
      salvar(true);
      renderCaderno();
      renderFixas();
      (fixar ? camada.querySelector(`[data-id="${CSS.escape(n.id)}"] textarea`) : $('#osNotesText'))?.focus();
      return n;
    }
    corpo.addEventListener('click', e => {
      const b = e.target.closest('[data-nt]');
      if (!b) return;
      const acao = b.dataset.nt;
      const atual = nota(D.atual);
      if (acao === 'nova') return nova(false);
      if (acao === 'abrir') { D.atual = b.dataset.id; salvar(true); renderCaderno(); $('#osNotesText')?.focus(); return; }
      if (!atual) return;
      if (acao === 'cor') { atual.cor = b.dataset.cor; salvar(); renderCaderno(); renderFixas(); return; }
      if (acao === 'fixar') { atual.fixa = atual.fixa ? null : posicaoNova(); salvar(true); renderCaderno(); renderFixas(); return; }
      if (acao === 'excluir') {
        if (!confirm(`Excluir “${titulo(atual)}”? Não dá para desfazer.`)) return;
        D.notas = D.notas.filter(n => n !== atual);
        if (!D.notas.length) D.notas.push({ id: novoId(), texto: '', cor: 'papiro', criada: agora(), editada: agora(), fixa: null });
        D.atual = D.notas[0].id;
        salvar(true); renderCaderno(); renderFixas();
      }
    });
    corpo.addEventListener('input', e => {
      if (e.target.id !== 'osNotesText') return;
      const n = nota(D.atual);
      if (!n) return;
      n.texto = e.target.value; n.editada = agora();
      const fixa = camada.querySelector(`[data-id="${CSS.escape(n.id)}"] textarea`);
      if (fixa) fixa.value = n.texto;
      atualizarItem(n); salvar();
    });
    corpo.addEventListener('focusout', e => { if (e.target.id === 'osNotesText') salvar(true); });

    /* ---------------------------------------------------------------- notas adesivas (área de trabalho) */
    const camada = document.createElement('div');
    camada.className = 'nt-fixas';
    camada.setAttribute('aria-label', 'Notas fixadas na área de trabalho');
    desktop.append(camada);
    function posicaoNova() {
      const k = D.notas.filter(n => n.fixa).length;
      return { x: Math.round(innerWidth * 0.32) + (k % 6) * 28, y: 90 + (k % 6) * 28, w: 240, h: 220 };
    }
    const limitar = f => {
      const w = Math.max(180, Math.min(f.w || 240, innerWidth - 20)), h = Math.max(140, Math.min(f.h || 220, innerHeight - 70));
      return { w, h, x: Math.max(8, Math.min(f.x, innerWidth - w - 8)), y: Math.max(48, Math.min(f.y, innerHeight - h - 8)) };
    };
    let ordem = 0;
    function renderFixas() {
      if (isMobile()) { camada.innerHTML = ''; return; }
      const fixas = D.notas.filter(n => n.fixa);
      camada.innerHTML = fixas.map(n => {
        const f = limitar(n.fixa);
        return `<article class="nt-fixa nt-cor-${esc(n.cor)}" data-id="${esc(n.id)}" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px" aria-label="Nota: ${esc(titulo(n))}">
          <header class="nt-fixa-topo" title="Arraste para mover">
            <button type="button" data-fx="cor" aria-label="Trocar a cor" title="Trocar a cor"><i></i></button>
            <span class="nt-esp"></span>
            <button type="button" data-fx="caderno" aria-label="Abrir no caderno (Notae)" title="Abrir no caderno">${svg('open')}</button>
            <button type="button" data-fx="nova" aria-label="Nova nota adesiva" title="Nova nota adesiva">${svg('quill')}</button>
            <button type="button" data-fx="fechar" aria-label="Tirar da área de trabalho (a nota continua no caderno)" title="Tirar da área de trabalho">${svg('close')}</button>
          </header>
          <textarea aria-label="Texto da nota" placeholder="Escreva aqui…" maxlength="50000">${esc(n.texto || '')}</textarea>
        </article>`;
      }).join('');
      vigiarTamanhos();
    }
    let vigia = null;
    function vigiarTamanhos() {
      if (!('ResizeObserver' in window)) return;
      vigia?.disconnect();
      vigia = new ResizeObserver(ents => {
        for (const e of ents) {
          const n = nota(e.target.dataset.id);
          if (!n?.fixa) continue;
          const w = Math.round(e.target.offsetWidth), h = Math.round(e.target.offsetHeight);
          if (w !== n.fixa.w || h !== n.fixa.h) { n.fixa.w = w; n.fixa.h = h; salvar(); }
        }
      });
      camada.querySelectorAll('.nt-fixa').forEach(el => vigia.observe(el));
    }
    camada.addEventListener('pointerdown', e => {
      const el = e.target.closest('.nt-fixa');
      if (!el) return;
      el.style.zIndex = String(++ordem);
      const topo = e.target.closest('.nt-fixa-topo');
      if (!topo || e.target.closest('button') || e.button !== 0) return;
      const n = nota(el.dataset.id);
      if (!n?.fixa) return;
      e.preventDefault();
      topo.setPointerCapture(e.pointerId);
      const x0 = e.clientX - el.offsetLeft, y0 = e.clientY - el.offsetTop;
      el.classList.add('is-arrastando');
      const mover = ev => {
        const f = limitar({ ...n.fixa, x: ev.clientX - x0, y: ev.clientY - y0 });
        el.style.left = f.x + 'px'; el.style.top = f.y + 'px';
        n.fixa.x = f.x; n.fixa.y = f.y;
      };
      const soltar = () => { el.classList.remove('is-arrastando'); topo.removeEventListener('pointermove', mover); topo.removeEventListener('pointerup', soltar); topo.removeEventListener('pointercancel', soltar); salvar(true); };
      topo.addEventListener('pointermove', mover);
      topo.addEventListener('pointerup', soltar);
      topo.addEventListener('pointercancel', soltar);
    });
    camada.addEventListener('click', e => {
      const b = e.target.closest('[data-fx]');
      if (!b) return;
      const el = b.closest('.nt-fixa');
      const n = nota(el?.dataset.id);
      if (!n) return;
      const acao = b.dataset.fx;
      if (acao === 'cor') { const i = CORES.findIndex(c => c[0] === n.cor); n.cor = CORES[(i + 1) % CORES.length][0]; salvar(); renderFixas(); if (WM.isOpen('notes')) renderCaderno(); }
      else if (acao === 'fechar') { n.fixa = null; salvar(true); renderFixas(); if (WM.isOpen('notes')) renderCaderno(); }
      else if (acao === 'nova') nova(true);
      else if (acao === 'caderno') { D.atual = n.id; salvar(true); renderCaderno(); A.openUtil('notes', null); }
    });
    camada.addEventListener('input', e => {
      const el = e.target.closest('.nt-fixa');
      const n = nota(el?.dataset.id);
      if (!n || e.target.tagName !== 'TEXTAREA') return;
      n.texto = e.target.value; n.editada = agora();
      if (n.id === D.atual) { const t = $('#osNotesText'); if (t && document.activeElement !== t) t.value = n.texto; }
      atualizarItem(n); salvar();
    });
    camada.addEventListener('focusout', e => { if (e.target.tagName === 'TEXTAREA') salvar(true); });

    window.addEventListener('pagehide', () => salvar(true));
    window.addEventListener('resize', () => { clearTimeout(renderFixas._t); renderFixas._t = setTimeout(renderFixas, 200); });
    renderCaderno();
    renderFixas();
    P.notas = { nova, dados: D };
  }

  if (window.PRINCIPIA && window.PRINCIPIA.api) start();
  else window.addEventListener('principia:ready', start, { once: true });
})();
