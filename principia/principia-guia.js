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
    sistema: { economia: 'b-monetario' },
    crafting: { forja: 'b-forja' },
    magia: { introducao: 'b-magia-poder-divino', circulos: 'b-circulos' },
    roma: { 'situacao-atual-roma': 'b-trama', 'nazzano-atualizacao': 'b-roma-novo-lar', 'devocao-divina': 'b-devocao' }
  };

  /* Artes quadradas que acompanham o texto de algumas seções. */
  const ARTS = {
    sistema: { familiares: 'a-familiar', talentos: 'a-fama' },
    crafting: { alquimia: 'a-minerios' },
    magia: { magicos: 'a-magia' },
    roma: { acampamento: 'a-legio', 'regras-acampamento': 'a-spqr', 'juramentos-orcus': 'a-religio' }
  };

  /* Capítulos em papel (o resto fica no fundo escuro). Sem capítulos, alterna seção a seção. */
  const PAPER_CHAPTERS = {
    sistema: ['Mecânicas', 'Outros sistemas'],
    combate: ['Situações de combate'],
    magia: ['Círculos e conjuração', 'Limites'],
    roma: ['Trajetória', 'Além de Roma', 'Religio']
  };
  const PAPER_SECTIONS = {
    crafting: ['forja', 'alquimia', 'forja-canonica'],
    deuses: ['triunviros', 'dii-inferi', 'ventis'],
    domus: ['domus-memoriae']
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

  function arts(k) {
    const map = ARTS[k] || {};
    for (const [id, name] of Object.entries(map)) {
      const sec = content.querySelector(`:scope > section#${CSS.escape(id)}`);
      if (!sec || sec.querySelector(':scope > .pg-art')) continue;
      const head = sec.querySelector(':scope > .section-head');
      const f = figure('pg-art', hq(name), 'loading="lazy"');
      head ? head.after(f) : sec.prepend(f);
    }
  }

  function tones(k) {
    const sections = topSections();
    sections.forEach(s => s.classList.remove('pg-paper', 'pg-chapter-start'));
    const chapters = (P.api?.chapters?.() || {})[k];
    const paperNames = PAPER_CHAPTERS[k];
    if (chapters && paperNames) {
      let current = null;
      for (const s of sections) {
        if (chapters[s.id]) { current = chapters[s.id]; s.classList.add('pg-chapter-start'); s.dataset.pgChapter = current; }
        if (current && paperNames.includes(current)) s.classList.add('pg-paper');
      }
      return;
    }
    const ids = PAPER_SECTIONS[k] || [];
    for (const s of sections) if (ids.includes(s.id)) s.classList.add('pg-paper');
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
