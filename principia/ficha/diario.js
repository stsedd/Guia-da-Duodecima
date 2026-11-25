/* GUIA DA DUODÉCIMA · Ficha · aba Diário (identidade, capa, retrato, história e notas). */
(() => {
  'use strict';
  function iniciar() {
    const FG = window.FichaGuia;
    if (!FG) return;
    const { esc } = FG;
    const acoes = FG.acoes;
    const S = FG.S;

    FG.abas.diario = {
      render(c) {
        const { s } = c;
        const h = s.history || {};
        const campo = (path, rotulo, valor, extra = '') => `<label class="fg-field"><span>${rotulo}</span><input data-a="campo" data-render data-path="${path}" value="${esc(valor || '')}" ${extra}></label>`;
        const texto = (path, rotulo, valor, ph, linhas = 5) => `<label class="fg-field fg-wide"><span>${rotulo}</span><textarea data-a="campo" data-vivo data-path="${path}" rows="${linhas}" placeholder="${esc(ph)}">${esc(valor || '')}</textarea></label>`;
        return `<div class="fg-cols2">
          <div class="fg-sec">
            <div style="display:flex;flex-direction:column;gap:8px"><span class="fg-kicker">Identidade</span><h2 class="fg-h fg-h--big">Diário</h2></div>
            <div class="fg-form">
              ${campo('name', 'Nome do personagem', s.name, 'maxlength="80"')}
              ${campo('player', 'Jogador(a)', s.player, 'maxlength="60"')}
              <label class="fg-field fg-wide"><span>Frase da capa</span><input data-a="campo" data-render data-path="history.tagline" value="${esc(h.tagline || '')}" maxlength="140" placeholder="Uma linha que apresente o personagem"></label>
              ${campo('history.origin', 'Origem', h.origin, 'placeholder="Cidade, região, contexto…"')}
              ${campo('history.age', 'Idade', h.age)}
              ${campo('history.birth', 'Nascimento', h.birth)}
              ${campo('history.residence', 'Residência', h.residence)}
              ${campo('history.affiliation', 'Afiliação / coorte / grupo', h.affiliation)}
            </div>
            <div class="fg-sec-head"><b class="fg-label">Retrato</b></div>
            <div class="fg-imgpick">${h.portraitUrl ? `<img src="${esc(h.portraitUrl)}" alt="Retrato">` : ''}<label class="fg-btn fg-btn--sm" style="cursor:pointer">${h.portraitUrl ? 'Trocar retrato' : 'Enviar retrato'}<input type="file" accept="image/*" data-a="img-historia" data-campo="portraitUrl" hidden></label>${h.portraitUrl ? '<button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="img-historia-tirar" data-campo="portraitUrl">Tirar</button>' : ''}</div>
            <div class="fg-sec-head"><b class="fg-label">Capa (proporção 4,5:1, como na Ficha Oficial)</b></div>
            <div class="fg-imgpick">${h.bannerUrl ? `<img class="fg-banner-prev" src="${esc(h.bannerUrl)}" alt="Capa" style="object-position:${Number(h.bannerPositionX ?? 50)}% ${Number(h.bannerPositionY ?? 50)}%">` : ''}<label class="fg-btn fg-btn--sm" style="cursor:pointer">${h.bannerUrl ? 'Trocar capa' : 'Enviar capa'}<input type="file" accept="image/*" data-a="img-historia" data-campo="bannerUrl" hidden></label>${h.bannerUrl ? '<button class="fg-btn fg-btn--sm fg-btn--ghost" type="button" data-a="img-historia-tirar" data-campo="bannerUrl">Tirar</button>' : ''}</div>
            ${h.bannerUrl ? `<div class="fg-form">
              <label class="fg-field"><span>Enquadramento horizontal</span><input type="range" min="0" max="100" data-a="campo" data-tipo="int" data-render data-path="history.bannerPositionX" value="${Number(h.bannerPositionX ?? 50)}"></label>
              <label class="fg-field"><span>Enquadramento vertical</span><input type="range" min="0" max="100" data-a="campo" data-tipo="int" data-render data-path="history.bannerPositionY" value="${Number(h.bannerPositionY ?? 50)}"></label>
            </div>` : ''}
            <p class="fg-muted" style="font-size:12.5px">Sem capa, a ficha usa a arte do grupo do seu deus. As imagens são reduzidas antes de salvar para a ficha não pesar.</p>
          </div>
          <div class="fg-sec fg-diary">
            <div class="fg-form">
              ${texto('history.description', 'Descrição', h.description, 'Aparência, personalidade ou apresentação…', 4)}
              ${texto('history.summary', 'Resumo da história', h.summary, 'Lore, passado, acontecimentos importantes…', 7)}
              ${texto('history.goals', 'Objetivos', h.goals, 'Objetivos atuais, promessas, missões pessoais…', 4)}
              ${texto('history.relationships', 'Vínculos e relações', h.relationships, 'Aliados, família, rivalidades, relações importantes…', 4)}
              ${texto('history.milestones', 'Marcos da campanha', h.milestones, 'Missões, títulos, decisões, acontecimentos que você quer lembrar…', 4)}
              ${texto('notes', 'Anotações da mesa', s.notes, 'Tudo o que precisa ficar à mão durante as cenas…', 8)}
            </div>
          </div>
        </div>`;
      }
    };

    acoes['img-historia'] = async el => {
      const f = el.files?.[0];
      if (!f) return;
      const banner = el.dataset.campo === 'bannerUrl';
      try {
        const url = await FG.imagem(f, banner ? 1800 : 640, banner ? 900 : 640, 0.84);
        const h = S.M.state.history;
        h[el.dataset.campo] = url;
        if (banner) { h.bannerPositionX = 50; h.bannerPositionY = 50; h.bannerScale = 100; }
        FG.salvar(); FG.render();
      } catch (e) { window.PRINCIPIA.api.toast(e.message || String(e)); }
    };
    acoes['img-historia-tirar'] = el => { S.M.state.history[el.dataset.campo] = ''; FG.salvar(); FG.render(); };
  }
  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
