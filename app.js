
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
  const labels={sistema:'ARCHIVVM · SISTEMA',crafting:'ARS · PRODUÇÃO',roma:'ROMA · LORE',magia:'ARS ARCANA',deuses:'PANTHEON · ROMA'};
  let current='sistema';
  let deityFocus=null;

  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function closeMenu(){sidebar.classList.remove('open');scrim.classList.remove('show')}

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
  function addImage(el,src,alt,cls){
    if(!el||el.querySelector(':scope > img.'+cls)) return;
    const img=document.createElement('img');img.className=cls;img.src=src;img.alt=alt;img.loading='eager';img.decoding='async';
    el.prepend(img);
  }
  function enhanceVisuals(){
    // Sistema: banner principal real, sem crop.
    if(current==='sistema' && !content.querySelector(':scope > .system-hero-media')){
      const fig=document.createElement('figure');fig.className='system-hero-media';
      fig.innerHTML='<img src="assets/visual/legio.webp" alt="Legio XII Fulminata">';
      content.prepend(fig);
    }
    // Aberturas principais. A imagem é elemento real para nunca ser cortada.
    const open=content.querySelector(':scope > .gods-opening,:scope > .crafting-opening,:scope > .magic-opening,:scope > .about-opening');
    if(open && openingVisuals[current]) addImage(open,...openingVisuals[current],'opening-visual');
    // Banners horizontais das seções.
    content.querySelectorAll('.section[id]').forEach(sec=>{
      const info=visualMap[sec.id];
      const strip=sec.querySelector(':scope > .banner-strip');
      if(info && strip) addImage(strip,...info,'section-banner-img');
      if(info && !strip && ['casa-lobo','coortes','nova-roma'].includes(sec.id)){
        const fig=document.createElement('figure');fig.className='section-visual';
        fig.innerHTML=`<img src="${info[0]}" alt="${info[1]}">`;
        sec.prepend(fig);
      }
    });
    // Outros panteões em Sobre Roma usa o banner horizontal próprio.
    if(current==='roma'){
      const sec=content.querySelector('#panteoes');
      if(sec && !sec.querySelector(':scope > .section-visual')){
        const fig=document.createElement('figure');fig.className='section-visual';
        fig.innerHTML='<img src="assets/visual/sobre-panteoes.webp" alt="Outros panteões">';
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
  function fixInternalLinks(){
    content.querySelectorAll('a[href]').forEach(a=>{
      const href=(a.getAttribute('href')||'').replace(/\\/g,'');
      if(href==='sobre-roma/#estrangeiros') a.setAttribute('href','#page:roma:estrangeiros');
      if(href==='crafting/'||href==='crafting') a.setAttribute('href','#page:crafting');
    });
  }
  function sectionTitle(sec){
    const h=sec.querySelector('h2,h1'); if(h) return h.textContent.trim();
    return (sec.dataset.title||sec.id||'Seção').replace(/-/g,' ');
  }
  function rebuildSectionNav(){
    sectionNav.innerHTML='';
    [...content.querySelectorAll(':scope > .section[id]')].filter(s=>!s.classList.contains('deity-detail')).forEach(sec=>{
      const a=document.createElement('a');a.href='#'+sec.id;a.textContent=sectionTitle(sec);sectionNav.append(a);
    });
    if(current==='deuses'){
      const sep=document.createElement('div'); sep.className='sidebar-divider'; sectionNav.append(sep);
      const a=document.createElement('a');a.href='#panteoes';a.textContent='Índice dos deuses';sectionNav.append(a);
    }
  }
  function showPage(key, anchor=null, push=true){
    if(!pages[key]) key='sistema';
    current=key; deityFocus=null;
    content.className=`content page-${key}`;
    content.innerHTML=pages[key].html;
    fixInternalLinks();
    enhanceVisuals();
    title.textContent=pages[key].title;
    eyebrow.textContent=labels[key]||'ARCHIVVM';
    document.title=`${pages[key].title} · Guia da Duodécima`;
    document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===key));
    rebuildSectionNav();
    bindLocalControls();
    if(anchor){requestAnimationFrame(()=>navigateAnchor(anchor,false));} else window.scrollTo({top:0,behavior:'instant'});
    if(push) history.replaceState(null,'',`#page:${key}${anchor?':'+anchor:''}`);
    closeMenu();
  }
  function navigateAnchor(id,push=true){
    id=(id||'').replace(/^#/,''); if(!id) return;
    if(current==='deuses' && id.startsWith('deus-')){
      deityFocus=id;
      content.classList.add('deity-focus');
      content.querySelectorAll('.deity-detail').forEach(s=>s.hidden=s.id!==id);
      const target=content.querySelector('#'+CSS.escape(id));
      if(target){target.hidden=false;target.scrollIntoView({behavior:'smooth',block:'start'});}
    } else if(current==='deuses' && id==='panteoes'){
      deityFocus=null;content.classList.remove('deity-focus');
      content.querySelectorAll('.deity-detail').forEach(s=>s.hidden=true);
      content.querySelector('#panteoes')?.scrollIntoView({behavior:'smooth'});
    } else {
      let target=content.querySelector('#'+CSS.escape(id));
      if(!target && current==='deuses'){
        const ability=content.querySelector('#'+CSS.escape(id));
        if(ability){const deity=ability.closest('.deity-detail');if(deity){navigateAnchor(deity.id,false);ability.open=true;setTimeout(()=>ability.scrollIntoView({behavior:'smooth',block:'center'}),120);}}
      } else if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}
    }
    if(push) history.replaceState(null,'',`#page:${current}:${id}`);
  }
  function bindLocalControls(){
    content.querySelectorAll('.toggle-abilities').forEach(btn=>btn.addEventListener('click',()=>{
      const box=content.querySelector('#'+CSS.escape(btn.dataset.target||'')); if(!box)return;
      const ds=[...box.querySelectorAll('details')]; const openAll=ds.some(d=>!d.open); ds.forEach(d=>d.open=openAll); btn.textContent=openAll?'Recolher todas':'Expandir todas';
    }));
  }
  document.addEventListener('click',e=>{
    const pageBtn=e.target.closest('[data-page]'); if(pageBtn){showPage(pageBtn.dataset.page);return;}
    const a=e.target.closest('a[href]'); if(!a)return;
    const href=a.getAttribute('href');
    if(href?.startsWith('#page:')){e.preventDefault();const p=href.slice(6).split(':');showPage(p.shift(),p.join(':')||null);return;}
    if(href?.startsWith('#')){e.preventDefault();navigateAnchor(href);closeMenu();}
  });
  document.querySelector('#menuBtn').addEventListener('click',()=>{sidebar.classList.toggle('open');scrim.classList.toggle('show')}); scrim.addEventListener('click',closeMenu);

  function doSearch(q){
    q=norm(q.trim()); if(q.length<2){results.hidden=true;results.innerHTML='';return;}
    const tokens=q.split(/\s+/).filter(Boolean);
    const found=[];
    for(const item of searchIndex){const hay=norm(item.title+' '+item.text);if(tokens.every(t=>hay.includes(t))){let score=tokens.reduce((n,t)=>n+(norm(item.title).includes(t)?5:1),0);found.push({...item,score});}}
    found.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).splice(30);
    results.innerHTML=found.length?found.map((x,i)=>`<button class="search-result" data-result="${i}"><small>${pages[x.page]?.title||x.page}</small><b>${escapeHtml(x.title)}</b></button>`).join(''):'<div class="search-empty">Nada encontrado.</div>';
    results.hidden=false;
    results._items=found;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  search.addEventListener('input',()=>doSearch(search.value));
  search.addEventListener('keydown',e=>{if(e.key==='Escape'){results.hidden=true;search.blur();}});
  results.addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(!b)return;const item=results._items?.[+b.dataset.result];if(!item)return;results.hidden=true;search.value='';showPage(item.page,null,true);requestAnimationFrame(()=>{if(item.deity){navigateAnchor(item.deity,false);setTimeout(()=>{const ab=content.querySelector('#'+CSS.escape(item.anchor));if(ab){ab.open=true;ab.scrollIntoView({behavior:'smooth',block:'center'});}},100);}else navigateAnchor(item.anchor);});});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();search.select();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')) results.hidden=true});

  function boot(){
    const raw=location.hash.startsWith('#page:')?location.hash.slice(6):'sistema';
    const [key,...rest]=raw.split(':');showPage(key,rest.join(':')||null,false);
  }
  boot();
})();
