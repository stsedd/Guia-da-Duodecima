/* GUIA DA DUODÉCIMA · Ficha · aba Arsenal (baralho de itens, bolsa, biblioteca e edição). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc, ICO, sinal } = FG;
    const acoes = FG.acoes;
    const S = FG.S;
    const METAL = {
      'ferro-aco': 'linear-gradient(145deg,#d9dee3,#6b737c 45%,#b4bcc4 70%,#454b52)',
      'mithril': 'linear-gradient(145deg,#f2f8ff,#9cb8cc 45%,#e3eef7 70%,#6f8da3)',
      'bronze-celestial': 'linear-gradient(145deg,#f0cf7a,#a9741f 45%,#e0b35a 70%,#7a5512)',
      'uro': 'linear-gradient(145deg,#d8c39c,#6e5634 45%,#bca37a 70%,#4b3a22)',
      'ouro-imperial': 'linear-gradient(145deg,#fff0a8,#d4a514 45%,#ffe27a 70%,#9a7408)',
      'ferro-estigio': 'linear-gradient(145deg,#7a6a8a,#1c1424 45%,#5a4a6a 70%,#0d0a12)'
    };
    const VIDRO = 'linear-gradient(145deg,#e7d2d6,#8a5560 50%,#c79aa3)';
    const NEUTRO = 'linear-gradient(145deg,#5a4a4e,#231a1d 50%,#4a3c40)';
    const ARTE = { arma: 'a-minerios', armadura: 'a-minerios', escudo: 'a-minerios', municao: 'a-minerios', 'arma-corpo': 'a-minerios', 'arma-distancia': 'a-minerios', consumivel: 'a-magia', 'item-magico': 'a-magia', outro: 'a-legio' };
    const arte = (tipo, img) => (img ? { src: img, propria: true } : { src: FG.HQ + (ARTE[tipo] || 'a-legio') + '.webp', propria: false });
    const pips = (atual, max) => (max == null ? '<span>Inquebrável</span>' : Array.from({ length: Math.max(0, max) }, (_, i) => `<i class="${i < atual ? 'on' : ''}"></i>`).join(''));

    function cartaArma(c, w, i) {
      const { M } = c;
      const mat = M.material(w.material);
      const img = arte('arma', w.imageUrl);
      return `<button data-ordem="arma:${esc(w.id)}" class="fg-icard${w.equipped ? '' : ' is-off'}" type="button" data-a="abrir-item" data-tipo="arma" data-id="${esc(w.id)}" style="--metal:${METAL[w.material] || NEUTRO};animation-delay:${i * 70}ms" aria-label="${esc(w.name || 'Arma')}${w.equipped ? ', equipada' : ''}">
        <span class="fg-icard-in">
          <span class="fg-icard-art"><img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''} style="object-position:50% 15%"></span>
          <span class="fg-icard-chips"><span class="fg-icard-tag">${w.equipped ? 'ARMA' : 'GUARDADA'}</span><span class="fg-icard-mat" title="${esc(mat.name || '')}">${esc(mat.name || '')}</span></span>
          <span class="fg-icard-body"><b>${esc(w.name || 'Arma')}</b><small>${esc(M.weaponType(w.type)?.name || '')} · ${esc(FG.attrsLista.find(a => a[0] === w.attr)?.[2] || '')}${w.isHeritage ? ' · herança' : ''}</small></span>
          <span class="fg-icard-foot">
            <span class="fg-icard-stats"><span><small>ATAQUE</small><b>${sinal(M.weaponAttack(w))}${M.fortuneSuffix()}</b></span><span><small>DANO</small><b>${esc(M.weaponDamageFormula(w))}</b></span></span>
            <span class="fg-icard-res">RESIST. ${pips(w.resistanceCurrent, M.materialResistance(w))}</span>
          </span>
        </span>
      </button>`;
    }
    // Armadura e escudo são campos fixos da ficha (como na Ficha Oficial). "Sem armadura/escudo" = o valor
    // padrão do motor; nesse caso o cartão não aparece, e "Remover" volta a esse padrão.
    const PADRAO = { armadura: 'Armadura', escudo: 'Escudo' };
    function temProtecao(it, tipo) {
      if (!it) return false;
      if (it.equipped || it.imageUrl || it.notes || it.isHeritage || it.madeByVulcano) return true;
      if ((it.name || PADRAO[tipo]) !== PADRAO[tipo] || (it.material || 'ferro-aco') !== 'ferro-aco') return true;
      return tipo === 'armadura' ? (it.type || 'nenhuma') !== 'nenhuma' : Number(it.stakes) > 0 || !!it.masterTalent;
    }
    FG.temProtecao = temProtecao;
    function cartaProtecao(c, tipo, i) {
      const { M, s } = c;
      const it = tipo === 'armadura' ? s.armor : s.shield;
      const mat = M.material(it.material);
      const img = arte(tipo, it.imageUrl);
      const def = tipo === 'armadura' ? M.armorDefense() : M.shieldDefense();
      const k2 = tipo === 'armadura' ? ['REDUÇÃO', 'RD ' + M.armorReduction()] : ['ESTACAS', `${it.stakes || 0} / 30`];
      return `<button data-ordem="${tipo}" class="fg-icard${it.equipped ? '' : ' is-off'}" type="button" data-a="abrir-item" data-tipo="${tipo}" style="--metal:${METAL[it.material] || NEUTRO};animation-delay:${i * 70}ms" aria-label="${esc(it.name || tipo)}${it.equipped ? ', equipada' : ', não equipada'}">
        <span class="fg-icard-in">
          <span class="fg-icard-art"><img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''} style="object-position:${tipo === 'armadura' ? '40% 40%' : '45% 78%'}"></span>
          <span class="fg-icard-chips"><span class="fg-icard-tag">${tipo === 'armadura' ? 'ARMADURA' : 'ESCUDO'}${it.equipped ? '' : ' · GUARDADO'}</span><span class="fg-icard-mat" title="${esc(mat.name || '')}">${esc(mat.name || '')}</span></span>
          <span class="fg-icard-body"><b>${esc(it.name || (tipo === 'armadura' ? 'Armadura' : 'Escudo'))}</b><small>${tipo === 'armadura' ? esc(M.armorType(it.type)?.name || '') : (it.masterTalent ? 'Mestre de Escudos' : 'Escudo padrão')}${it.isHeritage ? ' · herança' : ''}</small></span>
          <span class="fg-icard-foot">
            <span class="fg-icard-stats"><span><small>DEFESA</small><b>${sinal(def)}</b></span><span><small>${k2[0]}</small><b>${esc(k2[1])}</b></span></span>
            <span class="fg-icard-res">RESIST. ${pips(it.resistanceCurrent, M.materialResistance(it))}</span>
          </span>
        </span>
      </button>`;
    }
    function cartaItem(c, it, i) {
      const consumivel = it.category === 'consumivel';
      const img = arte(it.category, it.imageUrl);
      const qtd = Math.max(0, Number(it.qty) || 0);
      const metal = consumivel ? VIDRO : METAL[it.material] || NEUTRO;
      return `<div ${consumivel ? `data-ordem="${esc(it.id)}"` : ''} class="fg-icard${consumivel && qtd > 1 ? ' fg-icard--stack' : ''}" style="--metal:${metal};width:190px;height:262px;animation-delay:${i * 60}ms">
        <span class="fg-icard-in" data-a="abrir-item" data-tipo="item" data-id="${esc(it.id)}" role="button" tabindex="0" aria-label="${esc(it.name || 'Item')}" style="display:block;cursor:pointer">
          <span class="fg-icard-art" style="height:36%"><img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''} style="object-position:${30 + (i * 17) % 50}% ${30 + (i * 11) % 40}%"></span>
          <span class="fg-icard-tag">${esc((c.M.inventoryCategoryLabel(it.category) || 'Item').toUpperCase())}</span>
          <span class="fg-icard-qty">×${qtd}</span>
          <span class="fg-icard-body"><b>${esc(it.name || 'Item')}</b><small>${esc(it.effect || it.notes || '')}</small></span>
        </span>
        ${consumivel ? `<span class="fg-icard-foot"><button class="fg-btn fg-btn--pri fg-btn--sm fg-icard-use" type="button" data-a="consumir" data-id="${esc(it.id)}"${qtd ? '' : ' disabled'}>Usar</button></span>` : ''}
      </div>`;
    }

    function baralho(c, armas) {
      const cartas = new Map(armas.map((w, i) => ['arma:' + w.id, cartaArma(c, w, i)]));
      for (const tipo of ['armadura', 'escudo']) {
        if (temProtecao(tipo === 'armadura' ? c.s.armor : c.s.shield, tipo))
          cartas.set(tipo, cartaProtecao(c, tipo, cartas.size));
      }
      return ordenar(cartas, c.s.inventory?.arsenalOrder);
    }
    function ordenar(cartas, ordemSalva) {
      const ordem = [...new Set([...(Array.isArray(ordemSalva) ? ordemSalva : []), ...cartas.keys()])].filter(k => cartas.has(k));
      return ordem.map(k => cartas.get(k)).join('');
    }
    function mover(origem, destino) {
      if (!origem || !destino || origem === destino || origem.parentElement !== destino.parentElement) return;
      const cartas = [...origem.parentElement.children];
      const pos = cartas.indexOf(destino);
      cartas.splice(cartas.indexOf(origem), 1);
      cartas.splice(pos, 0, origem);
      S.M.state.inventory[origem.parentElement.dataset.baralho] = cartas.map(c => c.dataset.ordem);
      FG.salvar();
      FG.render();
    }
    let arraste;
    let bloquearClique = false;
    document.addEventListener('click', ev => {
      if (bloquearClique && ev.detail !== 0) {
        bloquearClique = false;
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener('dragstart', ev => {
      if (ev.target.closest('[data-baralho] [data-ordem]')) ev.preventDefault();
    });
    document.addEventListener('pointerdown', ev => {
      bloquearClique = false;
      const origem = ev.target.closest('[data-baralho] [data-ordem]');
      if (!origem || !ev.isPrimary || ev.button !== 0 || ev.target.closest('[data-a="consumir"]') || arraste) return;
      if (origem.parentElement.children.length < 2) return;
      arraste = { id: ev.pointerId, origem, x: ev.clientX, y: ev.clientY, ativo: false };
    }, true);
    function destino(ev) {
      const { origem, x, y } = arraste;
      const carta = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-ordem]');
      if (carta && carta !== origem && carta.parentElement === origem.parentElement) return carta;
      const limite = origem.getBoundingClientRect();
      const dx = ev.clientX - x;
      if (ev.pointerType === 'touch' && Math.abs(dx) >= 48 && Math.abs(ev.clientY - y) < 40 &&
          ev.clientY >= limite.top && ev.clientY <= limite.bottom && (!carta || carta === origem))
        return dx < 0 ? origem.previousElementSibling : origem.nextElementSibling;
      return null;
    }
    document.addEventListener('pointermove', ev => {
      if (arraste?.id !== ev.pointerId) return;
      const { origem, x, y } = arraste;
      const dx = ev.clientX - x, dy = ev.clientY - y;
      if (!arraste.ativo) {
        if (Math.hypot(dx, dy) < 8) return;
        if (ev.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) { arraste = null; return; }
        arraste.ativo = true;
        origem.setPointerCapture(ev.pointerId);
        origem.classList.add('fg-arrastando');
      }
      arraste.destino?.classList.remove('fg-destino');
      arraste.destino = destino(ev);
      arraste.destino?.classList.add('fg-destino');
    });
    function fim(ev) {
      if (arraste?.id !== ev.pointerId) return;
      const { origem, ativo } = arraste;
      const alvo = ativo && ev.type === 'pointerup' ? destino(ev) : null;
      arraste.destino?.classList.remove('fg-destino');
      origem.classList.remove('fg-arrastando');
      arraste = null;
      bloquearClique = ativo && ev.type === 'pointerup';
      if (alvo) mover(origem, alvo);
    }
    document.addEventListener('pointerup', fim);
    document.addEventListener('pointercancel', fim);
    document.addEventListener('lostpointercapture', ev => {
      if (arraste?.ativo && ev.target === arraste.origem) fim(ev);
    });
    window.addEventListener('blur', () => { if (arraste) fim({pointerId: arraste.id}); });
    document.addEventListener('keydown', ev => {
      const origem = ev.target.closest('[data-baralho] [data-ordem]');
      if (!origem || ev.target.closest('[data-a="consumir"]') || !['ArrowLeft','ArrowRight'].includes(ev.key)) return;
      ev.preventDefault();
      const grupo = origem.parentElement.dataset.baralho;
      mover(origem, ev.key === 'ArrowLeft' ? origem.previousElementSibling : origem.nextElementSibling);
      requestAnimationFrame(() => {
        const carta = document.querySelector('[data-baralho="' + grupo + '"] [data-ordem="' + CSS.escape(origem.dataset.ordem) + '"]');
        (carta?.matches('button') ? carta : carta?.querySelector('[data-a="abrir-item"]'))?.focus();
      });
    });

    FG.abas.arsenal = {
      render(c) {
        const { M, s } = c;
        const armas = s.weapons || [];
        const itens = s.inventory?.items || [];
        const consumiveis = itens.filter(x => x.category === 'consumivel');
        const outros = itens.filter(x => x.category !== 'consumivel');
        const lib = M.ITEM_LIBRARY || [];
        const grupos = [...new Set(lib.map(x => x.group))];
        const g = S.grupoLib || grupos[0];
        const q = String(S.buscaLib || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        const listaLib = lib.filter(x => (q ? String(x.name + ' ' + (x.effect || '') + ' ' + (x.material || '')).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q) : x.group === g));
        return `<div class="fg-cols2 fg-cols2--painel-dir">
          <div>
            <div class="fg-sec">
              <div class="fg-sec-head"><div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Baralho de combate</span><h2 class="fg-h fg-h--big">Equipado</h2></div><span class="fg-muted" style="font-size:12.5px;max-width:320px;text-align:right">Toque para editar. Arraste uma carta para reorganizar.</span></div>
              <div class="fg-items" data-baralho="arsenalOrder">${baralho(c, armas) || '<p class="fg-empty-line">Nada no arsenal. Adicione pela biblioteca ao lado.</p>'}</div>
            </div>
            <div class="fg-sec">
              <div class="fg-sec-head"><h3 class="fg-h">Consumíveis</h3><span class="fg-label">Usar desconta a quantidade</span></div>
              ${consumiveis.length ? `<div class="fg-items" data-baralho="consumableOrder">${ordenar(new Map(consumiveis.map((it, i) => [String(it.id), cartaItem(c, it, i)])), s.inventory.consumableOrder)}</div>` : '<p class="fg-empty-line">Nenhum consumível. Adicione pela biblioteca ao lado.</p>'}
            </div>
            <div class="fg-sec">
              <div class="fg-sec-head"><h3 class="fg-h">Outros itens</h3></div>
              ${outros.length ? `<div class="fg-items">${outros.map((it, i) => cartaItem(c, it, i)).join('')}</div>` : '<p class="fg-empty-line">Nenhum outro item.</p>'}
            </div>
            <div class="fg-sec">
              <div class="fg-sec-head"><h3 class="fg-h">Bolsa</h3><button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="regra" data-p="cursus" data-anc="economia">Economia no Guia</button></div>
              <div class="fg-form" style="max-width:420px">
                <label class="fg-field"><span>Áureos</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-path="inventory.aureus" value="${Number(s.inventory?.aureus) || 0}"></label>
                <label class="fg-field"><span>Denários</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-path="inventory.denarius" value="${Number(s.inventory?.denarius) || 0}"></label>
              </div>
              <label class="fg-field"><span>Anotações do inventário</span><textarea data-a="campo" data-vivo data-path="inventory.notes" rows="3">${esc(s.inventory?.notes || '')}</textarea></label>
            </div>
          </div>
          <aside class="fg-box fg-sec" style="position:sticky;top:150px">
            <span class="fg-kicker">Biblioteca do Core</span>
            <h3 class="fg-h">Adicionar</h3>
            <input class="fg-in" type="search" data-a="busca-lib" data-vivo value="${esc(S.buscaLib || '')}" placeholder="Buscar entre ${lib.length} itens" aria-label="Buscar na biblioteca">
            ${q ? '' : `<div class="fg-pills">${grupos.map(x => `<button class="fg-pill" type="button" data-a="grupo-lib" data-g="${esc(x)}" aria-pressed="${x === g}">${esc(x.replace('Forja · ', ''))}</button>`).join('')}</div>`}
            <div class="fg-rows" style="max-height:420px;overflow:auto">${listaLib.map(x => `<div class="fg-row" style="padding:8px 10px"><i style="width:30px;height:30px;border-radius:8px;flex:none;background:${x.kind === 'inventory' && x.category === 'consumivel' ? VIDRO : METAL[x.material] || NEUTRO}"></i><div class="fg-row-main"><b style="font-size:13px">${esc(x.name)}</b><small>${esc(x.effect || (x.material ? c.M.material(x.material).name : ''))}</small></div><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="lib-por" data-id="${esc(x.id)}" aria-label="Adicionar ${esc(x.name)}">${ICO.plus}</button></div>`).join('') || '<p class="fg-empty-line">Nada encontrado.</p>'}</div>
            <div class="fg-actions"><button class="fg-btn fg-btn--sm" type="button" data-a="nova-arma">${ICO.plus}Arma manual</button><button class="fg-btn fg-btn--sm" type="button" data-a="novo-item">${ICO.plus}Item manual</button>${temProtecao(s.armor, 'armadura') ? '' : `<button class="fg-btn fg-btn--sm" type="button" data-a="nova-protecao" data-tipo="armadura">${ICO.plus}Armadura manual</button>`}${temProtecao(s.shield, 'escudo') ? '' : `<button class="fg-btn fg-btn--sm" type="button" data-a="nova-protecao" data-tipo="escudo">${ICO.plus}Escudo manual</button>`}</div>
          </aside>
        </div>`;
      }
    };

    /* ---------------------------------------------------------------- gavetas de edição */
    const opcoes = (lista, atual) => lista.map(([v, n]) => `<option value="${esc(v)}"${String(atual) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('');
    const campoImagem = (rotulo, url, acao, extra) => `<div class="fg-imgpick">${url ? `<img src="${FG.src(url)}" alt="">` : ''}<label class="fg-btn fg-btn--sm" style="cursor:pointer">${rotulo}<input type="file" accept="image/*" data-a="${acao}" ${extra} hidden></label>${url ? `<button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="${acao}-tirar" ${extra}>Tirar imagem</button>` : ''}</div>`;
    const cabeca = (img, tags) => `<div class="fg-drawer-head"><img src="${FG.src(img.src)}" alt=""${img.propria ? ' class="is-own"' : ''}><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button><span class="fg-drawer-tags">${tags}</span></div>`;
    const resistencia = (atual, max, alvo) => max == null ? '<p class="fg-muted">Material inquebrável.</p>' : `<div class="fg-row"><div class="fg-row-main"><b>Resistência</b><small>Perde 1 a cada golpe que a regra mandar; reparos na forja devolvem.</small></div><div class="fg-stepper"><button type="button" data-a="resistencia" data-alvo="${alvo}" data-d="-1" aria-label="Menos resistência">−</button><b>${atual}</b><button type="button" data-a="resistencia" data-alvo="${alvo}" data-d="1" aria-label="Mais resistência">+</button><small class="fg-muted">/ ${max}</small></div></div>`;
    const regraMaterial = (c, matId) => { const m = c.M.material(matId); const t = m?.targeting?.ruleText || m?.ruleText || ''; return t ? `<p class="fg-note"><b>${esc(m.name)}:</b> ${esc(t)}</p>` : ''; };

    FG.gavetas.arma = (c, d) => {
      const { M, s, D } = c;
      const w = (s.weapons || []).find(x => x.id === d.id);
      if (!w) return '';
      const p = `weapons[id=${w.id}]`;
      return `${cabeca(arte('arma', w.imageUrl), `<span class="fg-tag fg-tag--red">Arma</span><span class="fg-tag">${esc(M.material(w.material).name)}</span>`)}
        <div class="fg-drawer-body">
          <h3>${esc(w.name || 'Arma')}</h3>
          <div class="fg-box" style="display:flex;gap:20px"><div><span class="fg-label">Ataque</span><div class="fg-anton" style="font-size:34px">${sinal(M.weaponAttack(w))}${M.fortuneSuffix()}</div></div><div><span class="fg-label">Dano</span><div class="fg-anton" style="font-size:34px">${esc(M.weaponDamageFormula(w))}</div></div></div>
          <div class="fg-form">
            <label class="fg-field fg-wide"><span>Nome</span><input data-a="campo" data-render data-path="${p}.name" value="${esc(w.name || '')}"></label>
            <label class="fg-field"><span>Tipo</span><select data-a="campo" data-calc data-path="${p}.type">${opcoes((D.system.weaponTypes || []).map(t => [t.id, t.name]), w.type)}</select></label>
            <label class="fg-field"><span>Atributo</span><select data-a="campo" data-calc data-path="${p}.attr">${opcoes(FG.attrsLista.map(([k, , n]) => [k, n]), w.attr)}</select></label>
            <label class="fg-field"><span>Material</span><select data-a="material" data-alvo="arma" data-id="${esc(w.id)}">${opcoes((D.system.materials || []).map(m => [m.id, m.name]), w.material)}</select></label>
            <label class="fg-field"><span>Estacas (${w.stakes || 0}/30)</span><input type="range" min="0" max="30" data-a="campo" data-tipo="int" data-calc data-path="${p}.stakes" value="${w.stakes || 0}"></label>
            <label class="fg-field"><span>Bônus extra de ataque</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="${p}.attackExtra" value="${w.attackExtra || 0}"></label>
            <label class="fg-field"><span>Bônus extra de dano</span><input type="number" step="1" data-a="campo" data-tipo="int" data-calc data-path="${p}.damageExtra" value="${w.damageExtra || 0}"></label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-calc data-path="${p}.equipped"${w.equipped ? ' checked' : ''}> Equipada</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.isHeritage"${w.isHeritage ? ' checked' : ''}> Herança</label>
            <label class="fg-check fg-wide"><input type="checkbox" data-a="campo" data-calc data-path="${p}.madeByVulcano"${w.madeByVulcano ? ' checked' : ''}> Forjada por prole de Vulcano (+2 resistência)</label>
          </div>
          ${resistencia(w.resistanceCurrent, M.materialResistance(w), 'arma:' + w.id)}
          ${regraMaterial(c, w.material)}
          <label class="fg-field"><span>Descrição</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="3">${esc(w.notes || '')}</textarea></label>
          ${campoImagem('Imagem da arma', w.imageUrl, 'img-item', `data-alvo="arma" data-id="${esc(w.id)}"`)}
        </div>
        <div class="fg-drawer-foot"><button class="fg-btn" type="button" data-a="rolar" data-r="arma:${esc(w.id)}">${ICO.d20}Rolar ataque</button><button class="fg-btn fg-btn--danger" type="button" data-a="remover-item" data-alvo="arma" data-id="${esc(w.id)}">Remover</button></div>`;
    };
    function gavetaProtecao(c, tipo) {
      const { M, s, D } = c;
      const it = tipo === 'armadura' ? s.armor : s.shield;
      const p = tipo === 'armadura' ? 'armor' : 'shield';
      const def = tipo === 'armadura' ? M.armorDefense() : M.shieldDefense();
      return `${cabeca(arte(tipo, it.imageUrl), `<span class="fg-tag fg-tag--gold">${tipo === 'armadura' ? 'Armadura' : 'Escudo'}</span><span class="fg-tag">${esc(M.material(it.material).name)}</span>`)}
        <div class="fg-drawer-body">
          <h3>${esc(it.name || (tipo === 'armadura' ? 'Armadura' : 'Escudo'))}</h3>
          <div class="fg-box" style="display:flex;gap:20px"><div><span class="fg-label">Defesa</span><div class="fg-anton" style="font-size:34px">${sinal(def)}</div></div>${tipo === 'armadura' ? `<div><span class="fg-label">Redução</span><div class="fg-anton" style="font-size:34px">RD ${M.armorReduction()}</div></div>` : ''}</div>
          <div class="fg-form">
            <label class="fg-field fg-wide"><span>Nome</span><input data-a="campo" data-render data-path="${p}.name" value="${esc(it.name || '')}"></label>
            ${tipo === 'armadura' ? `<label class="fg-field"><span>Tipo</span><select data-a="campo" data-calc data-path="armor.type">${opcoes((D.system.armorTypes || []).map(t => [t.id, `${t.name} (DEF ${t.defense}, RD ${t.reduction})`]), it.type)}</select></label>` : `<label class="fg-field"><span>Estacas (${it.stakes || 0}/30)</span><input type="range" min="0" max="30" data-a="campo" data-tipo="int" data-calc data-path="shield.stakes" value="${it.stakes || 0}"></label>`}
            <label class="fg-field"><span>Material</span><select data-a="material" data-alvo="${tipo}">${opcoes((D.system.materials || []).map(m => [m.id, m.name]), it.material)}</select></label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-calc data-path="${p}.equipped"${it.equipped ? ' checked' : ''}> Equipad${tipo === 'armadura' ? 'a' : 'o'}</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-render data-path="${p}.isHeritage"${it.isHeritage ? ' checked' : ''}> Herança</label>
            ${tipo === 'escudo' ? `<label class="fg-check fg-wide"><input type="checkbox" data-a="campo" data-calc data-path="shield.masterTalent"${it.masterTalent ? ' checked' : ''}> Mestre de Escudos</label>` : ''}
            <label class="fg-check fg-wide"><input type="checkbox" data-a="campo" data-calc data-path="${p}.madeByVulcano"${it.madeByVulcano ? ' checked' : ''}> Feit${tipo === 'armadura' ? 'a' : 'o'} por prole de Vulcano (+2 resistência)</label>
          </div>
          ${resistencia(it.resistanceCurrent, M.materialResistance(it), tipo)}
          ${regraMaterial(c, it.material)}
          <label class="fg-field"><span>Descrição</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="3">${esc(it.notes || '')}</textarea></label>
          ${campoImagem('Imagem', it.imageUrl, 'img-item', `data-alvo="${tipo}"`)}
        </div>
        <div class="fg-drawer-foot"><button class="fg-btn fg-btn--danger" type="button" data-a="remover-item" data-alvo="${tipo}">Remover ${tipo === 'armadura' ? 'armadura' : 'escudo'}</button></div>`;
    }
    FG.gavetas.armadura = c => gavetaProtecao(c, 'armadura');
    FG.gavetas.escudo = c => gavetaProtecao(c, 'escudo');
    FG.gavetas.item = (c, d) => {
      const { M, s } = c;
      const it = (s.inventory?.items || []).find(x => x.id === d.id);
      if (!it) return '';
      const p = `inventory.items[id=${it.id}]`;
      const arma = /^arma-/.test(it.category);
      return `${cabeca(arte(it.category, it.imageUrl), `<span class="fg-tag fg-tag--gold">${esc(M.inventoryCategoryLabel(it.category))}</span><span class="fg-tag">×${Number(it.qty) || 0}</span>`)}
        <div class="fg-drawer-body">
          <h3>${esc(it.name || 'Item')}</h3>
          <div class="fg-form">
            <label class="fg-field fg-wide"><span>Nome</span><input data-a="campo" data-render data-path="${p}.name" value="${esc(it.name || '')}"></label>
            <label class="fg-field"><span>Categoria</span><select data-a="campo" data-render data-path="${p}.category">${opcoes((M.INVENTORY_CATEGORIES || []), it.category)}</select></label>
            <label class="fg-field"><span>Quantidade</span><input type="number" min="0" step="1" data-a="campo" data-tipo="int" data-render data-path="${p}.qty" value="${Number(it.qty) || 0}"></label>
            <label class="fg-field"><span>Material</span><input data-a="campo" data-path="${p}.material" value="${esc(it.material || '')}" placeholder="Opcional"></label>
            <label class="fg-field"><span>Runa</span><input data-a="campo" data-path="${p}.rune" value="${esc(it.rune || '')}" placeholder="Opcional"></label>
            <label class="fg-field fg-wide"><span>Efeito curto</span><input data-a="campo" data-render data-path="${p}.effect" value="${esc(it.effect || '')}"></label>
            ${arma ? `<label class="fg-field"><span>Atributo do ataque</span><select data-a="campo" data-path="${p}.attackAttr">${opcoes(FG.attrsLista.map(([k, , n]) => [k, n]), it.attackAttr)}</select></label>
            <label class="fg-field"><span>Bônus de ataque</span><input type="number" step="1" data-a="campo" data-tipo="int" data-path="${p}.attackBonus" value="${Number(it.attackBonus) || 0}"></label>
            <label class="fg-field"><span>Dano</span><input data-a="campo" data-path="${p}.damage" value="${esc(it.damage || '')}" placeholder="Ex.: 1d8 + 2"></label>
            <label class="fg-field"><span>Alcance</span><input data-a="campo" data-path="${p}.range" value="${esc(it.range || '')}"></label>` : ''}
            <label class="fg-check"><input type="checkbox" data-a="campo" data-path="${p}.showInDeck"${it.showInDeck ? ' checked' : ''}> No baralho de combate</label>
            <label class="fg-check"><input type="checkbox" data-a="campo" data-path="${p}.isHeritage"${it.isHeritage ? ' checked' : ''}> Herança</label>
          </div>
          <label class="fg-field"><span>Descrição completa</span><textarea data-a="campo" data-vivo data-path="${p}.notes" rows="4">${esc(it.notes || '')}</textarea></label>
          ${campoImagem('Imagem do item', it.imageUrl, 'img-item', `data-alvo="item" data-id="${esc(it.id)}"`)}
        </div>
        <div class="fg-drawer-foot">${it.category === 'consumivel' ? `<button class="fg-btn fg-btn--pri" type="button" data-a="consumir" data-id="${esc(it.id)}"${Number(it.qty) ? '' : ' disabled'}>Usar</button>` : ''}<button class="fg-btn fg-btn--danger" type="button" data-a="remover-item" data-alvo="item" data-id="${esc(it.id)}">Remover</button></div>`;
    };

    /* ---------------------------------------------------------------- ações */
    const alvoItem = (alvo, id) => {
      const s = S.M.state;
      if (alvo === 'arma') return (s.weapons || []).find(x => x.id === id);
      if (alvo === 'armadura') return s.armor;
      if (alvo === 'escudo') return s.shield;
      if (alvo === 'item') return (s.inventory?.items || []).find(x => x.id === id);
      return null;
    };
    acoes['abrir-item'] = el => FG.abrirGaveta(el.dataset.tipo, { id: el.dataset.id });
    acoes.consumir = el => { S.M.consumeInventoryItem(el.dataset.id); if (!(S.M.state.inventory?.items || []).some(x => x.id === el.dataset.id)) FG.fecharGaveta(); };
    acoes['grupo-lib'] = el => { S.grupoLib = el.dataset.g; FG.render(); };
    acoes['busca-lib'] = el => {
      S.buscaLib = el.value;
      clearTimeout(acoes._libT);
      acoes._libT = setTimeout(() => { FG.renderAgora(); const campo = document.querySelector('#osFichaBody [data-a="busca-lib"]'); if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); } }, 220);
    };
    acoes['lib-por'] = el => {
      const M = S.M, t = M.libraryItemById(el.dataset.id);
      if (!t) return;
      if ((t.kind === 'armor' && M.state.armor?.equipped) || (t.kind === 'shield' && M.state.shield?.equipped)) {
        FG.confirmar('Trocar o equipamento?', `${t.kind === 'armor' ? 'A armadura' : 'O escudo'} atual será substituíd${t.kind === 'armor' ? 'a' : 'o'} por ${t.name}.`, 'Trocar').then(ok => { if (ok && M.applyLibraryTemplate(t)) { M.syncCurrentCaps(); FG.salvar(); FG.render(); window.PRINCIPIA.api.toast(`${t.name} equipad${t.kind === 'armor' ? 'a' : 'o'}.`); } });
        return;
      }
      if (M.applyLibraryTemplate(t)) { M.syncCurrentCaps(); FG.salvar(); FG.render(); window.PRINCIPIA.api.toast(`${t.name} adicionado.`); }
    };
    acoes['nova-arma'] = () => {
      const M = S.M, m = M.material('ferro-aco');
      const w = { id: FG.uid('weapon'), name: 'Nova arma', type: 'corpo-a-corpo', attr: 'for', material: 'ferro-aco', stakes: 0, resistanceCurrent: m.unbreakable ? 0 : m.resistance, madeByVulcano: false, attackExtra: 0, damageExtra: 0, equipped: true, imageUrl: '', isHeritage: false, notes: '' };
      M.state.weapons.push(w); FG.salvar(); FG.abrirGaveta('arma', { id: w.id }); FG.render();
    };
    acoes['novo-item'] = () => {
      const M = S.M;
      const it = { id: FG.uid('item'), name: 'Novo item', qty: 1, category: 'outro', material: '', rune: '', effect: '', notes: '', imageUrl: '', showInDeck: false, isHeritage: false, attackAttr: 'for', attackBonus: 0, damage: '', range: '' };
      M.state.inventory.items.push(it); FG.salvar(); FG.abrirGaveta('item', { id: it.id }); FG.render();
    };
    acoes['remover-item'] = async el => {
      const alvo = el.dataset.alvo, id = el.dataset.id, it = alvoItem(alvo, id);
      const ok = await FG.confirmar('Remover do arsenal?', `${it?.name || 'Este item'} sai da ficha.`, 'Remover', true);
      if (!ok) return;
      const s = S.M.state;
      if (alvo === 'arma') s.weapons = s.weapons.filter(x => x.id !== id);
      else if (alvo === 'item') s.inventory.items = s.inventory.items.filter(x => x.id !== id);
      // Armadura e escudo voltam ao padrão do motor (o mesmo de uma ficha nova): sem defesa e sem cartão.
      else if (alvo === 'armadura') s.armor = { equipped: false, name: 'Armadura', type: 'nenhuma', material: 'ferro-aco', resistanceCurrent: 3, madeByVulcano: false, imageUrl: '', isHeritage: false, notes: '' };
      else if (alvo === 'escudo') s.shield = { equipped: false, name: 'Escudo', material: 'ferro-aco', stakes: 0, resistanceCurrent: 3, madeByVulcano: false, masterTalent: false, imageUrl: '', isHeritage: false, notes: '' };
      FG.fecharGaveta(); S.M.syncCurrentCaps(); FG.salvar(); FG.render();
    };
    acoes['nova-protecao'] = el => {
      const s = S.M.state, tipo = el.dataset.tipo;
      if (tipo === 'armadura') {
        const t = (S.D?.system?.armorTypes || []).find(x => x.id !== 'nenhuma');
        s.armor = { ...s.armor, equipped: true, type: t?.id || s.armor.type };
      } else s.shield = { ...s.shield, equipped: true };
      S.M.syncCurrentCaps(); FG.salvar(); FG.abrirGaveta(tipo); FG.render();
    };
    acoes.material = el => {
      const M = S.M, it = alvoItem(el.dataset.alvo, el.dataset.id);
      if (!it) return;
      it.material = el.value;
      const max = M.materialResistance(it);
      it.resistanceCurrent = max == null ? 0 : max;
      M.syncCurrentCaps(); FG.salvar(); FG.render();
    };
    acoes.resistencia = el => {
      const M = S.M;
      const [alvo, id] = el.dataset.alvo.split(':');
      const it = alvoItem(alvo, id);
      if (!it) return;
      const max = M.materialResistance(it);
      if (max == null) return;
      it.resistanceCurrent = FG.clamp((Number(it.resistanceCurrent) || 0) + Number(el.dataset.d), 0, max);
      FG.salvar(); FG.render();
    };
    acoes['img-item'] = async el => {
      const f = el.files?.[0];
      if (!f) return;
      try {
        const it = alvoItem(el.dataset.alvo, el.dataset.id);
        if (!it) return;
        it.imageUrl = await FG.imagem(f, 640, 640);
        FG.salvar(); FG.render();
      } catch (e) { window.PRINCIPIA.api.toast(e.message || String(e)); }
    };
    acoes['img-item-tirar'] = el => { const it = alvoItem(el.dataset.alvo, el.dataset.id); if (it) { it.imageUrl = ''; FG.salvar(); FG.render(); } };
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
