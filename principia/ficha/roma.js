/* GUIA DA DUODÉCIMA · Ficha · aba Roma (fama, afinidades, serviço, títulos, permissões e feitos). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal } = FG;
    const acoes = FG.acoes;
    const S = FG.S;
    const MARCOS = [[0, 'Sem título'], [25, 'Conhecido'], [50, 'Influente'], [80, 'Famoso'], [100, 'Rebento (com a Staff)']];
    const LISTAS = { title: ['titles', 'Títulos e honras'], perm: ['permissions', 'Permissões e acessos'], deed: ['deeds', 'Feitos e marcos'] };

    FG.abas.roma = {
      render(c) {
        const { M, s, D } = c;
        const r = s.roma || {};
        const fama = M.fameTotal(), banda = M.fameBand();
        const prox = MARCOS.find(([n]) => fama < n);
        const ant = [...MARCOS].reverse().find(([n]) => fama >= n)?.[0] ?? Math.min(fama, -25);
        const pct = prox ? Math.max(3, Math.round((fama - ant) / (prox[0] - ant) * 100)) : 100;
        const p = 'roma';
        const sel = (path, lista, atual, calc) => `<select data-a="campo"${calc ? ' data-calc' : ' data-render'} data-path="${path}">${lista.map(x => `<option value="${esc(x.id)}"${String(atual || '') === String(x.id) ? ' selected' : ''}>${esc(x.name)}${x.salary ? ` · ${x.salary} denários` : ''}</option>`).join('')}</select>`;
        const online = window.PRINCIPIA?.online?.ativo;
        return `<div class="fg-cols2">
          <div>
            <div class="fg-sec">
              <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Reputação</span><h2 class="fg-h fg-h--big">Fama</h2></div>
              <div class="fg-fame"><b>${sinal(fama)}</b><div style="flex:1;display:flex;flex-direction:column;gap:8px"><span class="fg-chip fg-chip--gold" style="align-self:flex-start">${esc(banda.name || 'Sem faixa')}</span><span class="fg-muted" style="font-size:13px">${esc(banda.summary || '')}</span><div class="fg-bar"><i style="width:${pct}%"></i></div><small class="fg-label">${prox ? `faltam ${prox[0] - fama} para ${prox[1]}` : 'Topo da escala'}</small></div></div>
              ${online ? `<p class="fg-note">A Tabula Famae usa a fama lançada na sua conta (Minha Conta), com o link do Discord. Este histórico é o da ficha. <button class="fg-btn fg-btn--sm" type="button" data-a="abrir-app" data-app="famae" style="margin-left:6px">Abrir a Tabula</button></p>` : ''}
              <div class="fg-sec-head"><b class="fg-label">Histórico de fama</b><button class="fg-btn fg-btn--sm" type="button" data-a="roma-nova" data-t="fama">${ICO.plus}Registro</button></div>
              <div class="fg-rows">${(r.fameEntries || []).map(x => linhaFama(x)).join('') || '<p class="fg-empty-line">Nenhum ganho ou perda registrado.</p>'}</div>
            </div>
            <div class="fg-sec">
              <div class="fg-sec-head"><h3 class="fg-h">Afinidades</h3><button class="fg-btn fg-btn--sm" type="button" data-a="roma-nova" data-t="afinidade">${ICO.plus}Registro</button></div>
              <p class="fg-muted" style="font-size:12.5px">Relação com deuses e figuras importantes. Cada registro soma no total da figura (de −100 a +100).</p>
              ${M.affinityTotals().length ? `<div class="fg-rows">${M.affinityTotals().map(t => `<div class="fg-row"><div class="fg-row-main"><b>${esc(t.target)}</b><small>Faixa ${esc(M.affinityMark(t.value))}</small></div><span class="fg-row-num">${sinal(t.value)}</span></div>`).join('')}</div>` : ''}
              <div class="fg-rows">${(r.affinityEntries || []).map(x => linhaAfinidade(x)).join('') || '<p class="fg-empty-line">Nenhum registro de afinidade.</p>'}</div>
            </div>
          </div>
          <div>
            <div class="fg-sec">
              <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Serviço</span><h2 class="fg-h fg-h--big">Legião e cidadania</h2></div>
              <div class="fg-form">
                <label class="fg-field"><span>Patente na Legião</span>${sel(p + '.legionRank', D.roma.legionRanks || [], r.legionRank)}</label>
                <label class="fg-field"><span>Patente na Religio</span>${sel(p + '.religioRank', D.roma.religioRanks || [], r.religioRank)}</label>
                <label class="fg-field fg-wide"><span>Outro cargo</span><input data-a="campo" data-render data-path="${p}.customRank" value="${esc(r.customRank || '')}" placeholder="Opcional"></label>
                <label class="fg-field"><span>Coorte</span><input data-a="campo" data-render data-path="${p}.cohort" value="${esc(r.cohort || '')}" placeholder="Ex.: V Coorte"></label>
                <label class="fg-field"><span>Situação de cidadania</span><input data-a="campo" data-path="${p}.citizenship" value="${esc(r.citizenship || '')}" placeholder="Cidadão, estrangeiro…"></label>
                <label class="fg-field"><span>Anos de serviço</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-path="${p}.legionYears" value="${Number(r.legionYears) || 0}"></label>
                <label class="fg-field"><span>Marcas de serviço</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-path="${p}.serviceMarks" value="${Number(r.serviceMarks) || 0}"></label>
                <label class="fg-check fg-wide"><input type="checkbox" data-a="campo" data-path="${p}.retired"${r.retired ? ' checked' : ''}> Aposentado / veterano</label>
                <label class="fg-field"><span>Trabalho / função</span><input data-a="campo" data-path="${p}.job" value="${esc(r.job || '')}" placeholder="Opcional"></label>
                <label class="fg-field"><span>Salário</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-path="${p}.jobSalary" value="${Number(r.jobSalary) || 0}"></label>
                <label class="fg-field fg-wide"><span>Período do salário</span><input data-a="campo" data-path="${p}.jobPeriod" value="${esc(r.jobPeriod || '')}" placeholder="Semana, ação…"></label>
              </div>
            </div>
            ${Object.entries(LISTAS).map(([k, [campo, titulo]]) => `<div class="fg-sec">
              <div class="fg-sec-head"><h3 class="fg-h">${titulo}</h3><button class="fg-btn fg-btn--sm" type="button" data-a="roma-nova" data-t="${k}">${ICO.plus}Adicionar</button></div>
              <div class="fg-rows">${(r[campo] || []).map(x => `<div class="fg-box" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end">
                <label class="fg-field"><span>Nome</span><input data-a="campo" data-path="${p}.${campo}[id=${x.id}].name" value="${esc(x.name || '')}"></label>
                <label class="fg-field"><span>Fonte / concessão</span><input data-a="campo" data-path="${p}.${campo}[id=${x.id}].source" value="${esc(x.source || '')}"></label>
                <button class="fg-btn fg-btn--sm fg-btn--icon fg-btn--ghost" type="button" data-a="roma-tirar" data-t="${k}" data-id="${esc(x.id)}" aria-label="Remover">${ICO.close}</button>
                <label class="fg-field" style="grid-column:1/-1"><span>Notas</span><input data-a="campo" data-path="${p}.${campo}[id=${x.id}].notes" value="${esc(x.notes || '')}"></label>
              </div>`).join('') || '<p class="fg-empty-line">Nada registrado.</p>'}</div>
            </div>`).join('')}
            <div class="fg-sec">
              <label class="fg-field"><span>Notas de Roma</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="4">${esc(r.notes || '')}</textarea></label>
            </div>
          </div>
        </div>`;
      }
    };
    const linhaFama = x => `<div class="fg-box" style="display:grid;grid-template-columns:90px minmax(0,1fr) auto;gap:8px;align-items:end">
      <label class="fg-field"><span>Fama</span><input type="number" step="1" data-a="campo" data-tipo="int" data-render data-path="roma.fameEntries[id=${x.id}].amount" value="${Number(x.amount) || 0}"></label>
      <label class="fg-field"><span>Origem</span><input data-a="campo" data-path="roma.fameEntries[id=${x.id}].source" value="${esc(x.source || '')}" placeholder="Missão, bênção, evento…"></label>
      <button class="fg-btn fg-btn--sm fg-btn--icon fg-btn--ghost" type="button" data-a="roma-tirar" data-t="fama" data-id="${esc(x.id)}" aria-label="Remover registro">${ICO.close}</button>
      <label class="fg-field" style="grid-column:1/-1"><span>Link da mensagem no Discord</span><input type="url" data-a="campo" data-path="roma.fameEntries[id=${x.id}].discordLink" value="${esc(x.discordLink || '')}" placeholder="https://discord.com/channels/…"></label>
      ${x.notes ? `<small class="fg-muted" style="grid-column:1/-1">${esc(x.notes)}</small>` : ''}
    </div>`;
    const linhaAfinidade = x => `<div class="fg-box" style="display:grid;grid-template-columns:minmax(0,1fr) 90px auto;gap:8px;align-items:end">
      <label class="fg-field"><span>Figura</span><input data-a="campo" data-render data-path="roma.affinityEntries[id=${x.id}].target" value="${esc(x.target || '')}" placeholder="Ex.: Iuppiter, Pretor Cassius"></label>
      <label class="fg-field"><span>Pontos</span><input type="number" step="1" data-a="campo" data-tipo="int" data-render data-path="roma.affinityEntries[id=${x.id}].amount" value="${Number(x.amount) || 0}"></label>
      <button class="fg-btn fg-btn--sm fg-btn--icon fg-btn--ghost" type="button" data-a="roma-tirar" data-t="afinidade" data-id="${esc(x.id)}" aria-label="Remover registro">${ICO.close}</button>
      <label class="fg-field"><span>Origem</span><input data-a="campo" data-path="roma.affinityEntries[id=${x.id}].source" value="${esc(x.source || '')}"></label>
      <label class="fg-field" style="grid-column:2/-1"><span>Link</span><input type="url" data-a="campo" data-path="roma.affinityEntries[id=${x.id}].discordLink" value="${esc(x.discordLink || '')}"></label>
    </div>`;

    acoes['roma-nova'] = el => {
      const r = S.M.state.roma;
      const t = el.dataset.t;
      if (t === 'fama') (r.fameEntries ||= []).unshift({ id: FG.uid('fame'), source: '', discordLink: '', amount: 0, notes: '' });
      else if (t === 'afinidade') (r.affinityEntries ||= []).unshift({ id: FG.uid('affentry'), target: '', source: '', discordLink: '', amount: 0, notes: '' });
      else (r[LISTAS[t][0]] ||= []).push({ id: FG.uid(t), name: '', source: '', notes: '' });
      FG.salvar(); FG.render();
    };
    acoes['roma-tirar'] = el => {
      const r = S.M.state.roma, t = el.dataset.t, id = el.dataset.id;
      if (t === 'fama') r.fameEntries = (r.fameEntries || []).filter(x => x.id !== id);
      else if (t === 'afinidade') r.affinityEntries = (r.affinityEntries || []).filter(x => x.id !== id);
      else r[LISTAS[t][0]] = (r[LISTAS[t][0]] || []).filter(x => x.id !== id);
      r.fame = S.M.fameTotal();
      FG.salvar(); FG.render();
    };
    acoes['abrir-app'] = el => window.PRINCIPIA?.api?.openUtil?.(el.dataset.app === 'famae' ? 'famae' : el.dataset.app, null);
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
