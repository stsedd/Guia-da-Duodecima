/* GUIA DA DUODÉCIMA · Ficha · aba Poderes (baralho de habilidades e gaveta de cada carta). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal } = FG;
    const acoes = FG.acoes;
    const TINTA_ATIVA = 'linear-gradient(180deg,rgba(211,17,42,.5),rgba(40,0,6,.85))';
    const TINTA_PASSIVA = 'linear-gradient(180deg,rgba(201,154,46,.55),rgba(60,30,0,.8))';
    const maiuscula = t => { const x = String(t || '').trim(); return x ? x[0].toUpperCase() + x.slice(1) : ''; };

    const todas = M => { const set = M.effectiveAbilitySet(); return [...(set?.passives || []).map(a => ({ ...a, _tipo: 'passiva' })), ...(set?.actives || []).map(a => ({ ...a, _tipo: 'ativa' }))]; };
    const bloqueada = (M, a) => a._tipo === 'ativa' && Number(a.level) > Number(M.state.level);
    const indiceFaixa = est => (est >= 30 ? 2 : est >= 16 ? 1 : 0);
    function resumoCarta(M, a) {
      if (a.tiers) return maiuscula(M.tierText(a, M.stakesOf(a)));
      const nota = (a.coreBlocks || []).find(b => b.type === 'note' && b.text);
      return maiuscula(nota?.text || a.extra || a.summary || '');
    }
    function arte(M, a) {
      const visual = M.state.abilityVisuals?.[M.abilityKey(a)];
      if (visual?.imageUrl) return { src: visual.imageUrl, propria: true };
      return { src: FG.arteDe(a.sourceGodId || M.state.godId), propria: false };
    }
    FG.todasHabilidades = todas;

    /* Carta de habilidade (também usada na mão da Visão geral). */
    FG.carta = (c, a, opts = {}) => {
      const { M } = c;
      a = a._tipo ? a : { ...a, _tipo: (M.effectiveAbilitySet()?.actives || []).some(x => x.id === a.id && x.sourceGodId === a.sourceGodId) ? 'ativa' : 'passiva' };
      const key = M.abilityKey(a);
      const lock = bloqueada(M, a);
      const est = M.stakesOf(a), idx = indiceFaixa(est);
      const img = arte(M, a);
      const sel = FG.S.drawer?.tipo === 'habilidade' && FG.S.drawer.key === key;
      const faixas = a.tiers ? [0, 1, 2].map(i => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('') : '<i class="fixo"></i><i class="fixo"></i><i class="fixo"></i>';
      const pos = `${40 + (key.length * 7) % 40}% ${15 + (key.length * 5) % 30}%`;
      return `<button class="fg-card${a._tipo === 'ativa' ? ' is-active' : ''}${lock ? ' is-lock' : ''}${sel ? ' is-sel' : ''}" type="button" data-a="habilidade" data-key="${esc(key)}" style="${opts.estilo || ''}${opts.atraso ? ';animation-delay:' + opts.atraso : ''}" aria-label="${esc(a.name)}${lock ? ', liberada no nível ' + a.level : ''}">
        <span class="fg-card-art${img.propria ? ' is-own' : ''}" style="--fg-tint:${a._tipo === 'ativa' ? TINTA_ATIVA : TINTA_PASSIVA}"><img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''} style="object-position:${pos}"></span>
        <span class="fg-card-tag">${a._tipo === 'ativa' ? 'ATIVA' : 'PASSIVA'}</span>
        ${a._tipo === 'ativa' && Number(a.cost) ? `<span class="fg-card-cost" title="Custo em Energia">${Number(a.cost)}</span>` : ''}
        ${lock ? `<span class="fg-card-lock">${ICO.lock}NV ${a.level}</span>` : ''}
        ${M.abilityInDeck(a) ? `<span class="fg-card-star" title="Na mão">${ICO.star}</span>` : ''}
        <span class="fg-card-body"><b>${esc(a.name)}</b><small>${esc(resumoCarta(M, a))}</small></span>
        ${a.legacyFrom ? `<span class="fg-card-src">Legado · ${esc(FG.godDe(a.legacyFrom)?.name || '')}</span>` : ''}
        <span class="fg-card-tiers" aria-hidden="true">${faixas}</span>
      </button>`;
    };


    function kitSpaces(c) {
      const slots = c.M.divineSlots();
      if (!slots.length) return '';
      return `<details class="fg-sec"><summary class="fg-label">Configurar espaços de habilidades (${slots.length})</summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:8px;margin-top:10px">
        ${slots.map((slot, i) => {
          const power = window.FichaKits.chosen(slot, c.s.divineSelections);
          return `<button type="button" class="fg-row" data-a="kit-catalogo" data-slot="${esc(slot.key)}"><span class="fg-row-main"><small>${i + 1}º espaço · nível ${Number(slot.level)}${slot.level > c.s.level ? ' · bloqueado' : ''}</small><b>${esc(power.name)}</b><small>${slot.options.length} opção(ões)</small></span></button>`;
        }).join('')}</div></details>`;
    }
    acoes['kit-catalogo'] = el => FG.abrirGaveta('kit', { slot: el.dataset.slot, filtro: '' });
    acoes['kit-filtro'] = (el, ev) => {
      if (ev.type !== 'change') return;
      FG.S.drawer.filtro = el.value;
      FG.render();
    };
    acoes['kit-escolher'] = el => {
      const erro = FG.S.M.selectDivineAbility(el.dataset.slot, el.dataset.id);
      if (erro) window.PRINCIPIA.api.toast(erro);
      else { FG.salvar(); FG.render(); }
    };
    FG.gavetas.kit = (c, d) => {
      const slots = c.M.divineSlots();
      const slot = slots.find(s => s.key === d.slot);
      if (!slot) return '';
      const current = window.FichaKits.chosen(slot, c.s.divineSelections);
      const tags = a => [...(a.domains || []), ...(a.effects || [])];
      const filters = [...new Set(slot.options.flatMap(tags))];
      M2 = c.M;
      return `<div class="fg-drawer-body"><button type="button" class="fg-btn" data-a="fechar-gaveta">Fechar</button>
        <h2>Escolha do ${slots.indexOf(slot) + 1}º espaço</h2>
        ${filters.length ? `<label class="fg-label">Domínio ou efeito<select class="fg-in" data-a="kit-filtro"><option value="">Todos</option>${filters.map(t => `<option ${d.filtro === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>` : ''}
        ${slot.options.filter(a => !d.filtro || tags(a).includes(d.filtro)).map(a => {
          const reason = window.FichaKits.check(slots, c.s.divineSelections, slot.key, a.id, c.s.level);
          const stakes = c.M.stakesOf(a);
          const status = a.id === slot.base.id ? 'Original' : a.playtest ? 'Alternativa em playtest' : 'Alternativa';
          return `<article class="fg-sec"><small class="fg-label">✦ ${esc(status)} · ${current.id === a.id ? 'Selecionada' : reason ? 'Bloqueada' : 'Disponível'}</small>
            <h3>${esc(a.name)}</h3><p>${esc([...(a.domains || []), ...(a.effects || []), 'Nv. ' + a.level, (a.cost ?? 0) + ' EN', a.activation || 'Ativa'].join(' · '))}</p>
            <p>${esc(a.summary || resumoCarta(c.M, a))}</p>${a.tiers ? `<p><b>Estaca ${stakes}</b> · ${esc(c.M.tierText(a, stakes))}</p>` : ''}
            <details><summary>Mecânica completa</summary>${blocos(c.M, a, stakes) || esc(a.summary || a.extra || '')}</details>
            ${reason ? `<p>${esc(reason)}</p>` : ''}
            <button type="button" class="fg-btn" data-a="kit-escolher" data-slot="${esc(slot.key)}" data-id="${esc(a.id)}" ${reason || current.id === a.id ? 'disabled' : ''}>${current.id === a.id ? 'Selecionada' : 'Escolher'}</button></article>`;
        }).join('')}</div>`;
    };

    FG.abas.poderes = {
      render(c) {
        const { M, s } = c;
        if (M.isMortal()) return `<div class="fg-welcome"><h2>Sem kit divino</h2><p>Mortais da Névoa não têm habilidades de deus.${s.magic?.enabled ? ' As magias ficam na aba Magia.' : ''}</p></div>`;
        const f = FG.S.filtroPoderes || (FG.S.filtroPoderes = { tipo: 'todas', q: '' });
        const lista = todas(M);
        const norm = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        const qn = norm(f.q);
        const visiveis = lista.filter(a => (f.tipo === 'todas' || (f.tipo === 'mao' ? M.abilityInDeck(a) : f.tipo === 'livres' ? !bloqueada(M, a) : a._tipo === f.tipo)) && (!qn || norm(`${a.name} ${a.summary} ${M.tierText(a, M.stakesOf(a))}`).includes(qn)));
        const contar = t => (t === 'todas' ? lista.length : t === 'mao' ? lista.filter(a => M.abilityInDeck(a)).length : t === 'livres' ? lista.filter(a => !bloqueada(M, a)).length : lista.filter(a => a._tipo === t).length);
        const g = M.god();
        const alvo = M.targetResources();
        return `<div class="fg-sec">
          <div class="fg-sec-head">
            <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">${esc(M.isTriumvir(s.godId) ? 'Kit dos Triúnviros' : (g?.group || 'Kit'))}</span><h2 class="fg-h fg-h--big">Baralho de ${esc((g?.name || '').split(' ')[0])}</h2></div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <div class="fg-pills" role="group" aria-label="Filtrar cartas">${[['todas', 'Todas'], ['passiva', 'Passivas'], ['ativa', 'Ativas'], ['livres', 'Liberadas'], ['mao', 'Na mão']].map(([k, n]) => `<button class="fg-pill" type="button" data-a="filtro-poder" data-k="${k}" aria-pressed="${f.tipo === k}">${n} <small>${contar(k)}</small></button>`).join('')}</div>
              <input class="fg-in" type="search" data-a="busca-poder" data-vivo value="${esc(f.q)}" placeholder="Buscar habilidade" aria-label="Buscar habilidade" style="width:200px">
            </div>
          </div>
          ${kitSpaces(c)}
          ${alvo.length ? `<div class="fg-rows">${alvo.map(r => `<div class="fg-row"><div class="fg-row-main"><b>${esc(r.name)}</b><small>Recurso de alvo${r.reset?.text ? ' · zera: ' + esc(r.reset.text) : ''}</small></div><div class="fg-stepper"><button type="button" data-a="recurso" data-key="${esc(M.resourceKey(r))}" data-d="-1" aria-label="Menos 1">−</button><b>${M.resourceValue(r)}</b><button type="button" data-a="recurso" data-key="${esc(M.resourceKey(r))}" data-d="1" aria-label="Mais 1">+</button><small class="fg-muted">/ ${M.resourceMaxFor(r)}</small></div></div>`).join('')}</div>` : ''}
          ${visiveis.length ? `<div class="fg-deck">${visiveis.map((a, i) => FG.carta(c, a, { atraso: Math.min(i * 35, 700) + 'ms' })).join('')}</div>` : '<p class="fg-empty-line">Nenhuma carta com esse filtro.</p>'}
          <p class="fg-muted" style="font-size:12.5px">Toque numa carta para ver o texto completo, mexer nas estacas e usar. Os três traços na base da carta mostram a faixa de estacas atual.</p>
        </div>`;
      }
    };

    /* ---------------------------------------------------------------- gaveta da habilidade */
    function blocos(M, a, est) {
      const out = [];
      const pecas = (a.coreBlocks || []);
      if (pecas.length) {
        for (const b of pecas) {
          if (b.type === 'description') { if (b.text && b.text !== a.summary) out.push(`<div class="fg-text"><p>${esc(b.text)}</p></div>`); }
          else if (b.type === 'note') out.push(`<p class="fg-note">${esc(b.text || '')}</p>`);
          else if (b.type === 'tiers') out.push(faixas(b.items || [], est, b.label));
          else if (b.type === 'list' || Array.isArray(b.items)) out.push(`<div class="fg-text">${b.title || b.label ? `<b class="fg-label">${esc(b.title || b.label)}</b>` : ''}<ul>${(b.items || []).map(x => `<li>${esc(typeof x === 'string' ? x : (x.text || x.label || x.name || ''))}</li>`).join('')}</ul></div>`);
          else if (b.text) out.push(`<div class="fg-text">${b.title ? `<b class="fg-label">${esc(b.title)}</b>` : ''}<p>${esc(b.text)}</p></div>`);
        }
      } else if (a.tiers) {
        out.push(faixas([{ min: 0, max: 15, label: '0–15', text: a.tiers.low }, { min: 16, max: 29, label: '16–29', text: a.tiers.mid }, { min: 30, max: null, label: '30+', text: a.tiers.high }], est));
      }
      if (a.extra && !pecas.length) out.push(`<p class="fg-note">${esc(a.extra)}</p>`);
      return out.join('');
    }
    function faixas(itens, est, titulo) {
      if (!itens.length) return '';
      return `<div style="display:flex;flex-direction:column;gap:8px">${titulo ? `<b class="fg-label">${esc(titulo)}</b>` : ''}${itens.map(t => {
        const agora = M2.coreTierCurrent(t, est);
        const passou = Number(t.max ?? Infinity) < est;
        return `<div class="fg-tier${agora ? ' is-now' : passou ? ' is-past' : ''}"><b>${esc(t.label || `${t.min}+`)}${agora ? '<br><small>atual</small>' : ''}</b><span>${esc(maiuscula(t.text || ''))}</span></div>`;
      }).join('')}</div>`;
    }
    let M2 = null;

    FG.gavetas.habilidade = (c, d) => {
      const { M, s } = c;
      M2 = M;
      const a = todas(M).find(x => M.abilityKey(x) === d.key);
      if (!a) return '';
      const key = M.abilityKey(a);
      const est = M.stakesOf(a);
      const maxEst = M.magicAbilityStakeMax(a);
      const lock = bloqueada(M, a);
      const img = arte(M, a);
      const regra = M.abilityUsageRule(a);
      const usos = regra ? M.abilityUses(a) : 0;
      const escolhas = M.abilityChoiceDefs(a);
      const recursos = M.abilityResourcesFor ? M.abilityResourcesFor(a) : [];
      const naMao = M.abilityInDeck(a);
      const meta = a._tipo === 'ativa' ? `Nível ${a.level} · ${Number(a.cost) || 0} EN` : (a.tiers || (a.coreBlocks || []).some(b => b.type === 'tiers') ? 'Evolui com estacas' : 'Efeito fixo');
      const slugs = window.PRINCIPIA?.api?.deitySlugs?.();
      const slug = slugs?.get?.(a.sourceGodId || s.godId);
      return `<div class="fg-drawer-head" style="--fg-tint:${a._tipo === 'ativa' ? TINTA_ATIVA : TINTA_PASSIVA}">
          <img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''}>
          <button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button>
          <span class="fg-drawer-tags"><span class="fg-tag ${a._tipo === 'ativa' ? 'fg-tag--red' : 'fg-tag--gold'}">${a._tipo === 'ativa' ? 'Ativa' : 'Passiva'}</span><span class="fg-tag">${esc(meta)}</span>${a.legacyFrom ? `<span class="fg-tag">Legado · ${esc(FG.godDe(a.legacyFrom)?.name || '')}</span>` : ''}${lock ? `<span class="fg-tag">Bloqueada até o nível ${a.level}</span>` : ''}</span>
        </div>
        <div class="fg-drawer-body">
          <h3>${esc(a.name)}</h3>
          ${a.summary ? `<p style="color:var(--os-win-muted)">${esc(a.summary)}</p>` : ''}
          ${a.tiers || (a.coreBlocks || []).some(b => b.type === 'tiers') ? `<div class="fg-box" style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="fg-label">Estacas desta habilidade</span><b class="fg-anton" style="font-size:24px">${est} <small class="fg-muted" style="font:600 13px Inter">/ ${maxEst}</small></b></div>
            <input type="range" min="0" max="${maxEst}" value="${est}" data-a="estacas" data-vivo data-key="${esc(key)}" aria-label="Estacas de ${esc(a.name)}">
          </div>` : ''}
          ${blocos(M, a, est)}
          ${regra ? `<div class="fg-row"><div class="fg-row-main"><b>Usos</b><small>${regra.max} por ${esc(regra.label)}</small></div><div class="fg-stepper"><button type="button" data-a="usos" data-key="${esc(key)}" data-d="-1" aria-label="Menos um uso">−</button><b>${usos}</b><button type="button" data-a="usos" data-key="${esc(key)}" data-d="1" aria-label="Mais um uso">+</button><small class="fg-muted">/ ${regra.max}</small></div></div>` : ''}
          ${escolhas.map(ch => {
            const ops = M.choiceOptions(a, ch), lim = M.choiceLimit(a, ch), esc2 = M.chosenFor(a, ch);
            return `<div class="fg-box"><div class="fg-sec-head"><b class="fg-label">${esc(ch.label || 'Escolha')}</b><span class="fg-label">${esc2.length}/${lim}</span></div><div class="fg-skillpick" style="margin-top:8px">${ops.map(o => { const on = esc2.includes(o.id); const off = !on && esc2.length >= lim; return `<label class="${off ? 'is-off' : ''}"><input type="checkbox" data-a="escolha" data-key="${esc(key)}" data-ch="${esc(ch.id)}" data-op="${esc(o.id)}"${on ? ' checked' : ''}${off ? ' disabled' : ''}>${esc(o.label || o.name || o.id)}</label>`; }).join('')}</div></div>`;
          }).join('')}
          ${recursos.length ? recursos.map(r => `<div class="fg-row"><div class="fg-row-main"><b>${esc(r.name)}</b><small>${r.scope === 'target' ? 'Recurso de alvo' : 'Recurso pessoal'}</small></div><div class="fg-stepper"><button type="button" data-a="recurso" data-key="${esc(M.resourceKey(r))}" data-d="-1" aria-label="Menos 1">−</button><b>${M.resourceValue(r)}</b><button type="button" data-a="recurso" data-key="${esc(M.resourceKey(r))}" data-d="1" aria-label="Mais 1">+</button><small class="fg-muted">/ ${M.resourceMaxFor(r)}</small></div></div>`).join('') : ''}
          <div class="fg-actions">
            <label class="fg-btn fg-btn--sm" style="cursor:pointer">Trocar a arte<input type="file" accept="image/*" data-a="arte-habilidade" data-key="${esc(key)}" hidden></label>
            ${img.propria ? `<button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="arte-habilidade-tirar" data-key="${esc(key)}">Voltar à arte padrão</button>` : ''}
            ${slug ? `<button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="regra" data-p="deuses" data-anc="deus-${esc(slug)}">Abrir no Guia</button>` : ''}
          </div>
        </div>
        <div class="fg-drawer-foot">
          ${a._tipo === 'ativa' && !lock ? `<button class="fg-btn fg-btn--pri" type="button" data-a="usar" data-key="${esc(key)}" data-custo="${Number(a.cost) || 0}">Usar · −${Number(a.cost) || 0} EN</button>` : ''}
          <button class="fg-btn" type="button" data-a="mao" data-key="${esc(key)}">${naMao ? ICO.star + 'Tirar da mão' : ICO.starO + 'Pôr na mão'}</button>
        </div>`;
    };

    /* ---------------------------------------------------------------- ações */
    const S = FG.S;
    acoes.habilidade = el => FG.abrirGaveta('habilidade', { key: el.dataset.key });
    acoes['filtro-poder'] = el => { (S.filtroPoderes ||= { tipo: 'todas', q: '' }).tipo = el.dataset.k; FG.render(); };
    acoes['busca-poder'] = (el, ev) => {
      (S.filtroPoderes ||= { tipo: 'todas', q: '' }).q = el.value;
      clearTimeout(acoes._buscaT);
      acoes._buscaT = setTimeout(() => {
        FG.renderAgora();
        const campo = document.querySelector('#osFichaBody [data-a="busca-poder"]');
        if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
      }, 220);
    };
    acoes.estacas = (el, ev) => {
      const M = S.M;
      S.M.state.abilityStakes = S.M.state.abilityStakes || {};
      S.M.state.abilityStakes[el.dataset.key] = FG.clamp(Number(el.value), 0, 30);
      FG.salvar();
      if (ev.type === 'input') {
        clearTimeout(acoes._estT);
        acoes._estT = setTimeout(() => { FG.render(); const valor = el.value; requestAnimationFrame(() => { const r = document.querySelector(`.fg-drawer [data-a="estacas"]`); if (r) { r.value = valor; r.focus(); } }); }, 120);
      } else FG.render();
      void M;
    };
    acoes.usos = el => {
      const M = S.M, a = todas(M).find(x => M.abilityKey(x) === el.dataset.key);
      if (!a) return;
      const regra = M.abilityUsageRule(a);
      M.state.abilityUses = M.state.abilityUses || {};
      M.state.abilityUses[M.abilityUsageKey(a)] = FG.clamp(M.abilityUses(a) + Number(el.dataset.d), 0, regra?.max || 99);
      FG.salvar(); FG.render();
    };
    acoes.escolha = el => {
      const M = S.M, a = todas(M).find(x => M.abilityKey(x) === el.dataset.key);
      if (!a) return;
      const ch = M.abilityChoiceDefs(a).find(x => String(x.id) === el.dataset.ch);
      if (!ch) return;
      const k = M.choiceStateKey(a, ch);
      const atual = M.chosenFor(a, ch).slice();
      const lim = M.choiceLimit(a, ch);
      const op = el.dataset.op;
      const prox = el.checked ? (atual.includes(op) ? atual : [...atual, op].slice(0, lim)) : atual.filter(x => x !== op);
      M.state.abilityChoices = M.state.abilityChoices || {};
      M.state.abilityChoices[k] = prox;
      M.syncCurrentCaps();
      FG.salvar(); FG.render();
    };
    acoes.usar = el => S.M.useAbility(el.dataset.key, Number(el.dataset.custo) || 0);
    acoes.mao = el => {
      const s = S.M.state, key = el.dataset.key;
      s.abilityDeck = Array.isArray(s.abilityDeck) ? s.abilityDeck : [];
      if (s.abilityDeck.includes(key)) s.abilityDeck = s.abilityDeck.filter(k => k !== key);
      else {
        if (s.abilityDeck.length >= FG.MAO) { window.PRINCIPIA.api.toast(`A mão tem ${FG.MAO} cartas. Tire uma antes de pôr outra.`); return; }
        s.abilityDeck.push(key);
      }
      FG.salvar(); FG.render();
    };
    acoes['arte-habilidade'] = async el => {
      const f = el.files?.[0];
      if (!f) return;
      const url = await FG.imagem(f, 600, 600);
      const s = S.M.state;
      s.abilityVisuals = s.abilityVisuals || {};
      s.abilityVisuals[el.dataset.key] = { ...(s.abilityVisuals[el.dataset.key] || {}), imageUrl: url };
      FG.salvar(); FG.render();
    };
    acoes['arte-habilidade-tirar'] = el => { const s = S.M.state; if (s.abilityVisuals?.[el.dataset.key]) { s.abilityVisuals[el.dataset.key].imageUrl = ''; FG.salvar(); FG.render(); } };

    /* Imagens: reduz e comprime antes de guardar (a ficha inteira vive no navegador e no JSON). */
    FG.imagem = (arquivo, maxL, maxA, qualidade = 0.82) => new Promise((res, rej) => {
      if (!arquivo || !/^image\//.test(arquivo.type)) { rej(new Error('Escolha uma imagem.')); return; }
      const leitor = new FileReader();
      leitor.onerror = () => rej(leitor.error);
      leitor.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('Imagem inválida.'));
        img.onload = () => {
          const k = Math.min(1, maxL / img.width, maxA / img.height);
          const cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * k));
          cv.height = Math.max(1, Math.round(img.height * k));
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          let url = cv.toDataURL('image/webp', qualidade);
          if (!url.startsWith('data:image/webp')) url = cv.toDataURL('image/jpeg', qualidade);
          res(url);
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
