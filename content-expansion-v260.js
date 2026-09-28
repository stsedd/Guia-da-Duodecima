(()=>{
  'use strict';
  const pages=window.GUIA_CONTENT=window.GUIA_CONTENT||{};
  const search=window.GUIA_SEARCH=window.GUIA_SEARCH||[];
  const section=(id,title,body)=>`<section id="${id}" data-title="${title}"><h2>${title}</h2>${body}</section>`;
  const p=t=>`<p>${t}</p>`;
  const ul=items=>`<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const note=t=>`<div class="callout"><p>${t}</p></div>`;
  const appendUnique=(page,id,html)=>{if(pages[page]&&!pages[page].html.includes(`id="${id}"`))pages[page].html+=html;};
  const addSearch=(page,anchor,title,text)=>{if(!search.some(x=>x.page===page&&x.anchor===anchor))search.push({page,anchor,title,text});};

  pages.combate={title:'Combate',html:`
    <section class="page-intro" id="combate-intro" data-title="Sistema de Combate">
      <h1>Sistema de Combate</h1>
      <p>O combate na Legião foi construído para ser simples e prático, com espaço para a narrativa. As rolagens existem para resolver incertezas sem transformar cada ação em uma sequência interminável de dados.</p>
    </section>
    ${section('combate-rolagens','Tipos de Rolagem',
      p('<strong>Perícia.</strong> Usada para escalar, empurrar, observar, investigar e demais tarefas ligadas a uma perícia. Quando aparecer “Teste de Força” ou “Teste de Destreza”, considere uma perícia adequada sempre que houver uma.')+
      p('<strong>Iniciativa.</strong> Role <code>1d20 + Agilidade</code>. Se não possuir Agilidade, use um teste puro de Destreza.')+
      p('<strong>Ataque.</strong> Usada quando uma arma, habilidade ou ação precisa atingir diretamente um alvo.')+
      p('<strong>Defesa.</strong> Representa esquiva, bloqueio ou aparo: <code>1d20 + Destreza + bônus aplicáveis</code>. Armaduras, escudos, passivas, talentos e habilidades podem alterar a fórmula.')+
      p('<strong>Resistência.</strong> Usada contra venenos, fogo, ilusões, sono, controle mental e efeitos semelhantes. Por padrão é um teste de atributo puro, salvo regra em contrário.'))}
    ${section('combate-turno','Seu Turno',
      p('Durante seu turno você possui <strong>2 ações, 10 metros de deslocamento e 1 ação livre</strong>. O deslocamento pode ser dividido antes, entre ou depois das ações.')+
      p('<strong>Ação livre.</strong> Permite uma interação simples, como sacar ou guardar uma arma ou item, pegar algo próximo, abrir uma porta destrancada ou usar uma poção em si mesmo. Usar uma poção em outra criatura gasta <strong>1 ação</strong>. Interações complexas podem custar 1 ação a critério do Mestre.')+
      ul(['<strong>Atacar:</strong> 1 ação.','<strong>Disparada:</strong> 1 ação para +10m de deslocamento naquele turno.','<strong>Defender:</strong> 1 ação; ataques contra você têm desvantagem até o início do seu próximo turno.','<strong>Ajudar:</strong> 1 ação; um aliado recebe vantagem no próximo teste relacionado antes do início do seu próximo turno.','<strong>Preparar:</strong> 1 ação; declare um gatilho perceptível e uma ação de custo 1. Se o gatilho ocorrer antes do seu próximo turno, realize a ação fora do turno. Um ataque preparado realiza apenas um ataque, mesmo com Ataque Extra.']))}
    ${section('combate-fora-turno','Habilidades fora do turno',
      p('Habilidades ativas só podem ser usadas fora do próprio turno quando sua descrição permitir. Isso inclui efeitos como Interceptador, bloqueios, proteção, redução ou redirecionamento de dano e respostas a outras ações.')+
      p('<strong>Não existe limite geral de reações por rodada.</strong> Efeitos diferentes podem ser usados fora do turno na mesma rodada. Porém, a mesma habilidade, talento ou efeito só pode ser usado <strong>uma vez por rodada fora do turno</strong>, salvo quando sua descrição disser o contrário.'))}
    ${section('combate-furtividade','Percepção Passiva & Furtividade',
      p('<strong>Percepção Passiva = 10 + bônus total de Percepção.</strong> A regra vale para personagens, NPCs e inimigos.')+
      p('<strong>Esconder-se:</strong> custa 1 ação e é impossível enquanto você estiver visível para a criatura que deseja enganar. Depois de sair de sua visão, conseguir cobertura, escuridão ou outra forma de ocultação, role Furtividade contra a Percepção Passiva do alvo.')+
      p('<strong>Procurar alguém escondido:</strong> custa 1 ação. Role Percepção ou Investigação contra o resultado de Furtividade usado pela criatura para se esconder.'))}
    ${section('combate-manobras','Manobras de Combate',
      p('Salvo indicação contrária, uma manobra custa <strong>1 ação</strong> e exige alcance corpo a corpo.')+
      ul(['<strong>Agarrar:</strong> Atletismo contra Atletismo ou Acrobacia do defensor. Em sucesso, o alvo fica Agarrado. Soltar a criatura não gasta ação e pode ser feito fora do próprio turno. Arrastar ou carregar uma criatura agarrada reduz seu deslocamento à metade.','<strong>Disputar um agarrão:</strong> se alguém tentar agarrar uma criatura já agarrada, os dois agarradores fazem Atletismo contestado; quem vencer mantém o controle.','<strong>Empurrar ou Derrubar:</strong> Atletismo contra Atletismo ou Acrobacia. Em sucesso, empurre o alvo aproximadamente 2m ou deixe-o Caído.','<strong>Desarmar:</strong> Atletismo ou Acrobacia contra Atletismo ou Acrobacia do alvo. Em sucesso, ele deixa cair um objeto segurado.'])+
      note('Criaturas muito maiores ou fisicamente superiores podem receber vantagem para resistir a Agarrar, Empurrar ou Derrubar. Se a diferença física tornar a manobra impossível, o Mestre pode simplesmente impedi-la.'))}
    ${section('combate-cobertura','Cobertura',
      ul(['<strong>Parcial:</strong> +2 na Defesa. Ex.: árvore, mureta ou barricada cobrindo parte do corpo.','<strong>Forte:</strong> +4 na Defesa. Ex.: trincheira, fortificação ou estrutura cobrindo grande parte do corpo.'])+
      p('A cobertura só vale contra ataques para os quais o obstáculo realmente esteja entre atacante e alvo.'))}
    ${section('combate-quedas','Quedas',
      p('Para cada <strong>3 metros de queda</strong>, a criatura sofre <strong>1d6 de dano de impacto</strong>. Quedas menores que 3m normalmente não causam dano. Não existe limite máximo de dano de queda.')+
      p('Exemplos: 3m = 1d6; 6m = 2d6; 9m = 3d6; 15m = 5d6; 30m = 10d6.')+
      p('<strong>Aterrissagem.</strong> Em uma queda de 10m ou menos, depois do dano, faça Atletismo ou Acrobacia para tentar permanecer de pé. A CD é <code>10 + 2 × metros da queda</code>: 3m = CD 16; 6m = CD 22; 10m = CD 30. Em falha, fica Caído. Em quedas de 11m ou mais, fica Caído automaticamente. Ser empurrado, arremessado ou lançado de uma borda segue a mesma regra.'))}
    ${section('combate-habilidades','Usando Habilidades',
      p('<strong>Invocações.</strong> A primeira conjuração consome as duas ações e a Energia indicada. Depois, a criatura normalmente possui 1 ação por turno. Antes do fim da duração, o conjurador pode gastar 1 ação para renovar a invocação, reiniciando duração e restaurando HP quando aplicável.')+
      p('<strong>Ataques com habilidade.</strong> Role diretamente <code>1d20 + atributo de conjuração + Proficiência</code>. Contra monstros, normalmente precisa alcançar a CA/CD. Contra semideuses e criaturas especiais, o alvo pode rolar Defesa. A CD de habilidade é <code>8 + atributo de conjuração + Proficiência + modificadores</code>.')+
      p('<strong>Buffs e curas.</strong> Normalmente não exigem rolagem. <strong>Debuffs.</strong> Normalmente exigem Resistência do alvo; se o debuff fizer parte de um ataque, resolva primeiro o ataque e aplique o efeito conforme a habilidade. O Mestre pode pedir Resistência adicional quando necessário.')+
      p('Usos criativos que não se encaixem nas categorias acima podem exigir atributo, perícia ou outro teste que represente a tentativa.'))}
    ${section('combate-pvp','Semideus contra Semideus',
      p('Em PvP e algumas criaturas especiais, use rolagens opostas: atacante <code>1d20 + bônus de ataque</code> e defensor <code>1d20 + bônus de Defesa</code>. O maior resultado vence; <strong>empates favorecem a ação ofensiva</strong>.'))}
    ${section('combate-criticos','Críticos',
      p('<strong>1 natural:</strong> falha automática. Pode haver consequência narrativa ou pequena consequência mecânica, mas não existe contra-ataque automático.')+
      p('<strong>20 natural:</strong> acerto garantido e dano crítico, salvo regra que altere a margem. Crítico comum dobra os dados. Crítico Brutal, quando adotado, adiciona ao dano o valor máximo dos dados originais.'))}
    ${section('combate-monstros','Combate contra Monstros',
      p('Monstros normalmente usam CA/CD fixa em vez de rolar Defesa, mas continuam realizando Resistências quando uma habilidade exigir.')+
      p('Monstros mitológicos só podem ser mortos definitivamente por materiais ou efeitos adequados. Se um ataque incapaz de finalizá-los os levaria a 0 HP, permanecem em 1 HP até receberem um golpe válido.'))}
    ${section('combate-dano','Dano Base',
      ul(['<strong>Arma corpo a corpo:</strong> 1d8 + bônus de dano.','<strong>Arma à distância:</strong> 1d6 + bônus de dano.','<strong>Desarmado ou improvisado:</strong> 1d6 + bônus de dano.'])+
      p('Progressão: níveis 1–39 usam 1 dado; 40–79 usam 2 dados; 80+ usam 3 dados. Habilidades, passivas, talentos e efeitos podem alterar esses valores.'))}
  `};

  appendUnique('sistema','rebentos-de-roma',section('rebentos-de-roma','Rebentos de Roma',
    p('<strong>Rebentos de Roma</strong> são personagens que alcançaram um dos maiores marcos possíveis dentro da Legião.')+
    ul(['Recebem <strong>+2 pontos de atributo</strong>, obrigatoriamente distribuídos como +1 em dois atributos diferentes.','Esses bônus podem ultrapassar o teto comum de 5, mas nenhum atributo pode passar de <strong>6</strong>.','Os dois +1 de Rebento são bônus protegidos e <strong>não podem ser sacrificados pelo despertar da magia</strong>.','Recebem uma <strong>Bênção Divina</strong> definida junto aos Dii Consentes considerando trajetória, feitos, vínculos e relações. Ela não precisa vir da divindade de ascendência e, na maioria das vezes, não vem.'])+
    p('<strong>Sucessor de Rebento.</strong> O novo personagem criado a partir dessa conquista começa com <strong>9 pontos distribuíveis</strong> em vez de 8 e recebe <strong>+25 de Energia máxima permanente</strong>, começando com 125 antes da progressão normal. O sucessor continua com teto comum 5 até se tornar Rebento por mérito próprio.')+
    p('<strong>Honesta Missio.</strong> Depois de se tornar Rebento, o jogador pode solicitar um descanso honroso quando considerar encerrada a trajetória ativa. A Honesta Missio é opcional, não possui nível obrigatório e nunca acontece automaticamente. O personagem pode continuar ativo pelo tempo que o jogador desejar.')+
    p('Ao entrar em Honesta Missio, o personagem deixa de ocupar uma vaga ativa e abre espaço para um novo personagem, mas continua pertencendo integralmente ao jogador e pode permanecer em Roma, participar de RP, manter família, profissão, propriedades e funções. Não se torna NPC de uso livre.')+
    p('Ele sai do fluxo comum de missões, mas pode participar de grandes acontecimentos, crises, guerras ou mesas específicas. O jogador pode solicitar <strong>uma missão própria a cada 3 meses OFF</strong>, sem prioridade sobre personagens ativos. A progressão regular de nível se encerra caso ainda não tenha atingido o máximo.')+
    p('<strong>Reserva de prole.</strong> A Honesta Missio não libera imediatamente a vaga daquela prole. Ela permanece reservada por aproximadamente <strong>1 ano IN / 3 meses OFF</strong>, período em que o personagem pode voltar a ser principal. Depois disso, a vaga pode ser reaberta conforme a situação da prole.')));

  appendUnique('sistema','boas-praticas-missao',section('boas-praticas-missao','Boas Práticas & Regrinhas de Missão',
    p('Se solicitar uma mestragem de madrugada, assuma a responsabilidade de conseguir participar. Se perceber que está cansado demais ou que não conseguirá continuar, avise e remarque antes. Imprevistos reais acontecem; o objetivo é evitar situações previsíveis que desperdicem o tempo do Mestre e do grupo.')+
    p('<strong>Respeite a mestragem.</strong> Evite cortar o Mestre ou acumular pings enquanto ele prepara uma resposta. Tenha controle da própria ficha, habilidades, recursos e informações básicas do personagem.')+
    p('<strong>Guarda:</strong> personagens acima do nível 60 não permanecem no túnel. O papel da Guarda é proteger e auxiliar quem está chegando, não transformar a chegada em farm de fama. O personagem novo é o foco daquela mesa e deve ter espaço para descobrir sua relação com Roma e com a própria história.')));

  appendUnique('roma','passagem-do-tempo',section('passagem-do-tempo','Passagem do Tempo',
    p('Na Duodécima, <strong>3 meses OFF equivalem a 1 ano IN</strong>. Os anos avançam narrativamente, mas o calendário continua acompanhando os dias e meses reais: setembro continua sendo setembro, festivais não se repetem quatro vezes e as estações permanecem ancoradas no calendário OFF.')+
    p('As viradas de ano acontecem nos <strong>dois equinócios e dois solstícios</strong>: março, junho, setembro e dezembro. A data exata pode variar um ou dois dias e a Staff anuncia cada virada. Em um ano OFF, passam quatro anos IN.')+
    p('<strong>Idade.</strong> A cada virada, personagens envelhecem um ano. Personagens novos começam com a idade informada na criação e não envelhecem retroativamente. O player pode escolher em que data dentro daquele período atualizar a idade, desde que faça isso antes da virada seguinte.')+
    p('<strong>Anos de serviço.</strong> Cada período completo entre duas viradas dentro da Legião vale 1 ano de serviço e 1 marca. O primeiro período só começa a contar integralmente a partir da primeira virada presenciada pelo personagem. Assim, quem entra em maio não ganha marca em junho; o período junho–setembro conta como seu primeiro ano.')+
    p('<strong>Cenas em andamento.</strong> Uma virada não altera retroativamente cenas já iniciadas. A cena permanece no momento IN em que começou; flashbacks usam idade, cargo, serviço e situação daquele período.')));

  appendUnique('roma','bolsa-decimus',section('bolsa-decimus','Bolsa Décimus',
    p('A <strong>Bolsa Décimus</strong> é um programa de habitação de Nova Roma mantido em parceria pelo Senado e pelos Caesari. Oferece apartamentos de aluguel abaixo do mercado para legionários e veteranos que ainda não possuem residência própria.')+
    p('O acesso começa na <strong>segunda marca de serviço</strong>. Também podem permanecer no programa veteranos aposentados após dez anos, Rebentos autorizados a deixar o serviço antes disso, legionários licenciados para funções incompatíveis com o serviço ativo e personagens afastados permanentemente por condições que impossibilitem missões. Deserção, expulsão ou abandono irregular retiram o acesso.')+
    p('As unidades pertencem ao programa e não ao morador. Famílias podem solicitar unidades maiores conforme necessidade e disponibilidade; não há mansões, terrenos privados ou propriedades de luxo.')+
    ul(['<strong>Kitnet de um quarto:</strong> 250 denários por ano narrativo; comporta uma pessoa e um pet pequeno.','<strong>Apartamento de um quarto:</strong> 300 denários por ano narrativo; comporta um casal.','<strong>Apartamento de dois quartos:</strong> 450 denários por ano narrativo; comporta um casal e até duas crianças.'])+
    p('O aluguel é pago a cada virada de serviço e cobre o período seguinte. O personagem pode permanecer no programa enquanto estiver em situação regular e pagar o aluguel. Comprar uma casa encerra automaticamente o benefício.')));

  appendUnique('crafting','crafting-atualizado-260',section('crafting-atualizado-260','Regras Atualizadas de Forja',
    p('<strong>Mineração.</strong> Cada semideus pode fazer até 3 testes a cada 2 dias. Role 1d20; cada sucesso rende 1 fragmento. Em 1 natural, o jogador pode usar a tabela opcional de falha crítica.')+
    p('<strong>Forja.</strong> Para fabricar um item, role <code>1d20 + Força ou Constituição</code>. Habilidades específicas podem alterar o bônus.')+
    ul(['<strong>Simples, DT 7:</strong> ferro e mithril. Armas/escudos: 2 etapas de 15 min; armaduras: 3 etapas de 20 min; limite de 1 falha.','<strong>Mediana, DT 12:</strong> bronze celestial e Uro. Armas/escudos: 3 etapas de 30 min; armaduras/próteses: 3 etapas de 2 h; limite de 2 falhas.','<strong>Complexa, DT 18:</strong> atualmente Ouro Imperial. Armas: 5 etapas de 2 h; não permite armaduras ou escudos; limite de 3 falhas e perda de material deve ser informada à Principia.'])+
    p('<strong>Resistência.</strong> Em 1 natural, a arma perde 1 ponto de resistência; armaduras também perdem durabilidade ao receber um crítico. Com 0, a peça quebra. Ao fim da missão, o reparo automático custa 20 denários.')+
    p('<strong>Armor Toughness.</strong> Leve: +1 Defesa/+1 redução; Defensiva: +2/+1; Responsiva: +1/+2; Pesada: +2/+2, embora ainda não haja material disponível para esse tipo.')+
    p('<strong>Bronze Celestial.</strong> Mata monstros mitológicos e não mitológicos e pode ferir outras criaturas sobrenaturais, como espíritos. <strong>Não causa dano algum a mortais.</strong> Blueprint mediana, +1 ataque, resistência 4 e AT Defensiva.')+
    p('<strong>Ouro Imperial.</strong> Blueprint complexa, +3 ataque, inquebrável e não produz armaduras. Pode ferir seres mitológicos, Titãs e divindades. Ao obter <strong>8 ou menos no d20 bruto</strong> durante a forja, ignorando bônus, marque a Administração e role 1d100 para determinar o que o ferreiro e quem estiver ajudando perdem de si. Um 1 natural conta como duas falhas de confecção.')));

  [
    ['combate','combate-turno','Turno e ações','2 ações, 10 metros de deslocamento, ação livre, Disparada, Defender, Ajudar e Preparar'],
    ['combate','combate-furtividade','Percepção Passiva e Furtividade','Percepção Passiva, esconder-se, procurar criatura escondida'],
    ['combate','combate-manobras','Manobras de combate','Agarrar, empurrar, derrubar, desarmar e disputa de agarrão'],
    ['combate','combate-quedas','Quedas e aterrissagem','Dano de queda, aterrissagem, Atletismo, Acrobacia e condição Caído'],
    ['sistema','rebentos-de-roma','Rebentos de Roma','Rebento, sucessor, atributos, Energia, bênção divina, Honesta Missio e reserva de prole'],
    ['sistema','boas-praticas-missao','Boas práticas de missão','Mestragem, Guarda, túnel e responsabilidade dos jogadores'],
    ['roma','passagem-do-tempo','Passagem do Tempo','Viradas, equinócios, solstícios, idade e anos de serviço'],
    ['roma','bolsa-decimus','Bolsa Décimus','Habitação, aluguel, marcas de serviço, veteranos e apartamentos'],
    ['crafting','crafting-atualizado-260','Forja atualizada','Blueprints, Bronze Celestial, Ouro Imperial, resistência e Armor Toughness']
  ].forEach(x=>addSearch(...x));
})();
