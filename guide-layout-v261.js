(()=>{
  'use strict';

  const content=document.querySelector('#content');
  if(!content)return;

  const ASSETS={
    main:'assets/visual/banner-combate-hires.webp',
    rolls:'assets/visual/banner-combate-rolagens-hires.webp',
    turn:'assets/visual/banner-combate-turno-hires.webp',
    attackDefense:'assets/visual/banner-combate-ataque-defesa-hires.webp'
  };
  const FALLBACK_MAIN='assets/visual/banner-combate.webp';
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function isCombatPage(){
    if((location.hash||'').includes('page:combate'))return true;
    return norm(document.querySelector('#pageTitle')?.textContent||'')==='combate';
  }

  function makeBanner(src,alt,cls='rules-banner'){
    const figure=document.createElement('figure');
    figure.className=cls;
    const img=document.createElement('img');
    img.src=src;
    img.alt=alt;
    img.decoding='async';
    img.loading=cls.includes('--main')?'eager':'lazy';
    img.addEventListener('error',()=>{
      if(cls.includes('--main')&&img.dataset.fallback!=='1'){
        img.dataset.fallback='1';
        img.src=FALLBACK_MAIN;
      }
    },{once:false});
    figure.appendChild(img);
    return figure;
  }

  function ensureMainBanner(){
    const opening=content.querySelector(':scope > .rules-opening');
    if(!opening)return;
    let banner=content.querySelector(':scope > .rules-page-banner--main');
    if(!banner){
      banner=makeBanner(ASSETS.main,'Combate em Roma e Além','rules-page-banner rules-page-banner--main');
      opening.before(banner);
    }
  }

  function ensureSectionBanner(id,src,alt){
    const section=content.querySelector(`#${CSS.escape(id)}`);
    if(!section)return null;
    let banner=section.querySelector(':scope > .rules-banner[data-guide-banner="v261"]');
    if(!banner){
      banner=makeBanner(src,alt);
      banner.dataset.guideBanner='v261';
      section.prepend(banner);
    }
    return section;
  }

  function reorganizeAttackDefense(){
    const section=content.querySelector('#rolagens');
    if(!section)return;
    const cards=[...section.querySelectorAll('.paper-card')];
    const attack=cards.find(card=>norm(card.querySelector('h3')?.textContent)==='ataque');
    const defense=cards.find(card=>norm(card.querySelector('h3')?.textContent)==='defesa');
    if(!attack||!defense)return;

    let feature=section.querySelector(':scope > .rules-subfeature.rules-attack-defense');
    if(!feature){
      feature=document.createElement('div');
      feature.className='rules-subfeature rules-attack-defense';
      feature.innerHTML='<div class="grid two rules-attack-defense-grid"></div>';
      const sourceGrid=attack.closest('.grid');
      sourceGrid?.after(feature);
    }
    if(!feature.querySelector('.rules-banner')){
      feature.prepend(makeBanner(ASSETS.attackDefense,'Ataque & Defesa'));
    }
    const target=feature.querySelector('.rules-attack-defense-grid');
    if(target){target.append(attack,defense)}
  }

  function decorateCombat(){
    if(!isCombatPage())return;
    document.body.dataset.guidePage='combate';
    ensureMainBanner();
    ensureSectionBanner('rolagens',ASSETS.rolls,'Tipos de Rolagens');
    ensureSectionBanner('turno',ASSETS.turn,'Durante o Turno');
    reorganizeAttackDefense();
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;decorateCombat()});
  }

  new MutationObserver(queue).observe(content,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(queue,0));
  document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>setTimeout(queue,0)));
  queue();
})();
