/* GUIA DA DUODÉCIMA · Ficha · aba Magia (despertar, círculos, sacrifícios, concentração e magias). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal } = FG;
    const acoes = FG.acoes;
    const S = FG.S;
    const nomeCirculo = c => (Number(c) === 0 ? 'Truques' : `${c}º círculo`);

    FG.abas.magia = {
      render(c) {
        const { M, s, D } = c;
        const mg = s.magic || {};
        if (!mg.enabled) {
          return `<div class="fg-welcome" style="max-width:680px">
            <span class="fg-kicker">Magia</span>
            <h2>Personagem não despertado</h2>
            <p>Ative só quando o personagem realmente tiver acesso ao sistema de Magia. Isso libera círculos, magias, concentração, rituais e sacrifícios físicos.</p>
            <p class="fg-note" style="text-align:left">Ao despertar, a progressão de HP perde ${Number(D.magic.hpProgressionPenalty) || 2} pontos a cada 10 níveis, inclusive de forma retroativa. Dá para sacrificar até ${Number(D.magic.maxSacrifices) || 3} pontos entre FOR, DES e CON; cada ponto rende ${Number(D.magic.sacrificeEnergyEach) || 25} de Energia.</p>
            <div class="fg-actions" style="justify-content:center"><button class="fg-btn fg-btn--pri" type="button" data-a="magia-despertar">Despertar para a Magia</button><button class="fg-btn fg-btn--ghost" type="button" data-a="regra" data-p="magia" data-anc="introducao">Regras de Magia</button></div>
          </div>`;
        }
        const maxCirc = M.maxMagicCircleByLevel();
        const circulos = [...new Set([0, ...(D.magic.circles || []).map(x => x.circle)])].sort((a, b) => a - b);
        const porCirculo = new Map();
        for (const sp of mg.spells || []) { const k = Number(sp.circle) || 0; if (!porCirculo.has(k)) porCirculo.set(k, []); porCirculo.get(k).push(sp); }
        const conc = (mg.spells || []).find(x => x.id === mg.concentrationSpellId);
        const altos = [6, 7, 8, 9].filter(k => M.highCircleRemaining(k) !== null && maxCirc >= k);
        let n = 0;
        return `<div class="fg-cols2 fg-cols2--painel-esq">
          <div class="fg-sec">
            <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Conjurador</span><h2 class="fg-h fg-h--big">Magia</h2></div>
            <div class="fg-box" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
              <div><span class="fg-label">Ataque mágico</span><div class="fg-anton" style="font-size:34px">${sinal(M.magicCastBonus())}</div></div>
              <div><span class="fg-label">DT mágica</span><div class="fg-anton" style="font-size:34px">${M.magicCastDT()}</div></div>
            </div>
            <div class="fg-form">
              <label class="fg-field"><span>Atributo de conjuração</span><select data-a="campo" data-calc data-path="magic.castingAttr">${(D.magic.castingAttributes || ['int', 'fe', 'car']).map(k => `<option value="${k}"${mg.castingAttr === k ? ' selected' : ''}>${esc(FG.attrsLista.find(a => a[0] === k)?.[2] || k)}</option>`).join('')}</select></label>
              <label class="fg-field"><span>Círculo atual (máx. ${maxCirc})</span><select data-a="campo" data-tipo="int" data-render data-path="magic.circle">${Array.from({ length: maxCirc }, (_, i) => i + 1).map(k => `<option value="${k}"${Number(mg.circle) === k ? ' selected' : ''}>${k}º círculo</option>`).join('')}</select></label>
            </div>
            <div class="fg-sec-head"><b class="fg-label">Atributos físicos → Energia</b><span class="fg-label">${M.magicSacrificeTotal()}/${Number(D.magic.maxSacrifices) || 3} · +${M.magicSacrificeTotal() * (Number(D.magic.sacrificeEnergyEach) || 25)} EN</span></div>
            <p class="fg-muted" style="font-size:12.5px;margin:0">Como na Ficha Oficial: <b>−</b> tira um ponto de FOR, DES ou CON e dá +${Number(D.magic.sacrificeEnergyEach) || 25} de Energia máxima; <b>+</b> desfaz. O número grande é o atributo final.</p>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${['for', 'des', 'con'].map(k => {
              const [, ab, nome] = FG.attrsLista.find(a => a[0] === k);
              const sac = M.magicSacrifice(k), final = M.structuralAttr(k), antes = final + sac;
              return `<div class="fg-box fg-sacrificio${sac ? ' is-on' : ''}" style="padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center"><span class="fg-kicker" style="letter-spacing:.14em">${ab}</span>
                <div class="fg-stepper"><button type="button" data-a="sacrificio" data-k="${k}" data-d="1" aria-label="Sacrificar 1 ponto de ${nome} (+${Number(D.magic.sacrificeEnergyEach) || 25} de Energia)">−</button><b>${final}</b><button type="button" data-a="sacrificio" data-k="${k}" data-d="-1" aria-label="Desfazer um sacrifício de ${nome}"${sac ? '' : ' disabled'}>+</button></div>
                <small class="fg-muted" style="font-size:11.5px">antes ${antes} · sacrifício −${sac}</small></div>`;
            }).join('')}</div>
            <div class="fg-sec-head"><b class="fg-label">Concentração</b></div>
            <div class="fg-form">
              <label class="fg-field fg-wide"><span>Magia mantida</span><select data-a="campo" data-render data-path="magic.concentrationSpellId"><option value="">Nenhuma</option>${(mg.spells || []).filter(x => x.concentration).map(x => `<option value="${esc(x.id)}"${mg.concentrationSpellId === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
              ${conc ? `<label class="fg-field"><span>Dano sofrido</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-render data-path="magic.concentrationDamage" value="${Number(mg.concentrationDamage) || 0}"></label><p class="fg-muted" style="font-size:12.5px;align-self:end">Ao sofrer dano, faça o teste de concentração da regra.</p>` : ''}
            </div>
            ${altos.length ? `<div class="fg-sec-head"><b class="fg-label">Círculos altos (até o descanso longo)</b></div><div class="fg-rows">${altos.map(k => `<div class="fg-row"><div class="fg-row-main"><b>${k}º círculo</b><small>${M.highCircleRemaining(k)} uso(s) restante(s)</small></div></div>`).join('')}</div>` : ''}
            <label class="fg-field"><span>Anotações de magia</span><textarea data-a="campo" data-vivo data-path="magic.notes" rows="3">${esc(mg.notes || '')}</textarea></label>
            <details class="fg-box"><summary class="fg-label" style="cursor:pointer">Desativar Magia</summary><p class="fg-muted" style="font-size:12.5px;margin:8px 0">As magias continuam guardadas; só deixam de contar na ficha.</p><button class="fg-btn fg-btn--sm fg-btn--danger" type="button" data-a="magia-desativar">Desativar</button></details>
          </div>
          <div class="fg-sec">
            <div class="fg-sec-head"><h3 class="fg-h">Grimório</h3><div class="fg-actions"><button class="fg-btn fg-btn--sm" type="button" data-a="magia-nova">${ICO.plus}Nova magia</button><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="regra" data-p="magia" data-anc="circulos">Círculos no Guia</button></div></div>
            ${circulos.filter(k => porCirculo.has(k)).map(k => `<div class="fg-sec" style="margin-top:6px">
              <div class="fg-sec-head"><b class="fg-label" style="color:var(--fg-accent)">${nomeCirculo(k)}${k ? ` · ${M.magicSpellCost(k)} EN` : ' · sem custo'}</b>${k > maxCirc || k > Number(mg.circle) ? '<span class="fg-label">ainda não disponível</span>' : ''}</div>
              <div class="fg-spells">${porCirculo.get(k).map(sp => {
                const custo = M.magicSpellCost(k, false);
                const bloq = k > 0 && (k > Number(mg.circle) || M.state.level < (M.magicCircleRule(k)?.minLevel || 999));
                n += 1;
                return `<div class="fg-spell" style="animation-delay:${Math.min(n * 40, 600)}ms${bloq ? ';opacity:.55' : ''}">
                  <div class="fg-spell-top"><b>${esc(sp.name || 'Magia')}</b>${mg.concentrationSpellId === sp.id ? '<span class="fg-tag fg-tag--red">Mantendo</span>' : ''}</div>
                  <div class="fg-spell-meta"><span class="${sp.components?.v ? 'on' : ''}">V</span><span class="${sp.components?.s ? 'on' : ''}">S</span><span class="${sp.components?.m ? 'on' : ''}">M</span>${sp.concentration ? '<span class="on">Concentração</span>' : ''}${sp.ritual ? '<span class="on">Ritual</span>' : ''}${sp.source ? `<span>${esc(sp.source)}</span>` : ''}</div>
                  ${sp.notes ? `<p class="fg-muted" style="font-size:12.5px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(sp.notes)}</p>` : ''}
                  <div class="fg-actions" style="margin-top:auto">
                    <button class="fg-btn fg-btn--pri fg-btn--sm" type="button" data-a="conjurar" data-id="${esc(sp.id)}"${bloq ? ' disabled' : ''}>Conjurar${custo ? ' · −' + custo : ''}</button>
                    ${sp.ritual && k > 0 ? `<button class="fg-btn fg-btn--sm" type="button" data-a="conjurar" data-ritual="1" data-id="${esc(sp.id)}"${bloq ? ' disabled' : ''}>Ritual · −${M.magicSpellCost(k, true)}</button>` : ''}
                    <button class="fg-btn fg-btn--sm fg-btn--ghost fg-btn--icon" type="button" data-a="magia-editar" data-id="${esc(sp.id)}" aria-label="Editar ${esc(sp.name || 'magia')}">${ICO.edit}</button>
                  </div>
                </div>`;
              }).join('')}</div>
            </div>`).join('') || '<p class="fg-empty-line">Nenhuma magia. Use “Nova magia”.</p>'}
          </div>
        </div>`;
      }
    };

    FG.gavetas.magia = (c, d) => {
      const { M, s, D } = c;
      const sp = (s.magic?.spells || []).find(x => x.id === d.id);
      if (!sp) return '';
      const p = `magic.spells[id=${sp.id}]`;
      const circulos = [0, ...(D.magic.circles || []).map(x => x.circle)];
      return `<div class="fg-drawer-head" style="--fg-tint:linear-gradient(180deg,rgba(123,79,208,.4),rgba(20,6,30,.85))"><img src="${FG.HQ}a-magia.webp" alt=""><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button><span class="fg-drawer-tags"><span class="fg-tag fg-tag--red">${nomeCirculo(sp.circle)}</span><span class="fg-tag">${M.magicSpellCost(sp.circle)} EN</span></span></div>
        <div class="fg-drawer-body">
          <h3>${esc(sp.name || 'Magia')}</h3>
          <div class="fg-form">
            <label class="fg-field fg-wide"><span>Nome</span><input data-a="campo" data-render data-path="${p}.name" value="${esc(sp.name || '')}"></label>
            <label class="fg-field"><span>Círculo</span><select data-a="campo" data-tipo="int" data-render data-path="${p}.circle">${circulos.map(k => `<option value="${k}"${Number(sp.circle) === k ? ' selected' : ''}>${nomeCirculo(k)}</option>`).join('')}</select></label>
            <label class="fg-field"><span>Origem</span><input data-a="campo" data-render data-path="${p}.source" value="${esc(sp.source || '')}" placeholder="Ex.: Inicial, aprendida em missão"></label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.components.v"${sp.components?.v ? ' checked' : ''}> Verbal</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.components.s"${sp.components?.s ? ' checked' : ''}> Somático</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.components.m"${sp.components?.m ? ' checked' : ''}> Material</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.concentration"${sp.concentration ? ' checked' : ''}> Concentração</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.ritual"${sp.ritual ? ' checked' : ''}> Pode ser ritual</label>
          </div>
          <label class="fg-field"><span>Efeito e detalhes</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="6">${esc(sp.notes || '')}</textarea></label>
        </div>
        <div class="fg-drawer-foot"><button class="fg-btn fg-btn--danger" type="button" data-a="magia-remover" data-id="${esc(sp.id)}">Remover magia</button></div>`;
    };

    acoes['magia-despertar'] = async () => {
      const ok = await FG.confirmar('Despertar para a Magia?', 'A progressão de HP muda e passam a valer sacrifícios e círculos. Dá para desativar depois.', 'Despertar');
      if (!ok) return;
      const M = S.M;
      M.state.magic.enabled = true;
      M.ensureMagicStarters();
      M.syncCurrentCaps(); FG.salvar(); FG.render();
      window.PRINCIPIA.api.toast('Magia ativada.');
    };
    acoes['magia-desativar'] = async () => {
      const ok = await FG.confirmar('Desativar a Magia?', 'As magias ficam guardadas, mas sacrifícios e penalidades deixam de valer.', 'Desativar', true);
      if (!ok) return;
      S.M.state.magic.enabled = false;
      S.M.syncCurrentCaps(); FG.salvar(); FG.render();
    };
    acoes.sacrificio = el => {
      const M = S.M, k = el.dataset.k, d = Number(el.dataset.d), mg = M.state.magic;
      const max = Number(M.state && FG.S.D.magic.maxSacrifices) || 3;
      mg.sacrifices = mg.sacrifices || { for: 0, des: 0, con: 0 };
      if (d > 0 && (M.magicSacrificeTotal() >= max || M.magicSacrificeAvailable(k) <= 0)) { window.PRINCIPIA.api.toast(`O limite é ${max} pontos sacrificados no total.`); return; }
      mg.sacrifices[k] = FG.clamp((Number(mg.sacrifices[k]) || 0) + d, 0, max);
      M.syncCurrentCaps(); FG.salvar(); FG.render();
    };
    acoes.conjurar = el => S.M.castMagicSpell(el.dataset.id, el.dataset.ritual === '1');
    acoes['magia-nova'] = () => {
      const sp = { id: FG.uid('spell'), name: 'Nova magia', circle: 1, components: { v: false, s: false, m: false }, concentration: false, ritual: false, source: '', notes: '' };
      S.M.state.magic.spells.push(sp); FG.salvar(); FG.abrirGaveta('magia', { id: sp.id }); FG.render();
    };
    acoes['magia-editar'] = el => FG.abrirGaveta('magia', { id: el.dataset.id });
    acoes['magia-remover'] = async el => {
      const ok = await FG.confirmar('Remover esta magia?', 'Ela sai do grimório.', 'Remover', true);
      if (!ok) return;
      const mg = S.M.state.magic;
      mg.spells = mg.spells.filter(x => x.id !== el.dataset.id);
      if (mg.concentrationSpellId === el.dataset.id) mg.concentrationSpellId = '';
      FG.fecharGaveta(); FG.salvar(); FG.render();
    };
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
