/* ==========================================================================
   GUIA DA DUODÉCIMA · Dados da ficha
   Lê o Duodécima Core e converte para o formato que o motor da Ficha Oficial usa.
   As funções de conversão, as regras-base (magia, Roma, familiares) e o ajuste do
   Legado Composto foram copiados sem alteração da Ficha Oficial v5.41.0
   (core-bridge-v511.js, magic-v55.js, roma-v55.js, familiars-v55.js, lineage-creation-v515.js).
   Não publica nada em nomes globais do Guia: tudo fica em window.FichaDados.
   ========================================================================== */
(function () {
'use strict';
const DEFAULT_BASE = 'https://stsedd.github.io/duodecima-core/';
const SNAPSHOT_URL = './core-snapshot.json';
const ATTR_LABEL = { for: 'Força', des: 'Destreza', con: 'Constituição', int: 'Inteligência', fe: 'Fé', car: 'Carisma' };
// mapGod() lê state.version para o texto de origem do kit (como na ponte original).
const state = { version: '—' };

// ---------------------------------------------------------------- copiado de core-bridge-v511.js
  const byId = (arr=[]) => new Map(arr.map(x => [x.id, x]));
  async function getJson(url, cache='default'){
    const response = await fetch(url, { cache });
    if(!response.ok) throw new Error(`${response.status} ${response.statusText} · ${url}`);
    return response.json();
  }
  function cleanCoreText(value){
    let raw=String(value ?? '').replace(/\r/g,'').trim();
    if(!raw)return '';
    raw=raw.replace(/https?:\/\/cdn\.discordapp\.com\/emojis\/\S+/gi,'');
    raw=raw.replace(/\s*[ৎ౨꒰◝🤍💔🍒﹒ㄑ✦\[\],.\-–—]*\s*(?:cherry\s+bow|cherry\s+mae)\b[\s\S]*?(?:ícone\s+de\s+cargo|copão\s+de\s+600)[\s\S]*$/i,'');
    raw=raw.replace(/\s*[^\n]{0,140}\[SPQR\]\s*,?\s*(?:ícone|icone)\s+de\s+cargo[\s\S]*$/i,'');
    raw=raw.replace(/\s*[^\n]{0,140}(?:copão|copao)\s+de\s+600[\s\S]*$/i,'');
    raw=raw.replace(/<@!?&?\d+>|<#\d+>/g,'');
    return raw.replace(/[ \t\f\v]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  }
  function cleanCoreNode(value){
    if(typeof value==='string')return cleanCoreText(value);
    if(Array.isArray(value))return value.map(cleanCoreNode);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,cleanCoreNode(v)]));
    return value;
  }
  function skillName(id, skills){ return skills.get(id)?.name || id; }
  function normalizeResource(r){
    if(!r) return null;
    return {
      id:r.id || String(r.name || 'recurso').toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      name:r.name || 'Recurso Divino',
      scope:r.scope || 'personal',
      max:r.max || {type:'described',formula:r.maxFormula || '0'},
      maxFormula:r.maxFormula || r.max?.formula || (r.max?.value != null ? String(r.max.value) : '0'),
      sourceAbilityId:r.sourceAbilityId || null,
      reset:r.reset || null,
      thresholds:Array.isArray(r.thresholds) ? r.thresholds : [],
      sharedKey:r.sharedKey || null
    };
  }
  function mapGod(d, skills){
    const groupMap = {
      'triunviros':'Triunviro',
      'dii-consentis':'Dii Consentis',
      'dii-inferi':'Dii Inferi',
      'alati':'Alati',
      'ventis':'Ventis',
      'numina':'Numina'
    };
    const skillBonuses = {};
    for(const [id, value] of Object.entries(d.skillBonuses || {})) skillBonuses[skillName(id, skills)] = value;
    const out = {
      id:d.id,
      name:d.name,
      group:groupMap[d.group] || d.groupLabel || d.group,
      source:`Duodécima Core · ${state.version}`,
      casting:d.castingAttribute || 'fe',
      hpBase:Number(d.hp?.base ?? 20),
      hpPerDecade:Number(d.hp?.perDecade ?? 5),
      bonuses:{ ...(d.attributeBonuses || {}) },
      skillBonuses,
      grantedSkills:(d.grantedSkills || []).map(id => skillName(id, skills)),
      skillChoice:(d.skillChoices || []).map(id => skillName(id, skills)),
      notes:[...(d.notes || [])]
    };
    out.resources = (d.resources || []).map(normalizeResource).filter(Boolean);
    if(d.resource){
      const legacy = normalizeResource({
        ...d.resource,
        id:d.resource.id || out.resources[0]?.id || String(d.resource.name || 'recurso').toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        max:{type:'described',formula:d.resource.maxFormula || '0'}
      });
      out.resource = legacy;
      if(!out.resources.length) out.resources=[legacy];
    }
    return out;
  }
  function coreTierObject(tiers=[]){
    if(!tiers.length) return null;
    const low = tiers.find(t => Number(t.min) === 0) || tiers.find(t => String(t.id).includes('0-15'));
    const mid = tiers.find(t => Number(t.min) === 16) || tiers.find(t => String(t.id).includes('16-29'));
    const high = tiers.find(t => Number(t.min) >= 30) || tiers.find(t => String(t.id).includes('30'));
    const obj = { low:low?.text || '', mid:mid?.text || '', high:high?.text || '' };
    return (obj.low || obj.mid || obj.high) ? obj : null;
  }
  function mapAbility(a, sourceGodId){
    return {
      id:a.id,
      name:a.name,
      type:a.type === 'passive' ? 'passive' : 'active',
      summary:cleanCoreText(a.summary || ''),
      tiers:coreTierObject(cleanCoreNode(a.tiers || [])),
      extra:cleanCoreText(a.note || ''),
      level:a.level,
      slot:a.slot,
      cost:a.cost,
      isExtra:a.category === 'extra',
      sourceGodId,
      coreBlocks:Array.isArray(a.blocks) ? cleanCoreNode(a.blocks) : [],
      coreTiers:Array.isArray(a.tiers) ? cleanCoreNode(a.tiers) : [],
      coreCategory:a.category || a.type,
      choices:Array.isArray(a.choices) ? cleanCoreNode(a.choices) : [],
      skillEffects:Array.isArray(a.skillEffects) ? cleanCoreNode(a.skillEffects) : []
    };
  }
  function mapAbilities(deities){
    const db = {};
    for(const d of deities.filter(x => x.kitAvailable)){
      db[d.id] = {
        passives:(d.passives || []).map(a => mapAbility(a,d.id)),
        actives:(d.actives || []).map(a => mapAbility(a,d.id))
      };
    }
    return db;
  }
  function mapTalents(core, policies){
    return (core.talents || []).map(t => ({
      id:t.id,
      name:t.name,
      minLevel:Number(t.minLevel || 1),
      description:t.description || '',
      repeatable:t.repeatable !== false,
      params:[...(t.params || [])],
      stacking:policies?.policies?.[t.id] || null,
      automation:t.automation || undefined,
      manual:!!t.manual
    }));
  }
  function mapConditions(core){
    return (core.conditions || []).map(c => ({
      id:c.id,
      name:c.name,
      mechanic:c.description || '',
      ...(c.automation || {})
    }));
  }
  function mapSystem(core){
    const sys = core.system || {};
    const equipment = core.equipment || {};
    return {
      levels:{
        min:Number(sys.levels?.min ?? 1),
        max:Number(sys.levels?.max ?? 100)
      },
      attributes:{
        startingPoints:Number(sys.attributes?.startingPoints ?? 8),
        normalMax:Number(sys.attributes?.normalMax ?? 5),
        increaseLevels:[...(sys.attributes?.increaseLevels || [20,40,60,80,100])]
      },
      conditions:mapConditions(core),
      materials:[...(equipment.materials || [])],
      crafting:equipment.forging || {},
      craftingComponents:[...(equipment.craftingComponents || [])],
      armorTypes:[...(equipment.armorTypes || [])],
      weaponTypes:[...(equipment.weaponTypes || [])],
      proficiencyRanges:[...(sys.proficiency?.ranges || [])],
      expertiseMultiplier:Number(sys.proficiency?.expertiseMultiplier || 2),
      attributeIncreaseLevels:[...(sys.attributes?.increaseLevels || [20,40,60,80,100])],
      talentLevels:[...(sys.talents?.gainLevels || [1,30,60,90])],
      skillTrainingLevels:[...(sys.skills?.trainableUnlockLevels || [21,41,61,81,100])],
      extraSkillLevels:[...(sys.skills?.extraChoiceLevels || [20,40])],
      trainingStakes:[...(sys.training?.stakes || [])],
      energy:{
        base:Number(sys.resources?.energy?.base ?? 100),
        increment:Number(sys.resources?.energy?.increment ?? 25),
        everyLevels:Number(sys.resources?.energy?.everyLevels ?? 5),
        lowThresholdRatio:Number(sys.resources?.energy?.lowThresholdRatio ?? .5),
        lowPenaltyD20:Number(sys.resources?.energy?.lowPenaltyD20 ?? -1),
        atZero:sys.resources?.energy?.atZero || 'Inconsciente'
      },
      sanity:sys.resources?.sanity || null,
      abilityEnergyCosts:[...(sys.abilityEnergyCosts || [])],
      rests:sys.rests || {},
      combat:sys.combat || {},
      exhaustion:sys.exhaustion || {},
      death:sys.death || {},
      lineage:sys.lineage || {},
      magicAwakening:sys.magicAwakening || {},
      removedRules:[...(sys.removedRules || [])]
    };
  }
  function applyAbilityAdjustments(bundle){
    const changes=bundle?.abilityAdjustments?.changes||[];
    const deities=bundle?.gods?.deities||[];
    const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const tierKey=t=>{
      if(t&&t.min!=null){const min=Number(t.min);if(min>=30)return '30+';if(min>=16)return '16-29';return '0-15'}
      const label=norm(t?.id||t?.label||'');
      if(label.includes('30'))return '30+';
      if(label.includes('16')||label.includes('29'))return '16-29';
      return '0-15';
    };
    const replaceDeep=(value,replacements)=>{
      if(typeof value==='string'){
        for(const entry of replacements){
          if(entry.find)value=value.split(String(entry.find)).join(String(entry.replace??''));
        }
        return value.replace(/\.\s*\./g,'.').replace(/ {2,}/g,' ').trim();
      }
      if(Array.isArray(value))return value.map(x=>replaceDeep(x,replacements));
      if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replaceDeep(v,replacements)]));
      return value;
    };
    for(const change of changes){
      const ids=[change.deityId,...(change.deityAliases||[])].map(norm);
      const deity=deities.find(d=>ids.includes(norm(d.id))||ids.includes(norm(d.name)));
      if(!deity)continue;
      const ability=[...(deity.passives||[]),...(deity.actives||[])].find(a=>a.id===change.abilityId||norm(a.name)===norm(change.abilityName));
      if(!ability)continue;
      Object.assign(ability,replaceDeep(ability,change.replaceText||[]));
      if(change.summary!=null)ability.summary=change.summary;
      if(change.note!=null)ability.note=change.note;
      if(change.level!=null)ability.level=change.level;
      if(change.tierOverrides){
        const values=change.tierOverrides;
        if(Array.isArray(ability.tiers)){
          for(const tier of ability.tiers)if(values[tierKey(tier)]!=null)tier.text=values[tierKey(tier)];
        }else if(ability.tiers&&typeof ability.tiers==='object'){
          for(const [name,value] of Object.entries(values))ability.tiers[name==='30+'?'high':name==='16-29'?'mid':'low']=value;
        }else{
          ability.tiers=[{id:'0-15',label:'0–15',min:0,max:15,text:values['0-15']||''},{id:'16-29',label:'16–29',min:16,max:29,text:values['16-29']||''},{id:'30+',label:'30+',min:30,max:null,text:values['30+']||''}];
        }
        if(Array.isArray(ability.blocks)){
          for(const block of ability.blocks){
            if(block.type==='tiers'&&Array.isArray(block.items)){
              for(const tier of block.items)if(values[tierKey(tier)]!=null)tier.text=values[tierKey(tier)];
            }
            if(block.type==='description'&&change.summary!=null)block.text=change.summary;
            if(block.type==='note'&&change.note!=null)block.text=change.note;
          }
          if(change.note!=null&&!ability.blocks.some(b=>b.type==='note'))ability.blocks.push({type:'note',text:change.note});
        }
      }
    }
    return bundle;
  }

// ---------------------------------------------------------------- regras-base copiadas (magic-v55, roma-v55, familiars-v55)
const BASE_MAGIC = {
  circles: [
    {circle:1,minLevel:1,cost:20},
    {circle:2,minLevel:10,cost:45},
    {circle:3,minLevel:20,cost:70},
    {circle:4,minLevel:30,cost:95},
    {circle:5,minLevel:40,cost:120},
    {circle:6,minLevel:50,cost:150,uses:2},
    {circle:7,minLevel:60,cost:185,uses:2},
    {circle:8,minLevel:75,cost:225,uses:1},
    {circle:9,minLevel:90,cost:270,uses:1}
  ],
  cantripCost: 0,
  ritualMinutes: 10,
  startingCantrips: 2,
  startingSpells: 3,
  sacrificeEnergyEach: 25,
  maxSacrifices: 3,
  sacrificialAttributes: ['for','des','con'],
  sacrificeCanGoBelowZero: true,
  divineBonusesSacrificable: false,
  hpProgressionPenalty: 2,
  castingAttributes: ['int','fe','car'],
  highCircleUses: {6:2,7:2,8:1,9:1},
  divineAbilityProgression: {
    magicalCharacterDefaultMaximumStake: 29,
    magicalAffinityDeities: ['jano','libitina','trivia','somnia'],
    additionalAcceptedAliases: ['janus','somnium'],
    exemptPassiveAbilities: true,
    exemptFirstActiveAbilities: 4,
    magicalAffinityMaximumStake: 30
  }
};
const BASE_ROMA = {
  fameBands: [
    {min:-9999,max:-1,name:'Odiado',summary:'Fama negativa.'},
    {min:0,max:24,name:'Sem título de fama',summary:'Ainda não atingiu um marco automático de Fama.'},
    {min:25,max:49,name:'Conhecido',summary:'Marco de Fama alcançado.'},
    {min:50,max:79,name:'Influente',summary:'20% de desconto no Bombilo.'},
    {min:80,max:99,name:'Famoso',summary:'30% de desconto no Bombilo e benefícios de acesso em Nova Roma.'},
    {min:100,max:9999,name:'Rebento de Roma Aeterna',summary:'50% de desconto no Bombilo, bênção, estátua e acesso. O título exige a sequência narrativa de grandes feitos; pontos sozinhos não bastam.'}
  ],
  affinityMarks: [-50,-25,0,30,60,100],
  legionRanks: [
    {id:'',name:'Nenhum / não informado',salary:null},
    {id:'probatio',name:'Probatio',salary:15,detail:'15 denários por semana.'},
    {id:'legionario',name:'Legionário',salary:25,detail:'25 denários.'},
    {id:'optio',name:'Optio',salary:35,detail:'35 denários; +5 por ação de trabalho e +2 estacas em treinamento.'},
    {id:'centuriao',name:'Centurião',salary:50,detail:'50 denários.'},
    {id:'outro',name:'Outro / acima disso',salary:null,detail:'Registre manualmente abaixo.'}
  ],
  religioRanks: [
    {id:'',name:'Nenhum / não informado',salary:null},
    {id:'acolito',name:'Acólito',salary:22,detail:'22 denários.'},
    {id:'sacerdote',name:'Sacerdote',salary:33,detail:'33 denários.'},
    {id:'augure',name:'Áugure',salary:44,detail:'44 denários.'},
    {id:'pontifex',name:'Pontifex',salary:60,detail:'60 denários.'},
    {id:'outro',name:'Outro / acima disso',salary:null,detail:'Registre manualmente abaixo.'}
  ]
};
const BASE_FAMILIARS = {
  types: {
    auxiliar: {
      name: 'Auxiliar',
      hpBase: 15,
      hpPerTen: 5,
      attributePoints: 5,
      skillCount: 1,
      detail: '15 HP base +5 a cada 10 níveis do dono; 5 pontos de atributo; 1 perícia.'
    },
    montaria: {
      name: 'Montaria',
      hpBase: 40,
      hpPerTen: 5,
      attributePoints: 5,
      skillCount: 2,
      detail: '40 HP base +5 a cada 10 níveis do dono; 5 pontos de atributo; 2 perícias; age imediatamente depois do dono.'
    },
    lendario: {
      name: 'Lendário',
      legendary: true,
      actions: 2,
      detail: 'Estatísticas definidas pela staff; 2 ações; uso normalmente limitado a uma missão ou ocasião.'
    }
  }
};

// ---------------------------------------------------------------- carregamento
async function baixarCore(base) {
  const manifest = await getJson(base + 'manifest.json', 'no-cache');
  const q = encodeURIComponent(manifest.contentVersion || manifest.updatedAt || 'current');
  const pares = await Promise.all(Object.entries(manifest.files || {}).map(async ([key, file]) => [key, await getJson(base + file + '?v=' + q, 'default')]));
  return { manifest, ...Object.fromEntries(pares) };
}
function juntarSuplemento(bundle) {
  if (bundle?.godsSupplement?.deities?.length && bundle.gods?.deities) {
    const ids = new Set(bundle.gods.deities.map(d => d.id));
    bundle.gods.deities.push(...bundle.godsSupplement.deities.filter(d => !ids.has(d.id)));
  }
  return bundle;
}
// Mesmo que installCore() da Ficha Oficial, mas devolvendo um objeto em vez de gravar em window.
function montar(bundle, origem) {
  applyAbilityAdjustments(bundle);
  const { manifest, skills, talents, talentPolicies, conditions, gods, system, equipment, origins } = bundle;
  if (!manifest || !skills || !talents || !conditions || !gods || !system || !equipment) throw new Error('Pacote do Core incompleto.');
  state.version = manifest.contentVersion || manifest.updatedAt || 'online';
  const skillMap = byId(skills.skills || []);
  const deityList = (gods.deities || []).filter(d => d.kitAvailable && d.selectable !== false);
  const magicCore = system.magicAwakening || {};
  return {
    versao: manifest.contentVersion || manifest.updatedAt || 'online',
    origem,
    skills: (skills.skills || []).map(s => ({ name: s.name, attr: s.attribute, id: s.id, description: s.description || '' })),
    talents: mapTalents(talents, talentPolicies),
    gods: deityList.map(d => mapGod(d, skillMap)),
    excludedGods: (gods.deities || []).filter(d => !d.kitAvailable || d.selectable === false).map(d => ({ id: d.id, name: d.name, group: d.groupLabel || d.group })),
    abilities: mapAbilities(deityList),
    system: mapSystem({ conditions: conditions.conditions || [], system, equipment }),
    lineage: system.lineage || {},
    origins: origins || {},
    magic: {
      ...BASE_MAGIC,
      maxSacrifices: Number(magicCore.maxSacrifices ?? BASE_MAGIC.maxSacrifices ?? 3),
      sacrificeEnergyEach: Number(magicCore.sacrificeEnergyEach ?? BASE_MAGIC.sacrificeEnergyEach ?? 25),
      sacrificeCanGoBelowZero: magicCore.canReduceBelowZero !== false,
      divineBonusesSacrificable: magicCore.divineBonusesSacrificable === true,
      sacrificialAttributes: [...(magicCore.sacrificialAttributes || ['for', 'des', 'con'])]
    },
    roma: BASE_ROMA,
    familiars: BASE_FAMILIARS,
    core: bundle
  };
}
let promessa = null;
function carregar(base) {
  if (promessa) return promessa;
  promessa = (async () => {
    try {
      return montar(juntarSuplemento(await baixarCore(base || DEFAULT_BASE)), 'core');
    } catch (erroRemoto) {
      console.warn('[Ficha] Core remoto indisponível; usando a cópia do Guia.', erroRemoto);
      const snap = await getJson(SNAPSHOT_URL + '?v=1', 'no-cache');
      return montar(juntarSuplemento(snap), 'snapshot');
    }
  })();
  promessa.catch(() => { promessa = null; });
  return promessa;
}

// ---------------------------------------------------------------- Legado Composto (copiado de lineage-creation-v515.js)
// Na Ficha Oficial essa camada reescreve o deus principal em tempo real; aqui ela atua numa cópia, por personagem.
function prepararParaPersonagem(dados, data) {
  if (data?.lineage?.type !== 'compound') return dados;
  const gods = dados.gods.map(g => (g.id === data.godId ? JSON.parse(JSON.stringify(g)) : g));
  const godById = id => gods.find(g => g.id === id) || null;
  const original = id => {
    const g = dados.gods.find(x => x.id === id);
    return g ? { hpBase: Number(g.hpBase || 0), hpPerDecade: Number(g.hpPerDecade || 0), bonuses: { ...(g.bonuses || {}) }, grantedSkills: [...(g.grantedSkills || [])], skillChoice: [...(g.skillChoice || [])] } : null;
  };
  const uniq=arr=>[...new Set((arr||[]).filter(Boolean))];
  const originKey=data=>`${data?.godId||''}|${data?.lineage?.secondaryGodId||''}`;
  function attributeOptions(mainId,subId,value){
    const rows=[];
    for(const id of [mainId,subId]){
      const src=original(id),g=godById(id);if(!src||!g)continue;
      for(const [attr,bonus] of Object.entries(src.bonuses||{}))if(Number(bonus)===Number(value))rows.push({value:attr,label:`${g.name} · ${ATTR_LABEL[attr]||attr.toUpperCase()} +${value}`});
    }
    return rows;
  }
  function skillOptions(mainId,subId){
    const rows=[];
    for(const id of [mainId,subId]){
      const src=original(id),g=godById(id);if(!src||!g)continue;
      for(const skill of uniq([...(src.grantedSkills||[]),...(src.skillChoice||[])]))rows.push({value:skill,label:`${g.name} · ${skill}`});
    }
    const seen=new Set();return rows.filter(r=>{const k=r.value.toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
  }
  function isValid(value,rows){return !!value&&rows.some(r=>r.value===value)}
  function applyCompoundData(data){
    if(!data?.lineage||data.lineage.type!=='compound')return;
    const main=godById(data.godId),sub=godById(data.lineage.secondaryGodId),a=original(data.godId),b=original(data.lineage.secondaryGodId);
    if(!main||!sub||!a||!b)return;

    const plus2=attributeOptions(data.godId,data.lineage.secondaryGodId,2);
    const plus1=attributeOptions(data.godId,data.lineage.secondaryGodId,1);
    const skills=skillOptions(data.godId,data.lineage.secondaryGodId);
    const sameOrigins=data.lineage.compoundChoiceOrigins===originKey(data);
    const pick2=sameOrigins?(data.lineage.compoundAttributePlus2||''):'';
    const pick1=sameOrigins?(data.lineage.compoundAttributePlus1||''):'';
    const pickSkill=sameOrigins?(data.lineage.compoundSkillChoice||''):'';

    main.hpBase=Math.min(Number(a.hpBase)||0,Number(b.hpBase)||0);
    // O Core define o menor HP inicial; a progressão por década segue o deus principal.
    main.hpPerDecade=Number(a.hpPerDecade)||0;
    main.bonuses={};
    if(isValid(pick2,plus2))main.bonuses[pick2]=(main.bonuses[pick2]||0)+2;
    if(isValid(pick1,plus1))main.bonuses[pick1]=(main.bonuses[pick1]||0)+1;
    main.grantedSkills=isValid(pickSkill,skills)?[pickSkill]:[];
    main.skillChoice=[];
  }
  applyCompoundData(data);
  return { ...dados, gods };
}
function opcoesLegadoComposto(dados, data) {
  const godById = id => dados.gods.find(g => g.id === id) || null;
  const original = id => { const g = godById(id); return g ? { bonuses: { ...(g.bonuses || {}) }, grantedSkills: [...(g.grantedSkills || [])], skillChoice: [...(g.skillChoice || [])] } : null; };
  const uniq=arr=>[...new Set((arr||[]).filter(Boolean))];
  const originKey=data=>`${data?.godId||''}|${data?.lineage?.secondaryGodId||''}`;
  function attributeOptions(mainId,subId,value){
    const rows=[];
    for(const id of [mainId,subId]){
      const src=original(id),g=godById(id);if(!src||!g)continue;
      for(const [attr,bonus] of Object.entries(src.bonuses||{}))if(Number(bonus)===Number(value))rows.push({value:attr,label:`${g.name} · ${ATTR_LABEL[attr]||attr.toUpperCase()} +${value}`});
    }
    return rows;
  }
  function skillOptions(mainId,subId){
    const rows=[];
    for(const id of [mainId,subId]){
      const src=original(id),g=godById(id);if(!src||!g)continue;
      for(const skill of uniq([...(src.grantedSkills||[]),...(src.skillChoice||[])]))rows.push({value:skill,label:`${g.name} · ${skill}`});
    }
    const seen=new Set();return rows.filter(r=>{const k=r.value.toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
  }
  function isValid(value,rows){return !!value&&rows.some(r=>r.value===value)}

  const sub = data?.lineage?.secondaryGodId;
  return { mais2: attributeOptions(data.godId, sub, 2), mais1: attributeOptions(data.godId, sub, 1), pericias: skillOptions(data.godId, sub) };
}

window.FichaDados = { carregar, prepararParaPersonagem, opcoesLegadoComposto, ATTR_LABEL };
})();
