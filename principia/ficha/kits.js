/* Ofertas da ficha. As referências das habilidades oficiais vêm do Core.
   Os exemplos de Júpiter estão identificados como material de playtest. */
(() => {
  'use strict';
  const proposta = (id, name, domain, effect, summary) => ({
    id, name, domains: [domain], effects: [effect], summary, activation: 'Ação',
    level: 1, cost: 20, type: 'active', playtest: true
  });
  const catalogos = {
    iuppiter: {
      abilities: [
        proposta('jove-sinal', 'Aerosinais', 'Tempestade', 'Comunicação',
          'Envie pelo vento uma frase de até dez palavras a um aliado visível a até 18 m. Somente ele ouve o recado. Efeito imediato, sem resposta.'),
        proposta('jove-ordem', 'Voz de Comando', 'Autoridade', 'Suporte',
          'Escolha um aliado que possa ouvir você a até 9 m. Ele pode usar sua reação agora para se deslocar até 3 m pelas regras normais de movimento.'),
        proposta('jove-guarda', 'Guarda do Capitólio', 'Soberania', 'Proteção',
          'Escolha um aliado a até 3 m. Reduza em 1d6 o próximo dano que ele sofrer antes do início do seu próximo turno. Aplicações simultâneas não se somam.'),
        proposta('jove-auspicio', 'Olhar do Áugure', 'Presságios', 'Exploração',
          'Observe o céu por uma ação e indique uma passagem visível a até 12 m. O mestre informa se atravessá-la agora expõe você a um perigo imediato que já esteja presente. A resposta não revela a origem do perigo.')
      ],
      slots: {
        1: { offers: ['jove-sinal', 'jove-ordem', 'jove-auspicio'] },
        2: { offers: ['jove-sinal', 'jove-guarda', 'jove-auspicio'] }
      }
    }
  };

  function spaces(set, state, catalogs = catalogos) {
    return (set?.actives || []).filter(a => !a.isExtra).map((base, index) => {
      const god = base.sourceGodId || state.godId;
      const order = base.slot || index + 1;
      const config = catalogs[god] || {};
      const slot = base.legacyFrom ? {} : config.slots?.[order] || {};
      const level = slot.unlockLevel ?? base.level;
      const original = { ...base, ...config.metadata?.[base.id], level };
      const definitions = [...(config.abilities || []), ...(set.actives.filter(a => a.sourceGodId === god))];
      const options = [original];
      for (const offer of slot.offers || []) {
        const def = definitions.find(a => a.id === (offer.id || offer));
        if (!def || options.some(a => a.id === def.id)) continue;
        options.push({ ...def, ...config.metadata?.[def.id], ...offer.override, sourceGodId: god, slot: order,
          level: Math.max(level, offer.override?.level ?? def.level ?? 1) });
      }
      const key = [state.godId, god, base.legacyReplacedAbilityId || base.id, base.legacyFrom || ''].join(':');
      return { key, base, level, options };
    });
  }
  function chosen(slot, selections) {
    return slot.options.find(a => a.id === selections?.[slot.key]) || slot.options[0];
  }
  function reason(a, previous) {
    const same = previous.filter(p => p.id === a.id && p.sourceGodId === a.sourceGodId);
    if (same.length && !(a.repeatable && a.repeatRanks?.[same.length])) return 'Já adquirida em outro espaço.';
    const req = a.prerequisites || {};
    for (const id of req.abilities || []) {
      if (!previous.some(p => p.id === id && p.sourceGodId === a.sourceGodId)) return 'Requer a habilidade anterior ' + id + '.';
    }
    for (const [domain, count] of Object.entries(req.domains || {})) {
      if (previous.filter(p => p.domains?.includes(domain)).length < count) return 'Requer ' + count + ' escolha(s) anterior(es) em ' + domain + '.';
    }
    return '';
  }
  function check(slots, selections, key, id, level) {
    const slot = slots.find(s => s.key === key);
    const option = slot?.options.find(a => a.id === id);
    if (!option) return 'Oferta indisponível.';
    if (Number(level) < option.level) return 'Libera no nível ' + option.level + '.';
    const previous = [];
    for (const s of slots) {
      const power = s === slot ? option : chosen(s, selections);
      const why = reason(power, previous);
      if (why) return power.name + ' – ' + why;
      previous.push(power);
    }
    return '';
  }
  function resolve(set, state, slots) {
    if (!set) return set;
    const previous = [];
    const replacements = new Map();
    for (const slot of slots) {
      let power = chosen(slot, state.divineSelections);
      if (reason(power, previous)) power = slot.options[0];
      const rank = previous.filter(p => p.id === power.id && p.sourceGodId === power.sourceGodId).length;
      previous.push(power);
      if (rank && power.repeatRanks?.[rank]) {
        power = { ...power, ...power.repeatRanks[rank], id: power.id + '-rank-' + (rank + 1) };
      }
      replacements.set(slot.base, power);
    }
    return { ...set, actives: set.actives.map(a => replacements.get(a) || a) };
  }
  window.FichaKits = { spaces, chosen, check, resolve };
})();
