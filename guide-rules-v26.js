(()=>{
  'use strict';

  const CORE='https://stsedd.github.io/duodecima-core';
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fallback={
    system:{
      combat:{actionsPerTurn:2,movementMeters:10,freeActionsPerTurn:1,initiative:'1d20 + Agilidade; se não possuir Agilidade, 1d20 + Destreza',defense:'1d20 + Destreza + bônus aplicáveis',resistance:'teste de atributo puro, salvo alteração explícita',abilityDC:'8 + atributo de conjuração + BP + modificadores especiais',weaponAttack:'1d20 + Força ou Destreza + bônus aplicáveis',abilityAttack:'1d20 + atributo de conjuração + BP',commonActions:{dash:{name:'Disparada',movementBonusMeters:10},defend:{name:'Defender',effect:'Ataques contra a criatura possuem desvantagem até o início do próximo turno.'},help:{name:'Ajudar',effect:'Um aliado recebe vantagem no próximo teste relacionado antes do início do próximo turno de quem ajudou.'},ready:{name:'Preparar',effect:'Declare um gatilho perceptível e uma ação de custo 1. Se acontecer antes do próximo turno, execute a ação preparada fora do turno.'},hide:{name:'Esconder-se',contest:'Furtividade vs. Percepção Passiva'}},outOfTurn:{rule:'A mesma habilidade, talento ou efeito só pode ser utilizado uma vez por rodada fora do turno, salvo quando disser o contrário. Efeitos diferentes podem ser usados na mesma rodada.'},passivePerception:{formula:'10 + bônus total de Percepção'},maneuvers:{sizeDisclaimer:'Criaturas muito maiores ou fisicamente superiores podem receber vantagem para resistir a Agarrar, Empurrar ou Derrubar. Se a manobra for fisicamente impossível, o Mestre pode impedi-la.'},cover:{partial:{defenseBonus:2},strong:{defenseBonus:4}},falling:{damagePerMeters:3,damageDie:'1d6',landing:{availableThroughMeters:10,dcFormula:'10 + 2 × metros da queda',automaticProneFromMeters:11}},criticals:{natural1:'Falha automática; não gera contra-ataque automático.',natural20:'Acerto garantido e dano crítico.',standard:'Dobra os dados.',brutal:'Adiciona o valor máximo dos dados originais.'},baseDamage:{melee:'d8 + bônus',ranged:'d6 + bônus',unarmed:'d6 + bônus'},summons:{firstCastActions:2,actionPerTurn:1,renewalActions:1}},
      rebentos:{attributeRewards:{total:2,mustUseDifferentAttributes:true,maxAttribute:6,sacrificableByMagic:false},divineBlessing:{definedWith:'Dii Consentis',needNotMatchAscendance:true},honestaMissio:{optional:true,specialMissionIntervalOffMonths:3,proleReservation:{onYears:1,offMonths:3}},successor:{startingAttributePoints:9,normalAttributeMax:5,energyBaseBonus:25,energyBaseTotal:125}},
      timeAndService:{offMonthsPerOnYear:3,onYearsPerOffYear:4,yearTurns:['equinócio de março','solstício de junho','equinócio de setembro','solstício de dezembro']},
      bolsaDecimus:{minimumServiceMarks:2,rentPerOnYear:[{type:'kitnet',supports:'1 pessoa e 1 pet pequeno',denarii:250},{type:'apartamento de 1 quarto',supports:'1 casal',denarii:300},{type:'apartamento de 2 quartos',supports:'1 casal e até 2 crianças',denarii:450}]},
      missionGuidelines:{guards:{tunnelMaxLevel:60}}
    },
    equipment:{materials:[],forging:{}}
  };

  async function getJSON(path){
    try{const r=await fetch(`${CORE}/${path}?v=2026.09.27.1`,{cache:'default'});if(!r.ok)throw new Error(r.status);return await r.json();}catch(_){return null;}
  }
  function section(id,kicker,title,badge,body,banner=''){
    return `<section class="section searchable rules-section" id="${id}" data-title="${esc(title)}">${banner?`<figure class="rules-banner"><img src="${banner}" alt="${esc(title)}" loading="lazy" decoding="async"></figure>`:''}<div class="section-head"><div><small>${esc(kicker)}</small><h2>${esc(title)}</h2></div><span>${esc(badge)}</span></div>${body}</section>`;
  }
  function card(title,body,cls=''){return `<article class="paper-card ${cls}"><h3>${title}</h3>${body}</article>`;}
  function list(items){return `<ul class="guide-rule-list">${items.map(x=>`<li>${x}</li>`).join('')}</ul>`;}
  function pageRoot(key){const d=document.createElement('div');d.innerHTML=window.GUIA_CONTENT?.[key]?.html||'';return d;}
  function saveRoot(key,d){if(window.GUIA_CONTENT?.[key])window.GUIA_CONTENT[key].html=d.innerHTML;}

  function buildCombat(sys,conditions){
    const c=sys.combat||fallback.system.combat;
    const conditionHtml=(conditions?.conditions||[]).map(x=>`<details class="searchable" id="cond-${esc(x.id)}" data-title="${esc(x.name)}"><summary>${esc(x.name)}</summary><div><p>${esc(x.description)}</p></div></details>`).join('');
    const death=sys.death||{};
    const html=`
      <div class="rules-opening"><small>ARS · COMBATE</small><h1>Combate</h1><p>Referência completa para turnos, ataques, habilidades, manobras, furtividade, quedas e situações comuns de batalha.</p></div>
      ${section('rolagens','COMBATE · I','Tipos de Rolagem','D20',`
        <div class="grid two">
          ${card('Perícia','<p>Usada para ações ligadas a uma perícia, como escalar, empurrar, observar ou investigar. Quando um Mestre pedir “Teste de Força” ou “Teste de Destreza” para uma tarefa, considere a perícia adequada sempre que houver uma.</p>')}
          ${card('Iniciativa',`<p><strong>${esc(c.initiative)}</strong></p><p>Agilidade representa treinamento de reflexo; sem ela, a iniciativa usa Destreza pura.</p>`)}
          ${card('Ataque','<p>Utilizada quando uma arma, habilidade ou ação precisa atingir diretamente um alvo.</p>')}
          ${card('Defesa',`<p><strong>${esc(c.defense)}</strong></p><p>Esquivar, bloquear e aparar usam a mesma rolagem de Defesa. Armaduras, escudos, passivas e habilidades podem alterar o valor.</p>`)}
          ${card('Resistência',`<p>${esc(c.resistance)}.</p><p>É usada contra venenos, fogo, ilusões, sono, controle mental, possessões e efeitos semelhantes.</p>`)}
          ${card('CD de habilidade',`<p><strong>${esc(c.abilityDC)}</strong></p>`)}
        </div>`)}
      ${section('turno','COMBATE · II','Seu Turno','2 + 10 + 1',`
        ${card('Estrutura do turno',`<p>Você possui <strong>${c.actionsPerTurn||2} ações</strong>, <strong>${c.movementMeters||10} metros de deslocamento</strong> e <strong>${c.freeActionsPerTurn||1} ação livre</strong>. O deslocamento pode ser dividido antes, entre ou depois das ações.</p>`,'feature')}
        <div class="grid two">
          ${card('Ação livre',`<p>Serve para uma interação simples: sacar ou guardar um item, pegar algo próximo, abrir uma porta destrancada ou usar uma poção em si mesmo.</p><p><strong>Usar uma poção em outra criatura gasta 1 ação.</strong> Interações mais complexas podem gastar 1 ação a critério do Mestre.</p>`)}
          ${card('Ações comuns',list([
            '<strong>Atacar:</strong> 1 ação.',
            `<strong>Disparada:</strong> 1 ação para +${c.commonActions?.dash?.movementBonusMeters||10} m de deslocamento no turno.`,
            '<strong>Defender:</strong> 1 ação; ataques contra você têm desvantagem até o início do seu próximo turno.',
            '<strong>Ajudar:</strong> 1 ação; concede vantagem no próximo teste relacionado de um aliado.',
            '<strong>Preparar:</strong> 1 ação; declare um gatilho perceptível e uma ação de custo 1. Ataque preparado realiza apenas um ataque por padrão.'
          ]))}
        </div>`)}
      ${section('habilidades','COMBATE · III','Usando Habilidades','PODER',`
        <div class="grid two">
          ${card('Ataques com habilidade',`<p>Não existe uma rolagem separada para “conjurar”. Faça diretamente <strong>${esc(c.abilityAttack)}</strong>. Contra monstros, alcance a CA/CD; contra semideuses ou criaturas especiais, o alvo pode rolar Defesa.</p>`)}
          ${card('Buffs & Curas','<p>Por padrão não exigem rolagem. Pague a Energia e aplique o efeito em si ou no alvo escolhido.</p>')}
          ${card('Debuffs','<p>Debuffs puros normalmente exigem Resistência do alvo. Quando uma condição faz parte de um ataque, primeiro resolva o ataque; o Mestre pode exigir Resistência adicional quando a criatura ou o balanceamento justificar.</p>')}
          ${card('Invocações',`<p>A primeira conjuração gasta <strong>${c.summons?.firstCastActions||2} ações</strong>. Depois, a criatura possui <strong>${c.summons?.actionPerTurn||1} ação por turno</strong>. Renovar custa ${c.summons?.renewalActions||1} ação e restaura duração e HP quando aplicável.</p>`)}
        </div>
        ${card('Fora do seu turno',`<p>Habilidades ativas só funcionam fora do turno quando a descrição permitir. <strong>Não existe um limite geral de usos fora do turno.</strong> Cada habilidade, talento ou efeito individual pode ser usado uma vez por rodada fora do turno, salvo quando disser o contrário. Portanto, efeitos diferentes podem ser usados na mesma rodada.</p>`,'feature')}`)}
      ${section('furtividade','COMBATE · IV','Percepção Passiva & Furtividade','OCULTO',`
        ${card('Percepção Passiva',`<p><strong>${esc(c.passivePerception?.formula||'10 + bônus total de Percepção')}</strong>.</p><p>Ex.: Percepção +2 = Passiva 12; +5 = 15; +7 = 17. Vale para personagens, NPCs e inimigos.</p>`)}
        <div class="grid two">
          ${card('Esconder-se','<p>Gasta 1 ação. Você não pode se esconder enquanto estiver visível para quem tenta enganar. Depois de sair da visão, encontrar cobertura ou entrar em escuridão, faça <strong>Furtividade vs. Percepção Passiva</strong>.</p>')}
          ${card('Procurar alguém escondido','<p>Gasta 1 ação. Faça <strong>Percepção ou Investigação</strong> contra o resultado de Furtividade usado para se esconder.</p>')}
        </div>`)}
      ${section('manobras','COMBATE · V','Manobras & Cobertura','POSIÇÃO',`
        <p class="section-lead">Salvo quando indicado o contrário, uma manobra gasta 1 ação e exige alcance corpo a corpo.</p>
        <div class="grid two">
          ${card('Agarrar','<p><strong>Atletismo vs. Atletismo ou Acrobacia.</strong> Em sucesso, o alvo fica Agarrado. Soltar não gasta ação e pode ser feito fora do turno. Arrastar reduz seu deslocamento à metade. Se outra criatura disputar o mesmo alvo, os agarradores fazem Atletismo contestado.</p>')}
          ${card('Empurrar ou Derrubar','<p><strong>Atletismo vs. Atletismo ou Acrobacia.</strong> Em sucesso, escolha empurrar aproximadamente 2 metros ou deixar o alvo Caído.</p>')}
          ${card('Desarmar','<p><strong>Atletismo ou Acrobacia vs. Atletismo ou Acrobacia.</strong> Em sucesso, o alvo deixa cair um objeto que esteja segurando.</p>')}
          ${card('Tamanho & força',`<p>${esc(c.maneuvers?.sizeDisclaimer||'Criaturas muito maiores podem receber vantagem para resistir; manobras fisicamente impossíveis podem ser impedidas pelo Mestre.')}</p>`)}
        </div>
        ${card('Cobertura',`<p><strong>Parcial:</strong> +${c.cover?.partial?.defenseBonus??2} Defesa, como árvore, mureta ou barricada. <strong>Forte:</strong> +${c.cover?.strong?.defenseBonus??4} Defesa, como trincheira ou fortificação. A cobertura só vale quando o obstáculo realmente estiver entre atacante e alvo.</p>`,'feature')}`)}
      ${section('quedas','COMBATE · VI','Quedas','IMPACTO',`
        ${card('Dano de queda',`<p>A cada <strong>${c.falling?.damagePerMeters||3} metros</strong>, sofra <strong>${esc(c.falling?.damageDie||'1d6')} de dano de impacto</strong>. Não existe limite máximo. Quedas abaixo de 3 m normalmente não causam dano.</p><div class="formula">3m → 1d6 · 6m → 2d6 · 9m → 3d6 · 15m → 5d6 · 30m → 10d6</div>`,'feature')}
        ${card('Aterrissagem',`<p>Em quedas de até <strong>${c.falling?.landing?.availableThroughMeters||10} m</strong>, depois do dano faça <strong>Atletismo ou Acrobacia</strong>. A CD é <strong>${esc(c.falling?.landing?.dcFormula||'10 + 2 × metros da queda')}</strong>.</p><div class="formula">3m → CD 16 · 6m → CD 22 · 10m → CD 30</div><p>Sucesso: permanece de pé. Falha: fica Caído. A partir de <strong>${c.falling?.landing?.automaticProneFromMeters||11} m</strong>, termina Caído automaticamente. Ser empurrado ou arremessado de uma borda usa as mesmas regras.</p>`)}
      `)}
      ${section('pvp','COMBATE · VII','Semideus contra Semideus','OPOSTO',`
        ${card('Rolagens opostas','<p>Atacante: <strong>1d20 + bônus de ataque</strong>. Defensor: <strong>1d20 + bônus de Defesa</strong>. O maior vence; em empate, vence a ação ofensiva.</p>')}
        <div class="grid two">
          ${card('Falha crítica',`<p><strong>1 natural:</strong> ${esc(c.criticals?.natural1||'Falha automática.')}</p>`)}
          ${card('Acerto crítico',`<p><strong>20 natural:</strong> ${esc(c.criticals?.natural20||'Acerto garantido e dano crítico.')}</p><p><strong>Comum:</strong> ${esc(c.criticals?.standard||'Dobra os dados.')}</p><p><strong>Brutal:</strong> ${esc(c.criticals?.brutal||'Adiciona o valor máximo dos dados originais.')}</p>`)}
        </div>`)}
      ${section('monstros','COMBATE · VIII','Monstros & Dano Base','REFERÊNCIA',`
        <div class="grid two">
          ${card('Combate contra monstros','<p>Monstros normalmente não rolam Defesa; possuem CA ou CD fixa. Eles continuam realizando Resistências quando uma habilidade exigir.</p>')}
          ${card('Metais sagrados','<p>Monstros mitológicos precisam de armas ou efeitos adequados para serem mortos definitivamente. Se um ataque incapaz de finalizá-los os levaria a 0 HP, permanecem com 1 HP até receber um golpe válido.</p>')}
        </div>
        ${card('Dano base',`<p><strong>Corpo a corpo:</strong> ${esc(c.baseDamage?.melee||'d8 + bônus')} · <strong>À distância:</strong> ${esc(c.baseDamage?.ranged||'d6 + bônus')} · <strong>Desarmado/improvisado:</strong> ${esc(c.baseDamage?.unarmed||'d6 + bônus')}.</p><p>Níveis 1–39: 1 dado · 40–79: 2 dados · 80+: 3 dados.</p>`,'feature')}`)}
      ${conditionHtml?section('condicoes','COMBATE · IX','Condições','ESTADOS',`<p class="section-lead">Condições canônicas sincronizadas pelo Duodécima Core.</p><div class="condition-list">${conditionHtml}</div>`):''}
      ${death.roll?section('morte','COMBATE · X','Morte & Vida','0 HP',`${card('Testes contra a morte',`<p>Ao chegar a 0 HP, role <strong>${esc(death.roll)}</strong>. ${death.successAt}+ é sucesso. <strong>${death.successesToStabilize} sucessos</strong> estabilizam; <strong>${death.failuresToDie} falhas</strong> matam. 1 natural conta ${death.natural1Failures} falhas; 20 natural recupera 1 HP e permite agir.</p>`)}`):''}
    `;
    return {title:'Combate',html};
  }

  function patchSystem(sys){
    const root=pageRoot('sistema');
    root.querySelectorAll('#combate,#condicoes,#morte').forEach(x=>x.remove());
    const r=sys.rebentos||fallback.system.rebentos;
    root.insertAdjacentHTML('beforeend',section('rebentos','SISTEMA · REBENTOS','Rebentos de Roma','HONRA',`
      ${card('Benefícios',`<p>Ao tornar-se <strong>Rebento de Roma</strong>, o personagem recebe <strong>+${r.attributeRewards?.total||2} pontos de atributo</strong>, obrigatoriamente em dois atributos diferentes. Esses pontos podem ultrapassar o limite comum de +5, mas nenhum atributo pode ultrapassar <strong>+${r.attributeRewards?.maxAttribute||6}</strong>.</p><p>Os +1 de Rebento <strong>não podem ser sacrificados</strong> pelo despertar da magia.</p>`,'feature')}
      ${card('Bênção Divina',`<p>O Rebento recebe uma bênção definida junto aos <strong>${esc(r.divineBlessing?.definedWith||'Dii Consentis')}</strong>, considerando trajetória, feitos, vínculos e relações divinas. A bênção não precisa vir da divindade de ascendência.</p>`)}
      <div class="grid two">
        ${card('Sucessor de Rebento',`<p>O novo personagem desbloqueado por um Rebento começa com <strong>${r.successor?.startingAttributePoints||9} pontos distribuíveis</strong>, teto comum <strong>${r.successor?.normalAttributeMax||5}</strong> e <strong>+${r.successor?.energyBaseBonus||25} Energia máxima permanente</strong>. Assim, sua Energia base começa em ${r.successor?.energyBaseTotal||125} e progride normalmente.</p><p>Ser sucessor <strong>não</strong> torna o novo personagem automaticamente um Rebento.</p>`)}
        ${card('Honesta Missio','<p>A Honesta Missio é opcional e representa um descanso honroso após os serviços a Roma. Não existe nível obrigatório nem cobrança para encerrar a história do personagem. O Rebento pode seguir ativo pelo tempo que o jogador desejar.</p>')}
      </div>
      ${card('Vida após a Honesta Missio',`<p>Ao solicitá-la, o personagem deixa de ocupar uma vaga ativa, mas continua pertencendo ao jogador e pode ser usado em RP. Sua progressão regular é encerrada; ainda pode participar de grandes acontecimentos e solicitar uma missão própria a cada <strong>${r.honestaMissio?.specialMissionIntervalOffMonths||3} meses OFF</strong>. A vaga da prole permanece reservada por cerca de <strong>${r.honestaMissio?.proleReservation?.onYears||1} ano ON / ${r.honestaMissio?.proleReservation?.offMonths||3} meses OFF</strong>.</p>`)}
    `,'assets/visual/banner-rebentos.webp'));
    root.insertAdjacentHTML('beforeend',section('boas-praticas','SISTEMA · MESA','Boas Práticas & Regras','MISSÕES',`
      ${card('Responsabilidade com a mesa','<p>Se você solicitar uma mestragem de madrugada, assuma a responsabilidade de conseguir participar. Se perceber que está cansado demais ou não conseguirá continuar, avise e remarque antes. Imprevistos reais acontecem; o objetivo é evitar situações previsíveis que interrompam a mesa.</p>')}
      ${card('Respeitem a mestragem','<p>Evite cortar o Mestre, spammar pings enquanto ele escreve e mantenha controle da própria ficha, habilidades, recursos e informações básicas do personagem.</p>')}
      ${card('Guarda em mesas de chegada','<p>Personagens acima do nível <strong>60</strong> não ficam mais no túnel. O papel da Guarda é tankar e auxiliar quem está chegando, não farmar fama. A pessoa principal da mesa é o novo personagem: dê espaço para ela conhecer sua relação com Roma e descobrir quem é.</p>')}
    `,'assets/visual/banner-boas-praticas.webp'));
    saveRoot('sistema',root);
  }

  function patchRoma(sys){
    const root=pageRoot('roma');
    const t=sys.timeAndService||fallback.system.timeAndService;
    const b=sys.bolsaDecimus||fallback.system.bolsaDecimus;
    root.insertAdjacentHTML('beforeend',section('tempo-duodecima','ROMA · CRONOLOGIA','Passagem do Tempo','4:1',`
      ${card('Como o tempo passa',`<p>A cada <strong>${t.offMonthsPerOnYear||3} meses OFF</strong>, considera-se que <strong>1 ano ON</strong> passou. Em um ano OFF, portanto, passam ${t.onYearsPerOffYear||4} anos narrativos. O calendário continua acompanhando os meses reais: a aceleração muda quanto tempo passou na vida dos personagens, não a data corrente.</p>`,'feature')}
      ${card('Viradas de ano',list((t.yearTurns||[]).map(x=>`<strong>${esc(x)}</strong>: +1 ano narrativo.`)))}
      <div class="grid two">
        ${card('Idade & aniversários','<p>A cada virada, personagens envelhecem um ano. Personagens novos começam com a idade de criação e não envelhecem retroativamente. A atualização pode acontecer em qualquer data dentro do período antes da próxima virada.</p>')}
        ${card('Anos de serviço','<p>Cada período completo entre duas viradas dentro da Legião equivale a 1 ano de serviço e 1 marca. O primeiro período começa a contar integralmente a partir da primeira virada que o personagem presencia na Legião.</p>')}
      </div>
      ${card('Cenas em andamento','<p>Viradas não alteram retroativamente cenas já iniciadas. Uma missão começada antes do equinócio continua acontecendo antes dele, mesmo que leve mais tempo OFF para terminar.</p>')}
    `,'assets/visual/banner-tempo-duodecima.webp'));
    root.insertAdjacentHTML('beforeend',section('bolsa-decimus','ROMA · HABITAÇÃO','Bolsa Décimus','MORADIA',`
      ${card('O programa',`<p>Programa de habitação para legionários e veteranos que desejam viver em Nova Roma sem ainda possuir casa própria. O acesso começa a partir da <strong>${b.minimumServiceMarks||2}ª marca de serviço</strong>. As unidades pertencem ao programa e são alugadas; comprar uma casa encerra automaticamente o benefício.</p>`,'feature')}
      ${card('Quem mantém acesso','<p>Além dos legionários elegíveis, podem manter acesso veteranos aposentados regularmente, Rebentos autorizados a deixar o serviço, licenciados para funções incompatíveis com o serviço ativo e afastados permanentemente por fatalidade ou incapacidade. Deserção, expulsão e abandono irregular retiram o acesso.</p>')}
      <div class="table-wrap"><table><thead><tr><th>Moradia</th><th>Comporta</th><th>Aluguel / ano ON</th></tr></thead><tbody>${(b.rentPerOnYear||[]).map(x=>`<tr><td>${esc(x.type)}</td><td>${esc(x.supports)}</td><td><strong>${x.denarii} DN</strong></td></tr>`).join('')}</tbody></table></div>
      <p class="section-lead">O aluguel é pago a cada virada de serviço e cobre o período narrativo seguinte.</p>
    `,'assets/visual/banner-bolsa-decimus.webp'));
    saveRoot('roma',root);
  }

  function patchCrafting(eq){
    const root=pageRoot('crafting');
    const forging=eq.forging||{};
    const gold=(eq.materials||[]).find(x=>x.id==='ouro-imperial');
    const bronze=(eq.materials||[]).find(x=>x.id==='bronze-celestial');
    root.insertAdjacentHTML('beforeend',section('forja-canonica','CRAFTING · FORJA','Forja & Materiais','ATUALIZADO',`
      ${card('Teste de forja',`<p>Para fabricar um item, o ferreiro realiza as etapas da blueprint e rola <strong>${esc(forging.roll||'1d20 + Força ou Constituição')}</strong>. O material é perdido ao alcançar o limite de falhas da categoria.</p>`,'feature')}
      <div class="grid three">
        ${card('Simples','<p><strong>DT 7+</strong> · Ferro/Aço e Mithril.<br>Armas/Escudos: 2 etapas, 15 min.<br>Armaduras: 3 etapas, 20 min.<br>Limite: 1 falha.</p>')}
        ${card('Mediana','<p><strong>DT 12+</strong> · Bronze Celestial e Uro.<br>Armas/Escudos: 3 etapas, 30 min.<br>Armaduras/Próteses: 3 etapas, 2 h.<br>Limite: 2 falhas.</p>')}
        ${card('Complexa','<p><strong>DT 18+</strong> · Ouro Imperial.<br>Armas: 5 etapas, 2 h.<br>Não produz armaduras ou escudos.<br>Limite: 3 falhas.</p>')}
      </div>
      ${bronze?card('Bronze Celestial',`<p>${esc(bronze.targeting?.ruleText||'Não causa dano a mortais.')}</p><p><strong>Bônus de ataque +${bronze.attack}</strong> · Resistência ${bronze.resistance} · Blueprint mediana.</p>`):''}
      ${gold?card('Ouro Imperial',`<p>${esc(gold.description||'Metal divino romano.')}</p><p><strong>Bônus de ataque +${gold.attack}</strong> · Inquebrável · Blueprint complexa.</p><p>${esc(gold.forgingRisk?.ruleText||'Ao rolar 8 ou menos no d20 bruto durante a forja, role 1d100 para a consequência. 1 natural conta como duas falhas.')}</p>`,'feature'):''}
    `));
    saveRoot('crafting',root);
  }

  function rebuildSearch(){
    const out=[];
    for(const [page,obj] of Object.entries(window.GUIA_CONTENT||{})){
      const root=document.createElement('div');root.innerHTML=obj.html;
      root.querySelectorAll('.searchable[id]').forEach(el=>out.push({page,anchor:el.id,deity:el.closest('.deity-detail')?.id||null,title:el.dataset.title||el.querySelector('h2,h3,summary')?.textContent.trim()||el.id,text:el.textContent.replace(/\s+/g,' ').trim()}));
    }
    window.GUIA_SEARCH=out;
  }

  function keepCombatEyebrow(){
    const apply=()=>{if(location.hash.startsWith('#page:combate')){const e=document.querySelector('#pageEyebrow');if(e)e.textContent='ARS · COMBATE';}};
    apply();window.addEventListener('hashchange',()=>setTimeout(apply,0));window.addEventListener('popstate',()=>setTimeout(apply,0));document.addEventListener('click',()=>setTimeout(apply,0));
  }

  async function init(){
    try{await window.DUODECIMA_CORE_READY}catch(_){}
    const [sysRemote,eqRemote,conditions]=await Promise.all([getJSON('data/sistema.json'),getJSON('data/equipamentos.json'),getJSON('data/condicoes.json')]);
    const sys=sysRemote||fallback.system,eq=eqRemote||fallback.equipment;
    window.GUIA_CONTENT=window.GUIA_CONTENT||{};
    window.GUIA_CONTENT.combate=buildCombat(sys,conditions);
    patchSystem(sys);patchRoma(sys);patchCrafting(eq);rebuildSearch();keepCombatEyebrow();
    window.DUODECIMA_GUIDE_RULES_READY=Promise.resolve({ok:true,source:sysRemote?'core':'fallback'});
  }
  window.DUODECIMA_GUIDE_RULES_READY=init();
})();
