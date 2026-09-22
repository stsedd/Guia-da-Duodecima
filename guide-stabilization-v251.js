(()=>{
  'use strict';

  const CORE_BASE='https://stsedd.github.io/duodecima-core/';
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  async function getJson(url){
    const response=await fetch(url);
    if(!response.ok)throw new Error(`${response.status} ${response.statusText} · ${url}`);
    return response.json();
  }

  async function loadExtras(){
    const manifest=await getJson(`${CORE_BASE}manifest.json`);
    const q=encodeURIComponent(manifest.contentVersion||manifest.updatedAt||'current');
    const load=async key=>{
      const path=manifest.files?.[key];if(!path)return null;
      return getJson(`${CORE_BASE}${path}?v=${q}`);
    };
    const [equipment,origins,talentPolicies]=await Promise.all([load('equipment'),load('origins'),load('talentPolicies')]);
    return {manifest,equipment,origins,talentPolicies};
  }

  function installStyles(){
    if(document.querySelector('#guide-stabilization-v251-styles'))return;
    const style=document.createElement('style');
    style.id='guide-stabilization-v251-styles';
    style.textContent=`
      .core-rule-note{margin-top:10px;padding:9px 11px;border-left:3px solid var(--red,#b42a37);background:color-mix(in srgb,var(--red,#b42a37) 7%,transparent);font-size:.9em;line-height:1.45}
      .core-rule-note strong{font-weight:800}
      .core-celtic-foreigner{margin-top:14px}
      .core-stacking-note{display:block;margin-top:8px;color:var(--muted,#777);font-size:.78rem;line-height:1.4}
    `;
    document.head.appendChild(style);
  }

  function patchLinks(box){
    box.querySelectorAll('a[href]').forEach(a=>{
      const href=(a.getAttribute('href')||'').replace(/\\/g,'');
      if(href==='sobre-roma/#estrangeiros'||href==='/sobre-roma/#estrangeiros'||href==='sobre-roma#estrangeiros')a.setAttribute('href','#page:roma:estrangeiros');
    });
  }

  function patchCeltic(box,origins){
    const celt=origins?.foreigners?.origins?.find(x=>x.id==='celta');
    const rule=celt?.ruleText||'Personagens celtas estão liberados e podem aparecer como estrangeiros.';
    box.querySelectorAll('p,li').forEach(el=>{
      const text=norm(el.textContent||'');
      if(!text.includes('celt'))return;
      const oldRestriction=/indispon|bloquead|nao\s+(?:pod|est[aá]|sao)|sem\s+acesso/.test(text)&&/(cria|jog|personag|estrangeir|origem)/.test(text);
      if(oldRestriction){el.innerHTML=`<strong>Celtas:</strong> ${esc(rule)}`;el.dataset.coreRule='celta-liberado';}
    });
    const foreign=box.querySelector('#estrangeiros');
    if(foreign&&!foreign.querySelector('.core-celtic-foreigner')){
      const card=document.createElement('article');card.className='paper-card core-celtic-foreigner';card.dataset.coreRule='celta-liberado';
      card.innerHTML=`<h3>Celtas</h3><p>${esc(rule)}</p>`;
      foreign.appendChild(card);
    }
  }

  function findNamedCards(box,name){
    const needle=norm(name);
    const cards=[];
    box.querySelectorAll('h2,h3,h4,strong,b').forEach(head=>{
      if(norm(head.textContent||'').trim()!==needle)return;
      const card=head.closest('article,.material-card,.paper-card,.recipe-card,.craft-card,.subcard,section');
      if(card&&!cards.includes(card))cards.push(card);
    });
    return cards;
  }

  function addRule(card,key,label,text){
    if(!card||!text||card.querySelector(`[data-core-rule="${key}"]`))return;
    const p=document.createElement('p');p.className='core-rule-note';p.dataset.coreRule=key;p.innerHTML=`<strong>${esc(label)}</strong> ${esc(text)}`;card.appendChild(p);
  }

  function patchMaterials(box,equipment){
    const bronze=equipment?.materials?.find(x=>x.id==='bronze-celestial');
    const bronzeRule=bronze?.targeting?.ruleText||'Bronze Celestial não afeta criaturas mortais.';
    for(const card of findNamedCards(box,'Bronze Celestial')){
      card.querySelectorAll('p').forEach(p=>{
        const text=norm(p.textContent||'');
        if(text.includes('mortal')&&!text.includes('nao afeta')&&!text.includes('não afeta'))p.remove();
      });
      addRule(card,'bronze-target','Regra de alvo:',bronzeRule);
    }

    const dust=equipment?.craftingComponents?.find(x=>x.id==='po-de-monstro');
    const dustRule=dust?.sourceRule||'Pó de Monstro só pode ser obtido de monstros mitológicos sujeitos ao ciclo de retorno pelo Tártaro. Criaturas mortais, comuns ou não mitológicas não o geram.';
    for(const card of findNamedCards(box,'Pó de Monstro'))addRule(card,'monster-dust-source','Procedência:',dustRule);

    const crafting=box.querySelector('#materiais,#crafting,#alquimia,#forja');
    if(crafting&&!crafting.querySelector('[data-core-rule="monster-dust-global"]')){
      const note=document.createElement('p');note.className='core-rule-note';note.dataset.coreRule='monster-dust-global';
      note.innerHTML=`<strong>Pó de Monstro:</strong> ${esc(dustRule)}`;
      crafting.appendChild(note);
    }
  }

  function stackingText(mode){
    return ({
      unique:'Único · só pode ser adquirido uma vez.',
      additive:'Acumulativo · cada nova aquisição reaplica e acumula o efeito descrito.',
      parameterized:'Parametrizado · repetições representam novas escolhas; repetir a mesma escolha não gera benefício adicional salvo texto explícito.',
      'non-cumulative-repeat':'Repetível sem acúmulo · uma repetição idêntica não aumenta o efeito.'
    })[mode]||'';
  }
  function patchTalentPolicies(box,policies){
    box.querySelectorAll('[data-talent-id]').forEach(card=>{
      if(card.querySelector('.core-stacking-note'))return;
      const policy=policies?.policies?.[card.dataset.talentId];
      const text=stackingText(policy?.mode);if(!text)return;
      const note=document.createElement('small');note.className='core-stacking-note';note.textContent=text;card.appendChild(note);
    });
  }

  function rebuildSearch(){
    const out=[];
    for(const [page,obj] of Object.entries(window.GUIA_CONTENT||{})){
      const root=document.createElement('div');root.innerHTML=obj.html;
      root.querySelectorAll('.searchable[id]').forEach(el=>{
        const deity=el.closest('.deity-detail');
        const title=el.dataset.title||el.querySelector('h2,h3,summary')?.textContent.trim()||el.id;
        out.push({page,anchor:el.id,deity:deity?.id||null,title,text:el.textContent.replace(/\s+/g,' ').trim()});
      });
    }
    window.GUIA_SEARCH=out;
  }

  function patchContent(extras){
    for(const obj of Object.values(window.GUIA_CONTENT||{})){
      const box=document.createElement('div');box.innerHTML=obj.html;
      patchLinks(box);patchCeltic(box,extras.origins);patchMaterials(box,extras.equipment);patchTalentPolicies(box,extras.talentPolicies);
      obj.html=box.innerHTML;
    }
    rebuildSearch();
  }

  async function init(){
    installStyles();
    let extras={};
    try{extras=await loadExtras()}catch(err){console.warn('[Guia] Extras estruturados do Core indisponíveis; aplicando regras mínimas de estabilização.',err)}
    patchContent(extras);
    if(window.DUODECIMA_CORE_SERVED_FROM_SNAPSHOT&&window.DUODECIMA_CORE_STATE){
      window.DUODECIMA_CORE_STATE.status='fallback';
      window.DUODECIMA_CORE_STATE.source='snapshot';
      if(extras.manifest?.contentVersion)window.DUODECIMA_CORE_STATE.version=extras.manifest.contentVersion;
      const el=document.querySelector('#coreStatus');
      if(el){el.className='core-status is-fallback';el.innerHTML=`<i></i><span>SNAPSHOT ${esc(window.DUODECIMA_CORE_STATE.version||'LOCAL')}</span>`;el.title='Core remoto indisponível; usando o último snapshot canônico sincronizado.';}
    }
  }

  window.DUODECIMA_GUIDE_STABILIZATION_READY=init();
})();
