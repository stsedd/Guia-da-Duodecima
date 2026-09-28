(()=>{
  'use strict';

  const banner=(hires,fallback,alt,cls='rules-banner')=>{
    const source=hires?`<source srcset="${hires}" type="image/avif">`:'';
    return `<figure class="${cls}" data-combat-banner="${alt}"><picture>${source}<img src="${fallback}" alt="${alt}" loading="eager" decoding="async"></picture></figure>`;
  };

  function patchCombat(){
    const page=window.GUIA_CONTENT?.combate;
    if(!page?.html)return;
    const root=document.createElement('div');
    root.innerHTML=page.html;

    const opening=root.querySelector('.rules-opening');
    if(opening&&!root.querySelector('.rules-page-banner--main')){
      opening.insertAdjacentHTML('beforebegin',banner(
        '',
        'assets/visual/banner-combate.webp',
        'Combate em Roma e além',
        'rules-page-banner rules-page-banner--main'
      ));
    }

    const rolls=root.querySelector('#rolagens');
    if(rolls){
      const head=rolls.querySelector('.section-head');
      if(head&&!rolls.querySelector(':scope > .rules-banner')){
        head.insertAdjacentHTML('beforebegin',banner(
          'assets/visual/banner-combate-rolagens-hires.avif',
          'assets/visual/banner-combate.webp',
          'Tipos de Rolagens'
        ));
      }

      const grid=rolls.querySelector(':scope > .grid');
      if(grid&&!rolls.querySelector('.rules-subfeature')){
        const cards=[...grid.querySelectorAll(':scope > .paper-card')];
        const attack=cards.find(card=>(card.querySelector('h3')?.textContent||'').trim()==='Ataque');
        const defense=cards.find(card=>(card.querySelector('h3')?.textContent||'').trim()==='Defesa');
        if(attack&&defense){
          const sub=document.createElement('div');
          sub.className='rules-subfeature';
          sub.innerHTML=`${banner(
            'assets/visual/banner-combate-ataque-defesa-hires.avif',
            'assets/visual/banner-combate.webp',
            'Ataque e Defesa'
          )}<div class="rules-subfeature-title">COMBATE · ATAQUE & DEFESA</div><div class="grid two rules-attack-defense-grid"></div>`;
          const attackGrid=sub.querySelector('.rules-attack-defense-grid');
          attackGrid.append(attack,defense);
          grid.insertAdjacentElement('afterend',sub);
        }
      }
    }

    const turn=root.querySelector('#turno');
    if(turn){
      const head=turn.querySelector('.section-head');
      if(head&&!turn.querySelector(':scope > .rules-banner')){
        head.insertAdjacentHTML('beforebegin',banner(
          'assets/visual/banner-combate-turno-hires.avif',
          'assets/visual/banner-combate.webp',
          'Durante o Turno'
        ));
      }
    }

    page.html=root.innerHTML;
  }

  window.DUODECIMA_GUIDE_COMBAT_LAYOUT_READY=(async()=>{
    try{await window.DUODECIMA_GUIDE_RULES_READY}catch(_){ }
    patchCombat();
  })();
})();
