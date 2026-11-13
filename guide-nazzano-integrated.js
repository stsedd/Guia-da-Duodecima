(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const honorees=[
['Cerise “Cherry” Mae Augustus','FILHA DE VÊNUS · EX-CENTURIÃ DA II COORTE · SENADORA','Cerise, filha de Vênus e Milo Bow, tornou-se a primeira centuriã do Acampamento Júpiter desde a Guerra dos Oceanus. Diplomata presente em grande parte dos tratados de sua geração, participou da recuperação das áquilas de Vênus e Arcus, da expedição à Forja de Prometheus e do enfrentamento do Régulo. Por muitos anos, foi a principal boticária da Legião, e suas receitas permanecem no laboratório. Sua raposa Wren tornou-se uma presença querida de Roma. Após deixar a carreira militar, assumiu uma cadeira no Senado e casou-se com Cassius Caesar Augustus.'],
['Cassius Caesar Augustus','FILHO DE PHOBETOR · EX-CENTURIÃO DA II COORTE · CAMPEÃO DE ANGERONA','Descendente da família patrícia Augustus, Cassius fez da forja uma das bases da defesa de Roma. Por anos, produziu grande parte das armas e armaduras da Legião; na Forja de Prometheus, trabalhou o ouro imperial recuperado em expedição. Resgatou sozinho a áquila de Angerona, recuperou com Cyrus a cabeça da estátua de Summanus e participou do enfrentamento do Régulo de Nazzano. Investigou o atentado ao Senado que matou seu avô. Aposentado da atividade militar, permanece entre os grandes nomes da história romana.'],
['Celeste Cavalcanti','FILHA DE BELLONA · EX-CENTURIÃ DA V COORTE · EXPLORATIO','Celeste assumiu uma V Coorte desacreditada e ajudou a devolvê-la à posição de honra na Legião. Foi combatente de linha de frente nas expedições das áquilas de Vênus e Fortuna, na Forja de Prometheus e no confronto com o Régulo. Durante o serviço na Exploratio, recebeu de Bellona a profecia de que Nova Roma deveria retornar à Itália. Seu legado é a coragem demonstrada em batalha e a confiança restaurada na coorte que comandou.'],
['Caelus Severus','FILHO DE JÚPITER · LIDERANÇA DA V COORTE','Anteriormente conhecido como Takeshi Sakai, Caelus desobedeceu uma determinação de Júpiter durante a recuperação da áquila de Justitia e iniciou uma jornada de penitência e devoção. Participou da recuperação da áquila de Fortuna e da expedição à Forja de Prometheus. Em uma provação divina, enfrentou Diocleciano e matou Aquele que Devorou o Céu, libertando a tempestade aprisionada de Júpiter. Também enfrentou o Régulo antes da instalação da Legião em Nazzano.'],
['Cyrus Torres Aurelius','PRAETOR · FILHO DE SUMMANUS · EX-CENTURIÃO DA II COORTE','Natural do Chile, Cyrus chegou com Cerise e Cenric e tornou-se referência da II Coorte em discrição e infiltração. Recuperou as áquilas de Vênus e Justitia, sendo reclamado por Summanus durante a segunda expedição. Ao lado de Cassius, recuperou a cabeça perdida da estátua de seu pai. Infiltrou-se entre vampiros para auxiliar negociações diplomáticas, participou da expedição à Forja de Prometheus e enfrentou o Régulo de Nazzano. É atualmente um dos três pretores de Roma.']
];
const credits=[
['Derrota do Régulo','Cassius Caesar Augustus · Cerise “Cherry” Mae Augustus · Cyrus Torres Aurelius · Celeste Cavalcanti · Caelus Severus'],
['Negociações com os féericos e elfos','Isaac Friðrik · Kang Williams · Marcus J. Ashford · Evan Whitaker · Jane Zinnerman · Ringo Rhiannon · Noel Mena · Micaela Rolon · Xiàn Jí · Elena Moretti · @ _maxx.xxaw_'],
['Negociações com os faunos','Marcus J. Ashford · Iulietta A. Caesari · Noel Mena · Micaela Rolon · Oz da Uvinha · Isaac Friðrik · Morgan da Corvinho'],
['Purificação dos iguotos','Bellini · Maddie De Laurentiis · Nero'],
['Itens mágicos oferecidos ao teleporte','Alexandria Adelson · Nakht Saqqar · Haldir · Ema (Holly Carter) · Skye R. Victrix · Boris Morozov · Ringo Rhiannon · Remus Pio Aurum · Daiki Chizome · Antonio Sforza · Dara L. Rivera · Kenneth Carandini · Artie M. Jaikieow · Miwa Ruriko'],
['Infraestrutura, bondinho, energia e fotovoltaica','Cassiopéia Brutus · Bellini · Merlia Scaevola · Kaiami Okafor · Skye R. Victrix · Kenneth Carandini · Boris Morozov · Hassan · Artória Sandrini · Marcus J. Ashford · Esme Agape'],
['Combate aos monstros remanescentes','Gabriela Keeler · Antonio Sforza · Daiki Chizome · Ignus F. Ferrarius · Kenneth Carandini · Skye R. Victrix · Boris Morozov · Hassan · Giovanni D’angelo · Lya Silendor · Artie M. Jaikieow · Tristan D. Laurent · Aksel S. Østergaard · Felix Vitalis · Miverna'],
['Demais participantes','Percival Gallagher · Teresa E. de Borja · Jane Zinnerman · Marsaili Nicleòid · demais participantes das missões e mesas'],
['Eliminação da corrupção em Nazzano','Rhea Cornelius · Skye R. Victrix · Miwa Ruriko']
];
const important={
  cyrus:{name:'Cyrus Torres Aurelius',role:'PRAETOR · FILHO DE SUMMANUS',img:'assets/nazzano/cyrus.webp',title:'O Silêncio · A Fúria da Noite',description:'Integrante da Praetoria. Antigo líder da II Coorte, participou das expedições das áquilas de Vênus e Justitia, da recuperação da estátua de Summanus e da batalha contra o Régulo.'},
  cassius:{
    name:'Cassius Caesar Augustus',
    role:'PRAETOR · FILHO DE PHOBETOR',
    img:'assets/nazzano/cassius.webp',
    title:'O Campeão de Angerona · O Senhor dos Pesadelos · O Vidente · O Herdeiro dos Augustus',
    description:'Atual praetor do triunvirato e antigo centurião da II Coorte. Descendente de uma das famílias fundadoras de Nova Roma, Cassius é ferreiro, campeão de Angerona e servidor de Phobetor nos domínios do Sonhar. Sua trajetória reúne a recuperação de relíquias divinas, o trabalho na Forja de Prometheus e a defesa da Legião.',
    details:[
      'Nascido entre os Augustus, uma das famílias patrícias responsáveis pela fundação de Nova Roma, Cassius é filho de Phobetor e herdeiro de uma ascendência que também remonta a Metus e Marte. Chegou sozinho à Legião e, logo em seu primeiro combate, enfrentou duas harpias sem qualquer auxílio. Anos depois, assumiria a liderança da Segunda Coorte após o afastamento de sua esposa, Cerise Mae Bow.',
      'Durante muitos anos, Cassius foi um dos poucos ferreiros em atividade no acampamento, chegando a assumir praticamente sozinho a responsabilidade pela produção de armas e armaduras. Seu trabalho acompanhou inúmeros legionários em missões e batalhas, tornando-se uma contribuição indispensável à segurança de Roma e à preparação de seus combatentes.',
      'Seu domínio da forja foi especialmente importante durante a expedição à lendária Forja de Prometheus, da qual participou ao lado de Cerise, Cyrus, Celeste e Caelus. Na ocasião, trabalhou o ouro imperial desde seu estado bruto, conduzindo o processo que permitiu transformar o precioso recurso em um metal utilizável.',
      'Entre seus maiores feitos, destaca-se a recuperação solitária da áquila de Angerona, realizada durante uma missão no próprio Sonhar. A conquista estabeleceu uma ligação divina que permanece entre as maiores honrarias de sua trajetória.',
      'Como filho de Phobetor, Cassius mantém uma relação particularmente próxima com os domínios oníricos. Até hoje, continua trabalhando a serviço de seu pai, percorrendo o Sonhar para caçar mortais e perturbar seus sonhos. É dessa atuação que nasce parte de sua reputação como Senhor dos Pesadelos, uma figura cuja presença pode ser tão ameaçadora durante o sono quanto nos campos de batalha.',
      'Ao lado de Cyrus Aurelius, participou da recuperação do busto perdido de Summanus, uma relíquia há muito esquecida que foi devolvida ao deus dos trovões noturnos. Também esteve presente nos acontecimentos relacionados ao conclave de Vênus, envolvendo-se em assuntos divinos que ultrapassavam as fronteiras do acampamento.',
      'Participou dos esforços que culminaram na derrota de Régulo de Nazzano, cuja presença ameaçava a região destinada a receber Roma. Sua contribuição ajudou a garantir a segurança das novas terras, permitindo que a Legião encontrasse um lar após a mudança para a Itália.',
      'Sua história também foi marcada por perdas pessoais. Durante um atentado ao Senado, uma explosão tirou a vida de seu avô, levando Cassius a assumir a responsabilidade de investigar o ocorrido. Determinado a descobrir os responsáveis, empenhou-se em identificar os traidores envolvidos e garantir que respondessem por seus crimes. Hoje serve Roma como praetor do triunvirato.'
    ]
  },
  beatrice:{name:'Alessia Beatrice Czartoryski Sapieha Wojciechowski',role:'PONTIFEX · RELIGIO',img:'assets/nazzano/beatrice.webp',title:'A Impronunciável · A Evidência · A Sentença · A Executora',description:'Representante da Religio, ligada à justiça romana e à proteção dos cultos de divindades menores.'}
};
function officialPerson(person){
const src=esc(person.img),name=esc(person.name);
return '<article class="leader-card oct26-official-person"><div class="oct26-leader-photo"><img src="'+src+'" alt="Retrato de '+name+'" loading="lazy"><div class="oct26-image-placeholder">Retrato em atualização</div></div><div class="leader-copy"><span>'+esc(person.role)+'</span><h3>'+name+'</h3>'+(person.title?'<em>'+esc(person.title)+'</em>':'')+'<p>'+esc(person.description)+'</p>'+(person.details?.length?'<details class="duo-praetor-details"><summary>Conhecer a trajetória completa</summary><div class="duo-praetor-detail-copy">'+person.details.map(par=>'<p>'+esc(par)+'</p>').join('')+'</div></details>':'')+'</div></article>';
}
function sectionSource(root,re){const h=find(root,re);return h?.closest('section')||h?.closest('.section')||null;}
const find=(root,re)=>[...root.querySelectorAll('h1,h2,h3,h4')].find(x=>re.test(x.textContent));
function sectionId(root,re){const h=find(root,re);return h?.closest('section')||h?.closest('.section')||null}
function article(name,title,alias,desc,memorial=false){
const img=name.startsWith('Cyrus')?'assets/nazzano/cyrus.webp':name.startsWith('Alessia')?'assets/nazzano/beatrice.webp':name.startsWith('Cenric')?'':'';
return '<article class="oct26-person '+(memorial?'oct26-memorial':'')+'">'+(img?'<img class="oct26-person-img" src="'+img+'" alt="Retrato de '+esc(name)+'" loading="lazy">':'<div class="oct26-avatar" aria-hidden="true">'+(memorial?'✝':'XII')+'</div>')+'<div><small>'+esc(title)+'</small><h3>'+esc(name)+'</h3>'+(alias?'<em>'+esc(alias)+'</em>':'')+'<p>'+esc(desc)+'</p></div></article>'}
function patch(root){
if(!root)return;
const isRoma=root.classList.contains('page-roma');
if(!isRoma&&!root.classList.contains('page-sistema'))return;
function replaceText(from,to,selector='p,li,span,small,b,strong,h2,h3,h4'){
 root.querySelectorAll(selector).forEach(el=>{
   for(const n of [...el.childNodes]){
     if(n.nodeType===3&&from.test(n.nodeValue||''))n.nodeValue=n.nodeValue.replace(from,to);
   }
 });
}
replaceText(/Campos de Marte(?!\s*&\s*Bellona)/gi,'Campos de Marte & Bellona');
if(!isRoma){
 replaceText(/duunvirato/gi,'triunvirato');
 replaceText(/Os celtas existem na trama, mas seguem indisponíveis para criação por enquanto\./gi,'Personagens celtas estão liberados como estrangeiros, conforme as regras de origem.');
 replaceText(/Berkeley Hills, Oakland Hills, Jardim de Bacchus/gi,'áreas autorizadas de Nazzano, bosques e instalações adequadas ao material procurado');
 replaceText(/aprovação das Pretoras/gi,'aprovação da Praetoria');
 const foreignNotice=root.querySelector('.foreign-cta small');
 if(foreignNotice&&/indispon[ií]veis para criação/i.test(foreignNotice.textContent)){
   foreignNotice.textContent=foreignNotice.textContent.replace(/Os celtas existem na trama, mas seguem indisponíveis para criação por enquanto\./gi,'Os celtas estão liberados como estrangeiros.');
 }
 return;
}
root.querySelectorAll('h1,h2,h3,h4,span,small').forEach(el=>{if(el.children.length)return;const x=el.textContent.trim();if(/quem conduz roma agora/i.test(x))el.textContent='Figuras Importantes';if(/^figuras atuais$/i.test(x))el.textContent='FIGURAS HISTÓRICAS E ATUAIS'});
// A liderança atual é um triunvirato. Preservamos a biografia das figuras anteriores.
const people=sectionId(root,/figuras importantes|quem conduz roma agora/i);
if(people&&!people.querySelector('.oct26-current-leadership')){
  const old=[...people.querySelectorAll('.leader-card')];
  const cardOf=re=>old.find(a=>re.test(a.querySelector('h3')?.textContent||''));
  const jasmine=cardOf(/Jasmine Imperione/i),blume=cardOf(/Blume Becker/i),emma=cardOf(/Emma Parker/i);
  if(jasmine){const caption=jasmine.querySelector('.leader-copy>span');if(caption)caption.textContent='PRAETORA · FILHA DE AQUILON';}
  if(blume){const caption=blume.querySelector('.leader-copy>span');if(caption)caption.textContent='EX-PRAETORA · FILHA DE VÊNUS';}
  const current=document.createElement('div');current.className='oct26-current-leadership';
  current.innerHTML='<h3 class="oct26-group-title">Praetoria · Triunvirato atual</h3><div class="oct26-figure-grid">'+(jasmine?jasmine.outerHTML:'')+officialPerson(important.cyrus)+officialPerson(important.cassius)+'</div>';
  const other=document.createElement('div');other.className='oct26-current-leadership oct26-other-figures';
  other.innerHTML='<h3 class="oct26-group-title">Religio e antigas lideranças</h3><div class="oct26-figure-grid">'+(emma?emma.outerHTML:'')+officialPerson(important.beatrice)+(blume?blume.outerHTML:'')+'</div>';
  const oldGrid=people.querySelector('.leader-grid');if(oldGrid)oldGrid.replaceWith(current,other);else people.append(current,other);
  people.querySelectorAll('.oct26-profiles').forEach(el=>el.remove());
  const header=people.querySelector('.section-head>div>small');if(header)header.textContent='ROMA · INSTITUIÇÕES';
  const tagline=people.querySelector('.section-head>span');if(tagline)tagline.textContent='PERSONAE';
}
const arrival=sectionId(root,/chegando a roma/i);if(arrival&&!arrival.dataset.oct26Arrival){
  const gateway=document.createElement('article');gateway.className='oct26-gateway';
  gateway.innerHTML='<small>NAZZANO · PORTA DE ROMA</small><h3>A ponte que revela o Acampamento Júpiter</h3><p>Para um mortal comum, a <em>Riserva Naturale Regionale Nazzano, Tevere-Farfa</em> é apenas uma reserva natural italiana: trilhas, árvores e as águas do Tibre. Mesmo ao passar pelos arredores da antiga estação de Nazzano, nada parece diferente do mundo conhecido.</p><p>Ali, porém, dois legionários permanecem de guarda junto à ponte do Antigo Tibre. É a travessia que faz a diferença. Quando alguém cruza a ponte, o Acampamento Júpiter finalmente se revela, com suas coortes, templos, torres e muralhas. Sem atravessá-la, a pessoa continua andando pela reserva comum, incapaz de ver ou alcançar o território romano.</p><p>O acampamento existe, portanto, dentro de um <strong>bolsão mágico</strong>, uma espécie de dimensão de bolso ligada ao mundo mortal por uma única passagem reconhecida: <strong>a ponte do Tibre</strong>. Não basta estar perto ou caminhar na direção certa; é necessário cruzar o limiar.</p>';
  const sectionHead=arrival.querySelector('.section-head');if(sectionHead)sectionHead.after(gateway);else arrival.prepend(gateway);
 arrival.dataset.oct26Arrival='1';
 const cards=[...arrival.querySelectorAll('.card,article')].filter(x=>/Túnel Caldecott|Pequeno Tibre|Território Romano/i.test(x.textContent));
 const old=cards.find(x=>/Túnel Caldecott/i.test(x.textContent));
 if(old){const title=[...old.querySelectorAll('h3,h4,strong,b')].find(x=>/Túnel Caldecott/i.test(x.textContent));if(title)title.textContent='Estação Abandonada de Nazzano'; const p=old.querySelector('p');if(p)p.textContent='A chegada ao território romano começa pela antiga estação de Nazzano. A guarda identifica os recém-chegados, verifica a entrada e acompanha a passagem para o Pequeno Tibre.';}
 arrival.querySelectorAll('*').forEach(x=>{if(x.children.length===0&&/Túnel Caldecott/i.test(x.textContent))x.textContent=x.textContent.replace(/Túnel Caldecott/gi,'Estação Abandonada de Nazzano')});
}
const map=sectionId(root,/mapa do acampamento/i);
if(map){
  const panel=map.querySelector('.camp-map-panel,.map-panel');
  if(panel){
    const im=panel.querySelector('img');
    if(im){im.src='assets/nazzano/mapa-nazzano.webp';im.alt='Mapa narrativo do Acampamento Júpiter em Nazzano, com a distribuição das coortes e instalações';im.style.filter='none';im.style.opacity='1';}
    if(!panel.querySelector('.oct26-map-missing')){const msg=document.createElement('p');msg.className='oct26-map-missing';msg.hidden=true;msg.textContent='O mapa oficial de Nazzano está preparado, mas seu arquivo de imagem ainda não foi publicado nesta versão.';panel.append(msg);}
  }
  const mapNote=map.querySelector('.map-note');if(mapNote)mapNote.textContent='Mapa interno do bolsão mágico romano. As instalações aqui representadas não são visíveis no mapa geográfico do mundo mortal.';
  if(!map.querySelector('.oct26-real-map')){
    const intro=document.createElement('div');intro.className='oct26-real-map';
    intro.innerHTML='<div class="oct26-map-head"><small>GEOGRAFIA REAL</small><h3>Onde fica Nazzano?</h3><p>A Riserva Naturale Regionale Nazzano, Tevere-Farfa é uma área natural do Lácio, ao norte da cidade de Roma. Explore sua localização real e, abaixo, compare com o mapa narrativo do Acampamento Júpiter.</p></div><div class="oct26-map-embed"><iframe title="Google Maps da Riserva Naturale Regionale Nazzano, Tevere-Farfa, no Lácio" src="https://www.google.com/maps?q=Riserva%20Naturale%20Regionale%20Nazzano%20Tevere-Farfa%2C%20Lazio%2C%20Italia&z=9&output=embed" referrerpolicy="no-referrer-when-downgrade" loading="lazy" allowfullscreen></iframe></div><a href="https://www.google.com/maps/search/?api=1&query=Riserva+Naturale+Regionale+Nazzano+Tevere-Farfa" target="_blank" rel="noopener noreferrer" class="oct26-map-link">Abrir a reserva no Google Maps ↗</a><div class="oct26-map-head oct26-map-head--fantasy"><small>MAPA NARRATIVO</small><h3>O acampamento além do Tibre</h3><p>Este mapa representa apenas a dimensão protegida da Legião, não as trilhas comuns da reserva.</p></div>';
    if(panel)map.insertBefore(intro,panel);else map.append(intro);
  }
}
const castra=sectionId(root,/morte certa.*principia/i);
if(castra&&!castra.querySelector('.oct26-castra-note')){
 const n=document.createElement('div');n.className='oct26-castra-note';
 n.innerHTML='<strong>Organização atual em Nazzano.</strong> O mapa oficial mostra as coortes I a V, a Principia, a Academia, a Biblioteca, o Armamentarium, a Forja, a Enfermaria, o Pavilhão, o Laboratório, os Estábulos, o Depósito, a Domus Memoriae, os Campos de Marte &amp; Bellona e as torres de vigia. Descrições antigas de distâncias e posições devem ser lidas como registros históricos, não como planta vigente.';
 castra.prepend(n);
}
// Os homenageados da Domus Memoriae agora possuem uma página exclusiva.
if(!root.querySelector('#memorial-retorno')){const s=document.createElement('section');s.id='memorial-retorno';s.className='section oct26-hall searchable';s.dataset.title='Aqueles que trouxeram Roma para casa';s.innerHTML='<div class="section-head"><div><small>MEMÓRIA · RETORNO</small><h2>Aqueles que trouxeram Roma para casa</h2></div></div><p class="section-lead">A transferência exigiu negociação, combate, purificação, doações de itens mágicos e a reconstrução de estruturas essenciais. Cada participação faz parte da história coletiva do retorno à Itália.</p><div class="oct26-credits">'+credits.map(x=>'<article><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+'</p></article>').join('')+'</div>';root.append(s)}
// Prioriza a designação oficial em toda a página sem duplicações.
root.querySelectorAll('*').forEach(el=>{if(el.children.length===0 && el.textContent && /Campos de Marte(?!\s*&\s*Bellona)/i.test(el.textContent))el.textContent=el.textContent.replace(/Campos de Marte(?!\s*&\s*Bellona)/gi,'Campos de Marte & Bellona')});
// As referências territoriais antigas não são instruções válidas para o cenário italiano.
replaceText(/Túnel Caldecott/gi,'Estação Abandonada de Nazzano');
replaceText(/Caldecott/gi,'Estação de Nazzano');
const exitRule=[...root.querySelectorAll('.camp-rule-grid article')].find(el=>/Sair do Acampamento/i.test(el.textContent));
if(exitRule&&/São Francisco/i.test(exitRule.textContent)){
 const p=exitRule.querySelector('p');
 if(p)p.textContent='Saídas do território romano exigem autorização da Praetoria. Viagens e custos dependem do destino, e não de uma rota fixa para São Francisco.';
}
replaceText(/o bronze está enfraquecendo/gi,'o bronze apresentou fragilidade durante uma crise já encerrada');
replaceText(/bronze da legião aparentemente enfraquecido/gi,'crise de fragilidade do bronze da Legião (encerrada)');
if(!root.querySelector('#nazzano-atualizacao')){const s=document.createElement('section');s.id='nazzano-atualizacao';s.className='section oct26-hall searchable';s.dataset.title='Roma em Nazzano';s.innerHTML='<div class="section-head"><div><small>ROMA · PRESENTE</small><h2>O retorno à Itália</h2></div></div><p>Blume Becker realizou a transferência de Nova Roma com catalisadores recolhidos pelos legionários e com o apoio de Jasmine. A cidade e os equipamentos essenciais atravessaram o oceano; os edifícios militares reconstruíveis foram erguidos no novo território. A sede atual da Legião fica na Reserva de Nazzano, Itália. A Califórnia funciona como posto avançado.</p><p>As cavernas ficam sob o acampamento, com acesso pelo Bosque dos Faunos e dos Elfos. Os campos militares recebem o nome de <strong>Campos de Marte &amp; Bellona</strong>. A crise do bronze frágil terminou. O cristal do Aqueronte existe, mas ainda não possui mecânica definida.</p><p>Na trama celta, Morcan Glass, o Rei Submerso, está aparentemente morto. Não há confirmação definitiva de sua morte.</p>';root.append(s)}
if(!root.querySelector('#juramentos-orcus')){const s=document.createElement('section');s.id='juramentos-orcus';s.className='section oct26-hall searchable';s.dataset.title='Juramentos a Orcus';s.innerHTML='<div class="section-head"><div><small>RELIGIO · JURAMENTOS</small><h2>Juramentos a Orcus</h2></div></div><p>Os romanos juram em nome de Orcus, não do Estige. Orcus é testemunha e guardião de promessas solenes. Quem quebra um juramento feito em seu nome recebe a visita do deus, que o mata, sem negociação ou segunda oportunidade. Não realize esse juramento sem plena certeza de que poderá cumpri-lo.</p>';root.append(s)}
if(!root.querySelector('#devocao-divina')){const s=document.createElement('section');s.id='devocao-divina';s.className='section oct26-hall searchable';s.dataset.title='Devoção Divina';s.innerHTML='<div class="section-head"><div><small>RELIGIO · PIETAS</small><h2>Devoção Divina</h2></div></div><p>Um personagem pode consagrar-se a uma divindade diferente de seu progenitor. O caminho é narrativo: conhecer o deus, honrar seus princípios, celebrar a consagração e demonstrar compromisso nas próprias ações e missões. Não há contagem de oferendas, pontos de devoção ou prazo mínimo. O reconhecimento e o novo kit dependem da vontade divina e de validação da equipe.</p><p>O novo patrono substitui o kit original. Podem ser preservadas até duas passivas da ascendência de nascimento, mediante aprovação. Excepcionalmente, uma ativa antiga pode substituir uma ativa nova, nunca somar espaço extra. O HP máximo é recalculado pelo kit do patrono; bônus de atributos e perícia inicial da origem permanecem, mas recursos e atributo de conjuração seguem o patrono. Somente um patrono concede kit por vez.</p><p>Se perder definitivamente o reconhecimento, o personagem perde os poderes do patrono e os poderes preservados da origem; não recupera automaticamente o kit de nascimento. Sua origem semidivina continua perceptível aos monstros.</p>';root.append(s)}
// Alterações pontuais, sem apagar narrativa histórica legítima.
root.querySelectorAll('p,li,h2,h3,h4,figcaption').forEach(el=>{if(el.closest('.oct26-hall')||el.closest('.oct26-profiles'))return;for(const n of [...el.childNodes])if(n.nodeType===3&&n.nodeValue.includes('Campos de Marte')&&!n.nodeValue.includes('Campos de Marte & Bellona'))n.nodeValue=n.nodeValue.replaceAll('Campos de Marte','Campos de Marte & Bellona')});
}
// Atualiza também a fonte editorial: novas seções entram na navegação, não apenas no HTML visível.
let storedPatchRunning=false;
function patchStored(){
 if(storedPatchRunning)return;
 storedPatchRunning=true;
 try{
   for(const key of ['sistema','roma']){
     const page=window.GUIA_CONTENT?.[key];if(!page?.html)continue;
     const detached=document.createElement('div');detached.className='page-'+key;detached.innerHTML=page.html;
     patch(detached);
     page.html=detached.innerHTML;
     if(key==='sistema')page.html=page.html.replace(/Os celtas existem na trama, mas seguem indisponíveis para criação por enquanto\./gi,'Os celtas estão liberados como estrangeiros, conforme as regras de origem.');
   }
 }finally{storedPatchRunning=false}
}
Promise.allSettled([window.DUODECIMA_CORE_READY,window.DUODECIMA_GUIDE_STABILIZATION_READY,window.DUODECIMA_GUIDE_RULES_READY]).then(()=>{
 patchStored();
 window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));
});
let scheduled=false,locked=false;function schedule(){if(locked||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;locked=true;try{patch(document.querySelector('#content'))}finally{locked=false}})}
new MutationObserver(schedule).observe(document.getElementById('content')||document.body,{childList:true,subtree:true});window.addEventListener('hashchange',schedule);window.addEventListener('popstate',schedule);document.addEventListener('error',e=>{const img=e.target;if(img?.tagName!=='IMG'||!img.src.includes('/assets/nazzano/'))return;if(img.dataset.oct26Retry!=='1'){img.dataset.oct26Retry='1';img.hidden=false;const url=new URL(img.src,location.href);url.searchParams.set('refresh','2.7.6');img.src=url.href;return}img.hidden=true;img.closest('figure,.oct26-leader-photo')?.classList.add('oct26-awaiting-art');const parent=img.closest('.camp-map-panel');if(parent){const warning=parent.querySelector('.oct26-map-missing');if(warning){warning.hidden=false;warning.textContent='Não foi possível carregar a imagem do mapa. Tente atualizar a página.'}}},true);schedule();
})();