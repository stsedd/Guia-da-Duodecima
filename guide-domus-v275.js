(function installDomus(){
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rebentos=[
  {id:'cerise-cassius',series:'I',label:'II COORTE · DOIS LEGADOS',image:'assets/rebentos/01-cerise-cassius.png',alt:'Quadro cerimonial de Cerise Mae Augustus e Cassius Caesar Augustus, com Wren, a raposa, diante de arcos romanos',shape:'wide',people:[
    {name:'Cerise M. Augustus',subtitle:'FILHA DE VÊNUS · EX-CENTURIÃ DA II COORTE · SENADORA',paragraphs:[
      'Filha de Vênus e Milo Bow, Cerise Mae Bow — mais tarde Augustus — tornou-se a primeira centuriã do Acampamento Júpiter desde a Guerra dos Oceanus. Sua história esteve ligada à reconstrução de uma geração de legionários, tanto pela liderança da Segunda Coorte quanto por sua capacidade de negociar onde as armas não bastavam. Participou de tratados e encontros diplomáticos que ajudaram Roma a manter relações com outros povos e poderes.',
      'Sua presença também foi decisiva em missões que marcaram a Legião. Participou da recuperação das áquilas divinas de Vênus e Arcus, da expedição à lendária Forja de Prometheus e dos acontecimentos que culminaram no enfrentamento do Régulo de Nazzano. Para além das campanhas, dedicou anos à boticária: suas fórmulas e receitas permaneceram como parte do conhecimento transmitido pelo laboratório romano.',
      'Sua raposa Wren tornou-se uma figura conhecida entre os legionários. Ao encerrar o serviço militar regular, Cerise não abandonou Roma: passou a contribuir para suas instituições como senadora e construiu sua vida ao lado de Cassius Caesar Augustus. Seu quadro recorda uma forma de serviço em que diplomacia, cuidado e coragem tiveram a mesma importância.'
    ]},
    {name:'Cassius C. Augustus',subtitle:'FILHO DE PHOBETOR · EX-CENTURIÃO DA II COORTE · PRAETOR',paragraphs:[
      'Cassius Caesar Augustus descende de uma das famílias patrícias que ajudaram a fundar Nova Roma. Filho de Phobetor e herdeiro de uma linhagem ligada a Metus e Marte, chegou sozinho à Legião e enfrentou duas harpias no primeiro combate. Com o passar dos anos, assumiu a Segunda Coorte após a saída de Cerise de seu comando e se tornou uma referência de trabalho e responsabilidade militar.',
      'Durante muito tempo, foi um dos poucos ferreiros ativos do acampamento. Armas e armaduras produzidas por suas mãos acompanharam inúmeros legionários, tornando a forja uma parte essencial da defesa romana. Na expedição à Forja de Prometheus, trabalhou o ouro imperial recuperado ainda em estado bruto, participando do processo que tornou possível utilizá-lo. Também recuperou sozinho, em pleno Sonhar, a áquila divina de Angerona — feito que lhe rendeu o título de Campeão de Angerona.',
      'Sua trajetória se estende dos domínios dos sonhos às instituições de Roma. Continua trabalhando para Phobetor no Sonhar, ajudou Cyrus a recuperar o busto de Summanus, participou dos acontecimentos ligados ao conclave de Vênus e do enfrentamento ao Régulo. Após a morte de seu avô em um atentado ao Senado, empenhou-se em investigar os responsáveis. Hoje integra a Praetoria, levando consigo a experiência conquistada como ferreiro, centurião e defensor da Legião.'
    ]}
  ]},
  {id:'celeste-caelus',series:'II',label:'V COORTE · FORÇA E DEVER',image:'assets/rebentos/02-celeste-caelus.png',alt:'Quadro cerimonial de Celeste Cavalcanti e Caelus Severus, sob o arco da Quinta Coorte',shape:'portrait',people:[
    {name:'Celeste Cavalcanti',subtitle:'FILHA DE BELLONA · EX-CENTURIÃ DA V COORTE · EXPLORATIO',paragraphs:[
      'Celeste Cavalcanti assumiu a liderança de uma Quinta Coorte cuja reputação havia sido abalada. Em vez de aceitar a desconfiança que recaía sobre seus legionários, trabalhou para devolver à unidade seu lugar de honra na Legião. Sua carreira foi marcada tanto pelo comando quanto pela disposição de estar na linha de frente dos confrontos que exigiam a presença de Roma.',
      'Esteve nas expedições de recuperação das áquilas divinas de Vênus e Fortuna, na jornada à Forja de Prometheus e nos esforços que levaram à derrota do Régulo. Sua trajetória também esteve ligada à Exploratio, onde o dever ultrapassava os limites conhecidos do acampamento. Foi durante seu serviço que recebeu de Bellona a profecia de que Nova Roma deveria retornar à Itália.',
      'A mudança de Roma não foi apenas uma transformação geográfica: para Celeste, representou a realização de um aviso recebido diretamente de sua mãe divina. Seu quadro preserva a história de uma centuriã que ajudou a reconstruir a confiança em sua coorte e que, mesmo diante de acontecimentos muito maiores do que ela, continuou escolhendo servir.'
    ]},
    {name:'Caelus Severus',subtitle:'FILHO DE JÚPITER · ANTIGO TAKESHI SAKAI · V COORTE',paragraphs:[
      'Antes de ser conhecido como Caelus Severus, chamava-se Takeshi Sakai. Seu percurso entre os romanos foi atravessado pelo peso de ser filho de Júpiter e pelas consequências de suas próprias decisões. Durante a recuperação da áquila de Justitia, desobedeceu uma determinação do pai divino, iniciando uma jornada de penitência, compromisso e devoção.',
      'Participou da recuperação da áquila de Fortuna e da expedição à Forja de Prometheus, além de enfrentar os perigos que cercaram a instalação da Legião em Nazzano. Uma de suas maiores provações aconteceu diante de Diocleciano e daquele que era chamado de Aquele que Devorou o Céu. Ao derrotar a criatura, libertou a tempestade de Júpiter que permanecia aprisionada.',
      'Mais do que uma história de vitórias, sua trajetória passou pelo reconhecimento dos próprios erros e pela escolha de enfrentá-los. O quadro de Caelus, ao lado do de Celeste, recorda dois percursos diferentes de responsabilidade perante Roma: um construído pelo comando, outro pela penitência, ambos ligados ao futuro da Legião.'
    ]}
  ]},
  {id:'cyrus',series:'III',label:'II COORTE · SUMMANUS',image:'assets/rebentos/03-cyrus.png',alt:'Quadro cerimonial de Cyrus Torres Aurelius, filho de Summanus, sob um arco da Segunda Coorte',shape:'solo',people:[
    {name:'Cyrus Aurelius',subtitle:'FILHO DE SUMMANUS · EX-CENTURIÃO DA II COORTE · PRAETOR',paragraphs:[
      'Nascido no Chile, Cyrus Torres Aurelius chegou à Legião ao lado de Cerise e Cenric. Discrição, infiltração e capacidade de agir sem chamar atenção tornaram-se marcas de sua passagem pela Segunda Coorte. Participou das expedições em busca das áquilas divinas de Vênus e Justitia e foi reclamado por Summanus durante a segunda dessas jornadas, estabelecendo um vínculo decisivo com o deus dos trovões noturnos.',
      'Ao lado de Cassius, recuperou a cabeça perdida da estátua de Summanus, devolvendo ao culto de seu pai uma parte importante de sua memória. Também se infiltrou entre vampiros para auxiliar negociações diplomáticas, participou da expedição à Forja de Prometheus e esteve entre os legionários que enfrentaram o Régulo de Nazzano. Suas contribuições não se resumiram à força em batalha: envolveram paciência, estratégia e capacidade de reconhecer o momento certo de agir.',
      'Com o tempo, Cyrus deixou de ser apenas um nome ligado às missões da Segunda Coorte e passou a integrar a liderança da própria Roma. Atualmente faz parte da Praetoria. Seu quadro na Domus Memoriae preserva a caminhada entre a chegada ao acampamento e as responsabilidades de governo, lembrando que a honra de um legionário também pode ser construída em silêncio.'
    ]}
  ]}
];
const card=entry=>`<section class="section searchable domus-rebento domus-rebento--${entry.shape}" id="rebento-${entry.id}" data-title="${esc(entry.people.map(p=>p.name).join(' e '))}">
  <div class="domus-rebento-heading"><span class="domus-rebento-number">${entry.series}</span><div><small>${esc(entry.label)}</small><h2>${esc(entry.people.map(p=>p.name).join(' & '))}</h2></div></div>
  <figure class="domus-artwork"><img src="${entry.image}" alt="${esc(entry.alt)}" loading="lazy" decoding="async"></figure>
  <div class="domus-biographies">${entry.people.map(person=>`<article class="domus-biography"><small>${esc(person.subtitle)}</small><h3>${esc(person.name)}</h3>${person.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</article>`).join('')}</div>
</section>`;
const html=`<section class="section searchable domus-intro" id="domus-memoriae" data-title="Domus Memoriae">
  <div class="section-head"><div><small>ROMA · MEMÓRIA · HONRA</small><h2>Domus Memoriae</h2></div><span>MEMORIA · HONOS</span></div>
  <div class="domus-intro-copy"><div><p class="domus-opening">Nem toda história de Roma termina quando um legionário deixa de lutar.</p><p>A <strong>Domus Memoriae</strong> preserva os quadros daqueles que conquistaram o <strong>descanso em honra</strong>, os rebentos de Roma. Não se trata necessariamente de morte ou esquecimento. É o reconhecimento de trajetórias que transformaram a Legião e que continuam a fazer parte de sua história, mesmo quando seus protagonistas assumem outros caminhos e responsabilidades.</p><p>Os retratos recordam os feitos, os vínculos e as decisões de quem ajudou a proteger, construir e devolver Roma à Itália. Cada homenagem pertence à memória coletiva do acampamento.</p></div><aside class="domus-intro-aside"><small>HONRARIAS DA LEGIO XII</small><strong>Três quadros, cinco trajetórias.</strong><p>As obras aqui apresentadas pertencem à primeira leva de rebentos homenageados pela Legião.</p></aside></div>
</section>${rebentos.map(card).join('')}`;
if(!window.GUIA_CONTENT)window.GUIA_CONTENT={};
window.GUIA_CONTENT.domus={title:'Domus Memoriae',html};
if(Array.isArray(window.GUIA_SEARCH)&&!window.GUIA_SEARCH.some(x=>x.page==='domus')){
  window.GUIA_SEARCH.push({page:'domus',anchor:'domus-memoriae',title:'Domus Memoriae · Rebentos de Roma',text:'memória honra descanso em honra rebentos Cerise Cassius Celeste Caelus Cyrus'});
  rebentos.forEach(entry=>window.GUIA_SEARCH.push({page:'domus',anchor:'rebento-'+entry.id,title:entry.people.map(p=>p.name).join(' e '),text:entry.people.map(p=>p.subtitle+' '+p.paragraphs.join(' ')).join(' ')}));
}
})();
