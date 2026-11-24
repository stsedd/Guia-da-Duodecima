/* ==========================================================================
   PRINCIPIA · interface de terminal do Guia da Duodécima
   Área de trabalho, janelas, menus, busca, Tabularium e tela inicial do celular.
   O conteúdo continua vindo do motor do Guia (GUIA_CONTENT, GUIA_SEARCH, Core);
   esta camada só decide como ele é apresentado.
   ========================================================================== */
(() => {
  'use strict';

  const P = window.PRINCIPIA = window.PRINCIPIA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const body = document.body;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const wait = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
  /* Espera uma animação terminar, sem travar se o navegador pausar animações (aba em segundo plano). */
  const settle = (anim, ms) => Promise.race([anim.finished.catch(() => {}), wait(ms + 150)]);
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
  const mqMobile = matchMedia('(max-width: 759px)');
  const isMobile = () => mqMobile.matches;
  const reduced = () => html.dataset.motion === 'reduce';
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
    del(k) { try { sessionStorage.removeItem(k); } catch {} }
  };

  function roman(n) {
    n = Math.floor(n);
    if (!(n > 0 && n < 4000)) return String(n);
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
    return out;
  }

  /* Data no calendário romano (Kalendae, Nonae, Idus), com contagem inclusiva. */
  function romanDate(d) {
    const M = ['Ian.', 'Feb.', 'Mart.', 'Apr.', 'Mai.', 'Iun.', 'Iul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    const m = d.getMonth(), day = d.getDate();
    const nonae = [2, 4, 6, 9].includes(m) ? 7 : 5;
    const idus = nonae + 8;
    const before = (n, mark, month) => n === 2 ? `prid. ${mark} ${month}` : `a.d. ${roman(n)} ${mark} ${month}`;
    if (day === 1) return `Kal. ${M[m]}`;
    if (day < nonae) return before(nonae - day + 1, 'Non.', M[m]);
    if (day === nonae) return `Non. ${M[m]}`;
    if (day < idus) return before(idus - day + 1, 'Id.', M[m]);
    if (day === idus) return `Id. ${M[m]}`;
    const last = new Date(d.getFullYear(), m + 1, 0).getDate();
    return before(last - day + 2, 'Kal.', M[(m + 1) % 12]);
  }

  /* ---------- Ícones vetoriais ---------- */
  const SVG = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    note: '<path d="M7 3.5h7.5L19 8v12.5H7z"/><path d="M14.5 3.5V8H19M10 12.5h6M10 16h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ext: '<path d="M7 17 17 7M9 7h8v8"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    power: '<path d="M12 3.5v7"/><path d="M6.6 7.2a7.5 7.5 0 1 0 10.8 0"/>',
    desktop: '<rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2H10l2 2h6.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    open: '<path d="M14 4.5h5.5V10M19.5 4.5 12 12"/><path d="M18.5 14v4.5a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1H10"/>',
    book: '<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h12v15h-12a2 2 0 0 0-2 2z"/><path d="M4.5 20.5a2 2 0 0 1 2-2h12v2h-12"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 5.3h3"/><path d="M9.5 10.5h5M9.5 13.5h3.2"/>',
    music: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.6"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"/>'
  };
  const svg = (name, cls = 'os-svg') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${SVG[name] || ''}</svg>`;

  /* ---------- Apps ---------- */
  const FICHA_URL = 'https://stsedd.github.io/ficha-oficial-duodecima-rpg/';
  /* Canal do iMessage (mensagens entre personagens) no Discord da Duodécima. */
  const IMESSAGE_URL = 'https://discord.com/channels/1498461819902234624/1498486495668080761';
  const ICON = n => `assets/principia/icons/${n}.webp`;
  const PAGES = ['sistema', 'combate', 'crafting', 'magia', 'deuses', 'roma', 'domus'];
  const APPS = {
    sistema: { kind: 'page', title: 'Sistema', art: ICON('sistema'), tilt: -3 },
    combate: { kind: 'page', title: 'Combate', art: ICON('combate'), tilt: 2 },
    crafting: { kind: 'page', title: 'Crafting', art: ICON('crafting'), tilt: -2 },
    magia: { kind: 'page', title: 'Magia', art: ICON('magia'), tilt: 3 },
    deuses: { kind: 'page', title: 'Deuses', art: ICON('deuses'), tilt: -3 },
    roma: { kind: 'page', title: 'Sobre Roma', short: 'Roma', art: ICON('roma'), tilt: 2 },
    domus: { kind: 'page', title: 'Domus Memoriae', short: 'Domus', art: ICON('domus'), tilt: -2 },
    tabularium: { kind: 'win', win: 'tabularium', title: 'Tabularium', art: ICON('tabularium'), tilt: 3 },
    mapa: { kind: 'route', title: 'Mapas', route: ['roma', 'mapa-acampamento'], art: ICON('mapa'), tilt: -2 },
    minhaficha: { kind: 'win', win: 'ficha', title: 'Minha Ficha', art: ICON('ficha'), tilt: -2 },
    ficha: { kind: 'external', title: 'Ficha Oficial', href: FICHA_URL, glyph: 'book', tilt: 2 },
    imessage: { kind: 'external', title: 'iMessage', href: IMESSAGE_URL, custom: 'phone', glyph: 'phone', tilt: -2 },
    musica: { kind: 'win', win: 'musica', title: 'Música', custom: 'vinyl', glyph: 'music', tilt: 3 },
    leiame: { kind: 'win', win: 'leiame', title: 'Leia-me', glyph: 'note', tilt: -3 },
    prefs: { kind: 'win', win: 'prefs', title: 'Preferências', short: 'Ajustes', glyph: 'gear', tilt: 2 },
    sobre: { kind: 'win', win: 'sobre', title: 'Sobre', glyph: 'info', tilt: 0 },
    buscar: { kind: 'action', action: 'search', title: 'Buscar', glyph: 'search', tilt: 0 }
  };
  const pagesData = () => window.GUIA_CONTENT || {};
  const appTitle = id => (APPS[id]?.kind === 'page' && pagesData()[id]?.title) || APPS[id]?.title || id;
  const shortTitle = id => APPS[id]?.short || appTitle(id);

  const content = $('#content');
  const scroller = $('#osScroller');
  const desktop = $('#osDesktop');
  const reader = $('#osReader');
  const dropdown = $('#osDropdown');
  const searchInput = $('#globalSearch');
  const spot = $('#osSpot');

  /* Celular do iMessage: desenho próprio no estilo da legião. */
  const PHONE_ART = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect class="os-phone-body" x="12" y="4.5" width="23" height="39" rx="5.5"/><rect class="os-phone-screen" x="14.6" y="9.5" width="17.8" height="29" rx="2.2"/><rect class="os-phone-speaker" x="20.5" y="6.4" width="6" height="1.5" rx=".75"/><g class="os-phone-bubble"><path d="M19.5 15h14a4 4 0 0 1 4 4v6.2a4 4 0 0 1-4 4h-6.8l-5.2 4.3v-4.3h-2a4 4 0 0 1-4-4V19a4 4 0 0 1 4-4z"/><circle cx="22.2" cy="22.1" r="1.6"/><circle cx="26.5" cy="22.1" r="1.6"/><circle cx="30.8" cy="22.1" r="1.6"/></g></svg>';
  function artHTML(a) {
    const ext = a.kind === 'external' ? `<span class="os-ico-ext">${svg('ext')}</span>` : '';
    if (a.custom === 'phone') return `<span class="os-ico-art os-ico-art--phone">${PHONE_ART}${ext}</span>`;
    if (a.custom === 'vinyl') return `<span class="os-ico-art os-ico-art--vinyl"><i class="os-vinyl"></i>${ext}</span>`;
    if (a.art) return `<span class="os-ico-art" style="background-image:url('${a.art}')">${ext}</span>`;
    return `<span class="os-ico-art os-ico-art--glyph">${svg(a.glyph)}${ext}</span>`;
  }
  /* Versão pequena do ícone (busca e menus). */
  const miniArt = id => APPS[id].art ? `<img src="${APPS[id].art}" alt="">` : `<span class="os-mini-glyph">${svg(APPS[id].glyph)}</span>`;

  function iconHTML(id, i, opts = {}) {
    const a = APPS[id];
    if (!a) return '';
    const label = opts.short ? shortTitle(id) : appTitle(id);
    const art = artHTML(a);
    const attrs = `class="os-ico" data-app="${id}" style="--i:${i};--tilt:${a.tilt || 0}deg"`;
    if (a.kind === 'external') {
      return `<a ${attrs} href="${a.href}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)} (abre em nova aba)">${art}<span class="os-ico-label">${esc(label)}</span></a>`;
    }
    return `<button type="button" ${attrs} aria-label="${esc(label)}">${art}<span class="os-ico-label">${esc(label)}</span></button>`;
  }

  function renderShell() {
    // O link do iMessage vem só de IMESSAGE_URL: trocar o canal é editar uma linha.
    $$('.os-bar-btn--msg').forEach(a => { a.href = IMESSAGE_URL; });
    $('#osIconsLeft').innerHTML = PAGES.map((k, i) => iconHTML(k, i)).join('');
    $('#osIconsRight').innerHTML = ['minhaficha', 'tabularium', 'mapa', 'ficha', 'imessage', 'musica', 'leiame', 'prefs'].map((k, i) => iconHTML(k, i + 2)).join('');
    $('#osHomeGrid').innerHTML = [...PAGES, 'mapa', 'tabularium', 'ficha', 'prefs'].map((k, i) => iconHTML(k, i, { short: true })).join('');
    $('#osDock').innerHTML = ['imessage', 'musica', 'minhaficha', 'buscar'].map((k, i) => iconHTML(k, i + 10, { short: true })).join('');
    $('#osBarMenus').innerHTML =
      `<button class="os-menu-trigger os-menu-trigger--all" type="button" data-menu="all" aria-haspopup="menu" aria-expanded="false">Arquivos</button>` +
      PAGES.map(k => `<button class="os-menu-trigger os-menu-trigger--app" type="button" data-menu="app:${k}" aria-haspopup="menu" aria-expanded="false">${esc(shortTitle(k))}</button>`).join('');
    $('#osTabs').innerHTML = PAGES.map(k => `<button class="os-tab" type="button" data-app="${k}" data-tab="${k}" title="${esc(appTitle(k))}"><img src="${APPS[k].art}" alt="">${esc(shortTitle(k))}</button>`).join('');
    $('#osSpotApps').innerHTML = [...PAGES, 'minhaficha', 'tabularium', 'mapa', 'musica', 'imessage', 'leiame'].map(k => APPS[k].kind === 'external'
      ? `<a class="os-spot-app" href="${APPS[k].href}" target="_blank" rel="noopener noreferrer" data-app="${k}">${miniArt(k)}${esc(appTitle(k))}<span class="os-spot-ext">↗</span></a>`
      : `<button class="os-spot-app" type="button" data-app="${k}">${miniArt(k)}${esc(appTitle(k))}</button>`).join('');
  }

  /* ---------- Índice de arquivos (menus e Tabularium) ---------- */
  let archiveCache = null;
  let archiveStamp = 0;
  function invalidateArchive() { archiveStamp++; }
  /* Título visível da seção (o data-title do motor guarda palavras-chave para a busca). */
  function headingOf(el) {
    const h = el.querySelector(':scope > .section-head h2,:scope > header h2,h2,h1');
    if (!h) return '';
    const c = h.cloneNode(true);
    c.querySelectorAll('.copy-anchor-btn,.section-rule').forEach(x => x.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function titleOf(el) {
    return headingOf(el) || el.dataset?.title?.trim() || el.id.replace(/-/g, ' ');
  }
  function parsePage(key, page) {
    const tpl = document.createElement('template');
    tpl.innerHTML = page.html || '';
    const secs = [...tpl.content.children].filter(el => el.matches('.section[id],section[id]'));
    const folder = { key, title: page.title || appTitle(key), files: [], groups: [] };
    if (key === 'deuses') {
      const deityEls = secs.filter(el => el.id.startsWith('deus-'));
      const deityName = el => (el.querySelector('.deity-title h2')?.textContent || el.dataset.title || titleOf(el)).replace(/\s+/g, ' ').trim();
      const deityMap = new Map(deityEls.map(el => [el.id, deityName(el)]));
      const groupEls = secs.filter(el => el.classList.contains('pantheon-section'));
      folder.files = secs.filter(el => !el.id.startsWith('deus-') && !el.classList.contains('pantheon-section')).map(el => ({ id: el.id, title: titleOf(el) }));
      folder.groups = groupEls.map(g => {
        const ids = [...new Set($$('a[href*="deus-"]', g).map(a => (a.getAttribute('href') || '').split(/[#:]/).pop()).filter(id => deityMap.has(id)))];
        return { id: g.id, title: titleOf(g), files: ids.map(id => ({ id, title: deityMap.get(id) })) };
      });
      const grouped = new Set(folder.groups.flatMap(g => g.files.map(f => f.id)));
      const orphans = deityEls.filter(el => !grouped.has(el.id));
      if (orphans.length) folder.groups.push({ id: 'outros', title: 'Outras divindades', files: orphans.map(el => ({ id: el.id, title: deityMap.get(el.id) })), virtual: true });
      // id do Core → slug usado nas âncoras do Guia (#deus-<slug>, <slug>-ativa-<n>).
      folder.coreSlugs = new Map(deityEls.filter(el => el.dataset.coreId).map(el => [el.dataset.coreId, el.id.replace(/^deus-/, '')]));
    } else {
      folder.files = secs.map(el => ({ id: el.id, title: titleOf(el) }));
    }
    folder.count = folder.files.length + folder.groups.reduce((n, g) => n + g.files.length + (g.virtual ? 0 : 1), 0);
    return folder;
  }
  function getArchive() {
    if (archiveCache && archiveCache.stamp === archiveStamp) return archiveCache.data;
    const pages = pagesData();
    const data = PAGES.filter(k => pages[k]).map(k => parsePage(k, pages[k]));
    archiveCache = { stamp: archiveStamp, data };
    return data;
  }
  const findFolder = key => getArchive().find(f => f.key === key);

  /* ==========================================================================
     Gerenciador de janelas
     ========================================================================== */
  const WM = (() => {
    const wins = {};
    let z = 200;
    const MIN = { reader: [640, 460], tabularium: [520, 380], leiame: [380, 320], prefs: [380, 380], sobre: [340, 360], viewer: [320, 260], musica: [340, 420], ficha: [360, 420] };
    let saved = {};
    try { saved = JSON.parse(store.get('principia_wins', '{}')) || {}; } catch { saved = {}; }
    const barH = () => isMobile() ? 0 : ($('#osBar')?.offsetHeight || 40);

    function defaultRect(id) {
      const vw = innerWidth, vh = innerHeight, bar = barH(), g = 14;
      if (id === 'reader') {
        if (vw < 1100) return { x: g, y: bar + g, w: vw - g * 2, h: vh - bar - g * 2 };
        const w = Math.min(1300, vw - 236);
        return { x: Math.round((vw - w) / 2), y: bar + g, w, h: vh - bar - g * 2 };
      }
      const sizes = { tabularium: [920, 620], leiame: [580, 640], prefs: [520, 640], sobre: [420, 560], musica: [480, 760], ficha: [600, 860], viewer: [Math.min(1100, vw * .82), Math.min(860, (vh - bar) * .88)] };
      const shift = { tabularium: 26, leiame: 70, prefs: 110, sobre: 0, viewer: 0, musica: 150, ficha: -120 }[id] || 0;
      const [w0, h0] = sizes[id] || [620, 480];
      const w = Math.round(Math.min(w0, vw - g * 2)), h = Math.round(Math.min(h0, vh - bar - g * 2));
      return { x: Math.round((vw - w) / 2 + shift), y: Math.round(bar + Math.max(g, (vh - bar - h) / 2 - 10) + shift * .35), w, h };
    }
    function clampRect(r, id) {
      const vw = innerWidth, vh = innerHeight, bar = barH();
      const [mw, mh] = MIN[id] || [320, 240];
      const w = Math.max(Math.min(mw, vw - 16), Math.min(r.w, vw - 8));
      const h = Math.max(Math.min(mh, vh - bar - 16), Math.min(r.h, vh - bar - 8));
      const x = Math.min(Math.max(r.x, -(w - 140)), vw - 140);
      const y = Math.min(Math.max(r.y, bar), vh - 56);
      return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    }
    const maxRect = () => { const bar = barH(); return { x: 0, y: bar, w: innerWidth, h: innerHeight - bar }; };

    function apply(w) {
      // Janelas que o usuário não moveu nem redimensionou acompanham o tamanho da tela.
      if (!w.rect || !w.custom) w.rect = defaultRect(w.id);
      const r = w.max ? maxRect() : (w.rect = clampRect(w.rect, w.id));
      const s = w.el.style;
      s.left = r.x + 'px'; s.top = r.y + 'px'; s.width = r.w + 'px'; s.height = r.h + 'px';
      w.el.classList.toggle('is-max', !!w.max);
      const maxBtn = w.el.querySelector('[data-win-action="max"]');
      if (maxBtn) { const l = w.max ? 'Restaurar' : 'Maximizar'; maxBtn.setAttribute('aria-label', l); maxBtn.title = l; }
    }
    function save() {
      const out = {};
      for (const w of Object.values(wins)) out[w.id] = { rect: w.custom ? w.rect : null, max: !!w.max, custom: !!w.custom };
      store.set('principia_wins', JSON.stringify(out));
    }
    function rectOf(src) {
      if (!src) return null;
      if (src.getBoundingClientRect) {
        const art = src.querySelector?.('.os-ico-art,.os-doc,.os-folder,img') || src;
        const r = art.getBoundingClientRect();
        return r.width && r.height ? r : null;
      }
      return src.width ? src : null;
    }
    function front(id) {
      const w = wins[id];
      if (!w) return;
      if (z > 900) {
        Object.values(wins).filter(x => x.open).sort((a, b) => (+a.el.style.zIndex || 0) - (+b.el.style.zIndex || 0)).forEach((x, i) => { x.el.style.zIndex = 200 + i; });
        z = 200 + Object.keys(wins).length;
      }
      w.el.style.zIndex = ++z;
      for (const x of Object.values(wins)) x.el.classList.toggle('is-front', x === w);
    }
    function topmost() {
      return Object.values(wins).filter(w => w.open).sort((a, b) => (+b.el.style.zIndex || 0) - (+a.el.style.zIndex || 0))[0] || null;
    }

    async function open(id, opts = {}) {
      const w = wins[id];
      if (!w) return;
      const wasOpen = w.open;
      w.open = true;
      if (opts.from) w.from = opts.from;
      apply(w);
      w.el.classList.add('is-open');
      w.el.removeAttribute('aria-hidden');
      front(id);
      w.onState?.(true);
      if (wasOpen || reduced()) return;
      const to = w.el.getBoundingClientRect();
      const from = rectOf(opts.from);
      const radius = getComputedStyle(w.el).borderRadius;
      let frames, duration;
      if (from) {
        const sx = from.width / to.width, sy = from.height / to.height;
        const dx = from.left - to.left, dy = from.top - to.top;
        frames = [
          { transformOrigin: '0 0', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0, borderRadius: '42px' },
          { transformOrigin: '0 0', opacity: 1, offset: .3 },
          { transformOrigin: '0 0', transform: 'none', opacity: 1, borderRadius: radius }
        ];
        duration = isMobile() ? 460 : 540;
      } else {
        frames = [{ transform: 'translateY(16px) scale(.965)', opacity: 0 }, { transform: 'none', opacity: 1 }];
        duration = 320;
      }
      await settle(w.el.animate(frames, { duration, easing: 'cubic-bezier(.2,.9,.22,1)' }), duration);
    }

    async function close(id, opts = {}) {
      const w = wins[id];
      if (!w || !w.open) return;
      w.open = false;
      w.onState?.(false);
      if (!reduced()) {
        const fromR = w.el.getBoundingClientRect();
        const target = opts.to !== undefined ? opts.to : w.from;
        const toR = target && target.isConnected !== false && target.offsetParent !== null ? rectOf(target) : null;
        let frames, duration;
        if (toR) {
          const sx = toR.width / fromR.width, sy = toR.height / fromR.height;
          const dx = toR.left - fromR.left, dy = toR.top - fromR.top;
          frames = [
            { transformOrigin: '0 0', transform: 'none', opacity: 1 },
            { transformOrigin: '0 0', opacity: 1, offset: .55 },
            { transformOrigin: '0 0', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0, borderRadius: '42px' }
          ];
          duration = 420;
        } else {
          frames = [{ transform: 'none', opacity: 1 }, { transform: 'translateY(14px) scale(.965)', opacity: 0 }];
          duration = 220;
        }
        const anim = w.el.animate(frames, { duration, easing: 'cubic-bezier(.5,0,.75,.15)', fill: 'forwards' });
        await settle(anim, duration);
        if (!w.open) { w.el.classList.remove('is-open', 'is-front'); }
        anim.cancel();
      }
      if (w.open) return;
      w.el.classList.remove('is-open', 'is-front');
      w.el.setAttribute('aria-hidden', 'true');
      const t = topmost();
      if (t) front(t.id);
    }

    function toggleMax(id) {
      const w = wins[id];
      if (!w || isMobile()) return;
      const first = w.el.getBoundingClientRect();
      w.max = !w.max;
      apply(w);
      save();
      if (reduced() || !w.open) return;
      const last = w.el.getBoundingClientRect();
      const sx = first.width / last.width, sy = first.height / last.height;
      const dx = first.left - last.left, dy = first.top - last.top;
      w.el.animate([
        { transformOrigin: '0 0', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
        { transformOrigin: '0 0', transform: 'none' }
      ], { duration: 360, easing: 'cubic-bezier(.2,.9,.22,1)' });
    }

    function setupDrag(w, handle) {
      handle.addEventListener('pointerdown', e => {
        if (e.button !== 0 || isMobile()) return;
        if (e.target.closest('button,a,input,select,textarea,.os-tab')) return;
        front(w.id);
        const sx = e.clientX, sy = e.clientY;
        let r0 = null, moved = false, frame = 0;
        try { handle.setPointerCapture(e.pointerId); } catch {}
        const onMove = ev => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (!moved) {
            if (Math.hypot(dx, dy) < 4) return;
            moved = true;
            if (w.max) {
              const ratio = sx / innerWidth;
              const base = w.rect || defaultRect(w.id);
              w.max = false;
              w.custom = true;
              w.rect = { ...base, x: Math.round(sx - base.w * ratio), y: barH() };
              apply(w);
            }
            r0 = { ...w.rect };
            w.el.classList.add('is-dragging');
          }
          w.rect = clampRect({ ...r0, x: r0.x + dx, y: r0.y + dy }, w.id);
          if (!frame) frame = requestAnimationFrame(() => { frame = 0; w.el.style.left = w.rect.x + 'px'; w.el.style.top = w.rect.y + 'px'; });
        };
        const onUp = ev => {
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onUp);
          handle.removeEventListener('pointercancel', onUp);
          try { handle.releasePointerCapture(ev.pointerId); } catch {}
          if (!moved) return;
          w.el.classList.remove('is-dragging');
          w.custom = true;
          apply(w);
          if (ev.clientY <= barH() + 1 && w.el.querySelector('[data-win-action="max"]')) toggleMax(w.id);
          save();
        };
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
      });
      handle.addEventListener('dblclick', e => {
        if (e.target.closest('button,a,input,.os-tab')) return;
        if (w.el.querySelector('[data-win-action="max"]')) toggleMax(w.id);
      });
    }

    function setupResize(w, grip) {
      grip.addEventListener('pointerdown', e => {
        if (e.button !== 0 || isMobile() || w.max) return;
        e.preventDefault();
        e.stopPropagation();
        front(w.id);
        try { grip.setPointerCapture(e.pointerId); } catch {}
        const sx = e.clientX, sy = e.clientY, r0 = { ...w.rect };
        const [mw, mh] = MIN[w.id] || [320, 240];
        let frame = 0;
        w.el.classList.add('is-dragging');
        const onMove = ev => {
          const nw = Math.max(mw, Math.min(innerWidth - r0.x - 4, r0.w + ev.clientX - sx));
          const nh = Math.max(mh, Math.min(innerHeight - r0.y - 4, r0.h + ev.clientY - sy));
          w.rect = { ...r0, w: Math.round(nw), h: Math.round(nh) };
          if (!frame) frame = requestAnimationFrame(() => { frame = 0; w.el.style.width = w.rect.w + 'px'; w.el.style.height = w.rect.h + 'px'; });
        };
        const onUp = ev => {
          grip.removeEventListener('pointermove', onMove);
          grip.removeEventListener('pointerup', onUp);
          grip.removeEventListener('pointercancel', onUp);
          try { grip.releasePointerCapture(ev.pointerId); } catch {}
          w.el.classList.remove('is-dragging');
          w.custom = true;
          save();
        };
        grip.addEventListener('pointermove', onMove);
        grip.addEventListener('pointerup', onUp);
        grip.addEventListener('pointercancel', onUp);
      });
    }

    function register(el) {
      const id = el.dataset.win;
      const w = wins[id] = { id, el, open: false, max: false, rect: null, from: null, custom: false };
      if (saved[id]) { w.custom = !!(saved[id].custom && saved[id].rect); w.rect = w.custom ? saved[id].rect : null; w.max = !!saved[id].max; }
      el.setAttribute('aria-hidden', 'true');
      apply(w);
      el.addEventListener('pointerdown', () => { if (w.open) front(id); }, true);
      $$('[data-win-action]', el).forEach(b => b.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const act = b.dataset.winAction;
        if (act === 'max') return toggleMax(id);
        if (w.onClose) return w.onClose(act);
        close(id);
      }));
      const handle = $('[data-drag]', el);
      if (handle) setupDrag(w, handle);
      const grip = $('[data-resize]', el);
      if (grip) setupResize(w, grip);
      return w;
    }

    /* Posiciona uma janela num retângulo exato (usado para colocar Ficha e Guia lado a lado). */
    function place(id, rect, animate = true) {
      const w = wins[id];
      if (!w || isMobile()) return;
      const first = w.open ? w.el.getBoundingClientRect() : null;
      w.max = false;
      w.custom = true;
      w.rect = { ...rect };
      apply(w);
      save();
      if (!animate || !first || reduced()) return;
      const last = w.el.getBoundingClientRect();
      w.el.animate([
        { transformOrigin: '0 0', transform: `translate(${first.left - last.left}px,${first.top - last.top}px) scale(${first.width / last.width},${first.height / last.height})` },
        { transformOrigin: '0 0', transform: 'none' }
      ], { duration: 380, easing: 'cubic-bezier(.2,.9,.22,1)' });
    }
    const metrics = () => ({ bar: barH(), vw: innerWidth, vh: innerHeight });

    function relayout() { for (const w of Object.values(wins)) apply(w); }
    function reset() {
      store.del('principia_wins');
      for (const w of Object.values(wins)) { w.rect = null; w.max = false; w.custom = false; apply(w); }
    }
    return { wins, register, open, close, toggleMax, front, topmost, relayout, reset, place, metrics, get: id => wins[id], isOpen: id => !!wins[id]?.open };
  })();

  $$('.os-win[data-win]').forEach(el => WM.register(el));

  /* scrollIntoView pode tentar rolar contêineres com overflow oculto; a janela nunca rola. */
  for (const el of [...$$('.os-win'), $('.os-reader-body'), document.scrollingElement].filter(Boolean)) {
    el.addEventListener('scroll', () => { if (el.scrollTop || el.scrollLeft) { el.scrollTop = 0; el.scrollLeft = 0; } }, { passive: true });
  }
  document.addEventListener('scroll', () => { const s = document.scrollingElement; if (s && (s.scrollTop || s.scrollLeft)) { s.scrollTop = 0; s.scrollLeft = 0; } }, { passive: true });

  /* ==========================================================================
     Ponte com o motor do Guia
     ========================================================================== */
  const engineLink = $('#osEngineLink');
  const parseRoute = hash => {
    if (!hash || !hash.startsWith('#page:')) return null;
    const [key, ...rest] = hash.slice(6).split(':');
    return { key: pagesData()[key] ? key : 'sistema', anchor: rest.join(':') || null };
  };
  const engineKey = () => (/\bpage-([a-z0-9-]+)/.exec(content.className) || [])[1] || null;

  /* Dispara a navegação do próprio motor (o clique é tratado por app-v24.js). */
  function engineGo(key, anchor) {
    const samePage = engineKey() === key;
    engineLink.setAttribute('href', samePage && anchor ? '#' + anchor : `#page:${key}${anchor ? ':' + anchor : ''}`);
    engineLink.click();
  }

  let renderMarker = null;
  let afterRenderBusy = false;
  /* Detecta uma nova renderização de página (o motor troca todo o innerHTML). */
  function checkRender() {
    const marker = content.querySelector(':scope > .section[id],:scope > section[id]') || content.firstElementChild;
    if (!marker || marker === renderMarker) return false;
    renderMarker = marker;
    onRendered();
    return true;
  }
  let renderQueued = false;
  const queueRenderCheck = () => {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; checkRender(); });
  };
  new MutationObserver(queueRenderCheck).observe(content, { childList: true });

  function onRendered() {
    const key = engineKey();
    if (key) setActive(key);
    markZoomable();
    updateSections();
    if (WM.isOpen('reader') && !afterRenderBusy) enterContent();
  }

  function enterContent() {
    if (reduced()) return;
    content.classList.remove('os-enter');
    void content.offsetWidth;
    content.classList.add('os-enter');
    clearTimeout(enterContent.t);
    enterContent.t = setTimeout(() => content.classList.remove('os-enter'), 1400);
    setupReveal();
  }

  let revealIO = null;
  function setupReveal() {
    revealIO?.disconnect();
    revealIO = null;
    if (reduced() || !('IntersectionObserver' in window)) return;
    const sr = scroller.getBoundingClientRect();
    const limit = sr.top + scroller.clientHeight * 1.02;
    revealIO = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO?.unobserve(en.target); }
    }, { root: scroller, rootMargin: '0px 0px -8% 0px', threshold: 0 });
    for (const el of content.children) {
      if (!el.matches('.section,section,.rules-section,.paper-card') || el.hidden) continue;
      if (el.getBoundingClientRect().top > limit) { el.classList.add('os-reveal'); revealIO.observe(el); }
    }
  }

  function markZoomable() {
    const skip = '.section-banner-img,.opening-visual,.pantheon-art,.rules-banner img,.rules-page-banner img,.system-hero-media img,.guide-page-hero img,.section-visual img,summary img,a img,button img';
    for (const img of content.querySelectorAll('img')) {
      if (img.matches(skip)) continue;
      img.classList.add('os-zoomable');
    }
  }

  /* ---------- Rotas ---------- */
  let opening = false;
  let closingReader = false;
  let currentKey = null;

  function setActive(key) {
    if (!key) return;
    currentKey = key;
    $$('#osTabs .os-tab').forEach(t => {
      const on = t.dataset.tab === key;
      t.toggleAttribute('aria-current', on);
      if (on) { t.setAttribute('aria-current', 'page'); if (!isMobile()) t.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); }
    });
    $$('#osBarMenus [data-menu^="app:"]').forEach(b => b.classList.toggle('is-current', WM.isOpen('reader') && b.dataset.menu === 'app:' + key));
    $('#osSplashImg').src = APPS[key]?.art || ICON('sistema');
    $('#osSplashTitle').textContent = appTitle(key);
    updateRunning();
  }

  function updateRunning() {
    const readerOpen = WM.isOpen('reader');
    $$('.os-ico[data-app]').forEach(ic => {
      const id = ic.dataset.app;
      const a = APPS[id];
      let on = false;
      if (a?.kind === 'page') on = readerOpen && currentKey === id;
      else if (a?.kind === 'win') on = WM.isOpen(a.win);
      ic.classList.toggle('is-running', on);
    });
    $$('#osBarMenus [data-menu^="app:"]').forEach(b => b.classList.toggle('is-current', readerOpen && b.dataset.menu === 'app:' + currentKey));
  }

  function iconFor(key) {
    const sel = isMobile() ? `#osHomeGrid [data-app="${key}"],#osDock [data-app="${key}"]` : `#osIconsLeft [data-app="${key}"],#osIconsRight [data-app="${key}"]`;
    return $$(sel).find(el => el.offsetParent !== null) || null;
  }

  async function openPage(key, anchor = null, opts = {}) {
    if (!pagesData()[key]) key = 'sistema';
    closeMenus();
    closeSpot();
    const r = WM.get('reader');
    if (!r.open) {
      opening = true;
      afterRenderBusy = true;
      const needsRender = engineKey() !== key || !!anchor || !parseRoute(location.hash);
      const willRender = engineKey() !== key || !!anchor;
      setActive(key);
      if (willRender && !reduced()) reader.classList.add('is-loading');
      const anim = WM.open('reader', { from: opts.from || iconFor(key) });
      if (willRender && !reduced()) await wait(isMobile() ? 230 : 280);
      if (needsRender) {
        if (willRender) engineGo(key, anchor);
        else { history.pushState({ key, anchor: null, scrollY: scroller.scrollTop }, '', `#page:${key}`); document.title = `${appTitle(key)} · Guia da Duodécima`; }
      }
      checkRender();
      await anim;
      afterRenderBusy = false;
      if (willRender) enterContent();
      reader.classList.remove('is-loading');
      opening = false;
      updateRunning();
      if (anchor) scrollToAnchorSoon(anchor);
      return;
    }
    WM.front('reader');
    const sameKey = engineKey() === key;
    if (sameKey && !anchor) { pulseWindow(reader); return; }
    if (sameKey && anchor) { engineGo(key, anchor); return; }
    opening = true;
    afterRenderBusy = true;
    if (!reduced()) { scroller.classList.add('is-switching'); await wait(140); }
    engineGo(key, anchor);
    checkRender();
    scroller.classList.remove('is-switching');
    afterRenderBusy = false;
    enterContent();
    opening = false;
    if (anchor) scrollToAnchorSoon(anchor);
  }

  /* Garante que a âncora fique visível depois que a janela abre (o motor pode ainda estar
     aplicando o foco da divindade ou a rolagem suave). */
  function scrollToAnchorSoon(anchor) {
    const tryScroll = () => {
      const t = content.querySelector('#' + CSS.escape(anchor));
      if (!t || t.offsetParent === null) return false;
      const top = t.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      if (Math.abs(top) <= 40 || (t.matches('details') && top > 0 && top < scroller.clientHeight * .6)) return true;
      t.scrollIntoView({ block: t.matches('details') ? 'center' : 'start' });
      return true;
    };
    [140, 700, 1400].forEach(ms => setTimeout(tryScroll, ms));
  }

  function pulseWindow(el) {
    if (reduced()) return;
    el.animate([{ transform: 'none' }, { transform: 'scale(1.006)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
  }

  async function closeReader(opts = {}) {
    if (!WM.isOpen('reader') || closingReader) return;
    closingReader = true;
    if (!opts.fromRoute && parseRoute(location.hash)) history.pushState({ os: 'desktop' }, '', location.pathname + location.search);
    document.title = 'Principia · Guia da Duodécima';
    $('#sidebar')?.classList.remove('open');
    $('#scrim')?.classList.remove('show');
    await WM.close('reader', { to: iconFor(currentKey) });
    closingReader = false;
    updateRunning();
  }

  WM.get('reader').onClose = () => closeReader();
  WM.get('reader').onState = () => updateRunning();

  function onRoute() {
    const r = parseRoute(location.hash);
    if (r) {
      if (!WM.isOpen('reader') && !opening) {
        setActive(r.key);
        WM.open('reader', { from: null }).then(() => { updateRunning(); if (r.anchor) scrollToAnchorSoon(r.anchor); });
        enterContent();
      }
      closeSpot();
    } else if (WM.isOpen('reader') && !opening && !closingReader) {
      closeReader({ fromRoute: true });
    }
    queueRenderCheck();
    updateCrumb();
  }
  window.addEventListener('principia:route', () => queueMicrotask(onRoute));
  window.addEventListener('popstate', () => setTimeout(onRoute, 0));

  /* ---------- Seções, migalhas e progresso ---------- */
  const crumbSec = $('#osCrumbSection');
  const copyBtn = $('#osCopyLink');
  function currentSection() {
    const a = $('#sectionNav a.active');
    if (a) return { text: a.textContent.trim(), id: a.dataset.sectionId || '' };
    const r = parseRoute(location.hash);
    if (r?.anchor) {
      const el = content.querySelector('#' + CSS.escape(r.anchor));
      if (el) {
        const deity = el.closest('.deity-detail');
        const head = deity?.querySelector('.deity-title h2') || el.querySelector('h2,h3,summary strong');
        let name = '';
        if (head) { const c = head.cloneNode(true); c.querySelectorAll('.copy-anchor-btn').forEach(x => x.remove()); name = c.textContent; }
        if (!name) name = el.dataset.title || '';
        return { text: name.replace(/\s+/g, ' ').trim(), id: r.anchor };
      }
    }
    return { text: '', id: '' };
  }
  function updateCrumb() {
    const cur = currentSection();
    const text = cur.text;
    copyBtn.dataset.copyAnchor = cur.id;
    if (crumbSec.textContent === text) return;
    if (reduced() || !crumbSec.textContent) { crumbSec.textContent = text; return; }
    crumbSec.classList.add('is-swap');
    clearTimeout(updateCrumb.t);
    updateCrumb.t = setTimeout(() => { crumbSec.textContent = text; crumbSec.classList.remove('is-swap'); }, 160);
  }
  /* Rotula os links do painel com o título visível de cada seção. */
  function relabelSectionNav() {
    for (const a of $$('#sectionNav a[data-section-id]')) {
      if (a.dataset.osLabel === a.dataset.sectionId) continue;
      const sec = content.querySelector('#' + CSS.escape(a.dataset.sectionId));
      const label = sec ? headingOf(sec) : '';
      a.dataset.osLabel = a.dataset.sectionId;
      if (label && label !== a.textContent.trim()) { a.title = a.textContent.trim(); a.textContent = label; }
    }
  }
  /* Capítulos do painel "Nesta página": agrupam as seções longas sem mudar a ordem nem os links.
     A chave é o id da primeira seção de cada capítulo. */
  const NAV_CHAPTERS = {
    sistema: { poderes: 'Personagem', criacao: 'Mecânicas', hierarquia: 'Roma', familiares: 'Outros sistemas' },
    combate: { rolagens: 'Rolagens e turno', furtividade: 'Situações de combate', condicoes: 'Estados e morte' },
    magia: { introducao: 'Fundamentos', circulos: 'Círculos e conjuração', rituais: 'Práticas arcanas', 'alta-magia': 'Limites' },
    roma: { 'situacao-atual-roma': 'Agora', 'casa-lobo': 'Trajetória', 'mapa-acampamento': 'O Acampamento', estrangeiros: 'Além de Roma', liderancas: 'Roma hoje', 'juramentos-orcus': 'Religio' }
  };
  function groupSectionNav() {
    const nav = $('#sectionNav');
    const map = NAV_CHAPTERS[engineKey()];
    const links = $$('#sectionNav a[data-section-id]');
    const stamp = engineKey() + ':' + links.length;
    const wanted = !!map && links.length >= 6;
    if (nav.dataset.osGroups === stamp && (!wanted || nav.querySelector('.os-secnav-group'))) return;
    nav.querySelectorAll('.os-secnav-group').forEach(g => g.remove());
    nav.dataset.osGroups = stamp;
    if (!wanted) return;
    for (const a of links) {
      const label = map[a.dataset.sectionId];
      if (!label) continue;
      const g = document.createElement('div');
      g.className = 'os-secnav-group';
      g.setAttribute('role', 'presentation');
      g.textContent = label;
      a.before(g);
    }
  }
  new MutationObserver(() => { relabelSectionNav(); groupSectionNav(); updateCrumb(); }).observe($('#sectionNav'), { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

  function updateSections() {
    const n = $$('#sectionNav a[data-section-id]').length;
    $('#osSideCount').textContent = n ? String(n) : '';
    $('#osSbSections').textContent = n ? `${n} ${n === 1 ? 'seção' : 'seções'}` : '';
  }

  /* Segurança: ao parar de rolar, nada que já passou pela tela fica escondido. */
  let revealSweepT = 0;
  function revealSweep() {
    const bottom = scroller.getBoundingClientRect().bottom;
    for (const el of content.querySelectorAll(':scope > .os-reveal:not(.is-in)')) {
      if (el.getBoundingClientRect().top < bottom) { el.classList.add('is-in'); revealIO?.unobserve(el); }
    }
  }
  let progFrame = 0;
  scroller.addEventListener('scroll', () => {
    clearTimeout(revealSweepT);
    revealSweepT = setTimeout(revealSweep, 260);
    if (progFrame) return;
    progFrame = requestAnimationFrame(() => {
      progFrame = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0;
      reader.style.setProperty('--progress', p.toFixed(4));
      $('#osSbProgress').textContent = `${Math.round(p * 100)}% lido`;
    });
  }, { passive: true });

  /* Espelha o selo do Core na barra de status da janela. */
  const coreStatus = $('#coreStatus');
  const sbCore = $('#osSbCore');
  function mirrorCore() {
    sbCore.className = coreStatus.className;
    sbCore.innerHTML = coreStatus.innerHTML;
  }
  new MutationObserver(mirrorCore).observe(coreStatus, { childList: true, subtree: true, attributes: true });
  mirrorCore();

  /* ---------- Visualizador de imagens ---------- */
  const viewerBody = $('#osViewerBody');
  const viewerImg = $('#osViewerImg');
  content.addEventListener('click', e => {
    const img = e.target.closest('img.os-zoomable');
    if (!img || e.defaultPrevented) return;
    e.preventDefault();
    viewerImg.src = img.currentSrc || img.src;
    viewerImg.alt = img.alt || '';
    $('#osViewerTitle').textContent = img.alt || 'Imagem';
    viewerBody.classList.remove('is-actual');
    viewerBody.scrollTo(0, 0);
    WM.open('viewer', { from: img });
  });
  viewerBody.addEventListener('click', e => {
    if (e.target !== viewerImg) return;
    const actual = viewerBody.classList.toggle('is-actual');
    if (actual) {
      const r = viewerImg.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      requestAnimationFrame(() => viewerBody.scrollTo({ left: viewerImg.offsetWidth * fx - viewerBody.clientWidth / 2, top: viewerImg.offsetHeight * fy - viewerBody.clientHeight / 2 }));
    }
  });

  /* ==========================================================================
     Busca (Spotlight) — usa o índice e os resultados do próprio motor
     ========================================================================== */
  const spotSuggest = $('#osSpotSuggest');
  let spotReturnFocus = null;
  function openSpot() {
    closeMenus();
    if (!spot.classList.contains('is-open')) {
      spotReturnFocus = document.activeElement;
      spot.classList.add('is-open');
      spot.setAttribute('aria-hidden', 'false');
    }
    spotSuggest.hidden = searchInput.value.trim().length >= 2;
    searchInput.focus({ preventScroll: true });
    searchInput.select();
  }
  function closeSpot() {
    if (!spot.classList.contains('is-open')) return;
    spot.classList.remove('is-open');
    spot.setAttribute('aria-hidden', 'true');
    if (searchInput.value) { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); }
    searchInput.blur();
    if (spotReturnFocus?.isConnected && !WM.isOpen('reader')) spotReturnFocus.focus?.({ preventScroll: true });
    spotReturnFocus = null;
  }
  spot.addEventListener('pointerdown', e => { if (e.target === spot) closeSpot(); });
  searchInput.addEventListener('focus', () => { if (!spot.classList.contains('is-open')) openSpot(); });
  searchInput.addEventListener('input', () => { spotSuggest.hidden = searchInput.value.trim().length >= 2; });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSpot(); return; }
    if (e.key === 'Enter') {
      const results = $('#searchResults');
      if (!results.hidden && !results.querySelector('.search-result.is-active')) results.querySelector('.search-result')?.click();
    }
  });

  /* ==========================================================================
     Menus da barra superior
     ========================================================================== */
  let openMenu = null;
  function menuItems(name) {
    if (name === 'principia') {
      return `
        <button class="os-dd-item" type="button" role="menuitem" data-app="sobre">${svg('info')}Sobre este terminal</button>
        <button class="os-dd-item" type="button" role="menuitem" data-app="prefs">${svg('gear')}Preferências…</button>
        <button class="os-dd-item" type="button" role="menuitem" data-app="leiame">${svg('note')}Leia-me</button>
        <button class="os-dd-item" type="button" role="menuitem" data-app="tabularium">${svg('folder')}Tabularium</button>
        <button class="os-dd-item" type="button" role="menuitem" data-app="minhaficha"><img src="${APPS.minhaficha.art}" alt="">Minha Ficha<em>teste</em></button>
        <button class="os-dd-item" type="button" role="menuitem" data-app="musica">${svg('music')}Música</button>
        <a class="os-dd-item" role="menuitem" href="${IMESSAGE_URL}" target="_blank" rel="noopener noreferrer">${svg('phone')}iMessage<em>Discord</em></a>
        <div class="os-dd-sep" role="separator"></div>
        <button class="os-dd-item" type="button" role="menuitem" data-action="desktop">${svg('desktop')}Mostrar área de trabalho</button>
        <button class="os-dd-item" type="button" role="menuitem" data-action="reboot">${svg('power')}Reiniciar terminal</button>
        <div class="os-dd-sep" role="separator"></div>
        <a class="os-dd-item" role="menuitem" href="${FICHA_URL}" target="_blank" rel="noopener noreferrer">${svg('ext')}Ficha Oficial<em>nova aba</em></a>`;
    }
    if (name === 'clock') {
      const d = new Date();
      const full = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return `<div class="os-dd-cal"><small>CALENDÁRIO ROMANO</small><b>${esc(romanDate(d))} ${roman(d.getFullYear())}</b><p>${esc(full)}<br>ano ${roman(d.getFullYear() + 753)} ab urbe condita</p></div>`;
    }
    if (name === 'all') {
      return `<div class="os-dd-label">Arquivos do Guia</div>` +
        PAGES.map(k => `<button class="os-dd-item" type="button" role="menuitem" data-app="${k}"><img src="${APPS[k].art}" alt="">${esc(appTitle(k))}<em>${findFolder(k)?.count ?? ''}</em></button>`).join('') +
        `<div class="os-dd-sep" role="separator"></div>
         <button class="os-dd-item" type="button" role="menuitem" data-app="tabularium">${svg('folder')}Tabularium<em>todas as seções</em></button>
         <button class="os-dd-item" type="button" role="menuitem" data-app="mapa"><img src="${APPS.mapa.art}" alt="">Mapas</button>`;
    }
    if (name.startsWith('app:')) {
      const key = name.slice(4);
      const f = findFolder(key);
      const label = { sistema: 'ARCHIVVM · SISTEMA', crafting: 'ARS · PRODUÇÃO', roma: 'ROMA · LORE', domus: 'ROMA · MEMORIAE', magia: 'ARS ARCANA', deuses: 'PANTHEON · ROMA', combate: 'ARCHIVVM' }[key] || 'ARCHIVVM';
      let out = `<div class="os-dd-head"><img src="${APPS[key].art}" alt=""><div><small>${esc(label)}</small><b>${esc(appTitle(key))}</b></div></div>
        <button class="os-dd-item os-dd-item--primary" type="button" role="menuitem" data-app="${key}">${svg('open')}Abrir ${esc(appTitle(key))}</button>
        <div class="os-dd-sep" role="separator"></div>`;
      if (!f) return out;
      if (f.files.length) {
        out += `<div class="os-dd-label">Seções</div>` + f.files.map((s, i) => `<button class="os-dd-item" type="button" role="menuitem" data-go="${key}|${esc(s.id)}"><i>${roman(i + 1)}</i>${esc(s.title)}</button>`).join('');
      }
      for (const g of f.groups) {
        out += `<div class="os-dd-label">${esc(g.title)}</div>`;
        if (!g.virtual) out += `<button class="os-dd-item" type="button" role="menuitem" data-go="${key}|${esc(g.id)}"><i>·</i>Visão geral</button>`;
        out += g.files.map(s => `<button class="os-dd-item" type="button" role="menuitem" data-go="${key}|${esc(s.id)}"><i>·</i>${esc(s.title)}</button>`).join('');
      }
      return out;
    }
    return '';
  }

  function showMenu(trigger, focusFirst = false) {
    const name = trigger.dataset.menu;
    if (openMenu) openMenu.trigger.setAttribute('aria-expanded', 'false');
    dropdown.innerHTML = menuItems(name);
    dropdown.hidden = false;
    dropdown.setAttribute('aria-label', trigger.textContent.trim() || 'Menu');
    dropdown.scrollTop = 0;
    const r = trigger.getBoundingClientRect();
    dropdown.style.top = Math.round(r.bottom + 6) + 'px';
    const w = dropdown.offsetWidth;
    const alignRight = name === 'clock';
    let left = alignRight ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, innerWidth - w - 8));
    dropdown.style.left = left + 'px';
    dropdown.style.transformOrigin = alignRight ? 'top right' : 'top left';
    dropdown.style.animation = 'none';
    void dropdown.offsetWidth;
    dropdown.style.animation = '';
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = { name, trigger };
    if (focusFirst) dropdown.querySelector('.os-dd-item')?.focus();
  }
  function closeMenus(restoreFocus = false) {
    if (!openMenu) return;
    openMenu.trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) openMenu.trigger.focus();
    openMenu = null;
    dropdown.hidden = true;
  }
  const bar = $('#osBar');
  bar.addEventListener('click', e => {
    const t = e.target.closest('[data-menu]');
    if (!t) return;
    e.preventDefault();
    if (openMenu?.trigger === t) closeMenus();
    else showMenu(t, e.detail === 0);
  });
  bar.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-menu]');
    if (t && openMenu && openMenu.trigger !== t && e.pointerType === 'mouse' && t.dataset.menu !== 'clock' && openMenu.name !== 'clock') showMenu(t);
  });
  document.addEventListener('pointerdown', e => {
    if (openMenu && !e.target.closest('.os-dropdown,[data-menu]')) closeMenus();
  }, true);
  dropdown.addEventListener('keydown', e => {
    const items = $$('.os-dd-item', dropdown);
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeMenus(true); }
    else if (e.key === 'Tab') closeMenus();
  });

  /* ==========================================================================
     Tabularium (explorador de arquivos)
     ========================================================================== */
  const TAB = { path: [], filter: '' };
  const tree = $('#osTree');
  const files = $('#osFiles');
  const filesPath = $('#osFilesPath');
  const filter = $('#osFilter');
  const fileHTML = (key, id, title, sub) => `<button class="os-file" type="button" role="listitem" data-go="${key}|${esc(id)}"><span class="os-doc"><i></i></span><span>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</span></button>`;
  const folderHTML = (path, title, count) => `<button class="os-file" type="button" role="listitem" data-tpath="${esc(path)}"><span class="os-folder"></span><span>${esc(title)}<small>${count} ${count === 1 ? 'item' : 'itens'}</small></span></button>`;
  function renderTabularium() {
    const data = getArchive();
    const total = data.reduce((n, f) => n + f.count, 0);
    const [k0, k1] = TAB.path;
    tree.innerHTML = `<button type="button" data-tpath="" aria-current="${!k0}">${svg('folder')}Todos<em>${total}</em></button>` +
      data.map(f => `<button type="button" data-tpath="${f.key}" aria-current="${k0 === f.key && !k1}"><img src="${APPS[f.key].art}" alt="">${esc(f.title)}<em>${f.count}</em></button>` +
        (f.key === k0 && f.groups.length ? f.groups.map(g => `<button class="os-tree-sub" type="button" data-tpath="${f.key}/${g.id}" aria-current="${k1 === g.id}">${esc(g.title)}<em>${g.files.length}</em></button>`).join('') : '')).join('');
    const q = norm(TAB.filter);
    let items = '';
    let crumbs = `<b>Tabularium</b>`;
    if (q) {
      const hits = [];
      for (const f of data) {
        for (const s of f.files) if (norm(s.title).includes(q)) hits.push(fileHTML(f.key, s.id, s.title, f.title));
        for (const g of f.groups) {
          if (!g.virtual && norm(g.title).includes(q)) hits.push(fileHTML(f.key, g.id, g.title, f.title));
          for (const s of g.files) if (norm(s.title).includes(q)) hits.push(fileHTML(f.key, s.id, s.title, `${f.title} · ${g.title}`));
        }
      }
      items = hits.join('') || `<div class="os-files-empty">Nenhum arquivo com “${esc(TAB.filter)}”.</div>`;
      crumbs += ` / busca`;
    } else if (!k0) {
      items = data.map(f => folderHTML(f.key, f.title, f.count)).join('');
    } else {
      const f = data.find(x => x.key === k0);
      if (f) {
        crumbs += ` / ${esc(f.title)}`;
        if (k1) {
          const g = f.groups.find(x => x.id === k1);
          if (g) {
            crumbs += ` / ${esc(g.title)}`;
            items = (g.virtual ? '' : fileHTML(f.key, g.id, `${g.title} — visão geral`)) + g.files.map(s => fileHTML(f.key, s.id, s.title)).join('');
          }
        } else {
          items = f.files.map(s => fileHTML(f.key, s.id, s.title)).join('') + f.groups.map(g => folderHTML(`${f.key}/${g.id}`, g.title, g.files.length)).join('');
        }
      }
    }
    filesPath.innerHTML = crumbs;
    files.innerHTML = items;
  }
  tree.addEventListener('click', e => {
    const b = e.target.closest('[data-tpath]');
    if (!b) return;
    TAB.path = b.dataset.tpath ? b.dataset.tpath.split('/') : [];
    TAB.filter = '';
    filter.value = '';
    renderTabularium();
  });
  files.addEventListener('click', e => {
    const b = e.target.closest('[data-tpath]');
    if (!b) return;
    TAB.path = b.dataset.tpath.split('/');
    renderTabularium();
    files.querySelector('.os-file')?.focus({ preventScroll: true });
  });
  filter.addEventListener('input', () => { TAB.filter = filter.value; renderTabularium(); });

  /* ==========================================================================
     Sobre e Preferências
     ========================================================================== */
  function renderAbout() {
    const st = window.DUODECIMA_CORE_STATE || {};
    const core = st.status === 'online' ? `CORE ${st.version || ''}` : st.status === 'fallback' ? `SNAPSHOT ${st.version || 'LOCAL'}` : 'sincronizando…';
    const data = getArchive();
    const sections = data.reduce((n, f) => n + f.count, 0);
    const rows = [
      ['Interface', 'Principia 1.0 · prévia'],
      ['Guia', 'v2.8.2'],
      ['Regras', core.trim()],
      ['Arquivos', String(data.length)],
      ['Seções', sections.toLocaleString('pt-BR')],
      ['Registros de busca', (window.GUIA_SEARCH || []).length.toLocaleString('pt-BR')],
      ['Tema', html.dataset.theme === 'light' ? 'Dia' : 'Noite']
    ];
    $('#osAboutList').innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  }
  function syncPrefs() {
    const theme = html.dataset.theme === 'light' ? 'light' : 'dark';
    $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    const wall = html.dataset.wall || 'spqr';
    $$('[data-wall-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.wallSet === wall)));
    $('#osPrefMotion').checked = reduced();
    $('#osPrefBoot').checked = store.get('principia_boot', 'on') !== 'off';
  }
  $('[data-win="prefs"]').addEventListener('click', e => {
    const t = e.target.closest('[data-theme-set]');
    if (t) { if ((html.dataset.theme === 'light' ? 'light' : 'dark') !== t.dataset.themeSet) $('#themeToggle').click(); syncPrefs(); return; }
    const w = e.target.closest('[data-wall-set]');
    if (w) {
      const v = w.dataset.wallSet;
      if (v === 'spqr') { delete html.dataset.wall; store.del('principia_wall'); }
      else { html.dataset.wall = v; store.set('principia_wall', v); }
      syncPrefs();
    }
  });
  $('#osPrefMotion').addEventListener('change', e => {
    if (e.target.checked) { html.dataset.motion = 'reduce'; store.set('principia_motion', 'reduce'); }
    else { delete html.dataset.motion; store.set('principia_motion', 'full'); }
  });
  $('#osPrefBoot').addEventListener('change', e => store.set('principia_boot', e.target.checked ? 'on' : 'off'));
  new MutationObserver(() => { syncPrefs(); if (WM.isOpen('sobre')) renderAbout(); }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  async function openUtil(win, from) {
    if (win === 'tabularium') renderTabularium();
    if (win === 'sobre') renderAbout();
    if (win === 'prefs') syncPrefs();
    if (win === 'leiame') store.set('principia_seen', '1');
    if (win === 'musica') { renderMusic(); const it = currentTrack(); if (it) playerFor(it); }
    try { P.hooks?.[win]?.open?.(); } catch (err) { console.warn('[Principia]', err); }
    await WM.open(win, { from });
    updateRunning();
    if (win === 'musica' && !music.items.length && !isMobile()) musicEls.url.focus({ preventScroll: true });
  }
  /* Ficha e Guia lado a lado (desktop). No celular, as duas ficam em tela cheia e alternam. */
  const canTile = () => !isMobile() && innerWidth >= 1000;
  async function tileFichaGuia(key, anchor) {
    if (!canTile()) {
      // Celular/tela estreita: as duas janelas ocupam a tela inteira e alternam.
      if (key) return openPage(key, anchor || null);
      return openUtil('ficha', null);
    }
    const { bar, vw, vh } = WM.metrics();
    const g = 10, top = bar + g, h = vh - bar - g * 2;
    const left = Math.round(Math.min(600, Math.max(380, vw * .38)));
    WM.place('ficha', { x: g, y: top, w: left, h });
    WM.place('reader', { x: left + g * 2, y: top, w: vw - left - g * 3, h });
    const tasks = [];
    if (!WM.isOpen('ficha')) tasks.push(openUtil('ficha', null));
    if (!WM.isOpen('reader')) tasks.push(openPage(key || engineKey() || 'sistema', anchor || null));
    else if (key) tasks.push(openPage(key, anchor || null));
    await Promise.all(tasks);
  }
  /* Abre uma regra do Guia a partir da ficha, sem esconder a ficha no desktop. */
  function openBesideFicha(key, anchor) {
    if (!canTile()) return openPage(key, anchor);
    const r = WM.get('reader'), f = WM.get('ficha');
    const overlap = r.open && f.open && (() => {
      const a = r.el.getBoundingClientRect(), b = f.el.getBoundingClientRect();
      return a.left < b.right - 40 && b.left < a.right - 40;
    })();
    if (!r.open || overlap) return tileFichaGuia(key, anchor);
    return openPage(key, anchor);
  }

  for (const id of ['tabularium', 'leiame', 'prefs', 'sobre', 'viewer', 'musica', 'ficha']) {
    const w = WM.get(id);
    if (!w) continue;
    w.onState = () => updateRunning();
  }

  /* ==========================================================================
     Música — player oficial do Spotify
     A janela pode ser fechada ou minimizada sem parar a música: o player continua
     carregado (apenas oculto) enquanto a página estiver aberta.
     ========================================================================== */
  const MUSIC_KEY = 'principia_music';
  const MUSIC_TYPES = { playlist: 'Playlist', album: 'Álbum', track: 'Música', artist: 'Artista', episode: 'Episódio', show: 'Podcast' };
  const SPOTIFY_RE = /(?:open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?|spotify:)(playlist|album|track|artist|episode|show)[/:]([A-Za-z0-9]{22})/i;
  const musicEls = {
    form: $('#osMusicForm'), url: $('#osMusicUrl'), label: $('#osMusicLabel'), msg: $('#osMusicMsg'),
    list: $('#osMusicList'), player: $('#osMusicPlayer'), host: $('#osMusicEmbed'),
    np: $('#osNp'), npLabel: $('#osNpLabel'), npToggle: $('#osNpToggle'), npPreview: $('#osNpPreview'),
    preview: $('#osMusicPreview'), openApp: $('#osMusicOpenApp')
  };
  const music = { items: [], current: null, controller: null, frame: null, pending: null, apiPromise: null, playing: false, loadedUri: null, wanted: null, preview: false };
  /* Prévias do Spotify duram 30 s. Faixas reais tão curtas são raras, então uma duração
     de até 31 s é tratada como prévia, e qualquer faixa mais longa desfaz o aviso. */
  const PREVIEW_MAX_MS = 31000;
  const trackKey = it => `${it.type}:${it.sid}`;
  const trackUri = it => `spotify:${it.type}:${it.sid}`;
  const trackLabel = it => it.label || MUSIC_TYPES[it.type] || 'Spotify';
  const currentTrack = () => music.items.find(it => trackKey(it) === music.current) || null;
  try {
    const saved = JSON.parse(store.get(MUSIC_KEY, 'null'));
    if (saved && Array.isArray(saved.items)) {
      music.items = saved.items
        .filter(it => it && MUSIC_TYPES[it.type] && /^[A-Za-z0-9]{22}$/.test(it.sid))
        .slice(0, 40)
        .map(it => ({ type: it.type, sid: it.sid, label: String(it.label || '').slice(0, 60) }));
      music.current = music.items.some(it => trackKey(it) === saved.current) ? saved.current : null;
    }
  } catch {}
  const saveMusic = () => store.set(MUSIC_KEY, JSON.stringify({ items: music.items, current: music.current }));

  function parseSpotify(text) {
    const s = String(text || '').trim();
    if (!s) return { error: 'Cole o link de uma playlist, álbum ou música do Spotify.' };
    if (/spotify\.link\//i.test(s)) return { error: 'Esse é um link curto (spotify.link). Abra-o no navegador e copie o endereço completo, que começa com open.spotify.com.' };
    const m = SPOTIFY_RE.exec(s);
    if (!m) return { error: 'Não reconheci esse link. No Spotify, use Compartilhar → Copiar link (open.spotify.com/…).' };
    return { type: m[1].toLowerCase(), sid: m[2] };
  }

  function setPlaying(on) {
    music.playing = !!on;
    html.dataset.music = music.current ? (on ? 'playing' : 'paused') : 'off';
    const label = on ? (music.preview ? 'Pausar (prévia de 30 s)' : 'Pausar') : 'Tocar no player do Spotify';
    musicEls.npToggle.setAttribute('aria-label', label);
    musicEls.npToggle.title = label;
  }

  /* Nunca apresenta prévia como reprodução completa: selo na barra e explicação na janela. */
  function setPreview(on) {
    on = !!on && !!currentTrack();
    if (music.preview === on) return;
    music.preview = on;
    musicEls.npPreview.hidden = !on;
    musicEls.preview.hidden = !on;
    setPlaying(music.playing);
  }
  function onPlaybackUpdate(e) {
    const d = (e && e.data) || {};
    setPlaying(!d.isPaused);
    const it = currentTrack();
    if (it && it.type !== 'episode' && it.type !== 'show' && d.duration > 0) setPreview(d.duration <= PREVIEW_MAX_MS);
  }

  function loadSpotifyApi() {
    if (music.apiPromise) return music.apiPromise;
    music.apiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('tempo esgotado')), 9000);
      const previous = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = api => {
        clearTimeout(timer);
        resolve(api);
        if (typeof previous === 'function') { try { previous(api); } catch {} }
      };
      const s = document.createElement('script');
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      s.onerror = () => { clearTimeout(timer); reject(new Error('falha ao carregar')); };
      document.head.append(s);
    });
    return music.apiPromise;
  }

  /* Sem a API (bloqueada por extensão, por exemplo), usa o embed simples do Spotify. */
  function mountFallbackFrame(it) {
    const f = document.createElement('iframe');
    f.title = 'Player do Spotify';
    f.width = '100%';
    f.height = '352';
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    f.src = `https://open.spotify.com/embed/${it.type}/${it.sid}?utm_source=generator&theme=0`;
    f.dataset.uri = trackUri(it);
    musicEls.host.replaceChildren(f);
    music.frame = f;
  }

  /* O player é criado uma única vez; depois só troca o que está carregado.
     O play é sempre do próprio player do Spotify: o play disparado por código pode
     cair no modo de prévia mesmo para quem está conectado. */
  async function playerFor(it) {
    if (!it) return;
    musicEls.player.hidden = false;
    musicEls.openApp.href = `https://open.spotify.com/${it.type}/${it.sid}`;
    music.wanted = { it };
    if (music.controller) {
      const uri = trackUri(it);
      if (music.loadedUri !== uri) { music.controller.loadUri(uri); music.loadedUri = uri; setPreview(false); }
      return;
    }
    if (music.frame) {
      if (music.frame.dataset.uri !== trackUri(it)) mountFallbackFrame(it);
      return;
    }
    if (music.pending) return music.pending;
    music.pending = (async () => {
      try {
        const api = await loadSpotifyApi();
        const el = document.createElement('div');
        musicEls.host.replaceChildren(el);
        const first = music.wanted.it;
        await new Promise(resolve => {
          api.createController(el, { uri: trackUri(first), width: '100%', height: 352 }, ctrl => {
            music.controller = ctrl;
            music.loadedUri = trackUri(first);
            ctrl.addListener('playback_update', onPlaybackUpdate);
            ctrl.addListener('ready', () => resolve());
            setTimeout(resolve, 5000);
          });
        });
        const want = music.wanted;
        if (want && trackUri(want.it) !== music.loadedUri) { music.controller.loadUri(trackUri(want.it)); music.loadedUri = trackUri(want.it); }
      } catch (err) {
        console.warn('[Principia] API do Spotify indisponível; usando o player simples.', err);
        mountFallbackFrame(music.wanted.it);
      } finally {
        music.pending = null;
      }
    })();
    return music.pending;
  }

  function renderMusic() {
    const cur = music.current;
    musicEls.list.innerHTML = music.items.length
      ? `<h4>Salvas neste navegador</h4>` + music.items.map(it => {
        const k = trackKey(it);
        const name = trackLabel(it);
        return `<div class="os-track${k === cur ? ' is-current' : ''}" role="listitem">
          <button class="os-track-main" type="button" data-music-play="${esc(k)}" aria-label="Tocar ${esc(name)}">
            <span class="os-track-disc" aria-hidden="true"></span>
            <span class="os-track-text"><b>${esc(name)}</b><small>${esc(MUSIC_TYPES[it.type])}${k === cur ? ' · selecionada' : ''}</small></span>
          </button>
          <a class="os-track-btn" href="https://open.spotify.com/${it.type}/${it.sid}" target="_blank" rel="noopener noreferrer" title="Abrir no Spotify" aria-label="Abrir ${esc(name)} no Spotify">${svg('ext')}</a>
          <button class="os-track-btn" type="button" data-music-del="${esc(k)}" title="Remover" aria-label="Remover ${esc(name)}">${svg('close')}</button>
        </div>`;
      }).join('')
      : `<p class="os-music-empty">Nenhuma playlist salva ainda. Cole acima o link da playlist do seu personagem para ouvir enquanto navega pelo Guia.</p>`;
    updateNowPlaying();
  }

  function updateNowPlaying() {
    const it = currentTrack();
    musicEls.np.hidden = !it;
    if (it) {
      musicEls.npLabel.textContent = trackLabel(it);
      musicEls.openApp.href = `https://open.spotify.com/${it.type}/${it.sid}`;
    } else {
      musicEls.player.hidden = true;
      setPreview(false);
    }
    setPlaying(it ? music.playing : false);
  }

  musicEls.form.addEventListener('submit', e => {
    e.preventDefault();
    const parsed = parseSpotify(musicEls.url.value);
    const msg = musicEls.msg;
    if (parsed.error) {
      msg.textContent = parsed.error;
      msg.classList.add('is-error');
      musicEls.url.focus();
      return;
    }
    const label = musicEls.label.value.trim().slice(0, 60);
    const k = trackKey(parsed);
    const existing = music.items.find(it => trackKey(it) === k);
    if (existing) { if (label) existing.label = label; }
    else music.items.unshift({ type: parsed.type, sid: parsed.sid, label });
    music.items = music.items.slice(0, 40);
    music.current = k;
    saveMusic();
    musicEls.form.reset();
    msg.classList.remove('is-error');
    msg.textContent = existing ? 'Esse link já estava salvo; carreguei de novo no player.' : 'Salvo neste navegador. Aperte o play no player do Spotify abaixo.';
    renderMusic();
    playerFor(currentTrack());
  });

  musicEls.list.addEventListener('click', e => {
    const play = e.target.closest('[data-music-play]');
    if (play) {
      music.current = play.dataset.musicPlay;
      saveMusic();
      renderMusic();
      playerFor(currentTrack());
      musicEls.msg.classList.remove('is-error');
      musicEls.msg.textContent = 'Carregada no player. Aperte o play do Spotify para ouvir.';
      return;
    }
    const del = e.target.closest('[data-music-del]');
    if (del) {
      const k = del.dataset.musicDel;
      music.items = music.items.filter(it => trackKey(it) !== k);
      if (music.current === k) {
        music.current = null;
        try { music.controller?.pause(); } catch {}
        if (music.frame) { music.frame.remove(); music.frame = null; }
        music.playing = false;
      }
      saveMusic();
      renderMusic();
    }
  });

  musicEls.npToggle.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();
    const it = currentTrack();
    if (!it) return;
    /* Pausar pela barra é seguro; para tocar, a pessoa usa o play do próprio player. */
    if (music.controller && music.playing) { try { music.controller.pause(); } catch {} return; }
    openUtil('musica', null);
    await playerFor(it);
    musicEls.msg.classList.remove('is-error');
    musicEls.msg.textContent = 'Aperte o play no player do Spotify para continuar.';
  });

  /* Toca um link do Spotify vindo de outro app (ex.: a playlist salva na ficha). */
  function playSpotify(link, label) {
    const parsed = parseSpotify(link);
    if (parsed.error) return { error: parsed.error };
    const k = trackKey(parsed);
    let it = music.items.find(x => trackKey(x) === k);
    if (!it) { it = { type: parsed.type, sid: parsed.sid, label: String(label || '').slice(0, 60) }; music.items.unshift(it); music.items = music.items.slice(0, 40); }
    else if (label && !it.label) it.label = String(label).slice(0, 60);
    music.current = k;
    saveMusic();
    renderMusic();
    openUtil('musica', null);
    playerFor(it);
    musicEls.msg.classList.remove('is-error');
    musicEls.msg.textContent = 'Carregada no player. Aperte o play do Spotify para ouvir.';
    return { ok: true, label: trackLabel(it) };
  }

  /* Aviso rápido no canto da tela (mesmo visual das notificações do Guia). */
  function toast(message) {
    let el = $('.os-toast');
    if (!el) { el = document.createElement('div'); el.className = 'guide-toast os-toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  updateNowPlaying();

  /* ==========================================================================
     Cliques globais (fase de captura, antes do motor)
     ========================================================================== */
  function launch(id, el) {
    const a = APPS[id];
    if (!a) return;
    if (el?.classList.contains('os-ico')) {
      el.classList.remove('is-launching');
      void el.offsetWidth;
      el.classList.add('is-launching');
      setTimeout(() => el.classList.remove('is-launching'), 700);
    }
    closeMenus();
    if (id !== 'buscar') closeSpot();
    if (a.kind === 'page') return openPage(id, null, { from: el?.classList.contains('os-ico') ? el : iconFor(id) });
    if (a.kind === 'route') {
      const ok = findFolder(a.route[0])?.files.some(f => f.id === a.route[1]);
      return openPage(a.route[0], ok ? a.route[1] : null, { from: el });
    }
    if (a.kind === 'win') return openUtil(a.win, el?.classList.contains('os-ico') ? el : null);
    if (a.kind === 'action' && a.action === 'search') return openSpot();
  }

  window.addEventListener('click', e => {
    if (e.defaultPrevented || e.button > 0) return;
    const t = e.target;
    if (!(t instanceof Element) || t.closest('[data-os-engine]')) return;

    const appEl = t.closest('[data-app]');
    if (appEl) {
      if (APPS[appEl.dataset.app]?.kind === 'external') {
        if (appEl.classList.contains('os-ico')) { appEl.classList.remove('is-launching'); void appEl.offsetWidth; appEl.classList.add('is-launching'); }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      launch(appEl.dataset.app, appEl);
      return;
    }
    const go = t.closest('[data-go]');
    if (go) {
      e.preventDefault();
      e.stopPropagation();
      const [key, anchor] = go.dataset.go.split('|');
      const from = go.classList.contains('os-file') ? go : null;
      closeMenus();
      openPage(key, anchor || null, { from });
      return;
    }
    const act = t.closest('[data-action]');
    if (act) {
      const action = act.dataset.action;
      e.preventDefault();
      e.stopPropagation();
      closeMenus();
      if (action === 'search') openSpot();
      else if (action === 'close-search') closeSpot();
      else if (action === 'home') closeReader();
      else if (action === 'back') history.back();
      else if (action === 'forward') history.forward();
      else if (action === 'desktop') { for (const w of Object.values(WM.wins)) if (w.open && w.id !== 'reader') WM.close(w.id); closeReader(); }
      else if (action === 'reboot') reboot();
      else if (action === 'reset-windows') WM.reset();
      else if (action === 'ficha-beside') tileFichaGuia();
      else if (action === 'to-guia') openPage(engineKey() || 'sistema');
      return;
    }
    const skip = t.closest('.skip-link');
    if (skip) {
      e.preventDefault();
      e.stopPropagation();
      if (!WM.isOpen('reader')) openPage(engineKey() || 'sistema');
      setTimeout(() => content.focus({ preventScroll: true }), 400);
      return;
    }
    const link = t.closest('a[href^="#page:"]');
    if (link && !link.closest('.os-dropdown')) {
      e.preventDefault();
      e.stopPropagation();
      const [key, ...rest] = link.getAttribute('href').slice(6).split(':');
      openPage(key, rest.join(':') || null);
    }
  }, true);

  /* ---------- Teclado ---------- */
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'k') { openSpot(); return; }
    const typing = e.target.closest?.('input,textarea,select,[contenteditable="true"]');
    if (!typing && k === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); openSpot(); return; }
    if (e.key === 'Escape') {
      if (openMenu) { closeMenus(true); return; }
      if (spot.classList.contains('is-open')) { closeSpot(); return; }
      if ($('#sidebar').classList.contains('open')) { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); return; }
      const top = WM.topmost();
      if (top && top.id !== 'reader' && !typing) WM.close(top.id);
    }
  }, true);

  /* ---------- Relógio e data ---------- */
  function tick() {
    const d = new Date();
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const clock = $('#osClock');
    clock.textContent = hm;
    clock.title = `${romanDate(d)} ${roman(d.getFullYear())} · ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    clock.setAttribute('aria-label', `${hm}. ${clock.title}`);
    const wd = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#osHomeDate').innerHTML = `${esc(wd.charAt(0).toUpperCase() + wd.slice(1))} · <b>${esc(romanDate(d))}</b>`;
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- Papel de parede com paralaxe ---------- */
  const wallArt = $('#osWallArt');
  let pFrame = 0, px = 0, py = 0;
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || reduced() || isMobile()) return;
    px = (e.clientX / innerWidth - .5) * -16;
    py = (e.clientY / innerHeight - .5) * -11;
    if (!pFrame) pFrame = requestAnimationFrame(() => { pFrame = 0; wallArt.style.setProperty('--px', px.toFixed(1) + 'px'); wallArt.style.setProperty('--py', py.toFixed(1) + 'px'); });
  }, { passive: true });

  /* ---------- Relâmpago ---------- */
  function flash(x = 50, y = 30) {
    if (reduced()) return;
    const f = $('#osFlash');
    f.style.setProperty('--fx', x + '%');
    f.style.setProperty('--fy', y + '%');
    f.classList.remove('is-on');
    void f.offsetWidth;
    f.classList.add('is-on');
  }

  /* ---------- Redimensionamento ---------- */
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { WM.relayout(); closeMenus(); }, 120); });
  mqMobile.addEventListener?.('change', () => { WM.relayout(); updateRunning(); });

  /* ---------- Atualizações do Core e camadas ---------- */
  Promise.allSettled([
    window.DUODECIMA_CORE_READY,
    window.DUODECIMA_GUIDE_STABILIZATION_READY,
    window.DUODECIMA_GUIDE_RULES_READY,
    window.DUODECIMA_GUIDE_TALENTS_READY
  ]).then(() => {
    invalidateArchive();
    if (WM.isOpen('tabularium')) renderTabularium();
    if (WM.isOpen('sobre')) renderAbout();
  });

  /* ==========================================================================
     Inicialização
     ========================================================================== */
  const bootEl = $('#osBoot');
  const waitOrSkip = (ms, skipped) => new Promise(resolve => {
    if (skipped()) return resolve();
    const end = performance.now() + Math.max(0, ms);
    const iv = setInterval(() => { if (skipped() || performance.now() >= end) { clearInterval(iv); resolve(); } }, 40);
  });

  async function runBoot(mode) {
    if (!bootEl || mode === 'none') return;
    let skip = false;
    const skipped = () => skip;
    const onSkip = () => { skip = true; };
    bootEl.addEventListener('pointerdown', onSkip);
    window.addEventListener('keydown', onSkip, { once: true });
    const log = $('#osBootLog');
    const barEl = $('#osBootBar');
    const status = $('#osBootStatus');
    const setBar = v => barEl.style.setProperty('--boot', String(v));
    const line = (label, value, warn = false) => {
      const p = document.createElement('p');
      p.innerHTML = `&gt; ${esc(label)} <i>${'.'.repeat(Math.max(3, 30 - label.length))}</i> <em class="${warn ? 'is-warn' : ''}">${esc(value)}</em>`;
      log.append(p);
      while (log.children.length > 7) log.firstElementChild.remove();
    };
    const since = () => performance.now() - (P.bootStartedAt || 0);
    setBar(.38);
    if (mode === 'full' && !reduced()) {
      await waitOrSkip(1500 - since(), skipped);
      line('abrindo arquivos do guia', `${Object.keys(pagesData()).length} arquivos`);
      setBar(.56);
      status.textContent = 'sincronizando com o duodécima core…';
      await waitOrSkip(300, skipped);
      await Promise.race([Promise.resolve(window.DUODECIMA_CORE_READY).catch(() => null), waitOrSkip(2400, skipped)]);
      const st = window.DUODECIMA_CORE_STATE || {};
      if (st.status === 'online') line('duodécima core', `core ${st.version || 'online'}`);
      else if (st.status === 'fallback') line('duodécima core', 'snapshot local', true);
      else line('duodécima core', 'em segundo plano', true);
      setBar(.8);
      await waitOrSkip(300, skipped);
      line('índice de busca', `${(window.GUIA_SEARCH || []).length.toLocaleString('pt-BR')} registros`);
      status.textContent = 'montando a área de trabalho…';
      await waitOrSkip(300, skipped);
      line('área de trabalho', 'pronta');
      setBar(1);
      await waitOrSkip(450, skipped);
    } else {
      setBar(1);
      status.textContent = 'pronto';
      await waitOrSkip(520 - since(), skipped);
    }
    bootEl.removeEventListener('pointerdown', onSkip);
    window.removeEventListener('keydown', onSkip);
  }

  function endBoot() {
    session.set('principia_booted', '1');
    if (bootEl) {
      bootEl.classList.add('is-done');
      setTimeout(() => { bootEl.hidden = true; }, 620);
    }
    flash(50, 38);
    desktop.classList.add('is-ready');
  }

  async function reboot() {
    for (const w of Object.values(WM.wins)) if (w.open && w.id !== 'reader') WM.close(w.id);
    await closeReader();
    if (!bootEl) return;
    desktop.classList.remove('is-ready');
    html.dataset.boot = store.get('principia_boot', 'on') === 'off' ? 'short' : 'full';
    $$('p', $('#osBootLog')).slice(4).forEach(p => p.remove());
    $('#osBootBar').style.setProperty('--boot', '.08');
    $('#osBootStatus').textContent = 'abrindo os arquivos do guia…';
    bootEl.classList.remove('is-done');
    // Sair de display:none reinicia todas as animações CSS da sequência.
    bootEl.hidden = false;
    P.bootStartedAt = performance.now();
    await runBoot(html.dataset.boot);
    endBoot();
  }

  /* Páginas registradas só depois do Core (ex.: Combate, criada por guide-rules-v26.js):
     o motor não as reconhece na primeira leitura do link e cai no Sistema. Quando a página
     passa a existir, e se a pessoa ainda não navegou, a Principia abre o destino original. */
  async function resumeLatePage(initial) {
    const h = P.initialHash || '';
    if (!h.startsWith('#page:')) return;
    const [rawKey, ...rest] = h.slice(6).split(':');
    const rawAnchor = rest.join(':') || null;
    if (!rawKey || rawKey === initial.key) return;
    await Promise.allSettled([window.DUODECIMA_CORE_READY, window.DUODECIMA_GUIDE_RULES_READY]);
    await wait(60);
    if (!pagesData()[rawKey]) return;
    const stillOnFallback = engineKey() === initial.key && (location.hash || '').startsWith('#page:' + initial.key);
    if (!stillOnFallback) return;
    engineGo(rawKey, rawAnchor);
    if (rawAnchor) scrollToAnchorSoon(rawAnchor);
  }

  async function init() {
    renderShell();
    const initial = parseRoute(P.initialHash);
    // Sem rota na URL, o terminal abre na área de trabalho (o motor já renderizou em segundo plano).
    if (!initial && parseRoute(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
    if (!initial) document.title = 'Principia · Guia da Duodécima';
    const key = engineKey();
    if (key) setActive(key);
    checkRender();
    updateCrumb();
    syncPrefs();
    await runBoot(html.dataset.boot);
    endBoot();
    if (initial) {
      await wait(reduced() ? 0 : 260);
      setActive(engineKey() || initial.key);
      await WM.open('reader', { from: iconFor(initial.key) });
      updateRunning();
      enterContent();
      if (initial.anchor) scrollToAnchorSoon(initial.anchor);
      resumeLatePage(initial);
      return;
    }
    if (!store.get('principia_seen') && !isMobile() && innerWidth >= 1100) {
      await wait(700);
      if (!WM.isOpen('reader')) openUtil('leiame', null);
    }
  }

  init().catch(err => {
    console.error('[Principia] Falha na inicialização da interface.', err);
    if (bootEl) bootEl.hidden = true;
    desktop.classList.add('is-ready');
  });

  P.open = openPage;
  P.WM = WM;
  P.hooks = P.hooks || {};
  /* Interface usada por outros apps da Principia (ex.: principia-ficha.js). */
  P.api = {
    esc, svg, norm, store, WM, isMobile, reduced, toast,
    openPage, openUtil, openBeside: openBesideFicha, tile: tileFichaGuia, canTile,
    engineKey: () => engineKey(),
    deitySlugs: () => findFolder('deuses')?.coreSlugs || new Map(),
    music: { play: playSpotify, parse: parseSpotify }
  };
  window.dispatchEvent(new CustomEvent('principia:ready'));
})();
