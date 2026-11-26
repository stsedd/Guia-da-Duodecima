/* ==========================================================================
   GUIA DA DUODÉCIMA · Motor de regras da ficha
   GERADO AUTOMATICAMENTE a partir de ficha-oficial-duodecima-rpg/app-v511.js
   (Ficha Oficial v5.41.0, 2026-11-25): 227 declarações copiadas sem alteração,
   na ordem original. Só as contas, sem tela: a ficha do Guia desenha por cima.
   Não edite à mão; para atualizar, regenere a partir da Ficha Oficial.
   ========================================================================== */
(function () {
'use strict';
window.FichaMotor = function criarMotor(DADOS, ganchos) {
  ganchos = ganchos || {};
  // "window" local: o código copiado lê os dados por window.DUODECIMA_*; aqui eles vêm do Core já carregado.
  const window = {
    DUODECIMA_GODS: DADOS.gods, DUODECIMA_SKILLS: DADOS.skills, DUODECIMA_ABILITIES: DADOS.abilities,
    DUODECIMA_SYSTEM: DADOS.system, DUODECIMA_TALENTS: DADOS.talents, DUODECIMA_MAGIC: DADOS.magic,
    DUODECIMA_ROMA: DADOS.roma, DUODECIMA_FAMILIARS: DADOS.familiars, DUODECIMA_LINEAGE: DADOS.lineage,
    prompt: function () { return ganchos.prompt ? ganchos.prompt.apply(null, arguments) : null; }
  };
  // Pontas que a ficha do Guia fornece (na Ficha Oficial elas desenham a tela e gravam no navegador).
  function save() { if (ganchos.save) ganchos.save(state); }
  function render() { if (ganchos.render) ganchos.render(); }
  function renderSheet() { render(); }
  function renderCreation() { render(); }
  function notify(msg, tone) { if (ganchos.notify) ganchos.notify(msg, tone); }

  // ---------------------------------------------------------------- código copiado
  const SCHEMA_VERSION = 24;
  const ATTRS = [
    ['for','FOR','Força'],['des','DES','Destreza'],['con','CON','Constituição'],
    ['int','INT','Inteligência'],['fe','FÉ','Fé'],['car','CAR','Carisma']
  ];
  const INVENTORY_CATEGORIES = [
    ['arma-corpo','Arma (corpo a corpo)'],
    ['arma-distancia','Arma (à distância)'],
    ['consumivel','Consumível'],
    ['item-magico','Item mágico'],
    ['municao','Munição'],
    ['outro','Outro']
  ];
  const THEME_PALETTES = {
    red:{label:'Vermelho'}, pink:{label:'Rosa'}, blue:{label:'Azul'}, orange:{label:'Laranja'}, green:{label:'Verde'}, purple:{label:'Roxo'},
    gold:{label:'Dourado'}, silver:{label:'Prata'}, wine:{label:'Vinho'}, teal:{label:'Teal'}, sepia:{label:'Sépia'},
    blush:{label:'Blush'}, peach:{label:'Peach'}, lilac:{label:'Lilac'}, sage:{label:'Sage'}, lemon:{label:'Lemon'},
    mauve:{label:'Mauve'}, coral:{label:'Coral'}, aqua:{label:'Aqua'}, sand:{label:'Sand'}, sky:{label:'Sky'},
    'mono-black':{label:'Mono Black'}, 'mono-white':{label:'Mono White'}
  };
  const ITEM_LIBRARY = [
    {id:'heal-minor',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Cura Menor',effect:'Cura 2d4+2 de HP',notes:'Recupera 2d4+2 de HP.',qty:1,showInDeck:true},
    {id:'heal-major',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Cura Maior',effect:'Cura 4d4+4 de HP',notes:'Recupera 4d4+4 de HP.',qty:1,showInDeck:true},
    {id:'heal-superior',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Cura Superior',effect:'Cura 8d8+8 de HP',notes:'Recupera 8d8+8 de HP.',qty:1,showInDeck:true},
    {id:'porte-fisico',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Porte Físico',effect:'Vantagem em testes de FOR, DES e CON por 1 hora',notes:'Por 1 hora, concede vantagem em testes de Força, Destreza e Constituição. Não afeta ataques nem defesas.',qty:1,showInDeck:true},
    {id:'porte-mental',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Porte Mental',effect:'Vantagem em testes de INT, FÉ e CAR por 1 hora',notes:'Por 1 hora, concede vantagem em testes de Inteligência, Fé e Carisma, incluindo foco, autocontrole e resistências mentais relacionadas.',qty:1,showInDeck:true},
    {id:'bottled-breath',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Bottled Breath',effect:'Respira debaixo d’água por 30 min',notes:'Permite respirar debaixo d’água por 30 minutos.',qty:1,showInDeck:true},
    {id:'oil-slipperiness',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Oil of Slipperiness',effect:'+2 contra agarrões e amarras por 1 hora',notes:'Por 1 hora, concede +2 contra agarrões, amarras e contenções semelhantes.',qty:1,showInDeck:true},
    {id:'res-elemental',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Resistência Elemental',effect:'Resistência temporária a um elemento',notes:'Concede resistência temporária a um tipo de dano elemental escolhido.',qty:1,showInDeck:true,ask:'elemental'},
    {id:'res-veneno',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Resistência a Veneno',effect:'Resistência a veneno e +2 contra envenenamento',notes:'Concede resistência a dano de veneno e +2 em testes contra ser envenenado.',qty:1,showInDeck:true},
    {id:'invisibilidade',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção da Invisibilidade',effect:'Invisível por 1 hora',notes:'Torna o usuário invisível por 1 hora. Ações ofensivas encerram o efeito imediatamente.',qty:1,showInDeck:true},
    {id:'totem-vantagem',group:'Alquimia',kind:'inventory',category:'item-magico',name:'Totem da Vantagem',effect:'1 uso: Ataque, Defesa ou Perícia com vantagem',notes:'Uma vez, permite realizar um teste de Ataque, Defesa ou Perícia com vantagem. Após o uso, perde a magia e se torna um item comum.',qty:1,showInDeck:true},
    {id:'falar-animais',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Falar com Animais',effect:'Comunicação com um tipo de animal por 1 hora',notes:'Permite compreender e se comunicar com um tipo específico de animal por 1 hora.',qty:1,showInDeck:true,ask:'animal'},
    {id:'heroismo',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Heroísmo',effect:'3 turnos: vantagem contra medo + 2 HP/turno',notes:'Por 3 turnos, concede vantagem contra medo, pânico, terror e semelhantes. Nesse período, o usuário recebe 2 HP no início de seus turnos.',qty:1,showInDeck:true},
    {id:'res-charme-medo',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Resistência a Enfeitiçamento ou Medo',effect:'Vantagem contra charme e medo por 1 minuto',notes:'Por 1 minuto, concede vantagem contra medo, pavor, charme, fascinação, manipulação emocional, sedução mágica e efeitos semelhantes.',qty:1,showInDeck:true},
    {id:'velocidade',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção da Velocidade',effect:'+2 em testes de DES e Defesa (não ataques)',notes:'Aumenta temporariamente a velocidade do usuário. Soma +2 em testes de Destreza, incluindo Defesa, desde que não sejam ataques.',qty:1,showInDeck:true},
    {id:'lagrimas-grifo',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Lágrimas de Grifo',effect:'3 turnos: 1d4+1 HP no início do turno',notes:'Por 3 turnos, recupera 1d4+1 HP no início do turno do usuário.',qty:1,showInDeck:true},
    {id:'lagrimas-grifo-maior',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Lágrimas de Grifo Maior',effect:'3 turnos: 2d4+2 HP no início do turno',notes:'Por 3 turnos, recupera 2d4+2 HP no início do turno do usuário.',qty:1,showInDeck:true},
    {id:'lagrimas-grifo-suprema',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Lágrimas de Grifo Suprema',effect:'3 turnos: 3d8+4 HP no início do turno',notes:'Por 3 turnos, recupera 3d8+4 HP no início do turno do usuário.',qty:1,showInDeck:true},
    {id:'res-fisica-exaustao',group:'Alquimia',kind:'inventory',category:'consumivel',name:'Poção de Resistência Física e à Exaustão',effect:'12h: RD 1 física e exaustão reduzida',notes:'Por 12 horas, concede RD 1 contra dano físico. Nesse período, o ônus de efeitos de Exaustão é reduzido pela metade.',qty:1,showInDeck:true},

    {id:'weapon-melee-ferro-aco',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'ferro-aco',equipped:true},
    {id:'weapon-melee-mithril',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'mithril',equipped:true},
    {id:'weapon-melee-bronze-celestial',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'bronze-celestial',equipped:true},
    {id:'weapon-melee-uro',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'uro',equipped:true},
    {id:'weapon-melee-ouro-imperial',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'ouro-imperial',equipped:true},
    {id:'weapon-melee-ferro-estigio',group:'Forja · Armas',kind:'weapon',name:'Arma corpo a corpo',type:'corpo-a-corpo',attr:'for',material:'ferro-estigio',equipped:true},

    {id:'ammo-ferro-aco',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Ferro / Aço',material:'Ferro / Aço',effect:'Bônus de material: +0 em ataques à distância',notes:'Template padrão de munição de Ferro / Aço. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},
    {id:'ammo-mithril',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Mithril',material:'Mithril',effect:'Bônus de material: +1 em ataques à distância',notes:'Template padrão de munição de Mithril. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},
    {id:'ammo-bronze-celestial',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Bronze Celestial',material:'Bronze Celestial',effect:'Bônus de material: +1 em ataques à distância',notes:'Template padrão de munição de Bronze Celestial. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},
    {id:'ammo-uro',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Uro',material:'Uro',effect:'Bônus de material: +2 em ataques à distância',notes:'Template padrão de munição de Uro. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},
    {id:'ammo-ouro-imperial',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Ouro Imperial',material:'Ouro Imperial',effect:'Bônus de material: +3 em ataques à distância',notes:'Template padrão de munição de Ouro Imperial. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},
    {id:'ammo-ferro-estigio',group:'Forja · Munições',kind:'inventory',category:'municao',name:'Munição de Ferro Estígio',material:'Ferro Estígio',effect:'Bônus de material: +3 em ataques à distância',notes:'Template padrão de munição de Ferro Estígio. Ao usar esta munição, aplique o bônus de material correspondente ao ataque à distância.',qty:1,showInDeck:false},

    {id:'armor-ferro-aco',group:'Forja · Armaduras',kind:'armor',name:'Armadura de Ferro / Aço',type:'leve',material:'ferro-aco',equipped:true},
    {id:'armor-mithril',group:'Forja · Armaduras',kind:'armor',name:'Armadura de Mithril',type:'defensiva',material:'mithril',equipped:true},
    {id:'armor-bronze-celestial',group:'Forja · Armaduras',kind:'armor',name:'Armadura de Bronze Celestial',type:'defensiva',material:'bronze-celestial',equipped:true},
    {id:'armor-uro',group:'Forja · Armaduras',kind:'armor',name:'Armadura de Uro',type:'responsiva',material:'uro',equipped:true},

    {id:'shield-ferro-aco',group:'Forja · Escudos',kind:'shield',name:'Escudo de Ferro / Aço',material:'ferro-aco',equipped:true},
    {id:'shield-mithril',group:'Forja · Escudos',kind:'shield',name:'Escudo de Mithril',material:'mithril',equipped:true},
    {id:'shield-bronze-celestial',group:'Forja · Escudos',kind:'shield',name:'Escudo de Bronze Celestial',material:'bronze-celestial',equipped:true},
    {id:'shield-uro',group:'Forja · Escudos',kind:'shield',name:'Escudo de Uro',material:'uro',equipped:true}
  ];
  function normalizeInventoryCategory(id){
    const map={
      'arma':'arma-corpo','arma-magica':'item-magico','armadura':'outro','escudo':'outro',
      'heranca':'outro','reliquia':'item-magico','consumivel':'consumivel','municao':'municao','material':'outro',
      'crafting':'outro','ferramenta':'outro','missao':'outro','magico':'item-magico','geral':'outro','outro':'outro',
      'arma-corpo':'arma-corpo','arma-distancia':'arma-distancia','item-magico':'item-magico'
    };
    return map[id]||'outro';
  }
  const gods = window.DUODECIMA_GODS || [];
  const skills = window.DUODECIMA_SKILLS || [];
  const abilitiesDb = window.DUODECIMA_ABILITIES || {};
  const system = window.DUODECIMA_SYSTEM || {conditions:[],materials:[],armorTypes:[],weaponTypes:[]};
  const CORE_ATTR_START=Math.max(0,Number(system.attributes?.startingPoints ?? 8));
  const CORE_ATTR_MAX=Math.max(1,Number(system.attributes?.normalMax ?? 5));
  const creationPointLimit=()=>state?.roma?.successorOfRebento&&!isMortal()?Number(system.rebentos?.successor?.startingAttributePoints||9):CORE_ATTR_START;
  const talentsDb = window.DUODECIMA_TALENTS || [];
  const magicRules = window.DUODECIMA_MAGIC || {circles:[],castingAttributes:['int','fe','car'],maxSacrifices:3,sacrificeEnergyEach:25,hpProgressionPenalty:2,highCircleUses:{6:2,7:2,8:1,9:1},sacrificeCanGoBelowZero:true};
  const romaRules = window.DUODECIMA_ROMA || {fameBands:[],affinityMarks:[-50,-25,0,30,60,100],legionRanks:[],religioRanks:[]};
  const familiarRules = window.DUODECIMA_FAMILIARS || {types:{auxiliar:{name:'Auxiliar',hpBase:15,hpPerTen:5,attributePoints:5,skillCount:1},montaria:{name:'Montaria',hpBase:40,hpPerTen:5,attributePoints:5,skillCount:2},lendario:{name:'Lendário',legendary:true,actions:2}}};
  function normalizeExclusiveThemeId(value=''){
    return String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64);
  }
  const emptyAttrs = () => ({for:0,des:0,con:0,int:0,fe:0,car:0});
  const defaultDeath = () => ({successes:0,failures:0,stable:false,dead:false,atZero:false,lastRoll:null,returnCount:0});
  const defaultArmor = () => ({equipped:false,name:'Armadura',type:'nenhuma',material:'ferro-aco',resistanceCurrent:3,madeByVulcano:false,imageUrl:'',isHeritage:false,notes:''});
  const defaultShield = () => ({equipped:false,name:'Escudo',material:'ferro-aco',stakes:0,resistanceCurrent:3,madeByVulcano:false,masterTalent:false,imageUrl:'',isHeritage:false,notes:''});
  const defaultTempMods = () => ({rolls:0,defense:0,damageReduction:0});
  const defaultLineage = () => ({type:'normal',namingVersion:2,secondaryGodId:'',structureGodId:'',compoundPassiveReplacements:[],compoundActiveReplacements:[],compoundActiveSlots:[],directPrimaryPassives:[],directSecondaryPassives:[]});
  const defaultMagic = () => ({enabled:false,castingAttr:'fe',circle:1,sacrifices:{for:0,des:0,con:0},spells:[],concentrationSpellId:'',concentrationDamage:0,highCircleUsed:{6:0,7:0,8:0,9:0},notes:''});
  const defaultInventory = () => ({aureus:0,denarius:0,items:[],notes:''});
  const defaultFamiliarBarding = () => ({enabled:false,name:'',type:'',defense:0,material:'',effects:'',equipment:'',imageUrl:''});
  const defaultFamiliar = (type='auxiliar') => ({id:uid('fam'),name:'Novo familiar',species:'',type,active:false,currentHp:null,attributes:emptyAttrs(),skills:[],images:[],origin:'',sourceAbility:'',collapsed:true,abilities:[],barding:defaultFamiliarBarding(),knownVip:false,staffApproved:false,legendaryHpMax:0,legendaryUsed:false,legendaryOccasion:'',companionHpMax:null,companionAttributePoints:5,companionSkillCount:2,companionActions:1,companionAttackBonus:0,companionDamageDie:'1d6',companionNotes:'',notes:''});
  const defaultFamiliars = () => ({entries:[],mountFameClaimed:false,activeSection:'all',notes:''});
  const defaultRoma = () => ({fame:0,fameEntries:[],rebentoApproved:false,affinities:[],affinityEntries:[],legionRank:'',religioRank:'',customRank:'',job:'',jobSalary:0,jobPeriod:'',cohort:'',citizenship:'',legionYears:0,serviceMarks:0,retired:false,titles:[],permissions:[],deeds:[],notes:''});
  const defaultState = () => ({
    schemaVersion:SCHEMA_VERSION,isCreated:false,name:'',player:'',level:1,originType:'divine',devotionGodId:'',originSkillChoice:'',godId:'iuppiter',
    baseAttributes:emptyAttrs(),levelAttributes:emptyAttrs(),attributeExtras:emptyAttrs(),divineSkillChoice:'',initialSkills:[],levelSkillChoices:{20:'',40:''},skillMeta:{},lineage:defaultLineage(),talents:[],talentDraftId:'',magic:defaultMagic(),inventory:defaultInventory(),familiars:defaultFamiliars(),roma:defaultRoma(),
    currentHp:null,currentEnergy:null,currentSanity:100,resourceCurrent:0,resourceValues:{},targetResources:{},
    receivedEffects:[],abilityStakes:{},abilityChoices:{},choiceDetails:{},abilityUses:{},abilityVisuals:{},abilityDeck:[],conditions:[],exhaustion:0,death:defaultDeath(),tempMods:defaultTempMods(),fortunaBlessing:false,fortunaBlessingMonth:'',
    skillTrainings:[],weapons:[],armor:defaultArmor(),shield:defaultShield(),lastRoll:null,
    activeTab:'status',appearance:{mode:'dark',palette:'red',special:'none',exclusiveThemeId:''},history:{summary:'',goals:'',relationships:'',milestones:'',origin:'',age:'',affiliation:'',description:'',tagline:'',birth:'',residence:'',portraitUrl:'',bannerUrl:'',bannerSourceUrl:'',bannerPositionX:50,bannerPositionY:50,bannerScale:100},notes:'',
    createdAt:null,updatedAt:null
  });
  let state = defaultState();
  const MORTAL_PROFILE={
    id:'mortal-nevoa',name:'Mortal da Névoa',group:'Mortal',
    source:'Origem mortal · atravessou a Névoa',
    hpBase:10,hpPerDecade:3,bonuses:{},skillBonuses:{},grantedSkills:[],skillChoice:[],casting:'fe',resources:[],notes:[]
  };
  function isMortal(){return state.originType==='mortal'}
  function hasSheetCasting(){return !isMortal()||!!state.magic?.enabled}
  function sheetCastingAttr(){return isMortal()?(state.magic?.castingAttr||'fe'):god().casting}
  function godById(id){return gods.find(g=>g.id===id)||null}
  function primaryGod(){return isMortal()?MORTAL_PROFILE:(godById(state.godId)||gods[0])}
  function god(){return primaryGod()}
  function baseAbilitySet(id=state.godId){return isMortal()&&id===state.godId?null:(abilitiesDb[id]||null)}
  function isTriumvir(id){return godById(id)?.group==='Triunviro'}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  function sum(obj){return Object.values(obj||{}).reduce((a,b)=>a+(Number(b)||0),0)}
  function talentDef(id){return talentsDb.find(t=>t.id===id)||null}
  function talentCount(id){return (state.talents||[]).filter(t=>t.talentId===id).length}
  function hasTalent(id){return talentCount(id)>0}
  function talentAttributeBonus(k){let total=0;(state.talents||[]).forEach(t=>{if(t.talentId==='aumento-atributo'){if(t.params?.attribute===k)total+=1;if(t.params?.attribute1===k)total+=1;if(t.params?.attribute2===k)total+=1}if(t.talentId==='resiliente'&&t.params?.attribute===k)total+=1});return total}
  function talentGrantedSkills(){const out=[];(state.talents||[]).forEach(t=>{if(t.talentId==='perito')['skill1','skill2','skill3','skill4','skill5'].forEach(k=>{const v=t.params?.[k];if(v)out.push(v)});if(t.talentId==='expert'&&t.params?.skill)out.push(t.params.skill)});return [...new Set(out)]}
  function talentExpertSkills(){const out=[];(state.talents||[]).filter(t=>t.talentId==='expert').forEach(t=>['expertise1','expertise2'].forEach(k=>{const v=t.params?.[k];if(v)out.push(v)}));return [...new Set(out)]}
  function magicSacrifice(k){return state.magic?.enabled&&['for','des','con'].includes(k)?clamp(Number(state.magic?.sacrifices?.[k])||0,0,3):0}
  function ordinaryAttrRaw(k){return (state.baseAttributes[k]||0)+(state.levelAttributes[k]||0)+talentAttributeBonus(k)+(god()?.bonuses?.[k]||0)}
  function attributeExtraBonus(k){return Number(state.attributeExtras?.[k])||0}
  function ordinaryAttrCapped(k){return Math.min(CORE_ATTR_MAX,ordinaryAttrRaw(k))}
  function structuralAttr(k){return ordinaryAttrCapped(k)+attributeExtraBonus(k)-magicSacrifice(k)}
  function basePlusLevel(k){return (state.baseAttributes[k]||0)+(state.levelAttributes[k]||0)+talentAttributeBonus(k)}
  function talentSlotsEarned(){return (system.talentLevels||[1,30,60,90]).filter(n=>state.level>=n).length}
  function standardTalentsUsed(){return (state.talents||[]).filter(t=>!t.extra).length}
  function sanityAttrPenalty(k){
    const s=Number(state.currentSanity ?? 100);
    if(s<=40){if(k==='int'||k==='car')return -5;if(k==='fe')return -3;}
    if(s<=70&&(k==='int'||k==='car'))return -2;
    return 0;
  }
  function effectiveAttr(k){return structuralAttr(k)+sanityAttrPenalty(k)}
  function initialSkillLimit(){return 2+(state.baseAttributes.int||0)}
  function earnedLevelPoints(){return (system.attributeIncreaseLevels||[20,40,60,80,100]).filter(n=>state.level>=n).length}
  function spentLevelPoints(){return sum(state.levelAttributes)}
  function remainingLevelPoints(){return Math.max(0,earnedLevelPoints()-spentLevelPoints())}
  function bp(){const l=state.level,ranges=system.proficiencyRanges||[];if(ranges.length){const row=ranges.find(r=>l>=Number(r.min||0)&&(r.max==null||l<=Number(r.max)));if(row)return Number(row.bonus)||0}if(l<=20)return 1;if(l<=40)return 2;if(l<=60)return 3;if(l<=80)return 4;if(l<=99)return 5;return 6}
  function currentMonthKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
  function fortunaBlessingIsCurrent(){return state.fortunaBlessing===true&&state.fortunaBlessingMonth===currentMonthKey()}
  function rawHpMax(){
    const g=god(),con=structuralAttr('con'),dec=Math.floor(state.level/10);
    const fragility=!isMortal()&&state.magic?.enabled?(Number(magicRules.hpProgressionPenalty)||2):0;
    const perDec=Math.max(0,g.hpPerDecade-fragility),fortunaBonus=fortunaBlessingIsCurrent()?10:0;
    return g.hpBase+con+dec*(perDec+con)+(talentCount('duravel')*con*(1+dec))+fortunaBonus;
  }
  function magicSacrificeTotal(){return ['for','des','con'].reduce((t,k)=>t+magicSacrifice(k),0)}
  function rawEnergyMax(){
    if(isMortal()){
      if(!state.magic?.enabled)return 0;
      const decadeEnergy=Math.floor(state.level/10)*15;
      const sacrificeEnergy=magicSacrificeTotal()*(Number(magicRules.sacrificeEnergyEach)||25);
      return decadeEnergy+sacrificeEnergy;
    }
    const e=system.energy||{},base=Number(e.base??100)+(state.roma?.successorOfRebento?Number(system.rebentos?.successor?.energyBaseBonus??25):0),every=Math.max(1,Number(e.everyLevels??5)),inc=Number(e.increment??25);
    return base+Math.floor(state.level/every)*inc+(state.magic?.enabled?magicSacrificeTotal()*(Number(magicRules.sacrificeEnergyEach)||25):0);
  }
  function hpMax(){return state.exhaustion>=5?Math.max(1,Math.floor(rawHpMax()/2)):rawHpMax()}
  function energyMax(){const raw=rawEnergyMax();return state.exhaustion>=5&&raw>0?Math.max(1,Math.floor(raw/2)):raw}
  function divineResources(){
  if(isMortal())return [];
  const structural=god()?.id||state.godId,originIds=[state.godId];
  if(state.lineage?.type!=='normal'&&state.lineage?.secondaryGodId&&!originIds.includes(state.lineage.secondaryGodId))originIds.push(state.lineage.secondaryGodId);
  const set=effectiveAbilitySet(),effective=[...(set?.passives||[]),...(set?.actives||[])];
  const out=[];
  for(const gid of originIds){
    const g=godById(gid);if(!g)continue;
    let rs=Array.isArray(g.resources)&&g.resources.length?g.resources:(g.resource?[{id:g.resource.id||String(g.resource.name||'recurso').toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:g.resource.name||'Recurso Divino',scope:g.resource.scope||'personal',max:g.resource.max||{type:'described',formula:g.resource.maxFormula||'0'},maxFormula:g.resource.maxFormula||'0'}]:[]);
    for(const original of rs){
      const r={...original,_sourceGodId:gid};
      const linked=!r.sourceAbilityId||effective.some(a=>a.sourceGodId===gid&&a.id===r.sourceAbilityId);
      const ownerPresent=effective.some(a=>a.sourceGodId===gid)||gid===structural;
      if(linked&&ownerPresent&&!out.some(x=>resourceKey(x)===resourceKey(r)))out.push(r);
    }
  }
  return out;
}
  function resourceAbilityStake(resource){
  if(!resource?.sourceAbilityId)return 0;
  const set=effectiveAbilitySet(),owner=resource._sourceGodId||god()?.id||state.godId;
  const a=[...(set?.passives||[]),...(set?.actives||[])].find(x=>x.sourceGodId===owner&&x.id===resource.sourceAbilityId);
  return a?stakesOf(a):0;
}
  function resourceMaxFor(resource){
    if(!resource)return 0;
    const m=resource.max||{},type=m.type||'described';
    if(type==='fixed')return Math.max(0,Number(m.value)||0);
    if(type==='levelFormula'){
      const raw=String(m.formula||resource.maxFormula||'0').toLowerCase(),level=Math.max(1,Number(state.level)||1),base=Number((raw.match(/-?\d+(?:\.\d+)?/)||['0'])[0])||0;
      if(raw.includes('floor')&&raw.includes('/10'))return Math.max(0,base+Math.floor(level/10));
      return Math.max(0,base);
    }
    if(type==='stakeProgression'){
      const v=resourceAbilityStake(resource),row=(m.progression||[]).find(x=>v>=Number(x.min||0)&&(x.max==null||v<=Number(x.max)));
      return Math.max(0,Number(row?.value)||0);
    }
    const raw=String(m.formula||resource.maxFormula||'0'),n=Number((raw.match(/-?\d+(?:\.\d+)?/)||['0'])[0]);
    return Math.max(0,Number.isFinite(n)?n:0);
  }
  function resourceKey(resource){return `${resource?._sourceGodId||god()?.id||state.godId}:${resource?.id||'resource'}`}
  function resourceValue(resource){const key=resourceKey(resource);return clamp(Number(state.resourceValues?.[key])||0,0,resourceMaxFor(resource))}
  function setResourceValue(resource,next){if(!resource)return;state.resourceValues=state.resourceValues||{};state.resourceValues[resourceKey(resource)]=clamp(Number(next)||0,0,resourceMaxFor(resource))}
  function hudResources(){return divineResources().filter(r=>r.scope==='personal'||r.scope==='collective')}
  function abilityResourcesFor(a){return divineResources().filter(r=>r.scope==='ability'&&r.sourceAbilityId===a.id&&(r._sourceGodId||state.godId)===(a.sourceGodId||state.godId))}
  function targetResources(){return divineResources().filter(r=>r.scope==='target')}
  function resourceMax(){const r=hudResources()[0];return r?resourceMaxFor(r):0}
  function divineGranted(){return isMortal()?(state.originSkillChoice?[state.originSkillChoice]:[]):[...(god().grantedSkills||[]),...(state.divineSkillChoice?[state.divineSkillChoice]:[])]}
  function skillAttr(name){return skills.find(s=>s.name===name)?.attr||null}
  function skillId(name){return skills.find(s=>s.name===name)?.id||String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-')}
  function skillNameById(id){return skills.find(s=>s.id===id)?.name||skills.find(s=>skillId(s.name)===id)?.name||id}
  function attrAbbr(k){return ({for:'FOR',des:'DES',con:'CON',int:'INT',fe:'FÉ',car:'CAR'}[k]||String(k||'').toUpperCase())}
  function activeCondition(name){return state.conditions.includes(name)}
  function conditionData(name){return system.conditions.find(c=>c.name===name)}
  function conditionDefenseMod(){return state.conditions.reduce((t,n)=>t+(Number(conditionData(n)?.defenseMod)||0),0)}
  function conditionDexRollMod(){return state.conditions.reduce((t,n)=>t+(Number(conditionData(n)?.dexRollMod)||0),0)}
  function fixedDefense(){const vals=state.conditions.map(n=>conditionData(n)?.fixedDefense).filter(v=>Number.isFinite(v));return vals.length?Math.min(...vals):null}
  function energyRollPenalty(){const max=energyMax();if(max<=0)return 0;const e=system.energy||{},ratio=Number(e.lowThresholdRatio??.5),pen=Number(e.lowPenaltyD20??-1);return state.currentEnergy<=max*ratio?pen:0}
  function exhaustionRollPenalty(){const per=Number(system.exhaustion?.d20PenaltyPerLevel??-2);return per*clamp(Number(state.exhaustion)||0,0,Number(system.exhaustion?.max??6))}
  function receivedBonuses(){return globalThis.FichaEfeitos.bonuses(state)}
  function fortuneSuffix(){const sign=receivedBonuses().fortune;return sign>0?' + 1d4':sign<0?' − 1d4':''}
  function globalD20Penalty(){return energyRollPenalty()+exhaustionRollPenalty()}
  function attrRollConditionPenalty(k){return k==='des'?conditionDexRollMod():0}
  function castAttack(){if(isMortal())return state.magic?.enabled?magicCastBonus():0;const k=god().casting;return effectiveAttr(k)+bp()+(hasTalent('mestre-habilidades')?1:0)+globalD20Penalty()+receivedBonuses().d20+attrRollConditionPenalty(k)}
  function castDT(){if(isMortal())return state.magic?.enabled?magicCastDT():0;return 8+effectiveAttr(god().casting)+bp()}
  function energyValueText(){return energyMax()>0?`${state.currentEnergy}/${energyMax()}`:'—'}
  function castAttackText(){return hasSheetCasting()?`1d20 ${signed(castAttack())}`:'—'}
  function castDtText(){return hasSheetCasting()?String(castDT()):'—'}
  function skillTraining(name){return state.skillTrainings.find(t=>t.name===name)}
  function skillMetaFor(name){
    if(!state.skillMeta||typeof state.skillMeta!=='object')state.skillMeta={};
    if(!state.skillMeta[name])state.skillMeta[name]={proficient:false,expertise:false,source:'extras',detail:''};
    return state.skillMeta[name];
  }
  function basicAutomaticSkillSources(name){
    const out=[];
    if(state.initialSkills.includes(name))out.push('Inicial');
    if(divineGranted().includes(name))out.push(isMortal()?'Origem':'Prole');
    if(talentGrantedSkills().includes(name)||talentExpertSkills().includes(name))out.push('Talento');
    if((skillTraining(name)?.stakes||0)>=30)out.push('Treino');
    return [...new Set(out)];
  }
  function choiceStateKey(a,choice){return `${abilityKey(a)}:choice:${choice.id}`}
  function abilityChoiceDefs(a){
  const explicit=Array.isArray(a?.choices)?a.choices:[];if(explicit.length)return explicit;
  const synthetic=[];
  (a?.skillEffects||[]).forEach((e,i)=>{if(!String(e.type||'').startsWith('choose'))return;synthetic.push({id:e.choiceId||`skill-effect-${i}`,label:e.label||'Escolha de perícia',mode:'persistent',choose:Number(e.choose)||1,allowReplace:false,options:Array.isArray(e.options)?e.options.map(id=>({id,label:skillNameById(id)})):[],dynamicOptions:e.dynamicOptions==='alreadyProficientSkills'?{type:'alreadyProficientSkills'}:e.dynamicOptions})});
  return synthetic;
}
  function choiceLimit(a,choice){
  let limit=Math.max(1,Number(choice?.choose)||1),axis=choice?.progressionAxis||'stakes',progression=Array.isArray(choice?.progression)?choice.progression:[];
  if(progression.length){
    const value=axis==='characterLevel'?state.level:stakesOf(a);
    for(const step of progression){const min=Number(step.min)||0,max=step.max==null?Infinity:Number(step.max);if(value>=min&&value<=max)limit=Math.max(0,Number(step.count)||limit)}
  }
  return limit;
}
  function chosenFor(a,choice){
  const raw=state.abilityChoices?.[choiceStateKey(a,choice)],limit=choiceLimit(a,choice);
  return (Array.isArray(raw)?raw:[]).slice(0,limit);
}
  function choiceOptions(a,choice){
  if(choice?.dynamicOptions?.type==='alreadyProficientSkills'||choice?.dynamicOptions==='alreadyProficientSkills'){
    return skills.filter(sk=>skillIsProficient(sk.name)).map(sk=>({id:sk.id||skillId(sk.name),label:sk.name}));
  }
  return Array.isArray(choice?.options)?choice.options.map(o=>typeof o==='string'?({id:o,label:skillNameById(o)}):o):[];
}
  function choiceDetailKey(a,choice,optId){return `${choiceStateKey(a,choice)}:detail:${optId}`}
  function resourceByKey(key){return divineResources().find(r=>resourceKey(r)===key)||null}
  function activeAbilitySkillEffects(){
    const prof=new Set(),expert=new Set(),sources=new Map(),expertSources=new Map(),conditional=new Map();
    const addSource=(map,name,label)=>{if(!map.has(name))map.set(name,[]);if(label&&!map.get(name).includes(label))map.get(name).push(label)};
    for(const sk of skills){const name=sk.name;if(basicAutomaticSkillSources(name).length||skillMetaFor(name).proficient)prof.add(name);if(talentExpertSkills().includes(name))expert.add(name)}
    const set=effectiveAbilitySet();
    for(const a of [...(set?.passives||[]),...(set?.actives||[])]){
      for(const e of (a.skillEffects||[])){
        const conditionalEffect=String(e.type||'').startsWith('conditional');
        const ids=e.skills||e.options||(e.skill?[e.skill]:[]),fixedNames=ids.map(skillNameById);
        if(conditionalEffect){for(const name of fixedNames){if(!conditional.has(name))conditional.set(name,[]);conditional.get(name).push(`${a.name}: ${e.condition||'condicional'}`)};continue}
        let selected=[];
        if(String(e.type||'').startsWith('choose')){
          const defs=abilityChoiceDefs(a),choice=defs.find(c=>c.id===e.choiceId)||defs[0];
          selected=choice?chosenFor(a,choice).map(skillNameById):[];
        }else selected=fixedNames;
        for(const name of selected){
          const label=a.name;
          if(e.type==='proficiency'||e.type==='chooseProficiency'){prof.add(name);addSource(sources,name,label)}
          else if(e.type==='expertise'||e.type==='chooseExpertise'){prof.add(name);expert.add(name);addSource(sources,name,label);addSource(expertSources,name,label)}
          else if(e.type==='proficiencyOrExpertise'||e.type==='chooseProficiencyOrExpertise'){
            if(prof.has(name)){expert.add(name);addSource(expertSources,name,label)}else{prof.add(name);addSource(sources,name,label)}
          }
        }
      }
    }
    for(const name of expert){if(prof.has(name))continue;prof.add(name)}
    return {prof,expert,sources,expertSources,conditional};
  }
  function automaticSkillSources(name){
    const out=basicAutomaticSkillSources(name),fx=activeAbilitySkillEffects();
    for(const x of (fx.sources.get(name)||[]))if(!out.includes(x))out.push(x);
    for(const x of (fx.expertSources.get(name)||[]))if(!out.includes(x))out.push(x);
    return out;
  }
  function manualSkillSourceLabel(name){
    const m=skillMetaFor(name);if(!m.proficient)return '';
    return ({prole:'Prole',inicial:'Inicial',treino:'Treino','nivel-20':'Nível 20','nivel-40':'Nível 40',talento:'Talento',extras:'Extras'}[m.source]||'Extras');
  }
  function skillSources(name){const out=automaticSkillSources(name);const manual=manualSkillSourceLabel(name);if(manual&&!out.includes(manual))out.push(manual);return out}
  function skillIsProficient(name){const fx=activeAbilitySkillEffects();return fx.prof.has(name)||automaticSkillSources(name).length>0||!!skillMetaFor(name).proficient}
  function skillHasAutomaticExpertise(name){const fx=activeAbilitySkillEffects();return fx.expert.has(name)||talentExpertSkills().includes(name)}
  function skillHasExpertise(name){return skillIsProficient(name)&&(!!skillMetaFor(name).expertise||skillHasAutomaticExpertise(name))}
  function skillValue(name){
    const a=skillAttr(name),base=a?effectiveAttr(a):0,trained=skillIsProficient(name),expertise=skillHasExpertise(name),fixed=god()?.skillBonuses?.[name]||0;
    let cond=attrRollConditionPenalty(a);
    if(activeCondition('Desorientado')&&(name==='Percepção'||name==='Investigação'))cond+=-2;
    const prof=trained?bp()*(expertise?2:1):0;
    return base+prof+fixed+globalD20Penalty()+receivedBonuses().d20+cond;
  }
  function canUseInitialSkill(name){return !divineGranted().includes(name)}
  function abilityKey(a){return `${a.sourceGodId||state.godId}:${a.type}:${a.id}`}
  function abilityVisual(a){const raw=state.abilityVisuals?.[abilityKey(a)]||{};return {imageUrl:String(raw.imageUrl||''),summary:String(raw.summary||'')}}
  function abilityVisualState(key){state.abilityVisuals=state.abilityVisuals||{};if(!state.abilityVisuals[key])state.abilityVisuals[key]={imageUrl:'',summary:''};return state.abilityVisuals[key]}
  function abilityInDeck(a){return (state.abilityDeck||[]).includes(abilityKey(a))}
  function abilityDeckEntries(set=effectiveAbilitySet()){
    const all=[...(set?.passives||[]),...(set?.actives||[])],byKey=new Map(all.map(a=>[abilityKey(a),a]));
    return (state.abilityDeck||[]).slice(0,3).map(k=>byKey.get(k)).filter(Boolean);
  }
  function stakesOf(a){return clamp(Number(state.abilityStakes?.[abilityKey(a)]||0),0,30)}
  function tierName(stakes){return stakes>=30?'30+':stakes>=16?'16–29':'0–15'}
  function tierText(a,stakes){if(!a.tiers)return a.extra||'Sem estacas mecânicas cadastradas.';return stakes>=30?a.tiers.high:stakes>=16?a.tiers.mid:a.tiers.low}
  function material(id){return system.materials.find(m=>m.id===id)||system.materials[0]||{name:'—',attack:0,resistance:0}}
  function materialResistance(item){const m=material(item?.material);if(m.unbreakable)return null;return Math.max(0,Number(m.resistance)||0)+(item?.madeByVulcano?Number(system?.crafting?.divineCraftsmanship?.resistanceBonus??2):0)}
  function armorType(id){return system.armorTypes.find(a=>a.id===id)||system.armorTypes[0]||{name:'—',defense:0,reduction:0}}
  function weaponType(id){return system.weaponTypes.find(w=>w.id===id)||system.weaponTypes[0]||{name:'—',die:8}}
  function armorDefense(){return state.armor?.equipped?(armorType(state.armor.type).defense||0):0}
  function armorReduction(){return state.armor?.equipped?(armorType(state.armor.type).reduction||0):0}
  function shieldDefense(){if(!state.shield?.equipped||Number(state.shield.stakes)<30)return 0;return hasTalent('mestre-escudos')?bp():Math.ceil(bp()/2)}
  function damageReduction(){return receivedBonuses().defense+armorReduction()+(Number(state.tempMods?.damageReduction)||0)}
  function defenseBonus(){const base=hasTalent('bruto')?effectiveAttr('con'):effectiveAttr('des'),defensor=hasTalent('defensor')?2:0,agil=hasTalent('agil')&&skillIsProficient('Agilidade')?Math.ceil(bp()/2):0;return receivedBonuses().defense+base+defensor+agil+armorDefense()+shieldDefense()+(Number(state.tempMods?.defense)||0)+globalD20Penalty()+receivedBonuses().d20+conditionDefenseMod()}
  function initiativeBonus(){return skillValue('Agilidade')}
  function weaponDiceCount(){return state.level>=80?3:state.level>=40?2:1}
  function weaponAttack(w){const a=w.attr||'for',mat=material(w.material),prof=Number(w.stakes)>=30?bp():0;return effectiveAttr(a)+(mat.attack||0)+prof+(Number(w.attackExtra)||0)+globalD20Penalty()+receivedBonuses().d20+attrRollConditionPenalty(a)}
  function weaponDamageFormula(w){const wt=weaponType(w.type),count=weaponDiceCount(),bonus=effectiveAttr(w.attr||'for')+(Number(w.damageExtra)||0);return `${count}d${wt.die}${bonus===0?'':bonus>0?` + ${bonus}`:` - ${Math.abs(bonus)}`}`}
  function skillTrainingSlots(){return (system.skillTrainingLevels||[21,41,61,81,100]).filter(n=>state.level>=n).length}
  function availableSkillTrainingSlots(){return Math.max(0,skillTrainingSlots()-state.skillTrainings.length)}
  function levelSkillUnlocked(n){return state.level>=Number(n)}
  function levelSkillChoicesFromMeta(n){
    const source=`nivel-${Number(n)}`;
    return Object.entries(state.skillMeta||{}).filter(([,m])=>m?.proficient&&m?.source===source).map(([name])=>name);
  }
  function levelSkillChoice(n){return levelSkillChoicesFromMeta(n)[0]||''}
  function sanityBand(){
    const s=Number(state.currentSanity ?? 100);
    if(s<=0)return {name:'Perdido',cls:'danger-text',text:'Sanidade 0: perda permanente do personagem.'};
    if(s<=20)return {name:'À Beira da Loucura',cls:'warn-text',text:'Falha automática contra efeitos que causariam Abalado/Apavorado. No início do turno, teste de Fé DT 15; em falha, não pode agir. Mantém as penalidades mentais do estágio anterior.'};
    if(s<=40)return {name:'Abalado',cls:'warn-text',text:'−5 INT/CAR e −3 FÉ. Ataques que exploram medo causam dano dobrado de Sanidade.'};
    if(s<=70)return {name:'Instável',cls:'warn-text',text:'−2 INT/CAR e em testes ligados a lógica/concentração.'};
    return {name:'Estável',cls:'good-text',text:'Sem penalidade de Sanidade.'};
  }
  function energyBand(){
    if(energyMax()<=0)return {name:'Sem Energia',cls:'muted',text:isMortal()?'Mortais sem reserva mágica não possuem Energia.':'Sem reserva de Energia disponível.'};
    if(state.currentEnergy<=0)return {name:'0 EN · Inconsciente',cls:'danger-text',text:'Energia 0 causa inconsciência imediata.'};
    if(state.currentEnergy<=energyMax()/2)return {name:'≤50% · Desgastado',cls:'warn-text',text:'−1 em todas as rolagens enquanto a Energia estiver em metade ou menos.'};
    return {name:'Energia estável',cls:'good-text',text:'Sem penalidade por Energia.'};
  }
  function uid(prefix='id'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
  function migrate(data){
    const out=Object.assign(defaultState(),data||{});
    out.schemaVersion=SCHEMA_VERSION;
    out.originType=data?.originType==='mortal'?'mortal':'divine';
    out.devotionGodId=typeof data?.devotionGodId==='string'?data.devotionGodId:'';
    out.originSkillChoice=typeof data?.originSkillChoice==='string'?data.originSkillChoice:'';
    out.abilityVisuals=data?.abilityVisuals&&typeof data.abilityVisuals==='object'?Object.fromEntries(Object.entries(data.abilityVisuals).filter(([k])=>typeof k==='string').map(([k,v])=>[k,{imageUrl:typeof v?.imageUrl==='string'?v.imageUrl:'',summary:typeof v?.summary==='string'?v.summary.slice(0,180):''}])):{};
    out.receivedEffects=globalThis.FichaEfeitos.normalize(data?.receivedEffects);
    out.abilityDeck=Array.isArray(data?.abilityDeck)?[...new Set(data.abilityDeck.filter(x=>typeof x==='string'))].slice(0,3):[];
    out.equipmentDeckOrder=Array.isArray(data?.equipmentDeckOrder)?[...new Set(data.equipmentDeckOrder.filter(k=>typeof k==='string'&&k.length<180))].slice(0,300):[];
    out.fortunaBlessing=out.fortunaBlessing===true;
    const fortunaMonth=currentMonthKey();
    if(out.fortunaBlessing&&out.fortunaBlessingMonth&&out.fortunaBlessingMonth!==fortunaMonth)out.fortunaBlessing=false;
    out.fortunaBlessingMonth=out.fortunaBlessing?fortunaMonth:'';
    const normalizeAttrLayer=(src)=>{const outAttrs=emptyAttrs();for(const k of Object.keys(outAttrs)){const n=Number(src?.[k]);outAttrs[k]=clamp(Number.isFinite(n)?Math.abs(n):0,0,5)}return outAttrs};
    // Atributos-base e pontos de nível nunca são negativos. Versões antigas puderam persistir o sinal invertido em alguns saves;
    // normalizamos o valor absoluto aqui para que, por exemplo, -5 volte a ser +5 em vez de contaminar a ficha.
    out.baseAttributes=normalizeAttrLayer(data?.baseAttributes||{});
    out.levelAttributes=normalizeAttrLayer(data?.levelAttributes||{});
    out.attributeExtras=emptyAttrs();
    for(const k of Object.keys(out.attributeExtras)){const n=Number(data?.attributeExtras?.[k]);out.attributeExtras[k]=clamp(Number.isFinite(n)?n:0,-10,10)}
    out.levelSkillChoices=Object.assign({20:'',40:''},data?.levelSkillChoices||{});
    out.skillMeta={};
    if(data?.skillMeta&&typeof data.skillMeta==='object')for(const [name,meta] of Object.entries(data.skillMeta))out.skillMeta[name]=Object.assign({proficient:false,expertise:false,source:'extras',detail:''},meta||{});
    for(const n of [20,40]){const name=data?.levelSkillChoices?.[n];if(name){out.skillMeta[name]=Object.assign({proficient:true,expertise:false,source:`nivel-${n}`,detail:''},out.skillMeta[name]||{}, {proficient:true,source:`nivel-${n}`})}}
    out.levelSkillChoices={20:'',40:''};
    const legacyLineageNaming=!!data?.lineage&&Number(data.lineage.namingVersion||0)<2;
    out.lineage=Object.assign(defaultLineage(),data?.lineage||{});
    if(legacyLineageNaming){
      if(out.lineage.type==='compound')out.lineage.type='direct';
      else if(out.lineage.type==='direct')out.lineage.type='compound';
    }
    out.lineage.namingVersion=2;
    out.lineage.compoundPassiveReplacements=Array.isArray(data?.lineage?.compoundPassiveReplacements)?data.lineage.compoundPassiveReplacements:[];
    out.lineage.compoundActiveSlots=Array.isArray(data?.lineage?.compoundActiveSlots)?data.lineage.compoundActiveSlots.map(Number).filter(n=>n>=1&&n<=5).slice(0,2):[];
    out.lineage.compoundActiveReplacements=Array.isArray(data?.lineage?.compoundActiveReplacements)?data.lineage.compoundActiveReplacements.slice(0,2):[];
    // Migra a seleção antiga por “slot igual” para o novo modelo de substituição livre por nível.
    if(!out.lineage.compoundActiveReplacements.length&&out.lineage.compoundActiveSlots.length){
      const mainSet=abilitiesDb[out.godId],subSet=abilitiesDb[out.lineage.secondaryGodId];
      out.lineage.compoundActiveReplacements=out.lineage.compoundActiveSlots.map(slot=>{const idx=slot-1;return {primaryIndex:idx,secondaryId:subSet?.actives?.[idx]?.id||''}}).filter(r=>mainSet?.actives?.[r.primaryIndex]).slice(0,2);
    }
    out.lineage.directPrimaryPassives=Array.isArray(data?.lineage?.directPrimaryPassives)?data.lineage.directPrimaryPassives:[];
    out.lineage.directSecondaryPassives=Array.isArray(data?.lineage?.directSecondaryPassives)?data.lineage.directSecondaryPassives:[];
    if(out.originType==='mortal')out.lineage=defaultLineage();
    out.magic=Object.assign(defaultMagic(),data?.magic||{});
    out.magic.sacrifices=Object.assign({for:0,des:0,con:0},data?.magic?.sacrifices||{});
    ['for','des','con'].forEach(k=>out.magic.sacrifices[k]=clamp(Number(out.magic.sacrifices[k])||0,0,3));
    out.magic.circle=clamp(Number(out.magic.circle)||1,1,9);
    out.magic.spells=Array.isArray(data?.magic?.spells)?data.magic.spells.map(sp=>Object.assign({id:uid('spell'),name:'',circle:1,components:{v:false,s:false,m:false},concentration:false,ritual:false,source:'',notes:''},sp,{components:Object.assign({v:false,s:false,m:false},sp?.components||{})})):[];
    out.magic.highCircleUsed=Object.assign({6:0,7:0,8:0,9:0},data?.magic?.highCircleUsed||{});
    [6,7,8,9].forEach(c=>out.magic.highCircleUsed[c]=Math.max(0,Number(out.magic.highCircleUsed[c])||0));
    out.inventory=Object.assign(defaultInventory(),data?.inventory||{});
    out.inventory.aureus=Math.max(0,Number(out.inventory.aureus)||0);
    out.inventory.denarius=Math.max(0,Number(out.inventory.denarius)||0);
    out.inventory.items=Array.isArray(data?.inventory?.items)?data.inventory.items.map(it=>Object.assign({id:uid('item'),name:'Item',qty:1,category:'outro',material:'',rune:'',effect:'',notes:'',imageUrl:'',showInDeck:false,isHeritage:false,attackAttr:'for',attackBonus:0,damage:'',range:''},it,{category:normalizeInventoryCategory(it?.category),qty:Math.max(0,Number(it?.qty)||0),showInDeck:!!it?.showInDeck,isHeritage:!!(it?.isHeritage || it?.category==='heranca'),attackBonus:Number(it?.attackBonus)||0,effect:String(it?.effect||it?.rune||'')})):[];
    out.inventory.notes=typeof data?.inventory?.notes==='string'?data.inventory.notes:(typeof data?.crafting?.notes==='string'?data.crafting.notes:'');
    out.familiars=Object.assign(defaultFamiliars(),data?.familiars||{});
    out.familiars.mountFameClaimed=!!out.familiars.mountFameClaimed;
    out.familiars.entries=Array.isArray(data?.familiars?.entries)?data.familiars.entries.map(f=>{
      const type=['auxiliar','montaria','lendario','companion','narrativo'].includes(f?.type)?f.type:'auxiliar';
      const x=Object.assign(defaultFamiliar(type),f||{},{type});
      x.attributes=emptyAttrs();for(const k of Object.keys(x.attributes))x.attributes[k]=clamp(Number(f?.attributes?.[k])||0,0,5);
      x.skills=Array.isArray(f?.skills)?f.skills.filter(Boolean).slice(0,type==='auxiliar'?1:type==='montaria'?2:type==='companion'?Math.max(0,Math.min(26,Number(f?.companionSkillCount)??2)):6):[];
      x.currentHp=f?.currentHp==null?null:Math.max(0,Number(f.currentHp)||0);x.legendaryHpMax=Math.max(0,Number(f?.legendaryHpMax)||0);
      x.species=String(f?.species||'');
      x.images=Array.from({length:6},(_,i)=>typeof f?.images?.[i]==='string'?f.images[i]:'').filter(Boolean);x.origin=String(f?.origin||'');x.sourceAbility=String(f?.sourceAbility||'');x.collapsed=f?.collapsed!==false;
      x.abilities=Array.isArray(f?.abilities)?f.abilities.slice(0,24).map(a=>({id:a?.id||uid('famab'),name:String(a?.name||'Habilidade'),type:a?.type==='ativa'?'ativa':'passiva',description:String(a?.description||'')})):[];
      x.barding=Object.assign(defaultFamiliarBarding(),f?.barding||{});
      x.barding.enabled=!!x.barding.enabled;x.barding.defense=Math.max(0,Number(x.barding.defense)||0);x.barding.name=String(x.barding.name||'');x.barding.type=String(x.barding.type||'');x.barding.material=String(x.barding.material||'');x.barding.effects=String(x.barding.effects||'');x.barding.equipment=String(x.barding.equipment||'');x.barding.imageUrl=String(x.barding.imageUrl||'');
      x.active=!!f?.active;x.knownVip=!!f?.knownVip;x.staffApproved=!!f?.staffApproved;x.legendaryUsed=!!f?.legendaryUsed;return x;
    }):[];
    out.roma=Object.assign(defaultRoma(),data?.roma||{});
    out.roma.fame=Number(out.roma.fame)||0;
    out.roma.fameEntries=Array.isArray(data?.roma?.fameEntries)?data.roma.fameEntries.map(x=>Object.assign({id:uid('fame'),source:'',discordLink:'',amount:0,notes:''},x,{discordLink:x?.discordLink||'',amount:Number(x?.amount)||0})):[];
    if(!out.roma.fameEntries.length&&out.roma.fame)out.roma.fameEntries.push({id:uid('fame'),source:'Saldo migrado da ficha anterior',discordLink:'',amount:out.roma.fame,notes:''});
    out.roma.rebentoApproved=!!out.roma.rebentoApproved;
    out.roma.affinities=Array.isArray(data?.roma?.affinities)?data.roma.affinities.map(a=>Object.assign({id:uid('aff'),godId:'',value:0,notes:''},a,{value:clamp(Number(a?.value)||0,-100,100)})):[];
    out.roma.affinityEntries=Array.isArray(data?.roma?.affinityEntries)?data.roma.affinityEntries.map(x=>Object.assign({id:uid('affentry'),target:'',source:'',discordLink:'',amount:0,notes:''},x,{discordLink:x?.discordLink||'',amount:Number(x?.amount)||0})):[];
    if(!out.roma.affinityEntries.length&&out.roma.affinities.length){for(const a of out.roma.affinities){const gn=godById(a.godId)?.name||a.godId||'Afinidade migrada';out.roma.affinityEntries.push({id:uid('affentry'),target:gn,source:'Registro migrado da ficha anterior',discordLink:'',amount:Number(a.value)||0,notes:a.notes||''})}}
    out.roma.jobSalary=Math.max(0,Number(out.roma.jobSalary)||0);
    out.roma.legionYears=Math.max(0,Number(out.roma.legionYears)||0);out.roma.serviceMarks=Math.max(0,Number(out.roma.serviceMarks)||0);out.roma.retired=!!out.roma.retired;
    out.roma.titles=Array.isArray(out.roma.titles)?out.roma.titles.map(x=>typeof x==='string'?{id:uid('title'),name:x,source:'',notes:''}:Object.assign({id:uid('title'),name:'',source:'',notes:''},x)):[];
    out.roma.permissions=Array.isArray(out.roma.permissions)?out.roma.permissions.map(x=>typeof x==='string'?{id:uid('perm'),name:x,source:'',notes:''}:Object.assign({id:uid('perm'),name:'',source:'',notes:''},x)):[];
    out.roma.deeds=Array.isArray(out.roma.deeds)?out.roma.deeds.map(x=>typeof x==='string'?{id:uid('deed'),name:x,fame:0,notes:''}:Object.assign({id:uid('deed'),name:'',fame:0,notes:''},x,{fame:Number(x?.fame)||0})):[];
    out.talents=Array.isArray(data?.talents)?data.talents.map(t=>typeof t==='string'?{id:uid('talent'),talentId:t,extra:false,params:{},notes:''}:Object.assign({id:uid('talent'),talentId:'',extra:false,params:{},notes:''},t)) : [];
    out.abilityStakes=Object.assign({},data?.abilityStakes||{});
    out.resourceValues=Object.assign({},data?.resourceValues||{});
    out.targetResources=(data?.targetResources&&typeof data.targetResources==='object')?JSON.parse(JSON.stringify(data.targetResources)):{};
    out.abilityChoices=(data?.abilityChoices&&typeof data.abilityChoices==='object')?JSON.parse(JSON.stringify(data.abilityChoices)):{};
    out.choiceDetails=Object.assign({},data?.choiceDetails||{});
    out.abilityUses=Object.assign({},data?.abilityUses||{});
    const migrateGodId=out.godId,migrateGod=godById(migrateGodId),firstLegacy=(migrateGod?.resources||[])[0]||migrateGod?.resource;if(firstLegacy&&Object.keys(out.resourceValues).length===0&&Number(data?.resourceCurrent)>0){const rid=firstLegacy.id||String(firstLegacy.name||'resource').toLowerCase().replace(/[^a-z0-9]+/g,'-');out.resourceValues[`${migrateGodId}:${rid}`]=Number(data.resourceCurrent)||0;}
    out.conditions=Array.isArray(data?.conditions)?data.conditions:[];
    out.exhaustion=clamp(Number(data?.exhaustion)||0,0,6);
    out.death=Object.assign(defaultDeath(),data?.death||{});
    out.tempMods=Object.assign(defaultTempMods(),data?.tempMods||{});
    out.skillTrainings=Array.isArray(data?.skillTrainings)?data.skillTrainings.map(t=>({id:t.id||uid('skill'),name:t.name||'',stakes:clamp(Number(t.stakes)||0,0,30)})):[];
    out.weapons=Array.isArray(data?.weapons)?data.weapons.map(w=>Object.assign({id:uid('weapon'),name:'Arma',type:'corpo-a-corpo',attr:'for',material:'ferro-aco',stakes:0,resistanceCurrent:3,madeByVulcano:false,attackExtra:0,damageExtra:0,equipped:true,imageUrl:'',isHeritage:false,notes:''},w,{isHeritage:!!w?.isHeritage,madeByVulcano:!!w?.madeByVulcano})):[];
    out.armor=Object.assign(defaultArmor(),data?.armor||{});
    out.shield=Object.assign(defaultShield(),data?.shield||{});
    out.activeTab=(data?.activeTab==='abilities'?'combat':(['status','combat','inventory','familiars','roma','magic','history','notes'].includes(data?.activeTab)?data.activeTab:(data?.activeTab==='crafting'?'inventory':'status')));
    const legacyTheme=data?.theme||'';
    const legacyAppearance=legacyTheme==='parchment'?{mode:'light',palette:'sepia',special:'none'}:legacyTheme==='obsidian'?{mode:'dark',palette:'blue',special:'none'}:legacyTheme==='emerald'?{mode:'dark',palette:'green',special:'none'}:{mode:'dark',palette:'red',special:'none'};
    out.appearance=Object.assign(legacyAppearance,data?.appearance||{});
    out.appearance.mode=out.appearance.mode==='light'?'light':'dark';
    out.appearance.palette=THEME_PALETTES[out.appearance.palette]?out.appearance.palette:'red';
    out.appearance.special=['fire','snow'].includes(out.appearance.special)?out.appearance.special:'none';
    out.appearance.exclusiveThemeId=normalizeExclusiveThemeId(out.appearance.exclusiveThemeId||'');
    out.history=Object.assign({summary:'',goals:'',relationships:'',milestones:'',origin:'',age:'',affiliation:'',description:'',tagline:'',birth:'',residence:'',portraitUrl:'',bannerUrl:'',bannerSourceUrl:'',bannerPositionX:50,bannerPositionY:50,bannerScale:100},data?.history||{});
    if(!out.history.bannerSourceUrl&&out.history.bannerUrl)out.history.bannerSourceUrl=out.history.bannerUrl;
    out.history.bannerPositionX=clamp(Number(out.history.bannerPositionX)||50,0,100);
    out.history.bannerPositionY=clamp(Number(out.history.bannerPositionY)||50,0,100);
    out.history.bannerScale=clamp(Number(out.history.bannerScale)||100,100,220);
    out.notes=typeof data?.notes==='string'?data.notes:'';
    return out;
  }
  function syncCurrentCaps(){
    const fortunaMonth=currentMonthKey();
    if(state.fortunaBlessing&&state.fortunaBlessingMonth&&state.fortunaBlessingMonth!==fortunaMonth){state.fortunaBlessing=false;state.fortunaBlessingMonth='';}
    else if(state.fortunaBlessing&&!state.fortunaBlessingMonth)state.fortunaBlessingMonth=fortunaMonth;
    const h=hpMax(),e=energyMax();
    if(state.currentHp==null)state.currentHp=h;else state.currentHp=clamp(Number(state.currentHp)||0,0,h);
    if(state.currentEnergy==null)state.currentEnergy=e;else state.currentEnergy=clamp(Number(state.currentEnergy)||0,0,e);
    state.currentSanity=clamp(Number(state.currentSanity ?? 100),0,100);
    state.resourceValues=state.resourceValues||{};
    for(const r of divineResources())setResourceValue(r,resourceValue(r));
    const legacy=hudResources()[0];state.resourceCurrent=legacy?resourceValue(legacy):0;
    state.targetResources=state.targetResources||{};
    for(const r of targetResources())for(const t of (state.targetResources[resourceKey(r)]||[]))t.current=clamp(Number(t.current)||0,0,resourceMaxFor(r));
    (state.familiars?.entries||[]).forEach(f=>{const mx=familiarHpMax(f);if(f.currentHp==null)f.currentHp=mx;else f.currentHp=clamp(Number(f.currentHp)||0,0,mx)});
  }
  function setHp(next,{countReturn=true}={}){
    const old=Number(state.currentHp)||0;
    if(state.death.dead&&next>0){notify('O personagem está marcado como morto. Use “Intervenção narrativa” para restaurá-lo.');return;}
    state.currentHp=clamp(Number(next)||0,0,hpMax());
    if(old>0&&state.currentHp===0){state.death.successes=0;state.death.failures=0;state.death.stable=false;state.death.dead=false;state.death.atZero=true;state.death.lastRoll=null;}
    if(old===0&&state.currentHp>0&&state.death.atZero){if(countReturn)state.death.returnCount=(state.death.returnCount||0)+1;state.death.successes=0;state.death.failures=0;state.death.stable=false;state.death.dead=false;state.death.atZero=false;state.death.lastRoll=null;}
  }
  function setEnergy(next){state.currentEnergy=clamp(Number(next)||0,0,energyMax())}
  function setSanity(next){state.currentSanity=clamp(Number(next)||0,0,100)}
  function secondaryGod(){return isMortal()?null:godById(state.lineage?.secondaryGodId)}
  function eligibleLegacyGods(){return isMortal()?[]:gods.filter(g=>g.id!==state.godId&&!isTriumvir(g.id))}
  function resetLineage(type='normal'){state.lineage=defaultLineage();state.lineage.type=type;if(type!=='normal'&&eligibleLegacyGods()[0])state.lineage.secondaryGodId=eligibleLegacyGods()[0].id;if(type==='direct')state.lineage.structureGodId=state.godId;if(type==='compound')initializeDirectSelections()}
  function initializeDirectSelections(){const a=baseAbilitySet(state.godId),b=baseAbilitySet(state.lineage?.secondaryGodId);if(a)state.lineage.directPrimaryPassives=a.passives.slice(0,4).map(x=>x.id);if(b)state.lineage.directSecondaryPassives=b.passives.slice(0,3).map(x=>x.id)}
  function effectiveAbilitySet(){
    if(isMortal())return {passives:[],actives:[]};
    const main=baseAbilitySet(state.godId);if(!main)return null;
    const type=state.lineage?.type||'normal';if(type==='normal'||isTriumvir(state.godId))return {passives:main.passives.map(a=>({...a,sourceGodId:state.godId})),actives:main.actives.map(a=>({...a,sourceGodId:state.godId}))};
    const sid=state.lineage?.secondaryGodId,sub=baseAbilitySet(sid);if(!sub)return {passives:main.passives.map(a=>({...a,sourceGodId:state.godId})),actives:main.actives.map(a=>({...a,sourceGodId:state.godId}))};
    if(type==='direct'){
      const passives=main.passives.map(a=>({...a,sourceGodId:state.godId}));
      (state.lineage.compoundPassiveReplacements||[]).slice(0,3).forEach(r=>{const idx=Number(r.primaryIndex),rep=sub.passives.find(x=>x.id===r.secondaryId);if(Number.isInteger(idx)&&idx>=0&&idx<passives.length&&rep)passives[idx]={...rep,sourceGodId:sid,legacyFrom:sid}});
      const actives=main.actives.map(a=>({...a,sourceGodId:state.godId}));
      (state.lineage.compoundActiveReplacements||[]).slice(0,2).forEach(r=>{
        const idx=Number(r.primaryIndex),target=main.actives[idx],rep=sub.actives.find(x=>x.id===r.secondaryId);
        if(Number.isInteger(idx)&&idx>=0&&idx<5&&target&&rep&&Number(rep.level)<=Number(target.level)){
          // A habilidade herdada ocupa a vaga mecânica da ativa substituída.
          // Conteúdo/origem vêm do Legado; nível, slot e custo vêm da vaga principal.
          actives[idx]={
            ...rep,
            sourceGodId:sid,
            legacyFrom:sid,
            legacyOriginalLevel:rep.level,
            legacyOriginalSlot:rep.slot,
            legacyOriginalCost:rep.cost,
            legacyReplacedAbilityId:target.id,
            level:target.level,
            slot:target.slot,
            cost:target.cost
          };
        }
      });
      return {passives,actives};
    }
    if(type==='compound'){
      const pa=new Set(state.lineage.directPrimaryPassives||[]),pb=new Set(state.lineage.directSecondaryPassives||[]);
      return {passives:[...main.passives.filter(a=>pa.has(a.id)).map(a=>({...a,sourceGodId:state.godId})),...sub.passives.filter(a=>pb.has(a.id)).map(a=>({...a,sourceGodId:sid}))],actives:[...main.actives.slice(0,5).map(a=>({...a,sourceGodId:state.godId})),...sub.actives.slice(0,5).map(a=>({...a,sourceGodId:sid}))]};
    }
    return main;
  }
  function attrName(k){return ATTRS.find(a=>a[0]===k)?.[2]||k}
  function bonusText(g){const xs=ATTRS.filter(a=>g.bonuses?.[a[0]]).map(a=>`+${g.bonuses[a[0]]} ${a[1]}`),sk=Object.entries(g.skillBonuses||{}).map(([n,v])=>`+${v} em ${n}`);return [...xs,...sk].join(' · ')||'—'}
  function canFinishCreation(){
    if(sum(state.baseAttributes)!==creationPointLimit()||state.initialSkills.length!==initialSkillLimit())return false;
    if(isMortal())return !!state.originSkillChoice;
    const g=god(),type=state.lineage?.type||'normal',sub=secondaryGod();
    const lineageOk=type==='normal'||(!isTriumvir(state.godId)&&!!sub&&sub.id!==state.godId);
    return lineageOk&&(!g.skillChoice?.length||!!state.divineSkillChoice);
  }
  function changeBase(k,delta){const cur=state.baseAttributes[k]||0;if(delta>0&&ordinaryAttrRaw(k)>=CORE_ATTR_MAX)return;if(delta>0&&!state.isCreated&&sum(state.baseAttributes)>=creationPointLimit())return;if(delta<0&&cur<=0)return;state.baseAttributes[k]=cur+delta;const limit=initialSkillLimit();if(state.initialSkills.length>limit)state.initialSkills=state.initialSkills.slice(0,limit);syncCurrentCaps();save();state.isCreated?renderSheet():renderCreation()}
  function toggleInitialSkill(name,on){if(!canUseInitialSkill(name))return;if(on&&!state.initialSkills.includes(name)&&state.initialSkills.length<initialSkillLimit())state.initialSkills.push(name);if(!on)state.initialSkills=state.initialSkills.filter(s=>s!==name);save();renderCreation()}
  function finishCreation(){if(!canFinishCreation())return;state.isCreated=true;state.createdAt=state.createdAt||new Date().toISOString();syncCurrentCaps();save();render();notify('Ficha criada.')}
  function familiarTypeRule(type){if(type==='narrativo')return {name:'Narrativo',hpBase:0,hpPerTen:0,attributePoints:0,skillCount:0};if(type==='companion')return {name:'Companion',hpBase:0,hpPerTen:0,attributePoints:5,skillCount:2};return familiarRules.types?.[type]||familiarRules.types?.auxiliar||{name:'Auxiliar',hpBase:15,hpPerTen:5,attributePoints:5,skillCount:1}}
  function familiarHpMax(f){if(f?.type==='narrativo')return 0;if(f?.type==='companion'){const cap=Math.max(1,Math.floor(hpMax()/2));return f.companionHpMax==null?cap:clamp(Math.floor(Number(f.companionHpMax)||1),1,cap)}const rule=familiarTypeRule(f?.type);if(rule.legendary)return Math.max(1,Number(f?.legendaryHpMax)||1);return Number(rule.hpBase||0)+Math.floor(state.level/10)*Number(rule.hpPerTen||0)}
  function familiarAttrSpent(f){return sum(f?.attributes||{})}
  function familiarSkillLimit(f){return f?.type==='companion'?clamp(Math.floor(Number(f.companionSkillCount)||0),0,26):Number(familiarTypeRule(f?.type)?.skillCount||0)}
  function familiarActiveCommons(){return (state.familiars?.entries||[]).filter(f=>f.active&&f.type!=='lendario'&&f.type!=='companion'&&f.type!=='narrativo')}
  function familiarActiveLegendaries(){return (state.familiars?.entries||[]).filter(f=>f.active&&f.type==='lendario')}
  function mountRouteOk(f){return !!f?.knownVip||fameTotal()>=50}
  function mountEligible(f){return mountRouteOk(f)&&!!f?.staffApproved}
  function canActivateFamiliar(f){
    if(f.type==='lendario'||f.type==='companion'||f.type==='narrativo')return true;
    const current=familiarActiveCommons().filter(x=>x.id!==f.id);
    if(current.length>=2)return false;
    if(current.length===1&&f.type==='auxiliar'&&current[0].type==='auxiliar')return false;
    return true;
  }
  function validationIssues(){
    const issues=[];
    const add=(level,text)=>issues.push({level,text});
    if(!isMortal()&&!godById(state.godId))add('error','Deus principal não encontrado no banco de dados.');
    if(sum(state.baseAttributes)!==8)add(state.isCreated?'warn':'error',`Atributos-base somam ${sum(state.baseAttributes)}/8. A edição após a criação é livre para permitir correções, mas confira se o total final deveria continuar em 8.`);
    if(state.initialSkills.length!==initialSkillLimit())add('warn',`Perícias iniciais: ${state.initialSkills.length}/${initialSkillLimit()} escolhas por Inteligência inicial.`);
    if(isMortal()&&!state.originSkillChoice)add('warn','Mortal da Névoa ainda não possui uma perícia de origem selecionada.');
    const lvl20Skills=levelSkillChoicesFromMeta(20),lvl40Skills=levelSkillChoicesFromMeta(40);
    if(state.level>=20&&lvl20Skills.length===0)add('warn','Falta marcar uma perícia treinada com origem Nível 20.');
    if(state.level>=40&&lvl40Skills.length===0)add('warn','Falta marcar uma perícia treinada com origem Nível 40.');
    if(lvl20Skills.length>1)add('warn','Há mais de uma perícia marcada com origem Nível 20.');
    if(lvl40Skills.length>1)add('warn','Há mais de uma perícia marcada com origem Nível 40.');
    if(spentLevelPoints()>earnedLevelPoints())add('error',`Há ${spentLevelPoints()} pontos de nível gastos para ${earnedLevelPoints()} disponíveis.`);
    ATTRS.forEach(([k,,label])=>{if(ordinaryAttrRaw(k)>5)add('warn',`${label} recebe ${ordinaryAttrRaw(k)} por fontes normais, mas está corretamente limitado a 5 antes de ajustes excepcionais.`)});
    if(standardTalentsUsed()>talentSlotsEarned())add('warn',`Há ${standardTalentsUsed()} talentos padrão para ${talentSlotsEarned()} slots por nível.`);
    if(state.skillTrainings.length>skillTrainingSlots())add('warn',`Há ${state.skillTrainings.length} perícias em treinamento para ${skillTrainingSlots()} vagas liberadas.`);
    const l=state.lineage||defaultLineage();
    if(!isMortal()&&l.type!=='normal'&&(!l.secondaryGodId||l.secondaryGodId===state.godId))add('error','Legado precisa de dois deuses diferentes.');
    if(!isMortal()&&l.type!=='normal'&&(isTriumvir(state.godId)||isTriumvir(l.secondaryGodId)))add('error','Triúnviros não participam da mistura de kits por Legado.');
    if(!isMortal()&&l.type==='direct'){
      if((l.compoundPassiveReplacements||[]).length>3)add('error','Legado Direto excedeu 3 trocas de passivas.');
      if((l.compoundActiveReplacements||[]).length>2)add('error','Legado Direto excedeu 2 trocas de ativas.');
      const main=abilitiesDb[state.godId],sub=abilitiesDb[l.secondaryGodId];
      for(const r of l.compoundActiveReplacements||[]){const a=main?.actives?.[Number(r.primaryIndex)],b=sub?.actives?.find(x=>x.id===r.secondaryId);if(a&&b&&Number(b.level)>Number(a.level))add('error',`Troca de Legado inválida: ${b.name} exige nível maior que ${a.name}.`)}
    }
    if(!isMortal()&&l.type==='compound'){
      if((l.directPrimaryPassives||[]).length!==4)add('warn','Legado Composto deve selecionar 4 passivas da primeira origem.');
      if((l.directSecondaryPassives||[]).length!==3)add('warn','Legado Composto deve selecionar 3 passivas da segunda origem.');
    }
    const common=familiarActiveCommons();
    if(common.length>2)add('error','Mais de 2 familiares comuns estão ativos na missão.');
    if(common.length===2&&common.every(f=>f.type==='auxiliar'))add('error','Com 2 familiares comuns ativos, pelo menos um precisa ser Montaria ou superior.');
    (state.familiars?.entries||[]).filter(f=>f.active&&f.type==='montaria').forEach(f=>{if(!mountEligible(f))add('warn',`${f.name||'Montaria'} está ativa, mas os requisitos sociais/aprovação ainda não estão marcados como cumpridos.`)});
    if(state.magic?.enabled&&magicSacrificeTotal()>Number(magicRules.maxSacrifices||3))add('error','Sacrifícios mágicos excedem o limite de 3 pontos.');
    return issues;
  }
  function inventoryCategoryIcon(id){
    return ({'arma-corpo':'⚔','arma-distancia':'🏹','consumivel':'✚','item-magico':'✦','municao':'➶','outro':'◈'})[id]||'◈';
  }
  function equipmentCardLabel(kind,id=''){
    if(kind==='armor')return {icon:'🛡',label:'ARMADURA'};
    if(kind==='shield')return {icon:'⛨',label:'ESCUDO'};
    if(kind==='weapon')return {icon:id==='distancia'?'🏹':'⚔',label:'ARMA'};
    return {icon:inventoryCategoryIcon(id),label:(inventoryCategoryLabel(id)||'Item').toUpperCase()};
  }
  function compactText(text,limit=120){const clean=String(text||'').replace(/\s+/g,' ').trim();if(!clean)return '';return clean.length>limit?clean.slice(0,limit-1)+'…':clean}
  function libraryItemById(id){return ITEM_LIBRARY.find(x=>x.id===id)||null}
  function createInventoryItemFromLibrary(template){
    const item={id:uid('item'),name:template.name||'Item',qty:Math.max(0,Number(template.qty)||1),category:normalizeInventoryCategory(template.category||'outro'),material:String(template.material||''),rune:'',effect:String(template.effect||''),notes:String(template.notes||''),imageUrl:'',showInDeck:!!template.showInDeck,isHeritage:false,attackAttr:String(template.attackAttr||'for'),attackBonus:Number(template.attackBonus)||0,damage:String(template.damage||''),range:String(template.range||'')};
    if(template.ask==='elemental'){
      const picked=(window.prompt('Qual elemento / tipo de dano essa poção vai resistir?','Fogo')||'').trim();
      if(picked){item.effect=`Resistência a ${picked}`;item.notes=`Concede resistência temporária a ${picked}.`;item.material=picked;}
    }
    if(template.ask==='animal'){
      const picked=(window.prompt('Com qual tipo de animal essa poção permite falar?','Pássaros')||'').trim();
      if(picked){item.effect=`Comunicação com ${picked} por 1 hora`;item.notes=`Permite compreender e se comunicar com ${picked} por 1 hora.`;item.material=picked;}
    }
    return item;
  }
  function applyLibraryTemplate(template){
    if(!template)return false;
    if(template.kind==='inventory'){
      state.inventory.items.push(createInventoryItemFromLibrary(template));
      return true;
    }
    if(template.kind==='weapon'){
      const m=material(template.material);
      state.weapons.push({id:uid('weapon'),name:template.name||'Nova arma',type:template.type||'corpo-a-corpo',attr:template.attr||'for',material:template.material||'ferro-aco',stakes:0,resistanceCurrent:m.unbreakable?0:m.resistance,attackExtra:Number(template.attackExtra)||0,damageExtra:Number(template.damageExtra)||0,equipped:template.equipped!==false,imageUrl:'',isHeritage:false,notes:template.notes||''});
      return true;
    }
    if(template.kind==='armor'){
      const m=material(template.material),atype=armorType(template.type||'leve');
      state.armor={...state.armor,equipped:template.equipped!==false,name:template.name||'Armadura',type:atype.id,material:m.id,resistanceCurrent:m.unbreakable?0:m.resistance,imageUrl:'',isHeritage:false,notes:template.notes||''};
      return true;
    }
    if(template.kind==='shield'){
      const m=material(template.material);
      state.shield={...state.shield,equipped:template.equipped!==false,name:template.name||'Escudo',material:m.id,stakes:0,resistanceCurrent:m.unbreakable?0:m.resistance,imageUrl:'',isHeritage:false,notes:template.notes||''};
      return true;
    }
    return false;
  }
  function magicCircleRule(circle){return magicRules.circles.find(c=>Number(c.circle)===Number(circle))||null}
  function maxMagicCircleByLevel(){let max=1;for(const c of magicRules.circles||[]){if(state.level>=c.minLevel)max=Math.max(max,c.circle)}return max}
  function magicSpellCost(circle,ritual=false){if(Number(circle)===0)return 0;const base=Number(magicCircleRule(circle)?.cost)||0;if(!ritual)return base;return Math.ceil((base/2)/5)*5}
  function highCircleRemaining(circle){const max=Number(magicRules.highCircleUses?.[circle]||0);if(!max)return null;return Math.max(0,max-(Number(state.magic?.highCircleUsed?.[circle])||0))}
  function magicCastBonus(){const k=state.magic?.castingAttr||'fe';return effectiveAttr(k)+bp()+globalD20Penalty()+receivedBonuses().d20+attrRollConditionPenalty(k)}
  function magicCastDT(){const k=state.magic?.castingAttr||'fe';return 8+effectiveAttr(k)+bp()}
  function magicSacrificeAvailable(k){
    const perAttrMax=Number(magicRules.maxSacrifices||3);
    if(magicRules.sacrificeCanGoBelowZero!==false)return Math.max(0,perAttrMax-magicSacrifice(k));
    return Math.max(0,basePlusLevel(k)-magicSacrifice(k));
  }
  function magicComponentsText(sp){const xs=[];if(sp.components?.v)xs.push('V');if(sp.components?.s)xs.push('S');if(sp.components?.m)xs.push('M');return xs.length?xs.join(' / '):'—'}
  function ensureMagicStarters(){
    if((state.magic.spells||[]).length)return;
    for(let i=1;i<=Number(magicRules.startingCantrips||2);i++)state.magic.spells.push({id:uid('spell'),name:`Truque ${i}`,circle:0,components:{v:false,s:false,m:false},concentration:false,ritual:false,source:'Inicial',notes:''});
    for(let i=1;i<=Number(magicRules.startingSpells||3);i++)state.magic.spells.push({id:uid('spell'),name:`Magia inicial ${i}`,circle:1,components:{v:false,s:false,m:false},concentration:false,ritual:false,source:'Inicial',notes:''});
  }
  function castMagicSpell(id,ritual){
    const sp=state.magic.spells.find(x=>x.id===id);if(!sp)return;const circle=Number(sp.circle)||0,rule=magicCircleRule(circle);if(circle>0&&(circle>state.magic.circle||state.level<(rule?.minLevel||999))){notify('Este círculo ainda não está disponível.');return}
    const remaining=highCircleRemaining(circle);if(remaining!==null&&remaining<=0){notify('Usos deste círculo esgotados até o próximo descanso longo.');return}
    const cost=magicSpellCost(circle,ritual);if(state.currentEnergy<cost){notify('Energia insuficiente.');return}
    setEnergy(state.currentEnergy-cost);if(remaining!==null)state.magic.highCircleUsed[circle]=(Number(state.magic.highCircleUsed[circle])||0)+1;if(sp.concentration)state.magic.concentrationSpellId=sp.id;save();renderSheet();notify(`${ritual?'Ritual':'Magia'} registrado${cost?`: −${cost} EN`:''}.`)
  }
  function inventoryCategoryLabel(id){return INVENTORY_CATEGORIES.find(x=>x[0]===id)?.[1]||'Geral'}
  function consumeInventoryItem(id){const inv=state.inventory||defaultInventory(),it=inv.items.find(x=>x.id===id);if(!it||it.category!=='consumivel')return;const qty=Math.max(0,Number(it.qty)||0);if(qty<=0)return;if(qty===1){inv.items=inv.items.filter(x=>x.id!==id);notify(`${it.name||'Consumível'} consumido e removido do inventário.`)}else{it.qty=qty-1;notify(`${it.name||'Consumível'} consumido · ${it.qty} restante(s).`)}save();render();}
  function fameTotal(){return (state.roma?.fameEntries||[]).reduce((t,x)=>t+(Number(x.amount)||0),0)}
  function fameBand(){const v=fameTotal();return (romaRules.fameBands||[]).find(b=>v>=b.min&&v<=b.max)||{name:'Sem faixa',summary:''}}
  function affinityGrandTotal(){return (state.roma?.affinityEntries||[]).reduce((t,x)=>t+(Number(x.amount)||0),0)}
  function affinityTotals(){const map=new Map();for(const x of state.roma?.affinityEntries||[]){const target=(x.target||'').trim()||'Sem alvo';map.set(target,(map.get(target)||0)+(Number(x.amount)||0))}return [...map.entries()].map(([target,value])=>({target,value:clamp(value,-100,100)})).sort((a,b)=>a.target.localeCompare(b.target,'pt-BR'))}
  function affinityMark(v){v=clamp(Number(v)||0,-100,100);if(v>=100)return '+100';if(v>=60)return '+60 a +99';if(v>=30)return '+30 a +59';if(v>=0)return '0 a +29';if(v>=-25)return '−25 a −1';if(v>=-50)return '−50 a −26';return '−100 a −51'}
  function rankById(kind,id){const rows=kind==='religio'?romaRules.religioRanks:romaRules.legionRanks;return (rows||[]).find(r=>r.id===id)||null}
  function lineageAbilityTitle(){if(isMortal())return 'Mortal da Névoa';const a=primaryGod(),b=secondaryGod(),t=state.lineage?.type||'normal';if(t==='compound'&&b)return `${a.name} · legado de ${b.name}`;if(t==='direct'&&b)return `${a.name} + ${b.name} · Legado Direto`;return a.name}
  function magicAbilityStakeMax(a){
    if(!state.magic?.enabled)return 30;
    const source=String(a?.sourceGodId||state.godId||'').toLowerCase();
    const affinity=magicRules?.divineAbilityProgression?.magicalAffinityDeities||['jano','libitina','trivia','somnia'];
    const aliases=magicRules?.divineAbilityProgression?.additionalAcceptedAliases||['janus','somnium'];
    const exempt=new Set([...affinity,...aliases].map(x=>String(x).toLowerCase()));
    if(!exempt.has(source))return 29;
    if(a?.type==='passive')return 30;
    const set=abilitiesDb[source]||abilitiesDb[state.godId];
    const actives=(set?.actives||[]).filter(x=>!x.isExtra&&x.coreCategory!=='extra');
    const index=actives.findIndex(x=>x.id===a?.id);
    if(a?.type==='active'&&((index>=0&&index<4)||(Number(a?.slot)>=1&&Number(a?.slot)<=4)))return 30;
    return 29;
  }
  function coreSubStakeKey(a,variantId,subId){return `${abilityKey(a)}:core:${variantId}:${subId}`}
  function coreStakeValue(key){return clamp(Number(state.abilityStakes?.[key]||0),0,30)}
  function coreTierCurrent(tier,value){const min=Number(tier?.min??0),max=tier?.max==null?Infinity:Number(tier.max);return value>=min&&value<=max}
  function cleanAbilityText(text){
  let raw=String(text||'').replace(/\r/g,'').trim();
  if(!raw)return '';
  raw=raw.replace(/https?:\/\/cdn\.discordapp\.com\/emojis\/\S+/gi,'');
  raw=raw.replace(/\s*[ৎ౨꒰◝🤍💔🍒﹒ㄑ✦\[\],.\-–—]*\s*(?:cherry\s+bow|cherry\s+mae)\b[\s\S]*?(?:ícone\s+de\s+cargo|copão\s+de\s+600)[\s\S]*$/i,'');
  raw=raw.replace(/\s*[^\n]{0,140}\[SPQR\]\s*,?\s*(?:ícone|icone)\s+de\s+cargo[\s\S]*$/i,'');
  raw=raw.replace(/\s*[^\n]{0,140}(?:copão|copao)\s+de\s+600[\s\S]*$/i,'');
  raw=raw.replace(/<@!?&?\d+>|<#\d+>/g,'');
  raw=raw.replace(/[ \t\f\v]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  return raw;
}
  function structuredTextPieces(text){
  let raw=cleanAbilityText(text);if(!raw)return [];

  // Corrige alguns textos do Core que chegaram colados sem espaço entre frases.
  raw=raw.replace(/([.!?;])(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g,'$1 ');
  raw=raw.replace(/(passam)(?=(Desesperança|Esperança|Ruína|Tensão|Fadiga|Pavor|Ressentimento|Momentum|Frenesi|Potestas|Maré|Carga))/gi,'$1. ');

  // Marcadores de Discord/Core viram quebras reais.
  raw=raw.replace(/(?:^|\s)[·⚠️]+\s*/g,'\n');

  // Cabeçalhos semânticos explícitos. Eles só são transformados quando aparecem
  // em contexto mecânico, para não quebrar frases normais que contenham "efeitos".
  raw=raw.replace(/\s*(Mini ficha dos arautos|Possíveis ações dos arautos)\s*/gi,'\n$1\n');
  raw=raw.replace(/\s+(Mecânica de Acúmulo|Acúmulo)\s+(?=(?:Golpes|Criatura|Acertar|Usar|Permanecer|Obter|Sempre que|Pontos de|Contato com|A prole))/gi,'\nACÚMULO\n');
  raw=raw.replace(/\s+Efeitos\s+(?=(?:\d+(?:\s*[-–]\s*\d+|\+)?\s+pontos?(?:\s+ou\s+mais)?|\d+\+?\s+(?:Tensão|Fadiga|Pavor|Ressentimento))\s*:)/gi,'\nEFEITOS\n');
  raw=raw.replace(/\s+Uso de\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇa-zà-ÿ ]{3,44}?)(?=\s+A prole pode|\s+Para cada|\s+Ao impor|\s+Algumas habilidades|\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.!?]{0,30} desaparece)/g,'\nUSO DE $1\n');

  // Linhas de ganho que possuem rótulo explícito.
  raw=raw.replace(/\s+(?=(?:Arauto menor|Arauto maior|Arauto superior|Atacar|Distrair|Proteger|Conduzir raio|Rajada celeste|Golpes corpo-a-corpo sob domínio elétrico|Golpes corpo-a-corpo ou armas combinadas com água|Habilidades elétricas utilizadas com sucesso|Habilidades hídricas utilizadas com sucesso|Descargas absorvidas de fonte hostil, natural ou divina|Acerto crítico com dano elétrico|Contato com fontes de água[^:]{0,80}|Acertar um ataque[^:]{0,100}|Usar uma habilidade[^:]{0,100}|Permanecer oculto[^:]{0,100}|Obter acerto crítico[^:]{0,100}|Criatura próxima cair a 0 HP|A própria prole reduzir uma criatura a 0 HP|Uma invocação acertar[^:]{0,100}|Permanecer em local de morte[^:]{0,100}|Crítico com dano[^:]{0,100})\s*:)/gi,'\n');

  // Marcos numéricos de gasto/efeito.
  raw=raw.replace(/\s+(?=(?:\d+(?:\s*[-–]\s*\d+|\+)?\s+pontos?(?:\s+ou\s+mais)?|\d+\+?\s+(?:Tensão|Fadiga|Pavor|Ressentimento))\s*:)/gi,'\n');

  // Regras estruturais ficam em parágrafos separados, mas nunca palavra por palavra.
  raw=raw.replace(/\s+(?=(?:Sempre que a prole|O máximo de pontos(?: de [^.!?]{1,80})?\s+é\b|A prole só pode receber|A prole pode acumular|A prole pode ter no máximo|A prole pode gastar \d+ pontos?|Para cada \d+ ponto gasto|Ao impor uma resistência[^.!?]{0,120}?pode gastar|Ao acumular \d+ marcas?|Cada marca de Ruína|Algumas habilidades de (?:Fobetor|Somnia)|Após o uso,|Depois disso,|As marcas pertencem|Permanecer escondido|O acúmulo por contato|Não ignora resistências|Caso a prole passe|Filhos de (?:Phobetor|Somnia))\b)/gi,'\n');

  // Encerramento/perda de recursos: nomes conhecidos, sem regex ampla que possa
  // capturar toda a frase anterior e quebrar cada palavra em uma linha.
  raw=raw.replace(/\s+(?=(?:Os pontos desaparecem|Todos os pontos desaparecem|As marcas desaparecem|Desesperança desaparece|Esperança desaparece|Ressentimento desaparece|Momentum desaparece|Frenesi desaparece|Carga Noturna desaparece|Maré Crescente desaparece|Acúmulo Necromântico desaparece)\b)/gi,'\n');

  // Repara quebras artificiais que podem surgir quando uma expressão mecânica
  // aparece dentro do texto de um efeito, e não como nova regra de acúmulo.
  raw=raw.replace(/\bao\n(?=usar uma habilidade\b)/gi,'ao ');
  raw=raw.replace(/\bObter acerto\n(?=crítico\b)/gi,'Obter acerto ');
  raw=raw.replace(/(\+2 pontos\.)\s+(?=Usar com sucesso habilidade de morte)/gi,'$1\n');

  return raw.split(/\n{1,}|\s*•\s*/).map(x=>x.trim()).filter(Boolean);
}
  function abilityUsageRule(a){
  const blocks=(a.coreBlocks||[]).map(b=>b.text||'').join(' '),tiers=a.tiers?Object.values(a.tiers).join(' '):'',text=`${a.summary||''} ${a.extra||''} ${tiers} ${blocks}`.replace(/\s+/g,' ');
  const words={uma:1,um:1,duas:2,dois:2,três:3,tres:3,quatro:4,cinco:5};
  const match=text.match(/(?:até\s+)?(\d+|uma|um|duas|dois|três|tres|quatro|cinco)\s+vez(?:es)?\s+por\s+(cena|combate|descanso\s+curto|descanso\s+longo)/i);
  if(!match)return null;
  const max=Number(match[1])||words[match[1].toLowerCase()]||1,period=match[2].toLowerCase().replace(/\s+/g,' ');
  return {max,period,label:period==='cena'?'cena':period==='combate'?'combate':period};
}
  function abilityUsageKey(a){return abilityKey(a)}
  function abilityUses(a){return Math.max(0,Number(state.abilityUses?.[abilityUsageKey(a)])||0)}
  function isStoredOmenAbility(a){
  const name=String(a?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  return name==='pressagio guardado';
}
  function storedOmenSlotKey(a,index){return `omen:${abilityKey(a)}:${index}`}
  function storedOmenCapacity(st){return st>=30?3:st>=16?2:1}
  function abilityToolKey(a,field){return `tool:${abilityKey(a)}:${field}`}
  function abilityToolCapacity(st){return st>=30?3:st>=16?2:1}
  function useAbility(key,cost){
  const set=effectiveAbilitySet(),a=[...(set?.passives||[]),...(set?.actives||[])].find(x=>abilityKey(x)===key),rule=a?abilityUsageRule(a):null;
  if(rule&&abilityUses(a)>=rule.max){notify(`Limite de ${rule.max} uso(s) por ${rule.label} atingido.`);return}
  if(state.currentEnergy<cost){notify('Energia insuficiente.');return}
  setEnergy(state.currentEnergy-cost);if(rule)state.abilityUses[abilityUsageKey(a)]=abilityUses(a)+1;save();renderSheet();notify(`Habilidade usada: −${cost} EN${rule?` · ${abilityUses(a)}/${rule.max} uso(s)`:''}.`)
}
  function changeLevelAttr(k,d){if(d>0){if(remainingLevelPoints()<=0||ordinaryAttrRaw(k)>=CORE_ATTR_MAX)return;state.levelAttributes[k]++}else{if(state.levelAttributes[k]<=0)return;state.levelAttributes[k]--}syncCurrentCaps();save();renderSheet()}
  function toggleCondition(name,on){if(on&&!state.conditions.includes(name))state.conditions.push(name);if(!on)state.conditions=state.conditions.filter(x=>x!==name);save();renderSheet()}
  function shortRest(){
  if(state.death.dead){notify('Personagem morto não pode descansar.');return}if(state.currentHp===0){notify('Em 0 HP, estabilize e recupere 1 HP antes de descansar.');return}
  const hp=Number(system.rests?.short?.hp??25),en=Number(system.rests?.short?.energy??150),hasEnergy=energyMax()>0;
  setHp(state.currentHp+hp);if(hasEnergy)setEnergy(state.currentEnergy+en);
  const set=effectiveAbilitySet();for(const a of [...(set?.passives||[]),...(set?.actives||[])]){const rule=abilityUsageRule(a);if(rule?.period==='descanso curto')state.abilityUses[abilityUsageKey(a)]=0}
  save();renderSheet();notify(hasEnergy?`Descanso curto: +${hp} HP e +${en} Energia.`:`Descanso curto: +${hp} HP.`)
}
  function longRest(){
  if(state.death.dead){notify('Personagem morto não pode descansar.');return}if(state.currentHp===0){notify('Em 0 HP, estabilize e recupere 1 HP antes de descansar.');return}
  const hasEnergy=energyMax()>0;
  setHp(hpMax());if(hasEnergy)setEnergy(energyMax());if(state.magic?.enabled)state.magic.highCircleUsed={6:0,7:0,8:0,9:0};state.abilityUses={};save();renderSheet();notify(hasEnergy?'Descanso longo: HP e Energia completos; usos limitados restaurados.':'Descanso longo: HP completo; usos limitados restaurados.')
}
  function rollD20(label,modifier,fortune=0){const die=Math.floor(Math.random()*20)+1;
    const extra=fortune ? fortune*(1+Math.floor(Math.random()*4)) : 0, total=die+modifier+extra;
    state.lastRoll={label,die,modifier,total,extra};save();renderSheet();notify(`${label}: ${total} (${die} no d20).`)}
  function rollDefense(){const f=fixedDefense();if(f!==null){state.lastRoll={label:'Defesa fixa',die:'—',modifier:0,total:f};save();renderSheet();notify(`Defesa fixa: ${f}.`);return}rollD20('Defesa',defenseBonus())}
  function rollInitiative(){rollD20('Iniciativa',initiativeBonus())}
  function rollDeathSave(){if(state.currentHp!==0||state.death.dead||state.death.stable)return;const d=Math.floor(Math.random()*20)+1;state.death.lastRoll=d;if(d===20){setHp(1);save();renderSheet();notify('20 natural: recupera 1 HP e pode agir.');return}if(d===1)state.death.failures+=2;else if(d>=10)state.death.successes+=1;else state.death.failures+=1;if(state.death.successes>=3){state.death.successes=3;state.death.stable=true}if(state.death.failures>=3){state.death.failures=3;state.death.dead=true}save();renderSheet()}
  function addDeathSuccesses(n){if(state.death.dead||state.death.stable||state.currentHp!==0)return;state.death.successes=clamp(state.death.successes+n,0,3);if(state.death.successes>=3){state.death.successes=3;state.death.stable=true}save();renderSheet()}
  function addDeathFailures(n){if(state.death.dead||state.currentHp!==0)return;state.death.failures=clamp(state.death.failures+n,0,3);if(state.death.failures>=3)state.death.dead=true;save();renderSheet()}
  function signed(n){const v=Number(n)||0;return v>=0?`+${v}`:`−${Math.abs(v)}`}
  function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function initials(name=''){const parts=String(name||'').trim().split(/\s+/).filter(Boolean);if(!parts.length)return 'XII';return (parts[0][0]||'').concat(parts.length>1?(parts[parts.length-1][0]||''):'').toUpperCase()}
  // ---------------------------------------------------------------- fim do código copiado
  return {
    get state() { return state; },
    set state(v) { state = v; },
    receivedBonuses, fortuneSuffix, SCHEMA_VERSION, ATTRS, INVENTORY_CATEGORIES, THEME_PALETTES, ITEM_LIBRARY, normalizeInventoryCategory, gods, skills, abilitiesDb, system, CORE_ATTR_START, CORE_ATTR_MAX, creationPointLimit, talentsDb, magicRules, romaRules, familiarRules, normalizeExclusiveThemeId, emptyAttrs, defaultDeath, defaultArmor, defaultShield, defaultTempMods, defaultLineage, defaultMagic, defaultInventory, defaultFamiliarBarding, defaultFamiliar, defaultFamiliars, defaultRoma, defaultState, MORTAL_PROFILE, isMortal, hasSheetCasting, sheetCastingAttr, godById, primaryGod, god, baseAbilitySet, isTriumvir, clamp, sum, talentDef, talentCount, hasTalent, talentAttributeBonus, talentGrantedSkills, talentExpertSkills, magicSacrifice, ordinaryAttrRaw, attributeExtraBonus, ordinaryAttrCapped, structuralAttr, basePlusLevel, talentSlotsEarned, standardTalentsUsed, sanityAttrPenalty, effectiveAttr, initialSkillLimit, earnedLevelPoints, spentLevelPoints, remainingLevelPoints, bp, currentMonthKey, fortunaBlessingIsCurrent, rawHpMax, magicSacrificeTotal, rawEnergyMax, hpMax, energyMax, divineResources, resourceAbilityStake, resourceMaxFor, resourceKey, resourceValue, setResourceValue, hudResources, abilityResourcesFor, targetResources, resourceMax, divineGranted, skillAttr, skillId, skillNameById, attrAbbr, activeCondition, conditionData, conditionDefenseMod, conditionDexRollMod, fixedDefense, energyRollPenalty, exhaustionRollPenalty, globalD20Penalty, attrRollConditionPenalty, castAttack, castDT, energyValueText, castAttackText, castDtText, skillTraining, skillMetaFor, basicAutomaticSkillSources, choiceStateKey, abilityChoiceDefs, choiceLimit, chosenFor, choiceOptions, choiceDetailKey, resourceByKey, activeAbilitySkillEffects, automaticSkillSources, manualSkillSourceLabel, skillSources, skillIsProficient, skillHasAutomaticExpertise, skillHasExpertise, skillValue, canUseInitialSkill, abilityKey, abilityVisual, abilityVisualState, abilityInDeck, abilityDeckEntries, stakesOf, tierName, tierText, material, materialResistance, armorType, weaponType, armorDefense, armorReduction, shieldDefense, damageReduction, defenseBonus, initiativeBonus, weaponDiceCount, weaponAttack, weaponDamageFormula, skillTrainingSlots, availableSkillTrainingSlots, levelSkillUnlocked, levelSkillChoicesFromMeta, levelSkillChoice, sanityBand, energyBand, uid, migrate, syncCurrentCaps, setHp, setEnergy, setSanity, secondaryGod, eligibleLegacyGods, resetLineage, initializeDirectSelections, effectiveAbilitySet, attrName, bonusText, canFinishCreation, changeBase, toggleInitialSkill, finishCreation, familiarTypeRule, familiarHpMax, familiarAttrSpent, familiarSkillLimit, familiarActiveCommons, familiarActiveLegendaries, mountRouteOk, mountEligible, canActivateFamiliar, validationIssues, inventoryCategoryIcon, equipmentCardLabel, compactText, libraryItemById, createInventoryItemFromLibrary, applyLibraryTemplate, magicCircleRule, maxMagicCircleByLevel, magicSpellCost, highCircleRemaining, magicCastBonus, magicCastDT, magicSacrificeAvailable, magicComponentsText, ensureMagicStarters, castMagicSpell, inventoryCategoryLabel, consumeInventoryItem, fameTotal, fameBand, affinityGrandTotal, affinityTotals, affinityMark, rankById, lineageAbilityTitle, magicAbilityStakeMax, coreSubStakeKey, coreStakeValue, coreTierCurrent, cleanAbilityText, structuredTextPieces, abilityUsageRule, abilityUsageKey, abilityUses, isStoredOmenAbility, storedOmenSlotKey, storedOmenCapacity, abilityToolKey, abilityToolCapacity, useAbility, changeLevelAttr, toggleCondition, shortRest, longRest, rollD20, rollDefense, rollInitiative, rollDeathSave, addDeathSuccesses, addDeathFailures, signed, esc, initials
  };
};
window.FichaMotor.origem = { arquivo: 'app-v511.js', versao: 'v5.41.0', declaracoes: 227 };
})();
