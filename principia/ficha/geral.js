/* GUIA DA DUODÉCIMA · Ficha · aba Visão geral (atributos, perícias, mão de cartas, estado e evolução). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal, attrsLista } = FG;
    const acoes = FG.acoes;
    const ORDEM_PERICIAS = ['for', 'des', 'con', 'int', 'fe', 'car'];

    function atributo(c, k, ab, nome) {
      const { M, s } = c;
      const partes = [
        ['base', s.baseAttributes?.[k]], ['nível', s.levelAttributes?.[k]], ['talentos', M.talentAttributeBonus(k)],
        ['divino', M.god()?.bonuses?.[k]], ['extras', M.attributeExtraBonus(k)], ['sacrifício', -M.magicSacrifice(k)], ['sanidade', M.sanityAttrPenalty(k)]
      ].filter(([, v]) => Number(v));
      const pen = M.sanityAttrPenalty(k) || M.magicSacrifice(k);
      return `<div class="fg-attr" title="${esc(partes.map(([n, v]) => `${n} ${sinal(v)}`).join(' · ') || 'sem bônus')}">
        <span>${ab}</span><b>${M.effectiveAttr(k)}</b>
        <small>${esc(nome)}${pen ? ` <span class="fg-attr-pen">${M.sanityAttrPenalty(k) ? 'sanidade ' + sinal(M.sanityAttrPenalty(k)) : 'sacrifício −' + M.magicSacrifice(k)}</span>` : ''}</small>
      </div>`;
    }

    function avisosDeRolagem({M,s}) {
      const list=s.receivedEffects || [], buffs=M.receivedBonuses();
      const i=list.findIndex(e=>e.id==='inspiracao-divina');
      const inspiration=i<0?'':`<div class="fg-sec-head fg-box"><div><b class="fg-h">Inspiração de Febo · +1d${[4,6,8][list[i].tier]}</b><p>Disponível para uma rolagem de habilidade, ataque, defesa ou resistência.</p></div><button type="button" class="fg-btn fg-btn--pri fg-btn--sm" data-a="efeito-tirar" data-index="${i}">Marcar como usada</button></div>`;
      const hints=list.filter(e=>['calma-sonhar','a-lira','dominio-sono-profundo'].includes(e.id)).map(e=>{
        const def=window.FichaEfeitos.find(e.id);
        return esc(def.name+' · '+def.summary(e.tier));
      });
      if(buffs.resistance) hints.unshift('Aura da Proteção · +'+buffs.resistance+' já incluído nas resistências');
      return inspiration+(hints.length?`<div class="fg-note">${hints.join('<br>')}</div>`:'');
    }

    function rolagens(c) {
      const { M, s } = c;
      const lista = [['init', 'Iniciativa', '1d20 ' + sinal(M.initiativeBonus())], ['def', 'Defesa', '1d20 ' + sinal(M.defenseBonus())]];
      if (M.hasSheetCasting()) lista.push(['conj', 'Conjuração', '1d20 ' + sinal(M.castAttack()) + M.fortuneSuffix()]);
      (s.weapons || []).filter(w => w.equipped).forEach(w => lista.push(['arma:' + w.id, 'Ataque · ' + (w.name || 'Arma'), `${sinal(M.weaponAttack(w))}${M.fortuneSuffix()} · ${M.weaponDamageFormula(w)}`]));
      lista.push(['d20', 'd20 livre', '1d20' + (M.receivedBonuses().d20 ? ' ' + sinal(M.receivedBonuses().d20) : '')]);
      const ultima = s.lastRoll ? `<div class="fg-last-roll" role="status"><b>${s.lastRoll.total}</b><div><span class="fg-label">${esc(s.lastRoll.label)}</span><div class="fg-muted" style="font-size:12.5px">${s.lastRoll.advantageDice?.length===2 ? esc(s.lastRoll.advantageDice.join(' / '))+' · vantagem → ' : ''}${s.lastRoll.die} no d20 ${sinal(s.lastRoll.modifier)}${s.lastRoll.extra ? ' · Fortuna ' + sinal(Number(s.lastRoll.extra)) : ''}${s.lastRoll.die === 20 ? ' · 20 natural' : s.lastRoll.die === 1 ? ' · 1 natural' : ''}</div></div><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="rolagem-copiar" title="Copiar o resultado para colar no Discord" style="margin-left:auto">Copiar</button></div>` : '';
      return `${ultima}<div class="fg-rolls">${lista.map(([id, n, v]) => `<button class="fg-roll" type="button" data-a="rolar" data-r="${esc(id)}">${ICO.d20}<span>${esc(n)}</span><b>${esc(v)}</b></button>`).join('')}</div>`;
    }

    function linhaResistencia(M, k) {
      const nome = attrsLista.find(a => a[0] === k)[2];
      const prof = M.resistanceIsProficient(k);
      const fonte = prof ? 'Proficiência concedida por Resiliente' : 'Requer Resiliente neste atributo';
      return `<div class="fg-skill${prof ? ' is-prof' : ''}">
        <button type="button" class="fg-pe is-auto${prof ? ' on' : ''}" title="${fonte}" aria-pressed="${prof}" aria-label="${fonte}: ${esc(nome)}" disabled>P</button>
        <span>Resistência de ${esc(nome)}</span>
        <b>${sinal(M.resistanceBonus(k))}${M.fortuneSuffix()}${M.receivedBonuses().advantage ? ' · vantagem' : ''}</b>
        <button class="fg-btn fg-btn--sm fg-btn--ghost fg-btn--icon" type="button" data-a="resistir" data-k="${k}" aria-label="Rolar resistência de ${esc(nome)}" style="min-height:26px;width:26px">${ICO.d20}</button>
      </div>`;
    }

    function pericias(c) {
      const { M, D } = c;
      const grupos = ORDEM_PERICIAS.map(k => ({ k, ab: attrsLista.find(a => a[0] === k)[1], itens: D.skills.filter(sk => sk.attr === k) }));
      return `<div class="fg-skills">${grupos.map(g => `<div class="fg-skill-group"><div>${g.ab}</div>${linhaResistencia(M, g.k)}${g.itens.map(sk => {
        const auto = M.automaticSkillSources(sk.name);
        const prof = M.skillIsProficient(sk.name), exp = M.skillHasExpertise(sk.name), autoE = M.skillHasAutomaticExpertise(sk.name);
        const fontes = M.skillSources(sk.name);
        return `<div class="fg-skill${prof ? ' is-prof' : ''}" title="${esc(fontes.join(' · ') || 'Sem proficiência')}">
          <button class="fg-pe${prof ? ' on' : ''}${auto.length ? ' is-auto' : ''}" type="button" data-a="pericia-p" data-nome="${esc(sk.name)}" aria-pressed="${prof}" aria-label="Proficiência em ${esc(sk.name)}"${auto.length ? ' aria-disabled="true"' : ''}>P</button>
          <button class="fg-pe is-e${exp ? ' on' : ''}${autoE ? ' is-auto' : ''}" type="button" data-a="pericia-e" data-nome="${esc(sk.name)}" aria-pressed="${exp}" aria-label="Expertise em ${esc(sk.name)}"${prof && !autoE ? '' : ' aria-disabled="true"'}>E</button>
          <button class="fg-btn fg-btn--ghost fg-btn--sm" style="text-align:left;justify-content:flex-start" type="button" data-a="editar-pericia" data-nome="${esc(sk.name)}" aria-label="Editar ${esc(sk.name)}">${esc(sk.name)}</button>
          <b>${sinal(M.skillValue(sk.name))}</b>
          <button class="fg-btn fg-btn--sm fg-btn--ghost fg-btn--icon" type="button" data-a="pericia-rolar" data-nome="${esc(sk.name)}" aria-label="Rolar ${esc(sk.name)}" style="min-height:26px;width:26px">${ICO.d20}</button>
        </div>`;
      }).join('')}</div>`).join('')}</div>`;
    }

    acoes['editar-pericia'] = el => FG.abrirGaveta('pericia', { nome: el.dataset.nome });
    FG.gavetas.pericia = ({M,s}, {nome}) => {
      const m = M.skillMetaFor(nome);
      const inicial = s.initialSkills.includes(nome);
      const origem = inicial ? 'inicial' : m.proficient ? m.source : '';
      const opcoes = [['','Sem treino manual'],['inicial','Criação'],['nivel-20','Nível 20'],['nivel-40','Nível 40'],['treino','Treino'],['extras','Extra'],['prole','Prole'],['talento','Talento']];
      return `<div class="fg-drawer-body"><div class="fg-sec-head"><h3>${esc(nome)}</h3><button type="button" class="fg-btn" data-a="fechar-gaveta">Fechar</button></div>
        <div class="fg-form"><label class="fg-field"><span>Origem da proficiência manual</span><select data-a="origem-pericia" data-nome="${esc(nome)}">${opcoes.map(([id,label]) => `<option value="${id}" ${origem===id?'selected':''} ${id.startsWith('nivel-') && Number(id.slice(6))>s.level && origem!==id?'disabled':''}>${label}</option>`).join('')}</select></label>
        <label class="fg-field"><span>Bônus manual da perícia</span><input type="number" step="1" data-a="campo" data-calc data-tipo="int" data-path="skillMeta.${esc(nome)}.bonus" value="${Number(m.bonus)||0}"></label>
        <label class="fg-field"><span>Fonte do bônus</span><input data-a="campo" data-path="skillMeta.${esc(nome)}.bonusSource" value="${esc(m.bonusSource||'')}" placeholder="Herança ou habilidade"></label></div></div>`;
    };
    acoes['origem-pericia'] = el => {
      const M = FG.S.M, s = M.state, nome = el.dataset.nome, origem = el.value;
      const inicial = s.initialSkills.includes(nome);
      if (origem === 'inicial' && !inicial && (!M.canUseInitialSkill(nome) || s.initialSkills.length >= M.initialSkillLimit())) {
        window.PRINCIPIA.api.toast('Confira as vagas e as perícias de criação.'); FG.render(); return;
      }
      const m = M.skillMetaFor(nome);
      s.initialSkills = s.initialSkills.filter(n => n !== nome);
      if (origem === 'inicial') s.initialSkills.push(nome);
      m.proficient = !!origem && origem !== 'inicial';
      m.source = m.proficient ? origem : 'extras';
      if (!M.skillIsProficient(nome)) m.expertise = false;
      salvarDesenhar();
    };

    function mao(c) {
      const { M } = c;
      const cartas = FG.cartasNaMao(M);
      if (!cartas.length) return `<p class="fg-empty-line">Nenhuma carta na mão. Em Poderes, abra uma habilidade e use “Pôr na mão”.</p>`;
      const n = cartas.length, meio = (n - 1) / 2;
      return `<div class="fg-fan">${cartas.map((a, i) => FG.carta(c, a, { estilo: `--i:${i};--n:${cartas.length};--r:${(i - meio) * 8}deg;--y:${Math.abs(i - meio) * 16}px;z-index:${10 - Math.abs(i - meio)}` })).join('')}</div>`;
    }

    function equipado(c) {
      const { M, s } = c;
      const linhas = [];
      (s.weapons || []).filter(w => w.equipped).forEach(w => linhas.push(`<button class="fg-row" type="button" data-a="abrir-item" data-tipo="arma" data-id="${esc(w.id)}" style="cursor:pointer;text-align:left"><span class="fg-row-main"><b>${esc(w.name || 'Arma')}</b><small>${esc(M.material(w.material)?.name || '')} · ${esc(M.weaponType(w.type)?.name || '')}</small></span><span class="fg-row-num">${sinal(M.weaponAttack(w))}${M.fortuneSuffix()}</span><small class="fg-label">${esc(M.weaponDamageFormula(w))}</small></button>`));
      if (s.armor?.equipped) linhas.push(`<button class="fg-row" type="button" data-a="abrir-item" data-tipo="armadura" style="cursor:pointer;text-align:left"><span class="fg-row-main"><b>${esc(s.armor.name || 'Armadura')}</b><small>${esc(M.armorType(s.armor.type)?.name || '')} · ${esc(M.material(s.armor.material)?.name || '')}</small></span><span class="fg-row-num">DEF ${sinal(M.armorDefense())}</span><small class="fg-label">RD ${M.armorReduction()}</small></button>`);
      if (s.shield?.equipped) linhas.push(`<button class="fg-row" type="button" data-a="abrir-item" data-tipo="escudo" style="cursor:pointer;text-align:left"><span class="fg-row-main"><b>${esc(s.shield.name || 'Escudo')}</b><small>${esc(M.material(s.shield.material)?.name || '')} · ${s.shield.stakes || 0}/30 estacas</small></span><span class="fg-row-num">DEF ${sinal(M.shieldDefense())}</span></button>`);
      return linhas.length ? `<div class="fg-rows">${linhas.join('')}</div>` : '<p class="fg-empty-line">Nada equipado. Equipe armas, armadura e escudo no Arsenal.</p>';
    }


    function recebidos({M,s}) {
      const E = window.FichaEfeitos, list = s.receivedEffects || [];
      const tags = ['0–15','16–29','30+'];
      const cards = list.map((e,index) => {
        const def = E.find(e.id);
        const kit = M.abilitiesDb[def.god];
        const power = [...(kit?.actives || []), ...(kit?.passives || [])].find(a => a.id === e.id);
        const tiers = power?.tiers || {};
        const detail = [tiers.low, tiers.mid, tiers.high].slice(0, e.tier + 1).map((text,i) => text ? tags[i] + ' · ' + text : '').filter(Boolean);
        if (power?.extra) detail.push(power.extra);
        if (def.god === 'netuno' && ['cataclismo','bencao-oceanica'].includes(def.id)) detail.push('A ficha usa o maior bônus entre aplicações desta mesma habilidade. Habilidades diferentes são combinadas. Encerre o efeito se deixar a área exigida.');
        if (['restauracao','escudo-oceanico','cataclismo','murchar-florescer','frutos-colheita','dominio-sono-profundo'].includes(def.id)) detail.push('Use a Fé de quem concedeu o efeito. Marque na ficha o resultado de cura, absorção ou PV temporários resolvido na mesa.');
        if (e.caster) detail.unshift('Concedido por ' + e.caster);
        if (def.self) detail.unshift('Efeito da própria prole. Encerre ao sair da luz natural ou ao anoitecer.');
        if (e.querido) detail.unshift('Querido · duração ampliada em um turno.');
        const duration = e.rounds ? ' · ' + e.rounds + (e.rounds === 1 ? ' rodada' : ' rodadas') : '';
        return `<details class="fg-box"><summary><b>${esc(def.name)}</b> · ${esc(def.summary(e.tier) + (e.fire ? ' · resistência a fogo' : '') + duration)}</summary>
          <small class="fg-muted">${esc(e.caster || def.source)} · estacas ${tags[e.tier]}</small>
          ${detail.map(t => `<p>${esc(t)}</p>`).join('')}
          ${e.id==='gloria-roma' && e.tier===1 ? `<label class="fg-check"><input type="checkbox" data-a="efeito-formacao" ${e.formation?'checked':''}>Ao menos dois aliados próximos afetados (+2)</label>` : ''}
          <button type="button" class="fg-btn fg-btn--sm" data-a="efeito-tirar" data-index="${index}">${['inspiracao-divina','escudo-oceanico','frutos-colheita','calma-sonhar'].includes(e.id) ? 'Marcar como usado / encerrar' : 'Encerrar efeito'}</button></details>`;
      }).join('');
      const options = E.catalog.filter(d => !d.archived && (d.god === 'netuno' || !list.some(e => e.id === d.id)) && (!d.self || (M.effectiveAbilitySet()?.passives || []).some(a => a.id === d.id && (a.sourceGodId || s.godId) === d.god)));
      return `<div class="fg-box" style="display:grid;gap:12px"><div class="fg-sec-head"><div><span class="fg-kicker">Semideus</span><h3 class="fg-h">Efeitos recebidos</h3></div>
        ${list.some(e => e.rounds) ? '<button type="button" class="fg-btn fg-btn--sm" data-a="efeito-rodada">Avançar rodada</button>' : ''}</div>
        ${cards || '<p class="fg-muted">Nenhum efeito ativo.</p>'}<details class="fg-box"><summary class="fg-label">Adicionar efeito</summary><div class="fg-form">
        <label class="fg-field"><span>Efeito recebido</span><select class="fg-in" name="efeito" data-a="efeito-opcoes">${[...new Set(options.map(d => d.source))].map(source => `<optgroup label="${esc(source)}">${options.filter(d => d.source === source).map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
        <label class="fg-field"><span>Estacas de quem concedeu</span><select class="fg-in" name="estaca" data-a="efeito-opcoes">${tags.map((v,i) => `<option value="${i}" ${i < (options[0]?.min || 0) ? 'disabled' : ''}>${v}</option>`).join('')}</select></label>
        <label class="fg-field"><span>Quem concedeu (opcional)</span><input class="fg-in" name="fonte" maxlength="60" placeholder="Nome do personagem"></label>
        <label class="fg-check" data-querido style="display:${E.aceitaQuerido(options[0], Math.max(0,options[0]?.min||0))?'':'none'}"><input type="checkbox" name="querido">Quem concedeu tem Querido (+1 turno)</label>
        <label class="fg-check" style="display:none" data-fogo><input type="checkbox" name="fogo">Resistência a fogo (+40 EN pagos pela fonte)</label></div>
        <button class="fg-btn fg-btn--pri fg-btn--sm" type="button" data-a="efeito-por">Aplicar efeito</button></details></div>`;
    }
    acoes['efeito-opcoes'] = el => {
      const form = el.closest('details'), def = window.FichaEfeitos.find(form.querySelector('[name=efeito]').value);
      const tier = form.querySelector('[name=estaca]');
      for (const opt of tier.options) opt.disabled = Number(opt.value) < (def.min || 0);
      if (Number(tier.value) < (def.min || 0)) tier.value = String(def.min);
      const querido = form.querySelector('[data-querido]');
      const permite = window.FichaEfeitos.aceitaQuerido(def, Number(tier.value));
      querido.style.display = permite ? '' : 'none';
      if (!permite) querido.querySelector('input').checked = false;
      form.querySelector('[data-fogo]').style.display = def.id === 'bencao-oceanica' && tier.value === '2' ? '' : 'none';
    };
    acoes['efeito-por'] = el => {
      const form = el.closest('details'), s = FG.S.M.state;
      const error = window.FichaEfeitos.add(s, form.querySelector('[name=efeito]').value, Number(form.querySelector('[name=estaca]').value), form.querySelector('[name=fonte]').value, form.querySelector('[name=fogo]').checked, form.querySelector('[name=querido]').checked);
      if (error) { window.PRINCIPIA.api.toast(error); return; }
      salvarDesenhar(false);
    };
    acoes['efeito-tirar'] = el => {
      const s = FG.S.M.state;
      s.receivedEffects = s.receivedEffects.filter((e,i) => i !== Number(el.dataset.index));
      salvarDesenhar(false);
    };
    acoes['efeito-rodada'] = () => { window.FichaEfeitos.advance(FG.S.M.state); salvarDesenhar(false); };

    function estado(c) {
      const { M, s, D } = c;
      const conds = (s.conditions || []).map(n => {
        const d = M.conditionData(n);
        return `<span class="fg-cond" title="${esc(d?.mechanic || '')}">${esc(n)}<button type="button" data-a="condicao-tirar" data-nome="${esc(n)}" aria-label="Tirar ${esc(n)}">×</button></span>`;
      }).join('');
      const disponiveis = (D.system.conditions || []).filter(x => !(s.conditions || []).includes(x.name));
      const d = s.death || {};
      const morte = s.currentHp === 0 ? `<div class="fg-box" style="border-color:var(--fg-accent)">
        <div class="fg-sec-head"><b class="fg-label" style="color:var(--fg-accent)">Testes contra a morte</b>${d.dead ? '<span class="fg-chip fg-chip--red">Morto</span>' : d.stable ? '<span class="fg-chip" style="color:var(--fg-ok)">Estável</span>' : ''}</div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin:10px 0">
          <div><span class="fg-label">Sucessos</span><div class="fg-dots">${[0, 1, 2].map(i => `<i class="${i < (d.successes || 0) ? 'ok' : ''}"></i>`).join('')}</div></div>
          <div><span class="fg-label">Falhas</span><div class="fg-dots">${[0, 1, 2].map(i => `<i class="${i < (d.failures || 0) ? 'bad' : ''}"></i>`).join('')}</div></div>
          ${d.lastRoll ? `<div><span class="fg-label">Último</span><div class="fg-anton" style="font-size:22px">${d.lastRoll}</div></div>` : ''}
        </div>
        <div class="fg-actions">
          <button class="fg-btn fg-btn--pri fg-btn--sm" type="button" data-a="morte-rolar"${d.dead || d.stable ? ' disabled' : ''}>Rolar teste</button>
          <button class="fg-btn fg-btn--sm" type="button" data-a="morte" data-t="s">+1 sucesso</button>
          <button class="fg-btn fg-btn--sm" type="button" data-a="morte" data-t="f">+1 falha</button>
          ${d.dead ? '<button class="fg-btn fg-btn--sm" type="button" data-a="morte-reviver">Intervenção narrativa</button>' : ''}
        </div>
      </div>` : '';
      return `<div class="fg-sec">
        <div class="fg-sec-head"><h3 class="fg-h">Estado</h3></div>
        ${morte}
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">${conds || '<span class="fg-muted" style="font-size:13px">Nenhuma condição ativa.</span>'}</div>
        <div style="display:flex;gap:8px">
          <select class="fg-in" data-a="condicao-por" aria-label="Adicionar condição"><option value="">Adicionar condição…</option>${disponiveis.map(x => `<option>${esc(x.name)}</option>`).join('')}</select>
        </div>
        ${recebidos(c)}
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
          <div><span class="fg-label">Exaustão</span><div class="fg-stepper"><button type="button" data-a="exaustao" data-d="-1" aria-label="Menos exaustão">−</button><b>${s.exhaustion || 0}</b><button type="button" data-a="exaustao" data-d="1" aria-label="Mais exaustão">+</button><small class="fg-muted">/ 6</small></div></div>
          <label class="fg-check" title="+10 HP máximo enquanto marcada; desliga sozinha na virada do mês."><input type="checkbox" data-a="fortuna"${s.fortunaBlessing ? ' checked' : ''}> Bênção de Fortuna (+10 HP máx.)</label>
        </div>
        ${M.exhaustionRollPenalty() || M.energyRollPenalty() || M.globalD20Penalty() ? `<p class="fg-note fg-note--warn">Penalidade atual em d20: ${sinal(M.globalD20Penalty())}${M.exhaustionRollPenalty() ? ` (exaustão ${sinal(M.exhaustionRollPenalty())})` : ''}${M.energyRollPenalty() ? ` (energia ${sinal(M.energyRollPenalty())})` : ''}.</p>` : ''}
        <div class="fg-actions">
          <button class="fg-btn fg-btn--pri" type="button" data-a="descanso" data-t="curto">Descanso curto</button>
          <button class="fg-btn" type="button" data-a="descanso" data-t="longo">Descanso longo</button>
        </div>
        <details class="fg-box"><summary class="fg-label" style="cursor:pointer">Ajustes temporários</summary>
          <div class="fg-form" style="margin-top:10px">
            <label class="fg-field"><span>Ajuste geral da DT de habilidade</span><input type="number" step="1" data-a="campo" data-calc data-tipo="int" data-path="abilityDtBonus" value="${Number(s.abilityDtBonus)||0}"></label>
            <label class="fg-field"><span>Rolagens</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="tempMods.rolls" value="${s.tempMods?.rolls || 0}"></label>
            <label class="fg-field"><span>Defesa</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="tempMods.defense" value="${s.tempMods?.defense || 0}"></label>
            <label class="fg-field"><span>Redução de dano</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="tempMods.damageReduction" value="${s.tempMods?.damageReduction || 0}"></label>
          </div>
        </details>
      </div>`;
    }

    function evolucao(c) {
      const { M, s, D } = c;
      const resta = M.remainingLevelPoints();
      const pontos = attrsLista.map(([k, ab]) => `<div class="fg-box" style="padding:10px;display:flex;flex-direction:column;gap:6px;align-items:center"><span class="fg-kicker" style="letter-spacing:.16em">${ab}</span><div class="fg-stepper"><button type="button" data-a="nivel-attr" data-k="${k}" data-d="-1" aria-label="Tirar ponto de ${ab}">−</button><b>${s.levelAttributes?.[k] || 0}</b><button type="button" data-a="nivel-attr" data-k="${k}" data-d="1" aria-label="Pôr ponto em ${ab}"${resta <= 0 ? ' disabled' : ''}>+</button></div></div>`).join('');
      const slots = M.talentSlotsEarned(), usados = M.standardTalentsUsed();
      const talentos = (s.talents || []).map(t => {
        const def = M.talentDef(t.talentId);
        return `<div class="fg-row" style="align-items:flex-start"><div class="fg-row-main"><b>${esc(def?.name || t.talentId)}${t.extra ? ' <small class="fg-label">extra</small>' : ''}</b><small>${esc(def?.description || '')}</small>${parametrosTalento(c, t, def)}</div><button class="fg-btn fg-btn--sm fg-btn--ghost fg-btn--danger" type="button" data-a="talento-tirar" data-id="${esc(t.id)}">Remover</button></div>`;
      }).join('');
      const disponiveis = D.talents.filter(t => t.repeatable !== false || !M.hasTalent(t.id));
      const treinos = (s.skillTrainings || []).map(t => `<div class="fg-row"><div class="fg-row-main"><b>${esc(t.name)}</b><small>${t.stakes || 0}/30 estacas de treino</small></div><input type="range" min="0" max="30" value="${t.stakes || 0}" data-a="treino-estacas" data-id="${esc(t.id)}" aria-label="Estacas de treino em ${esc(t.name)}" style="max-width:160px"><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="treino-tirar" data-id="${esc(t.id)}" aria-label="Remover treino">${ICO.close}</button></div>`).join('');
      const reb = s.roma?.rebentoApproved;
      const sel = Array.isArray(s.roma?.rebentoAttributes) ? s.roma.rebentoAttributes : [];
      const issues = M.validationIssues();
      // Fica aberta na Visão geral, logo abaixo dos atributos e perícias (a aba separada não ajudou a achar os talentos).
      return `<div class="fg-sec fg-evolucao" style="margin-top:22px">
        <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Nível, pontos, talentos, treinos e Rebento</span><h2 class="fg-h fg-h--big">Evolução</h2></div>
        <div class="fg-cols2" style="margin-top:6px">
          <div class="fg-sec">
            <div class="fg-sec-head"><b class="fg-label">Nível</b></div>
            <div class="fg-stepper"><button type="button" data-a="nivel" data-d="-1" aria-label="Diminuir nível">−</button><b style="font-size:34px;min-width:52px">${s.level}</b><button type="button" data-a="nivel" data-d="1" aria-label="Aumentar nível">+</button><span class="fg-muted" style="font-size:13px">BP ${sinal(M.bp())}</span></div>
            <div class="fg-sec-head"><b class="fg-label">Pontos de atributo por nível</b><span class="fg-label" style="color:${resta ? 'var(--fg-accent)' : 'inherit'}">${resta} sobrando</span></div>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${pontos}</div>
            <div class="fg-sec-head"><b class="fg-label">Treinamentos de perícia</b><span class="fg-label">${M.availableSkillTrainingSlots()} vaga(s)</span></div>
            <div class="fg-rows">${treinos || '<p class="fg-empty-line">Nenhum treinamento.</p>'}</div>
            ${M.availableSkillTrainingSlots() > 0 ? `<div style="display:flex;gap:8px"><select class="fg-in" id="fgNovoTreino" aria-label="Perícia para treinar"><option value="">Perícia…</option>${D.skills.map(k => `<option>${esc(k.name)}</option>`).join('')}</select><button class="fg-btn" type="button" data-a="treino-por">Treinar</button></div>` : ''}
          </div>
          <div class="fg-sec">
            <div class="fg-sec-head"><b class="fg-label">Talentos</b><span class="fg-label">${usados}/${slots} padrão</span></div>
            <div class="fg-rows">${talentos || '<p class="fg-empty-line">Nenhum talento.</p>'}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <select class="fg-in" id="fgNovoTalento" aria-label="Escolher talento" style="flex:1;min-width:180px"><option value="">Escolher talento…</option>${disponiveis.map(t => `<option value="${esc(t.id)}"${s.level < t.minLevel ? ' disabled' : ''}>${esc(t.name)}${t.minLevel > 1 ? ' · nível ' + t.minLevel : ''}</option>`).join('')}</select>
              <button class="fg-btn" type="button" data-a="talento-por" data-extra="0"${usados >= slots ? ' disabled' : ''}>Padrão</button>
              <button class="fg-btn" type="button" data-a="talento-por" data-extra="1">Extra</button>
            </div>
            <div class="fg-sec-head"><b class="fg-label">Rebento de Roma</b></div>
            <label class="fg-check"><input type="checkbox" data-a="rebento"${reb ? ' checked' : ''}> Rebento de Roma aprovado pela Staff</label>
            ${reb ? `<div class="fg-form">${[0, 1].map(i => `<label class="fg-field"><span>+1 de Rebento ${i + 1}</span><select data-a="rebento-attr" data-slot="${i}"><option value="">Escolher…</option>${attrsLista.map(([k, , n]) => `<option value="${k}"${sel[i] === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`).join('')}</div><p class="fg-muted" style="font-size:12.5px">Dois atributos diferentes; o teto vira 6.</p>` : ''}
            <details class="fg-box"><summary class="fg-label" style="cursor:pointer">Ajustes excepcionais (atributos extras)</summary>
              <p class="fg-muted" style="font-size:12.5px;margin:8px 0">Bônus fora das regras comuns, combinados com a Staff.</p>
              <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${attrsLista.map(([k, ab]) => `<label class="fg-field"><span>${ab}</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="attributeExtras.${k}" value="${s.attributeExtras?.[k] || 0}"></label>`).join('')}</div>
            </details>
          </div>
        </div>
        ${issues.length ? `<div class="fg-sec" style="margin-top:16px"><b class="fg-label">Diagnóstico da ficha</b>${issues.map(x => `<p class="fg-note${x.level === 'error' ? ' fg-note--warn' : ''}">${esc(x.text)}</p>`).join('')}</div>` : ''}
      </div>`;
    }

    function parametrosTalento(c, t, def) {
      const { D, s } = c;
      const p = t.params || {};
      const sel = (key, rotulo, opcoes, atual) => `<label class="fg-field" style="max-width:260px"><span>${rotulo}</span><select data-a="talento-param" data-id="${esc(t.id)}" data-key="${key}"><option value="">Selecione…</option>${opcoes.map(([v, n]) => `<option value="${esc(v)}"${atual === v ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
      const attrs = attrsLista.map(([k, , n]) => [k, n]);
      const pericias = D.skills.map(k => [k.name, k.name]);
      const out = [];
      const ps = def?.params || [];
      if (ps.includes('attribute')) out.push(sel('attribute', 'Atributo', attrs, p.attribute || ''));
      if (ps.includes('attribute1')) { out.push(sel('attribute1', 'Ponto 1', attrs, p.attribute1 || p.attribute || '')); out.push(sel('attribute2', 'Ponto 2', attrs, p.attribute2 || '')); }
      if (ps.includes('element')) out.push(`<label class="fg-field" style="max-width:260px"><span>Elemento</span><input data-a="talento-param" data-id="${esc(t.id)}" data-key="element" value="${esc(p.element || '')}" placeholder="Ex.: fogo, gelo"></label>`);
      if (ps.includes('skill')) out.push(sel('skill', 'Perícia', pericias, p.skill || ''));
      if (ps.includes('expertise1')) ['expertise1', 'expertise2'].forEach(k => out.push(sel(k, 'Expertise', D.skills.filter(sk => c.M.skillIsProficient(sk.name) || p[k] === sk.name).map(sk => [sk.name, sk.name]), p[k] || '')));
      ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'].forEach((k, i) => { if (ps.includes(k)) out.push(sel(k, 'Perícia ' + (i + 1), pericias, p[k] || '')); });
      return out.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${out.join('')}</div>` : '';
    }

    FG.abas.geral = {
      render(c) {
        return `<div class="fg-cols">
          <div class="fg-sec">
            <div class="fg-sec-head"><h3 class="fg-h">Atributos</h3><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="regra" data-p="personagem" data-anc="criacao">Regras</button></div>
            ${avisosDeRolagem(c)}<div class="fg-attrs">${attrsLista.map(([k, ab, n]) => atributo(c, k, ab, n)).join('')}</div>
            <div class="fg-sec-head" style="margin-top:6px"><h3 class="fg-h">Rolagens</h3></div>
            ${rolagens(c)}
          </div>
          <div class="fg-sec">
            <div class="fg-sec-head"><h3 class="fg-h">Perícias</h3><span class="fg-label">P = proficiente · E = expertise</span></div>
            <p class="fg-muted">Toque no nome da perícia para ajustar a origem do treino ou o bônus manual.</p>
            ${pericias(c)}
          </div>
          <div class="fg-sec fg-col-hand">
            <div class="fg-sec-head"><h3 class="fg-h">Na mão</h3><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="aba" data-aba="poderes">Abrir o baralho →</button></div>
            ${mao(c)}
            <div class="fg-sec-head"><h3 class="fg-h">Equipado</h3><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="aba" data-aba="arsenal">Arsenal →</button></div>
            ${equipado(c)}
            ${estado(c)}
          </div>
        </div>
        ${evolucao(c)}`;
      }
    };

    /* ---------------------------------------------------------------- ações */
    const salvarDesenhar = (sync = true) => { const M = FG.S.M; if (sync) M.syncCurrentCaps(); FG.salvar(); FG.render(); };
    // Texto pronto para colar no Discord, em Markdown (ex.: **Madeleine** · Percepção: **17** (d20 13 +4)).
    acoes['rolagem-copiar'] = async () => {
      const s = FG.S.M.state, r = s.lastRoll;
      if (!r) return;
      const nat = r.die === 20 ? ' · 20 natural' : r.die === 1 ? ' · 1 natural' : '';
      const texto = `**${s.name || 'Personagem'}** · ${r.label}: **${r.total}** (${r.advantageDice?.length===2 ? 'vantagem '+r.advantageDice.join(' / ')+' → ' : ''}d20 ${r.die} ${FG.sinal(r.modifier)}${r.extra ? ' · Fortuna ' + FG.sinal(Number(r.extra)) : ''}${nat})`;
      try { await navigator.clipboard.writeText(texto); window.PRINCIPIA.api.toast('Rolagem copiada. Cole no Discord.'); }
      catch { window.prompt('Copie o texto da rolagem:', texto); }
    };
    acoes.resistir = el => {
      const M=FG.S.M, k=el.dataset.k, attr=attrsLista.find(([id])=>id===k);
      if (attr) M.rollD20('Resistência · '+attr[2], M.resistanceBonus(k), M.receivedBonuses().fortune, M.receivedBonuses().advantage);
    };
    acoes['efeito-formacao'] = (el, ev) => {
      if (ev.type!=='change') return;
      const effect=FG.S.M.state.receivedEffects.find(e=>e.id==='gloria-roma' && e.tier===1);
      if (effect) {effect.formation=el.checked; salvarDesenhar(false);}
    };
    acoes.rolar = el => {
      const M = FG.S.M, r = el.dataset.r;
      if (r === 'init') M.rollInitiative();
      else if (r === 'def') M.rollDefense();
      else if (r === 'conj') M.rollD20('Conjuração', M.castAttack(), M.receivedBonuses().fortune);
      else if (r === 'd20') M.rollD20('d20', M.receivedBonuses().d20);
      else if (r.startsWith('arma:')) { const w = (M.state.weapons || []).find(x => x.id === r.slice(5)); if (w) M.rollD20('Ataque · ' + (w.name || 'Arma'), M.weaponAttack(w), M.receivedBonuses().fortune); }
    };
    acoes['pericia-rolar'] = el => { const M = FG.S.M; M.rollD20(el.dataset.nome, M.skillValue(el.dataset.nome)); };
    acoes['pericia-p'] = el => {
      const M = FG.S.M, nome = el.dataset.nome;
      if (M.automaticSkillSources(nome).length) { window.PRINCIPIA.api.toast(`A proficiência em ${nome} vem de: ${M.automaticSkillSources(nome).join(', ')}.`); return; }
      const m = M.skillMetaFor(nome);
      m.proficient = !m.proficient;
      if (!m.proficient) m.expertise = false;
      salvarDesenhar();
    };
    acoes['pericia-e'] = el => {
      const M = FG.S.M, nome = el.dataset.nome;
      if (!M.skillIsProficient(nome) || M.skillHasAutomaticExpertise(nome)) return;
      const m = M.skillMetaFor(nome);
      m.expertise = !m.expertise;
      salvarDesenhar();
    };
    acoes['condicao-por'] = el => { if (!el.value) return; FG.S.M.toggleCondition(el.value, true); };
    acoes['condicao-tirar'] = el => FG.S.M.toggleCondition(el.dataset.nome, false);
    acoes.exaustao = el => { const s = FG.S.M.state; s.exhaustion = FG.clamp((s.exhaustion || 0) + Number(el.dataset.d), 0, 6); salvarDesenhar(); };
    acoes.fortuna = el => { const s = FG.S.M.state; s.fortunaBlessing = el.checked; s.fortunaBlessingMonth = el.checked ? FG.S.M.currentMonthKey() : ''; salvarDesenhar(); };
    acoes.descanso = el => (el.dataset.t === 'curto' ? FG.S.M.shortRest() : FG.S.M.longRest());
    acoes['morte-rolar'] = () => FG.S.M.rollDeathSave();
    acoes.morte = el => (el.dataset.t === 's' ? FG.S.M.addDeathSuccesses(1) : FG.S.M.addDeathFailures(1));
    acoes['morte-reviver'] = async () => {
      const ok = await FG.confirmar('Intervenção narrativa', 'Desmarca a morte e volta o personagem com 1 HP. Use só quando a mesa decidir assim.', 'Restaurar');
      if (!ok) return;
      const s = FG.S.M.state;
      s.death = { ...s.death, dead: false, stable: false, successes: 0, failures: 0 };
      FG.S.M.setHp(1);
      salvarDesenhar();
    };
    acoes.nivel = el => { const s = FG.S.M.state; s.level = FG.clamp((s.level || 1) + Number(el.dataset.d), 1, 100); salvarDesenhar(); };
    acoes['nivel-attr'] = el => FG.S.M.changeLevelAttr(el.dataset.k, Number(el.dataset.d));
    acoes['evolucao-toggle'] = (el, ev) => { if (ev.type === 'click' && ev.target.closest('summary')) setTimeout(() => { FG.S.evolucaoAberta = el.open; }, 0); };
    acoes['treino-por'] = () => {
      const M = FG.S.M, nome = document.getElementById('fgNovoTreino')?.value;
      if (!nome || M.availableSkillTrainingSlots() <= 0) return;
      M.state.skillTrainings.push({ id: FG.uid('skill'), name: nome, stakes: 0 });
      salvarDesenhar();
    };
    acoes['treino-estacas'] = el => { const t = FG.S.M.state.skillTrainings.find(x => x.id === el.dataset.id); if (t) { t.stakes = FG.clamp(Number(el.value), 0, 30); salvarDesenhar(); } };
    acoes['treino-tirar'] = el => { const s = FG.S.M.state; s.skillTrainings = s.skillTrainings.filter(t => t.id !== el.dataset.id); salvarDesenhar(); };
    acoes['talento-por'] = el => {
      const M = FG.S.M, id = document.getElementById('fgNovoTalento')?.value, def = M.talentDef(id), extra = el.dataset.extra === '1';
      const toast = window.PRINCIPIA.api.toast;
      if (!def) { toast('Escolha um talento.'); return; }
      if (!extra && M.standardTalentsUsed() >= M.talentSlotsEarned()) { toast('Sem vaga de talento padrão neste nível.'); return; }
      if (M.state.level < def.minLevel) { toast(`Este talento exige nível ${def.minLevel}.`); return; }
      if (def.repeatable === false && M.hasTalent(id)) { toast('Este talento só pode ser escolhido uma vez.'); return; }
      M.state.talents.push({ id: FG.uid('talent'), talentId: id, extra, params: {}, notes: '' });
      FG.S.evolucaoAberta = true;
      salvarDesenhar();
    };
    acoes['talento-tirar'] = el => { const s = FG.S.M.state; s.talents = s.talents.filter(t => t.id !== el.dataset.id); salvarDesenhar(); };
    acoes['talento-param'] = el => {
      const M = FG.S.M, t = M.state.talents.find(x => x.id === el.dataset.id), key = el.dataset.key, toast = window.PRINCIPIA.api.toast;
      if (!t) return;
      t.params = t.params || {};
      const antes = key === 'attribute1' ? (t.params.attribute1 || t.params.attribute || '') : (t.params[key] || '');
      if ((t.talentId === 'aumento-atributo' && /^attribute[12]$/.test(key)) || (t.talentId === 'resiliente' && key === 'attribute')) {
        if (el.value && el.value !== antes && M.ordinaryAttrRaw(el.value) >= 5) { toast('Este atributo já atingiu 5.'); el.value = antes; return; }
      }
      if (t.talentId === 'perito' && /^skill[1-5]$/.test(key) && el.value && el.value !== antes && M.skillIsProficient(el.value)) { toast('Escolha uma perícia em que você ainda não tenha proficiência.'); el.value = antes; return; }
      t.params[key] = el.value;
      salvarDesenhar();
    };
    acoes.rebento = el => {
      const s = FG.S.M.state;
      s.roma = s.roma || {};
      const sel = Array.isArray(s.roma.rebentoAttributes) ? s.roma.rebentoAttributes : [];
      if (!el.checked) { sel.forEach(k => { s.attributeExtras[k] = (Number(s.attributeExtras[k]) || 0) - 1; }); s.roma.rebentoAttributes = []; s.roma.rebentoApproved = false; }
      else { s.roma.rebentoApproved = true; s.roma.rebentoAttributes = sel; }
      salvarDesenhar();
    };
    acoes['rebento-attr'] = el => {
      const M = FG.S.M, s = M.state, toast = window.PRINCIPIA.api.toast;
      const antigos = Array.isArray(s.roma.rebentoAttributes) ? s.roma.rebentoAttributes.slice(0, 2) : [];
      const prox = [antigos[0] || '', antigos[1] || ''];
      const anterior = prox[Number(el.dataset.slot)];
      prox[Number(el.dataset.slot)] = el.value;
      const limpos = prox.filter(Boolean);
      if (new Set(limpos).size !== limpos.length) { toast('Os dois bônus de Rebento precisam estar em atributos diferentes.'); FG.render(); return; }
      if (el.value && el.value !== anterior) {
        let total = M.structuralAttr(el.value);
        if (antigos.includes(el.value)) total -= 1;
        if (total >= 6) { toast('Este atributo já está em 6 e não pode receber outro +1 de Rebento.'); FG.render(); return; }
      }
      for (const k of antigos) if (!limpos.includes(k)) s.attributeExtras[k] = (Number(s.attributeExtras[k]) || 0) - 1;
      for (const k of limpos) if (!antigos.includes(k)) s.attributeExtras[k] = (Number(s.attributeExtras[k]) || 0) + 1;
      s.roma.rebentoAttributes = limpos;
      salvarDesenhar();
    };
    acoes.regra = el => FG.abrirRegra(el.dataset.p, el.dataset.anc);
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
