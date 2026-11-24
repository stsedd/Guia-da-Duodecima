/* ==========================================================================
   PRINCIPIA · Minha Ficha (prévia de teste)
   Mantém a ficha do personagem aberta dentro do desktop, ao lado do Guia.

   - Lê o arquivo JSON exportado pela Ficha Oficial. Nada é enviado nem alterado:
     o site da Ficha continua igual e o arquivo fica só neste navegador, num banco
     próprio (IndexedDB "principia_fichas_v1"), separado dos dados da Ficha Oficial.
   - Nomes de deuses, habilidades, perícias e talentos vêm do Duodécima Core.
   - Os números seguem as fórmulas de referência da ficha atual; a nova ficha pode
     mudar essas contas.
   ========================================================================== */
(() => {
  'use strict';

  function start() {
    const P = window.PRINCIPIA;
    const A = P && P.api;
    if (!A) return;
    const { esc, svg, isMobile, toast, store } = A;
    const $ = (s, r = document) => r.querySelector(s);
    const bodyEl = $('#osFichaBody');
    const fileEl = $('#osFichaFile');
    const subEl = $('#osFichaSub');
    if (!bodyEl || !fileEl || !A.WM.get('ficha')) return;

    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const num = v => Number(v) || 0;
    const signed = n => (n >= 0 ? '+' : '−') + Math.abs(n);
    const ATTRS = [['for', 'FOR', 'Força'], ['des', 'DES', 'Destreza'], ['con', 'CON', 'Constituição'], ['int', 'INT', 'Inteligência'], ['fe', 'FÉ', 'Fé'], ['car', 'CAR', 'Carisma']];
    const ATTR_ABBR = Object.fromEntries(ATTRS.map(a => [a[0], a[1]]));
    const PALETTE = { red: '#d3112a', pink: '#e0457b', blue: '#3d7be0', orange: '#e07a2e', green: '#3fa860', purple: '#8b4fe0', gold: '#c9a24a', silver: '#9aa4b0', wine: '#9b1d42', teal: '#1f9e9a', sepia: '#a07a4f', blush: '#e48d9c', peach: '#ec9a6e', lilac: '#a98be6', sage: '#7fa77b', lemon: '#cdbb2f', mauve: '#a96f98', coral: '#ee6a55', aqua: '#2fb9c9', sand: '#c4a16f', sky: '#5eb3ea', 'mono-black': '#8d8d8d', 'mono-white': '#bdbdbd' };

    /* ---------- Armazenamento próprio (não toca nos dados da Ficha Oficial) ---------- */
    const DB_NAME = 'principia_fichas_v1';
    const STORE = 'fichas';
    const memory = new Map();
    let dbPromise = null;
    function openDb() {
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          if (!('indexedDB' in window)) { reject(new Error('IndexedDB indisponível')); return; }
          const req = indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' }); };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      }
      return dbPromise;
    }
    const tx = async (mode, fn) => {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const result = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      });
    };
    let persistent = true;
    async function dbAll() {
      try { const all = await tx('readonly', s => s.getAll()); (all || []).forEach(r => memory.set(r.id, r)); }
      catch (err) { persistent = false; console.warn('[Principia · Ficha] Armazenamento local indisponível; a ficha fica só nesta aba.', err); }
      return [...memory.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
    }
    async function dbPut(rec) {
      memory.set(rec.id, rec);
      try { await tx('readwrite', s => s.put(rec)); return true; } catch { persistent = false; return false; }
    }
    async function dbDelete(id) {
      memory.delete(id);
      try { await tx('readwrite', s => s.delete(id)); } catch {}
    }

    /* ---------- Dados do Core (mesma fonte canônica da Ficha e do Guia) ---------- */
    const CORE_BASE = 'https://stsedd.github.io/duodecima-core/';
    let modelPromise = null;
    function cleanCoreText(value) {
      let raw = String(value ?? '').replace(/\r/g, '').trim();
      if (!raw) return '';
      raw = raw.replace(/https?:\/\/cdn\.discordapp\.com\/emojis\/\S+/gi, '').replace(/<@!?&?\d+>|<#\d+>/g, '');
      return raw.replace(/[ \t\f\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    function tierObject(tiers) {
      if (!Array.isArray(tiers) || !tiers.length) return null;
      const pick = (min, key) => tiers.find(t => Number(t.min) === min) || tiers.find(t => String(t.id).includes(key));
      const low = pick(0, '0-15'), mid = pick(16, '16-29'), high = tiers.find(t => Number(t.min) >= 30) || tiers.find(t => String(t.id).includes('30'));
      const obj = { low: cleanCoreText(low?.text), mid: cleanCoreText(mid?.text), high: cleanCoreText(high?.text) };
      return obj.low || obj.mid || obj.high ? obj : null;
    }
    /* Revisões canônicas de habilidades publicadas no Core (mesma regra usada pela Ficha). */
    function applyAbilityAdjustments(deities, adjustments) {
      const norm = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
      const tierKey = t => { if (t && t.min != null) { const m = Number(t.min); return m >= 30 ? '30+' : m >= 16 ? '16-29' : '0-15'; } const l = norm(t?.id || t?.label); return l.includes('30') ? '30+' : (l.includes('16') || l.includes('29')) ? '16-29' : '0-15'; };
      const replaceDeep = (value, reps) => {
        if (typeof value === 'string') { for (const r of reps) if (r.find) value = value.split(String(r.find)).join(String(r.replace ?? '')); return value.replace(/\.\s*\./g, '.').replace(/ {2,}/g, ' ').trim(); }
        if (Array.isArray(value)) return value.map(x => replaceDeep(x, reps));
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceDeep(v, reps)]));
        return value;
      };
      for (const change of adjustments?.changes || []) {
        const ids = [change.deityId, ...(change.deityAliases || [])].map(norm);
        const deity = deities.find(d => ids.includes(norm(d.id)) || ids.includes(norm(d.name)));
        const ability = deity && [...(deity.passives || []), ...(deity.actives || [])].find(a => a.id === change.abilityId || norm(a.name) === norm(change.abilityName));
        if (!ability) continue;
        Object.assign(ability, replaceDeep(ability, change.replaceText || []));
        if (change.summary != null) ability.summary = change.summary;
        if (change.note != null) ability.note = change.note;
        if (change.level != null) ability.level = change.level;
        if (change.tierOverrides && Array.isArray(ability.tiers)) for (const t of ability.tiers) if (change.tierOverrides[tierKey(t)] != null) t.text = change.tierOverrides[tierKey(t)];
      }
    }
    function buildModel(b) {
      const deities = [...(b.gods?.deities || [])];
      if (b.godsSupplement?.deities?.length) { const ids = new Set(deities.map(d => d.id)); deities.push(...b.godsSupplement.deities.filter(d => !ids.has(d.id))); }
      try { applyAbilityAdjustments(deities, b.abilityAdjustments); } catch (err) { console.warn('[Principia · Ficha] Ajustes de habilidades não aplicados.', err); }
      const skills = (b.skills?.skills || []).map(s => ({ id: s.id, name: s.name, attr: s.attribute }));
      const skillById = new Map(skills.map(s => [s.id, s]));
      const skillName = id => skillById.get(id)?.name || id;
      const mapAbility = (a, gid) => ({ id: a.id, name: a.name, type: a.type === 'passive' ? 'passive' : 'active', summary: cleanCoreText(a.summary), tiers: tierObject(a.tiers), extra: cleanCoreText(a.note), level: a.level, slot: a.slot, cost: a.cost, isExtra: a.category === 'extra', sourceGodId: gid });
      const gods = new Map(deities.map(d => {
        const skillBonuses = {};
        for (const [id, v] of Object.entries(d.skillBonuses || {})) skillBonuses[skillName(id)] = v;
        const resources = (d.resources || (d.resource ? [d.resource] : [])).filter(Boolean).map(r => ({ id: r.id || String(r.name || 'recurso').toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: r.name || 'Recurso divino', scope: r.scope || 'personal', max: r.max || { type: 'described', formula: r.maxFormula || '0' }, maxFormula: r.maxFormula || '', sourceAbilityId: r.sourceAbilityId || null }));
        return [d.id, {
          id: d.id, name: d.name, group: d.group, groupLabel: d.groupLabel || d.group, kit: d.kitAvailable !== false,
          casting: d.castingAttribute || 'fe', hpBase: Number(d.hp?.base ?? 20), hpPerDecade: Number(d.hp?.perDecade ?? 5),
          bonuses: { ...(d.attributeBonuses || {}) }, skillBonuses, grantedSkills: (d.grantedSkills || []).map(skillName), skillChoice: (d.skillChoices || []).map(skillName),
          resources, passives: (d.passives || []).map(a => mapAbility(a, d.id)), actives: (d.actives || []).map(a => mapAbility(a, d.id))
        }];
      }));
      const sys = b.system || {};
      const eq = b.equipment || {};
      const awakening = b.magic?.awakening || sys.magicAwakening || {};
      return {
        version: b.manifest?.contentVersion || b.manifest?.updatedAt || '—',
        skills, skillByName: new Map(skills.map(s => [s.name, s])), skillName,
        gods,
        talents: new Map((b.talents?.talents || []).map(t => [t.id, { id: t.id, name: t.name, description: cleanCoreText(t.description) }])),
        conditions: (b.conditions?.conditions || []).map(c => ({ id: c.id, name: c.name, description: c.description || '', ...(c.automation || {}) })),
        materials: eq.materials || [], armorTypes: eq.armorTypes || [], weaponTypes: eq.weaponTypes || [],
        lineage: sys.lineage || {},
        rules: {
          attrMax: Math.max(1, Number(sys.attributes?.normalMax ?? 5)),
          profRanges: sys.proficiency?.ranges || [],
          energy: sys.resources?.energy || {},
          exhaustion: sys.exhaustion || {},
          successorEnergy: Number(sys.rebentos?.successor?.energyBaseBonus ?? 25),
          hpPenalty: Number(awakening.hpProgressionPenalty ?? 2),
          sacrificeEnergy: Number(awakening.sacrificeEnergyEach ?? 25)
        }
      };
    }
    function loadModel() {
      if (!modelPromise) {
        modelPromise = (async () => {
          const get = async url => { const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} · ${url}`); return r.json(); };
          let bundle;
          try {
            const manifest = await get(`${CORE_BASE}manifest.json`);
            const keys = ['skills', 'talents', 'conditions', 'gods', 'godsSupplement', 'system', 'equipment', 'magic', 'abilityAdjustments'];
            const pairs = await Promise.all(keys.filter(k => manifest.files?.[k]).map(async k => [k, await get(`${CORE_BASE}${manifest.files[k]}`).catch(() => null)]));
            bundle = { manifest, ...Object.fromEntries(pairs) };
            if (!bundle.gods || !bundle.skills) throw new Error('Core incompleto');
          } catch (err) {
            console.warn('[Principia · Ficha] Core remoto indisponível; usando o snapshot local do Guia.', err);
            bundle = await get('core-snapshot.json');
          }
          return buildModel(bundle);
        })().catch(err => { modelPromise = null; throw err; });
      }
      return modelPromise;
    }

    /* ---------- Leitura do JSON da ficha ---------- */
    const MORTAL = { id: 'mortal-nevoa', name: 'Mortal da Névoa', hpBase: 10, hpPerDecade: 3, bonuses: {}, skillBonuses: {}, grantedSkills: [], skillChoice: [], casting: 'fe', resources: [], passives: [], actives: [] };
    const normAttrs = (src, min, max, abs) => Object.fromEntries(ATTRS.map(([k]) => { const n = Number(src?.[k]); return [k, clamp(Number.isFinite(n) ? (abs ? Math.abs(n) : n) : 0, min, max)]; }));
    function normalize(raw) {
      const d = JSON.parse(JSON.stringify(raw || {}));
      d.name = String(d.name || 'Personagem sem nome');
      d.level = clamp(num(d.level) || 1, 1, 100);
      d.originType = d.originType === 'mortal' ? 'mortal' : 'divine';
      d.baseAttributes = normAttrs(d.baseAttributes, 0, 5, true);
      d.levelAttributes = normAttrs(d.levelAttributes, 0, 5, true);
      d.attributeExtras = normAttrs(d.attributeExtras, -10, 10, false);
      d.talents = Array.isArray(d.talents) ? d.talents.map(t => typeof t === 'string' ? { talentId: t, params: {} } : { params: {}, ...(t || {}) }) : [];
      d.skillMeta = d.skillMeta && typeof d.skillMeta === 'object' ? d.skillMeta : {};
      for (const n of [20, 40]) { const name = d.levelSkillChoices?.[n]; if (name) d.skillMeta[name] = { ...(d.skillMeta[name] || {}), proficient: true, source: `nivel-${n}` }; }
      d.initialSkills = Array.isArray(d.initialSkills) ? d.initialSkills : [];
      d.skillTrainings = Array.isArray(d.skillTrainings) ? d.skillTrainings : [];
      d.lineage = { type: 'normal', ...(d.lineage || {}) };
      if (d.lineage && Number(d.lineage.namingVersion || 0) < 2) {
        // Mesma migração de nomenclatura da Ficha: fichas antigas tinham Direto e Composto invertidos.
        if (d.lineage.type === 'compound') d.lineage.type = 'direct'; else if (d.lineage.type === 'direct') d.lineage.type = 'compound';
      }
      if (d.originType === 'mortal') d.lineage = { type: 'normal' };
      d.magic = { enabled: false, sacrifices: {}, spells: [], circle: 1, ...(d.magic || {}) };
      d.inventory = { aureus: 0, denarius: 0, items: [], ...(d.inventory || {}) };
      d.roma = { ...(d.roma || {}) };
      d.history = { ...(d.history || {}) };
      d.conditions = Array.isArray(d.conditions) ? d.conditions : [];
      d.weapons = Array.isArray(d.weapons) ? d.weapons : [];
      d.armor = d.armor || {};
      d.shield = d.shield || {};
      d.abilityStakes = d.abilityStakes || {};
      d.resourceValues = d.resourceValues || {};
      d.exhaustion = clamp(num(d.exhaustion), 0, 6);
      d.tempMods = { ...(d.tempMods || {}) };
      d.familiars = { entries: [], ...(d.familiars || {}) };
      d.appearance = { ...(d.appearance || {}) };
      return d;
    }

    /* ---------- Contas de referência (fórmulas da ficha atual, sobre dados do Core) ---------- */
    function compute(d, M) {
      const mortal = d.originType === 'mortal';
      const main = mortal ? MORTAL : (M.gods.get(d.godId) || null);
      const sub = !mortal && d.lineage.type !== 'normal' ? M.gods.get(d.lineage.secondaryGodId) || null : null;
      const triumvir = g => g && (g.group === 'triunviros' || /triunvir/i.test(g.groupLabel || ''));
      const god = main ? { ...main, bonuses: { ...main.bonuses }, grantedSkills: [...main.grantedSkills] } : { ...MORTAL, name: d.godId || '—' };
      // Legado Composto: menor HP inicial e bônus/perícia escolhidos entre as duas origens.
      if (d.lineage.type === 'compound' && main && sub) {
        const sameOrigins = d.lineage.compoundChoiceOrigins === `${d.godId}|${d.lineage.secondaryGodId}`;
        const offers = (v) => [main, sub].some(g => Number(g.bonuses?.[v.attr]) === v.value);
        const p2 = sameOrigins ? d.lineage.compoundAttributePlus2 : '', p1 = sameOrigins ? d.lineage.compoundAttributePlus1 : '', sk = sameOrigins ? d.lineage.compoundSkillChoice : '';
        god.hpBase = Math.min(main.hpBase, sub.hpBase);
        god.hpPerDecade = main.hpPerDecade;
        god.bonuses = {};
        if (p2 && offers({ attr: p2, value: 2 })) god.bonuses[p2] = (god.bonuses[p2] || 0) + 2;
        if (p1 && offers({ attr: p1, value: 1 })) god.bonuses[p1] = (god.bonuses[p1] || 0) + 1;
        const skillOpts = new Set([...main.grantedSkills, ...main.skillChoice, ...sub.grantedSkills, ...sub.skillChoice]);
        god.grantedSkills = sk && skillOpts.has(sk) ? [sk] : [];
      }

      const talentCount = id => d.talents.filter(t => t.talentId === id).length;
      const hasTalent = id => talentCount(id) > 0;
      const talentAttr = k => d.talents.reduce((t, x) => t + (x.talentId === 'aumento-atributo' ? ['attribute', 'attribute1', 'attribute2'].filter(p => x.params?.[p] === k).length : 0) + (x.talentId === 'resiliente' && x.params?.attribute === k ? 1 : 0), 0);
      const sacrifice = k => d.magic.enabled && ['for', 'des', 'con'].includes(k) ? clamp(num(d.magic.sacrifices?.[k]), 0, 3) : 0;
      const raw = k => d.baseAttributes[k] + d.levelAttributes[k] + talentAttr(k) + (mortal ? 0 : num(god.bonuses?.[k]));
      const structural = k => Math.min(M.rules.attrMax, raw(k)) + d.attributeExtras[k] - sacrifice(k);
      const sanity = clamp(Number(d.currentSanity ?? 100), 0, 100);
      const sanityPen = k => sanity <= 40 ? (k === 'int' || k === 'car' ? -5 : k === 'fe' ? -3 : 0) : (sanity <= 70 && (k === 'int' || k === 'car') ? -2 : 0);
      const eff = k => structural(k) + sanityPen(k);
      const lvl = d.level;
      const bp = (() => { const row = M.rules.profRanges.find(r => lvl >= num(r.min) && (r.max == null || lvl <= Number(r.max))); if (row) return num(row.bonus); return lvl <= 20 ? 1 : lvl <= 40 ? 2 : lvl <= 60 ? 3 : lvl <= 80 ? 4 : lvl <= 99 ? 5 : 6; })();

      // Recursos
      const dec = Math.floor(lvl / 10), con = structural('con');
      const monthKey = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`; })();
      const fortuna = d.fortunaBlessing === true && d.fortunaBlessingMonth === monthKey ? 10 : 0;
      const perDec = Math.max(0, god.hpPerDecade - (!mortal && d.magic.enabled ? M.rules.hpPenalty : 0));
      const rawHp = god.hpBase + con + dec * (perDec + con) + talentCount('duravel') * con * (1 + dec) + fortuna;
      const hpMax = d.exhaustion >= 5 ? Math.max(1, Math.floor(rawHp / 2)) : rawHp;
      const sacTotal = ['for', 'des', 'con'].reduce((t, k) => t + sacrifice(k), 0);
      const E = M.rules.energy;
      let rawEn;
      if (mortal) rawEn = d.magic.enabled ? Math.floor(lvl / 10) * 15 + sacTotal * M.rules.sacrificeEnergy : 0;
      else rawEn = num(E.base ?? 100) + (d.roma?.successorOfRebento ? M.rules.successorEnergy : 0) + Math.floor(lvl / Math.max(1, num(E.everyLevels ?? 5))) * num(E.increment ?? 25) + (d.magic.enabled ? sacTotal * M.rules.sacrificeEnergy : 0);
      const enMax = d.exhaustion >= 5 && rawEn > 0 ? Math.max(1, Math.floor(rawEn / 2)) : rawEn;
      const hpCur = clamp(Number(d.currentHp ?? hpMax), 0, hpMax);
      const enCur = clamp(Number(d.currentEnergy ?? enMax), 0, enMax);
      const sanityStage = sanity === 0 ? 'Louco' : sanity <= 20 ? 'À Beira da Loucura' : sanity <= 40 ? 'Abalado' : sanity <= 70 ? 'Instável' : 'Estável';

      // Penalidades globais e condições
      const condData = name => M.conditions.find(c => c.name === name);
      const condDefense = d.conditions.reduce((t, n) => t + num(condData(n)?.defenseMod), 0);
      const condDex = d.conditions.reduce((t, n) => t + num(condData(n)?.dexRollMod), 0);
      const fixedVals = d.conditions.map(n => condData(n)?.fixedDefense).filter(v => Number.isFinite(v));
      const fixedDefense = fixedVals.length ? Math.min(...fixedVals) : null;
      const enPen = enMax > 0 && enCur <= enMax * Number(E.lowThresholdRatio ?? .5) ? Number(E.lowPenaltyD20 ?? -1) : 0;
      const exPen = Number(M.rules.exhaustion?.d20PenaltyPerLevel ?? -2) * clamp(d.exhaustion, 0, Number(M.rules.exhaustion?.max ?? 6));
      const globalPen = enPen + exPen;
      const attrPen = k => k === 'des' ? condDex : 0;

      // Perícias
      const divineGranted = mortal ? (d.originSkillChoice ? [d.originSkillChoice] : []) : [...god.grantedSkills, ...(d.divineSkillChoice ? [d.divineSkillChoice] : [])];
      const talentSkills = new Set(), talentExpert = new Set();
      d.talents.forEach(t => {
        if (t.talentId === 'perito') ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'].forEach(k => t.params?.[k] && talentSkills.add(t.params[k]));
        if (t.talentId === 'expert') { if (t.params?.skill) talentSkills.add(t.params.skill); ['expertise1', 'expertise2'].forEach(k => t.params?.[k] && talentExpert.add(t.params[k])); }
      });
      const sourcesOf = name => {
        const out = [];
        if (d.initialSkills.includes(name)) out.push('Inicial');
        if (divineGranted.includes(name)) out.push(mortal ? 'Origem' : 'Prole');
        if (talentSkills.has(name) || talentExpert.has(name)) out.push('Talento');
        if (num(d.skillTrainings.find(t => t.name === name)?.stakes) >= 30) out.push('Treino');
        const meta = d.skillMeta[name];
        if (meta?.proficient) { const label = { prole: 'Prole', inicial: 'Inicial', treino: 'Treino', 'nivel-20': 'Nível 20', 'nivel-40': 'Nível 40', talento: 'Talento', extras: 'Extras' }[meta.source] || 'Extras'; if (!out.includes(label)) out.push(label); }
        return out;
      };
      const skills = M.skills.map(s => {
        const sources = sourcesOf(s.name);
        const proficient = sources.length > 0;
        const expertise = proficient && (!!d.skillMeta[s.name]?.expertise || talentExpert.has(s.name));
        let cond = attrPen(s.attr);
        if (d.conditions.includes('Desorientado') && (s.name === 'Percepção' || s.name === 'Investigação')) cond -= 2;
        const value = (s.attr ? eff(s.attr) : 0) + (proficient ? bp * (expertise ? 2 : 1) : 0) + num(god.skillBonuses?.[s.name]) + globalPen + cond;
        return { ...s, sources, proficient, expertise, value };
      });
      const skillValue = name => skills.find(s => s.name === name)?.value ?? 0;
      const proficientIn = name => !!skills.find(s => s.name === name)?.proficient;

      // Combate
      const armorType = M.armorTypes.find(a => a.id === d.armor.type) || { name: d.armor.type || '—', defense: 0, reduction: 0 };
      const armorDef = d.armor.equipped ? num(armorType.defense) : 0;
      const shieldDef = !d.shield.equipped || num(d.shield.stakes) < 30 ? 0 : (hasTalent('mestre-escudos') ? bp : Math.ceil(bp / 2));
      const defense = (hasTalent('bruto') ? eff('con') : eff('des')) + (hasTalent('defensor') ? 2 : 0) + (hasTalent('agil') && proficientIn('Agilidade') ? Math.ceil(bp / 2) : 0) + armorDef + shieldDef + num(d.tempMods.defense) + globalPen + condDefense;
      const initiative = proficientIn('Agilidade') ? skillValue('Agilidade') : eff('des') + globalPen + condDex;
      const hasCasting = !mortal || !!d.magic.enabled;
      const castAttr = mortal ? (d.magic.castingAttr || 'fe') : god.casting;
      const castAttack = eff(castAttr) + bp + (!mortal && hasTalent('mestre-habilidades') ? 1 : 0) + globalPen + attrPen(castAttr);
      const castDT = 8 + eff(castAttr) + bp;
      const reduction = (d.armor.equipped ? num(armorType.reduction) : 0) + num(d.tempMods.damageReduction);
      const material = id => M.materials.find(m => m.id === id) || { name: id || '—', attack: 0 };
      const weaponType = id => M.weaponTypes.find(w => w.id === id) || { name: id || '—', die: 8 };
      const diceCount = lvl >= 80 ? 3 : lvl >= 40 ? 2 : 1;
      const weapons = d.weapons.map(w => {
        const attr = w.attr || 'for', mat = material(w.material), wt = weaponType(w.type);
        const attack = eff(attr) + num(mat.attack) + (num(w.stakes) >= 30 ? bp : 0) + num(w.attackExtra) + globalPen + attrPen(attr);
        const bonus = eff(attr) + num(w.damageExtra);
        return { name: w.name || 'Arma', equipped: w.equipped !== false, material: mat.name, type: wt.name, attr, stakes: num(w.stakes), attack, damage: `${diceCount}d${wt.die}${bonus === 0 ? '' : bonus > 0 ? ` + ${bonus}` : ` − ${Math.abs(bonus)}`}`, notes: w.notes || '' };
      });

      // Habilidades: kit da prole, com as trocas do Legado
      const kitOf = id => { const g = M.gods.get(id); return g && g.kit ? g : null; };
      const tag = (list, gid) => list.map(a => ({ ...a, sourceGodId: gid }));
      let abilities = { passives: [], actives: [] };
      const mk = !mortal && kitOf(d.godId);
      if (mk) {
        const sk = kitOf(d.lineage.secondaryGodId);
        if (d.lineage.type === 'normal' || triumvir(main) || !sk) abilities = { passives: tag(mk.passives, d.godId), actives: tag(mk.actives, d.godId) };
        else if (d.lineage.type === 'direct') {
          const passives = tag(mk.passives, d.godId);
          (d.lineage.compoundPassiveReplacements || []).slice(0, 3).forEach(r => { const i = Number(r.primaryIndex), rep = sk.passives.find(x => x.id === r.secondaryId); if (Number.isInteger(i) && i >= 0 && i < passives.length && rep) passives[i] = { ...rep, sourceGodId: sk.id, legacyFrom: sk.id }; });
          const actives = tag(mk.actives, d.godId);
          (d.lineage.compoundActiveReplacements || []).slice(0, 2).forEach(r => {
            const i = Number(r.primaryIndex), target = mk.actives[i], rep = sk.actives.find(x => x.id === r.secondaryId);
            if (Number.isInteger(i) && i >= 0 && i < 5 && target && rep && num(rep.level) <= num(target.level)) actives[i] = { ...rep, sourceGodId: sk.id, legacyFrom: sk.id, legacyOriginalSlot: rep.slot, level: target.level, slot: target.slot, cost: target.cost };
          });
          abilities = { passives, actives };
        } else if (d.lineage.type === 'compound') {
          const pa = new Set(d.lineage.directPrimaryPassives || []), pb = new Set(d.lineage.directSecondaryPassives || []);
          abilities = { passives: [...tag(mk.passives.filter(a => pa.has(a.id)), d.godId), ...tag(sk.passives.filter(a => pb.has(a.id)), sk.id)], actives: [...tag(mk.actives.slice(0, 5), d.godId), ...tag(sk.actives.slice(0, 5), sk.id)] };
        }
      }
      const slugs = A.deitySlugs();
      const slugOf = id => slugs.get(id) || ({ marte: 'marte-ultor', juno: 'juno-mater' }[id] || id);
      const decorate = a => {
        const key = `${a.sourceGodId || d.godId}:${a.type}:${a.id}`;
        const stakes = clamp(num(d.abilityStakes[key]), 0, 30);
        const tier = stakes >= 30 ? '30+' : stakes >= 16 ? '16–29' : '0–15';
        const text = a.tiers ? (stakes >= 30 ? a.tiers.high : stakes >= 16 ? a.tiers.mid : a.tiers.low) : '';
        const owner = M.gods.get(a.sourceGodId);
        const list = owner ? (a.type === 'passive' ? owner.passives : owner.actives) : [];
        const idx = Math.max(0, list.findIndex(x => x.id === a.id));
        const n = a.legacyOriginalSlot ?? (owner ? list[idx]?.slot : a.slot) ?? idx + 1;
        return { ...a, key, stakes, tier, text, ownerName: owner?.name || '', locked: a.type === 'active' && num(a.level) > lvl, anchor: `${slugOf(a.sourceGodId)}-${a.type === 'passive' ? 'passiva' : 'ativa'}-${n || idx + 1}` };
      };
      abilities = { passives: abilities.passives.map(decorate), actives: abilities.actives.map(decorate) };

      // Recursos divinos (valor salvo / máximo quando a fórmula é numérica)
      const stakeOfAbility = (gid, aid) => [...abilities.passives, ...abilities.actives].find(a => a.sourceGodId === gid && a.id === aid)?.stakes || 0;
      const resourceMax = (r, gid) => {
        const m = r.max || {}, type = m.type || 'described';
        if (type === 'fixed') return Math.max(0, num(m.value));
        if (type === 'levelFormula') { const f = String(m.formula || r.maxFormula || '0').toLowerCase(), base = Number((f.match(/-?\d+(?:\.\d+)?/) || ['0'])[0]) || 0; return f.includes('floor') && f.includes('/10') ? Math.max(0, base + Math.floor(lvl / 10)) : Math.max(0, base); }
        if (type === 'stakeProgression') { const v = stakeOfAbility(gid, r.sourceAbilityId), row = (m.progression || []).find(x => v >= num(x.min) && (x.max == null || v <= Number(x.max))); return Math.max(0, num(row?.value)); }
        const n = Number((String(m.formula || r.maxFormula || '0').match(/-?\d+(?:\.\d+)?/) || ['0'])[0]);
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const resources = [];
      for (const gid of [d.godId, ...(sub ? [sub.id] : [])]) {
        const g = M.gods.get(gid);
        for (const r of g?.resources || []) {
          if (r.scope !== 'personal' && r.scope !== 'collective') continue;
          if (resources.some(x => x.gid === gid && x.id === r.id)) continue;
          const max = resourceMax(r, gid);
          resources.push({ gid, id: r.id, name: r.name, value: clamp(num(d.resourceValues[`${gid}:${r.id}`]), 0, max ?? 999), max });
        }
      }

      const fame = (d.roma.fameEntries || []).length ? d.roma.fameEntries.reduce((t, x) => t + num(x.amount), 0) : num(d.roma.fame);
      const affinity = new Map();
      for (const x of d.roma.affinityEntries || []) { const target = String(x.target || '').trim() || 'Sem alvo'; affinity.set(target, (affinity.get(target) || 0) + num(x.amount)); }
      if (!affinity.size) for (const a of d.roma.affinities || []) { const target = M.gods.get(a.godId)?.name || a.godId || 'Afinidade'; affinity.set(target, num(a.value)); }

      const lineageLabel = mortal ? 'Mortal da Névoa'
        : d.lineage.type === 'normal' ? `Prole de ${main?.name || d.godId || '—'}`
          : `${M.lineage?.[d.lineage.type]?.label || (d.lineage.type === 'direct' ? 'Legado Direto' : 'Legado Composto')} · ${main?.name || d.godId} + ${sub?.name || d.lineage.secondaryGodId || '—'}`;

      return {
        god, main, sub, mortal, lineageLabel, bp,
        attrs: ATTRS.map(([k, abbr, label]) => ({ k, abbr, label, value: structural(k), effective: eff(k), divine: mortal ? 0 : num(god.bonuses?.[k]), base: d.baseAttributes[k], level: d.levelAttributes[k], extra: d.attributeExtras[k], talent: talentAttr(k), sacrifice: sacrifice(k), capped: raw(k) > M.rules.attrMax })),
        hp: { cur: hpCur, max: hpMax }, en: { cur: enCur, max: enMax }, sanity: { cur: sanity, stage: sanityStage }, resources,
        skills, defense, fixedDefense, initiative, hasCasting, castAttr, castAttack, castDT, reduction, armorType, armorDef, shieldDef, weapons,
        abilities, fame, affinity: [...affinity.entries()].map(([target, value]) => ({ target, value: clamp(value, -100, 100) })).sort((a, b) => a.target.localeCompare(b.target, 'pt-BR')),
        talents: d.talents.map(t => ({ ...t, def: M.talents.get(t.talentId) || null })),
        conditions: d.conditions.map(n => ({ name: n, data: condData(n) }))
      };
    }

    /* ---------- Estado da janela ---------- */
    const F = { list: [], currentId: store.get('principia_ficha_atual', ''), tab: store.get('principia_ficha_aba', 'geral'), model: null, modelError: null, loaded: false };
    const current = () => F.list.find(r => r.id === F.currentId) || F.list[0] || null;
    const safeImg = url => typeof url === 'string' && (/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(url) || /^https:\/\//i.test(url)) ? url : '';
    const rule = (page, anchor, label, cls = 'fx-rule') => `<button type="button" class="${cls}" data-fx-rule="${esc(page)}|${esc(anchor || '')}" title="Abrir a regra no Guia">${esc(label)} <span aria-hidden="true">→</span></button>`;
    const para = text => esc(String(text || '').trim()).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');

    function renderEmpty() {
      subEl.textContent = 'Prévia de teste';
      bodyEl.innerHTML = `
        <div class="fx-empty" data-fx-drop>
          <div class="fx-empty-art" aria-hidden="true"></div>
          <h2>Sua ficha, dentro do Guia</h2>
          <p>Importe o arquivo <b>.json</b> exportado pela Ficha Oficial (botão <b>Exportar JSON</b>) e mantenha o personagem aberto enquanto consulta o Guia. No computador, use <b>Lado a lado</b>; no celular, alterne pelos botões <b>Ficha</b> e <b>Guia</b>.</p>
          <button type="button" class="os-btn os-btn--primary fx-import-big" data-fx-import>Importar ficha (.json)</button>
          <small>${isMobile() ? 'Escolha o arquivo salvo no celular.' : 'Você também pode arrastar o arquivo para cá.'} A ficha fica só neste navegador: nada é enviado e a Ficha Oficial não muda.</small>
        </div>`;
    }

    function hero(rec, d, v) {
      const banner = safeImg(d.history.bannerUrl), portrait = safeImg(d.history.portraitUrl);
      const bx = clamp(num(d.history.bannerPositionX) || 50, 0, 100), by = clamp(num(d.history.bannerPositionY) || 50, 0, 100), bs = clamp(num(d.history.bannerScale) || 100, 100, 220) / 100;
      const initials = d.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const chips = [
        d.roma.cohort ? `Coorte ${esc(d.roma.cohort)}` : '',
        d.roma.legionRank ? esc(d.roma.legionRank) : '',
        d.roma.rebentoApproved ? 'Rebento de Roma' : '',
        `BP ${signed(v.bp)}`,
        v.hasCasting ? `Conjuração ${ATTR_ABBR[v.castAttr] || v.castAttr}` : ''
      ].filter(Boolean).map(c => `<span>${c}</span>`).join('');
      return `
        <header class="fx-hero">
          <div class="fx-banner">${banner ? `<img src="${esc(banner)}" alt="" style="object-position:${bx}% ${by}%;transform:scale(${bs});transform-origin:${bx}% ${by}%">` : ''}</div>
          <div class="fx-hero-row">
            <div class="fx-portrait">${portrait ? `<img src="${esc(portrait)}" alt="Retrato de ${esc(d.name)}">` : `<span>${esc(initials || '?')}</span>`}</div>
            <div class="fx-id">
              <small>${esc(v.lineageLabel)} · NÍVEL ${d.level}</small>
              <h2>${esc(d.name)}</h2>
              <p>${d.history.tagline ? esc(d.history.tagline) : d.player ? `Jogador(a): ${esc(d.player)}` : ''}</p>
            </div>
          </div>
          <div class="fx-chips">${chips}</div>
        </header>`;
    }

    function bars(v) {
      const bar = (cls, label, cur, max, extra = '') => `<div class="fx-bar ${cls}"><div class="fx-bar-top"><span>${label}</span><b>${cur}${max != null ? ` / ${max}` : ''}</b></div><i><em style="width:${max ? clamp(cur / max, 0, 1) * 100 : 0}%"></em></i>${extra}</div>`;
      const res = v.resources.map(r => `<span><b>${esc(r.name)}</b> ${r.value}${r.max != null ? ` / ${r.max}` : ''}</span>`).join('');
      return `<div class="fx-res">
        ${bar('fx-bar--hp', 'HP', v.hp.cur, v.hp.max)}
        ${v.en.max > 0 ? bar('fx-bar--en', 'Energia', v.en.cur, v.en.max) : ''}
        ${bar('fx-bar--san', `Sanidade · ${esc(v.sanity.stage)}`, v.sanity.cur, 100)}
      </div>${res ? `<div class="fx-divine">${res}</div>` : ''}`;
    }

    function paneGeral(d, v) {
      const attrs = v.attrs.map(a => {
        const parts = [`base ${a.base}`, `nível +${a.level}`, a.talent ? `talento +${a.talent}` : '', !v.mortal ? `divino +${a.divine}` : '', a.extra ? `extra ${signed(a.extra)}` : '', a.sacrifice ? `magia −${a.sacrifice}` : '', a.capped ? 'limitado ao máximo normal' : ''].filter(Boolean).join(' · ');
        return `<div class="fx-attr" title="${esc(parts)}"><span>${a.abbr}</span><b>${a.value}</b>${a.effective !== a.value ? `<small>efetivo ${a.effective}</small>` : `<small>${esc(a.label)}</small>`}</div>`;
      }).join('');
      const facts = [
        ['Defesa', v.fixedDefense != null ? `fixa ${v.fixedDefense}` : `1d20 ${signed(v.defense)}`],
        ['Iniciativa', `1d20 ${signed(v.initiative)}`],
        ['Ataque de conjuração', v.hasCasting ? `1d20 ${signed(v.castAttack)}` : '—'],
        ['DT de conjuração', v.hasCasting ? String(v.castDT) : '—'],
        ['Redução de dano', String(v.reduction)],
        ['Bônus de proficiência', signed(v.bp)]
      ].map(([k, val]) => `<div><span>${k}</span><b>${val}</b></div>`).join('');
      const groups = ATTRS.map(([k, abbr]) => {
        const list = v.skills.filter(s => s.attr === k);
        if (!list.length) return '';
        return `<div class="fx-skill-group"><h4>${abbr}</h4>${list.map(s => `<div class="fx-skill${s.proficient ? ' is-prof' : ''}${s.expertise ? ' is-exp' : ''}" title="${esc(s.sources.join(' · ') || 'Sem treinamento')}"><span>${esc(s.name)}</span>${s.expertise ? '<em>EXP</em>' : s.proficient ? '<em>PROF</em>' : ''}<b>${signed(s.value)}</b></div>`).join('')}</div>`;
      }).join('');
      const talents = v.talents.length ? v.talents.map(t => {
        const params = Object.values(t.params || {}).filter(x => typeof x === 'string' && x).join(' · ');
        return `<details class="fx-talent"><summary><b>${esc(t.def?.name || t.talentId)}</b>${params ? `<small>${esc(params)}</small>` : ''}</summary>${t.def?.description ? `<p>${para(t.def.description)}</p>` : ''}${t.notes ? `<p class="fx-muted">${para(t.notes)}</p>` : ''}</details>`;
      }).join('') : '<p class="fx-muted">Nenhum talento registrado.</p>';
      const conds = v.conditions.length ? `<div class="fx-tags">${v.conditions.map(c => `<span title="${esc(c.data?.description || '')}">${esc(c.name)}</span>`).join('')}</div>` : '<p class="fx-muted">Nenhuma condição ativa.</p>';
      return `
        <section class="fx-block"><div class="fx-block-head"><h3>Atributos</h3></div><div class="fx-attrs">${attrs}</div></section>
        <section class="fx-block"><div class="fx-block-head"><h3>Combate</h3>${rule('combate', 'rolagens', 'Regras de combate')}</div><div class="fx-facts">${facts}</div></section>
        <section class="fx-block"><div class="fx-block-head"><h3>Perícias</h3>${rule('sistema', 'pericias', 'Perícias no Guia')}</div><div class="fx-skills">${groups}</div></section>
        <section class="fx-block"><div class="fx-block-head"><h3>Talentos</h3>${rule('sistema', 'talentos', 'Talentos no Guia')}</div>${talents}</section>
        <section class="fx-block"><div class="fx-block-head"><h3>Condições${d.exhaustion ? ` · Exaustão ${d.exhaustion}` : ''}</h3>${rule('combate', 'condicoes', 'Condições no Guia')}</div>${conds}</section>`;
    }

    function paneHabilidades(d, v) {
      const item = a => `
        <details class="fx-ab${a.locked ? ' is-locked' : ''}">
          <summary>
            <span class="fx-ab-type">${a.type === 'passive' ? 'PASSIVA' : `NV ${esc(a.level ?? '—')}`}</span>
            <span class="fx-ab-name"><b>${esc(a.name)}</b>${a.legacyFrom ? `<small>Legado · ${esc(a.ownerName)}</small>` : ''}</span>
            <span class="fx-ab-meta">${a.type === 'active' && a.cost != null ? `<em>${esc(a.cost)} EN</em>` : ''}<em class="fx-stake" title="${a.stakes} estacas · faixa ${a.tier}">${a.stakes}<span> · ${a.tier}</span></em></span>
          </summary>
          <div class="fx-ab-body">
            ${a.locked ? `<p class="fx-warn">Disponível a partir do nível ${esc(a.level)}.</p>` : ''}
            ${a.summary ? `<p>${para(a.summary)}</p>` : ''}
            ${a.text ? `<div class="fx-tier"><span>Estacas ${a.tier}</span><p>${para(a.text)}</p></div>` : ''}
            ${a.extra ? `<p class="fx-muted">${para(a.extra)}</p>` : ''}
            ${rule('deuses', a.anchor, 'Ver a habilidade completa no Guia')}
          </div>
        </details>`;
      if (v.mortal) return `<section class="fx-block"><p class="fx-muted">Personagens mortais não possuem kit divino.${d.magic.enabled ? ' As magias aparecem na aba Itens.' : ''}</p></section>`;
      if (!v.abilities.passives.length && !v.abilities.actives.length) return `<section class="fx-block"><p class="fx-muted">Não encontrei o kit de ${esc(v.main?.name || d.godId || 'esta prole')} no Core.</p></section>`;
      return `
        <section class="fx-block"><div class="fx-block-head"><h3>Passivas</h3>${v.main ? rule('deuses', `deus-${A.deitySlugs().get(v.main.id) || v.main.id}`, `Kit de ${v.main.name}`) : ''}</div>${v.abilities.passives.map(item).join('')}</section>
        <section class="fx-block"><div class="fx-block-head"><h3>Ativas</h3></div>${v.abilities.actives.map(item).join('')}</section>`;
    }

    function paneItens(d, v) {
      const weapons = v.weapons.length ? v.weapons.map(w => `<div class="fx-item"><div><b>${esc(w.name)}</b><small>${esc([w.type, w.material, ATTR_ABBR[w.attr] || w.attr, w.stakes ? `estacas ${w.stakes}` : ''].filter(Boolean).join(' · '))}</small></div><div class="fx-item-nums"><span>Ataque <b>1d20 ${signed(w.attack)}</b></span><span>Dano <b>${esc(w.damage)}</b></span></div></div>`).join('') : '<p class="fx-muted">Nenhuma arma registrada.</p>';
      const gear = [
        d.armor.name || d.armor.equipped ? `<div class="fx-item"><div><b>${esc(d.armor.name || 'Armadura')}</b><small>${esc([v.armorType.name, d.armor.material, d.armor.equipped ? 'equipada' : 'guardada'].filter(Boolean).join(' · '))}</small></div><div class="fx-item-nums"><span>Defesa <b>${signed(v.armorDef)}</b></span></div></div>` : '',
        d.shield.name || d.shield.equipped ? `<div class="fx-item"><div><b>${esc(d.shield.name || 'Escudo')}</b><small>${esc([d.shield.material, d.shield.equipped ? 'equipado' : 'guardado', d.shield.stakes ? `estacas ${d.shield.stakes}` : ''].filter(Boolean).join(' · '))}</small></div><div class="fx-item-nums"><span>Defesa <b>${signed(v.shieldDef)}</b></span></div></div>` : ''
      ].join('') || '<p class="fx-muted">Sem armadura ou escudo registrados.</p>';
      const items = (d.inventory.items || []).length ? d.inventory.items.map(it => `<div class="fx-item"><div><b>${esc(it.name || 'Item')}${num(it.qty) > 1 ? ` <em>×${num(it.qty)}</em>` : ''}</b>${it.effect || it.notes ? `<small>${esc(it.effect || it.notes)}</small>` : ''}</div></div>`).join('') : '<p class="fx-muted">Inventário vazio.</p>';
      const magic = d.magic.enabled ? `<section class="fx-block"><div class="fx-block-head"><h3>Magia · círculo ${esc(d.magic.circle)}</h3>${rule('magia', 'circulos', 'Magia no Guia')}</div>${(d.magic.spells || []).length ? d.magic.spells.map(sp => `<div class="fx-item"><div><b>${esc(sp.name || 'Magia')}</b><small>${esc([`círculo ${sp.circle || 1}`, sp.concentration ? 'concentração' : '', sp.ritual ? 'ritual' : ''].filter(Boolean).join(' · '))}</small></div></div>`).join('') : '<p class="fx-muted">Nenhuma magia registrada.</p>'}</section>` : '';
      const fams = (d.familiars.entries || []).length ? `<section class="fx-block"><div class="fx-block-head"><h3>Familiares</h3>${rule('sistema', 'familiares', 'Familiares no Guia')}</div>${d.familiars.entries.map(f => `<div class="fx-item"><div><b>${esc(f.name || 'Familiar')}</b><small>${esc([f.type, f.species].filter(Boolean).join(' · '))}</small></div></div>`).join('')}</section>` : '';
      return `
        <section class="fx-block"><div class="fx-block-head"><h3>Bolsa</h3>${rule('sistema', 'economia', 'Economia no Guia')}</div><div class="fx-money"><div><span>Áureos</span><b>${num(d.inventory.aureus)}</b></div><div><span>Denários</span><b>${num(d.inventory.denarius)}</b></div></div></section>
        <section class="fx-block"><div class="fx-block-head"><h3>Armas</h3>${rule('crafting', 'forja', 'Forja no Guia')}</div>${weapons}</section>
        <section class="fx-block"><div class="fx-block-head"><h3>Proteção</h3></div>${gear}</section>
        <section class="fx-block"><div class="fx-block-head"><h3>Inventário</h3></div>${items}</section>
        ${magic}${fams}`;
    }

    function paneRoma(d, v) {
      const ranks = [['Cargo na legião', d.roma.legionRank], ['Cargo religioso', d.roma.religioRank], ['Outro cargo', d.roma.customRank], ['Coorte', d.roma.cohort], ['Trabalho', d.roma.job ? `${d.roma.job}${num(d.roma.jobSalary) ? ` · ${num(d.roma.jobSalary)} ${d.roma.jobPeriod || ''}` : ''}` : '']].filter(([, x]) => x);
      const aff = v.affinity.length ? v.affinity.map(a => `<div class="fx-aff"><span>${esc(a.target)}</span><i><em style="left:${a.value < 0 ? 50 + a.value / 2 : 50}%;width:${Math.abs(a.value) / 2}%" class="${a.value < 0 ? 'neg' : ''}"></em></i><b>${signed(a.value)}</b></div>`).join('') : '<p class="fx-muted">Nenhuma afinidade registrada.</p>';
      return `
        <section class="fx-block"><div class="fx-block-head"><h3>Fama</h3>${rule('sistema', 'hierarquia', 'Hierarquia & Fama')}</div><div class="fx-money"><div><span>Fama acumulada</span><b>${v.fame}</b></div></div></section>
        <section class="fx-block"><div class="fx-block-head"><h3>Afinidades</h3>${rule('sistema', 'afinidade', 'Afinidade no Guia')}</div>${aff}</section>
        <section class="fx-block"><div class="fx-block-head"><h3>Posição em Roma</h3>${rule('roma', 'coortes', 'Coortes no Guia')}</div>${ranks.length ? `<div class="fx-facts">${ranks.map(([k, x]) => `<div><span>${esc(k)}</span><b>${esc(x)}</b></div>`).join('')}</div>` : '<p class="fx-muted">Nenhum cargo registrado.</p>'}</section>`;
    }

    function paneHistoria(d) {
      const fields = [['Descrição', d.history.description], ['Resumo', d.history.summary], ['Origem', d.history.origin], ['Nascimento', d.history.birth], ['Idade', d.history.age], ['Residência', d.history.residence], ['Afiliação', d.history.affiliation], ['Objetivos', d.history.goals], ['Relações', d.history.relationships], ['Marcos', d.history.milestones], ['Anotações', d.notes]].filter(([, x]) => String(x || '').trim());
      return fields.length ? fields.map(([k, x]) => `<section class="fx-block"><div class="fx-block-head"><h3>${k}</h3></div><div class="fx-text"><p>${para(x)}</p></div></section>`).join('') : '<section class="fx-block"><p class="fx-muted">Nenhum texto de história preenchido nesta ficha.</p></section>';
    }

    const TABS = [['geral', 'Geral'], ['habilidades', 'Habilidades'], ['itens', 'Itens'], ['roma', 'Roma'], ['historia', 'História']];
    function renderSheet() {
      const rec = current();
      if (!rec) { renderEmpty(); return; }
      F.currentId = rec.id;
      const d = normalize(rec.data);
      subEl.textContent = d.name;
      const options = F.list.map(r => `<option value="${esc(r.id)}"${r.id === rec.id ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
      const top = `<div class="fx-top"><label class="fx-pick"><span class="os-vh">Personagem</span><select data-fx-select>${options}</select></label><button type="button" class="os-btn" data-fx-import>Importar</button><button type="button" class="os-btn os-btn--ghost" data-fx-remove title="Remover esta ficha da Principia">Remover</button></div>`;
      if (!F.model) {
        bodyEl.innerHTML = `<div class="fx" style="--fx-accent:${PALETTE[d.appearance.palette] || PALETTE.red}">${top}<div class="fx-loading">${F.modelError ? `<p>Não consegui carregar as regras do Core agora.</p><button type="button" class="os-btn" data-fx-retry>Tentar de novo</button>` : '<div class="os-splash-bar"><i></i></div><p>Carregando as regras do Core…</p>'}</div></div>`;
        return;
      }
      let v;
      try { v = compute(d, F.model); }
      catch (err) { console.error('[Principia · Ficha] Falha ao montar a ficha.', err); bodyEl.innerHTML = `<div class="fx">${top}<div class="fx-loading"><p>Não consegui ler esta ficha. Confira se o arquivo veio da Ficha Oficial.</p></div></div>`; return; }
      const tab = TABS.some(t => t[0] === F.tab) ? F.tab : 'geral';
      const pane = tab === 'habilidades' ? paneHabilidades(d, v) : tab === 'itens' ? paneItens(d, v) : tab === 'roma' ? paneRoma(d, v) : tab === 'historia' ? paneHistoria(d) : paneGeral(d, v);
      const exported = d.updatedAt ? new Date(d.updatedAt) : null;
      bodyEl.innerHTML = `
        <div class="fx${d.appearance.mode === 'light' ? ' is-light-sheet' : ''}" style="--fx-accent:${PALETTE[d.appearance.palette] || PALETTE.red}">
          ${top}
          ${hero(rec, d, v)}
          ${bars(v)}
          <nav class="fx-tabs" role="tablist" aria-label="Seções da ficha">${TABS.map(([k, label]) => `<button type="button" role="tab" aria-selected="${k === tab}" data-fx-tab="${k}">${label}</button>`).join('')}</nav>
          <div class="fx-pane" role="tabpanel">${pane}</div>
          <p class="fx-foot">Prévia de teste lida do JSON da Ficha Oficial${exported && !Number.isNaN(exported.getTime()) ? ` (salvo em ${exported.toLocaleDateString('pt-BR')})` : ''}, com regras do Core ${esc(F.model.version)}. As contas seguem as fórmulas da ficha atual e podem mudar com a nova ficha; bônus de Rebento e efeitos de habilidades sobre perícias ainda não entram. ${persistent ? 'A ficha fica salva só neste navegador.' : 'Este navegador não permite guardar a ficha: ela fica só nesta aba.'} Nada é enviado nem alterado na Ficha Oficial.</p>
        </div>`;
    }

    function render() {
      if (!F.list.length) renderEmpty(); else renderSheet();
    }

    async function ensureModel() {
      if (F.model) return;
      try { F.model = await loadModel(); F.modelError = null; }
      catch (err) { console.warn('[Principia · Ficha] Regras do Core indisponíveis.', err); F.modelError = err; }
      if (A.WM.isOpen('ficha')) render();
    }

    async function refresh() {
      F.list = await dbAll();
      F.loaded = true;
      if (!F.list.some(r => r.id === F.currentId)) F.currentId = F.list[0]?.id || '';
      render();
      if (F.list.length) ensureModel();
    }

    /* ---------- Importação ---------- */
    const fichaId = data => `${String(data.name || '').trim().toLowerCase()}|${data.createdAt || ''}`;
    async function importFiles(files) {
      let last = null, count = 0;
      for (const file of [...files]) {
        if (!/\.json$/i.test(file.name) && file.type && file.type !== 'application/json') { toast(`${file.name} não é um arquivo .json.`); continue; }
        if (file.size > 30 * 1024 * 1024) { toast(`${file.name} é grande demais.`); continue; }
        let data;
        try { data = JSON.parse(await file.text()); } catch { toast(`Não consegui ler ${file.name}: o JSON está corrompido.`); continue; }
        if (!data || typeof data !== 'object' || Array.isArray(data) || !(data.baseAttributes || data.godId || data.originType)) { toast(`${file.name} não parece uma ficha da Duodécima.`); continue; }
        const id = fichaId(data);
        const rec = { id, name: String(data.name || 'Personagem sem nome').slice(0, 80), importedAt: new Date().toISOString(), data };
        await dbPut(rec);
        last = rec; count++;
      }
      if (!last) return;
      F.currentId = last.id;
      store.set('principia_ficha_atual', last.id);
      await refresh();
      toast(count > 1 ? `${count} fichas importadas.` : `Ficha de ${last.name} importada.`);
    }

    /* ---------- Eventos ---------- */
    fileEl.addEventListener('change', () => { if (fileEl.files?.length) importFiles(fileEl.files); fileEl.value = ''; });
    bodyEl.addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); bodyEl.classList.add('is-drop'); } });
    bodyEl.addEventListener('dragleave', e => { if (!bodyEl.contains(e.relatedTarget)) bodyEl.classList.remove('is-drop'); });
    bodyEl.addEventListener('drop', e => { e.preventDefault(); bodyEl.classList.remove('is-drop'); if (e.dataTransfer?.files?.length) importFiles(e.dataTransfer.files); });

    bodyEl.addEventListener('change', e => {
      const sel = e.target.closest('[data-fx-select]');
      if (sel) { F.currentId = sel.value; store.set('principia_ficha_atual', sel.value); render(); bodyEl.scrollTop = 0; }
    });
    bodyEl.addEventListener('click', async e => {
      const t = e.target;
      if (t.closest('[data-fx-import]')) { fileEl.click(); return; }
      const tab = t.closest('[data-fx-tab]');
      if (tab) { F.tab = tab.dataset.fxTab; store.set('principia_ficha_aba', F.tab); render(); bodyEl.querySelector('.fx-tabs')?.scrollIntoView({ block: 'nearest' }); return; }
      const ruleBtn = t.closest('[data-fx-rule]');
      if (ruleBtn) { const [page, anchor] = ruleBtn.dataset.fxRule.split('|'); A.openBeside(page, anchor || null); return; }
      if (t.closest('[data-fx-retry]')) { F.modelError = null; render(); ensureModel(); return; }
      if (t.closest('[data-fx-remove]')) {
        const rec = current();
        if (!rec) return;
        if (!confirm(`Remover a ficha de ${rec.name} do Guia?\nO seu arquivo JSON e a Ficha Oficial não são afetados.`)) return;
        await dbDelete(rec.id);
        F.currentId = '';
        store.del('principia_ficha_atual');
        await refresh();
        toast('Ficha removida do Guia.');
      }
    });

    P.hooks.ficha = {
      open() {
        if (!F.loaded) refresh(); else render();
        if (F.list.length || !F.loaded) ensureModel();
      }
    };
    // Prepara a lista em segundo plano (sem baixar as regras até a ficha ser aberta).
    dbAll().then(list => { F.list = list; F.loaded = true; if (!F.list.some(r => r.id === F.currentId)) F.currentId = F.list[0]?.id || ''; });
  }

  if (window.PRINCIPIA && window.PRINCIPIA.api) start();
  else window.addEventListener('principia:ready', start, { once: true });
})();
