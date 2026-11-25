/* ==========================================================================
   GUIA DA DUODÉCIMA · Ficha · ficha na conta (Supabase)

   - A ficha de cada personagem da conta fica em personagens.dados (o mesmo JSON
     da Ficha Oficial). As imagens vão para o Storage (bucket privado "fichas")
     e o JSON guarda só a referência "duo-img:<id da conta>/<hash>.<ext>".
   - Cada aparelho mantém a cópia local (IndexedDB) e envia as mudanças alguns
     segundos depois. A revisão do banco percebe quando dois aparelhos mexeram
     na mesma ficha: o jogador escolhe qual manter, e a outra fica nas versões.
   - Quem lê e quem salva é decidido pelo banco (RLS + salvar_ficha em
     supabase/schema.sql). Esconder botões aqui é só conforto visual.
   - Sem a atualização do banco aplicada, tudo segue como antes (só local).
   ========================================================================== */
(() => {
  'use strict';

  const PREFIXO = 'duo-img:';
  const BUCKET = 'fichas';
  const ESPERA = 2500;                       // envia 2,5 s depois da última mudança
  const RETENTAR = 30000;                    // sem conexão: tenta de novo a cada 30 s
  const LIMITE_IMG = 900 * 1024;             // acima disso a imagem é reduzida antes de subir (o bucket aceita até 1 MB)
  const TIPOS = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };
  const COLS = 'id,nome,divindade,linhagem,ficha_revisao,ficha_salva_em';

  function iniciar() {
    const FG = window.FichaGuia;
    const P = window.PRINCIPIA;
    const A = P && P.api;
    if (!FG || !A) return;
    const S = FG.S;
    const { esc, toast, store } = A;
    const ICO = FG.ICO;
    const acoes = FG.acoes;

    const N = {
      lista: null,            // personagens da conta (sem a ficha em si)
      chave: '',              // conta|membro da última sincronização
      sincronizando: null,
      ultimaSync: 0,
      enviando: new Set(),
      timers: new Map(),
      motivos: new Map(),     // motivo da próxima versão na conta, por ficha
      erro: null,
      indisponivel: null      // o banco ainda não tem a atualização da ficha
    };
    const subiu = new Map();  // data URL → caminho no Storage (nesta sessão)
    const desceu = new Map(); // caminho → data URL

    /* ---------------------------------------------------------------- conta */
    const estado = () => P.online?.estado;
    function conta() {
      const st = estado();
      if (!P.online?.ativo || N.indisponivel || !st?.sb || !st.session?.user?.id || !st.conta?.membro) return null;
      return { sb: st.sb, uid: st.session.user.id };
    }
    const ligada = rec => !!(rec?.nuvem && conta() && rec.nuvem.dono === conta().uid);
    const pendente = rec => ligada(rec) && (rec.data?.updatedAt || '') !== (rec.nuvem.enviado || '');
    // Com contas ativas, fichas ligadas a outra conta (computador compartilhado) ficam escondidas.
    const visivel = rec => !rec?.nuvem || !P.online?.ativo || rec.nuvem.dono === estado()?.session?.user?.id;
    const dataHora = iso => { try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
    const chaveIgnorar = uid => 'guia_ficha_ignorar_' + uid;
    const ignorados = uid => { try { return JSON.parse(store.get(chaveIgnorar(uid), '[]')) || []; } catch { return []; } };
    const ignorar = (uid, pid, sim) => {
      const l = new Set(ignorados(uid));
      if (sim) l.add(pid); else l.delete(pid);
      store.set(chaveIgnorar(uid), JSON.stringify([...l]));
    };

    function msg(e) {
      const m = String(e?.message || e?.error || e || '');
      if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) return 'Sem conexão com a conta. A ficha continua salva neste navegador e sobe quando a conexão voltar.';
      if (/JWT expired|invalid JWT/i.test(m)) return 'Sua sessão expirou. Entre de novo com o Discord.';
      if (/row-level security|permission denied/i.test(m)) return 'A conta recusou a gravação (permissão ou limite de imagens). Fale com a Staff se continuar.';
      if (/maximum allowed size|Payload too large/i.test(m)) return 'Uma imagem passou de 1 MB mesmo reduzida. Troque por uma imagem menor.';
      return m || 'Algo deu errado.';
    }
    const permanente = e => /row-level security|permission denied|maximum allowed size|limite|Só o dono|excluído|não encontrado/i.test(String(e?.message || e || ''));
    // Banco sem a atualização da ficha (supabase/schema.sql ainda não rodado de novo).
    const semAtualizacao = e => /ficha_revisao|ficha_salva_em|salvar_ficha|fichas_versoes|Bucket not found|PGRST202|42703|42883/i.test(`${e?.message || ''} ${e?.code || ''} ${e?.error || ''}`);
    function desativar(e) {
      if (N.indisponivel) return;
      N.indisponivel = 'A ficha na conta ainda não foi ativada no banco: a Staff precisa rodar de novo o supabase/schema.sql.';
      console.warn('[Ficha] ficha na conta indisponível:', e?.message || e);
      FG.render();
    }

    /* ---------------------------------------------------------------- imagens */
    async function sha(txt) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    function blobDe(url) {
      const i = url.indexOf(',');
      const cab = url.slice(5, i);
      const tipo = cab.split(';')[0] || 'application/octet-stream';
      if (!/;base64/i.test(cab)) return new Blob([decodeURIComponent(url.slice(i + 1))], { type: tipo });
      const bin = atob(url.slice(i + 1));
      const u8 = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
      return new Blob([u8], { type: tipo });
    }
    async function prepararImagem(url) {
      let blob = blobDe(url);
      // Formato que o bucket não aceita (SVG, BMP…) ou grande demais: vira WebP reduzido.
      for (const [lado, q] of [[1800, 0.82], [1400, 0.72], [1000, 0.62]]) {
        if (TIPOS[blob.type] && blob.size <= LIMITE_IMG) break;
        blob = blobDe(await FG.imagem(blob.type.startsWith('image/') ? blob : new Blob([blob], { type: 'image/png' }), lado, lado, q));
      }
      return blob;
    }
    async function enviarImagem(c, url) {
      if (subiu.has(url)) return subiu.get(url);
      const blob = await prepararImagem(url);
      const caminho = `${c.uid}/${(await sha(url)).slice(0, 40)}.${TIPOS[blob.type] || 'webp'}`;
      const { error } = await c.sb.storage.from(BUCKET).upload(caminho, blob, { contentType: blob.type, upsert: false, cacheControl: '31536000' });
      // Mesmo conteúdo já enviado antes (o nome é o hash): serve.
      if (error && !/exists|duplicate/i.test(`${error.message} ${error.error || ''} ${error.statusCode || ''}`) && String(error.statusCode) !== '409') throw error;
      subiu.set(url, caminho);
      desceu.set(caminho, url);
      return caminho;
    }
    async function baixarImagem(c, caminho) {
      if (desceu.has(caminho)) return desceu.get(caminho);
      const { data, error } = await c.sb.storage.from(BUCKET).download(caminho);
      if (error) throw error;
      const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsDataURL(data); });
      desceu.set(caminho, url);
      subiu.set(url, caminho);
      return url;
    }
    async function trocarTextos(no, fn) {
      if (Array.isArray(no)) { for (let i = 0; i < no.length; i++) no[i] = typeof no[i] === 'string' ? await fn(no[i]) : await trocarTextos(no[i], fn); return no; }
      if (no && typeof no === 'object') { for (const k of Object.keys(no)) no[k] = typeof no[k] === 'string' ? await fn(no[k]) : await trocarTextos(no[k], fn); }
      return no;
    }
    // Local → conta: imagens embutidas sobem para o Storage e viram referência.
    const paraConta = (c, data) => trocarTextos(JSON.parse(JSON.stringify(data)), async s =>
      s.startsWith('data:image/') && s.length > 100 ? PREFIXO + await enviarImagem(c, s) : s);
    // Conta → local: referências voltam a ser imagens embutidas (o JSON exportado continua igual ao da Ficha Oficial).
    // Se alguma imagem não baixar, nada é aplicado: melhor tentar de novo do que perder a imagem.
    const daConta = (c, data) => trocarTextos(JSON.parse(JSON.stringify(data)), async s =>
      s.startsWith(PREFIXO) ? baixarImagem(c, s.slice(PREFIXO.length)) : s);

    /* ---------------------------------------------------------------- baixar */
    async function lerFicha(c, pid) {
      const { data, error } = await c.sb.from('personagens').select('nome,dados,ficha_revisao,ficha_salva_em').eq('id', pid).single();
      if (error) throw error;
      if (!data?.ficha_salva_em || !data.dados || !Object.keys(data.dados).length) throw new Error('A ficha não está mais na conta.');
      return { dados: FG.normalizar(await daConta(c, data.dados)), rev: data.ficha_revisao, em: data.ficha_salva_em };
    }
    function aplicarDaConta(rec, f) {
      rec.data = f.dados;
      rec.data.updatedAt = rec.data.updatedAt || f.em || new Date().toISOString();
      rec.nome = rec.data.name || rec.nome;
      rec.atualizadoEm = new Date().toISOString();
      rec.nuvem = { ...rec.nuvem, rev: f.rev, em: f.em, enviado: rec.data.updatedAt };
      delete rec.nuvem.conflito;
    }
    async function atualizarPelaConta(c, rec, forcar) {
      const f = await lerFicha(c, rec.nuvem.pid);
      // Mudou algo aqui enquanto baixava: vira conflito em vez de apagar a mudança.
      if (!forcar && (pendente(rec) || (S.rec === rec && S.salvando))) { rec.nuvem.conflito = { rev: f.rev, em: f.em }; await FG.dbPut(rec); return false; }
      await FG.guardarVersao(rec, 'Antes de atualizar pela conta');
      aplicarDaConta(rec, f);
      await FG.dbPut(rec);
      if (S.rec === rec) await FG.abrir(rec.id, true);
      return true;
    }
    async function baixarNova(c, p) {
      const f = await lerFicha(c, p.id);
      f.dados.updatedAt = f.dados.updatedAt || f.em;
      const rec = await FG.adicionarFicha(f.dados, 'conta', { abrir: false, nuvem: { pid: p.id, dono: c.uid, rev: f.rev, em: f.em, enviado: '' } });
      rec.nuvem.enviado = rec.data.updatedAt || '';
      await FG.dbPut(rec);
      if (!S.rec && !S.criando) await FG.abrir(rec.id, true);
      return rec;
    }

    /* ---------------------------------------------------------------- enviar */
    let filaEnvio = Promise.resolve();
    function agendar(rec, ms = ESPERA) {
      clearTimeout(N.timers.get(rec.id));
      N.timers.set(rec.id, setTimeout(() => {
        N.timers.delete(rec.id);
        filaEnvio = filaEnvio.then(() => enviar(rec)).catch(() => {});
      }, ms));
    }
    async function enviar(rec, op = {}) {
      const c = conta();
      if (!c || !ligada(rec)) return null;
      if (rec.nuvem.conflito && op.base == null) return null;
      if (!op.forcar && op.base == null && !pendente(rec)) return null;
      const motivo = op.motivo ?? N.motivos.get(rec.id) ?? null;
      const foto = op.ficha || rec.data;
      const marca = op.ficha ? rec.nuvem.enviado : (foto?.updatedAt || '');
      N.enviando.add(rec.id);
      if (S.rec === rec) FG.marcarSalvo();
      let resultado = null;
      try {
        const ficha = await paraConta(c, foto);
        const { data: r, error } = await c.sb.rpc('salvar_ficha', { personagem: rec.nuvem.pid, ficha, revisao_base: op.base ?? rec.nuvem.rev, motivo });
        if (error) throw error;
        N.motivos.delete(rec.id);
        N.erro = null;
        resultado = r;
        if (r?.ok) {
          Object.assign(rec.nuvem, { rev: r.revisao, em: r.salva_em, enviado: marca });
          delete rec.nuvem.conflito;
          const p = N.lista?.find(x => x.id === rec.nuvem.pid);
          if (p) { p.ficha_revisao = r.revisao; p.ficha_salva_em = r.salva_em; }
        } else if (r?.conflito) {
          rec.nuvem.conflito = { rev: r.revisao, em: r.salva_em };
          toast(`${rec.nome} mudou em outro aparelho. Toque no selo da conta para escolher qual versão manter.`);
        }
        await FG.dbPut(rec);
      } catch (e) {
        if (semAtualizacao(e)) { desativar(e); return null; }
        N.erro = msg(e);
        if (!permanente(e)) agendar(rec, RETENTAR);
        else toast(N.erro);
      } finally {
        N.enviando.delete(rec.id);
        if (S.rec === rec) FG.marcarSalvo();
        if (S.drawer?.tipo === 'nuvem') FG.renderCamada();
      }
      if (ligada(rec) && pendente(rec) && !rec.nuvem.conflito && !N.erro) agendar(rec, 600);
      return resultado;
    }
    function aoSalvar(rec, motivoLocal) {
      if (!ligada(rec)) return;
      if (motivoLocal) N.motivos.set(rec.id, String(motivoLocal).toLowerCase().slice(0, 80));
      agendar(rec, motivoLocal ? 300 : ESPERA);
    }

    /* ---------------------------------------------------------------- sincronizar */
    function desligar(rec, aviso) {
      if (rec.nuvem) ignorar(rec.nuvem.dono, rec.nuvem.pid, true);
      delete rec.nuvem;
      FG.dbPut(rec);
      if (aviso) toast(aviso);
    }
    async function garantirAtualVisivel() {
      if (S.rec && !visivel(S.rec)) {
        const v = FG.listaVisivel();
        if (v[0]) await FG.abrir(v[0].id, true);
        else { S.M = null; S.rec = null; S.atual = null; S.drawer = null; }
      }
    }
    function sincronizar(forcar) {
      if (!S.dados) return Promise.resolve();
      if (N.sincronizando) return N.sincronizando;
      if (!forcar && Date.now() - N.ultimaSync < 20000) return Promise.resolve();
      const c = conta();
      if (!c) { N.lista = null; return Promise.resolve(); }
      N.sincronizando = (async () => {
        let mudou = false;
        try {
          const { data, error } = await c.sb.from('personagens').select(COLS).eq('jogador_id', c.uid).is('excluido_em', null).order('criado_em', { ascending: true });
          if (error) throw error;
          N.lista = data || [];
          N.erro = null;
          N.ultimaSync = Date.now();
          for (const rec of S.lista.filter(r => r.nuvem?.dono === c.uid)) {
            const p = N.lista.find(x => x.id === rec.nuvem.pid);
            if (!p) { desligar(rec, `${rec.nome} não está mais na sua conta. A ficha ficou só neste navegador.`); mudou = true; continue; }
            if (p.ficha_revisao !== rec.nuvem.rev) {
              if (!p.ficha_salva_em) { desligar(rec, `A ficha de ${rec.nome} foi tirada da conta em outro aparelho. Aqui ela ficou só neste navegador.`); mudou = true; continue; }
              if (rec.nuvem.conflito || pendente(rec) || (S.rec === rec && S.salvando)) {
                rec.nuvem.conflito = { rev: p.ficha_revisao, em: p.ficha_salva_em };
                await FG.dbPut(rec);
              } else if (await atualizarPelaConta(c, rec)) toast(`${rec.nome} atualizado com a versão da conta.`);
              mudou = true;
              continue;
            }
            if (pendente(rec) && !rec.nuvem.conflito) agendar(rec, 300);
          }
          const ign = ignorados(c.uid);
          for (const p of N.lista) {
            if (!p.ficha_salva_em || ign.includes(p.id) || S.lista.some(r => r.nuvem?.dono === c.uid && r.nuvem.pid === p.id)) continue;
            const rec = await baixarNova(c, p);
            toast(`${rec.nome} veio da sua conta.`);
            mudou = true;
          }
        } catch (e) {
          if (semAtualizacao(e)) desativar(e);
          else { N.erro = msg(e); console.warn('[Ficha] sincronização', e); }
        } finally {
          N.sincronizando = null;
        }
        await garantirAtualVisivel();
        if (mudou) FG.renderAgora(); else FG.marcarSalvo();
        if (S.drawer?.tipo === 'nuvem') FG.renderCamada();
      })();
      return N.sincronizando;
    }

    /* ---------------------------------------------------------------- excluir */
    async function confirmarExclusao(rec) {
      const v = await FG.dialogo({
        titulo: 'Excluir esta ficha?',
        texto: `${rec.nome} está guardada na sua conta. Excluir só deste navegador (continua na conta e nos outros aparelhos) ou também da conta? Na conta, a ficha excluída fica nas versões por segurança.`,
        botoes: [{ texto: 'Cancelar', v: null }, { texto: 'Só deste navegador', v: 'local' }, { texto: 'Também da conta', v: 'conta', perigo: true }]
      });
      if (v === 'local') { ignorar(rec.nuvem.dono, rec.nuvem.pid, true); return 'local'; }
      if (v !== 'conta') return null;
      try {
        const c = conta();
        const { data: r, error } = await c.sb.rpc('salvar_ficha', { personagem: rec.nuvem.pid, ficha: {}, revisao_base: rec.nuvem.rev, motivo: 'ficha excluída' });
        if (error) throw error;
        if (!r?.ok) { toast('A ficha mudou em outro aparelho. Sincronize antes de excluir da conta.'); return null; }
        const p = N.lista?.find(x => x.id === rec.nuvem.pid);
        if (p) { p.ficha_revisao = r.revisao; p.ficha_salva_em = null; }
        return 'conta';
      } catch (e) { toast(msg(e)); return null; }
    }

    /* ---------------------------------------------------------------- versões na conta */
    async function versoes(rec) {
      const c = conta();
      if (!c || !ligada(rec)) return [];
      const { data, error } = await c.sb.from('fichas_versoes').select('id,revisao,motivo,salva_em,criada_em').eq('personagem_id', rec.nuvem.pid).order('id', { ascending: false }).limit(20);
      if (error) throw new Error(msg(error));
      return data || [];
    }
    acoes['restaurar-versao-conta'] = async el => {
      const c = conta();
      const rec = S.rec;
      if (!c || !ligada(rec)) return;
      const v = (S.drawer?.conta || []).find(x => String(x.id) === el.dataset.id);
      if (!v) return;
      const ok = await FG.confirmar('Restaurar esta versão da conta?', `A ficha volta ao estado de ${v.salva_em ? dataHora(v.salva_em) : 'antes'}. A versão atual fica guardada aqui e na conta.`, 'Restaurar');
      if (!ok) return;
      try {
        const { data, error } = await c.sb.from('fichas_versoes').select('dados').eq('id', v.id).single();
        if (error) throw error;
        await FG.substituirFicha(rec, await daConta(c, data.dados), 'Antes de restaurar uma versão da conta');
        S.drawer = null;
        FG.renderAgora();
        toast('Versão restaurada. Ela vai para a conta em instantes.');
      } catch (e) { toast(msg(e)); }
    };

    /* ---------------------------------------------------------------- gaveta "Ficha na conta" */
    const linhagemDe = s => s?.lineage?.type === 'compound' ? 'legado' : 'prole';
    function faltando() {
      const c = conta();
      if (!c || !N.lista) return 0;
      return N.lista.filter(p => p.ficha_salva_em && !S.lista.some(r => r.nuvem?.dono === c.uid && r.nuvem.pid === p.id)).length;
    }
    FG.gavetas = FG.gavetas || {};
    FG.gavetas.nuvem = () => {
      const fechar = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="fg-kicker">Conta</span><button class="fg-btn fg-btn--sm fg-btn--icon" type="button" data-a="fechar-gaveta" aria-label="Fechar">${ICO.close}</button></div><h3>Ficha na conta</h3>`;
      const c = conta();
      if (!c) return `<div class="fg-drawer-body">${fechar}<p class="fg-muted">${esc(N.indisponivel || 'Entre com a conta do Discord da Duodécima para guardar a ficha na conta.')}</p></div>`;
      const rec = S.rec;
      const partes = [];
      if (N.erro) partes.push(`<div class="fg-note fg-note--warn">${esc(N.erro)}</div>`);
      if (rec && ligada(rec)) {
        const p = N.lista?.find(x => x.id === rec.nuvem.pid);
        if (rec.nuvem.conflito) {
          partes.push(`<div class="fg-box fg-nuvem-conflito">
            <b>Esta ficha mudou em outro aparelho</b>
            <p class="fg-muted">A conta recebeu outra versão em ${esc(dataHora(rec.nuvem.conflito.em))}, enquanto este aparelho tinha mudanças que ainda não tinham subido. Escolha qual fica: a outra é guardada nas versões.</p>
            <div class="fg-actions"><button class="fg-btn fg-btn--pri" type="button" data-a="nuvem-manter-local">Manter a deste aparelho</button><button class="fg-btn" type="button" data-a="nuvem-manter-conta">Usar a da conta</button></div>
          </div>`);
        }
        partes.push(`<div class="fg-rows"><div class="fg-row"><div class="fg-row-main"><b>${esc(p?.nome || rec.nome)}</b><small>${pendente(rec) ? 'Mudanças ainda não enviadas' : 'Em dia com a conta'}${rec.nuvem.em ? ' · última vez ' + esc(dataHora(rec.nuvem.em)) : ''}</small></div></div></div>
          <div class="fg-actions">
            ${pendente(rec) && !rec.nuvem.conflito ? '<button class="fg-btn fg-btn--pri" type="button" data-a="nuvem-enviar">Enviar agora</button>' : ''}
            <button class="fg-btn" type="button" data-a="nuvem-atualizar">Conferir a conta</button>
            <button class="fg-btn" type="button" data-a="versoes">Versões</button>
            <button class="fg-btn fg-btn--ghost" type="button" data-a="nuvem-desligar">Parar de sincronizar</button>
          </div>`);
      } else if (rec) {
        const s = rec.data || {};
        const deus = s.originType === 'mortal' ? '' : (s.godId || '');
        const nomeDeus = deus ? (FG.godDe(deus)?.name || deus) : '';
        const livres = (N.lista || []).filter(p => !S.lista.some(r => r !== rec && r.nuvem?.dono === c.uid && r.nuvem.pid === p.id));
        partes.push(`<p class="fg-muted"><b>${esc(rec.nome)}</b> está só neste navegador. Guardada na conta, a ficha abre em qualquer aparelho em que você entrar com o Discord, e só você e a Staff conseguem vê-la.</p>`);
        partes.push(`<div class="fg-sec-head"><b class="fg-label">Usar um personagem da sua conta</b></div>
          <div class="fg-rows">${N.lista === null ? '<p class="fg-empty-line">Consultando a conta…</p>' : livres.map(p => `<div class="fg-row"><div class="fg-row-main"><b>${esc(p.nome)}</b><small>${p.ficha_salva_em ? 'já tem ficha na conta (' + esc(dataHora(p.ficha_salva_em)) + ')' : 'sem ficha na conta'}</small></div><button class="fg-btn fg-btn--sm${p.ficha_salva_em ? '' : ' fg-btn--pri'}" type="button" data-a="nuvem-ligar" data-id="${esc(p.id)}">${p.ficha_salva_em ? 'Substituir' : 'Guardar aqui'}</button></div>`).join('') || '<p class="fg-empty-line">Nenhum personagem livre na conta.</p>'}</div>`);
        partes.push(`<div class="fg-sec-head"><b class="fg-label">Ou cadastrar na conta</b></div>
          <div class="fg-form" data-nuvem-form>
            <label class="fg-field fg-wide"><span>Nome</span><input name="nome" maxlength="80" value="${esc(s.name || rec.nome || '')}"></label>
            <label class="fg-field"><span>Linhagem</span><select name="linhagem"><option value="prole"${linhagemDe(s) === 'prole' ? ' selected' : ''}>Prole divina</option><option value="legado"${linhagemDe(s) === 'legado' ? ' selected' : ''}>Legado</option></select></label>
            <label class="fg-field"><span>Panteão</span><select name="panteao"><option value="romano">Romano</option><option value="grego">Grego</option><option value="celta">Celta</option><option value="nordico">Nórdico</option><option value="egipcio">Egípcio</option><option value="outro">Outro</option></select></label>
            <label class="fg-field fg-wide"><span>Divindade</span><select name="divindade">${deus ? `<option value="${esc(deus)}" selected>${esc(nomeDeus)} (da ficha)</option>` : ''}<option value="">Ainda não reclamado</option></select></label>
            <label class="fg-check fg-wide"><input type="checkbox" name="publico" checked> Aparece na Tabula Famae</label>
          </div>
          <p class="fg-muted" style="font-size:12.5px">Gregos começam com −10 de fama e celtas com −15; filhos de Iuppiter, Bellona e Marte Ultor recebem +15. Depois de cadastrar, linhagem, panteão e divindade só mudam com a Staff.</p>
          <div class="fg-actions"><button class="fg-btn fg-btn--pri" type="button" data-a="nuvem-cadastrar">Cadastrar e guardar a ficha</button></div>`);
      }
      const fora = (N.lista || []).filter(p => p.ficha_salva_em && !S.lista.some(r => r.nuvem?.dono === c.uid && r.nuvem.pid === p.id));
      if (fora.length) partes.push(`<div class="fg-sec-head"><b class="fg-label">Na conta, mas não neste navegador</b></div>
        <div class="fg-rows">${fora.map(p => `<div class="fg-row"><div class="fg-row-main"><b>${esc(p.nome)}</b><small>ficha de ${esc(dataHora(p.ficha_salva_em))}</small></div><button class="fg-btn fg-btn--sm" type="button" data-a="nuvem-baixar" data-id="${esc(p.id)}">Baixar</button></div>`).join('')}</div>`);
      return `<div class="fg-drawer-body">${fechar}${partes.join('')}</div>`;
    };

    const ocupado = async (el, fn) => {
      if (el) el.disabled = true;
      try { await fn(); } catch (e) { if (semAtualizacao(e)) desativar(e); else toast(msg(e)); }
      finally { if (el) el.disabled = false; FG.renderAgora(); if (S.drawer?.tipo === 'nuvem') FG.renderCamada(); }
    };
    acoes.nuvem = () => {
      S.menu = false;
      FG.renderAgora();
      FG.abrirGaveta('nuvem');
      sincronizar(true);
    };
    acoes['nuvem-ligar'] = el => ocupado(el, async () => {
      const c = conta(), rec = S.rec;
      const p = N.lista?.find(x => x.id === el.dataset.id);
      if (!c || !rec || !p) return;
      if (p.ficha_salva_em && !(await FG.confirmar('Substituir a ficha da conta?', `${p.nome} já tem uma ficha na conta. Ela vai para as versões da conta e esta ficha toma o lugar dela.`, 'Substituir', true))) return;
      await ligar(c, rec, p, p.ficha_salva_em ? 'substituída por outra ficha' : null);
    });
    async function ligar(c, rec, p, motivo) {
      ignorar(c.uid, p.id, false);
      rec.nuvem = { pid: p.id, dono: c.uid, rev: p.ficha_revisao, em: p.ficha_salva_em, enviado: '' };
      await FG.dbPut(rec);
      const r = await enviar(rec, { forcar: true, motivo });
      if (r?.ok) toast(`${rec.nome} guardado na conta.`);
      else if (!r && N.erro) toast(N.erro);
    }
    acoes['nuvem-cadastrar'] = el => ocupado(el, async () => {
      const c = conta(), rec = S.rec;
      const f = layerForm();
      if (!c || !rec || !f) return;
      const nome = String(f.nome || '').trim();
      if (!nome) { toast('Dê um nome ao personagem.'); return; }
      const row = { jogador_id: c.uid, nome, linhagem: f.linhagem || 'prole', panteao: f.panteao || 'romano', divindade: f.divindade || null, publico: !!f.publico };
      const { data: p, error } = await c.sb.from('personagens').insert(row).select(COLS).single();
      if (error) throw error;
      N.lista = [...(N.lista || []), p];
      await ligar(c, rec, p, null);
      P.online?.recarregarMeus?.();
    });
    function layerForm() {
      const box = document.querySelector('.os-ficha .fg-layer [data-nuvem-form]');
      if (!box) return null;
      const out = {};
      box.querySelectorAll('input,select').forEach(i => { out[i.name] = i.type === 'checkbox' ? i.checked : i.value; });
      return out;
    }
    acoes['nuvem-enviar'] = el => ocupado(el, async () => { await enviar(S.rec, { forcar: true }); });
    acoes['nuvem-atualizar'] = el => ocupado(el, () => sincronizar(true));
    acoes['nuvem-desligar'] = el => ocupado(el, async () => {
      const rec = S.rec;
      if (!ligada(rec)) return;
      if (!(await FG.confirmar('Parar de sincronizar?', `${rec.nome} continua neste navegador e na conta, mas as mudanças daqui deixam de subir. Dá para voltar a qualquer momento em "Ficha na conta".`, 'Parar'))) return;
      desligar(rec);
      toast('Sincronização desligada para esta ficha.');
    });
    acoes['nuvem-baixar'] = el => ocupado(el, async () => {
      const c = conta();
      const p = N.lista?.find(x => x.id === el.dataset.id);
      if (!c || !p) return;
      ignorar(c.uid, p.id, false);
      const rec = await baixarNova(c, p);
      await FG.abrir(rec.id, true);
      S.drawer = null;
      toast(`${rec.nome} veio da sua conta.`);
    });
    acoes['nuvem-manter-local'] = el => ocupado(el, async () => {
      const rec = S.rec;
      if (!ligada(rec) || !rec.nuvem.conflito) return;
      const r = await enviar(rec, { base: rec.nuvem.conflito.rev, motivo: 'conflito entre aparelhos' });
      if (r?.ok) toast('Ficha deste aparelho mantida. A outra ficou nas versões da conta.');
    });
    acoes['nuvem-manter-conta'] = el => ocupado(el, async () => {
      const c = conta(), rec = S.rec;
      if (!c || !ligada(rec)) return;
      await atualizarPelaConta(c, rec, true);
      toast('Ficha atualizada com a versão da conta. A deste aparelho ficou em Versões salvas.');
    });

    /* ---------------------------------------------------------------- selo */
    function rotulo(rec, salvando) {
      if (!conta() || !rec) return null;
      if (!ligada(rec)) return { texto: 'Só neste navegador', classe: 'is-local', dica: 'Toque para guardar na conta e abrir em outros aparelhos.' };
      if (rec.nuvem.conflito) return { texto: 'Conflito: escolha a versão', classe: 'is-bad', dica: 'A ficha mudou em outro aparelho.' };
      if (salvando || N.enviando.has(rec.id)) return { texto: 'Enviando para a conta…', classe: 'is-saving' };
      if (pendente(rec)) return N.erro ? { texto: 'Ainda não subiu', classe: 'is-warn', dica: N.erro } : { texto: 'Enviando para a conta…', classe: 'is-saving' };
      return { texto: 'Salva na conta', classe: 'is-ok', dica: rec.nuvem.em ? 'Última vez: ' + dataHora(rec.nuvem.em) : '' };
    }

    /* ---------------------------------------------------------------- ganchos */
    FG.nuvem = {
      ativa: () => !!conta(),
      visivel, ligada, rotulo, aoSalvar, sincronizar, versoes, confirmarExclusao, faltando,
      uid: () => estado()?.session?.user?.id || null,
      cliente: () => conta(),
      // Staff: lê a ficha de outro jogador (o banco só deixa a Staff ler fichas alheias).
      lerFichaDaConta: async pid => { const c = conta(); if (!c) throw new Error('Entre com a conta para abrir a ficha.'); return (await lerFicha(c, pid)).dados; },
      _estado: N
    };
    // A conta mudou (entrou, saiu, virou membro): reconfere tudo.
    window.addEventListener('duodecima:conta', async () => {
      const st = estado();
      const chave = `${st?.session?.user?.id || ''}|${st?.conta?.membro ? 1 : 0}`;
      if (chave === N.chave) return;
      N.chave = chave;
      N.lista = null; N.ultimaSync = 0; N.erro = null;
      if (!S.dados) return;
      await garantirAtualVisivel();
      FG.renderAgora();
      sincronizar(true);
    });
    // Voltou para a aba ou a conexão voltou: confere a conta e envia o que ficou pendente.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && P.api.WM?.isOpen?.('ficha')) sincronizar(); });
    window.addEventListener('online', () => { N.erro = null; sincronizar(true); });
    window.addEventListener('pagehide', () => { if (S.rec && pendente(S.rec)) enviar(S.rec); });
  }

  if (window.FichaGuia) iniciar();
  else window.addEventListener('fichaguia:pronta', iniciar, { once: true });
})();
