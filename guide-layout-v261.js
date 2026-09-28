(()=>{
  'use strict';

  const content=document.querySelector('#content');
  if(!content)return;

  const ASSETS={
    main:'assets/visual/banner-combate.webp',
    rolls:'assets/visual/banner-combate-rolagens-hires.avif',
    turn:'assets/visual/banner-combate-turno-hires.avif',
    attackDefense:'assets/visual/banner-combate-ataque-defesa-hires.avif'
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
    figure.dataset.guideBanner='v264';
    const img=document.createElement('img');
    img.src=src;
    img.alt=alt;
    img.decoding='async';
    img.loading=cls.includes('--main')?'eager':'lazy';
    img.addEventListener('error',()=>{
      if(img.dataset.fallback!=='1'){
        img.dataset.fallback='1';
        img.src=FALLBACK_MAIN;
      }
    },{once:false});
    figure.appendChild(img);
    return figure;
  }

  function keepSingle(nodes){
    const list=[...nodes];
    if(!list.length)return null;
    const first=list.shift();
    list.forEach(node=>node.remove());
    return first;
  }

  function normalizeExistingDecorations(){
    if(!isCombatPage())return;

    const mains=content.querySelectorAll(':scope > .rules-page-banner--main');
    const main=keepSingle(mains);
    if(main){
      main.dataset.guideBanner='v264';
      const img=main.querySelector('img');
      if(img){img.src=ASSETS.main;img.alt='Combate em Roma e Além';}
    }

    for(const [id,src,alt] of [
      ['rolagens',ASSETS.rolls,'Tipos de Rolagens'],
      ['turno',ASSETS.turn,'Durante o Turno']
    ]){
      const section=content.querySelector(`#${id}`);
      if(!section)continue;
      const direct=[...section.children].filter(el=>el.classList?.contains('rules-banner'));
      const existing=keepSingle(direct);
      if(existing){
        existing.dataset.guideBanner='v264';
        const img=existing.querySelector('img');
        if(img){img.src=src;img.alt=alt;}
      }
    }

    const rolls=content.querySelector('#rolagens');
    if(rolls){
      const features=[...rolls.querySelectorAll(':scope > .rules-subfeature')];
      if(features.length>1){
        const keeper=features[0];
        for(const extra of features.slice(1)){
          extra.querySelectorAll('.paper-card').forEach(card=>keeper.querySelector('.rules-attack-defense-grid')?.append(card));
          extra.remove();
        }
      }
      const feature=rolls.querySelector(':scope > .rules-subfeature');
      if(feature){
        const banners=[...feature.children].filter(el=>el.classList?.contains('rules-banner'));
        const existing=keepSingle(banners);
        if(existing){
          existing.dataset.guideBanner='v264';
          const img=existing.querySelector('img');
          if(img){img.src=ASSETS.attackDefense;img.alt='Ataque & Defesa';}
        }
      }
    }
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
    let banner=[...section.children].find(el=>el.classList?.contains('rules-banner'))||null;
    if(!banner){
      banner=makeBanner(src,alt);
      section.prepend(banner);
    }else{
      banner.dataset.guideBanner='v264';
      const img=banner.querySelector('img');
      if(img){img.src=src;img.alt=alt;}
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
      feature.innerHTML='<div class="rules-subfeature-title">COMBATE · ATAQUE & DEFESA</div><div class="grid two rules-attack-defense-grid"></div>';
      const sourceGrid=attack.closest('.grid');
      sourceGrid?.after(feature);
    }
    if(!feature.querySelector(':scope > .rules-banner')){
      feature.prepend(makeBanner(ASSETS.attackDefense,'Ataque & Defesa'));
    }
    const target=feature.querySelector('.rules-attack-defense-grid');
    if(target){target.append(attack,defense)}
  }

  function decorateCombat(){
    if(!isCombatPage())return;
    document.body.dataset.guidePage='combate';
    normalizeExistingDecorations();
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
