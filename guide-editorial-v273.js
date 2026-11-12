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
      art.innerHTML='<img src="assets/visual/sobre-nova-roma.webp" alt="Arte de Nova Roma, representando o território protegido da Legião" loading="lazy" decoding="async">';
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
  function rebentoPatch(root){
  let section=root.querySelector('#quadros-rebento');
  if(!section){
    section=document.createElement('section');
    section.id='quadros-rebento';
    section.className='section searchable duo-rebento-section';
    section.dataset.title='Quadros de Rebento';
    root.append(section);
  }
  if(!section.querySelector('.rebento-gallery')){
    const entries=[
      {
        image:'assets/rebentos/01-cerise-cassius.webp',
        alt:'Quadro comemorativo de Cerise M. Augustus e Cassius C. Augustus, com Wren, a raposa, à esquerda',
        variant:'wide',
        people:[
          {
            name:'Cerise M. Augustus',
            text:'Cerise, filha de Vênus e Milo Bow, tornou-se a primeira centuriã do Acampamento Júpiter desde a Guerra dos Oceanus. Diplomata presente em grande parte dos tratados de sua geração, participou da recuperação das áquilas de Vênus e Arcus, da expedição à Forja de Prometheus e do enfrentamento do Régulo. Por muitos anos, foi a principal boticária da Legião, e suas receitas permanecem no laboratório. Sua raposa Wren tornou-se uma presença querida de Roma. Após deixar a carreira militar, assumiu uma cadeira no Senado e casou-se com Cassius Caesar Augustus.'
          },
          {
            name:'Cassius C. Augustus',
            text:'Descendente da família patrícia Augustus, Cassius fez da forja uma das bases da defesa de Roma. Por anos, produziu grande parte das armas e armaduras da Legião; na Forja de Prometheus, trabalhou o ouro imperial recuperado em expedição. Resgatou sozinho a áquila de Angerona, recuperou com Cyrus a cabeça da estátua de Summanus e participou do enfrentamento do Régulo de Nazzano. Investigou o atentado ao Senado que matou seu avô. Aposentado da atividade militar, permanece entre os grandes nomes da história romana.'
          }
        ]
      },
      {
        image:'assets/rebentos/02-celeste-caelus.webp',
        alt:'Quadro comemorativo de Celeste Cavalcanti e Caelus Severus, ladeados por uma moldura com inscrições da Quinta Coorte',
        variant:'portrait',
        people:[
          {
            name:'Celeste Cavalcanti',
            text:'Celeste assumiu uma V Coorte desacreditada e ajudou a devolvê-la à posição de honra na Legião. Foi combatente de linha de frente nas expedições das áquilas de Vênus e Fortuna, na Forja de Prometheus e no confronto com o Régulo. Durante o serviço na Exploratio, recebeu de Bellona a profecia de que Nova Roma deveria retornar à Itália. Seu legado é a coragem demonstrada em batalha e a confiança restaurada na coorte que comandou.'
          },
          {
            name:'Caelus Severus',
            text:'Anteriormente conhecido como Takeshi Sakai, Caelus desobedeceu uma determinação de Júpiter durante a recuperação da áquila de Justitia e iniciou uma jornada de penitência e devoção. Participou da recuperação da áquila de Fortuna e da expedição à Forja de Prometheus. Em uma provação divina, enfrentou Diocleciano e matou Aquele que Devorou o Céu, libertando a tempestade aprisionada de Júpiter. Também enfrentou o Régulo antes da instalação da Legião em Nazzano.'
          }
        ]
      },
      {
        image:'assets/rebentos/03-cyrus.webp',
        alt:'Quadro individual de Cyrus Aurelius com moldura cerimonial e inscrição da Segunda Coorte',
        variant:'solo',
        people:[
          {
            name:'Cyrus Aurelius',
            text:'Natural do Chile, Cyrus Torres Aurelius chegou com Cerise e Cenric e tornou-se referência da II Coorte em discrição e infiltração. Recuperou as áquilas de Vênus e Justitia, sendo reclamado por Summanus durante a segunda expedição. Ao lado de Cassius, recuperou a cabeça perdida da estátua de seu pai. Infiltrou-se entre vampiros para auxiliar negociações diplomáticas, participou da expedição à Forja de Prometheus e enfrentou o Régulo de Nazzano. É atualmente um dos três pretores de Roma.'
          }
        ]
      }
    ];
    const escText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const cards=entries.map((entry,i)=>{
      const bios=entry.people.map(person=>`<div class="rebento-bio"><h3>${escText(person.name)}</h3><p>${escText(person.text)}</p></div>`).join('');
      return `<article class="rebento-item rebento-item--${entry.variant}" aria-label="Quadro de Rebento ${i+1}"><figure class="rebento-figure"><img src="${entry.image}" alt="${escText(entry.alt)}" loading="lazy" decoding="async" width="${entry.variant==='wide'?1920:1087}" height="${entry.variant==='wide'?1080:1350}"></figure><div class="rebento-bio-grid">${bios}</div></article>`;
    }).join('');
    section.innerHTML=`<div class="section-head"><div><small>MEMÓRIA · LEGADO</small><h2>Quadros de Rebento</h2></div></div><p class="rebento-intro">O repouso em honra reconhece legionários cujas jornadas deixaram marcas na história de Roma. Seus quadros preservam as conquistas, os vínculos e o serviço de cada um deles.</p><div class="rebento-gallery">${cards}</div>`;
  }
  const memoria=root.querySelector('#domus-memoriae');
  if(memoria&&section.previousElementSibling!==memoria)memoria.after(section);
}
  function apply(root){
    if(!root?.classList?.contains('page-roma'))return;
    plotPatch(root);
    root.querySelectorAll('.guide-page-hero-tags span').forEach(tag=>{if(/fio da trama/i.test(tag.textContent))tag.textContent='Situação atual'});
    arrivalPatch(root);
    lupaPatch(root);
    rulesPatch(root);
    rebentoPatch(root);
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
