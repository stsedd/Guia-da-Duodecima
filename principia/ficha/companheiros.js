/* GUIA DA DUODÉCIMA · Ficha · aba Companheiros (familiares, montarias, lendários, companions). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO } = FG;
    const acoes = FG.acoes;
    const S = FG.S;
    const TIPOS = [['auxiliar', 'Auxiliar'], ['montaria', 'Montaria'], ['lendario', 'Lendário'], ['companion', 'Companion'], ['narrativo', 'Narrativo']];
    const nomeTipo = t => TIPOS.find(x => x[0] === t)?.[1] || 'Familiar';
    const hpAtual = (M, f) => { const max = M.familiarHpMax(f); return f.currentHp == null ? max : Math.min(Number(f.currentHp) || 0, max); };
    const pontos = (M, f) => (f.type === 'companion' ? Math.max(0, Number(f.companionAttributePoints) || 0) : Number(M.familiarTypeRule(f.type)?.attributePoints || 0));

    FG.abas.companheiros = {
      render(c) {
        const { M, s, D } = c;
        const fs = s.familiars || { entries: [] };
        const filtro = S.filtroFam || 'todos';
        const lista = (fs.entries || []).filter(f => filtro === 'todos' || f.type === filtro);
        const comuns = M.familiarActiveCommons().length, lend = M.familiarActiveLegendaries().length;
        const temMontaria = (fs.entries || []).some(f => f.type === 'montaria');
        return `<div class="fg-sec">
          <div class="fg-sec-head">
            <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Familiares, montarias e lendários</span><h2 class="fg-h fg-h--big">Companheiros</h2></div>
            <div class="fg-actions"><span class="fg-chip" style="color:inherit;background:var(--os-win-soft);border-color:var(--os-win-line)">Comuns em missão ${comuns}/2</span><span class="fg-chip" style="color:inherit;background:var(--os-win-soft);border-color:var(--os-win-line)">Lendários ativos ${lend}</span><button class="fg-btn fg-btn--pri fg-btn--sm" type="button" data-a="fam-novo" data-t="auxiliar">${ICO.plus}Familiar</button><button class="fg-btn fg-btn--sm" type="button" data-a="fam-novo" data-t="companion">${ICO.plus}Companion</button></div>
          </div>
          <p class="fg-note">Até 2 familiares comuns acompanham uma missão; com dois, pelo menos um precisa ser Montaria ou superior. Lendários ficam fora desse limite. ${esc(D.familiars.types?.auxiliar?.detail || '')} ${esc(D.familiars.types?.montaria?.detail || '')}</p>
          <div class="fg-pills">${[['todos', 'Todos'], ...TIPOS].map(([k, n]) => `<button class="fg-pill" type="button" data-a="fam-filtro" data-k="${k}" aria-pressed="${filtro === k}">${n} <small>${k === 'todos' ? (fs.entries || []).length : (fs.entries || []).filter(f => f.type === k).length}</small></button>`).join('')}</div>
          ${temMontaria && !fs.mountFameClaimed ? `<div class="fg-note">Possuir uma montaria concede +10 de fama. <button class="fg-btn fg-btn--sm" type="button" data-a="fam-fama-montaria" style="margin-left:8px">Registrar na Roma</button></div>` : ''}
          ${lista.length ? `<div class="fg-fams">${lista.map((f, i) => cartaFam(c, f, i)).join('')}</div>` : '<p class="fg-empty-line">Nenhum companheiro aqui.</p>'}
          <label class="fg-field"><span>Notas gerais de familiares</span><textarea data-a="campo" data-vivo data-path="familiars.notes" rows="3" placeholder="Regras especiais, cuidados, alojamento, permissões…">${esc(fs.notes || '')}</textarea></label>
        </div>`;
      }
    };

    function cartaFam(c, f, i) {
      const { M } = c;
      const max = M.familiarHpMax(f), hp = hpAtual(M, f);
      const img = f.images?.[0];
      const pode = f.active || M.canActivateFamiliar(f);
      return `<article class="fg-fam${f.active ? ' is-on' : ''}" style="animation-delay:${i * 60}ms">
        <button class="fg-fam-art" type="button" data-a="fam-abrir" data-id="${esc(f.id)}" style="all:unset;display:block;position:relative;height:130px;cursor:pointer;background:#0b0809" aria-label="Abrir ${esc(f.name || 'familiar')}">
          <img src="${FG.src(img || FG.HQ + 'a-familiar.webp')}" alt=""${img ? ' class="is-own"' : ''} style="width:100%;height:100%;object-fit:cover">
          <span><small>${esc(nomeTipo(f.type))}${f.species ? ' · ' + esc(f.species) : ''}</small><b>${esc(f.name || 'Familiar')}</b></span>
        </button>
        <div class="fg-fam-body">
          ${max > 0 ? `<div style="display:flex;align-items:center;gap:10px"><span class="fg-label">Vida</span><div class="fg-bar" style="flex:1"><i style="width:${max ? Math.round(hp / max * 100) : 0}%"></i></div><div class="fg-stepper"><button type="button" data-a="fam-hp" data-id="${esc(f.id)}" data-d="-1" aria-label="Menos 1 de vida">−</button><b style="font-size:18px;min-width:40px">${hp}/${max}</b><button type="button" data-a="fam-hp" data-id="${esc(f.id)}" data-d="1" aria-label="Mais 1 de vida">+</button></div></div>` : '<p class="fg-muted" style="font-size:12.5px">Sem vida mecânica (narrativo).</p>'}
          <div class="fg-fam-attrs">${FG.attrsLista.map(([k, ab]) => `<span><small>${ab}</small><b>${Number(f.attributes?.[k]) || 0}</b></span>`).join('')}</div>
          ${(f.skills || []).filter(Boolean).length ? `<small class="fg-muted">${esc(f.skills.filter(Boolean).join(' · '))}</small>` : ''}
          <div class="fg-actions">
            <label class="fg-check" title="${pode ? '' : 'Limite de familiares comuns em missão atingido'}"><input type="checkbox" data-a="fam-ativo" data-id="${esc(f.id)}"${f.active ? ' checked' : ''}${pode ? '' : ' disabled'}> Em missão</label>
            <span style="flex:1"></span>
            <button class="fg-btn fg-btn--sm" type="button" data-a="fam-abrir" data-id="${esc(f.id)}">Abrir ficha</button>
          </div>
        </div>
      </article>`;
    }

    FG.gavetas.familiar = (c, d) => {
      const { M, s, D } = c;
      const f = (s.familiars?.entries || []).find(x => x.id === d.id);
      if (!f) return '';
      const p = `familiars.entries[id=${f.id}]`;
      const max = M.familiarHpMax(f), hp = hpAtual(M, f);
      const pts = pontos(M, f), gastos = M.familiarAttrSpent(f), lim = M.familiarSkillLimit(f);
      const hab = (f.abilities || []);
      const img = f.images?.[0];
      return `<div class="fg-drawer-head"><img src="${FG.src(img || FG.HQ + 'a-familiar.webp')}" alt=""${img ? ' class="is-own"' : ''}><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button><span class="fg-drawer-tags"><span class="fg-tag fg-tag--gold">${esc(nomeTipo(f.type))}</span>${f.active ? '<span class="fg-tag fg-tag--red">Em missão</span>' : ''}</span></div>
        <div class="fg-drawer-body">
          <h3>${esc(f.name || 'Familiar')}</h3>
          <div class="fg-form">
            <label class="fg-field"><span>Nome</span><input data-a="campo" data-render data-path="${p}.name" value="${esc(f.name || '')}"></label>
            <label class="fg-field"><span>Espécie</span><input data-a="campo" data-render data-path="${p}.species" value="${esc(f.species || '')}"></label>
            <label class="fg-field"><span>Tipo</span><select data-a="fam-tipo" data-id="${esc(f.id)}">${TIPOS.map(([k, n]) => `<option value="${k}"${f.type === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="fg-field"><span>Origem</span><input data-a="campo" data-path="${p}.origin" value="${esc(f.origin || '')}" placeholder="Missão, habilidade, compra…"></label>
            ${max > 0 ? `<label class="fg-field"><span>Vida atual (máx. ${max})</span><input type="number" min="0" max="${max}" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.currentHp" value="${hp}"></label>` : ''}
            <label class="fg-field"><span>Habilidade de origem</span><input data-a="campo" data-path="${p}.sourceAbility" value="${esc(f.sourceAbility || '')}"></label>
          </div>
          <div class="fg-sec-head"><b class="fg-label">Atributos</b><span class="fg-label" style="color:${gastos > pts ? 'var(--fg-accent)' : 'inherit'}">${gastos}/${pts} pontos</span></div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${FG.attrsLista.map(([k, ab]) => `<div class="fg-box" style="padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px"><span class="fg-kicker" style="letter-spacing:.14em">${ab}</span><div class="fg-stepper"><button type="button" data-a="fam-attr" data-id="${esc(f.id)}" data-k="${k}" data-d="-1" aria-label="Menos ${ab}">−</button><b>${Number(f.attributes?.[k]) || 0}</b><button type="button" data-a="fam-attr" data-id="${esc(f.id)}" data-k="${k}" data-d="1" aria-label="Mais ${ab}">+</button></div></div>`).join('')}</div>
          <div class="fg-sec-head"><b class="fg-label">Perícias</b><span class="fg-label">${lim} escolha(s)</span></div>
          ${lim ? `<div class="fg-form">${Array.from({ length: lim }, (_, i) => `<label class="fg-field"><span>Perícia ${i + 1}</span><select data-a="fam-pericia" data-id="${esc(f.id)}" data-i="${i}"><option value="">Escolha…</option>${D.skills.map(k => `<option${f.skills?.[i] === k.name ? ' selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label>`).join('')}</div>` : '<p class="fg-muted" style="font-size:12.5px">Perícias definidas pela Staff para este tipo.</p>'}
          ${f.type === 'companion' ? `<div class="fg-sec-head"><b class="fg-label">Companion</b></div><div class="fg-form">
            <label class="fg-field"><span>Vida máxima (até ${Math.max(1, Math.floor(M.hpMax() / 2))})</span><input type="number" min="1" max="${Math.max(1, Math.floor(M.hpMax() / 2))}" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.companionHpMax" value="${f.companionHpMax ?? Math.max(1, Math.floor(M.hpMax() / 2))}"></label>
            <label class="fg-field"><span>Pontos de atributo</span><input type="number" min="0" max="60" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.companionAttributePoints" value="${Number(f.companionAttributePoints) || 0}"></label>
            <label class="fg-field"><span>Quantidade de perícias</span><input type="number" min="0" max="26" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.companionSkillCount" value="${Number(f.companionSkillCount) || 0}"></label>
            <label class="fg-field"><span>Ações</span><input type="number" min="0" max="10" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.companionActions" value="${Number(f.companionActions) || 0}"></label>
            <label class="fg-field"><span>Bônus de ataque</span><input type="number" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.companionAttackBonus" value="${Number(f.companionAttackBonus) || 0}"></label>
            <label class="fg-field"><span>Dado de dano</span><input data-a="campo" data-path="${p}.companionDamageDie" value="${esc(f.companionDamageDie || '1d6')}"></label>
            <label class="fg-field fg-wide"><span>Notas do companion</span><textarea data-a="campo" data-vivo data-path="${p}.companionNotes" rows="3">${esc(f.companionNotes || '')}</textarea></label>
          </div>` : ''}
          ${f.type === 'montaria' ? `<div class="fg-sec-head"><b class="fg-label">Montaria</b><span class="fg-label">${M.mountEligible(f) ? 'liberada' : M.mountRouteOk(f) ? 'falta aprovação da Staff' : 'precisa de Conhecido + VIP ou 50 de fama'}</span></div><div class="fg-form">
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.knownVip"${f.knownVip ? ' checked' : ''}> Conhecido + VIP</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.staffApproved"${f.staffApproved ? ' checked' : ''}> Aprovada pela Staff</label>
            <label class="fg-check fg-wide"><input type="checkbox" data-a="campo" data-render data-path="${p}.barding.enabled"${f.barding?.enabled ? ' checked' : ''}> Usa barda</label>
            ${f.barding?.enabled ? `<label class="fg-field"><span>Barda</span><input data-a="campo" data-path="${p}.barding.name" value="${esc(f.barding.name || '')}"></label>
            <label class="fg-field"><span>Tipo</span><input data-a="campo" data-path="${p}.barding.type" value="${esc(f.barding.type || '')}"></label>
            <label class="fg-field"><span>Defesa</span><input type="number" step="1" data-a="campo" data-tipo="int" data-path="${p}.barding.defense" value="${Number(f.barding.defense) || 0}"></label>
            <label class="fg-field"><span>Material</span><input data-a="campo" data-path="${p}.barding.material" value="${esc(f.barding.material || '')}"></label>
            <label class="fg-field fg-wide"><span>Efeitos</span><textarea data-a="campo" data-vivo data-path="${p}.barding.effects" rows="2">${esc(f.barding.effects || '')}</textarea></label>
            <label class="fg-field fg-wide"><span>Equipamento</span><textarea data-a="campo" data-vivo data-path="${p}.barding.equipment" rows="2">${esc(f.barding.equipment || '')}</textarea></label>` : ''}
          </div>` : ''}
          ${f.type === 'lendario' ? `<div class="fg-sec-head"><b class="fg-label">Lendário</b></div><div class="fg-form">
            <label class="fg-field"><span>Vida máxima (Staff)</span><input type="number" min="1" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.legendaryHpMax" value="${Number(f.legendaryHpMax) || 1}"></label>
            <label class="fg-field"><span>Ocasião</span><input data-a="campo" data-path="${p}.legendaryOccasion" value="${esc(f.legendaryOccasion || '')}"></label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.legendaryUsed"${f.legendaryUsed ? ' checked' : ''}> Já usado nesta ocasião</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.staffApproved"${f.staffApproved ? ' checked' : ''}> Aprovado pela Staff</label>
          </div>` : ''}
          <div class="fg-sec-head"><b class="fg-label">Habilidades</b><div class="fg-actions"><button class="fg-btn fg-btn--sm" type="button" data-a="fam-hab-nova" data-id="${esc(f.id)}" data-t="passiva">${ICO.plus}Passiva</button><button class="fg-btn fg-btn--sm" type="button" data-a="fam-hab-nova" data-id="${esc(f.id)}" data-t="ativa">${ICO.plus}Ativa</button></div></div>
          ${hab.length ? hab.map(h => `<div class="fg-box" style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:8px"><input class="fg-in" data-a="campo" data-path="${p}.abilities[id=${h.id}].name" value="${esc(h.name || '')}" aria-label="Nome da habilidade"><select class="fg-in" data-a="campo" data-render data-path="${p}.abilities[id=${h.id}].type" aria-label="Tipo" style="width:120px"><option value="passiva"${h.type === 'passiva' ? ' selected' : ''}>Passiva</option><option value="ativa"${h.type === 'ativa' ? ' selected' : ''}>Ativa</option></select><button class="fg-btn fg-btn--sm fg-btn--icon fg-btn--ghost" type="button" data-a="fam-hab-tirar" data-id="${esc(f.id)}" data-h="${esc(h.id)}" aria-label="Remover habilidade">${ICO.close}</button></div>
            <textarea class="fg-in" data-a="campo" data-vivo data-path="${p}.abilities[id=${h.id}].${'text' in h || !('description' in h) ? 'text' : 'description'}" rows="2" aria-label="Efeito">${esc(h.text ?? h.description ?? '')}</textarea>
          </div>`).join('') : '<p class="fg-empty-line">Nenhuma habilidade.</p>'}
          <div class="fg-sec-head"><b class="fg-label">Imagens (até 3)</b></div>
          <div class="fg-imgpick" style="flex-wrap:wrap">${(f.images || []).map((u, i) => `<span style="position:relative"><img src="${FG.src(u)}" alt=""><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fam-img-tirar" data-id="${esc(f.id)}" data-i="${i}" aria-label="Tirar imagem" style="position:absolute;right:-8px;top:-8px;min-height:24px;width:24px">${ICO.close}</button></span>`).join('')}${(f.images || []).length < 3 ? `<label class="fg-btn fg-btn--sm" style="cursor:pointer">Adicionar imagem<input type="file" accept="image/*" data-a="fam-img" data-id="${esc(f.id)}" hidden></label>` : ''}</div>
          <label class="fg-field"><span>Notas</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="3">${esc(f.notes || '')}</textarea></label>
        </div>
        <div class="fg-drawer-foot"><button class="fg-btn fg-btn--danger" type="button" data-a="fam-remover" data-id="${esc(f.id)}">Remover companheiro</button></div>`;
    };

    const fam = id => (S.M.state.familiars?.entries || []).find(x => x.id === id);
    const pronto = () => { S.M.syncCurrentCaps(); FG.salvar(); FG.render(); };
    acoes['fam-filtro'] = el => { S.filtroFam = el.dataset.k; FG.render(); };
    acoes['fam-abrir'] = el => FG.abrirGaveta('familiar', { id: el.dataset.id });
    acoes['fam-novo'] = el => {
      const s = S.M.state;
      s.familiars = s.familiars || { entries: [], mountFameClaimed: false, activeSection: 'all', notes: '' };
      const f = S.M.defaultFamiliar(el.dataset.t);
      s.familiars.entries.push(f);
      pronto(); FG.abrirGaveta('familiar', { id: f.id });
    };
    acoes['fam-tipo'] = el => { const f = fam(el.dataset.id); if (!f) return; f.type = el.value; if (f.type === 'narrativo') f.active = false; f.skills = (f.skills || []).slice(0, S.M.familiarSkillLimit(f)); pronto(); };
    acoes['fam-hp'] = el => { const f = fam(el.dataset.id); if (!f) return; const max = S.M.familiarHpMax(f); f.currentHp = FG.clamp(hpAtual(S.M, f) + Number(el.dataset.d), 0, max); pronto(); };
    acoes['fam-ativo'] = el => {
      const f = fam(el.dataset.id); if (!f) return;
      if (el.checked && !S.M.canActivateFamiliar(f)) { window.PRINCIPIA.api.toast('Limite de familiares comuns em missão: até 2, e com dois, um precisa ser Montaria ou superior.'); el.checked = false; return; }
      f.active = el.checked; pronto();
    };
    acoes['fam-attr'] = el => {
      const M = S.M, f = fam(el.dataset.id); if (!f) return;
      const k = el.dataset.k, d = Number(el.dataset.d);
      f.attributes = f.attributes || { for: 0, des: 0, con: 0, int: 0, fe: 0, car: 0 };
      if (d > 0 && M.familiarAttrSpent(f) >= pontos(M, f)) { window.PRINCIPIA.api.toast('Os pontos de atributo deste tipo acabaram.'); return; }
      f.attributes[k] = Math.max(0, (Number(f.attributes[k]) || 0) + d);
      pronto();
    };
    acoes['fam-pericia'] = el => { const f = fam(el.dataset.id); if (!f) return; f.skills = f.skills || []; f.skills[Number(el.dataset.i)] = el.value; pronto(); };
    acoes['fam-hab-nova'] = el => { const f = fam(el.dataset.id); if (!f) return; (f.abilities ||= []).push({ id: FG.uid('fab'), name: el.dataset.t === 'ativa' ? 'Nova ativa' : 'Nova passiva', type: el.dataset.t, text: '' }); pronto(); };
    acoes['fam-hab-tirar'] = el => { const f = fam(el.dataset.id); if (!f) return; f.abilities = (f.abilities || []).filter(h => h.id !== el.dataset.h); pronto(); };
    acoes['fam-img'] = async el => {
      const f = fam(el.dataset.id), arq = el.files?.[0];
      if (!f || !arq) return;
      try { (f.images ||= []).push(await FG.imagem(arq, 900, 900)); f.images = f.images.slice(0, 3); pronto(); }
      catch (e) { window.PRINCIPIA.api.toast(e.message || String(e)); }
    };
    acoes['fam-img-tirar'] = el => { const f = fam(el.dataset.id); if (!f) return; f.images.splice(Number(el.dataset.i), 1); pronto(); };
    acoes['fam-remover'] = async el => {
      const f = fam(el.dataset.id);
      const ok = await FG.confirmar('Remover este companheiro?', `${f?.name || 'Ele'} sai da ficha. Isso não tem como desfazer (exceto pelas versões salvas).`, 'Remover', true);
      if (!ok) return;
      S.M.state.familiars.entries = S.M.state.familiars.entries.filter(x => x.id !== el.dataset.id);
      FG.fecharGaveta(); pronto();
    };
    acoes['fam-fama-montaria'] = () => {
      const s = S.M.state;
      if (s.familiars.mountFameClaimed) return;
      s.roma.fameEntries = s.roma.fameEntries || [];
      s.roma.fameEntries.push({ id: FG.uid('fame'), source: 'Posse de Montaria', discordLink: '', amount: 10, notes: 'Bônus de Fama por possuir uma Montaria.' });
      s.roma.fame = S.M.fameTotal();
      s.familiars.mountFameClaimed = true;
      pronto();
      window.PRINCIPIA.api.toast('+10 de fama da montaria registrada em Roma.');
    };
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
