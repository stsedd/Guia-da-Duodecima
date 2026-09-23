(()=>{
  'use strict';

  const content=document.querySelector('#content');
  if(!content)return;

  const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
  const roman=n=>ROMAN[n]||String(n);
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function pageFromLocation(){
    const hash=location.hash||'';
    if(hash.includes('page:roma'))return 'roma';
    if(hash.includes('page:magia'))return 'magia';
    const title=norm(document.querySelector('#pageTitle')?.textContent||'');
    if(title.includes('roma'))return 'roma';
    if(title.includes('magia'))return 'magia';
    return '';
  }

  function makeHero(page){
    const old=content.querySelector(':scope > .guide-page-hero');
    if(old?.dataset.page===page)return old;
    old?.remove();
    if(page!=='roma'&&page!=='magia')return null;

    const hero=document.createElement('section');
    hero.className=`guide-page-hero guide-page-hero--${page}`;
    hero.dataset.page=page;
    if(page==='roma'){
      hero.innerHTML=`
        <div class="guide-page-hero-bg" aria-hidden="true"></div>
        <div class="guide-page-hero-copy">
          <span class="guide-page-hero-kicker">ARCHIVVM · XII</span>
          <h2>Sobre Roma</h2>
          <p>Território, instituições, alianças e acontecimentos organizados como um arquivo vivo da campanha.</p>
          <div class="guide-page-hero-tags" aria-label="Tópicos da página"><span>Nova Roma</span><span>Legião</span><span>Panteões</span><span>Fio da Trama</span></div>
        </div>
        <div class="guide-page-hero-index">SPQR · ARCHIVVM</div>`;
    }else{
      hero.innerHTML=`
        <div class="guide-page-hero-bg" aria-hidden="true"></div>
        <div class="guide-page-hero-copy">
          <span class="guide-page-hero-kicker">ARS MAGICA · IX</span>
          <h2>Magia</h2>
          <p>Círculos, despertar, atributos de conjuração e custos organizados como um tratado técnico de magia.</p>
          <div class="guide-page-hero-tags" aria-label="Tópicos da página"><span>INT</span><span>FÉ</span><span>CAR</span><span>ENERGIA</span></div>
        </div>
        <div class="guide-page-hero-index">TRACTATVS · MAGIA</div>`;
    }
    content.prepend(hero);
    return hero;
  }

  function decorateSections(page){
    const sections=[...content.querySelectorAll('.section,section.searchable')].filter(s=>!s.classList.contains('guide-page-hero'));
    sections.forEach((section,index)=>{
      section.dataset.guideIndex=roman(index+1);
      section.classList.toggle('roma-archive-section',page==='roma');
      section.classList.toggle('arcane-treatise-section',page==='magia');
    });
  }

  function decorateRoma(){
    const stories=[...content.querySelectorAll('.editorial-story')];
    stories.forEach((story,index)=>story.dataset.dossier=roman(index+1));

    const pantheonRoot=[...content.querySelectorAll('.section,section')].find(section=>norm(section.querySelector('h2,h3')?.textContent||'')==='outros panteoes');
    if(pantheonRoot){
      const cards=[...pantheonRoot.querySelectorAll('.grid>article,.pantheon-grid>article')];
      cards.forEach((card,index)=>card.dataset.pantheonIndex=String(index+1).padStart(2,'0'));
    }

    content.querySelectorAll('img').forEach(img=>{
      const clue=norm(`${img.getAttribute('src')||''} ${img.getAttribute('alt')||''}`);
      if(clue.includes('mapa')||clue.includes('map '))img.classList.add('archive-map');
    });
  }

  function decorateMagic(){
    const sacrifice=content.querySelector('.core-magic-sacrifice');
    if(sacrifice&&!sacrifice.querySelector('.ritual-seal')){
      const seal=document.createElement('div');
      seal.className='ritual-seal';
      seal.setAttribute('aria-hidden','true');
      seal.innerHTML='<span>CORPUS</span><i>✦</i><span>ENERGIA</span>';
      const grid=sacrifice.querySelector('.core-magic-sacrifice-grid');
      if(grid)grid.before(seal);else sacrifice.appendChild(seal);
    }

    const circles=[...content.querySelectorAll('.magic-circle-card')];
    circles.forEach((card,index)=>{
      card.dataset.arcaneOrder=roman(index+1);
      card.setAttribute('aria-label',card.textContent.replace(/\s+/g,' ').trim());
    });
  }

  function decorate(){
    const page=pageFromLocation();
    document.body.dataset.guidePage=page;
    if(page!=='roma'&&page!=='magia'){
      content.querySelector(':scope > .guide-page-hero')?.remove();
      return;
    }
    makeHero(page);
    decorateSections(page);
    if(page==='roma')decorateRoma();
    if(page==='magia')decorateMagic();
  }

  let queued=false;
  const queue=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;decorate()});
  };

  new MutationObserver(queue).observe(content,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(queue,0));
  document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>setTimeout(queue,0)));
  decorate();
})();
