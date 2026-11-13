(function install(){
  'use strict';
  const content=document.querySelector('#content');
  if(!content)return;
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const heading=(root,re)=>[...root.querySelectorAll('h1,h2,h3,h4')].find(h=>re.test(norm(h.textContent)));
  const section=(root,re)=>heading(root,re)?.closest('.section,section')||null;
  const elementWithTitle=(root,re)=>[...root.querySelectorAll('h3,h4,strong')].find(el=>re.test(norm(el.textContent)));
  const plotHTML=`
  <div class="section-head"><div><small>ROMA · ACONTECIMENTOS RECENTES</small><h2>A situação atual de Roma</h2></div></div>
  <div class="duo-plot-introduction">
    <p>Roma passou por uma sequência de crises que, à primeira vista, pareciam desconectadas. Ataques atribuídos aos celtas, corpos movimentados por musgo, água ácida surgindo em lugares improváveis, criaturas funcionando como cascas e sinais de uma presença ligada ao afogamento começaram a formar um quadro maior. Com o tempo, ficou claro que parte desses acontecimentos se cruzava em torno de uma mesma figura: <strong>Morcan Glass</strong>.</p>
  </div>
  <div class="duo-plot-overview">
    <article class="duo-story">
      <small>01 · IDENTIDADE</small><h3>Quem é Morcan Glass?</h3>
      <p>Morcan Glass, também chamado de <strong>Rei Submerso</strong>, é uma figura antiga ligada à história de Roma e dos celtas. Registros indicam que ele pertenceu à <strong>Segunda Coorte</strong> nos primeiros tempos da Legião, antes de se tornar perigoso demais para continuar livre. Seu poder cresceu a ponto de preocupar romanos e celtas, que acabaram participando juntos de sua contenção. Associado à água, ao afogamento e ao controle de corpos, Morcan Glass parece agir por influência, ocupação e presença, mais do que por uma magia simples ou facilmente identificável.</p>
    </article>
    <article class="duo-story">
      <small>02 · INVESTIGAÇÕES</small><h3>O que Roma já sabe?</h3>
      <p>Até agora, Roma sabe que houve tentativas de colocar <strong>romanos e celtas uns contra os outros</strong>, e que nem todos os grupos celtas encontrados respondem à mesma liderança. Sabe também que alguns “mortos-vivos” vistos em missões recentes não eram reanimações comuns, mas estruturas utilizadas por <strong>musgo</strong>. Esse mesmo padrão apareceu em outras criaturas, inclusive em corpos que pareciam servir apenas de casca para algo maior. Também já foi identificado que manifestações ligadas à água e ao afogamento vêm se repetindo em diferentes contextos, reforçando a ligação com Morcan Glass.</p>
    </article>
  </div>
  <div class="duo-plot-status">
    <div><h3>O que foi confirmado</h3><ul>
      <li>Houve ataques e represálias entre Roma e grupos celtas, mas parte do conflito foi provocada por uma força externa.</li>
      <li>O musgo encontrado em algumas missões não age como necromancia comum.</li>
      <li>Certas criaturas e corpos parecem estar sendo usados como recipiente ou estrutura.</li>
      <li>Morcan Glass está ligado a manifestações de água, afogamento e influência sobre outros corpos.</li>
      <li>Roma e os celtas possuem, ao menos em parte, um inimigo em comum.</li>
    </ul></div>
    <div><h3>O que permanece em aberto</h3><ul>
      <li>Até que ponto todos esses acontecimentos fazem parte de um único plano.</li>
      <li>Qual é exatamente o alcance do poder de Morcan Glass.</li>
      <li>Quantas outras forças, além dele, podem estar agindo ao mesmo tempo.</li>
    </ul></div>
  </div>`;
  const passageHTML=`
    <div class="duo-passage-head"><small>TRAVESSIA · TRÊS ETAPAS</small><h3>Da reserva ao território romano</h3></div>
    <div class="duo-passage-steps">
      <div class="duo-passage-step"><span aria-hidden="true">I</span><h4>Estação abandonada de Nazzano</h4><p>A chegada começa pela antiga estação. A guarda identifica os recém-chegados, verifica a entrada e acompanha a passagem para o Pequeno Tibre.</p></div>
      <div class="duo-passage-step"><span aria-hidden="true">II</span><h4>Pequeno Tibre</h4><p>O rio funciona como fronteira mágica. Ao atravessá-lo, efeitos externos que não pertencem ao cenário são anulados.</p></div>
      <div class="duo-passage-step"><span aria-hidden="true">III</span><h4>Território romano</h4><p>A partir daí, aplicam-se as regras do Acampamento Júpiter, assim como as consequências por descumpri-las.</p></div>
    </div>
    <div class="duo-passage-note"><strong>História pode atravessar. Mecânica, não automaticamente.</strong><p>Personagens adaptados de outros servidores podem manter suas histórias, mas entram mecanicamente zerados de bônus, maldições, vantagens e itens externos. Algo indispensável à identidade do personagem deve ser adaptado às regras atuais e aprovado pela Staff.</p></div>`;
  function plotPatch(root){
    if(root.querySelector('#situacao-atual-roma'))return;
    const direct=[...root.querySelectorAll(':scope > .section,:scope > section')];
    const targets=direct.filter(s=>{
      const h=s.querySelector(':scope > .section-head h2,:scope > header h2');
      return s.querySelector('.plot-thread,.plot-panorama,.plot-pieces')||
        /^(fio da trama|sobre a trama|onde estamos agora|os celtas)$/.test(norm(h?.textContent))||
        [...s.querySelectorAll('h2,h3')].some(el=>/^(os celtas|onde estamos agora)$/.test(norm(el.textContent)));
    });
    const fallback=section(root,/^os celtas$|^onde estamos agora$/);
    if(!targets.length&&fallback&&fallback!==root)targets.push(fallback);
    const newSection=document.createElement('section');
    newSection.id='situacao-atual-roma';
    newSection.className='section searchable duo-plot-summary';
    newSection.dataset.title='A situação atual de Roma';
    newSection.innerHTML=plotHTML;
    if(targets.length){targets[0].before(newSection);targets.forEach(s=>s.remove())}
    else {const arrival=section(root,/chegando a roma/);arrival?arrival.before(newSection):root.append(newSection)}
    const old=root.querySelector('#nazzano-atualizacao');
    if(old)old.querySelectorAll('p').forEach(p=>{if(/morcan glass.*aparentemente morto|morcan glass.*morte/i.test(norm(p.textContent)))p.remove()});
    const hero=root.querySelector('.guide-page-hero-tags');
    if(hero)hero.querySelectorAll('span').forEach(s=>{if(/fio da trama/i.test(s.textContent))s.textContent='Situação atual'});
  }
  function arrivalPatch(root){
    const arrival=section(root,/chegando a roma/);
    const gateway=arrival?.querySelector('.oct26-gateway');
    if(!arrival||!gateway)return;
    if(!gateway.querySelector('.duo-gateway-visual')){
      const copy=document.createElement('div');copy.className='duo-gateway-copy';
      while(gateway.firstChild)copy.append(gateway.firstChild);
      gateway.append(copy);
      const art=document.createElement('figure');art.className='duo-gateway-visual';
      art.innerHTML='<img src="assets/visual/sobre-nova-roma.webp" alt="Arte panorâmica de Nova Roma" loading="lazy" decoding="async" width="1400" height="300"><figcaption class="duo-gateway-facts"><small>NAZZANO · LÁCIO</small><strong>Uma fronteira entre dois mundos</strong><p>A ponte do Antigo Tibre marca a entrada reconhecida para o acampamento. A reserva natural continua visível aos mortais, enquanto a cidade protegida só se revela depois da travessia.</p><div><span>Reserva de Nazzano</span><span>Pequeno Tibre</span><span>Território romano</span></div></figcaption>';
      gateway.append(art);gateway.classList.add('duo-gateway');
    }
    const map=section(root,/mapa do acampamento|nazzano nos dois mundos/)||root.querySelector('.duo-reorganized-map');
    if(map&&!map.classList.contains('duo-reorganized-map')){
      map.classList.add('duo-reorganized-map');
      // O mapa real e a planta ficcional passam a fazer parte da mesma seção, sem apresentação duplicada.
      const real=map.querySelector('.oct26-real-map');
      const panel=map.querySelector('.camp-map-panel,.map-panel');
      if(real&&panel){
        real.querySelector('.oct26-map-head--fantasy')?.remove();
        const head=real.querySelector('.oct26-map-head');
        if(head)head.innerHTML='<small>GEOGRAFIA REAL</small><h3>Reserva de Nazzano</h3>';
        const grid=document.createElement('div');grid.className='duo-map-grid';
        const world=document.createElement('div');world.className='duo-map-tile duo-map-world';world.append(real);
        const camp=document.createElement('div');camp.className='duo-map-tile duo-map-camp';
        const campTitle=document.createElement('div');campTitle.className='oct26-map-head';
        campTitle.innerHTML='<small>MAPA NARRATIVO</small><h3>Além da ponte do Tibre</h3>';
        camp.append(campTitle,panel);
        const note=map.querySelector('.map-note');if(note)camp.append(note);
        grid.append(world,camp);
        const sectionHead=map.querySelector('.section-head');
        sectionHead?sectionHead.after(grid):map.prepend(grid);
      }
      const hdr=map.querySelector(':scope > .section-head h2');
      if(hdr)hdr.textContent='Nazzano nos dois mundos';
    }
    if(!root.querySelector('.duo-passage-panel')){
      const passage=document.createElement('div');passage.className='duo-passage-panel';
      passage.innerHTML=passageHTML;
      const names=[/^estacao abandonada de nazzano$/, /^pequeno tibre$/, /^territorio romano$/];
      const candidates=[];
      for(const re of names){
        const title=elementWithTitle(arrival,re);
        let card=title?.closest('article,.card,.paper-card,.journey-step,.arrival-card');
        if(card&&card!==gateway&&!candidates.includes(card))candidates.push(card);
      }
      const notice=elementWithTitle(arrival,/historia pode atravessar/);
      let note=notice?.closest('article,.card,.paper-card,.journey-note,.arrival-note');
      if(note&&note!==gateway&&!candidates.includes(note))candidates.push(note);
      const parents=new Set(candidates.map(c=>c.parentElement));
      const parent=parents.size===1?[...parents][0]:null;
      for(const c of candidates)c.remove();
      if(parent&&parent!==arrival&&parent!==gateway&&!parent.children.length)parent.remove();
      const info=root.querySelector('.oct26-castra-note');
      if(info){const small=document.createElement('p');small.className='duo-map-organization';small.innerHTML=info.innerHTML;passage.append(small);info.remove()}
      if(map&&map.isConnected){map.after(passage)}
      else {gateway.after(passage)}
    }
    if(map&&map.parentElement===root){arrival.after(map)}
    if(map&&map.parentElement===arrival){gateway.after(map)}
    const passage=root.querySelector('.duo-passage-panel');
    if(map&&passage&&passage.previousElementSibling!==map)map.after(passage);
  }
  function lupaPatch(root){
    if(root.querySelector('.duo-lupa-layout'))return;
    const lengthTitle=elementWithTitle(root,/^quanto tempo dura\??$/);
    const afterTitle=elementWithTitle(root,/depois de lupa,? voce sabe/);
    if(!lengthTitle||!afterTitle)return;
    function block(el){
      const ancestor=el.closest('article,.paper-card,.lupa-card,.journey-card,.card,.feature,.info-card');
      return ancestor||el.parentElement;
    }
    const left=block(lengthTitle),right=block(afterTitle);
    if(!left||!right||left===right||left.contains(right)||right.contains(left))return;
    const wrapper=document.createElement('div');wrapper.className='duo-lupa-layout';
    left.before(wrapper);wrapper.append(left,right);
    left.classList.add('duo-lupa-card');right.classList.add('duo-lupa-card');
    left.querySelectorAll('strong,b').forEach(el=>{
      if(!/^(?:[1-3][–-][2-4]\s*(?:semanas?|meses?))/.test(norm(el.textContent)))return;
      const next=el.nextSibling;
      if(next?.nodeType===3&&!/^\s/.test(next.nodeValue||''))next.nodeValue=' — '+next.nodeValue;
    });
  }
  function rulesPatch(root){
    const work=[...root.querySelectorAll('.camp-rule-grid article,article,.card')].find(el=>/^(trabalho)$/i.test(norm(el.querySelector('h3,h4')?.textContent))&&/periodo de trabalho/i.test(norm(el.textContent)));
    const exit=[...root.querySelectorAll('.camp-rule-grid article,article,.card')].find(el=>/sair do acampamento/i.test(norm(el.querySelector('h3,h4')?.textContent)));
    if(work){const p=work.querySelector('p');if(p)p.innerHTML='O período de trabalho costuma acontecer das <strong>06h às 18h</strong>, com pausa para almoço. Legionários têm folga nos fins de semana; <em>probatii</em> descansam apenas aos domingos.'}
    if(exit){const p=exit.querySelector('p');if(p)p.innerHTML='Saídas do território romano exigem autorização da <em>Praetoria</em>. Durante as folgas, legionários podem solicitar viagens a <strong>Roma</strong> — a cerca de 30 minutos de trem da estação de <strong>Poggio Mirteto Scalo</strong> — ou a outras regiões da Itália. As viagens não podem ocorrer no horário de trabalho nem prejudicar as obrigações com a Legião.'}
  }

  function domusTeaserPatch(root){
    const gallery=root.querySelector('#quadros-rebento');
    if(gallery)gallery.remove();
    const old=root.querySelector('#domus-memoriae');
    if(old?.classList.contains('duo-domus-invite'))return;
    const promo=document.createElement('section');
    promo.id='domus-memoriae';
    promo.className='section searchable duo-domus-invite';
    promo.dataset.title='Domus Memoriae';
    promo.innerHTML='<div class="section-head"><div><small>MEMÓRIA · ROMA</small><h2>Domus Memoriae</h2></div></div><div class="duo-domus-invite-content"><div><p>A Domus Memoriae preserva a história daqueles que dedicaram suas vidas à Legião e conquistaram o descanso em honra. Seus quadros recordam não apenas grandes feitos, mas também as pessoas que ajudaram a construir a Roma de hoje.</p><p>Conheça os rebentos da primeira geração e as trajetórias que permanecem entre nós.</p></div><a class="duo-domus-link" href="#page:domus">Conhecer os rebentos de Roma <span aria-hidden="true">↗</span></a></div>';
    if(old)old.replaceWith(promo);
    else {
      const collective=root.querySelector('#memorial-retorno');
      collective?collective.before(promo):root.append(promo);
    }
  }
  function apply(root){
    if(!root?.classList?.contains('page-roma'))return;
    plotPatch(root);
    root.querySelectorAll('.guide-page-hero-tags span').forEach(tag=>{if(/fio da trama/i.test(tag.textContent))tag.textContent='Situação atual'});
    arrivalPatch(root);
    lupaPatch(root);
    rulesPatch(root);
    domusTeaserPatch(root);
  }
  function stored(){
    const page=window.GUIA_CONTENT?.roma;
    if(!page?.html)return false;
    const root=document.createElement('div');root.className='page-roma';root.innerHTML=page.html;
    apply(root);
    if(root.innerHTML!==page.html){page.html=root.innerHTML;return true}
    return false;
  }
  function visible(){
    if(content.classList.contains('page-roma'))apply(content);
  }
  let busy=false,queued=false;
  function schedule(){
    if(busy||queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;busy=true;try{visible()}finally{busy=false}});
  }
  const obs=new MutationObserver(schedule);obs.observe(content,{childList:true,subtree:false});
  window.addEventListener('popstate',schedule);
  window.addEventListener('hashchange',schedule);
  function boot(){
    const changed=stored();
    if(changed&&content.classList.contains('page-roma')){
      window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));
    }
    schedule();
  }
  boot();
  setTimeout(boot,1500);
  const deps=[window.DUODECIMA_CORE_READY,window.DUODECIMA_GUIDE_STABILIZATION_READY,window.DUODECIMA_GUIDE_RULES_READY].filter(Boolean);
  if(deps.length)Promise.allSettled(deps).then(boot);
})();
