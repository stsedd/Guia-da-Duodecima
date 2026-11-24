/* Principia · Guia em formato pôster
   A cada página renderizada pelo motor, aplica a camada visual do Guia:
   - capa do arquivo com o banner em alta (ou o friso dos panteões, em Deuses);
   - banners das seções trocados pelas versões originais em 1920 px, incluindo os que faltavam;
   - artes de seção e recortes PNG da Domus Memoriae;
   - capítulos alternando fundo escuro e papel.
   Só adiciona elementos decorativos (aria-hidden, alt vazio) e classes: o texto do Guia não muda. */
(() => {
  'use strict';
  const content = document.getElementById('content');
  if (!content) return;
  const P = window.PRINCIPIA || {};
  const HQ = 'assets/principia/hq/';
  const hq = name => `${HQ}${name}.webp`;

  /* Capa de cada arquivo. "title" só aparece quando a página não tem um título próprio (h1). */
  const COVERS = {
    personagem: { img: 'b-sistema-de-jogo' },
    cursus: { img: 'b-legio' },
    'casa-do-lobo': { img: 'cover-roma', tall: true },
    'roma-hoje': { img: 'b-roma-novo-lar' },
    /* Familiares, Infos Extras e Domus abrem com o título, sem capa. */
    sistema: { img: 'b-sistema-de-jogo', title: 'Sistema' },
    combate: { img: 'b-combate' },
    crafting: { img: 'b-crafting' },
    magia: { img: 'b-magia' },
    deuses: { frieze: ['a-triunviros', 'a-dii-consentis', 'a-dii-inferi', 'a-alati', 'a-ventis', 'a-numina'] },
    roma: { img: 'cover-roma', tall: true }
    /* Domus: sem capa; o título da própria página abre o arquivo e os quadros vêm logo depois. */
  };

  /* Banners já existentes no Guia → mesma arte em alta resolução. */
  const SWAP = {
    'banner-sistema.webp': 'b-herancas',
    'banner-legados.webp': 'b-legados',
    'reclamacoes.webp': 'b-reclamacoes',
    'atributos.webp': 'b-atributos',
    'banner-status.webp': 'b-status',
    'banner-treinamento.webp': 'b-treinamento',
    'hierarquia.webp': 'b-hierarquia',
    'afinidade.webp': 'b-afinidade',
    'banner-rebentos.webp': 'b-rebento',
    'banner-boas-praticas.webp': 'b-boas-praticas',
    'sobre-casa-lobo.webp': 'b-casa-do-lobo',
    'sobre-coortes.webp': 'b-coortes',
    'sobre-nova-roma.webp': 'b-nova-roma',
    'sobre-panteoes.webp': 'b-panteoes',
    'banner-tempo-duodecima.webp': 'b-tempo',
    'banner-bolsa-decimus.webp': 'b-bolsa-decimus',
    'mapa-panteoes.webp': 'm-influencia',
    'deuses-triunviros.webp': 'a-triunviros',
    'deuses-dii-consentis.webp': 'a-dii-consentis',
    'deuses-dii-inferi.webp': 'a-dii-inferi',
    'deuses-alati.webp': 'a-alati',
    'deuses-ventis.webp': 'a-ventis',
    'deuses-numina.webp': 'a-numina',
    '04-jasmine-blume.webp': 'c-jasmine-blume',
    '01-cerise-cassius.png': 'c-cerise-cassius',
    '01-cerise-cassius.webp': 'c-cerise-cassius',
    '02-celeste-caelus.png': 'c-celeste-caelus',
    '02-celeste-caelus.webp': 'c-celeste-caelus',
    '03-cyrus.png': 'c-cyrus',
    '03-cyrus.webp': 'c-cyrus'
  };

  /* Seções que ganham banner (a arte existe, mas o Guia não a usava). */
  const BANDS = {
    cursus: { economia: 'b-monetario' },
    'roma-hoje': { 'situacao-atual-roma': 'b-trama' },
    extras: { 'nazzano-atualizacao': 'b-roma-novo-lar', panteoes: 'b-panteoes' },
    deuses: { 'devocao-divina': 'b-devocao' },
    sistema: { economia: 'b-monetario' },
    crafting: { forja: 'b-forja' },
    magia: { introducao: 'b-magia-poder-divino', circulos: 'b-circulos' },
    roma: { 'situacao-atual-roma': 'b-trama', 'nazzano-atualizacao': 'b-roma-novo-lar', 'devocao-divina': 'b-devocao' }
  };

  /* Artes quadradas que acompanham o texto de algumas seções. */
  const ARTS = {
    personagem: { talentos: 'a-fama' },
    familiares: { familiares: 'a-familiar' },
    'casa-do-lobo': { acampamento: 'a-legio' },
    'roma-hoje': { 'regras-acampamento': 'a-spqr' },
    extras: { 'juramentos-orcus': 'a-religio' },
    sistema: { familiares: 'a-familiar', talentos: 'a-fama' },
    crafting: { alquimia: 'a-minerios' },
    magia: { magicos: 'a-magia' },
    roma: { acampamento: 'a-legio', 'regras-acampamento': 'a-spqr', 'juramentos-orcus': 'a-religio' }
  };


  const key = () => (/\bpage-([a-z0-9-]+)/.exec(content.className) || [])[1] || null;
  const topSections = () => [...content.querySelectorAll(':scope > section.section[id]')];
  const base = src => String(src || '').split('?')[0].split('/').pop();

  function figure(cls, src, extra = '') {
    const f = document.createElement('figure');
    f.className = cls;
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = `<img src="${src}" alt="" decoding="async" ${extra}>`;
    return f;
  }

  function cover(k) {
    const existing = content.querySelector(':scope > .pg-cover');
    if (existing && existing.dataset.page === k && existing === content.firstElementChild) return;
    existing?.remove();
    const c = COVERS[k];
    if (!c) return;
    const el = document.createElement('div');
    el.dataset.page = k;
    el.className = 'pg-cover' + (c.tall ? ' pg-cover--tall' : '') + (c.frieze ? ' pg-cover--frieze' : '') + (c.cutout ? ' pg-cover--cutout' : '');
    el.setAttribute('aria-hidden', 'true');
    if (c.title) el.dataset.title = c.title;
    el.innerHTML = c.frieze
      ? c.frieze.map(n => `<img src="${hq(n)}" alt="" decoding="async">`).join('')
      : `<img src="${hq(c.img)}" alt="" decoding="async" fetchpriority="high">`;
    content.prepend(el);
  }

  function swapImages() {
    for (const img of content.querySelectorAll('img[src]')) {
      if (img.closest('.pg-cover,.pg-band,.pg-art')) continue;
      const to = SWAP[base(img.getAttribute('src'))];
      if (!to) continue;
      img.src = hq(to);
      img.removeAttribute('srcset');
      img.dataset.pgHq = '1';
    }
  }

  function bands(k) {
    const map = BANDS[k] || {};
    for (const [id, name] of Object.entries(map)) {
      const sec = content.querySelector(`:scope > section#${CSS.escape(id)}`);
      if (!sec || sec.querySelector(':scope > .pg-band')) continue;
      sec.prepend(figure('pg-band', hq(name), 'loading="lazy"'));
    }
  }

  /* Arte lateral do tamanho do texto (pedido da Staff): o texto da seção vai para uma coluna e a
     arte ocupa a outra, com a mesma altura. Em seções longas, a arte acompanha a leitura (fixa no
     topo da coluna) em vez de terminar no meio do texto. */
  function arts(k) {
    const map = ARTS[k] || {};
    for (const [id, name] of Object.entries(map)) {
      const sec = content.querySelector(`:scope > section#${CSS.escape(id)}`);
      if (!sec || sec.querySelector('.pg-art')) continue;
      const head = sec.querySelector(':scope > .section-head');
      const wrap = document.createElement('div');
      wrap.className = 'pg-art-wrap';
      const body = document.createElement('div');
      body.className = 'pg-art-body';
      const moving = [];
      for (let n = head ? head.nextElementSibling : sec.firstElementChild; n; n = n.nextElementSibling) {
        if (n.matches('.pg-band,.banner-strip,.rules-banner,.section-visual')) continue;
        moving.push(n);
      }
      moving.forEach(n => body.append(n));
      const f = figure('pg-art', hq(name), 'loading="lazy"');
      const img = f.querySelector('img');
      const frame = document.createElement('span');
      frame.className = 'pg-art-frame';
      frame.append(img);
      f.append(frame);
      wrap.append(body, f);
      head ? head.after(wrap) : sec.append(wrap);
    }
  }

  /* Um tema por modo em todas as abas (pedido da Staff): sem faixas alternadas de papel.
     Os capítulos continuam abrindo com o letreiro, agora nas cores do tema. */
  const chapterObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const entry of entries) entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }, { root: document.getElementById('osScroller') })
    : null;
  const observedChapters = new Set();
  function tones(k) {
    const chapters = (P.api?.chapters?.() || {})[k] || {};
    for (const el of observedChapters) {
      if (!el.isConnected || !content.contains(el)) {
        chapterObserver?.unobserve(el);
        observedChapters.delete(el);
      }
    }
    for (const s of topSections()) {
      const label = chapters[s.id];
      s.classList.remove('pg-paper');
      s.classList.toggle('pg-chapter-start', !!label);
      let marquee = s.querySelector(':scope > .pg-chapter-marquee');
      if (!label) {
        if (marquee) { chapterObserver?.unobserve(marquee); observedChapters.delete(marquee); marquee.remove(); }
        continue;
      }
      s.dataset.pgChapter = label;
      if (!marquee) {
        marquee = document.createElement('div');
        marquee.className = 'pg-chapter-marquee';
        marquee.setAttribute('aria-hidden', 'true');
      }
      if (marquee.dataset.label !== label) {
        marquee.dataset.label = label;
        const track = document.createElement('div');
        track.className = 'pg-chapter-track';
        const group = document.createElement('div');
        group.className = 'pg-chapter-copy';
        for (let i = 0; i < 3; i++) {
          const word = document.createElement('span');
          word.textContent = label + ' · ';
          group.append(word);
        }
        track.append(group, group.cloneNode(true));
        marquee.replaceChildren(track);
      }
      if (s.firstElementChild !== marquee) s.prepend(marquee);
      if (!observedChapters.has(marquee)) {
        observedChapters.add(marquee);
        if (chapterObserver) chapterObserver.observe(marquee);
        else marquee.classList.add('is-visible');
      }
    }
  }

  /* Numeração das seções (01, 02…) para o cabeçalho em formato pôster. */
  function numbers() {
    let n = 0;
    for (const s of topSections()) {
      if (s.classList.contains('deity-detail')) continue;
      n += 1;
      s.style.setProperty('--pg-n', `"${String(n).padStart(2, '0')}"`);
    }
  }

  /* A faixa de metadados (Magia e Roma) vem antes da abertura no motor; desce para depois do título. */
  function metaStrip() {
    const strip = content.querySelector(':scope > .guide-page-hero');
    const opening = content.querySelector(':scope > :is(.magic-opening,.about-opening)');
    if (strip && opening && strip.compareDocumentPosition(opening) & Node.DOCUMENT_POSITION_FOLLOWING) opening.after(strip);
  }

  function decorate() {
    const k = key();
    if (!k) return;
    content.dataset.pgPage = k;
    cover(k);
    metaStrip();
    swapImages();
    bands(k);
    arts(k);
    tones(k);
    numbers();
  }

  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; decorate(); });
  };
  window.addEventListener('principia:rendered', decorate);
  /* As camadas do motor ainda inserem banners depois da renderização: troca de novo quando isso acontece. */
  new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && !node.closest?.('.pg-cover,.pg-band,.pg-art') && (node.matches?.('img,figure,.banner-strip,.rules-banner,section') || node.querySelector?.('img'))) { queue(); return; }
      }
    }
  }).observe(content, { childList: true, subtree: true });
  if (key()) decorate();
})();
