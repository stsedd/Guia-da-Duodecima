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
  const find = id => catalog.find(def => def.id === id);
  function normalize(list) {
    const result = [];
    for (const entry of Array.isArray(list) ? list : []) {
      const def = find(entry?.id);
      if (!def || ![0,1,2].includes(entry.tier) || result.some(e => e.id === def.id || e.id === def.conflict)) continue;
      const max = def.rounds[entry.tier];
      if (max && !(Number.isInteger(entry.rounds) && entry.rounds > 0)) continue;
      result.push({id:def.id, tier:entry.tier, rounds:max ? Math.min(entry.rounds,max) : 0});
    }
    return result;
  }
  function add(state, id, tier) {
    const def = find(id);
    if (!def || ![0,1,2].includes(tier)) return 'Selecione um efeito e a estaca de quem o concedeu.';
    const list = state.receivedEffects || [];
    if (list.some(e => e.id === id)) return 'Este efeito já está ativo.';
    if (list.some(e => e.id === def.conflict)) return 'Encerre ' + find(def.conflict).name + ' antes de aplicar este efeito.';
    state.receivedEffects = [...list, {id, tier, rounds:def.rounds[tier]}];
    return '';
  }
  function advance(state) {
    state.receivedEffects = (state.receivedEffects || []).filter(e => e.rounds !== 1)
      .map(e => e.rounds ? {...e, rounds:e.rounds - 1} : e);
  }
  function bonuses(state) {
    const list = state.receivedEffects || [];
    const mist = list.find(e => e.id === 'bencao-oceanica');
    const dedication = list.find(e => e.id === 'dedicacao-compartilhada');
    const fortune = list.find(e => e.id === 'bencao-boa-hora' || e.id === 'mau-agouro');
    return {defense:mist ? (mist.tier ? 2 : 1) : 0, d20:dedication ? dedication.tier + 1 : 0,
      fortune:fortune ? (fortune.id === 'mau-agouro' ? -1 : 1) : 0};
  }
  window.FichaEfeitos = {catalog, find, normalize, add, advance, bonuses};
})();