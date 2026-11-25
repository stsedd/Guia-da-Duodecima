/* GUIA DA DUODÉCIMA · Ficha · criação de personagem (mesmas regras e funções da Ficha Oficial). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal } = FG;
    const acoes = FG.acoes;
    const S = FG.S;
    const PASSOS = ['Origem', 'Divindade', 'Atributos', 'Perícias', 'Revisão'];
    const GRUPOS = ['Triunviro', 'Dii Consentis', 'Dii Inferi', 'Alati', 'Ventis', 'Numina'];
    const NOME_GRUPO = { Triunviro: 'Triúnviros' };

    function passoOk(c, i) {
      const { M, s } = c;
      if (i === 0) return !!String(s.name || '').trim();
      if (i === 1) {
        if (M.isMortal()) return true;
        const tipo = s.lineage?.type || 'normal', sub = M.secondaryGod();
        return !!M.godById(s.godId) && (tipo === 'normal' || (!M.isTriumvir(s.godId) && !!sub && sub.id !== s.godId));
      }
      if (i === 2) return Object.values(s.baseAttributes || {}).reduce((t, v) => t + (Number(v) || 0), 0) === M.creationPointLimit();
      if (i === 3) {
        if (s.initialSkills.length !== M.initialSkillLimit()) return false;
        if (M.isMortal()) return !!s.originSkillChoice;
        return !M.god()?.skillChoice?.length || !!s.divineSkillChoice;
      }
      return M.canFinishCreation();
    }

    function origem(c) {
      const { s, M } = c;
      return `<div class="fg-form">
        <label class="fg-field"><span>Nome do personagem</span><input data-a="campo" data-render data-path="name" value="${esc(s.name || '')}" maxlength="80" placeholder="Como Roma vai chamar você"></label>
        <label class="fg-field"><span>Jogador(a)</span><input data-a="campo" data-path="player" value="${esc(s.player || '')}" maxlength="60"></label>
      </div>
      <div class="fg-sec-head"><b class="fg-label">Origem</b></div>
      <div class="fg-gods" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">
        <button class="fg-god" type="button" data-a="cria-origem" data-v="divine" aria-pressed="${!M.isMortal()}"><b>Prole Divina</b><small>Filho, filha ou legado de um deus romano</small></button>
        <button class="fg-god" type="button" data-a="cria-origem" data-v="mortal" aria-pressed="${M.isMortal()}"><b>Mortal da Névoa</b><small>Sem kit divino; pode despertar para a Magia</small></button>
      </div>
      ${M.isMortal() ? '' : `<label class="fg-check" style="margin-top:8px"><input type="checkbox" data-a="cria-sucessor"${s.roma?.successorOfRebento ? ' checked' : ''}> Sucessor de Rebento (${Number(S.D.system?.rebentos?.successor?.startingAttributePoints ?? 9)} pontos iniciais e +${Number(S.D.system?.rebentos?.successor?.energyBaseBonus ?? 25)} de Energia máxima permanente)</label>`}`;
    }

    function divindade(c) {
      const { s, M, D } = c;
      if (M.isMortal()) return `<p class="fg-note">Mortais da Névoa não escolhem divindade. A perícia de origem fica no passo de perícias.</p>`;
      const g = M.god();
      const tipo = s.lineage?.type || 'normal';
      const sub = M.secondaryGod();
      const grade = GRUPOS.map(gr => {
        const ds = D.gods.filter(x => x.group === gr);
        if (!ds.length) return '';
        return `<div class="fg-sec-head" style="margin-top:8px"><b class="fg-label" style="color:var(--fg-accent)">${esc(NOME_GRUPO[gr] || gr)}</b></div><div class="fg-gods">${ds.map(x => `<button class="fg-god" type="button" data-a="cria-deus" data-id="${esc(x.id)}" aria-pressed="${s.godId === x.id}"><b>${esc(x.name)}</b><small>${esc(Object.entries(x.bonuses || {}).filter(([, v]) => v).map(([k, v]) => `${sinal(v)} ${k.toUpperCase()}`).join(' · '))}</small></button>`).join('')}</div>`;
      }).join('');
      const tri = M.isTriumvir(s.godId);
      let linhagem = '';
      if (!tri) {
        const elegiveis = M.eligibleLegacyGods();
        linhagem = `<div class="fg-sec-head" style="margin-top:14px"><b class="fg-label">Linhagem</b></div>
          <div class="fg-pills">${[['normal', 'Prole de um deus'], ['direct', 'Legado direto (deus + legado)'], ['compound', 'Legado composto (legado + legado)']].map(([k, n]) => `<button class="fg-pill" type="button" data-a="cria-linhagem" data-v="${k}" aria-pressed="${tipo === k}">${n}</button>`).join('')}</div>
          ${tipo !== 'normal' ? `<label class="fg-field" style="max-width:360px;margin-top:8px"><span>${tipo === 'direct' ? 'Deus do legado' : 'Segunda origem'}</span><select data-a="cria-legado">${elegiveis.map(x => `<option value="${esc(x.id)}"${sub?.id === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>` : ''}
          ${tipo === 'direct' && sub ? legadoDireto(c, g, sub) : ''}
          ${tipo === 'compound' && sub ? legadoComposto(c, g, sub) : ''}`;
      } else linhagem = `<p class="fg-note" style="margin-top:12px">${esc(g.name)} é um Triúnviro. Triúnviros usam o kit próprio e não entram na mistura por Legado.</p>`;
      return `<div class="fg-box" style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><span class="fg-kicker">${esc(NOME_GRUPO[g?.group] || g?.group || '')}</span><div class="fg-anton" style="font-size:34px;text-transform:uppercase">${esc(g?.name || '')}</div><small class="fg-muted">Conjuração: ${esc((g?.casting || '').toUpperCase())} · HP ${g?.hpBase} + CON · por 10 níveis: +${g?.hpPerDecade} + CON</small></div><div><span class="fg-label">Bônus divinos</span><div style="font:700 15px Inter;margin-top:6px">${esc(Object.entries(g?.bonuses || {}).filter(([, v]) => v).map(([k, v]) => `${sinal(v)} ${k.toUpperCase()}`).join(' · ') || '—')}</div></div></div>
        ${grade}${linhagem}`;
    }

    function legadoDireto(c, g, sub) {
      const { M, s } = c;
      const base = M.baseAbilitySet(g.id), leg = M.baseAbilitySet(sub.id);
      if (!base || !leg) return '';
      const pr = s.lineage.compoundPassiveReplacements || [], ar = s.lineage.compoundActiveReplacements || [];
      const linhaP = i => { const r = pr[i] || {}; return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px"><select class="fg-in" data-a="cria-troca" data-t="p" data-i="${i}" data-c="primaryIndex" aria-label="Passiva trocada ${i + 1}"><option value="">Trocar a passiva…</option>${base.passives.map((a, j) => `<option value="${j}"${String(r.primaryIndex) === String(j) && r.secondaryId ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}</select><select class="fg-in" data-a="cria-troca" data-t="p" data-i="${i}" data-c="secondaryId" aria-label="Passiva do legado ${i + 1}"><option value="">…pela passiva do legado</option>${leg.passives.map(a => `<option value="${esc(a.id)}"${r.secondaryId === a.id ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>`; };
      const linhaA = i => { const r = ar[i] || {}; const alvo = base.actives[Number(r.primaryIndex)]; return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px"><select class="fg-in" data-a="cria-troca" data-t="a" data-i="${i}" data-c="primaryIndex" aria-label="Ativa trocada ${i + 1}"><option value="">Trocar a ativa…</option>${base.actives.slice(0, 5).map((a, j) => `<option value="${j}"${String(r.primaryIndex) === String(j) && r.secondaryId ? ' selected' : ''}>${esc(a.name)} · nv ${a.level}</option>`).join('')}</select><select class="fg-in" data-a="cria-troca" data-t="a" data-i="${i}" data-c="secondaryId" aria-label="Ativa do legado ${i + 1}"><option value="">…pela ativa do legado</option>${leg.actives.filter(a => !alvo || Number(a.level) <= Number(alvo.level)).map(a => `<option value="${esc(a.id)}"${r.secondaryId === a.id ? ' selected' : ''}>${esc(a.name)} · nv ${a.level}</option>`).join('')}</select></div>`; };
      return `<div class="fg-box" style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
        <b class="fg-label">Legado direto: HP, atributos e perícia do deus principal; até 3 passivas e 2 ativas (entre as cinco primeiras) podem vir de ${esc(sub.name)}.</b>
        ${[0, 1, 2].map(linhaP).join('')}${[0, 1].map(linhaA).join('')}
        <small class="fg-muted">A ativa herdada ocupa a vaga da ativa trocada (nível, custo e posição da vaga principal) e precisa ter nível igual ou menor.</small>
      </div>`;
    }

    function legadoComposto(c, g, sub) {
      const { M, s } = c;
      const a = M.baseAbilitySet(g.id), b = M.baseAbilitySet(sub.id);
      if (!a || !b) return '';
      const pa = new Set(s.lineage.directPrimaryPassives || []), pb = new Set(s.lineage.directSecondaryPassives || []);
      const op = window.FichaDados.opcoesLegadoComposto(S.dados, s);
      const mesma = s.lineage.compoundChoiceOrigins === `${s.godId}|${s.lineage.secondaryGodId}`;
      const pick = k => (mesma ? s.lineage[k] || '' : '');
      const lista = (abs, set, lado, lim) => `<div class="fg-skillpick">${abs.passives.map(x => { const on = set.has(x.id); const off = !on && set.size >= lim; return `<label class="${off ? 'is-off' : ''}"><input type="checkbox" data-a="cria-passiva" data-lado="${lado}" data-id="${esc(x.id)}"${on ? ' checked' : ''}${off ? ' disabled' : ''}>${esc(x.name)}</label>`; }).join('')}</div>`;
      return `<div class="fg-box" style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
        <b class="fg-label">Legado composto: 4 passivas de ${esc(g.name)} e 3 de ${esc(sub.name)}; as cinco primeiras ativas de cada um, sem as de nível 6+; menor HP inicial entre os dois.</b>
        <div class="fg-sec-head"><b class="fg-label">Passivas de ${esc(g.name)}</b><span class="fg-label">${pa.size}/4</span></div>${lista(a, pa, 'a', 4)}
        <div class="fg-sec-head"><b class="fg-label">Passivas de ${esc(sub.name)}</b><span class="fg-label">${pb.size}/3</span></div>${lista(b, pb, 'b', 3)}
        <div class="fg-form">
          <label class="fg-field"><span>Bônus +2</span><select data-a="cria-composto" data-k="compoundAttributePlus2"><option value="">Escolha…</option>${op.mais2.map(o => `<option value="${esc(o.value)}"${pick('compoundAttributePlus2') === o.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
          <label class="fg-field"><span>Bônus +1</span><select data-a="cria-composto" data-k="compoundAttributePlus1"><option value="">Escolha…</option>${op.mais1.map(o => `<option value="${esc(o.value)}"${pick('compoundAttributePlus1') === o.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
          <label class="fg-field fg-wide"><span>Perícia de origem</span><select data-a="cria-composto" data-k="compoundSkillChoice"><option value="">Escolha…</option>${op.pericias.map(o => `<option value="${esc(o.value)}"${pick('compoundSkillChoice') === o.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
        </div>
      </div>`;
    }

    function atributos(c) {
      const { M, s } = c;
      const lim = M.creationPointLimit();
      const gastos = Object.values(s.baseAttributes || {}).reduce((t, v) => t + (Number(v) || 0), 0);
      return `<div class="fg-sec-head"><b class="fg-label">${lim} pontos de atributo</b><span class="fg-chip ${gastos === lim ? '' : 'fg-chip--red'}" style="${gastos === lim ? 'color:var(--fg-ok);background:transparent;border-color:var(--fg-ok)' : ''}">${lim - gastos} restante(s)</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">${FG.attrsLista.map(([k, ab, n]) => `<div class="fg-attr" style="align-items:center;text-align:center"><span>${ab} · ${esc(n)}</span><b>${M.structuralAttr(k)}</b><small>base ${s.baseAttributes?.[k] || 0} · divino ${sinal(M.god()?.bonuses?.[k] || 0)}</small><div class="fg-stepper" style="margin-top:6px"><button type="button" data-a="cria-attr" data-k="${k}" data-d="-1" aria-label="Menos ${ab}">−</button><b>${s.baseAttributes?.[k] || 0}</b><button type="button" data-a="cria-attr" data-k="${k}" data-d="1" aria-label="Mais ${ab}">+</button></div></div>`).join('')}</div>
        <p class="fg-muted" style="font-size:12.5px">O limite normal é 5, somando criação, progressão, talentos comuns e bônus divinos. Só efeitos que digam explicitamente ultrapassar o limite levam acima de 5.</p>`;
    }

    function pericias(c) {
      const { M, s, D } = c;
      const lim = M.initialSkillLimit();
      const g = M.god();
      const escolhaDivina = !M.isMortal() && g?.skillChoice?.length ? `<label class="fg-field" style="max-width:360px"><span>Escolha divina (não gasta escolhas por Inteligência)</span><select data-a="campo" data-render data-path="divineSkillChoice"><option value="">Selecione…</option>${g.skillChoice.map(k => `<option${s.divineSkillChoice === k ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label>` : '';
      const origemMortal = M.isMortal() ? `<label class="fg-field" style="max-width:360px"><span>Perícia de origem</span><select data-a="campo" data-render data-path="originSkillChoice"><option value="">Selecione…</option>${D.skills.map(k => `<option${s.originSkillChoice === k.name ? ' selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label>` : '';
      return `${escolhaDivina}${origemMortal}
        <div class="fg-sec-head" style="margin-top:8px"><b class="fg-label">Escolhas por Inteligência (2 + INT inicial)</b><span class="fg-label">${s.initialSkills.length}/${lim}</span></div>
        <div class="fg-skillpick">${D.skills.map(k => { const on = s.initialSkills.includes(k.name); const pode = M.canUseInitialSkill(k.name); const off = (!on && s.initialSkills.length >= lim) || !pode; return `<label class="${off ? 'is-off' : ''}" title="${pode ? '' : 'Já vem de outra fonte'}"><input type="checkbox" data-a="cria-pericia" data-nome="${esc(k.name)}"${on ? ' checked' : ''}${off ? ' disabled' : ''}>${esc(k.name)} <small class="fg-muted">· ${esc((k.attr || '').toUpperCase())}</small></label>`; }).join('')}</div>`;
    }

    function revisao(c) {
      const { M, s } = c;
      const ok = M.canFinishCreation();
      const issues = M.validationIssues().filter(x => x.level === 'error' || !ok);
      return `<div class="fg-box" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
          <div><span class="fg-label">Nome</span><div class="fg-anton" style="font-size:26px;text-transform:uppercase">${esc(s.name || '—')}</div></div>
          <div><span class="fg-label">Origem</span><div style="font-weight:700">${esc(M.isMortal() ? 'Mortal da Névoa' : M.god()?.name || '')}</div></div>
          <div><span class="fg-label">Vida</span><div class="fg-anton" style="font-size:26px">${M.hpMax()}</div></div>
          <div><span class="fg-label">Energia</span><div class="fg-anton" style="font-size:26px">${M.energyMax()}</div></div>
          <div><span class="fg-label">Defesa</span><div class="fg-anton" style="font-size:26px">${sinal(M.defenseBonus())}</div></div>
        </div>
        <div class="fg-attrs" style="grid-template-columns:repeat(6,minmax(0,1fr))">${FG.attrsLista.map(([k, ab]) => `<div class="fg-attr"><span>${ab}</span><b style="font-size:34px">${M.effectiveAttr(k)}</b></div>`).join('')}</div>
        ${issues.map(x => `<p class="fg-note${x.level === 'error' ? ' fg-note--warn' : ''}">${esc(x.text)}</p>`).join('')}
        ${ok ? '<p class="fg-note">Tudo pronto. Ao concluir, a ficha é salva neste navegador e abre na Visão geral.</p>' : '<p class="fg-note fg-note--warn">Ainda falta algo nos passos marcados sem ✓.</p>'}`;
    }

    FG.abas.criacao = {
      render(c) {
        const cr = S.criando || (S.criando = { passo: 0 });
        const conteudos = [origem, divindade, atributos, pericias, revisao];
        const ultimo = cr.passo === PASSOS.length - 1;
        return `<div class="fg-create">
          <div class="fg-sec-head"><div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Nova ficha</span><h2 class="fg-h fg-h--big">Criação</h2></div><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="cria-cancelar">Cancelar</button></div>
          <nav class="fg-steps" aria-label="Passos da criação">${PASSOS.map((n, i) => `<button class="fg-step${passoOk(c, i) ? ' is-done' : ''}" type="button" data-a="cria-passo" data-i="${i}"${cr.passo === i ? ' aria-current="step"' : ''}><b>${passoOk(c, i) && cr.passo !== i ? '✓' : i + 1}</b>${n}</button>`).join('')}</nav>
          <div class="fg-sec" style="animation:fg-rise .4s both">${conteudos[cr.passo](c)}</div>
          <div class="fg-actions" style="justify-content:space-between">
            <button class="fg-btn" type="button" data-a="cria-passo" data-i="${Math.max(0, cr.passo - 1)}"${cr.passo === 0 ? ' disabled' : ''}>Voltar</button>
            ${ultimo ? `<button class="fg-btn fg-btn--pri" type="button" data-a="cria-concluir"${c.M.canFinishCreation() && String(c.s.name || '').trim() ? '' : ' disabled'}>Concluir criação</button>` : `<button class="fg-btn fg-btn--pri" type="button" data-a="cria-passo" data-i="${cr.passo + 1}">Próximo</button>`}
          </div>
        </div>`;
      }
    };

    const M = () => S.M;
    const redesenhar = () => FG.renderAgora();
    acoes['cria-passo'] = el => { S.criando.passo = Number(el.dataset.i); redesenhar(); document.getElementById('osFichaBody').scrollTop = 0; };
    acoes['cria-origem'] = el => { const s = M().state; s.originType = el.dataset.v === 'mortal' ? 'mortal' : 'divine'; if (s.originType === 'mortal') s.lineage = M().defaultLineage(); M().syncCurrentCaps(); redesenhar(); };
    acoes['cria-sucessor'] = el => { const s = M().state; s.roma = s.roma || {}; s.roma.successorOfRebento = el.checked; const lim = M().creationPointLimit(); let tot = Object.values(s.baseAttributes).reduce((t, v) => t + (Number(v) || 0), 0); for (const k of ['car', 'fe', 'int', 'con', 'des', 'for']) { while (tot > lim && s.baseAttributes[k] > 0) { s.baseAttributes[k]--; tot--; } } M().syncCurrentCaps(); redesenhar(); };
    acoes['cria-deus'] = el => {
      const s = M().state;
      s.godId = el.dataset.id;
      s.divineSkillChoice = '';
      const tipo = s.lineage?.type || 'normal';
      if (M().isTriumvir(s.godId)) M().resetLineage('normal');
      else if (tipo !== 'normal') { M().resetLineage(tipo); }
      FG.recriarMotor(); M().syncCurrentCaps(); redesenhar();
    };
    acoes['cria-linhagem'] = el => { M().resetLineage(el.dataset.v); FG.recriarMotor(); M().syncCurrentCaps(); redesenhar(); };
    acoes['cria-legado'] = el => {
      const s = M().state, tipo = s.lineage.type;
      s.lineage = { ...M().defaultLineage(), type: tipo, secondaryGodId: el.value };
      if (tipo === 'direct') s.lineage.structureGodId = s.godId;
      if (tipo === 'compound') M().initializeDirectSelections();
      FG.recriarMotor(); M().syncCurrentCaps(); redesenhar();
    };
    acoes['cria-troca'] = el => {
      const s = M().state, t = el.dataset.t, i = Number(el.dataset.i);
      S.criando.trocas = S.criando.trocas || { p: [{}, {}, {}], a: [{}, {}] };
      const atual = (t === 'p' ? s.lineage.compoundPassiveReplacements : s.lineage.compoundActiveReplacements) || [];
      const rascunho = S.criando.trocas[t];
      atual.forEach((r, j) => { if (r && !rascunho[j]?.secondaryId && !('primaryIndex' in (rascunho[j] || {}))) rascunho[j] = { ...r }; });
      rascunho[i] = { ...(rascunho[i] || {}), [el.dataset.c]: el.dataset.c === 'primaryIndex' ? (el.value === '' ? '' : Number(el.value)) : el.value };
      const completos = rascunho.filter(r => r && r.primaryIndex !== '' && r.primaryIndex != null && r.secondaryId);
      const usados = new Set();
      const validos = completos.filter(r => { if (usados.has(r.primaryIndex)) return false; usados.add(r.primaryIndex); return true; });
      if (t === 'p') s.lineage.compoundPassiveReplacements = validos.slice(0, 3);
      else s.lineage.compoundActiveReplacements = validos.slice(0, 2);
      FG.recriarMotor(); M().syncCurrentCaps(); redesenhar();
    };
    acoes['cria-passiva'] = el => {
      const s = M().state, lado = el.dataset.lado, campo = lado === 'a' ? 'directPrimaryPassives' : 'directSecondaryPassives', lim = lado === 'a' ? 4 : 3;
      const set = new Set(s.lineage[campo] || []);
      if (el.checked) { if (set.size < lim) set.add(el.dataset.id); } else set.delete(el.dataset.id);
      s.lineage[campo] = [...set];
      FG.recriarMotor(); redesenhar();
    };
    acoes['cria-composto'] = el => {
      const s = M().state;
      s.lineage.compoundChoiceOrigins = `${s.godId}|${s.lineage.secondaryGodId}`;
      s.lineage[el.dataset.k] = el.value;
      FG.recriarMotor(); M().syncCurrentCaps(); redesenhar();
    };
    acoes['cria-attr'] = el => M().changeBase(el.dataset.k, Number(el.dataset.d));
    acoes['cria-pericia'] = el => M().toggleInitialSkill(el.dataset.nome, el.checked);
    acoes['cria-cancelar'] = async () => {
      const ok = await FG.confirmar('Cancelar a criação?', 'O que foi preenchido nesta criação se perde.', 'Cancelar criação', true);
      if (!ok) return;
      S.criando = null; S.M = null;
      const id = FG.S.lista[0]?.id;
      if (id) await FG.abrir(id, true);
      FG.renderAgora();
    };
    acoes['cria-concluir'] = async () => {
      const m = M();
      if (!m.canFinishCreation()) return;
      m.finishCreation();
      if (S.rec && !S.criando?.nova) {
        await FG.salvarAgora();
        S.criando = null; S.aba = 'geral';
        FG.renderAgora();
        window.PRINCIPIA.api.toast(`${S.rec.nome} pronto.`);
        return;
      }
      const rec = await FG.adicionarFicha(JSON.parse(JSON.stringify(m.state)), 'criacao');
      S.criando = null;
      S.aba = 'geral';
      FG.renderAgora();
      window.PRINCIPIA.api.toast(`${rec.nome} criado. A ficha fica salva neste navegador.`);
    };
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
