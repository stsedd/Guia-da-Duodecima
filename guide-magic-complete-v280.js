/* Conteúdo completo de Magia — 15/11/2026. Mantém a referência local sem depender da rede. */
(() => {
  'use strict';
  const page=window.GUIA_CONTENT&&window.GUIA_CONTENT.magia;
  if(!page)return;
  const card=(title,body)=>'<article class="arcana-rule-card"><h3>'+title+'</h3>'+body+'</article>';
  const section=(id,ordinal,title,body)=>'<section id="'+id+'" class="section arcana-rule-section searchable" data-title="'+title+'"><div class="section-head"><div><small>ARS ARCANA · '+ordinal+'</small><h2>'+title+'</h2></div></div><div class="arcana-section-body">'+body+'</div></section>';
  const grid=parts=>'<div class="arcana-grid">'+parts.join('')+'</div>';
  const p=text=>'<p>'+text+'</p>';
  const rules=[];
  rules.push(section('introducao','I','A magia e o poder divino',
    p('O sangue divino permite que semideuses realizem feitos que mortais jamais conseguiriam reproduzir. Ainda assim, habilidades herdadas de um deus e magia não são exatamente a mesma coisa.')+
    p('As habilidades divinas nascem com o semideus e manifestam os domínios, símbolos e características de sua ascendência. A magia precisa ser estudada, despertada, concedida ou aprendida por meio de grimórios, mentores, pactos, rituais, criaturas, artefatos ou missões.')+
    p('Qualquer personagem pode seguir um caminho mágico, mas isso exige dedicação e sacrifícios. <strong>Magia e habilidades divinas utilizam a mesma barra de Energia.</strong> Não existe uma segunda reserva para feitiços.')
  ));
  rules.push(section('magicos','II','Personagens mágicos',
    p('Um personagem passa a ser considerado mágico quando recebe acesso ao <strong>primeiro círculo</strong>, na criação da personagem, quando sua história permitir, ou posteriormente por missão, evento, treinamento ou recompensa.')+
    '<div class="magic-benefit-grid arcana-grid"><article><b>Primeiro círculo</b><span>Acesso a feitiços do primeiro círculo.</span></article><article><b>Três magias</b><span>Começa com três magias de primeiro círculo.</span></article><article><b>Dois truques</b><span>Dois cantrips, sem custo de Energia.</span></article><article><b>Conjuração</b><span>Escolhe Inteligência, Fé ou Carisma.</span></article><article><b>Sacrifício</b><span>Pode transformar atributos físicos em Energia.</span></article><article><b>Fragilidade</b><span>Recebe menos HP por progressão.</span></article></div>'+
    p('Quem desperta magia depois de subir alguns níveis deve recalcular sua vitalidade com a penalidade mágica em <strong>todos os aumentos de HP já recebidos</strong>.')
  ));
  rules.push(section('sacrificio','III','Sacrifício de atributos',
    p('Ao despertar magia, é possível converter <strong>Força, Destreza ou Constituição</strong> em Energia máxima. Cada ponto sacrificado dá <strong>+25 Energia máxima</strong>. Podem ser sacrificados até <strong>três pontos</strong> durante o despertar.')+
    '<div class="big-formula"><b>−1 FOR / DES / CON</b><span>equivale a</span><strong>+25 Energia máxima</strong></div>'+
    p('Os pontos podem ter vindo da distribuição inicial ou de melhorias comuns. <strong>Bônus concedidos diretamente pela divindade e bônus de Rebento não podem ser sacrificados.</strong> Um atributo físico pode ser reduzido até −1. Sacrificar Constituição exige recalcular o HP total.')+
    p('Nos níveis em que receberia um ponto de atributo, um personagem mágico também pode <strong>renunciar permanentemente ao aumento</strong> e receber +25 de Energia máxima.')
  ));
  rules.push(section('fragilidade','IV','Fragilidade mágica',
    p('Sempre que receber um aumento de HP máximo por progressão, o mágico recebe <strong>2 HP a menos</strong> do que receberia normalmente. Isso se aplica retroativamente ao despertar tardio.')+
    card('Exemplo',p('Um semideus que ganharia <strong>5 + Constituição</strong> de HP a cada 10 níveis passa a ganhar <strong>3 + Constituição</strong>. Se a prole usa outro valor de progressão, reduza o ganho final em 2.'))+
    p('Sacrifícios de Constituição podem afetar tanto o HP inicial quanto os aumentos futuros.')
  ));
  rules.push(section('conjuracao','V','Atributo de conjuração',
    p('Ao obter magia, escolha um atributo para <strong>ataques mágicos, testes de conjuração e DT das magias</strong>. A origem do poder deve justificar a escolha, que por padrão não pode ser trocada depois.')+
    grid([card('Inteligência',p('Estudo, fórmulas, runas, grimórios, pesquisa e conhecimento técnico.')),card('Fé',p('Rituais, devoção, espiritualidade, sabedoria, vontade e contato com forças divinas.')),card('Carisma',p('Personalidade, emoção, expressão artística, linhagem sobrenatural ou poder inato.'))])
  ));
  const circles=[[1,1,20],[2,10,45],[3,20,70],[4,30,95],[5,40,120],[6,50,150],[7,60,185],[8,75,225],[9,90,270]];
  const circleCards=circles.map(row=>'<article class="magic-circle-card"><span>CÍRCULO '+row[0]+'</span><strong>Nível '+row[1]+'+</strong><div class="magic-circle-copy"><em>'+row[2]+' Energia</em></div></article>').join('');
  rules.push(section('circulos','VI','Círculos e custo de Energia',
    p('A magia tem <strong>nove círculos</strong>. O círculo máximo determina quais magias podem ser aprendidas e conjuradas. <strong>Subir de nível nunca desbloqueia automaticamente um círculo.</strong> Novos círculos dependem de missão, evento, mentor, treinamento ou recompensa narrativa.')+
    '<div class="circle-grid arcana-circle-grid">'+circleCards+'</div>'+
    p('Os níveis são apenas requisitos mínimos para receber um desbloqueio. Mesmo um personagem de nível 80 pode continuar no círculo 1. Círculos ainda não lançados oficialmente permanecem indisponíveis, independentemente do nível.')+
    p('Desbloquear um círculo apenas permite aprender as magias daquele círculo ou de círculos inferiores. O desbloqueio <strong>não adiciona automaticamente</strong> novos feitiços à ficha.')+
    '<div class="magic-cost-explainer"><div class="magic-cost-explainer-head"><small>REGRAS DE GASTO</small><h3>Custo de Energia</h3><p>Cada magia consome o custo de seu círculo da mesma reserva usada pelas habilidades divinas.</p></div><div class="magic-cost-explainer-grid"><article><strong>Na conjuração</strong><p>A Energia é descontada mesmo se o ataque errar, se o alvo resistir ou se houver falha crítica.</p></article><article><strong>50% de Energia</strong><p>Aplicam-se as penalidades de cansaço descritas no sistema de status.</p></article><article><strong>0 Energia</strong><p>O personagem desmaia. Descansos restauram a Energia usada por feitiços e poderes divinos.</p></article></div></div>'
  ));
  rules.push(section('aprendizado','VII','Aprendendo magias',
    p('O mágico começa com <strong>três magias de primeiro círculo</strong>. Novas magias devem ser encontradas, conquistadas ou ensinadas, principalmente por loot de missão.')+
    grid([card('Fontes de aprendizado',p('Pergaminhos, grimórios, diários, anotações arcanas, objetos mágicos que possam ser estudados, mentores, recompensas de eventos, treinamento e pesquisa.')),card('Duas recompensas diferentes',p('Desbloquear um círculo permite aprender feitiços nele; conquistar uma nova magia adiciona um feitiço específico ao repertório. Uma coisa não substitui a outra.'))])+
    p('É possível aprender diretamente com outro personagem, desde que quem ensina possua o <strong>talento de ensino mágico</strong>, disponível a mágicos de <strong>nível 60 ou superior</strong> que o escolham. O ensino pode ocorrer em cena ou fora de tela.')+
    p('<strong>Não há limite fixo de magias conhecidas.</strong> Todas as magias aprendidas devem ser registradas na ficha, com a fonte identificada no canal de lista de magia da comunidade.')
  ));
  rules.push(section('combate-magico','VIII','Conjurando em combate',
    p('Por padrão, conjurar uma magia utiliza <strong>uma das duas ações do turno</strong>. O personagem só pode conjurar <strong>uma magia de círculo por turno</strong>, ainda que possua outra ação disponível. A ação restante pode ser usada normalmente.')+
    p('Alguns feitiços podem ser usados fora do turno; quando isso acontecer, a própria magia informará expressamente.')
  ));
  rules.push(section('concentracao','IX','Concentração',
    p('Algumas magias exigem concentração para continuar funcionando. Um personagem só mantém <strong>uma magia de concentração por vez</strong>; conjurar outra magia de concentração encerra a anterior.')+
    p('Ela também termina caso o personagem fique inconsciente, atinja 0 Energia, decida encerrar o efeito (inclusive fora do turno, salvo exceções da própria magia) ou falhe em um teste para mantê-la.')+
    '<div class="big-formula"><b>Resistência de Constituição</b><span>DT</span><strong>10 ou metade do dano recebido, o maior valor</strong></div>'+
    p('Sempre que sofrer dano concentrado em um feitiço, realize esse teste. A falha encerra a magia. Ataques ou fontes de dano diferentes exigem <strong>testes separados</strong>.')
  ));
  rules.push(section('circulo-superior','X','Conjuração em círculo superior',
    p('Algumas magias podem ser conjuradas usando um círculo superior ao original. É necessário <strong>ter desbloqueado o círculo escolhido</strong>, pagar o custo de Energia dele e aplicar os benefícios de progressão descritos na magia.')+
    p('A conjuração superior só é permitida quando a descrição do feitiço informa essa possibilidade.')
  ));
  rules.push(section('rituais','XI','Rituais',
    p('Magias identificadas como <strong>Ritual</strong> podem ser conjuradas fora de combate por um processo mais demorado e menos custoso.')+
    '<div class="ritual-grid arcana-grid"><article><b>Preparação</b><span>10 minutos, por padrão.</span></article><article><b>Segurança</b><span>Ambiente minimamente seguro e componentes necessários.</span></article><article><b>Custo</b><span>Metade da Energia normal, arredondada para cima em múltiplos de 5.</span></article></div>'+
    p('Exemplos: uma magia do círculo 1, que custa 20 EN, custa <strong>10 EN</strong> em ritual; uma magia do círculo 2, que custa 45 EN, custa <strong>25 EN</strong>. Componentes consumíveis continuam sendo gastos.')+
    p('Rituais não podem acontecer durante combate, perseguição ou movimento. Podem ser realizados em descansos curtos ou longos, desde que existam tempo e condições adequadas.')
  ));
  rules.push(section('componentes','XII','Componentes de magia',
    '<div class="component-grid arcana-grid"><article><b>Verbal</b><span>Palavras, fórmulas, comandos ou orações. O silêncio impede esse tipo de conjuração.</span></article><article><b>Somático</b><span>Gestos das mãos ou de um foco. Imobilização completa impede esse tipo de conjuração.</span></article><article><b>Material</b><span>Objeto ou ingrediente. Foco substitui material comum não consumível, mas não materiais raros, caros ou consumíveis.</span></article></div>'+
    p('A descrição da magia informa seus componentes específicos.')
  ));
  rules.push(section('foco','XIII','Foco arcano',
    p('Para conjurar magia, o personagem precisa ter <strong>seu foco arcano em uma das mãos</strong>, mesmo que o feitiço não possua componente material. Sem ele, não pode conjurar.')+
    p('São possíveis focos varinhas, cajados, grimórios, amuletos, instrumentos musicais, armas ritualísticas, símbolos religiosos e objetos coerentes com a origem da magia. <strong>Um foco comum custa 120 denários.</strong> Artesãos podem produzir focos personalizados e definir o preço.')+
    p('O material usado no foco não concede bônus mecânicos: ouro imperial, prata, ferro ou madeira especial não transferem automaticamente propriedades de combate ou materiais às magias.')+
    card('Construção de um foco',p('A fabricação exige <strong>três sucessos em Ofício, DT 15</strong>, representando construção física, preparação para canalizar magia e estabilização arcana. Cada tentativa dura aproximadamente <strong>30 minutos</strong>. Se falhar, repita a etapa após outros 30 minutos e role <strong>1d6</strong> na tabela de Instabilidade Arcana. Em falha crítica, role duas vezes.'))+
    '<div class="arcana-subheading"><h3>Instabilidade Arcana — 1d6</h3><p>Esses efeitos são narrativos, sem bônus ou penalidades mecânicas.</p></div>'+
    '<div class="arcana-instability-grid">'+[
      ['1','Crescimento Arcano','Cresce 1d10 cm; roupas e equipamentos acompanham.'],
      ['2','Encolhimento Arcano','Diminui 1d10 cm; roupas e equipamentos acompanham.'],
      ['3','Cromatismo Mágico','Uma característica física muda de cor pela próxima semana.'],
      ['4','Gravidade Questionável','Cabelo, roupas e objetos soltos flutuam por uma semana. Não pode ser usado em missões.'],
      ['5','Manifestação Inconveniente','Borboletas, flores, faíscas, chuva localizada ou manifestação semelhante por uma semana.'],
      ['6','Mutação Arcana Temporária','Pequenos chifres, orelhas, pupilas, cauda inútil ou outra mudança inofensiva por uma semana.']
    ].map(r=>'<article><b>'+r[0]+'</b><div><strong>'+r[1]+'</strong><p>'+r[2]+'</p></div></article>').join('')+'</div>'
  ));
  rules.push(section('cantrips','XIV','Cantrips e escolas',
    p('Cantrips são pequenos truques narrativos <strong>sem custo de Energia</strong>. Cada personagem mágico conhece <strong>dois inicialmente</strong>; outros podem ser aprendidos, como magias, com treinamento mais breve.')+
    p('As escolas de magia são: <strong>Ilusão, Transmutação, Encantamento, Conjuração, Abjuração, Evocação, Necromancia e Adivinhação</strong>. Consulte as listas de truques e feitiços oficialmente disponíveis nos canais da comunidade.')
  ));
  rules.push(section('alta-magia','XV','Limites da alta magia',
    p('Magias do círculo 6 ou superior possuem um limite por <strong>descanso prolongado</strong>, além dos custos de Energia.')+
    '<div class="high-magic-grid arcana-high-magic-grid"><article><b>6</b><span><strong>2 conjurações</strong> por descanso longo</span></article><article><b>7</b><span><strong>2 conjurações</strong> por descanso longo</span></article><article><b>8</b><span><strong>1 conjuração</strong> por descanso longo</span></article><article><b>9</b><span><strong>1 conjuração</strong> por descanso longo</span></article></div>'+
    p('Esse limite é <strong>compartilhado entre todos os feitiços do mesmo círculo</strong>. Conjurar duas magias do círculo 7 impede outra magia do círculo 7 até completar o descanso, mesmo com Energia disponível. Alguns feitiços podem ter limites mais restritos.')
  ));
  rules.push(section('poder-divino','XVI','Magia e habilidades divinas',
    p('Magias não substituem poderes concedidos pelo deus do personagem. Produzir um resultado semelhante não elimina regras, custos, componentes, limites ou consequências.')+
    card('Limite de estacas para mágicos',p('Por padrão, personagens mágicos só podem evoluir habilidades divinas até a <strong>segunda estaca (29)</strong>. Há uma exceção de afinidade mágica: <strong>Jano, Libitina, Trívia e Somnium</strong> podem manter <strong>todas as passivas e as quatro primeiras habilidades ativas até a estaca 30</strong>, mesmo após aprender magia. Outras habilidades seguem a limitação normal.'))+
    p('Aprender a controlar água não transforma alguém em filho de Netuno. Magia de fogo não confere parentesco com Vulcano, necromancia não concede autoridade sobre o Submundo e adivinhação não obriga os deuses a responder.')+
    p('O conhecimento mágico permanece sob o olhar das divindades relacionadas a ele; interferir em seus domínios pode produzir consequências narrativas.')
  ));
  page.html='<div class="magic-opening"><div class="magic-opening-copy"><small>LEGIO XII FULMINATA · ARS ARCANA</small><h1>Sistema de Magia</h1><p>Aprendizado, sacrifícios, círculos, conjuração, rituais e os limites entre magia e poder divino.</p></div></div>'+rules.join('');
  const entries=rules.map(html=>{
    const holder=document.createElement('div');holder.innerHTML=html;
    const el=holder.querySelector('section');
    return {page:'magia',anchor:el.id,deity:null,title:el.dataset.title,text:el.textContent.replace(/\s+/g,' ').trim()};
  });
  window.GUIA_SEARCH=[...(window.GUIA_SEARCH||[]).filter(x=>x.page!=='magia'),...entries];
})();
