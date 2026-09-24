(()=>{
  'use strict';

  const DEFAULT_CORE='https://stsedd.github.io/duodecima-core';
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function installStyles(){
    if(document.querySelector('#lineage-core-v25-styles'))return;
    const style=document.createElement('style');
    style.id='lineage-core-v25-styles';
    style.textContent=`
      #legados.lineage-core-enhanced{padding-bottom:22px}
      #legados.lineage-core-enhanced .lineage-creation-guide{margin:22px 0 30px;padding:18px;border:1px solid color-mix(in srgb,var(--gold) 55%,var(--line));border-radius:8px;background:linear-gradient(145deg,color-mix(in srgb,var(--panel) 92%,var(--gold) 8%),var(--panel));}
      #legados.lineage-core-enhanced .lineage-creation-guide-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-bottom:13px;margin-bottom:14px;border-bottom:1px solid var(--line2)}
      #legados.lineage-core-enhanced .lineage-creation-guide-head small{display:block;color:var(--gold);font-size:9px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px}
      #legados.lineage-core-enhanced .lineage-creation-guide-head h3{margin:0;font-size:20px}
      #legados.lineage-core-enhanced .lineage-creation-guide-head p{max-width:720px;margin:3px 0 0}
      #legados.lineage-core-enhanced .lineage-creation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      #legados.lineage-core-enhanced .lineage-creation-card{min-width:0;padding:15px 16px;border:1px solid var(--line);border-radius:7px;background:color-mix(in srgb,var(--panel2) 93%,transparent)}
      #legados.lineage-core-enhanced .lineage-creation-card>small{display:block;color:var(--red);font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin-bottom:3px}
      #legados.lineage-core-enhanced .lineage-creation-card h4{font:700 17px/1.15 var(--serif);margin:0 0 10px;color:var(--ink)}
      #legados.lineage-core-enhanced .lineage-creation-rule{display:grid;grid-template-columns:92px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid var(--line2)}
      #legados.lineage-core-enhanced .lineage-creation-rule:first-of-type{border-top:0;padding-top:0}
      #legados.lineage-core-enhanced .lineage-creation-rule b{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
      #legados.lineage-core-enhanced .lineage-creation-rule span{color:var(--muted);line-height:1.55}
      #legados.lineage-core-enhanced .lineage-no-stack{margin:10px 0 0!important;padding:8px 10px;border-left:2px solid var(--red);background:color-mix(in srgb,var(--red) 7%,transparent);color:var(--ink)!important}
      #legados.lineage-core-enhanced :is(.grid.two,.legacy-grid,.lineage-grid,.legacy-columns,.lineage-columns){gap:34px!important;align-items:start}
      #legados.lineage-core-enhanced li{margin:7px 0}
      #legados.lineage-core-enhanced .warning-card{margin-top:22px}
      html[data-theme="light"] #legados.lineage-core-enhanced .lineage-creation-guide{background:linear-gradient(145deg,#fffaf6,#f7efe8);border-color:#c7a966}
      html[data-theme="light"] #legados.lineage-core-enhanced .lineage-creation-card{background:#fffdf9;border-color:#d9cbc5}
      html[data-theme="light"] #legados.lineage-core-enhanced .lineage-creation-rule span{color:#6a5a5f}
      html[data-theme="light"] #legados.lineage-core-enhanced .lineage-creation-card h4{color:#31272a}
      @media(max-width:780px){
        #legados.lineage-core-enhanced .lineage-creation-grid{grid-template-columns:1fr}
        #legados.lineage-core-enhanced .lineage-creation-guide-head{display:block}
        #legados.lineage-core-enhanced .lineage-creation-rule{grid-template-columns:1fr;gap:3px}
        #legados.lineage-core-enhanced :is(.grid.two,.legacy-grid,.lineage-grid,.legacy-columns,.lineage-columns){gap:16px!important}
      }
    `;
    document.head.appendChild(style);
  }

  async function getJSON(url){
    const r=await fetch(url+(url.includes('?')?'&':'?')+'_='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  async function loadLineage(){
    const base=(window.DUODECIMA_CORE_STATE?.baseUrl||DEFAULT_CORE).replace(/\/$/,'');
    const manifest=await getJSON(`${base}/manifest.json`);
    const system=await getJSON(`${base}/${manifest.files?.system||'data/sistema.json'}`);
    return system.lineage||{};
  }

  function ruleRow(label,text){return `<div class="lineage-creation-rule"><b>${esc(label)}</b><span>${esc(text)}</span></div>`;}

  function buildGuide(lineage){
    const direct=lineage.direct||{}, compound=lineage.compound||{};
    const dc=direct.creation||{}, cc=compound.creation||{};
    return `<section class="lineage-creation-guide" aria-label="Regras de criação para Legados">
      <div class="lineage-creation-guide-head"><div><small>NA CRIAÇÃO DE PERSONAGEM</small><h3>Como os bônus iniciais funcionam</h3><p>Escolher um Legado muda a origem do kit, mas não soma automaticamente os benefícios mecânicos das duas divindades.</p></div></div>
      <div class="lineage-creation-grid">
        <article class="lineage-creation-card"><small>${esc(compound.formula||'LEGADO + LEGADO')}</small><h4>${esc(compound.label||'Legado Composto')}</h4>
          ${ruleRow('HP inicial',cc.hp?.text||'Use o menor HP inicial entre as duas divindades envolvidas.')}
          ${ruleRow('Atributos',cc.attributeBonuses?.text||'Escolha um bônus de +2 e um bônus de +1 entre as duas origens.')}
          ${ruleRow('Perícia',cc.skill?.text||'Escolha a perícia inicial entre as duas origens.')}
          <p class="lineage-no-stack"><strong>Importante:</strong> os bônus das duas fichas não são somados.</p>
        </article>
        <article class="lineage-creation-card"><small>${esc(direct.formula||'DEUS + LEGADO')}</small><h4>${esc(direct.label||'Legado Direto')}</h4>
          ${ruleRow('HP inicial',dc.hp?.text||'Use o HP inicial do deus principal.')}
          ${ruleRow('Atributos',dc.attributeBonuses?.text||'Use os bônus de atributos do deus principal.')}
          ${ruleRow('Perícia',dc.skill?.text||'Use a perícia inicial concedida pelo deus principal.')}
        </article>
      </div>
    </section>`;
  }

  function definitionCardFor(node,sec){
    let el=node;
    while(el&&el!==sec){
      const parent=el.parentElement;
      if(parent?.matches?.('.grid.two,.legacy-grid,.lineage-grid,.legacy-columns,.lineage-columns'))return el;
      el=parent;
    }
    return node?.closest?.('article,.paper-card,.feature')||null;
  }

  function patchDefinitionCards(sec){
    const formulaNodes=[...sec.querySelectorAll('small,p,.eyebrow')];
    const formula=node=>String(node.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    const directNode=formulaNodes.find(node=>formula(node)==='DEUS + LEGADO');
    const compoundNode=formulaNodes.find(node=>formula(node)==='LEGADO + LEGADO');
    const directCard=definitionCardFor(directNode,sec);
    const compoundCard=definitionCardFor(compoundNode,sec);
    const rename=(card,label)=>{
      if(!card)return;
      const heading=[...card.querySelectorAll('h2,h3,h4')].find(h=>/Legado (Direto|Composto)/i.test(h.textContent||''));
      if(heading)heading.textContent=label;
    };
    rename(directCard,'Legado Direto');
    rename(compoundCard,'Legado Composto');
    if(compoundCard){
      compoundCard.querySelectorAll('p,li').forEach(el=>{
        if(/Legados diretos não possuem habilidades 6\+/i.test(el.textContent||''))el.innerHTML=el.innerHTML.replace(/Legados diretos/gi,'Legados compostos');
      });
    }
    if(directCard&&compoundCard&&directCard.parentElement===compoundCard.parentElement){
      directCard.parentElement.insertBefore(compoundCard,directCard);
    }
  }

  async function patch(){
    try{await window.DUODECIMA_CORE_READY}catch(_){ }
    try{
      installStyles();
      const lineage=await loadLineage();
      const source=window.GUIA_CONTENT?.sistema?.html;
      if(!source)return;
      const box=document.createElement('div');box.innerHTML=source;
      const sec=box.querySelector('#legados');
      if(!sec)return;
      sec.classList.add('lineage-core-enhanced');
      sec.querySelector('.lineage-creation-guide')?.remove();
      patchDefinitionCards(sec);
      const intro=[...sec.children].find(el=>el.matches?.('.paper-card,.feature,.legacy,.notice'));
      const holder=document.createElement('div');holder.innerHTML=buildGuide(lineage);
      const guide=holder.firstElementChild;
      if(intro)intro.insertAdjacentElement('afterend',guide);else sec.querySelector('.section-head')?.insertAdjacentElement('afterend',guide);
      window.GUIA_CONTENT.sistema.html=box.innerHTML;
    }catch(err){console.warn('[Guia · Legados] Não foi possível aplicar as regras de criação do Core.',err)}
  }

  window.DUODECIMA_LINEAGE_GUIDE_READY=patch();
})();
