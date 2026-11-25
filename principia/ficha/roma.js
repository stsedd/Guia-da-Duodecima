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
    const TITULOS = { rebento: 'Rebento de Roma Aeterna', famoso: 'Famoso', influente: 'Influente', conhecido: 'Conhecido', nenhum: 'Sem título', odiado: 'Odiado' };

    /* ---------- Fama da conta (fonte única quando a ficha está guardada na conta) ---------- */
    let carregando = null;
    function famaDaConta() {
      const pid = S.rec?.nuvem?.pid;
      const cache = S.famaConta;
      if (cache && cache.pid === pid && Date.now() - cache.em < 60000) return cache;
      if (!carregando) carregando = carregarFamaConta(pid).finally(() => { carregando = null; if (S.aba === 'roma') FG.render(); });
      return cache && cache.pid === pid ? cache : null;
    }
    async function carregarFamaConta(pid) {
      const c = FG.nuvem?.cliente?.();
      if (!c || !pid) return;
      const msg = e => window.PRINCIPIA.online?.msgErro?.(e) || String(e?.message || e);
      try {
        const [a, b] = await Promise.all([
          c.sb.from('personagens_fama').select('id,nome,fama,titulo,elegivel_rebento').eq('id', pid).single(),
          c.sb.from('fama_registros').select('id,quantidade,motivo,link_discord,criado_em,criado_por,removido_em,motivo_remocao').eq('personagem_id', pid).order('criado_em', { ascending: false })
        ]);
        if (a.error) throw a.error;
        if (b.error) throw b.error;
        const regs = b.data || [];
        const soma = regs.filter(x => !x.removido_em).reduce((t, x) => t + (Number(x.quantidade) || 0), 0);
        S.famaConta = { pid, em: Date.now(), p: a.data, regs, base: (Number(a.data.fama) || 0) - soma };
        espelhar(S.famaConta);
      } catch (e) { S.famaConta = { pid, em: Date.now(), erro: 'Não consegui ler a fama da conta: ' + msg(e), p: { fama: 0 }, regs: [], base: 0 }; }
    }
    // A ficha guarda uma cópia da fama da conta (o motor e a capa leem roma.fameEntries); o que a ficha
    // tinha antes de ir para a conta fica em roma.famaFichaAntiga, só para consulta.
    function espelhar(conta) {
      const s = S.M?.state;
      if (!s?.roma || S.rec?.nuvem?.pid !== conta.pid) return;
      const novas = [
        ...(conta.base ? [{ id: 'conta-inicial', source: 'Fama inicial (automática)', discordLink: '', amount: conta.base, notes: 'conta' }] : []),
        ...conta.regs.filter(x => !x.removido_em).map(x => ({ id: 'conta-' + x.id, source: x.motivo, discordLink: String(x.link_discord || '').startsWith('staff:') ? '' : x.link_discord, amount: x.quantidade, notes: 'conta' }))
      ];
      const atuais = s.roma.fameEntries || [];
      const locais = atuais.filter(x => !String(x.id || '').startsWith('conta-'));
      if (locais.length && !s.roma.famaFichaAntiga) s.roma.famaFichaAntiga = locais;
      if (JSON.stringify(atuais) === JSON.stringify(novas)) return;
      s.roma.fameEntries = novas;
      s.roma.fame = conta.p.fama;
      FG.salvar();
    }
    acoes['fama-lancar'] = async el => {
      const c = FG.nuvem?.cliente?.(), pid = S.rec?.nuvem?.pid;
      const box = el.closest('[data-fama-form]');
      if (!c || !pid || !box) return;
      const v = n => box.querySelector(`[name="${n}"]`)?.value.trim() || '';
      const qtd = parseInt(v('quantidade'), 10);
      if (!qtd) { window.PRINCIPIA.api.toast('Use um número diferente de zero.'); return; }
      if (v('motivo').length < 3) { window.PRINCIPIA.api.toast('Escreva o motivo (pelo menos 3 letras).'); return; }
      el.disabled = true;
      const { error } = await c.sb.from('fama_registros').insert({ personagem_id: pid, quantidade: qtd, motivo: v('motivo'), link_discord: v('link') });
      el.disabled = false;
      if (error) { window.PRINCIPIA.api.toast(window.PRINCIPIA.online?.msgErro?.(error) || error.message); return; }
      window.PRINCIPIA.api.toast(`${sinal(qtd)} de fama lançado.`);
      S.famaConta = null;
      window.PRINCIPIA.online?.recarregarMeus?.();
      FG.render();
    };
    acoes['fama-remover'] = async el => {
      const c = FG.nuvem?.cliente?.();
      if (!c) return;
      if (!(await FG.confirmar('Remover este lançamento?', 'Ele continua no histórico como removido, e a Staff pode restaurar.', 'Remover', true))) return;
      const { error } = await c.sb.rpc('remover_fama', { registro: el.dataset.id, motivo: null });
      if (error) { window.PRINCIPIA.api.toast(window.PRINCIPIA.online?.msgErro?.(error) || error.message); return; }
      S.famaConta = null;
      window.PRINCIPIA.online?.recarregarMeus?.();
      FG.render();
    };

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
        // Fama numa fonte só: com a ficha guardada na conta, vale a fama da conta (a da Tabula Famae).
        const ligada = !!FG.nuvem?.ligada?.(S.rec);
        const conta = ligada ? famaDaConta() : null;
        const topo = `<div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Reputação</span><h2 class="fg-h fg-h--big">Fama</h2></div>`;
        const painel = (valor, nome, resumo) => {
          const prx = MARCOS.find(([n]) => valor < n);
          const an = [...MARCOS].reverse().find(([n]) => valor >= n)?.[0] ?? Math.min(valor, -25);
          const pc = prx ? Math.max(3, Math.round((valor - an) / (prx[0] - an) * 100)) : 100;
          return `<div class="fg-fame"><b>${sinal(valor)}</b><div style="flex:1;display:flex;flex-direction:column;gap:8px"><span class="fg-chip fg-chip--gold" style="align-self:flex-start">${esc(nome)}</span>${resumo ? `<span class="fg-muted" style="font-size:13px">${esc(resumo)}</span>` : ''}<div class="fg-bar"><i style="width:${pc}%"></i></div><small class="fg-label">${prx ? `faltam ${prx[0] - valor} para ${prx[1]}` : 'Topo da escala'}</small></div></div>`;
        };
        let blocoFama;
        if (ligada && !conta) blocoFama = `${topo}<p class="fg-empty-line">Carregando a fama da conta…</p>`;
        else if (conta?.erro) blocoFama = `${topo}<p class="fg-note fg-note--warn">${esc(conta.erro)}</p>`;
        else if (conta) {
          const uid = FG.nuvem.uid();
          const antigo = r.famaFichaAntiga || [];
          blocoFama = `${topo}
            ${painel(conta.p.fama, TITULOS[conta.p.titulo || 'nenhum'] || 'Sem título', conta.p.elegivel_rebento ? 'Atingiu 100 de fama: a Staff confirma o Rebento.' : '')}
            <p class="fg-note">Fama oficial da conta, a mesma da Tabula Famae. Cada lançamento leva o link da mensagem no Discord; Donos e Staff também ajustam pelo Praetorium. <button class="fg-btn fg-btn--sm" type="button" data-a="abrir-app" data-app="famae" style="margin-left:6px">Abrir a Tabula</button></p>
            <div class="fg-box fg-form" data-fama-form>
              <label class="fg-field"><span>Fama</span><input name="quantidade" type="number" step="1" min="-500" max="500" placeholder="+5"></label>
              <label class="fg-field"><span>Motivo</span><input name="motivo" maxlength="300" placeholder="Ex.: missão da ponte de Nazzano" autocomplete="off"></label>
              <label class="fg-field fg-wide"><span>Link da mensagem no Discord</span><input name="link" type="url" maxlength="200" placeholder="https://discord.com/channels/…" autocomplete="off" spellcheck="false"></label>
              <div class="fg-actions fg-wide"><button class="fg-btn fg-btn--pri" type="button" data-a="fama-lancar">Lançar fama</button></div>
            </div>
            <div class="fg-sec-head"><b class="fg-label">Histórico de fama</b><small class="fg-label">${conta.base ? `inclui ${sinal(conta.base)} de fama inicial` : ''}</small></div>
            <div class="fg-rows">${conta.regs.map(x => `<div class="fg-row${x.removido_em ? ' is-off' : ''}"><span class="fg-row-num">${sinal(x.quantidade)}</span><div class="fg-row-main"><b>${esc(x.motivo)}</b><small>${new Date(x.criado_em).toLocaleDateString('pt-BR')} · ${window.PRINCIPIA.online?.linkFama ? window.PRINCIPIA.online.linkFama(x) : ''}${x.removido_em ? ` · removido${x.motivo_remocao ? ': ' + esc(x.motivo_remocao) : ''}` : ''}</small></div>${!x.removido_em && x.criado_por === uid ? `<button class="fg-btn fg-btn--sm fg-btn--icon fg-btn--ghost" type="button" data-a="fama-remover" data-id="${esc(x.id)}" aria-label="Remover este lançamento">${ICO.close}</button>` : ''}</div>`).join('') || '<p class="fg-empty-line">Nenhum lançamento ainda.</p>'}</div>
            ${antigo.length ? `<details class="fg-box"><summary class="fg-label" style="cursor:pointer">Histórico antigo da ficha (${antigo.length}) · não conta na Tabula</summary><div class="fg-rows" style="margin-top:10px">${antigo.map(x => `<div class="fg-row"><span class="fg-row-num">${sinal(Number(x.amount) || 0)}</span><div class="fg-row-main"><b>${esc(x.source || 'Sem origem')}</b>${x.discordLink ? `<small><a href="${esc(x.discordLink)}" target="_blank" rel="noopener noreferrer">ver no Discord</a></small>` : ''}</div></div>`).join('')}</div></details>` : ''}`;
        } else {
          const online = FG.nuvem?.ativa?.();
          blocoFama = `${topo}
            ${painel(fama, banda.name || 'Sem faixa', banda.summary || '')}
            ${online ? '<p class="fg-note">Esta ficha ainda está só neste navegador. Guarde a ficha na conta (selo ao lado do nome) para a fama valer na Tabula Famae.</p>' : ''}
            <div class="fg-sec-head"><b class="fg-label">Histórico de fama</b><button class="fg-btn fg-btn--sm" type="button" data-a="roma-nova" data-t="fama">${ICO.plus}Registro</button></div>
            <div class="fg-rows">${(r.fameEntries || []).map(x => linhaFama(x)).join('') || '<p class="fg-empty-line">Nenhum ganho ou perda registrado.</p>'}</div>`;
        }
        return `<div class="fg-cols2">
          <div>
            <div class="fg-sec">${blocoFama}</div>
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
