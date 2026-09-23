(()=>{
  'use strict';

  const CORE_BASE='https://stsedd.github.io/duodecima-core/';
  const MAGIC_FALLBACK={
    circles:[
      {circle:1,minLevel:1,cost:20},{circle:2,minLevel:10,cost:45},{circle:3,minLevel:20,cost:70},
      {circle:4,minLevel:30,cost:95},{circle:5,minLevel:40,cost:120},{circle:6,minLevel:50,cost:150,uses:2},
      {circle:7,minLevel:60,cost:185,uses:2},{circle:8,minLevel:75,cost:225,uses:1},{circle:9,minLevel:90,cost:270,uses:1}
    ],
    awakening:{sacrificialAttributes:['for','des','con'],maxSacrifices:3,sacrificeEnergyEach:25,canReduceBelowZero:true,divineBonusesSacrificable:false,hpProgressionPenalty:2}
  };
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
    const [equipment,origins,talentPolicies,magic]=await Promise.all([load('equipment'),load('origins'),load('talentPolicies'),load('magic')]);
    return {manifest,equipment,origins,talentPolicies,magic:magic||MAGIC_FALLBACK};
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

      /* v2.5.2 · leitura editorial e hierarquia */
      body{font-size:15px;line-height:1.64;background:radial-gradient(circle at 82% 6%,rgba(125,24,43,.07),transparent 34rem),var(--bg)}
      .content{max-width:1280px;padding:42px clamp(24px,4.4vw,64px) 96px}
      .site-footer{max-width:1280px;padding-left:clamp(24px,4.4vw,64px);padding-right:clamp(24px,4.4vw,64px)}
      .section{padding:44px 0 20px;margin-bottom:22px;border-top-color:color-mix(in srgb,var(--line) 72%,transparent)}
      .section-head{align-items:center;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid color-mix(in srgb,var(--line) 64%,transparent)}
      .section-head>div>small,.section>small,.eyebrow{font-size:9px;letter-spacing:.19em}
      .section h2{font-size:clamp(29px,3.2vw,43px);letter-spacing:-.02em;margin:5px 0 8px}
      .section h3{line-height:1.2}
      .section p{line-height:1.72;margin:8px 0 12px}
      .section>p,.section>.section-lead{max-width:74ch}
      .paper-card,.feature,.resource,.ability-card,.rest-card,.warning-card,.money-card,.talent-card,.leader-card,.pantheon-card,.dt-card,.choice-box,.foreign-cta,.discord-disclaimer,.map-panel,.torn-card{border-radius:14px!important;border-color:#342329!important;background:linear-gradient(155deg,#0b090a 0,#050505 72%)!important}
      .paper-card,.feature{padding:21px 22px!important}
      .paper-card h3,.feature h3{font-size:20px;margin-bottom:10px}
      .banner-strip{height:5px;min-height:5px;margin:12px 0 18px;background:linear-gradient(90deg,#a92439 0,#692032 34%,rgba(105,32,50,.16) 72%,transparent)}
      blockquote,.section blockquote{max-width:76ch;padding:13px 16px!important;border-radius:0 8px 8px 0;background:#0b0809!important;line-height:1.65}

      /* Fio da Trama: largura confortável, sem painel gigante vazio */
      .editorial-story{max-width:940px;margin-right:auto}
      .editorial-story.feature,.editorial-story .feature{padding:27px 29px!important;border-left:3px solid #7b2334!important}
      .editorial-story p{max-width:76ch;font-size:15px;line-height:1.75}
      .editorial-story blockquote{margin:16px 0}

      /* Outros panteões: transforma colunas soltas em blocos editoriais */
      .editorial-pantheons .grid,.editorial-pantheons .pantheon-grid{gap:12px!important}
      .editorial-pantheons .grid>article,.editorial-pantheons .pantheon-grid>article{padding:20px;border:1px solid #342329;border-radius:14px;background:linear-gradient(155deg,#0b090a,#050505)}
      .editorial-pantheons h3{font-size:21px}
      .editorial-pantheons p{font-size:14px}

      /* Círculos: 9 cards legíveis em vez de 9 cápsulas espremidas */
      .circle-grid.progression-circles.magic-circle-cards{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:11px!important;padding:0!important;margin-top:18px}
      .circle-grid.progression-circles.magic-circle-cards:before{display:none!important}
      .circle-grid.progression-circles.magic-circle-cards>article.magic-circle-card{min-height:0!important;padding:17px 18px!important;border-radius:14px!important;display:grid;grid-template-columns:58px minmax(0,1fr);align-items:center;gap:14px;text-align:left!important;border:1px solid #3b283f!important;background:linear-gradient(145deg,#0d0910,#050505 72%)!important}
      .magic-circle-orb{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;border:1px solid #79568e;background:radial-gradient(circle at 35% 30%,#24152d,#0a070c 70%);font:700 20px/1 var(--serif);color:#f6eff8;box-shadow:inset 0 0 0 4px #080609}
      .magic-circle-copy{display:grid;grid-template-columns:1fr auto;gap:3px 12px;align-items:end;min-width:0}
      .magic-circle-copy small{grid-column:1/-1;color:#9e8ba4;font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
      .magic-circle-copy b{font:700 18px/1.15 var(--serif);color:#fff}
      .magic-circle-copy em{font-style:normal;font-size:11px;font-weight:800;color:#d1ad68;white-space:nowrap}
      .magic-circle-copy span{grid-column:1/-1;color:#8f838f;font-size:10px;line-height:1.35}

      .core-magic-sacrifice{margin:16px 0 20px;padding:20px 21px;border:1px solid #4d2934;border-radius:14px;background:radial-gradient(circle at 94% 12%,rgba(225,29,52,.09),transparent 30%),linear-gradient(145deg,#10090b,#050505 70%)}
      .core-magic-sacrifice-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px}
      .core-magic-sacrifice-head small{display:block;color:var(--red);font-size:8px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}
      .core-magic-sacrifice-head h3{font-size:23px;margin:3px 0 0}
      .core-magic-sacrifice-head b{font-size:11px;color:#d5b36e;border:1px solid #4d3b26;border-radius:999px;padding:5px 8px;white-space:nowrap}
      .core-magic-sacrifice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
      .core-magic-sacrifice-grid>span{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:11px 12px;border:1px solid #302127;border-radius:10px;background:#060405}
      .core-magic-sacrifice-grid strong{font:700 18px var(--serif)}
      .core-magic-sacrifice-grid i{font-style:normal;color:#d9475c;font-weight:900}
      .core-magic-sacrifice-grid b{color:#d7b66f;font-size:11px}
      .core-magic-sacrifice p{max-width:78ch;margin-bottom:0;color:#b8adb0}

      html[data-theme="light"] .editorial-pantheons .grid>article,html[data-theme="light"] .editorial-pantheons .pantheon-grid>article,html[data-theme="light"] .circle-grid.progression-circles.magic-circle-cards>article.magic-circle-card,html[data-theme="light"] .core-magic-sacrifice{background:linear-gradient(150deg,#fffdf9,#f5eee8)!important;border-color:#d6c3c3!important;color:#45383c!important}
      html[data-theme="light"] .magic-circle-orb{background:#f5edf7!important;border-color:#9e7daf!important;color:#4d3b55!important;box-shadow:inset 0 0 0 4px #fbf7fc!important}
      html[data-theme="light"] .magic-circle-copy b,html[data-theme="light"] .core-magic-sacrifice-grid strong{color:#403338!important}
      html[data-theme="light"] .core-magic-sacrifice-grid>span{background:#fffaf6!important;border-color:#dfd0cb!important}

      @media(max-width:980px){.content{padding-left:24px;padding-right:24px}.circle-grid.progression-circles.magic-circle-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.editorial-story{max-width:none}}
      @media(max-width:620px){body{font-size:14px}.content{padding:20px 13px 72px}.section{padding-top:34px}.section-head{align-items:start}.paper-card,.feature{padding:17px!important}.circle-grid.progression-circles.magic-circle-cards{grid-template-columns:1fr!important}.core-magic-sacrifice-grid{grid-template-columns:1fr}.core-magic-sacrifice-head{align-items:start;flex-direction:column}.editorial-story.feature,.editorial-story .feature{padding:19px!important}}
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

  function findSectionByHeading(box,title){
    const needle=norm(title).trim();
    const heading=[...box.querySelectorAll('h2,h3')].find(h=>norm(h.textContent||'').trim()===needle);
    return heading?.closest('.section,section')||null;
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

  function patchMagic(box,magic){
    const rules=magic||MAGIC_FALLBACK;
    const circles=Array.isArray(rules.circles)&&rules.circles.length?rules.circles:MAGIC_FALLBACK.circles;
    const circleSection=findSectionByHeading(box,'Círculos de Magia');
    if(circleSection){
      const grid=circleSection.querySelector('.circle-grid,.progression-circles');
      if(grid){
        grid.classList.add('circle-grid','progression-circles','magic-circle-cards');
        grid.innerHTML=circles.map(c=>`<article class="magic-circle-card"><span class="magic-circle-orb">${Number(c.circle)}º</span><div class="magic-circle-copy"><small>Nível mínimo</small><b>Nível ${Number(c.minLevel)}+</b><em>${Number(c.cost)} EN</em><span>O nível permite que este círculo comece a ser oferecido; o desbloqueio continua narrativo.</span></div></article>`).join('');
      }

      if(!circleSection.querySelector('.core-magic-sacrifice')){
        const a=rules.awakening||MAGIC_FALLBACK.awakening;
        const energy=Number(a.sacrificeEnergyEach||25),max=Number(a.maxSacrifices||3);
        const labels={for:'FOR',des:'DES',con:'CON'};
        const attrs=(a.sacrificialAttributes||['for','des','con']).map(id=>labels[id]||String(id).toUpperCase());
        const panel=document.createElement('article');panel.className='core-magic-sacrifice';panel.dataset.coreRule='magic-sacrifice';
        panel.innerHTML=`<div class="core-magic-sacrifice-head"><div><small>DESPERTAR MÁGICO</small><h3>Troque atributo físico por Energia</h3></div><b>ATÉ ${max} PONTOS</b></div><div class="core-magic-sacrifice-grid">${attrs.map(label=>`<span><strong>${esc(label)}</strong><i>−1</i><b>+${energy} EN</b></span>`).join('')}</div><p>No despertar, você pode retirar até <strong>${max} pontos no total</strong> entre ${attrs.join(', ')}. Cada ponto retirado concede <strong>+${energy} de Energia máxima</strong>.${a.canReduceBelowZero!==false?' O atributo pode ficar negativo.':''}${a.divineBonusesSacrificable===true?'':' Bônus divinos não podem ser sacrificados.'}</p>`;
        const grid=circleSection.querySelector('.circle-grid,.progression-circles');
        if(grid)grid.before(panel);else circleSection.appendChild(panel);
      }
    }
  }

  function patchEditorialClasses(box){
    box.querySelectorAll('small,.eyebrow').forEach(label=>{
      if(norm(label.textContent||'').trim()!=='fio da trama')return;
      const story=label.closest('article,.feature,.paper-card,.section,section');
      story?.classList.add('editorial-story');
    });
    ['Os celtas','O bronze e as cavernas'].forEach(title=>{
      const head=[...box.querySelectorAll('h2,h3')].find(h=>norm(h.textContent||'').trim()===norm(title));
      head?.closest('article,.feature,.paper-card,.section,section')?.classList.add('editorial-story');
    });
    const pantheons=findSectionByHeading(box,'Outros Panteões');
    pantheons?.classList.add('editorial-pantheons');
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
    for(const [page,obj] of Object.entries(window.GUIA_CONTENT||{})){
      const box=document.createElement('div');box.innerHTML=obj.html;
      patchLinks(box);patchCeltic(box,extras.origins);patchMaterials(box,extras.equipment);patchTalentPolicies(box,extras.talentPolicies);
      if(page==='magia')patchMagic(box,extras.magic);
      patchEditorialClasses(box);
      obj.html=box.innerHTML;
    }
    rebuildSearch();
  }

  async function init(){
    installStyles();
    let extras={magic:MAGIC_FALLBACK};
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
