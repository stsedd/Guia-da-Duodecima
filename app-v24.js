
(()=>{
  const pages=window.GUIA_CONTENT||{};
  const searchIndex=window.GUIA_SEARCH||[];
  const content=document.querySelector('#content');
  const title=document.querySelector('#pageTitle');
  const eyebrow=document.querySelector('#pageEyebrow');
  const sectionNav=document.querySelector('#sectionNav');
  const search=document.querySelector('#globalSearch');
  const results=document.querySelector('#searchResults');
  const sidebar=document.querySelector('#sidebar');
  const scrim=document.querySelector('#scrim');
  const sidebarCollapse=document.querySelector('#sidebarCollapse');
  const toTop=document.querySelector('#toTop');
  const themeToggle=document.querySelector('#themeToggle');
  const mobileSectionJump=document.querySelector('#mobileSectionJump');
  const mobileSectionSelect=document.querySelector('#mobileSectionSelect');
  const coreFallbackNotice=document.querySelector('#coreFallbackNotice');
  const themeColorMeta=document.querySelector('#themeColorMeta');
  const labels={sistema:'ARCHIVVM · SISTEMA',crafting:'ARS · PRODUÇÃO',roma:'ROMA · LORE',magia:'ARS ARCANA',deuses:'PANTHEON · ROMA'};
  let current='sistema';
  let deityFocus=null;
  let activeSearchIndex=-1;
  let sectionObserver=null;
  let scrollStateTimer=null;

  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function closeMenu(){sidebar.classList.remove('open');scrim.classList.remove('show');document.querySelector('#menuBtn')?.setAttribute('aria-expanded','false')}

  const visualMap={
    poderes:['assets/visual/banner-sistema.webp','Sistema de jogo'],
    legados:['assets/visual/banner-legados.webp','Legados'],
    reclamacao:['assets/visual/reclamacoes.webp','Reclamação'],
    criacao:['assets/visual/atributos.webp','Atributos'],
    recursos:['assets/visual/banner-status.webp','Status'],
    treinos:['assets/visual/banner-treinamento.webp','Treinamento'],
    combate:['assets/visual/banner-combate.webp','Combate'],
    condicoes:['assets/visual/banner-condicoes.webp','Condições'],
    hierarquia:['assets/visual/hierarquia.webp','Hierarquia'],
    afinidade:['assets/visual/afinidade.webp','Afinidade'],
    'casa-lobo':['assets/visual/sobre-casa-lobo.webp','Casa do Lobo'],
    coortes:['assets/visual/sobre-coortes.webp','Coortes'],
    'nova-roma':['assets/visual/sobre-nova-roma.webp','Nova Roma'],
  };
  const pantheonVisuals={
    triunviros:['assets/visual/deuses-triunviros.webp','Triúnviros'],
    'dii-consentis':['assets/visual/deuses-dii-consentis.webp','Dii Consentis'],
    'dii-inferi':['assets/visual/deuses-dii-inferi.webp','Dii Inferi'],
    alati:['assets/visual/deuses-alati.webp','Alati'],
    ventis:['assets/visual/deuses-ventis.webp','Ventis'],
    numina:['assets/visual/deuses-numina.webp','Numina']
  };
  const openingVisuals={
    crafting:['assets/visual/banner-crafting-custom.webp','Crafting'],
    magia:['assets/visual/magia-hero.webp','Magia'],
    roma:['assets/visual/roma-hero.webp','Sobre Roma'],
    deuses:['assets/visual/deuses-triunviros.webp','Panteão romano']
  };
  function addImage(el,src,alt,cls,priority=false){
    if(!el||el.querySelector(':scope > img.'+cls)) return;
    const img=document.createElement('img');img.className=cls;img.src=src;img.alt=alt;img.loading=priority?'eager':'lazy';img.decoding='async';
    if(priority) img.fetchPriority='high';
    el.prepend(img);
  }
  function enhanceVisuals(){
    // Sistema: banner principal real, sem crop.
    if(current==='sistema' && !content.querySelector(':scope > .system-hero-media')){
      const fig=document.createElement('figure');fig.className='system-hero-media';
      fig.innerHTML='<img src="assets/visual/legio.webp" alt="Legio XII Fulminata" loading="eager" fetchpriority="high" decoding="async">';
      content.prepend(fig);
    }
    if(current==='sistema' && !content.querySelector(':scope > .sheet-cta-hero')){
      const cta=document.createElement('aside');
      cta.className='sheet-cta-hero';
      cta.innerHTML=`<div><span>FICHA OFICIAL DA DUODÉCIMA</span><h2>Crie sua ficha aqui</h2><p>Monte seu personagem e acompanhe nível, prole, atributos, recursos, talentos, equipamentos e poderes em uma ficha integrada ao mesmo sistema do Guia.</p></div><a href="https://stsedd.github.io/ficha-oficial-duodecima-rpg/" target="_blank" rel="noopener noreferrer">ABRIR CRIADOR <b>↗</b></a>`;
      const hero=content.querySelector(':scope > .system-hero-media');
      hero?.after(cta);
    }
    // Aberturas principais. A imagem é elemento real para nunca ser cortada.
    const open=content.querySelector(':scope > .gods-opening,:scope > .crafting-opening,:scope > .magic-opening,:scope > .about-opening');
    if(open && openingVisuals[current]) addImage(open,...openingVisuals[current],'opening-visual',true);
    // Banners horizontais das seções.
    content.querySelectorAll('.section[id]').forEach(sec=>{
      const info=visualMap[sec.id];
      const strip=sec.querySelector(':scope > .banner-strip');
      if(info && strip) addImage(strip,...info,'section-banner-img');
      if(info && !strip && ['casa-lobo','coortes','nova-roma'].includes(sec.id)){
        const fig=document.createElement('figure');fig.className='section-visual';
        fig.innerHTML=`<img src="${info[0]}" alt="${info[1]}" loading="lazy" decoding="async">`;
        sec.prepend(fig);
      }
    });
    // Outros panteões em Sobre Roma usa o banner horizontal próprio.
    if(current==='roma'){
      const sec=content.querySelector('#panteoes');
      if(sec && !sec.querySelector(':scope > .section-visual')){
        const fig=document.createElement('figure');fig.className='section-visual';
        fig.innerHTML='<img src="assets/visual/sobre-panteoes.webp" alt="Outros panteões" loading="lazy" decoding="async">';
        sec.prepend(fig);
      }
    }
    // Banners dos grupos divinos: arte quadrada inteira + texto, sem cover.
    if(current==='deuses'){
      Object.entries(pantheonVisuals).forEach(([id,info])=>{
        const banner=content.querySelector(`#${CSS.escape(id)} .pantheon-banner`);
        if(!banner) return;
        const media=banner.querySelector(':scope > figure')||banner;
        addImage(media,...info,'pantheon-art');
      });
    }
  }

  const TALENT_GROUPS={
    combate:/ataque|duelista|campe[aã]o|mestre das armas|gambito|comandante|descuidado/i,
    defesa:/defensor|interceptador|resiliente|bruto|[áa]gil|escudos|corpo saud[aá]vel|dur[aá]vel/i,
    pericia:/expert|perito|l[ií]ngua de prata|pau pra toda obra|aumento de atributo/i,
    suporte:/curandeiro|chef|querido|inspirado/i,
    magia:/magia|m[aá]gico|elemental|habilidades|invocador/i
  };
  function talentGroup(name){for(const [k,re] of Object.entries(TALENT_GROUPS))if(re.test(name))return k;return 'utilidade';}
  function addSectionChrome(){
    content.querySelectorAll(':scope > .section[id]').forEach((sec,i)=>{
      const head=sec.querySelector(':scope > .section-head'); if(!head)return;
      sec.style.setProperty('--section-index',String(i+1).padStart(2,'0'));
      if(!head.querySelector('.section-rule')){const line=document.createElement('span');line.className='section-rule';head.append(line);}
    });
  }
  function enhanceSkills(){
    const sec=content.querySelector('#pericias'); if(!sec)return;
    const grid=sec.querySelector('.skill-grid'); if(!grid)return;
    if(!sec.querySelector('.skill-legend')){
      const legend=document.createElement('div');legend.className='skill-legend';legend.innerHTML=`
        <span class="tone-for"><i>FOR</i>Força</span><span class="tone-des"><i>DES</i>Destreza</span><span class="tone-con"><i>CON</i>Constituição</span>
        <span class="tone-int"><i>INT</i>Inteligência</span><span class="tone-fe"><i>FÉ</i>Fé</span><span class="tone-car"><i>CAR</i>Carisma</span>`;
      grid.before(legend);
    }
  }
  function enhanceResources(){
    const sec=content.querySelector('#recursos'); if(!sec)return;
    const table=sec.querySelector('.table-wrap table');
    if(table && !sec.querySelector('.sanity-scale')){
      const rows=[...table.querySelectorAll('tbody tr')];
      const scale=document.createElement('div');scale.className='sanity-scale';
      scale.innerHTML=rows.map((r,i)=>{const c=[...r.children].map(x=>x.innerHTML);return `<article data-band="${i}"><b>${c[0]}</b><strong>${c[1]}</strong><p>${c[2]}</p></article>`}).join('');
      table.closest('.table-wrap').replaceWith(scale);
    }
  }
  function enhanceProgressions(){
    const milestones=content.querySelector('#talentos .milestones');
    if(milestones && !milestones.dataset.enhanced){
      milestones.dataset.enhanced='1'; const labels=['INÍCIO','II','III','IV'];
      [...milestones.children].forEach((n,i)=>{n.innerHTML=`<b>${n.textContent.trim()}</b><small>${labels[i]}</small>`;});
    }
    const bp=content.querySelector('#prof .bp-list');
    if(bp) bp.classList.add('progress-track');
    const train=content.querySelector('#treinos .feature');
    if(train && !content.querySelector('#treinos .stake-track')){
      const track=document.createElement('div');track.className='stake-track';track.innerHTML=`<span><b>0–15</b><small>INICIAL</small></span><span><b>16–29</b><small>INTERMEDIÁRIO</small></span><span><b>30+</b><small>DOMÍNIO</small></span>`;
      train.after(track);
    }
  }
  function enhanceTalents(){
    const grid=content.querySelector('#talentos .talent-grid-full'); if(!grid)return;
    [...grid.children].forEach(card=>{
      const h=card.querySelector('h3'); if(!h)return;
      const requirement=h.querySelector('span'); if(requirement) requirement.classList.add('talent-level');
      if(!card.querySelector('.talent-meta')){
        const name=[...h.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim()||h.textContent.trim();
        const text=card.textContent;
        const meta=document.createElement('div');meta.className='talent-meta';
        const group=talentGroup(name);const unique=card.dataset.repeatable==='false'||/s[oó] pode ser escolhido uma vez/i.test(text);meta.innerHTML=`<span class="talent-kind kind-${group}">${group.toUpperCase()}</span>${unique?'<span class="talent-once">ÚNICO</span>':''}`;
        card.append(meta);
      }
    });
  }
  function enhanceConditions(){
    const sec=content.querySelector('#condicoes'); if(!sec)return;
    const list=sec.querySelector('.condition-list'); if(!list)return;
    if(!sec.querySelector('.condition-toolbar')){
      const bar=document.createElement('div');bar.className='condition-toolbar';bar.innerHTML='<input type="search" placeholder="Buscar condição…" aria-label="Buscar condição"><button type="button">Recolher todas</button>';
      list.before(bar);
      const input=bar.querySelector('input');input.addEventListener('input',()=>{const q=norm(input.value);[...list.children].forEach(d=>d.hidden=q&&!norm(d.textContent).includes(q));});
      bar.querySelector('button').addEventListener('click',e=>{const any=[...list.querySelectorAll('details')].some(d=>d.open);list.querySelectorAll('details').forEach(d=>d.open=!any);e.currentTarget.textContent=any?'Expandir todas':'Recolher todas';});
    }
  }
  function enhanceAffinity(){
    const sec=content.querySelector('#afinidade'); if(!sec)return;
    const scale=sec.querySelector('.affinity-scale'); if(scale && !sec.querySelector('.affinity-axis')){
      const axis=document.createElement('div');axis.className='affinity-axis';axis.innerHTML='<span><b>−100</b><small>ÓDIO</small></span><span><b>−50</b><small>INIMIZADE</small></span><span><b>−25</b><small>DESCONFIANÇA</small></span><span><b>0</b><small>NEUTRO</small></span><span><b>+30</b><small>RECONHECIMENTO</small></span><span><b>+60</b><small>CONFIANÇA</small></span><span><b>+100</b><small>VÍNCULO</small></span>';
      scale.before(axis);
    }
  }
  function enhancePantheonFilters(){
    if(current!=='deuses')return;
    const sec=content.querySelector('#panteoes'); if(!sec)return;
    if(!sec.querySelector('.pantheon-filter')){
      const filter=document.createElement('div');filter.className='pantheon-filter';
      filter.innerHTML='<button class="active" data-pfilter="all">Todos</button><button data-pfilter="triunviros">Triúnviros</button><button data-pfilter="dii-consentis">Consentis</button><button data-pfilter="dii-inferi">Inferi</button><button data-pfilter="alati">Alati</button><button data-pfilter="ventis">Ventis</button><button data-pfilter="numina">Numina</button>';
      const grid=sec.querySelector('.pantheon-grid');grid?.before(filter);
      filter.addEventListener('click',e=>{const b=e.target.closest('[data-pfilter]');if(!b)return;filter.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));const id=b.dataset.pfilter;if(id==='all'){content.querySelectorAll('.pantheon-section').forEach(x=>x.hidden=false);sec.querySelectorAll('.pantheon-card').forEach(x=>x.hidden=false);}else{content.querySelectorAll('.pantheon-section').forEach(x=>x.hidden=x.id!==id);sec.querySelectorAll('.pantheon-card').forEach(x=>x.hidden=!(x.getAttribute('href')||'').includes('#'+id));content.querySelector('#'+CSS.escape(id))?.scrollIntoView({behavior:'smooth',block:'start'});}});
    }
  }
  function enhanceDeityAbilities(){
    if(current!=='deuses')return;
    content.querySelectorAll('.deity-ability').forEach(d=>{
      const body=d.querySelector('.ability-body'); if(!body||body.dataset.enhanced)return;body.dataset.enhanced='1';
      [...body.querySelectorAll('p')].forEach(p=>{const m=p.innerHTML.match(/^<strong>(0-15|16-29|30\+):<\/strong>\s*(.*)$/i);if(m){p.classList.add('stake-line');p.dataset.stake=m[1];p.innerHTML=`<span>${m[1]}</span><em>${m[2]}</em>`;}});
      const summary=d.querySelector('summary'); const type=summary?.querySelector('b'); if(type)type.classList.add('ability-type');
    });
  }
  function enhanceJobs(){content.querySelectorAll('.job-grid>article').forEach((x,i)=>{if(!x.dataset.job)x.dataset.job=String(i+1).padStart(2,'0');});}
  function enhanceFamiliars(){content.querySelectorAll('#familiares .familiar-grid>article').forEach((x,i)=>x.style.setProperty('--familiar-index',String(i+1).padStart(2,'0')));}
  function enhanceMagic(){
    const circles=content.querySelector('#circulos .circle-grid'); if(circles)circles.classList.add('progression-circles');
    content.querySelectorAll('#alta-magia .high-magic-grid>article').forEach(x=>x.classList.add('arcane-card'));
  }
  function enhanceCrafting(){content.querySelectorAll('.material-grid>article').forEach((x,i)=>x.style.setProperty('--material-index',String(i+1).padStart(2,'0')));}
  function enhanceRoma(){content.querySelectorAll('#liderancas .leader-card').forEach((x,i)=>x.style.setProperty('--leader-index',String(i+1).padStart(2,'0')));}
  function enhanceInterface(){
    addSectionChrome();enhanceSkills();enhanceResources();enhanceProgressions();enhanceTalents();enhanceConditions();enhanceAffinity();enhancePantheonFilters();enhanceDeityAbilities();enhanceJobs();enhanceFamiliars();enhanceMagic();enhanceCrafting();enhanceRoma();
  }
  function fixInternalLinks(){
    content.querySelectorAll('a[href]').forEach(a=>{
      const href=(a.getAttribute('href')||'').replace(/\\/g,'');
      if(href==='sobre-roma/#estrangeiros') a.setAttribute('href','#page:roma:estrangeiros');
      if(href==='crafting/'||href==='crafting') a.setAttribute('href','#page:crafting');
    });
  }
  function sectionTitle(sec){
    if(sec?.dataset?.title)return sec.dataset.title;
    const h=sec?.querySelector('h2,h1');if(h){const clone=h.cloneNode(true);clone.querySelectorAll('.copy-anchor-btn').forEach(x=>x.remove());return clone.textContent.trim();}
    return (sec?.id||'Seção').replace(/-/g,' ');
  }
  function setTheme(theme,persist=true){
    const next=theme==='light'?'light':'dark';
    document.documentElement.dataset.theme=next;
    document.documentElement.style.colorScheme=next;
    if(themeColorMeta) themeColorMeta.setAttribute('content',next==='light'?'#f4efe8':'#070707');
    if(themeToggle){
      themeToggle.classList.toggle('is-light',next==='light');
      themeToggle.setAttribute('aria-pressed',next==='light'?'true':'false');
      themeToggle.setAttribute('title',next==='light'?'Mudar para tema escuro':'Mudar para tema claro');
      const icon=themeToggle.querySelector('span'),label=themeToggle.querySelector('b');
      if(icon) icon.textContent=next==='light'?'☀':'☾';
      if(label) label.textContent=next==='light'?'Claro':'Escuro';
    }
    if(persist){try{localStorage.setItem('guia_theme',next)}catch{}}
  }
  function initTheme(){
    let theme=document.documentElement.dataset.theme==='light'?'light':'dark';
    try{const saved=localStorage.getItem('guia_theme');if(saved==='light'||saved==='dark')theme=saved;}catch{}
    setTheme(theme,false);
    themeToggle?.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
  }
  function updateCoreFallbackNotice(){
    if(!coreFallbackNotice)return;
    const st=window.DUODECIMA_CORE_STATE;
    const fallback=!!st && st.status==='fallback';
    coreFallbackNotice.hidden=!fallback;
  }
  function cleanImageLoading(){
    const hero=content.querySelector(':scope > .system-hero-media img,:scope > .gods-opening > img,:scope > .crafting-opening > img,:scope > .magic-opening > img,:scope > .about-opening > img');
    content.querySelectorAll('img').forEach(img=>{
      img.decoding='async';
      if(img===hero){img.loading='eager';img.fetchPriority='high';}
      else if(!img.hasAttribute('loading')) img.loading='lazy';
    });
  }
  function currentRouteHash(key=current,anchor=null){return `#page:${key}${anchor?':'+anchor:''}`;}
  function parseRoute(){
    const raw=location.hash.startsWith('#page:')?location.hash.slice(6):'sistema';
    const [key,...rest]=raw.split(':');
    return {key:pages[key]?key:'sistema',anchor:rest.join(':')||null};
  }
  function saveCurrentHistoryScroll(){
    try{
      const route=parseRoute();
      const st=Object.assign({},history.state||{},route,{scrollY:window.scrollY});
      history.replaceState(st,'',location.href);
      sessionStorage.setItem(`guia_scroll_${current}`,String(window.scrollY));
    }catch{}
  }
  function writeHistory(key,anchor,mode='push',scrollY=0){
    const state={key,anchor:anchor||null,scrollY:Number.isFinite(scrollY)?scrollY:0};
    if(mode==='replace')history.replaceState(state,'',currentRouteHash(key,anchor));
    else if(mode==='push'){saveCurrentHistoryScroll();history.pushState(state,'',currentRouteHash(key,anchor));}
  }
  function copyText(text){
    if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
    return new Promise((resolve,reject)=>{try{const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();document.execCommand('copy');t.remove();resolve();}catch(err){reject(err);}});
  }
  function deepLinkFor(id){
    const base=location.href.split('#')[0];
    return `${base}${currentRouteHash(current,id)}`;
  }
  function addCopyButton(host,id,label){
    if(!host||host.querySelector(':scope > .copy-anchor-btn'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='copy-anchor-btn';btn.dataset.copyAnchor=id;btn.setAttribute('aria-label',`Copiar link para ${label}`);btn.title='Copiar link direto';btn.innerHTML='<span aria-hidden="true">↗</span>';
    host.append(btn);
    if(host.matches?.('summary'))host.classList.add('has-copy-anchor');
  }
  function enhanceDeepLinks(){
    content.querySelectorAll(':scope > .section[id]').forEach(sec=>{
      const h=sec.querySelector(':scope > .section-head h2');
      if(h)addCopyButton(h,sec.id,sectionTitle(sec));
    });
    if(current==='deuses'){
      content.querySelectorAll('.deity-detail[id]').forEach(sec=>{
        const titleEl=sec.querySelector('.deity-title h2');
        if(titleEl)addCopyButton(titleEl,sec.id,titleEl.textContent.trim());
        sec.querySelectorAll('.deity-ability[id] summary').forEach(summary=>{
          const details=summary.closest('.deity-ability');
          const name=details?.dataset.title||summary.querySelector('strong')?.textContent||'habilidade';
          if(details)addCopyButton(summary,details.id,name);
        });
      });
    }
  }
  function deityName(sec){return sec?.querySelector('.deity-title h2')?.textContent.trim()||sec?.dataset.title||'Deus';}
  function enhanceDeityNavigation(){
    if(current!=='deuses')return;
    const deities=[...content.querySelectorAll('.deity-detail[id]')];
    deities.forEach((sec,i)=>{
      const back=sec.querySelector('.deity-back a');
      if(back){back.textContent='← Voltar ao índice dos deuses';back.setAttribute('href','#page:deuses:panteoes');}
      if(sec.querySelector(':scope > .deity-focus-nav'))return;
      const prev=deities[i-1],next=deities[i+1];
      const nav=document.createElement('nav');nav.className='deity-focus-nav';nav.setAttribute('aria-label','Navegação entre deuses');
      nav.innerHTML=`<a class="deity-prev ${prev?'':'is-disabled'}" ${prev?`href="#page:deuses:${prev.id}"`:''}><small>ANTERIOR</small><b>${prev?escapeHtml(deityName(prev)):'—'}</b></a><a class="deity-index-link" href="#page:deuses:panteoes">Índice dos deuses</a><a class="deity-next ${next?'':'is-disabled'}" ${next?`href="#page:deuses:${next.id}"`:''}><small>PRÓXIMO</small><b>${next?escapeHtml(deityName(next)):'—'}</b></a>`;
      const backRow=sec.querySelector(':scope > .deity-back');
      backRow?.after(nav);
    });
  }
  function rebuildSectionNav(){
    sectionNav.innerHTML='';
    const sections=[...content.querySelectorAll(':scope > .section[id]')].filter(s=>!s.classList.contains('deity-detail'));
    sections.forEach(sec=>{
      const a=document.createElement('a');a.href='#'+sec.id;a.textContent=sectionTitle(sec);a.dataset.sectionId=sec.id;sectionNav.append(a);
    });
    if(current==='deuses'&&!sections.some(sec=>sec.id==='panteoes')){
      const sep=document.createElement('div');sep.className='sidebar-divider';sectionNav.append(sep);
      const a=document.createElement('a');a.href='#panteoes';a.textContent='Índice dos deuses';a.dataset.sectionId='panteoes';sectionNav.append(a);
    }
    if(mobileSectionSelect){
      mobileSectionSelect.innerHTML=sections.map(sec=>`<option value="${escapeHtml(sec.id)}">${escapeHtml(sectionTitle(sec))}</option>`).join('');
      mobileSectionJump.hidden=!sections.length;
    }
    setupScrollSpy(sections);
  }
  function markCurrentSection(id){
    if(!id)return;
    sectionNav.querySelectorAll('[data-section-id]').forEach(a=>{
      const active=a.dataset.sectionId===id;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    });
    if(mobileSectionSelect && [...mobileSectionSelect.options].some(o=>o.value===id))mobileSectionSelect.value=id;
  }
  function setupScrollSpy(sections){
    sectionObserver?.disconnect();sectionObserver=null;
    if(!sections.length)return;
    markCurrentSection(sections[0].id);
    if(!('IntersectionObserver' in window))return;
    const visible=new Map();
    sectionObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.isIntersecting?visible.set(entry.target.id,entry.boundingClientRect.top):visible.delete(entry.target.id));
      if(visible.size){const id=[...visible.entries()].sort((a,b)=>Math.abs(a[1]-110)-Math.abs(b[1]-110))[0][0];markCurrentSection(id);}
    },{rootMargin:'-90px 0px -68% 0px',threshold:[0,.08,.2]});
    sections.forEach(sec=>sectionObserver.observe(sec));
  }
  function showPage(key,anchor=null,options={}){
    let {historyMode='push',restoreY=null}=options;
    if(restoreY==null&&!anchor&&historyMode==='push'){try{const stored=Number(sessionStorage.getItem(`guia_scroll_${key}`));if(Number.isFinite(stored)&&stored>0)restoreY=stored;}catch{}}
    if(!pages[key]) key='sistema';
    current=key; deityFocus=null;
    content.className=`content page-${key}`;
    content.innerHTML=pages[key].html;
    fixInternalLinks();
    enhanceVisuals();
    enhanceInterface();
    enhanceDeityNavigation();
    enhanceDeepLinks();
    cleanImageLoading();
    title.textContent=pages[key].title;
    eyebrow.textContent=labels[key]||'ARCHIVVM';
    document.title=`${pages[key].title} · Guia da Duodécima`;
    document.querySelectorAll('[data-page]').forEach(b=>{
      const active=b.dataset.page===key;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
    rebuildSectionNav();
    bindLocalControls();
    updateCoreFallbackNotice();
    if(historyMode!=='none')writeHistory(key,anchor,historyMode,0);
    requestAnimationFrame(()=>{
      if(anchor)navigateAnchor(anchor,{historyMode:'none',behavior:restoreY==null?'smooth':'auto'});
      if(Number.isFinite(restoreY)){requestAnimationFrame(()=>window.scrollTo({top:restoreY,behavior:'auto'}));}
      else if(!anchor)window.scrollTo({top:0,behavior:'auto'});
    });
    closeMenu();
  }
  function navigateAnchor(id,options={}){
    const {historyMode='push',behavior='smooth'}=options;
    id=(id||'').replace(/^#/,''); if(!id) return;
    let didNavigate=false;
    if(current==='deuses' && id.startsWith('deus-')){
      deityFocus=id;
      content.classList.add('deity-focus');
      content.querySelectorAll('.deity-detail').forEach(s=>s.hidden=s.id!==id);
      const target=content.querySelector('#'+CSS.escape(id));
      if(target){target.hidden=false;target.scrollIntoView({behavior,block:'start'});didNavigate=true;}
    } else if(current==='deuses' && id==='panteoes'){
      deityFocus=null;content.classList.remove('deity-focus');
      content.querySelectorAll('.deity-detail').forEach(s=>s.hidden=true);
      const target=content.querySelector('#panteoes');target?.scrollIntoView({behavior,block:'start'});didNavigate=!!target;
    } else {
      const target=content.querySelector('#'+CSS.escape(id));
      if(target){
        const deity=target.closest('.deity-detail');
        if(current==='deuses'&&deity){
          deityFocus=deity.id;content.classList.add('deity-focus');content.querySelectorAll('.deity-detail').forEach(s=>s.hidden=s!==deity);deity.hidden=false;
        }
        if(target.matches('details'))target.open=true;
        target.scrollIntoView({behavior,block:target.matches('details')?'center':'start'});didNavigate=true;
      }
    }
    if(didNavigate){
      markCurrentSection(id);
      if(historyMode!=='none')writeHistory(current,id,historyMode,window.scrollY);
    }
  }
  function bindLocalControls(){
    content.querySelectorAll('.toggle-abilities').forEach(btn=>btn.addEventListener('click',()=>{
      const box=content.querySelector('#'+CSS.escape(btn.dataset.target||'')); if(!box)return;
      const ds=[...box.querySelectorAll('details')]; const openAll=ds.some(d=>!d.open); ds.forEach(d=>d.open=openAll); btn.textContent=openAll?'Recolher todas':'Expandir todas';
    }));
  }
  function showToast(message){
    let toast=document.querySelector('.guide-toast');
    if(!toast){toast=document.createElement('div');toast.className='guide-toast';toast.setAttribute('role','status');document.body.append(toast);}
    toast.textContent=message;toast.classList.add('show');clearTimeout(toast._timer);toast._timer=setTimeout(()=>toast.classList.remove('show'),1800);
  }
  function closeSearch(){results.hidden=true;results.innerHTML='';results._items=[];activeSearchIndex=-1;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant');}
  function searchSnippet(item,tokens){
    const raw=String(item.text||'').replace(/\s+/g,' ').trim();
    if(!raw)return '';
    const n=norm(raw);let at=-1;
    for(const t of tokens){const idx=n.indexOf(t);if(idx>=0&&(at<0||idx<at))at=idx;}
    const start=Math.max(0,(at<0?0:at)-54),end=Math.min(raw.length,start+178);
    return `${start>0?'…':''}${raw.slice(start,end).trim()}${end<raw.length?'…':''}`;
  }
  function highlightSimple(text,rawQuery){
    let out=escapeHtml(text);const words=String(rawQuery||'').trim().split(/\s+/).filter(x=>x.length>1);
    for(const w of words){const safe=w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');out=out.replace(new RegExp(`(${safe})`,'gi'),'<mark>$1</mark>');}
    return out;
  }
  function setActiveSearchResult(index){
    const buttons=[...results.querySelectorAll('.search-result')];if(!buttons.length){activeSearchIndex=-1;return;}
    activeSearchIndex=(index+buttons.length)%buttons.length;
    buttons.forEach((b,i)=>{const active=i===activeSearchIndex;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',active?'true':'false');});
    const active=buttons[activeSearchIndex];if(active){active.id=`search-result-${activeSearchIndex}`;search.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}
  }
  function doSearch(rawQuery){
    const q=norm(rawQuery.trim()); if(q.length<2){closeSearch();return;}
    const tokens=q.split(/\s+/).filter(Boolean);const found=[];
    for(const item of searchIndex){
      const hay=norm(item.title+' '+item.text);
      if(tokens.every(t=>hay.includes(t))){const titleNorm=norm(item.title);let score=tokens.reduce((n,t)=>n+(titleNorm.includes(t)?6:1),0);if(item.deity)score+=1;found.push({...item,score});}
    }
    found.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
    const limited=found.slice(0,30);results._items=limited;activeSearchIndex=-1;
    results.innerHTML=limited.length?limited.map((x,i)=>`<button class="search-result" role="option" aria-selected="false" data-result="${i}"><small>${escapeHtml(pages[x.page]?.title||x.page)}</small><b>${highlightSimple(x.title,rawQuery)}</b><span>${highlightSimple(searchSnippet(x,tokens),rawQuery)}</span></button>`).join(''):'<div class="search-empty">Nada encontrado.</div>';
    results.hidden=false;search.setAttribute('aria-expanded','true');
  }
  function openSearchResult(index){
    const item=results._items?.[index];if(!item)return;
    closeSearch();search.value='';
    const initialAnchor=item.deity||item.anchor||null;
    showPage(item.page,initialAnchor,{historyMode:'push'});
    if(item.deity&&item.anchor&&item.anchor!==item.deity){requestAnimationFrame(()=>setTimeout(()=>navigateAnchor(item.anchor,{historyMode:'replace',behavior:'smooth'}),80));}
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  document.addEventListener('click',e=>{
    const copy=e.target.closest('[data-copy-anchor]');
    if(copy){e.preventDefault();e.stopPropagation();const id=copy.dataset.copyAnchor;copyText(deepLinkFor(id)).then(()=>showToast('Link copiado.')).catch(()=>showToast('Não foi possível copiar o link.'));return;}
    const pageBtn=e.target.closest('[data-page]');if(pageBtn){showPage(pageBtn.dataset.page,null,{historyMode:'push'});return;}
    const a=e.target.closest('a[href]');if(!a)return;
    const href=a.getAttribute('href');
    if(href?.startsWith('#page:')){e.preventDefault();const p=href.slice(6).split(':');showPage(p.shift(),p.join(':')||null,{historyMode:'push'});return;}
    if(href?.startsWith('#')){e.preventDefault();navigateAnchor(href,{historyMode:'push'});closeMenu();}
  });

  const menuBtn=document.querySelector('#menuBtn');
  menuBtn?.addEventListener('click',()=>{const open=sidebar.classList.toggle('open');scrim.classList.toggle('show',open);menuBtn.setAttribute('aria-expanded',open?'true':'false')});
  scrim.addEventListener('click',closeMenu);
  if(sidebarCollapse){let stored=false;try{stored=localStorage.getItem('guia_sidebar_collapsed')==='1'}catch{}document.body.classList.toggle('sidebar-collapsed',stored);sidebarCollapse.textContent=stored?'›':'‹';sidebarCollapse.setAttribute('aria-expanded',stored?'false':'true');sidebarCollapse.addEventListener('click',()=>{const v=document.body.classList.toggle('sidebar-collapsed');sidebarCollapse.textContent=v?'›':'‹';sidebarCollapse.setAttribute('aria-expanded',v?'false':'true');try{localStorage.setItem('guia_sidebar_collapsed',v?'1':'0')}catch{}});}
  if(toTop){toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));}
  mobileSectionSelect?.addEventListener('change',()=>navigateAnchor(mobileSectionSelect.value,{historyMode:'push'}));

  search.addEventListener('input',()=>doSearch(search.value));
  search.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeSearch();search.blur();return;}
    if(results.hidden)return;
    if(e.key==='ArrowDown'){e.preventDefault();setActiveSearchResult(activeSearchIndex+1);}
    else if(e.key==='ArrowUp'){e.preventDefault();setActiveSearchResult(activeSearchIndex-1);}
    else if(e.key==='Enter'&&activeSearchIndex>=0){e.preventDefault();openSearchResult(activeSearchIndex);}
  });
  results.addEventListener('mousemove',e=>{const b=e.target.closest('[data-result]');if(b)setActiveSearchResult(+b.dataset.result);});
  results.addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(b)openSearchResult(+b.dataset.result);});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();search.select();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))closeSearch();});

  window.addEventListener('scroll',()=>{
    toTop?.classList.toggle('show',scrollY>700);
    clearTimeout(scrollStateTimer);scrollStateTimer=setTimeout(saveCurrentHistoryScroll,220);
  },{passive:true});
  window.addEventListener('beforeunload',saveCurrentHistoryScroll);
  window.addEventListener('popstate',e=>{
    const route=parseRoute();const y=Number(e.state?.scrollY);
    showPage(route.key,route.anchor,{historyMode:'none',restoreY:Number.isFinite(y)?y:null});
  });

  function boot(){
    initTheme();updateCoreFallbackNotice();
    const route=parseRoute();const existing=history.state;const y=Number(existing?.scrollY);
    showPage(route.key,route.anchor,{historyMode:'replace',restoreY:Number.isFinite(y)?y:null});
  }
  boot();
})();
