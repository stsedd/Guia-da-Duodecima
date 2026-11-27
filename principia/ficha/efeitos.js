/* Catálogo dos efeitos recebidos. A estaca pertence à fonte do efeito. */
(() => {
  'use strict';
  const catalog = [
    {id:'inspiracao-divina', god:'febo', name:'Inspiração Divina', source:'Febo', rounds:[0,0,0],
      summary:t => ['1d4','1d6','1d8'][t] + ' disponível · 1 uso · até 10 min'},
    {id:'bencao-boa-hora', god:'fortuna', name:'Bênção da Boa Hora', source:'Fortuna', rounds:[2,3,3], conflict:'mau-agouro',
      summary:() => '+1d4 em ataques e resistências'},
    {id:'mau-agouro', god:'fortuna', name:'Mau Agouro', source:'Fortuna', rounds:[2,3,3], conflict:'bencao-boa-hora',
      summary:() => '−1d4 em ataques e resistências'},
    {id:'bencao-oceanica', god:'netuno', name:'Bênção Oceânica', source:'Netuno', rounds:[2,2,2],
      summary:t => '+' + (t ? 2 : 1) + ' Defesa e RD'},
    {id:'dedicacao-compartilhada', god:'aemulatio', name:'Dedicação Compartilhada', source:'Aemulatio', rounds:[1,1,2],
      summary:t => '+' + (t + 1) + ' em rolagens de d20'}
  ];
  const additions = [
  {
    "god": "netuno",
    "id": "escudo-oceanico",
    "name": "Escudo Oceânico",
    "source": "Netuno",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Reação ao impacto · reduza 1d8 + Fé",
      "Reação ao impacto · reduza 2d8 + Fé",
      "Reação ao impacto · reduza 3d8 + Fé · espinhos em falha de DES"
    ]
  },
  {
    "god": "netuno",
    "id": "restauracao",
    "name": "Restauração Oceânica",
    "source": "Netuno",
    "rounds": [
      0,
      0,
      2
    ],
    "labels": [
      "Cura imediata · 1d6 + Fé",
      "Cura imediata · 2d6 + Fé",
      "Cura 3d8 + Fé · em água, +1d4 + Fé no início do turno"
    ]
  },
  {
    "god": "netuno",
    "id": "cataclismo",
    "name": "Cataclismo Oceânico",
    "source": "Netuno",
    "rounds": [
      2,
      2,
      2
    ],
    "labels": [
      "RD +2 enquanto estiver na área",
      "RD +4 enquanto estiver na área",
      "RD +4 na área · 1d8 + Fé de PV temporários ao receber"
    ]
  },
  {
    "god": "netuno",
    "id": "chamado-oceano",
    "name": "Chamado do Oceano",
    "source": "Netuno",
    "rounds": [
      0,
      2,
      2
    ],
    "labels": [
      "",
      "Águas profundas · +1d4 quando o inimigo afetado sofrer dano",
      "Águas profundas · +1d4 em ataques contra os inimigos afetados"
    ],
    "min": 1
  },
  {
    "god": "iuppiter",
    "id": "senhor-dia",
    "name": "Senhor do Dia",
    "source": "Júpiter",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "+1 em d20 · de dia sob luz natural",
      "+2 em d20 · de dia sob luz natural",
      "+3 em d20 · de dia sob luz natural"
    ],
    "self": true
  },
  {
    "god": "somnos",
    "id": "calma-sonhar",
    "name": "Calma do Sonhar",
    "source": "Somnus",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "",
      "",
      "+1 no próximo teste contra medo, raiva ou desespero"
    ],
    "min": 2
  },
  {
    "god": "somnos",
    "id": "a-lira",
    "name": "A Lira",
    "source": "Somnus",
    "rounds": [
      1,
      2,
      3
    ],
    "labels": [
      "Acalma medo, raiva ou pânico leve",
      "+1 contra manipulação emocional e medo · até 2 turnos",
      "Proteção contra estados emocionais extremos e distorções leves"
    ]
  },
  {
    "god": "somnos",
    "id": "dominio-sono-profundo",
    "name": "Domínio do Sono Profundo",
    "source": "Somnus",
    "rounds": [
      0,
      3,
      3
    ],
    "labels": [
      "",
      "Na área · cura 2d8 + Fé de HP ou sanidade · +2 contra medo e cansaço",
      "Na área · cura 3d8 + Fé de HP ou sanidade · +4 contra medo e cansaço"
    ],
    "min": 1
  },
  {
    "god": "ceres",
    "id": "exploradora-natural",
    "name": "Exploradora Natural",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Viagem · grupo ignora terreno difícil natural e evita se perder"
    ],
    "fixed": true
  },
  {
    "god": "ceres",
    "id": "veu-natureza",
    "name": "Véu da Natureza",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      1
    ],
    "labels": [
      "",
      "",
      "Aliado tocado · invisibilidade e +3 Furtividade · encerre ao atacar ou se afastar"
    ],
    "min": 2
  },
  {
    "god": "ceres",
    "id": "companheiro-animal",
    "name": "Companheiro Animal",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "+2 na tarefa compatível em que o familiar auxiliar"
    ]
  },
  {
    "god": "ceres",
    "id": "murchar-florescer",
    "name": "Murchar e Florescer",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Cura 1d8 + Fé · vegetação pode somar 1d4",
      "Cura total 2d8 + Fé · divide entre até 2 · vegetação pode somar 1d6",
      "Cura 3d8 + Fé em um ou divide 2d8 + Fé entre até 3"
    ]
  },
  {
    "god": "ceres",
    "id": "frutos-colheita",
    "name": "Frutos da Boa Colheita",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Fruto recebido · 1d4 + Fé ao consumir",
      "Fruto recebido · 1d6 + Fé ao consumir",
      "Fruto recebido · 1d8 + Fé · possível alívio de fadiga"
    ]
  },
  {
    "god": "ceres",
    "id": "crescimento-purificacao",
    "name": "Crescimento e Purificação",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Cobertura leve criada pela vegetação"
    ]
  },
  {
    "god": "ceres",
    "id": "geocinese",
    "name": "Geocinese",
    "source": "Ceres",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "Cobertura simples de terra",
      "Barreira ou trincheira de terra",
      "Abrigo criado no terreno"
    ]
  }
];
  additions.push(...[
  {
    "god": "juventas",
    "source": "Juventas",
    "id": "aura-protecao",
    "name": "Aura da Proteção",
    "rounds": [
      0,
      0,
      0
    ],
    "labels": [
      "+1 em resistências enquanto na aura",
      "+2 em resistências enquanto na aura",
      "+3 em resistências · repetir uma falha por combate"
    ]
  },
  {
    "god": "juventas",
    "source": "Juventas",
    "id": "discipula-vida",
    "name": "Discípula da Vida",
    "rounds": [
      1,
      2,
      2
    ],
    "labels": [
      "Vantagem em resistências · cura maximizada",
      "Vantagem em resistências · Defesa +1 · cura maximizada",
      "Vantagem em resistências · Defesa +2 · cura maximizada"
    ]
  },
  {
    "god": "jano",
    "source": "Jano",
    "id": "julgamento-possibilidades",
    "name": "Julgamento das Possibilidades",
    "rounds": [
      2,
      3,
      3
    ],
    "labels": [
      "+1 em Defesa, Intuição e reposicionamento na área",
      "+1 em Defesa, Intuição e reposicionamento na área",
      "+2 em Defesa, Intuição e reposicionamento na área"
    ]
  },
  {
    "god": "aeolos",
    "source": "Aeolos",
    "id": "dominio-correntes",
    "name": "Domínio das Correntes",
    "rounds": [
      2,
      3,
      3
    ],
    "labels": [
      "+2 em Defesa, deslocamento e ações coordenadas na área"
    ]
  },
  {
    "god": "bellona",
    "source": "Bellona",
    "id": "gloria-roma",
    "name": "Glória de Roma",
    "rounds": [
      2,
      2,
      3
    ],
    "labels": [
      "+1 em ataques corpo a corpo e contra medo e desorganização",
      "+1 em ataques corpo a corpo (+2 com dois aliados próximos afetados)",
      "+2 em testes, ataques, defesas e resistências · RD 1d6 uma vez por turno"
    ]
  }
]);
  const archived = new Set(['exploradora-natural','crescimento-purificacao','geocinese']);
  for (const effect of additions) {
    catalog.push({...effect, archived:archived.has(effect.id), summary:t => effect.labels[t] || effect.labels[0]});
  }
  const casterName = value => typeof value === 'string' ? value.trim().slice(0,60) : '';
  // Fontes de Netuno têm durações próprias. Registros da mesma habilidade mantêm a duração por fonte.
  const same = (e, def, caster) => e.id === def.id && (def.god !== 'netuno' || (e.caster || '').toLowerCase() === caster.toLowerCase());
  const find = id => catalog.find(def => def.id === id);
  function aceitaQuerido(def, tier) {
    return !!def && !def.self && def.id !== 'mau-agouro' && def.id !== 'chamado-oceano' && def.rounds[tier] > 0;
  }
  function normalize(list) {
    const result = [];
    for (const entry of Array.isArray(list) ? list : []) {
      const def = find(entry?.id);
      if (!def || ![0,1,2].includes(entry.tier) || entry.tier < (def.min || 0) || result.some(e => same(e,def,casterName(entry.caster)) || e.id === def.conflict)) continue;
      const querido = entry.querido === true && aceitaQuerido(def, entry.tier);
      const max = def.rounds[entry.tier] + Number(querido);
      if (max && !(Number.isInteger(entry.rounds) && entry.rounds > 0)) continue;
      result.push({id:def.id, querido, caster:casterName(entry.caster), formation:def.id==='gloria-roma' && entry.tier===1 && entry.formation===true, fire:def.id === 'bencao-oceanica' && entry.tier === 2 && entry.fire === true, tier:entry.tier, rounds:max ? Math.min(entry.rounds,max) : 0});
    }
    return result;
  }
  function add(state, id, tier, sourceName = '', fire = false, comQuerido = false) {
    const def = find(id);
    if (!def || ![0,1,2].includes(tier)) return 'Selecione um efeito e a estaca de quem o concedeu.';
    const list = state.receivedEffects || [];
    if (tier < (def.min || 0)) return 'O benefício para aliados exige uma estaca maior.';
    const caster = casterName(sourceName);
    if (list.some(e => same(e,def,caster))) return 'Este efeito já está ativo.';
    if (list.some(e => e.id === def.conflict)) return 'Encerre ' + find(def.conflict).name + ' antes de aplicar este efeito.';
    const querido = comQuerido === true && aceitaQuerido(def, tier);
    state.receivedEffects = [...list, {id, tier, caster, querido, fire:id === 'bencao-oceanica' && tier === 2 && fire === true, rounds:def.rounds[tier] + Number(querido)}];
    return '';
  }
  function advance(state) {
    state.receivedEffects = (state.receivedEffects || []).filter(e => e.rounds !== 1)
      .map(e => e.rounds ? {...e, rounds:e.rounds - 1} : e);
  }
  function bonuses(state) {
    const list = state.receivedEffects || [];
    const highest = id => Math.max(-1, ...list.filter(e => e.id === id).map(e => e.tier));
    const mist = highest('bencao-oceanica'), storm = highest('cataclismo');
    const defense = mist < 0 ? 0 : mist === 0 ? 1 : 2;
    const daylight = highest('senhor-dia') + 1;
    const dedication = list.find(e => e.id === 'dedicacao-compartilhada');
    const fortune = list.find(e => e.id === 'bencao-boa-hora' || e.id === 'mau-agouro');
    const aura = highest('aura-protecao') + 1, life = highest('discipula-vida');
    const janus = highest('julgamento-possibilidades');
    const insight = janus < 0 ? 0 : janus === 2 ? 2 : 1;
    const glory = list.find(e => e.id === 'gloria-roma');
    const melee = !glory || glory.tier === 2 ? 0 : (glory.tier === 1 && glory.formation ? 2 : 1);
    return {resistance:aura, advantage:life >= 0, melee, insight, stealth:highest('veu-natureza') === 2 ? 3 : 0, defense:defense + insight + Math.max(0,life) + (highest('dominio-correntes') >= 0 ? 2 : 0), reduction:defense + (storm < 0 ? 0 : storm === 0 ? 2 : 4), d20:daylight + (glory?.tier === 2 ? 2 : 0) + (dedication ? dedication.tier + 1 : 0),
      fortune:fortune ? (fortune.id === 'mau-agouro' ? -1 : 1) : 0};
  }
  window.FichaEfeitos = {catalog, find, aceitaQuerido, normalize, add, advance, bonuses};
})();