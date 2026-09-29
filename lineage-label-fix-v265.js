(()=>{
  'use strict';

  function normalized(value=''){
    return String(value).replace(/\s+/g,' ').trim().toUpperCase();
  }

  function findDefinitionCard(node,section){
    if(!node)return null;
    let el=node;
    while(el&&el!==section){
      if(el.querySelector?.('h2,h3,h4')&&/Legado (Direto|Composto)/i.test(el.textContent||'')){
        const text=normalized(el.textContent||'');
        if(text.includes('DEUS + LEGADO')||text.includes('LEGADO + LEGADO'))return el;
      }
      el=el.parentElement;
    }
    return node.closest?.('article,.paper-card,.feature,div')||null;
  }

  function fixSection(section){
    if(!section)return;
    const candidates=[...section.querySelectorAll('small,p,.eyebrow,span')];
    const directNode=candidates.find(el=>normalized(el.textContent)==='DEUS + LEGADO');
    const compoundNode=candidates.find(el=>normalized(el.textContent)==='LEGADO + LEGADO');
    const directCard=findDefinitionCard(directNode,section);
    const compoundCard=findDefinitionCard(compoundNode,section);

    const setHeading=(card,label)=>{
      if(!card)return;
      const heading=[...card.querySelectorAll('h2,h3,h4')].find(h=>/Legado (Direto|Composto)/i.test(h.textContent||''));
      if(heading)heading.textContent=label;
    };

    setHeading(directCard,'Legado Direto');
    setHeading(compoundCard,'Legado Composto');

    if(compoundCard){
      compoundCard.querySelectorAll('p,li').forEach(el=>{
        if(/Legados diretos não possuem habilidades 6\+/i.test(el.textContent||'')){
          el.innerHTML=el.innerHTML.replace(/Legados diretos/gi,'Legados compostos');
        }
      });
    }
  }

  function patchSource(){
    const source=window.GUIA_CONTENT?.sistema?.html;
    if(!source)return;
    const box=document.createElement('div');
    box.innerHTML=source;
    fixSection(box.querySelector('#legados'));
    window.GUIA_CONTENT.sistema.html=box.innerHTML;
  }

  function patchRendered(){
    fixSection(document.querySelector('#legados'));
  }

  patchSource();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchRendered,{once:true});
  else patchRendered();
  new MutationObserver(patchRendered).observe(document.body,{childList:true,subtree:true});

  window.DUODECIMA_LINEAGE_LABEL_FIX_READY=Promise.resolve();
})();
