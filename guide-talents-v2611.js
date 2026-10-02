(()=>{
  'use strict';

  const copy='O personagem recebe um talento nos níveis <strong>1, 30, 60 e 90</strong> — portanto já começa com um talento no nível 1. Por padrão, cada talento só pode ser escolhido <strong>uma vez</strong>, a menos que o próprio talento diga o contrário.';

  function patchRoot(root){
    if(!root)return;
    const section=root.querySelector?.('#talentos');
    if(!section)return;
    const feature=section.querySelector('.paper-card.feature');
    const paragraph=feature?.querySelector('p');
    if(paragraph)paragraph.innerHTML=copy;
  }

  function patchStored(){
    const page=window.GUIA_CONTENT?.sistema;
    if(!page?.html)return;
    const box=document.createElement('div');
    box.innerHTML=page.html;
    patchRoot(box);
    page.html=box.innerHTML;
  }

  function patchCurrent(){patchRoot(document.querySelector('#content'))}

  const ready=Promise.resolve(window.DUODECIMA_CORE_READY).catch(()=>null).then(()=>{
    patchStored();
    patchCurrent();
    return true;
  });

  window.DUODECIMA_GUIDE_TALENTS_READY=ready;
})();
