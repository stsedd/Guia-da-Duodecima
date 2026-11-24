/* Guia da Duodécima · estrutura em 11 abas (só na principia.html)
   O motor do Guia continua montando as páginas antigas (Sistema, Sobre Roma etc.) com o Core
   e todas as camadas. Esta camada lê essas páginas prontas e monta as abas novas a partir das
   MESMAS seções, aplicando só as correções aprovadas pela Staff. O index.html não carrega este
   arquivo, e nenhuma página antiga é apagada: Sistema e Sobre Roma ficam como fonte oculta.

   Carregada depois das camadas de conteúdo e ANTES do app-v24.js, para que o motor já encontre
   as abas novas na primeira leitura do link. A versão final é montada de novo quando o Core e
   as camadas terminam (PRINCIPIA_ESTRUTURA_READY). */
(function () {
  'use strict';
  const G = window.GUIA_CONTENT = window.GUIA_CONTENT || {};
  const P = window.PRINCIPIA = window.PRINCIPIA || {};

  /* ---------- As 11 abas, na ordem em que aparecem ---------- */
  const TABS = [
    { key: 'personagem', title: 'Character Archive', short: 'Archive' },
    { key: 'combate', title: 'Combate' },
    { key: 'cursus', title: 'Cursus Honorum', short: 'Cursus' },
    { key: 'crafting', title: 'Crafting' },
    { key: 'familiares', title: 'Familiares' },
    { key: 'magia', title: 'Magia' },
    { key: 'deuses', title: 'Deuses e Devoção', short: 'Deuses' },
    { key: 'casa-do-lobo', title: 'A Casa do Lobo', short: 'Casa do Lobo' },
    { key: 'roma-hoje', title: 'Roma' },
    { key: 'extras', title: 'Infos Extras e Mecânicas', short: 'Extras' },
    { key: 'domus', title: 'Domus Memoriae', short: 'Domus' }
  ];
  const ORDER = TABS.map(t => t.key);

  /* Páginas antigas que continuam existindo só como fonte (não aparecem na navegação). */
  const HIDDEN = ['sistema', 'roma'];
  /* Para onde vai um link antigo sem âncora conhecida. */
  const PAGE_FALLBACK = { sistema: 'personagem', roma: 'casa-do-lobo' };

  /* ---------- De onde vem cada seção ----------
     'fonte#id'  → uma seção da página antiga;
     'fonte@*'   → todas as seções da página antiga (na ordem dela);
     'fonte@deus-*' → as seções cujo id começa com "deus-";
     { lead } / { build } → blocos montados aqui. */
  const PLAN = {
    personagem: [{ lead: 'personagem' }, 'sistema#poderes', 'sistema#legados', 'sistema#reclamacao', 'sistema#criacao', 'sistema#recursos', 'sistema#descanso', 'sistema#pericias', 'sistema#prof', 'sistema#treinos', 'sistema#talentos', 'roma#estrangeiros', 'sistema#boas-praticas'],
    combate: [{ lead: 'combate' }, 'combate@*'],
    cursus: [{ lead: 'cursus' }, 'sistema#hierarquia', 'sistema#economia'],
    crafting: [{ lead: 'crafting' }, 'crafting@*'],
    familiares: [{ lead: 'familiares' }, 'sistema#familiares'],
    magia: [{ lead: 'magia' }, 'magia@*'],
    deuses: [{ lead: 'deuses' }, 'deuses#panteoes', 'sistema#afinidade', 'roma#devocao-divina', 'deuses#triunviros', 'deuses#dii-consentis', 'deuses#dii-inferi', 'deuses#alati', 'deuses#ventis', 'deuses#numina', 'deuses@deus-*'],
    'casa-do-lobo': [{ lead: 'casa-do-lobo' }, 'roma#casa-lobo', 'roma#chegada', 'roma#mapa-acampamento', 'roma#acampamento', { build: 'praetoria' }],
    'roma-hoje': [{ lead: 'roma-hoje' }, { build: 'trama' }, 'roma#regras-acampamento', 'roma#liderancas', 'roma#coortes', 'roma#nova-roma', 'roma#domus-memoriae'],
    extras: [{ lead: 'extras' }, 'roma#tempo-duodecima', 'roma#bolsa-decimus', 'roma#nazzano-atualizacao', 'roma#memorial-retorno', 'roma#juramentos-orcus', 'roma#panteoes', 'roma#influencia'],
    domus: ['domus#domus-memoriae', 'domus@rebento-*', 'sistema#rebentos']
  };

  /* Páginas antigas que esta camada reescreve: guardamos a versão do motor antes de escrever. */
  const OWNED = ['combate', 'crafting', 'magia', 'deuses', 'domus'];
  const ORIG = {};
  const WROTE = {};
  function sourceHTML(key) {
    const live = G[key]?.html || '';
    if (!OWNED.includes(key)) return live;
    if (WROTE[key] !== undefined && live === WROTE[key]) return ORIG[key] || '';
    ORIG[key] = live;
    return live;
  }

  /* ---------- Utilidades ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function frag(html) { const t = document.createElement('template'); t.innerHTML = html || ''; return t.content; }
  const isSection = el => el.matches?.('section[id]');
  const topSections = f => [...f.children].filter(isSection);
  function leadOf(f) { const out = []; for (const el of f.children) { if (isSection(el)) break; out.push(el); } return out; }
  function html(nodes) { const d = document.createElement('div'); nodes.forEach(n => d.append(n)); return d.innerHTML; }
  function replaceText(root, re, to) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, to); re.lastIndex = 0; }
  }
  const NUM = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
  const numero = (n, fem = false) => {
    let w = NUM[n] || String(n);
    if (fem) w = w.replace(/^um$/, 'uma').replace(/^dois$/, 'duas');
    return w;
  };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- Onde cada seção antiga foi parar ---------- */
  const LOC = {};
  function buildLoc() {
    for (const k of Object.keys(LOC)) delete LOC[k];
    for (const page of ORDER) {
      for (const item of PLAN[page]) {
        if (typeof item !== 'string') continue;
        const [src, rest] = item.includes('#') ? item.split('#') : item.split('@');
        if (item.includes('#')) { LOC[src + ':' + rest] = page; continue; }
        const f = frag(sourceHTML(src));
        const prefix = rest === '*' ? '' : rest.replace(/\*$/, '');
        topSections(f).forEach(s => { if (s.id.startsWith(prefix)) LOC[src + ':' + s.id] = page; });
      }
    }
    LOC['roma:situacao-atual-roma'] = 'roma-hoje';
    LOC['roma:inicio'] = 'casa-do-lobo';
  }
  /* Rota antiga → rota nova. Rotas que já existem passam direto. */
  function route(key, anchor) {
    if (!key) return { key, anchor };
    if (anchor && LOC[key + ':' + anchor]) return { key: LOC[key + ':' + anchor], anchor };
    if (HIDDEN.includes(key)) return { key: PAGE_FALLBACK[key], anchor: null };
    return { key, anchor };
  }
  function routeHash(hash) {
    if (!hash || !hash.startsWith('#page:')) return hash;
    const [key, ...rest] = hash.slice(6).split(':');
    const r = route(key, rest.join(':') || null);
    return `#page:${r.key}${r.anchor ? ':' + r.anchor : ''}`;
  }

  /* ---------- Aberturas das abas ---------- */
  const OPENINGS = {
    personagem: () => `
<div class="about-opening pg-opening"><span>ARCHIVVM · PERSONAGEM</span><h1>Character Archive.</h1><p>Tudo o que é preciso para criar um personagem e fazê-lo funcionar: poderes, origem, atributos, status, perícias, treinamento, talentos e as regras de mesa.</p></div>
<aside class="sheet-cta-hero"><div><span>FICHA OFICIAL DA DUODÉCIMA</span><h2>Crie sua ficha aqui</h2><p>Monte seu personagem e acompanhe nível, prole, atributos, recursos, talentos, equipamentos e poderes em uma ficha integrada ao mesmo sistema do Guia.</p></div><a href="https://stsedd.github.io/ficha-oficial-duodecima-rpg/" target="_blank" rel="noopener noreferrer">ABRIR CRIADOR <b>↗</b></a></aside>
<div class="jump-grid">
<a href="#poderes"><span>01</span><strong>Quem é seu personagem?</strong><small>Poderes, legado e reclamação.</small></a>
<a href="#criacao"><span>02</span><strong>Como ele funciona?</strong><small>Atributos, status, descanso, perícias e talentos.</small></a>
<a href="#page:combate"><span>03</span><strong>Como ele luta?</strong><small>Combate geral, condições e morte &amp; vida.</small></a>
<a href="#page:cursus"><span>04</span><strong>Como Roma funciona?</strong><small>Hierarquia, fama, economia e trabalhos.</small></a>
</div>`,
    cursus: () => `<div class="about-opening pg-opening"><span>CURSUS HONORUM · ROMA</span><h1>Cursus Honorum.</h1><p>A carreira dentro de Roma: a hierarquia da Legião e da Religio, a fama, os cargos de honra, os salários, a economia e os trabalhos.</p></div>`,
    familiares: () => `<div class="about-opening pg-opening"><span>VINCVLA · FAMILIARES</span><h1>Familiares.</h1><p>Companheiros, montarias e vínculos lendários: categorias, fichas, formas de obtenção e limites em missão.</p></div>`,
    'roma-hoje': () => `<div class="about-opening pg-opening"><span>SPQR · HODIE</span><h1>Roma.</h1><p>Como Roma está agora: a trama em andamento, as regras do Acampamento, quem lidera a Legião, as coortes e a vida em Nova Roma.</p></div>`,
    extras: () => `<div class="about-opening pg-opening"><span>MISCELLANEA</span><h1>Infos Extras e Mecânicas.</h1><p>A passagem do tempo, a Bolsa Décimus, a memória do retorno à Itália, os juramentos a Orcus e a presença dos outros panteões.</p></div>`
  };

  /* ---------- A Trama (resposta da Staff: só a Helix Vitae está em vigor) ---------- */
  const TRAMA = `<section class="section searchable" id="situacao-atual-roma" data-title="A Trama situação atual Helix Vitae">
<div class="section-head"><div><small>ROMA · A TRAMA</small><h2>A Trama</h2></div><span>NVNC</span></div>
<div class="duo-plot-introduction"><p>A investigação em andamento em Roma é a da <strong>Helix Vitae</strong>. Novos fios entram aqui conforme forem revelados em jogo.</p></div>
<div class="duo-plot-overview">
<article class="duo-story"><small>01 · O ATAQUE</small><h3>Criaturas na chegada de Lupa</h3>
<p>Durante uma das chegadas de Lupa até o Acampamento Júpiter, criaturas estranhas atacaram os guardas. Ataques durante essas chegadas não são exatamente incomuns, mas dessa vez havia alguma coisa diferente. Os legionários atingidos relataram se sentir <strong>desconectados de seus parentes divinos</strong>, sem conseguir utilizar normalmente tanto habilidades passivas quanto poderes ativos.</p>
<p>A cauda de uma das criaturas foi recuperada e entregue à Principia para estudos. Com as pesquisas, foi descoberto que esses animais produzem uma substância capaz de <strong>neutralizar temporariamente capacidades divinas</strong>, afastando ou inibindo as virtudes de um semideus.</p></article>
<article class="duo-story"><small>02 · A DROGA</small><h3>Veias esverdeadas</h3>
<p>O problema é que essa substância aparentemente também está sendo utilizada como droga. Quando consumida repetidamente, os efeitos parecem se tornar progressivamente mais fortes. Ainda não se sabe exatamente o que o uso prolongado provoca, mas já foi observado um sinal bastante evidente: quanto maior o consumo, <strong>mais esverdeadas ficam as veias do usuário</strong>.</p></article>
<article class="duo-story"><small>03 · A EMPRESA</small><h3>Helix Vitae</h3>
<p>Foi nesse contexto que surgiu o nome <strong>Helix Vitae</strong>. A empresa aparentemente comercializa versões muito mais aprimoradas e profissionalmente produzidas dessa substância. Ainda não se sabe de onde surgiu, por que está produzindo as drogas ou qual é o verdadeiro objetivo por trás delas, mas até agora todas as pessoas identificadas diretamente com sua venda ou circulação possuíam algum tipo de ligação divina, mesmo quando não romana.</p>
<p>Iulietta Caesari conseguiu se infiltrar na empresa em São Francisco, chegando inclusive a se tornar cliente VIP e obter contato com pessoas importantes dentro dela. Oficialmente, a Helix Vitae se apresenta através de produtos voltados principalmente para meninas ricas; por trás disso, porém, existem drogas mágicas extremamente fortes sendo distribuídas.</p></article>
<article class="duo-story"><small>04 · OUTROS CAÇADORES</small><h3>“Para criar um antídoto, é necessário o veneno”</h3>
<p>Durante as investigações, também foram encontrados um semideus grego e um egípcio caçando as mesmas criaturas responsáveis pela substância. Os dois afirmaram que “para criar um antídoto, é necessário o veneno” e carregavam consigo um maço de cigarros de aparência roxa e purpurizada.</p>
<p>A presença do egípcio também chamou atenção porque, até recentemente, Roma praticamente não possuía contato com esse grupo, e aparentemente nem gregos, nórdicos ou celtas sabiam muito sobre eles.</p></article>
<article class="duo-story"><small>05 · A FEITICEIRA</small><h3>A magia por trás da inibição</h3>
<p>Por fim, Blume, então pretora, conseguiu confirmar através de análise mágica que existe <strong>uma feiticeira por trás da criação do efeito de inibição</strong>. Ainda não se sabe quem ela é, quando essa magia foi criada, quais materiais são necessários ou qual sua relação com a Helix Vitae. O que já existe, porém, é conhecimento suficiente sobre o funcionamento da magia para <strong>neutralizar temporariamente os efeitos da droga</strong>.</p>
<p>Por enquanto, a Helix Vitae, a substância e as criaturas que a produzem continuam sendo tratadas como uma investigação separada. Existem coincidências estranhas com outras formas de corrupção encontradas recentemente, mas ainda não há evidência suficiente para dizer que façam parte da mesma ameaça.</p></article>
</div>
</section>`;

  /* Subtítulos dos quadros da Domus (resposta da Staff). */
  const DOMUS_TITLES = {
    'rebento-jasmine-blume': 'THE CONQUEROR & THE SAVIOR',
    'rebento-cerise-cassius': 'DOOM & DESIRE',
    'rebento-celeste-caelus': 'BLOOD & STRENGTH',
    'rebento-cyrus': 'SHADOW TOUCHED'
  };

  /* ---------- Montagem ---------- */
  /* Uma seção e o que vem solto logo depois dela (algumas camadas antigas inserem blocos entre
     seções, como o atalho para o Crafting e a travessia de Nazzano): os dois mudam juntos. */
  function withTrailing(el, src) {
    const out = [];
    const c = el.cloneNode(true); c.dataset.pgSrc = src; out.push(c);
    for (let n = el.nextElementSibling; n && !isSection(n); n = n.nextElementSibling) {
      const t = n.cloneNode(true); t.dataset.pgSrc = src; out.push(t);
    }
    return out;
  }
  function pick(cache, src, id) {
    cache[src] = cache[src] || frag(sourceHTML(src));
    const el = topSections(cache[src]).find(s => s.id === id);
    return el ? withTrailing(el, src) : [];
  }
  function pickAll(cache, src, prefix) {
    cache[src] = cache[src] || frag(sourceHTML(src));
    return topSections(cache[src]).filter(s => s.id.startsWith(prefix)).flatMap(s => withTrailing(s, src));
  }
  function leadNodes(cache, src) {
    cache[src] = cache[src] || frag(sourceHTML(src));
    return leadOf(cache[src]).map(n => { const c = n.cloneNode(true); if (c.nodeType === 1) c.dataset.pgSrc = src; return c; });
  }

  function buildPraetoria(cache) {
    const lid = pick(cache, 'roma', 'liderancas')[0];
    const group = lid?.querySelector('.oct26-current-leadership:not(.oct26-other-figures)');
    if (!group) return null;
    const sec = document.createElement('section');
    sec.className = 'section searchable';
    sec.id = 'praetoria';
    sec.dataset.title = 'Praetoria pretores atuais triunvirato';
    sec.dataset.pgSrc = 'roma';
    const grid = group.querySelector('.oct26-figure-grid');
    sec.innerHTML = `<div class="section-head"><div><small>ROMA · COMANDO</small><h2>Praetoria</h2></div><span>PRAETORES</span></div>
<article class="paper-card feature"><h3>Quem conduz Roma agora</h3><p>O Acampamento Júpiter é governado hoje por um triunvirato. É com a Praetoria que os recém-chegados se apresentam formalmente na Principia.</p></article>`;
    if (grid) sec.append(grid.cloneNode(true));
    const more = document.createElement('p');
    more.className = 'pg-more';
    more.innerHTML = '<a class="duo-domus-link" href="#page:roma-hoje:liderancas">Ver todas as figuras importantes →</a>';
    sec.append(more);
    return sec;
  }

  function compose(page, cache) {
    const out = document.createDocumentFragment();
    for (const item of PLAN[page]) {
      if (typeof item === 'object' && item.lead) {
        const own = OPENINGS[item.lead];
        if (own) { out.append(frag(own())); continue; }
        if (page === 'casa-do-lobo') { leadNodes(cache, 'roma').forEach(n => out.append(n)); continue; }
        leadNodes(cache, item.lead).forEach(n => out.append(n));
        continue;
      }
      if (typeof item === 'object' && item.build === 'praetoria') { const s = buildPraetoria(cache); if (s) out.append(s); continue; }
      if (typeof item === 'object' && item.build === 'trama') { out.append(frag(TRAMA)); continue; }
      if (item.includes('#')) { const [src, id] = item.split('#'); pick(cache, src, id).forEach(s => out.append(s)); continue; }
      const [src, rest] = item.split('@');
      pickAll(cache, src, rest === '*' ? '' : rest.replace(/\*$/, '')).forEach(s => out.append(s));
    }
    const root = document.createElement('div');
    root.className = 'page-' + page;
    root.append(out);
    FIX[page]?.(root);
    fixAll(root, page);
    return root.innerHTML;
  }

  /* ---------- Correções aprovadas (respostas da Staff, 24/11/2026) ---------- */
  const FIX = {
    personagem(root) {
      const est = root.querySelector('#estrangeiros');
      if (est) {
        // Celtas liberados, com −15 de Fama inicial.
        est.querySelectorAll('.pantheon-status article').forEach(a => {
          if (!/celtas/i.test(a.querySelector('h3')?.textContent || '')) return;
          a.classList.remove('locked');
          const tag = a.querySelector('span'); if (tag) tag.textContent = 'DISPONÍVEL';
          const p = a.querySelector('p'); if (p) p.textContent = 'Entram pelo sistema estrangeiro e começam com −15 de Fama.';
        });
        est.querySelector('.core-celtic-foreigner')?.remove();
        const more = document.createElement('p');
        more.className = 'pg-more';
        more.innerHTML = '<a class="duo-domus-link" href="#page:casa-do-lobo">Conheça mais sobre Roma →</a>';
        est.append(more);
      }
      // A chamada dos estrangeiros agora aponta para esta mesma aba.
      root.querySelectorAll('a.foreign-cta[href*="estrangeiros"]').forEach(a => a.setAttribute('href', '#estrangeiros'));
      replaceText(root, /Conferir estrangeiros em Roma/g, 'Conferir estrangeiros');
    },
    cursus(root) {
      root.querySelectorAll('.fame-track article').forEach(a => {
        const name = a.querySelector('h3')?.textContent || '';
        const p = a.querySelector('p');
        if (!p) return;
        if (/odiado/i.test(name)) p.textContent = 'Fama negativa. Gregos, celtas e filhos de Netuno continuam Odiados, mesmo com Fama positiva, até chegarem a Conhecido (25 de Fama).';
        if (/conhecido/i.test(name)) replaceText(p, /Iuppiter, Bellona e Marte Ultor recebem 15 de Fama e o título ao serem reclamados\./, 'Filhos de Iuppiter, Bellona e Marte Ultor recebem 15 de Fama e o título de Conhecido automaticamente ao serem reclamados.');
      });
    },
    'casa-do-lobo'(root) {
      const open = root.querySelector('.about-opening');
      if (open) {
        open.classList.add('pg-opening');
        const h1 = open.querySelector('h1'); if (h1) h1.textContent = 'A Casa do Lobo.';
        const p = open.querySelector('p'); if (p) p.textContent = 'De onde os semideuses romanos vêm e como chegam ao Acampamento Júpiter: a Casa do Lobo, o caminho até Nazzano, a travessia do Pequeno Tibre e o primeiro contato com a Principia.';
      }
      // O parágrafo "Organização atual em Nazzano" aparecia duas vezes; fica só o de Nazzano nos dois mundos.
      root.querySelectorAll('#acampamento > *').forEach(el => { if (!el.matches('.section-head,.banner-strip') && /^Organização atual em Nazzano/.test(el.textContent.trim())) el.remove(); });
      replaceText(root, /encontram formalmente as Pretoras/g, 'encontram formalmente a Praetoria');
    },
    'roma-hoje'(root) {
      replaceText(root, /e Pretoras não precisam/g, 'e Pretores não precisam');
      const lid = root.querySelector('#liderancas');
      const others = lid?.querySelector('.oct26-other-figures');
      if (others) {
        const blume = [...others.querySelectorAll('.leader-card')].find(c => /Blume Becker/i.test(c.querySelector('h3')?.textContent || ''));
        const title = others.querySelector('.oct26-group-title');
        if (title) title.textContent = 'Religio';
        if (blume) {
          const group = document.createElement('div');
          group.className = 'oct26-current-leadership oct26-past-praetoria';
          group.innerHTML = '<h3 class="oct26-group-title">Antiga Praetoria</h3><div class="oct26-figure-grid"></div>';
          group.querySelector('.oct26-figure-grid').append(blume);
          others.before(group);
        }
      }
    },
    extras(root) {
      replaceText(root, /Na trama celta, Morcan Glass, o Rei Submerso, está aparentemente morto\. Não há confirmação definitiva de sua morte\./g, 'Na trama celta, Morcan Glass, o Rei Submerso, morreu. O desfecho desse arco ainda será contado aqui.');
    },
    domus(root) {
      const cards = [...root.querySelectorAll('section[id^="rebento-"]')];
      cards.forEach(sec => {
        const t = DOMUS_TITLES[sec.id];
        const small = sec.querySelector('.domus-rebento-heading small');
        if (t && small) small.textContent = small.textContent.replace(/·\s*[^·]+$/, '· ' + t);
      });
      const people = root.querySelectorAll('section[id^="rebento-"] .domus-biography').length;
      const strong = root.querySelector('.domus-intro-aside strong');
      if (strong && cards.length) strong.textContent = `${cap(numero(cards.length))} ${cards.length === 1 ? 'quadro' : 'quadros'}, ${numero(people, true)} ${people === 1 ? 'trajetória' : 'trajetórias'}.`;
      // As regras de Rebento vêm depois dos quadros.
      const reb = root.querySelector('#rebentos');
      if (reb) replaceText(reb, /SISTEMA · REBENTOS/g, 'DOMUS · REBENTOS');
    }
  };

  /* Correções que valem para todas as abas. */
  function fixAll(root, page) {
    // Dificuldade: o Guia passa a usar só DT.
    replaceText(root, /\bCD\b/g, 'DT');
    // Praetoria atual: triunvirato; Blume é ex-pretora.
    replaceText(root, /esposa da Pretora Blume/g, 'esposa da ex-pretora Blume');
    rewriteLinks(root, page);
  }

  function rewriteLinks(root, page) {
    const here = new Set([...root.querySelectorAll('[id]')].map(e => e.id));
    root.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (href.startsWith('#page:')) {
        const [k, ...rest] = href.slice(6).split(':');
        const r = route(k, rest.join(':') || null);
        if (r.key === page && r.anchor && here.has(r.anchor)) a.setAttribute('href', '#' + r.anchor);
        else a.setAttribute('href', `#page:${r.key}${r.anchor ? ':' + r.anchor : ''}`);
        return;
      }
      const id = href.slice(1);
      if (!id || here.has(id)) return;
      const src = a.closest('[data-pg-src]')?.dataset.pgSrc;
      const target = src && LOC[src + ':' + id];
      if (target) a.setAttribute('href', `#page:${target}:${id}`);
    });
  }

  /* ---------- Busca: o índice passa a usar as abas novas ---------- */
  function visibleTitle(el) {
    const h = el.querySelector(':scope > .section-head h2, :scope > header h2, :scope > .deity-title h2, h2, h1');
    if (!h) return el.dataset?.title || el.id;
    const c = h.cloneNode(true);
    c.querySelectorAll('.copy-anchor-btn,.section-rule').forEach(x => x.remove());
    return c.textContent.replace(/\s+/g, ' ').trim() || el.dataset?.title || el.id;
  }
  const textOf = el => el.textContent.replace(/\s+/g, ' ').trim();
  function buildSearch() {
    const prev = Array.isArray(window.GUIA_SEARCH) ? window.GUIA_SEARCH : [];
    const kits = prev.filter(x => x && x.page === 'deuses' && (x.deity || /^deus-/.test(x.anchor || '')));
    const out = [];
    for (const page of ORDER) {
      if (!G[page]?.html) continue;
      const f = frag(G[page].html);
      for (const sec of topSections(f)) {
        if (page === 'deuses' && sec.id.startsWith('deus-')) continue;
        out.push({ page, anchor: sec.id, deity: null, title: visibleTitle(sec), text: textOf(sec).slice(0, 8000) });
        sec.querySelectorAll('details[id], article[id], div[id]').forEach(el => {
          const t = el.querySelector('summary, h3, h4, strong');
          if (!t) return;
          out.push({ page, anchor: el.id, deity: null, title: t.textContent.replace(/\s+/g, ' ').trim(), text: textOf(el).slice(0, 4000) });
        });
      }
    }
    // Kits e habilidades continuam com os registros do Core (já apontam para a aba Deuses).
    return out.concat(kits.map(x => Object.assign({}, x, { text: String(x.text || '').replace(/\bCD\b/g, 'DT') })));
  }

  /* ---------- Ciclo ---------- */
  function run(final) {
    buildLoc();
    const cache = {};
    const meta = Object.fromEntries(TABS.map(t => [t.key, t]));
    const written = {};
    for (const page of ORDER) {
      // Páginas que dependem do Core (Combate) só entram quando existem.
      const needs = PLAN[page].filter(i => typeof i === 'string').map(i => i.split(/[#@]/)[0]);
      if (needs.some(src => !G[src]?.html)) continue;
      if (!final && OWNED.includes(page)) continue; // as páginas do motor só são reescritas na versão final
      written[page] = compose(page, cache);
    }
    for (const [page, out] of Object.entries(written)) {
      if (!G[page]) G[page] = { title: meta[page].title, html: out };
      G[page].title = meta[page].title;
      G[page].html = out;
      if (OWNED.includes(page)) WROTE[page] = out;
    }
    if (final) window.GUIA_SEARCH = buildSearch();
    return Object.keys(written);
  }

  /* Links antigos (Discord, favoritos) passam a abrir a aba nova. */
  function redirectLocation() {
    const h = location.hash || '';
    const n = routeHash(h);
    if (n && n !== h) history.replaceState(history.state, '', location.pathname + location.search + n);
    if (P.initialHash) P.initialHash = routeHash(P.initialHash);
  }

  // Primeira montagem, com o conteúdo local, antes do motor abrir a página.
  try { run(false); redirectLocation(); } catch (err) { console.error('[Guia] Falha ao montar as abas.', err); }

  // Cliques em links antigos que ainda existam (fichas, Tabularium, textos de outras camadas).
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href^="#page:"]');
    if (!a) return;
    const h = a.getAttribute('href');
    const n = routeHash(h);
    if (n !== h) a.setAttribute('href', n);
  }, true);
  window.addEventListener('hashchange', () => {
    const h = location.hash || '';
    const n = routeHash(h);
    if (n !== h) { history.replaceState(history.state, '', location.pathname + location.search + n); window.dispatchEvent(new PopStateEvent('popstate', { state: history.state })); }
  });

  const settle = ms => new Promise(r => setTimeout(r, ms));
  let lastSig = '';
  const signature = () => ['sistema', 'roma', ...OWNED].map(k => k + ':' + (G[k]?.html || '').length).join('|');
  async function finalize() {
    // Este arquivo carrega antes do Core e das camadas: as promessas delas só existem depois
    // que todos os scripts da página rodaram.
    if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    await Promise.allSettled([
      window.DUODECIMA_CORE_READY,
      window.DUODECIMA_LINEAGE_GUIDE_READY,
      window.DUODECIMA_LINEAGE_LABEL_FIX_READY,
      window.DUODECIMA_GUIDE_STABILIZATION_READY,
      window.DUODECIMA_GUIDE_RULES_READY,
      window.DUODECIMA_GUIDE_TALENTS_READY
    ]);
    await settle(80); // deixa as camadas de Nazzano e editorial gravarem suas correções
    run(true);
    lastSig = signature();
    window.dispatchEvent(new CustomEvent('principia:estrutura'));
    window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    // Rede de segurança: se alguma camada ainda alterar as fontes depois disso, remonta.
    await settle(2200);
    if (signature() !== lastSig) {
      run(true);
      lastSig = signature();
      window.dispatchEvent(new CustomEvent('principia:estrutura'));
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    }
    return { ok: true };
  }

  // `sources` guarda as páginas do motor antes da reescrita (usado na conferência de conteúdo).
  window.PRINCIPIA_ESTRUTURA = { tabs: TABS, order: ORDER, hidden: HIDDEN, route, routeHash, sources: ORIG };
  window.PRINCIPIA_ESTRUTURA_READY = finalize().catch(err => { console.error('[Guia] Falha ao finalizar as abas.', err); return { ok: false }; });
})();
