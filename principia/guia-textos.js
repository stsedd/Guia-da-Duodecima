/* Guia da Duodécima · textos migrados do Discord (só na principia.html)
   Fonte: "Duodécima Legio Fulminata — Documento-mestre do sistema", consolidado pela Staff a partir
   dos canais do Discord e entregue em 24/11/2026. Cada bloco registra a parte do documento de onde
   veio (data-fonte, não aparece para o jogador).

   Divergências da seção 8 do relatório de auditoria, decididas pela Staff em 25/11/2026:
   13 · penalidade cumulativa de −2 ao voltar de 0 HP: segue removida, como no Core (frase em Morte & vida);
   14 · Energia em 50%: −1 só nas rolagens de d20 (como no site e no Core);
   15 · custo de ritual: vale a tabela (o exemplo do documento era erro de digitação);
   16 · runas: condutor cristal, cinzas ou água; runa superior com +1d4 ou +1d6 (abaixo);
   17 · estrangeiros não usam proles de teste (seção Estrangeiros);
   18 · Honesta Missio: o personagem segue do jogador; vira NPC e fica imune ao reset (Domus);
   19 · críticos na forja: 20 natural pula duas etapas, 1 natural recua uma (seção da Forja);
   20 · Cenric (ex-Áugure): texto a receber;
   21 · exemplo de Tolerância em testes de resistência: sem resposta ainda.

   Operações (aplicadas por principia-estrutura.js, na aba indicada):
   { page, id, append }   → acrescenta ao fim da seção;
   { page, id, replace }  → troca tudo o que vem depois do cabeçalho da seção;
   { page, after|before, html } → seção nova antes/depois de outra;
   { page, remove }       → retira uma seção (o conteúdo foi incorporado em outra);
   { page, fn }           → ajuste pontual. */
(function () {
  'use strict';
  const M = s => 'Documento-mestre · ' + s;

  const T = [];

  /* ======================= CHARACTER ARCHIVE ======================= */

  T.push({ page: 'personagem', before: 'criacao', fonte: M('§1 Usando o d20; Vantagem e desvantagem'), html: `
<section class="section searchable" id="d20" data-title="Usando o d20 vantagem desvantagem rolagens dados">
<div class="section-head"><div><small>MECÂNICAS · O DADO</small><h2>O d20 e as rolagens</h2></div><span>ALEA</span></div>
<article class="paper-card feature"><h3>Usando o d20</h3>
<p>Como outros jogos de interpretação, a Legio Fulminata usa dados para determinar o resultado de certos eventos, trazendo imprevisibilidade às escolhas que você faz. Mesmo assim, incentivamos a agência e a imaginação dos jogadores: o tipo de personagem que você joga e as decisões que toma sobre a história dele influenciam suas chances – para melhor ou para pior – nessas rolagens.</p>
<p>A Legio Fulminata é um jogo focado em narrativa, com recursos que fazem do combate e do embate uma parte importante da jogabilidade. Você e seus companheiros se revezam descrevendo o que seus personagens fazem; o Mestre determina as consequências dessas ações e guia o grupo na evolução colaborativa da história. Quando as regras pedirem – ou quando a situação exigir –, você rola dados para descobrir o que acontece a seguir.</p>
<p>Na maior parte das vezes, usamos o dado de 20 lados (<strong>d20</strong>). Para diferenciar seu personagem de outro da mesma prole, o sistema usa atributos e perícias. E, como personagens com mais níveis se tornam naturalmente mais fortes, também usamos o <strong>bônus de proficiência</strong>, que mostra que você fica mais proficiente no que se propõe a fazer à medida que evolui.</p></article>
<h3 class="subheading">Vantagem e desvantagem</h3>
<p>O sistema usa vantagem e desvantagem para representar situações favoráveis ou desfavoráveis, além dos bônus e ônus que as condições podem aplicar. A mecânica existe para simplificar modificadores e tornar as resoluções mais rápidas.</p>
<div class="grid two">
<article class="paper-card"><h3>Vantagem</h3><p>Role <strong>dois d20</strong> e use o <strong>maior</strong> resultado. Costuma acontecer quando há preparação, superioridade tática, ajuda externa ou algum benefício ativo.</p></article>
<article class="paper-card"><h3>Desvantagem</h3><p>Role <strong>dois d20</strong> e use o <strong>menor</strong> resultado. Representa dificuldade, posição desfavorável, efeitos negativos ou condições ativas.</p></article>
</div>
<article class="warning-card"><strong>Vantagem e desvantagem não se acumulam.</strong><p>Se o personagem tiver as duas ao mesmo tempo, elas se anulam e a rolagem é feita normalmente, com um dado só – não importa quantas fontes de vantagem ou de desvantagem existam.</p></article>
</section>` });

  T.push({ page: 'personagem', id: 'criacao', fonte: M('§1 Criação de personagem'), append: `
<h3 class="subheading">Os atributos em detalhe</h3>
<p>O valor final de cada atributo entra na sua rolagem de d20. Ao criar o personagem, a única coisa que passa do máximo de 5 são bênçãos de heróis míticos. Os semideuses também recebem uma <strong>bonificação divina</strong>, ligada ao parente divino (veja os kits na aba Deuses e Devoção).</p>
<div class="grid two">
<article class="paper-card"><span class="label">FÍSICOS</span>
<p><strong>Força:</strong> o poderio muscular. Influencia o uso de armas mais pesadas, como espadas, lanças e machados, e entra no dano.</p>
<p><strong>Destreza:</strong> agilidade e acurácia. Influencia armas de finesse, como espadas, arcos e adagas, e entra no dano.</p>
<p><strong>Constituição:</strong> a constituição física. Influencia a saúde e a capacidade de resistir a feitiços, venenos, sono e outros efeitos negativos, e soma na vitalidade ganha a cada 10 níveis.</p></article>
<article class="paper-card"><span class="label">MENTAIS</span>
<p><strong>Inteligência:</strong> intelecto e raciocínio; também é o atributo de análise para capacidades mágicas e para investigar os arredores.</p>
<p><strong>Fé:</strong> o poderio divino de um semideus ou sacerdote, usado em intervenções divinas e no uso de poderes. Também cobre fé em si mesmo, sabedoria e vontade.</p>
<p><strong>Carisma:</strong> a capacidade de convencimento e interação social, usada em rolagens como persuasão, enganação e manifestação artística.</p></article>
</div>` });

  T.push({ page: 'personagem', id: 'pericias', fonte: M('§1 Perícias'), append: `
<article class="paper-card"><h3>Atributo sugerido</h3><p>Perícias representam a capacidade de se sobressair em certas funções através do treinamento, e são somadas ao dado quando aquela habilidade é relevante. Cada perícia tem um atributo sugerido para a rolagem, mas o Mestre (e o próprio jogador) pode sugerir outro atributo – ou nenhum – quando fizer mais sentido na cena.</p></article>` });

  T.push({ page: 'personagem', id: 'prof', fonte: M('§1 Bônus de proficiência; Expertise'), append: `
<article class="paper-card"><h3>Na prática</h3>
<p>O bônus de proficiência (BP) só entra em rolagens de d20, quando o personagem é bom em algo: armas treinadas até a maestria, perícias escolhidas na criação ou na evolução e o uso de habilidades.</p>
<p><strong>Exemplo:</strong> um personagem de nível 0 a 20 com +3 de Fé e a perícia Percepção rola <strong>1d20 + 3 + 1</strong>. No nível 61 a 80, rola <strong>1d20 + 3 + 4</strong>. Com expertise em Percepção, as mesmas rolagens ficam <strong>1d20 + 3 + 2</strong> e <strong>1d20 + 3 + 8</strong>.</p>
<p>Só é possível ter expertise em uma perícia que o personagem já possui.</p></article>` });

  T.push({ page: 'personagem', id: 'treinos', fonte: M('§1 Treinamentos de estacas; Treinamento com arma; Treinamento de perícia'), append: `
<h3 class="subheading">Como treinar</h3>
<div class="grid two">
<article class="paper-card"><h3>Ações de treino</h3><p>Todas as habilidades ativas podem ser treinadas no dia a dia: combate nos Campos de Marte & Bellona, cuidado de plantas nos Jardins de Baco, persuasão na taverna Impostos, Sexo e Expansão Territorial. Quanto mais bem elaborada a ação de treino, mais estacas ela rende; em média, um treino rende de 2 a 10 estacas.</p>
<p>Treinar com um <strong>Soldado</strong> garante +2 estacas, e com um <strong>Centurião</strong>, +3, independentemente do tipo de treino.</p></article>
<article class="paper-card"><h3>Registro</h3><p>Ao fazer uma ação de treino, marque um Registrador no canal de treinamento e estacas com o link da cena; ele analisa o treino e define quantas estacas você ganhou. Ao treinar uma perícia, registre-a no mesmo canal e mantenha a ficha do personagem atualizada.</p></article>
<article class="paper-card"><h3>Armas</h3><p>Todo semideus chega ao Acampamento como um sobrevivente e pode treinar com qualquer arma, geralmente com mais de uma. Recomendamos o púgio, o gládio, a spatha e o pilo.</p></article>
<article class="paper-card"><h3>Perícias novas</h3><p>O limite de perícias treináveis existe para que nem todo personagem tenha todas as perícias do jogo: são até cinco novas perícias ao longo da trajetória, uma em cada marco de nível.</p></article>
</div>` });

  T.push({ page: 'personagem', id: 'recursos', fonte: M('§1 Saúde, Mente & Energia'), append: `
<h3 class="subheading">Vitalidade</h3>
<p>A vitalidade, também chamada de Pontos de Vida (PV) ou Hit Points (HP), representa a integridade física de um semideus em combate, treino ou missão. Ainda assim, este é um sistema narrativo: o Mestre pode aplicar penalidades ou condições independentemente do HP atual. Um personagem quase com a vida cheia pode lutar de forma limitada se tiver uma perna quebrada, uma infecção ou uma maldição ativa. Esforços contínuos, como escaladas, corridas longas, natação exaustiva, venenos, desidratação ou condições mágicas, também podem reduzir a vitalidade aos poucos.</p>
<article class="paper-card feature"><h3>Cálculo do HP</h3><p>O HP inicial está no kit de cada deus. Por padrão, é <strong>20 + Constituição</strong>; algumas proles, como as de Marte e Bellona, têm mais. A cada 10 níveis, o personagem soma <strong>+5 + Constituição</strong> (em alguns casos, mais) ao HP máximo. Quando a Constituição aumenta, por talento ou por ponto de atributo, todo o HP muda junto e precisa ser recalculado.</p></article>
<h3 class="subheading">Sanidade</h3>
<div class="grid two">
<article class="paper-card"><h3>Recuperação</h3><p>A Sanidade volta por meio de algumas habilidades, momentos de calma, atividades que tragam conforto ou atendimento médico. O Médico pode agir como “psicólogo” para acalmar a mente de um semideus instável.</p></article>
<article class="paper-card"><h3>Além dos números</h3><p>Mestres podem aplicar penalidades narrativas conforme a situação. Abaixo de Abalado, o −3 em Fé também vale para o uso de habilidades e perícias; À Beira da Loucura, o narrador pode atribuir novas fobias ou medos, temporários ou permanentes.</p></article>
</div>
<h3 class="subheading">Energia</h3>
<p>A Energia mede o poderio divino: quantas habilidades o semideus consegue conjurar antes de se esgotar. Os romanos são treinados para não depender só dos poderes e se virar com espada, lança e escudo; a barra existe para que ninguém use poderes o tempo inteiro sem consequência.</p>
<div class="grid two">
<article class="paper-card"><h3>Barra de Energia</h3><p>Começa em <strong>100</strong> e recebe <strong>+25 a cada 5 níveis</strong>: nível 5 → 125; nível 10 → 150; nível 15 → 175; nível 100 → 600.</p></article>
<article class="paper-card"><h3>Custo das habilidades</h3><p>Passivas não gastam Energia nem ações, salvo quando a própria habilidade disser o contrário. Ativas custam conforme o nível:</p><p><strong>Níveis 1 e 2:</strong> 20 · <strong>3 e 4:</strong> 45 · <strong>5 e 6:</strong> 70 · <strong>7 e 8:</strong> 95 · <strong>9 e 10:</strong> 130.</p></article>
<article class="paper-card"><h3>Energia zerada</h3><p>Com 0 de Energia, ou negativa, o semideus desmaia na hora. Para todos os efeitos, é uma criatura desacordada com 0 de HP, mas estável: não faz testes contra a morte nem corre perigo de morrer, a não ser que a situação seja perigosa por si só. Costuma acordar depois de cerca de 1d4 horas de sono ininterrupto, menos se estiver em um lugar confortável.</p></article>
<article class="paper-card"><h3>Recuperando Energia</h3><p>Alguns semideuses mais raros conseguem restaurar parte da Energia de outros, assim como alguns itens e poções. A forma padrão continua sendo o descanso.</p></article>
</div>` });

  T.push({ page: 'personagem', id: 'descanso', fonte: M('§1 Descanso'), replace: `
<p>Por mais heroicos e militarizados que sejam, os semideuses não passam cada hora do dia em trabalho, exploração, interação social e combate. Precisam de tempo para descansar, dormir e comer, cuidar dos ferimentos e revigorar a mente e o espírito para usar habilidades outra vez. Ao longo do dia, fazem descansos curtos; para encerrá-lo, um descanso longo.</p>
<div class="grid two">
<article class="paper-card feature"><span class="label">DESCANSO CURTO</span><h3>1 hora, no mínimo</h3><p>Um período de inatividade, geralmente no almoço ou em um lugar seguro durante uma missão. O personagem não faz nada mais extenuante do que comer, beber, ler, cuidar de ferimentos e, principalmente, conversar.</p><p>Recupera <strong>25 HP</strong> e <strong>150 de Energia</strong>, e devolve a capacidade de usar de novo habilidades que tenham limite de usos (se houver Energia para elas).</p></article>
<article class="paper-card feature"><span class="label purple">DESCANSO LONGO</span><h3>8 horas, no mínimo</h3><p>Cerca de 6 horas de sono e 2 de atividades leves, como ler, conversar, comer ou ficar de guarda em missão. Se for interrompido por atividade extenuante – 1 hora de caminhada, combate de qualquer nível, uso de habilidades, magia ou feitiços –, o descanso precisa recomeçar para dar qualquer benefício.</p><p>Ao final, o personagem recupera <strong>todo o HP</strong> e <strong>toda a Energia</strong>. Ferimentos não se curam magicamente, e ossos quebrados não voltam ao normal, seja qual for a “barra de vida”.</p></article>
</div>` });

  T.push({ page: 'personagem', id: 'legados', fonte: M('§4 Legados'), append: `
<h3 class="subheading">Exemplos e registro</h3>
<div class="grid two">
<article class="paper-card"><h3>Combinações possíveis</h3><p><strong>Legado Direto:</strong> Frank Zhang, filho de Marte com herança de Netuno por parte materna; uma filha de Marte com legado de Letum por parte de mãe; um filho de Febo com legado distante de Mercúrio.</p><p><strong>Legado Composto:</strong> uma neta de Laverna por parte de mãe e de Arcus por parte de pai.</p><p>Nas passivas e ativas, você pode trocar menos do que o máximo, ou nenhuma, se preferir.</p></article>
<article class="paper-card"><h3>Registro e restrições</h3><p>Todas as trocas de habilidade precisam estar especificadas na aba do personagem no fórum de personagens.</p><p>Os Triunviros não usam o sistema de Legados: o sangue dos senhores do dia, da noite, do mar e dos mortos é forte demais e se sobressai a qualquer outro. E não é possível ocupar duas vagas de teste – por isso, não dá para mesclar Marte e Bellona.</p></article>
</div>` });

  T.push({ page: 'personagem', id: 'reclamacao', fonte: M('§4 Reclamações'), append: `
<article class="paper-card"><h3>Como pedir</h3><p>Diferente do modelo grego, a reclamação romana não é só um evento simbólico: é o reconhecimento direto de uma divindade e, por isso, acontece através de uma missão. Tempo de atividade e nível, sozinhos, não tornam ninguém elegível. Para pedir a sua, crie um tópico no fórum de solicitar mestragem indicando que deseja a missão de reclamação. Pedir a missão não obriga o deus a gostar de você – ela existe justamente para descobrir se ele gosta.</p></article>` });

  T.push({ page: 'personagem', after: 'reclamacao', fonte: M('§4 Heranças Divinas'), html: `
<section class="section searchable" id="herancas" data-title="Heranças divinas herança simples complexa heroica VIP Patrono Nobre">
<div class="section-head"><div><small>PERSONAGEM · HERANÇA</small><h2>Heranças Divinas</h2></div><span>DONA</span></div>
<article class="paper-card feature"><h3>Nem todo presente é só um presente.</h3>
<p>Às vezes, uma arma, um objeto ou uma relíquia chega até o personagem porque deveria chegar. Frank Zhang recebeu de Marte uma lança com um dente de dragão; Piper McLean sentiu que Katopris, a antiga adaga de Helena de Esparta, deveria ser sua; Percy Jackson recebeu Anaklusmos pelas mãos de Quíron. Alguns itens carregam história – e, quase sempre, uma bela quantidade de problema esperando o momento certo para aparecer.</p>
<p>Heranças divinas são presentes entregues para auxiliar a jornada de um semideus, legado ou personagem que chamou a atenção de alguma força maior. Podem vir diretamente de um deus, de um intermediário, como recompensa de missão, como sinal de reconhecimento ou como parte de uma trama.</p></article>
<h3 class="subheading">Como conseguir</h3>
<div class="grid three">
<article class="paper-card"><h3>VIP Patrono</h3><p>Dá direito a uma <strong>herança simples</strong>.</p></article>
<article class="paper-card"><h3>VIP Nobre</h3><p>Dá direito a uma <strong>herança complexa</strong>.</p></article>
<article class="paper-card"><h3>Mérito narrativo</h3><p>Heranças também podem ser conquistadas por missões difíceis ou acontecimentos importantes da lore. As <strong>heroicas</strong> não fazem parte dos benefícios de VIP.</p></article>
</div>
<h3 class="subheading">Tipos de herança</h3>
<div class="grid three">
<article class="paper-card"><span class="label">SIMPLES</span><h3>Valor narrativo</h3><p>Item especial de baixo ou nenhum impacto mecânico. Normalmente não dá bônus em rolagens, exceto armas de materiais que já têm propriedades próprias, como o bronze celestial. O foco é dar ao personagem uma marca própria, não torná-lo mais forte.</p><p><strong>Exemplos:</strong> uma espada de bronze celestial que vira anel, caneta ou pulseira; um boné que dá invisibilidade momentânea, curta e de uso limitado; um computador encantado que acessa algumas informações por um tempo; uma moeda que esquenta quando há perigo; um colar que brilha diante de monstros ou de magia divina.</p></article>
<article class="paper-card"><span class="label">COMPLEXA</span><h3>Até +2 situacional</h3><p>Funciona como a simples, mas tem uma propriedade mais relevante e pode dar um bônus mecânico situacional de até <strong>+2</strong>, em ataques, dano, Defesa, perícias, uso de habilidades ou outro teste aprovado pela Staff. O bônus precisa ter uma condição clara de uso e nunca funciona como vantagem permanente.</p><p><strong>Exemplos:</strong> óculos de sol que dão +2 em Percepção durante o dia; uma lâmina aquecida com +2 de dano contra alvos específicos; um escudo com +2 de Defesa contra criaturas mitológicas; uma luva com +2 em testes de Forja ou Prestidigitação; um manto com +2 em Furtividade à noite ou no escuro.</p></article>
<article class="paper-card"><span class="label purple">HEROICA</span><h3>Mais de 30 de Afinidade</h3><p>Itens muito mais raros, com efeitos mecânicos e narrativos marcantes, pensados para personagens cuja trajetória chamou a atenção dos deuses. Exige <strong>mais de 30 pontos de Afinidade com pelo menos uma divindade</strong> – um pré-requisito, não uma garantia. Surge após missões de lore, desafios difíceis ou feitos reconhecidos, e depende da alta Staff.</p><p><strong>Exemplos:</strong> uma réplica da Égide, o escudo de Júpiter; a cabeça funcional da Medusa, que petrifica sob condições determinadas; uma relíquia em forma de espada que libera raios ou manipula ventos; um artefato que evolui conforme objetivos são cumpridos.</p></article>
</div>
<h3 class="subheading">Regras gerais</h3>
<ul>
<li>Toda herança precisa ser aprovada pela Staff antes de entrar em jogo. Peça a sua no canal de ficha de herança e marque um Administrador; se não souber o que pedir, os administradores ajudam com sugestões.</li>
<li>A herança deve fazer sentido com o personagem, sua história, sua prole, seu legado ou a divindade envolvida. Não precisa estar ligada ao pai ou à mãe divina, desde que exista uma justificativa narrativa coerente.</li>
<li>Heranças simples não dão bônus mecânico direto, salvo quando o material do item já tem propriedades próprias.</li>
<li>Heranças complexas podem dar bônus de até +2, sempre situacionais e bem delimitados.</li>
<li>Heranças heroicas exigem mais de 30 pontos de Afinidade com uma divindade e aprovação da alta Staff; a Afinidade não garante o item.</li>
<li>A Staff pode pedir ajustes, reduzir ou aumentar efeitos, limitar usos ou negar uma herança forte demais, genérica demais ou fora da proposta do servidor.</li>
</ul>
<p>Uma herança divina não existe para tornar o personagem invencível, e sim para diferenciá-lo e tornar a jornada mais marcada – e, de preferência, um pouco mais perigosa também.</p>
</section>` });

  T.push({ page: 'personagem', id: 'estrangeiros', fonte: M('§4 Semideuses de Outros Panteões'), append: `
<h3 class="subheading">Em detalhe</h3>
<div class="grid two">
<article class="paper-card"><h3>Quem pode vir</h3><p>São aceitos personagens <strong>gregos, nórdicos, egípcios e celtas</strong>. Não aceitamos, neste sistema, semideuses de panteões orientais, africanos ou de religiões nativas das Américas, incluindo panteões brasileiros: essas divindades existem na lore, mas permanecem ligadas às suas próprias regiões e povos. O recorte atual contempla principalmente os panteões do ocidente europeu.</p><p>O sistema também serve de intercâmbio entre servidores: muitos jogadores vêm de servidores gregos e podem trazer seus personagens sem transformá-los em romanos.</p></article>
<article class="paper-card"><h3>Vagas</h3><p>Estrangeiros entram no sistema de vagas, mas a vaga é do panteão, não da divindade: um filho de Poseidon ocupa uma vaga de grego (e não de Cimopoleia); um filho de Thor, uma vaga de nórdico. Confira as vagas no canal de vagas.</p><p><strong>Novos personagens estrangeiros não podem usar a mecânica de nenhuma prole que exija teste.</strong> Isso inclui Marte Ultor, Bellona e todos os Triúnviros, como Júpiter e Summanus. A regra também vale para futuras proles de teste. Personagens estrangeiros já aprovados mantêm a mecânica que usam.</p></article>
<article class="paper-card"><h3>Contrapartes</h3><p><strong>Fobetor está temporariamente indisponível para novos personagens.</strong> Quem já tem um personagem de Fobetor pode continuar jogando com ele. O kit continua aberto para consulta e para montar fichas de teste.</p><p>Não criamos árvores de habilidades novas para cada divindade estrangeira; os poderes vêm das proles romanas. Com contraparte direta, é simples: <strong>Hermes → Mercúrio</strong>, <strong>Tyr → Justitia</strong>, <strong>Andraste → Victoria</strong>. Narrativamente, o personagem continua filho do deus estrangeiro. Você pode sugerir a prole, mas a palavra final é dos Dii Consentis – converse com a Staff antes de planejar tudo.</p><p>Algumas divindades ainda não estão disponíveis: Atena, por exemplo, só poderá ser escolhida quando houver uma mecânica que represente sua prole. Nos kits dos Venti e dos Alati, estrangeiros não recebem os acúmulos (por isso, recomendamos o sistema de Legados).</p></article>
<article class="paper-card"><h3>Fama</h3><p>Ser filho de um deus estrangeiro não dá a Fama positiva da contraparte romana: isso também vale para personagens antigos que já usam uma contraparte hoje restrita. As penalidades, porém, continuam: um filho de Poseidon com a mecânica de Netuno é recebido com tudo o que a associação com Netuno representa, incluindo a perda de 15 pontos de Fama na reclamação.</p><p>Além disso, há a Fama inicial do panteão: <strong>gregos, −10</strong> (reputação de baderneiros, desorganizados, caóticos, indisciplinados e, às vezes, fedidos); <strong>celtas, −15</strong> (vistos com desconfiança depois dos ataques); <strong>nórdicos e egípcios, 0</strong>.</p></article>
<article class="paper-card"><h3>Itens e bênçãos antigos</h3><p>Itens especiais, armas únicas, artefatos e espólios de outros sistemas não entram no RPG: devem ter sido perdidos, destruídos ou deixados para trás antes da chegada. Um item antigo indispensável à identidade do personagem precisa ser adaptado às regras de <a href="#herancas">Herança</a>, com seus limites, custos e exigências.</p></article>
<article class="paper-card"><h3>Idiomas</h3><p>Assim como os romanos sabem latim naturalmente, os gregos leem, escrevem e falam grego antigo, e os nórdicos dominam o germânico antigo e o alfabeto rúnico futhark.</p></article>
</div>
<p>Estar em Roma significa viver sob as regras de Roma. Gregos, nórdicos e egípcios podem manter sua cultura e a relação com seus deuses, mas ser estrangeiro não é passe livre para ignorar a hierarquia, causar confusão ou desrespeitar as regras do Acampamento.</p>` });

  /* ======================= COMBATE ======================= */

  T.push({ page: 'combate', fonte: M('§2 Tipos de Rolagem; Resumo'), fn(root) {
    const card = [...root.querySelectorAll('#rolagens article')].find(a => /^Ataque$/i.test(a.querySelector('h3')?.textContent.trim() || ''));
    if (card && !card.querySelector('.pg-formula')) {
      const p = document.createElement('p');
      p.className = 'pg-formula';
      p.innerHTML = '<strong>Com arma: 1d20 + Força ou Destreza + bônus aplicáveis</strong> · com habilidade: 1d20 + atributo de conjuração + BP.';
      card.querySelector('h3').after(p);
    }
  } });

  T.push({ page: 'combate', id: 'rolagens', fonte: M('§1 Testes de resistência; §2 Tipos de Rolagem'), append: `
<article class="paper-card feature"><h3>Testes de resistência</h3>
<p>Muitas habilidades, magias ou criaturas pedem que o alvo faça um teste de resistência para evitar parte ou todos os efeitos. A descrição pode dizer qual atributo usar e o que acontece em sucesso ou falha; quando não diz, o alvo usa o que for mais conveniente para a situação – uma habilidade disparada pode pedir Destreza para não ser atingido, por exemplo.</p>
<p>A DT para resistir às suas habilidades ou magias é <strong>8 + atributo de conjuração + bônus de proficiência + modificadores especiais</strong>. Exemplo: um semideus de nível 70 (BP +4) que conjura com Fé e tem +5 nesse atributo tem <strong>DT 17</strong> (8 + 4 + 5).</p>
<p>Testes de resistência usam atributo puro, e não perícia, salvo quando uma regra disser o contrário. O talento Resiliente permite somar a proficiência a alguns deles, e habilidades como a Aura da Proteção de Juventas também podem dar bônus.</p></article>` });

  T.push({ page: 'combate', id: 'habilidades', fonte: M('§2 Usando Habilidades'), append: `
<div class="grid two">
<article class="paper-card"><h3>Invocações em detalhe</h3><p>Invocações, como Venti e esqueletos, não exigem rolagem para serem conjuradas, salvo quando a habilidade disser o contrário. Normalmente usam o ataque de conjuração do personagem e têm uma ficha própria, completa ou simplificada, com HP, CA/Defesa e outras informações. Quando a ficha não traz um bônus para determinada rolagem, use o atributo indicado para a invocação.</p></article>
<article class="paper-card"><h3>Efeitos diversos</h3><p>Nem todo uso de habilidade cabe nas categorias acima: usar ventos para impedir que destroços caiam sobre alguém, teleportar-se numa situação incomum, manipular árvores para lançar objetos. Nesses casos, o Mestre pode pedir uma rolagem de atributo, de perícia ou outro teste que represente melhor o que está sendo tentado. Se quiser usar uma habilidade de forma criativa, converse com o Mestre: a palavra final sobre situações não previstas é dele.</p></article>
<article class="paper-card"><h3>Debuffs sem resistência indicada</h3><p>Como ainda estamos em rework, algumas habilidades não dizem qual rolagem o alvo faz para resistir. Nesses casos, o Mestre decide o atributo; em treinos, os jogadores podem combinar entre si.</p></article>
<article class="paper-card"><h3>Fora do turno, em detalhe</h3><p>A exceção ao turno vale para habilidades feitas para responder a uma ação: bloquear um ataque, reduzir ou redirecionar dano, proteger uma criatura – como o talento Interceptador. Barreiras que duram dois turnos ou mais precisam ser conjuradas no seu turno. Se uma habilidade parecer contradizer essa regra ou estiver mal escrita, marque a Equipe de Balanceamento.</p></article>
</div>` });

  T.push({ page: 'combate', id: 'pvp', fonte: M('§2 Semideus contra Semideus'), append: `
<div class="grid two">
<article class="paper-card"><h3>Consequências da falha crítica</h3><p>O 1 natural pode ter consequência só narrativa ou um pequeno efeito mecânico: deixar a arma cair, sofrer um ferimento leve, perder o equilíbrio ou simplesmente passar vergonha na frente da coorte.</p></article>
<article class="paper-card"><h3>Dano crítico, com exemplos</h3><p>O 20 natural acerta e causa dano crítico, salvo quando uma habilidade muda a margem de crítico. <strong>Comum:</strong> 1d8 + 5 vira 2d8 + 5; 2d6 + 3 vira 4d6 + 3. <strong>Brutal:</strong> 1d8 + 5 vira 1d8 + 8 + 5; 2d6 + 3 vira 2d6 + 12 + 3.</p><p>O Crítico Brutal pode ser usado por alguns Mestres e em treinos, desde que todos estejam de acordo.</p></article>
</div>` });

  T.push({ page: 'combate', id: 'monstros', fonte: M('§2 Combate contra Monstros; Dano Base'), append: `
<div class="grid two">
<article class="paper-card"><h3>Armas comuns e monstros</h3><p>Um monstro com CA 16 é atingido por um resultado final de 16 ou mais. Monstros mitológicos só morrem de vez com armas ou efeitos capazes de feri-los, como bronze celestial, ouro imperial ou ferro estígio. Algumas criaturas também têm resistência a armas comuns e recebem só <strong>metade do dano</strong>. Mestres mais generosos podem deixar a criatura incapacitada por um tempo quando chega a 1 HP, dando ao grupo uma chance de fugir – não construa sua estratégia esperando por isso.</p></article>
<article class="paper-card"><h3>Sobre o dano base</h3><p>O dano base vale para ataques com armas e pode ser alterado por habilidades, passivas, talentos e efeitos concedidos pelo Mestre. Quando uma habilidade de prole diz que aumenta o dano dos ataques do personagem, normalmente é desse dano base que ela fala. Algumas habilidades chegam a 4d8 ou 4d6, com custo maior de Energia ou efeitos extras – por isso, equilibrar armas e habilidades importa em missões longas.</p></article>
</div>` });

  T.push({ page: 'combate', id: 'morte', fonte: M('§1 Morte & vida'), replace: `
<article class="paper-card feature"><h3>Testes contra a morte</h3>
<p>Sempre que um semideus começa o turno com 0 de HP, faz um teste especial de resistência contra a morte, para saber se se aproxima dos domínios de Mors e Dis Pater ou se se agarra à vida. Esse teste não está ligado a nenhum atributo: o semideus está nas mãos do Destino e, às vezes, dos aliados, ajudado só por habilidades que aumentem suas chances.</p>
<p>Role <strong>1d20</strong>: <strong>10 ou mais</strong> é sucesso; abaixo disso, falha. O que conta é o acúmulo: no <strong>terceiro sucesso</strong>, o personagem se estabiliza; na <strong>terceira falha</strong>, morre. Sucessos e falhas não precisam ser seguidos – anote os dois até chegar a três iguais. A contagem zera quando o personagem recupera HP ou se estabiliza. Voltar de 0 HP não deixa <strong>nenhuma penalidade cumulativa</strong> nas rolagens.</p></article>
<div class="grid two">
<article class="paper-card"><h3>1 ou 20 natural</h3><p>Um <strong>1</strong> conta como duas falhas. Um <strong>20</strong> devolve 1 HP, e o personagem pode agir no turno.</p></article>
<article class="paper-card"><h3>Dano com 0 de HP</h3><p>Qualquer dano sofrido com 0 de HP é uma falha automática. Se vier de um acerto crítico, são duas falhas.</p></article>
<article class="paper-card"><h3>Estabilizando um aliado</h3><p>O melhor jeito de salvar um semideus com 0 de HP é curá-lo. Sem cura, gaste sua ação em primeiros socorros: teste de <strong>Medicina, DT 10</strong> por padrão. O Mestre pode mudar a DT conforme os ferimentos ou a urgência; uma criatura sangrando pode exigir DT 15.</p></article>
<article class="paper-card"><h3>Criatura estável</h3><p>Uma criatura estável não faz testes contra a morte, mesmo com 0 de HP, mas continua inconsciente. Volta a fazer os testes se sofrer qualquer dano. Sem cura, recupera <strong>1 HP depois de 1d4 horas</strong>.</p></article>
</div>` });

  T.push({ page: 'combate', after: 'morte', fonte: M('§2 Resumo Master Mega Resumido'), html: `
<section class="section searchable" id="resumo-combate" data-title="Resumo do combate consulta rápida">
<div class="section-head"><div><small>COMBATE · RESUMO</small><h2>Resumo do combate</h2></div><span>BREVIARIVM</span></div>
<ul>
<li>Por turno: <strong>2 ações, 10 m de deslocamento e 1 ação livre</strong>.</li>
<li>Poção em si mesmo usa a ação livre; em outra criatura, 1 ação.</li>
<li>Disparada dá +10 m de deslocamento.</li>
<li>Defender dá desvantagem aos ataques contra você até o seu próximo turno.</li>
<li>Ataques corpo a corpo usam, por padrão, d8; à distância, d6.</li>
<li>Ataques com arma usam Força ou Destreza; com habilidade, normalmente o atributo de conjuração.</li>
<li>DT de habilidade = 8 + atributo de conjuração + proficiência.</li>
<li>Defesa = 1d20 + Destreza + bônus aplicáveis.</li>
<li>Buffs e curas normalmente não exigem rolagem; debuffs normalmente exigem Resistência, com atributo puro.</li>
<li>Monstros normalmente têm CA/DT fixa, e os mitológicos só morrem de vez com materiais adequados.</li>
</ul>
<p>O sistema existe para ajudar a narrativa, não para substituí-la. Divirtam-se.</p>
</section>` });

  /* ======================= CURSUS HONORUM ======================= */

  T.push({ page: 'cursus', id: 'hierarquia', fonte: M('§7 Hierarquia; Fama; Posições de Honra'), append: `
<h3 class="subheading">Regras dos cargos</h3>
<div class="grid two">
<article class="paper-card"><h3>Salários</h3><p>Os salários semanais só são pagos se forem pedidos <strong>na segunda-feira, no canal de salário</strong>. Quem deixa passar o dia do pagamento perde o valor daquela semana.</p></article>
<article class="paper-card"><h3>Religio ou Legio</h3><p>Quem entra na Religio perde o acesso aos cargos da Legio, e vice-versa. Para ser <strong>Pontifex</strong>, é preciso ser, no mínimo, Rebento de Roma Aeterna.</p></article>
<article class="paper-card"><h3>Probatio</h3><p>Todo campista recebe, ao chegar, uma plaquinha com o nome “Probatio”, que usa no pescoço sem tirar. As piores tarefas ficam com ele: limpar os estábulos (incluindo os elefantes de guerra Hannibal e Trombone), lavar banheiros, esfregar o chão da Principia e lustrar os galgos Aurum e Argentum – mais de um semideus já perdeu a mão nessa. Uma profecia ou uma missão ajuda a virar Legionário mais rápido.</p></article>
<article class="paper-card"><h3>Legionário</h3><p>O cargo mais comum do Acampamento. Legionários aconselham e treinam os Probatii e obedecem a Optios, Centuriões e demais cargos superiores. O quarto próprio é minúsculo e sem luxo, mas tem privacidade.</p></article>
<article class="paper-card"><h3>Optio</h3><p>Sub-conselheiro da Coorte: trabalha com os Centuriões e comanda a Coorte na ausência deles. É escolhido a dedo pelo Centurião e pode perder o cargo sem aviso prévio.</p></article>
<article class="paper-card"><h3>Centurião</h3><p>Depois de se destacar em uma ou mais missões, o semideus pode pedir o cargo à Praetoria. Se a avaliação for aprovada, abre-se uma votação em off na Coorte; com 50% + 1 dos votos, o cargo é entregue em cerimônia aberta. Quem já foi Centurião mantém a suíte privativa ao lado da Coorte mesmo se perder o cargo; a arma de ouro imperial vale só enquanto ocupa o posto.</p></article>
<article class="paper-card"><h3>Aquilífero</h3><p>Protege o estandarte e representa a unidade da Legião em campo. Recebe o estandarte de um deus e pode usá-lo em missões, eventos e momentos narrativos oficiais como símbolo de autoridade e moral.</p></article>
<article class="paper-card"><h3>Praetor</h3><p>O cargo mais alto da hierarquia militar e administrativa: comanda a Legião, avalia pedidos de cargos superiores, supervisiona as Coortes, conduz decisões oficiais e representa Roma em grandes eventos, missões e conflitos. Não há informações sobre o soldo da Praetoria.</p></article>
</div>
<h3 class="subheading">Como a Fama muda</h3>
<p>O jeito mais comum de ganhar Fama é cumprir missões. Também é possível ser abençoado por um deus ou criar na forja uma obra que renda Fama – e, como Roma nunca facilita, perdê-la ao receber uma maldição ou um mau augúrio. Para conquistar um título, é preciso atingir a Fama necessária <strong>e</strong> cumprir os requisitos dele.</p>
<p><strong>Filhos de Netuno perdem 15 pontos de Fama ao serem reclamados.</strong> O desconto entra automaticamente na Fama da conta. Ele também se aplica à prole estrangeira com a mecânica de Netuno e soma-se ao ajuste do panteão.</p>
<p>No título de Rebento de Roma Aeterna, a Praetoria chama o personagem quando chegar a hora; recomendamos guardar um arquivo com seus grandes feitos. Ao atingir a pontuação e acreditar que cumpre os requisitos, fale com os Dii Consentis: ainda não há detalhes de como obter o cargo, mas ele exige participação em guerras e feitos realmente grandiosos.</p>` });

  T.push({ page: 'cursus', id: 'economia', fonte: M('§5 Sistema Monetário; Como Ganhar Dinheiro; Trabalhos Disponíveis'), append: `
<h3 class="subheading">Regras gerais dos trabalhos</h3>
<div class="grid two">
<article class="paper-card feature"><h3>Dois trabalhos, sem troca</h3><p>Há 9 trabalhos base. Cada personagem escolhe <strong>dois</strong>, e não pode mudar depois. Os trabalhos podem – e devem – ser adaptados ao personagem, conforme ranking, parente divino, histórico ou função no Acampamento: a ideia é que funcionem mecanicamente, mas tenham cara de personagem.</p></article>
<article class="paper-card"><h3>Trabalhos e missões</h3><p>Trabalhos geram renda constante, via RP escrito e rolagens. Missões são raras e mais perigosas, mas podem mudar o patamar do personagem em dinheiro, Fama, itens, contatos ou consequências. Há ainda formas não convencionais, como vender loot e itens de missão, sorteios e situações semelhantes.</p></article>
<article class="paper-card"><h3>Guarda no túnel</h3><p>Seja qual for o trabalho, todo semideus pode ser escalado para a guarda. No túnel, um perigo pode surgir a qualquer momento. Dá para fazer cenas só guardando o lugar (e conversando), e qualquer um pode receber quem chega em uma busca, defendê-lo de monstros e acompanhá-lo até a Principia.</p></article>
<article class="paper-card"><h3>Áureos</h3><p>O áureo é usado para esbanjar e comprar algo caro demais – ninguém quer andar com centenas de denários por aí.</p></article>
</div>` });

  /* ======================= CRAFTING ======================= */

  T.push({ page: 'crafting', fonte: M('§5 Entre as Cavernas & a Forja; Blueprints; Armor Toughness'), fn(root) {
    const forja = root.querySelector('#forja');
    if (!forja || forja.dataset.pgForja) return;
    forja.dataset.pgForja = '1';
    // Saem os blocos que o documento-mestre substitui; materiais, quebra e reparos continuam.
    const replaced = /^(Forja dos semidivinos|Teste de fabricação|Simples|Mediana|Complexa|Armor Toughness \(AT\))$/;
    [...forja.querySelectorAll('article, .paper-card, .table-wrap')].forEach(el => {
      const h = el.querySelector(':scope > h3')?.textContent.trim() || '';
      if (replaced.test(h)) el.remove();
    });
    forja.querySelectorAll(':scope > p').forEach(p => { if (/^Use a tabela abaixo/.test(p.textContent.trim())) p.remove(); });
    const intro = document.createElement('div');
    intro.innerHTML = `
<article class="paper-card feature"><h3>Entre as cavernas e a forja</h3>
<p>No mundo dos semideuses, a escolha do material de uma arma ou equipamento pode ser a diferença entre voltar coberto de glória ou virar uma nota de rodapé muito triste em algum relatório da Legião. Cada minério tem propriedades próprias, que afetam o poder, a durabilidade e as habilidades de uma peça: alguns são comuns, outros raros, outros tão divinos que deveriam vir com aviso legal.</p>
<p>Os ferreiros do Acampamento sabem manusear desde os materiais mais simples até os mais raros e sagrados – o que não os obriga a aceitar qualquer pedido absurdo escrito em três linhas e uma esperança. A forja é uma arte e, como toda arte, cobra caro.</p></article>
<h3 class="subheading">Mineração</h3>
<div class="grid two">
<article class="paper-card"><h3>Os primeiros recursos</h3><p>Para conseguir um minério, o campista parte em uma mineração ou jornada atrás do material. É responsabilidade do jogador descrever os turnos da busca: como descobriu o material, onde procurou, que caminhos percorreu e como tentou extraí-lo, com liberdade poética, desde que faça sentido com o material e o cenário.</p><p>O solo do Acampamento é rico em alguns materiais. Quando um minério tiver dificuldade, método ou restrição especial, isso está descrito na regra do próprio material.</p></article>
<article class="paper-card feature"><h3>O teste</h3><p>Depois dos turnos narrativos, role <strong>1d20</strong> para saber se a coleta deu certo. Cada semideus pode fazer <strong>3 testes a cada 2 dias</strong>. Cada sucesso é <strong>1 fragmento</strong> de minério, que pode virar arma ou armadura – ou, com proposta aprovada, braços perdidos, próteses e itens especiais.</p><p><strong>Erros de cálculo (opcional):</strong> ao tirar 1 natural no d20 de mineração, o campista pode rolar 1d6 na tabela de falhas críticas e descobrir o que acontece. A tabela ainda não foi transcrita para o Guia.</p></article>
<article class="paper-card"><h3>Bosque dos Faunos e dos Elfos</h3><p>Na região extramuros do Acampamento, o bosque é uma área reservada à natureza e aos seres que nela vivem: árvores antigas, trilhas de terra, pedras brancas e flores silvestres que brilham ao anoitecer, deixadas como homenagem aos mortos em um cemitério natural, sem lápides. Pela geografia de Nazzano, a região tem muitas galerias de cavernas com aberturas para a superfície, ricas em minerais e cristais. Boa parte delas se liga a templos subterrâneos e a ninhos de criaturas – algumas pacíficas, outras nem tanto.</p></article>
<article class="paper-card"><h3>Expedições</h3><p>Alguns minérios não se encontram tão fácil, pela raridade ou pelo perigo que representariam em mãos erradas. Só os conquista quem se aventura em sua busca. Para pedir uma expedição, use o fórum de solicitar mestragem e marque um Mestre. Prepare-se para tudo, até para a morte.</p></article>
</div>
<h3 class="subheading">Dentro da forja</h3>
<p>Com o material bruto em mãos, o campista vai até a Forja e pede que um ferreiro fabrique o equipamento, pagando o valor da blueprint da peça. Para criar o item, o ferreiro faz ações na forja e rola <strong>1d20 + Força ou Constituição</strong>; o bônus pode ser maior para semideuses específicos, como os filhos de Vulcano, quando a habilidade permitir. Em um <strong>20 natural</strong>, o ferreiro pula duas etapas; em um <strong>1 natural</strong>, recua uma.</p>
<div class="table-wrap"><table>
<thead><tr><th>Blueprint</th><th>Materiais</th><th>DT</th><th>Armas e escudos</th><th>Armaduras e próteses</th><th>Limite de falhas</th></tr></thead>
<tbody>
<tr><td>Simples</td><td>Metais comuns, ferro e mithril: maleáveis, mas menos resistentes</td><td>7+</td><td>2 etapas, 15 min entre elas</td><td>3 etapas, 20 min entre elas</td><td>1</td></tr>
<tr><td>Mediana</td><td>Bronze e Uro: mais rígidos, mas comuns nas forjas</td><td>12+</td><td>3 etapas, 30 min entre elas</td><td>3 etapas, 2 h entre elas</td><td>2</td></tr>
<tr><td>Complexa</td><td>Metais sacros e de difícil acesso; por enquanto, só o ouro imperial</td><td>18+</td><td>5 etapas, 2 h entre elas</td><td>Não há materiais</td><td>3</td></tr>
</tbody></table></div>
<p>Ao chegar ao limite de falhas, o material é perdido. A perda de material de confecção complexa precisa ser avisada à Principia.</p>
<h3 class="subheading">Armor Toughness (AT)</h3>
<p>Armas têm bônus de ataque e dano; armaduras protegem e aliviam impactos. O AT da armadura diz como ela faz isso:</p>
<div class="grid two">
<article class="paper-card"><h3>Leve · +1 Defesa, +1 redução</h3><p>Para quem busca mobilidade, como uma cota de malha de ferro comum.</p></article>
<article class="paper-card"><h3>Defensiva · +2 Defesa, +1 redução</h3><p>Ajuda a esquivar, não a absorver o impacto da lâmina. Evita hematomas, mas a mobilidade não é das melhores.</p></article>
<article class="paper-card"><h3>Responsiva · +1 Defesa, +2 redução</h3><p>Evita impactos diretos e cortantes: não é tão defensiva, mas garante o desvio parcial da lâmina em cortes fatais.</p></article>
<article class="paper-card"><h3>Pesada · +2 Defesa, +2 redução</h3><p>A defesa máxima forjável, para quem não se importa de parecer uma tartaruga ou um sino ambulante. <strong>Ainda não existem materiais para armaduras pesadas.</strong></p></article>
</div>
<h3 class="subheading">Materiais</h3>`;
    // Grades que ficaram vazias depois da troca.
    forja.querySelectorAll('.grid, [class*="-grid"]').forEach(g => { if (!g.children.length) g.remove(); });
    const head = forja.querySelector(':scope > .section-head');
    const anchor = head || forja.firstChild;
    [...intro.childNodes].reverse().forEach(n => anchor ? anchor.after(n) : forja.prepend(n));
    // Quebra e reparos vêm antes da lista de materiais.
    const quebra = [...forja.querySelectorAll('article, .paper-card')].find(a => /Quebra, Resistência/.test(a.querySelector('h3')?.textContent || ''));
    const matHead = [...forja.querySelectorAll('h3.subheading')].find(h => h.textContent.trim() === 'Materiais');
    if (quebra && matHead) matHead.before(quebra);
    // A antiga "Forja & Materiais" era uma segunda versão da mesma regra: o que só existia nela vem para cá.
    const canon = root.querySelector('#forja-canonica');
    if (canon) {
      const ouro = [...canon.querySelectorAll('article, .paper-card')].find(a => /Ouro Imperial/.test(a.querySelector('h3')?.textContent || ''));
      if (ouro) {
        const card = document.createElement('article');
        card.className = 'paper-card';
        card.innerHTML = '<h3>Ouro Imperial na forja</h3>' + [...ouro.querySelectorAll('p')].map(p => p.outerHTML).join('');
        forja.append(card);
      }
      canon.remove();
    }
  } });

  T.push({ page: 'crafting', id: 'alquimia', fonte: M('§5 Alquimia; Produções Críticas; Receitas; Valores de Ingredientes'), append: `
<article class="paper-card"><h3>Produções críticas</h3><p>Em um crítico positivo, o teste conta como <strong>duas etapas concluídas</strong>; em um crítico negativo, o processo <strong>recua uma etapa</strong>. Um crítico positivo na última etapa e um negativo na primeira são ignorados. Um alquimista também pode vender qualquer poção à Legio ou à Religio pelo preço da tabela de trabalhos.</p></article>
<h3 class="subheading">Receitas novas</h3>
<details><summary>Poção de Lágrimas de Grifo <i>DT 13</i></summary><p><strong>Efeito:</strong> recupera 1d4+1 HP no início do turno do usuário, por 3 turnos. <strong>Ingredientes:</strong> lágrimas de grifo, pena de grifo. <strong>Preparo:</strong> 3 ações, intervalo 30 min. Duas ou mais falhas fazem perder as lágrimas de grifo, e a poção recomeça do zero.</p></details>
<details><summary>Poção de Lágrimas de Grifo Maior <i>DT 15</i></summary><p><strong>Efeito:</strong> recupera 2d4+2 HP no início do turno do usuário, por 3 turnos. <strong>Ingredientes:</strong> 2 doses de lágrimas de grifo, 1 pena de grifo. <strong>Preparo:</strong> 4 ações, intervalo 45 min. Duas ou mais falhas fazem perder as lágrimas de grifo, e a poção recomeça do zero.</p></details>
<details><summary>Poção de Lágrimas de Grifo Suprema <i>DT 18</i></summary><p><strong>Efeito:</strong> recupera 3d8+4 HP no início do turno do usuário, por 3 turnos. <strong>Ingredientes:</strong> 3 doses de lágrimas de grifo, 2 penas de grifo, 2 pós de monstro. <strong>Preparo:</strong> 5 ações, intervalo 1 h. Duas ou mais falhas fazem perder as lágrimas de grifo, e a poção recomeça do zero.</p></details>
<details><summary>Poção de Resistência Física e à Exaustão <i>DT 15</i></summary><p><strong>Efeito:</strong> por 12 horas, redução de dano 1 contra danos físicos; enquanto durar, os ônus de exaustão caem pela metade. <strong>Ingredientes:</strong> pena de grifo, raspas de chifre do cervo da lua. <strong>Preparo:</strong> 4 ações, intervalo 45 min.</p></details>
<h3 class="subheading">Detalhes das receitas</h3>
<ul>
<li><strong>Porte Físico:</strong> o bônus não vale para ataques nem Defesa, só para perícias e testes semelhantes. A raiz de Hércules pode ser plantada e colhida no Jardim de Bacchus.</li>
<li><strong>Porte Mental:</strong> os cristais de fogo (vermelhos, DT 10 para coletar) e de gelo (azuis, DT 12) são minerados; veja a Forja.</li>
<li><strong>Totem da Vantagem:</strong> o item de sorte pode ser um pé de coelho, dados, uma ferradura ou outro objeto aprovado pelo Mestre. Depois de usado, o totem vira um item comum e pode ser guardado como coleção.</li>
<li><strong>Falar com Animais:</strong> o pelo, a pena ou a escama define com qual animal a poção permite falar.</li>
<li><strong>Resistência Elemental:</strong> o pedaço de criatura define o tipo de resistência – escamas de quimera para fogo; de peixe ou monstro aquático para água ou frio; de cobras ou lagartos do deserto para calor ou fogo.</li>
<li><strong>Heroísmo:</strong> um tônico de Bacchus rende 4 poções.</li>
<li><strong>Velocidade:</strong> a dose de adrenalina sai da Enfermaria, uma vez por semana.</li>
</ul>
<h3 class="subheading">Preços dos ingredientes</h3>
<p>Referência para compra em pequenas lojas, mercados, vendedores de Nova Roma ou NPCs autorizados. Coletores podem vender os mesmos itens pelo valor que quiserem. Pó de monstro, sangue de monstro e escamas de monstros marinhos não têm preço: vêm de missões, combates ou situações narrativas aprovadas, e não há reserva à venda em Roma.</p>
<div class="table-wrap"><table>
<thead><tr><th>Ingrediente</th><th>Valor</th></tr></thead>
<tbody>
<tr><td>Pó de chifre de unicórnio</td><td>10 dn</td></tr>
<tr><td>Pena de pégaso</td><td>12 dn</td></tr>
<tr><td>Raiz de Hércules</td><td>14 dn</td></tr>
<tr><td>Cristal de fogo</td><td>25 dn</td></tr>
<tr><td>Cristal de gelo</td><td>30 dn</td></tr>
<tr><td>Algas do Pequeno Tibre</td><td>8 dn</td></tr>
<tr><td>Muco de animal</td><td>8 dn</td></tr>
<tr><td>Escamas de répteis</td><td>10 dn</td></tr>
<tr><td>Veneno comum</td><td>18 dn</td></tr>
<tr><td>Pedaço de criatura elemental</td><td>28 dn</td></tr>
<tr><td>Trevo de quatro folhas</td><td>16 dn</td></tr>
<tr><td>Item de sorte simples</td><td>8 dn</td></tr>
<tr><td>Pelo, pena ou escama de animal comum</td><td>8 dn</td></tr>
<tr><td>Flores diversas</td><td>7 dn</td></tr>
<tr><td>Papoulas</td><td>10 dn</td></tr>
<tr><td>Areia branca limpa e peneirada</td><td>6 dn</td></tr>
<tr><td>Raízes do Jardim de Bacchus</td><td>12 dn</td></tr>
<tr><td>Lágrimas de grifo</td><td>45 dn</td></tr>
<tr><td>Pena de grifo</td><td>25 dn</td></tr>
<tr><td>Raspas de chifre do cervo da lua</td><td>50 dn</td></tr>
<tr><td>Dose de adrenalina</td><td>gratuita na Enfermaria</td></tr>
<tr><td>Tônico de Bacchus</td><td>73 dn</td></tr>
</tbody></table></div>
<ul>
<li>Pó de chifre de unicórnio e penas de pégaso são ingredientes comuns na economia alquímica, por isso mais baratos e fáceis de conseguir.</li>
<li>Os cristais custam mais porque também são usados pelos Entalhadores Rúnicos. Qualquer personagem pode minerá-los, mas a procura é maior.</li>
<li>A dose de adrenalina é gratuita, mas só para criação real de poção, emergência médica ou necessidade justificada.</li>
<li>Lágrimas de grifo são caras porque o difícil é fazer um grifo chorar: quem tenta coletá-las rola Adestrar Animais e, com 12 ou menos, leva uma bicada (2d6+4 de dano) e fica sem as lágrimas. Dá para tentar quantas vezes quiser – até conseguir ou morrer tentando.</li>
</ul>` });

  T.push({ page: 'crafting', id: 'runas', fonte: M('§5 Sistema de Runas'), append: `
<h3 class="subheading">Em detalhe</h3>
<div class="grid two">
<article class="paper-card"><h3>Proles que não criam runas</h3><p>Por padrão: Marte, Minerva, Mercúrio, Mors, Letum, <strong>todos os Alati</strong>, Invidia e Justitia. Essas proles contornam o problema se se tornarem usuárias de magia, e podem usar itens rúnicos feitos por outros.</p></article>
<article class="paper-card"><h3>Coleta dos condutores</h3><p>Os cristais de fogo (DT 10) e de gelo (DT 12) são minerados como na Forja. As <strong>cinzas sagradas</strong> são recolhidas por um Coletor nos pratos e piras de Vesta, e só depois que alguém da Religio tiver trabalhado recentemente para acendê-los. Os <strong>potes de água do Pequeno Tibre</strong> são coletados por um Coletor e entregues ou vendidos aos Entalhadores.</p></article>
<article class="paper-card"><h3>Tipo de dano por prole</h3><p>Uma prole de Vulcano pode criar runas de dano de fogo; de Aquilon ou Cimopoleia, de gelo ou frio; uma prole ligada a sonhos, medo ou mente, de dano de Sanidade; ligada à luz, de dano radiante; ligada ao submundo, necrótico ou espiritual, se fizer sentido. O bônus mecânico pode ser o mesmo, mas a estética e o tipo de dano mudam – por isso, a mesma pessoa pode procurar entalhadores diferentes para efeitos diferentes.</p></article>
<article class="paper-card"><h3>Limites e registro</h3><p>Runas não copiam habilidades divinas inteiras e não concedem voo, invisibilidade completa, cura constante, controle mental ou efeitos grandes demais sem aprovação especial. O item entalhado não é destruído por padrão em caso de falha; só o material de canalização.</p><p>Todo objeto com runa precisa estar na sua ficha de forja; ao receber a runa, atualize a ficha com “runa X adicionada” e o link da última ação do entalhador, para a contagem dos dias. Runa não registrada é desconsiderada em missões, combates e treinos.</p></article>
</div>` });

  /* ======================= FAMILIARES ======================= */

  T.push({ page: 'familiares', id: 'familiares', fonte: M('§6 Sistema de Familiares'), append: `
<h3 class="subheading">Em detalhe</h3>
<div class="grid two">
<article class="paper-card"><h3>Ficha aprovada</h3><p>Todos os familiares precisam de ficha aprovada antes de serem usados, e o Mestre pode negar criaturas incompatíveis com o balanceamento ou com a lore. Para pedir um auxiliar, use o canal de ficha de familiar, seguindo o modelo do canal. Familiares auxiliares só são obtidos em missões.</p></article>
<article class="paper-card"><h3>Tamanho e grandeza</h3><p>Auxiliares costumam ser criaturas místicas, como lobos e aves divinas, e monstros em geral também entram – com noção de tamanho: você jamais teria um Cérbero. Criaturas naturalmente monstruosas, como cães infernais e quimeras, não se domesticam; exceções precisam ser confirmadas antes com um Dii Consentis pelo Mestre que for usá-las.</p></article>
<article class="paper-card"><h3>Familiares VIP</h3><p>Jogadores VIP podem pedir auxiliares mágicos mais complexos: até 2 perícias, habilidades mágicas simples (por exemplo, um cervo ou pequeno dragão que cura 1d4 + Fé de HP) e efeitos narrativos diferenciados, como ser transparente.</p></article>
<article class="paper-card"><h3>Montarias compradas</h3><p>Algumas montarias podem ser compradas, a partir do cargo de Legionário. Mesmo comprada, a criatura pode derrubar o montador ou não aceitá-lo: o vínculo depende de ser reconhecido por ela como digno.</p></article>
<article class="paper-card"><h3>Vínculos lendários</h3><p>Só vêm de eventos especiais, missões únicas ou recompensas narrativas da Staff. Um vínculo lendário não é “um dragão pequeno”: é de fato monstruoso e poderoso, e pode ter habilidades mágicas reais, sopros elementais, regeneração, controle elemental e outras capacidades da espécie.</p></article>
</div>` });

  /* ======================= MAGIA ======================= */

  T.push({ page: 'magia', id: 'cantrips', fonte: M('§3 Magias'), append: `
<article class="paper-card"><h3>As escolas, em uma frase</h3><ul>
<li><strong>Ilusão:</strong> você faz alguém parecer um sapo.</li>
<li><strong>Transmutação:</strong> você transforma alguém em um sapo.</li>
<li><strong>Encantamento:</strong> você faz alguém pensar que é um sapo.</li>
<li><strong>Conjuração:</strong> você invoca um sapo.</li>
<li><strong>Abjuração:</strong> você protege o sapo.</li>
<li><strong>Evocação:</strong> você mata o sapo.</li>
<li><strong>Necromancia:</strong> você ressuscita o sapo morto.</li>
<li><strong>Adivinhação:</strong> você descobre que, na verdade, era uma rã.</li>
</ul></article>` });

  T.push({ page: 'magia', id: 'poder-divino', fonte: M('§3 Sob o Olhar Sanguinário do Vigia'), append: `
<article class="paper-card"><h3>Sob o olhar sanguinário do Vigia</h3><p>Tudo o que você aprende fica sob o olhar do deus daquele domínio, que pode influenciar sua jornada – positivamente ou, muito mais provavelmente, negativamente. Trazer almas dos Asfódelos, por exemplo, desagrada os deuses inferiores. Um dos maiores exemplos vivos é a ex-pretora Blume, muito malquista por Mors por ser necromante. Magos podem ser muito poderosos, mas continuam não sendo deuses.</p></article>` });

  /* ======================= DEUSES E DEVOÇÃO ======================= */

  T.push({ page: 'deuses', id: 'afinidade', fonte: M('§4 Afinidade com Figuras Importantes & Devoção'), append: `
<h3 class="subheading">Em detalhe</h3>
<div class="grid two">
<article class="paper-card"><h3>Quem avalia</h3><p>Por costume, os mais devotos estão na Religio, mas um Legionário também pode se dedicar a uma figura sem deixar os cargos militares. Marque os Mestres sempre que fizer uma ação relevante envolvendo uma figura importante; se a figura tem um narrador fixo, marque-o (como a Helena para Vênus ou o Edd para a Blume). Figuras não distribuem pontos por educação ou presença, e não existe perda automática por interagir com várias figuras.</p></article>
<article class="paper-card"><h3>Missões e marcos</h3><p>Missões costumam render <strong>de 5 a 15 pontos</strong> – raramente 20 –, para ganho ou perda, e o que conta é a sua interação com os domínios e interesses daquela figura. No marco de <strong>+30</strong>, o Mestre que mais acompanhou a jornada pode conceder uma pequena bênção; no de <strong>+60</strong>, cabe uma bênção mediana. A recompensa de <strong>+100</strong> pode ser um recurso, acesso, habilidade ou privilégio narrativo – e não significa posse ou controle: significa que a figura confia em você o bastante para envolvê-lo em coisas que provavelmente não são seguras.</p></article>
</div>` });

  T.push({ page: 'deuses', id: 'devocao-divina', fonte: M('§4 Devoção Divina'), replace: `
<article class="paper-card feature"><h3>A quem escolhemos dedicar aquilo que somos</h3>
<p>Na tradição romana, a relação entre mortais e divindades se constrói pela <em>pietas</em>, pelo respeito aos compromissos e pela dedicação demonstrada em ações. Todo semideus carrega a herança dos progenitores, mas o sangue não determina a quem ele dedicará a vida: um filho de Marte pode encontrar em Minerva sua maior inspiração, e uma filha de Vênus pode consagrar suas vitórias a Victoria.</p>
<p>A Devoção Divina permite estabelecer um compromisso com outra divindade e, eventualmente, ser reconhecido como devoto, manifestando os poderes do novo patrono. Não é uma forma simples de trocar habilidades, e sim uma trajetória narrativa. Não há pontos de devoção, quantidade obrigatória de oferendas ou número de missões que garanta o reconhecimento: a decisão final é da divindade.</p></article>
<div class="grid two">
<article class="paper-card"><span class="label">I</span><h3>O caminho</h3><p>Antes de qualquer cerimônia, o personagem procura compreender o que a divindade representa, conhecer seus mitos, respeitar seus domínios e incorporar seus princípios à própria vida. Orações, oferendas, visitas aos templos e homenagens em missões cultivam a relação, mas valem pela intenção: uma atitude discreta e coerente pode significar mais que uma oferenda elaborada. Honrar Bellona pode envolver coragem diante dos horrores da guerra; a devoção a Ceres, o cultivo e o cuidado com quem depende da terra. A devoção deve aparecer naturalmente na interpretação, inclusive em missões sem relação com o patrono.</p></article>
<article class="paper-card"><span class="label">II</span><h3>O compromisso e a consagração</h3><p>Quando considerar a relação significativa, o personagem pode fazer uma cerimônia de consagração pessoal, inspirada nos <em>vota</em> romanos: uma promessa solene do que pretende oferecer, defender ou realizar em honra ao deus, com libações, incenso, oferendas ou orações. Não há fórmula universal. O compromisso deve ser interpretado em uma cena própria. A cerimônia não garante a aceitação nem exige uma manifestação imediata: o mortal se apresenta, e o deus decide.</p></article>
<article class="paper-card"><span class="label">III</span><h3>As provações</h3><p>Depois do compromisso, surgem oportunidades de demonstrar dedicação, normalmente em missões e sem aviso: uma decisão difícil, uma promessa a cumprir, uma escolha que revela convicções. O sucesso absoluto não é obrigatório – é possível fracassar no objetivo e ainda assim demonstrar as virtudes que a divindade valoriza. Não é preciso pedir uma missão exclusiva de devoção; uma missão ligada ao patrono pode surgir depois, como consequência da atenção conquistada.</p></article>
<article class="paper-card"><span class="label">IV</span><h3>O reconhecimento</h3><p>Quando a divindade considerar a dedicação suficiente, pode aceitar o mortal como devoto – por aparição, sonho, presságio ou acontecimento extraordinário, a critério da narração. O reconhecimento e o novo kit precisam ser validados pela equipe responsável. A escolha envolve uma renúncia: o personagem abandona os domínios e a proteção do progenitor. Isso não significa ódio do pai ou da mãe divina, mas a decisão é definitiva: os poderes renunciados não voltam se a devoção for perdida.</p></article>
</div>
<h3 class="subheading">Alterações no kit</h3>
<div class="grid two">
<article class="paper-card"><h3>Passivas</h3><p>O personagem recebe as passivas do novo patrono e pode preservar <strong>até duas</strong> da ascendência original, com justificativa narrativa e aprovação da equipe. A preservação não é automática e passa por balanceamento; as passivas mantidas são vestígios da herança, não a proteção do progenitor.</p></article>
<article class="paper-card"><h3>Ativas</h3><p>Todas passam a seguir a progressão do novo patrono, com seus níveis, custos e limitações. Em casos excepcionais, uma ativa da ascendência original pode ser preservada, se for fundamental para a identidade do personagem: ela substitui uma ativa do novo kit, respeita os requisitos de nível e depende de autorização expressa. Não há espaço adicional.</p></article>
<article class="paper-card"><h3>HP, atributos e recursos</h3><p>O HP máximo é recalculado pelo kit do patrono, do valor inicial à progressão do nível atual. Os bônus de atributos e a perícia inicial da ascendência permanecem, porque são herdados do nascimento; o atributo de conjuração das habilidades divinas e os recursos específicos seguem o novo kit. A devoção não dá níveis, talentos nem pontos de atributo, e Legados ou outras particularidades são avaliados caso a caso.</p></article>
<article class="paper-card"><h3>Vários deuses, um patrono</h3><p>A religião romana é politeísta: honrar e fazer oferendas a vários deuses não é devoção formal, e pode acontecer enquanto o personagem mantém os poderes do progenitor. Só uma divindade é patrona para fins de kit; cultos a outras não acumulam habilidades, passivas ou benefícios.</p></article>
</div>
<h3 class="subheading">Continuidade e perda</h3>
<div class="grid two">
<article class="paper-card"><h3>A continuidade</h3><p>O reconhecimento é o início de um compromisso. Espera-se que o personagem siga honrando o patrono com homenagens, oferendas, orações e, principalmente, atitudes coerentes. Falhas pontuais e divergências não encerram a devoção, mas o abandono deliberado, a traição aos princípios do patrono ou atitudes graves podem trazer advertências, afastamento, suspensão de poderes ou a retirada definitiva do reconhecimento, conduzidos narrativamente.</p></article>
<article class="paper-card"><h3>A perda</h3><p>Se o patrono retirar o reconhecimento de vez, o personagem perde <strong>todos os poderes divinos</strong>, inclusive os preservados da origem, e o progenitor não reassume a proteção. Ele passa a viver como mortal comum, sem habilidades, bonificações divinas ou a resistência que a condição dava, com HP, atributos e perícias ajustados – mas continua com o cheiro semidivino, perceptível aos monstros. A recuperação não é automática, mesmo com arrependimento. Buscar outra divindade é possível, mas excepcionalmente difícil, e não há garantia de acolhida.</p></article>
</div>
<p>A devoção deve ser desenvolvida organicamente, por iniciativa do jogador, sem prazo mínimo ou número obrigatório de cenas; muitas oferendas em pouco tempo não aceleram o processo. Renunciar aos poderes de nascimento é um compromisso extraordinário, que não deve ser assumido levianamente.</p>
<blockquote><p>“A herança divina determina de onde viemos. A devoção revela a quem escolhemos dedicar aquilo que somos.”</p><p>— Sapienza Quarta Cornelius, filha de Iuppiter, devota de Minerva</p></blockquote>` });

  /* ======================= ROMA ======================= */

  T.push({ page: 'roma-hoje', id: 'coortes', fonte: M('§7 Coortes'), replace: `
<p class="section-lead">Dentro do Acampamento Júpiter, as coortes não são só divisões militares: são, para todos os efeitos, sua família em Roma. É com a coorte que você treina, luta, convive e aprende que há muito mais do que brigas esperando por aí. Cada semideus é integrado a uma das cinco, e passa a existir dentro do sistema romano, com alianças, rivalidades, responsabilidades e uma reputação que não pertence só a ele.</p>
<p>As reputações abaixo não são características imutáveis: são os personagens que constroem Roma, e conforme os jogadores agem, vencem, falham, conquistam cargos ou criam problemas, a reputação de uma coorte pode melhorar, piorar ou mudar por completo.</p>
<div class="cohorts">
<article><b>I</b><h3>Primeira</h3><p><strong>Prestígio, liderança e linha de frente.</strong> Historicamente, a coorte mais abastada e prestigiosa da Legião, que produziu uma quantidade desproporcional de líderes, oficiais e figuras importantes. Reúne os que avançam primeiro: combatentes de linha de frente, líderes naturais, ambiciosos e quem aceita assumir responsabilidade. O prestígio abre portas, mas cria expectativas – quando a Primeira falha, ninguém deixa passar.</p></article>
<article><b>II</b><h3>Segunda</h3><p><strong>Orgulho, glória e dever.</strong> Seus legionários fazem o que precisa ser feito, mesmo quando a solução correta não é a mais bonita. A reputação raramente veio de figuras bondosas ou idealistas, e sim dos que aceitam decisões difíceis, atravessam limites e carregam o peso delas depois. Tudo pela glória – deles, da Legião e de Roma. Assim como a Primeira, está frequentemente na linha de frente.</p></article>
<article><b>III</b><h3>Terceira</h3><p><strong>Estratégia, diplomacia e proteção.</strong> Reúne estrategistas, diplomatas, negociadores e quem assume a responsabilidade de proteger os outros: observam o campo, organizam recursos, constroem alianças e tentam garantir que todos voltem para casa. São também os médicos, os boticários e, normalmente, os iniciados em magia. Quando entram em combate, há um motivo muito claro. Entre força e inteligência, a Terceira prefere não escolher.</p></article>
<article><b>IV</b><h3>Quarta</h3><p><strong>Diligência, constância e mérito.</strong> Nunca teve o prestígio histórico das primeiras coortes, mas construiu sua identidade com quem trabalha mesmo quando ninguém está olhando e conquista espaço pelo esforço. Por muito tempo ficou abaixo dos holofotes; nos últimos tempos, seus integrantes querem mudar isso – a ex-pretora Blume, inclusive, é da Quarta. Talvez continuem trabalhando nos bastidores, ou estejam esperando a hora certa de roubar a cena.</p></article>
<article><b>V</b><h3>Quinta</h3><p><strong>Coragem e reconstrução.</strong> Por muito tempo a menos prestigiada, carregou derrotas e desconfiança; entrar nela era começar tendo algo a provar. Recentemente, a história mudou: bons resultados cada vez mais constantes obrigaram Roma a rever certezas antigas. A Quinta abriga os que entram quando talvez fosse mais sensato recuar e que não se importam de provar seu valor da forma mais barulhenta possível. Prestígio se perde; prestígio também se conquista.</p></article>
</div>
<h3 class="subheading">Entrada no Acampamento</h3>
<p>Ao chegar, o semideus entra em uma coorte de duas formas: <strong>apadrinhado</strong> por outro campista, entrando na mesma coorte do responsável, ou <strong>designado por augúrio</strong>, conforme o destino romano decidir. Probatii não podem apadrinhar novatos; só legionários assumem essa responsabilidade.</p>` });

  /* ======================= INFOS EXTRAS ======================= */

  T.push({ page: 'extras', id: 'tempo-duodecima', fonte: M('§7 Passagem do Tempo'), append: `
<div class="grid two">
<article class="paper-card"><h3>Calendário</h3><p>A aceleração dos anos não muda a data corrente: dias e meses seguem o calendário real, para que eventos, festivais, missões e cenas não precisem de uma cronologia paralela. Depois do solstício de junho, um ano inteiro passou narrativamente, mas o dia seguinte continua sendo junho. Saturnália, Venerália e o aniversário de Roma acontecem uma vez por ano – ninguém merece quatro Saturnálias em doze meses.</p></article>
<article class="paper-card"><h3>Aniversários e serviço</h3><p>As viradas são anunciadas pela Staff, já que as datas podem variar um ou dois dias. A comemoração dos aniversários fica com o jogador: uma festa por ano em off, quatro festas por ano ou comemorações offscreen – o sistema só pede que a idade seja atualizada no período certo. Com quatro anos em on por ano em off, os dez anos de serviço para a aposentadoria – e as dez marquinhas no braço – se tornam alcançáveis.</p></article>
</div>` });

  T.push({ page: 'extras', id: 'bolsa-decimus', fonte: M('§7 Bolsa Décimus'), append: `
<article class="paper-card"><h3>Como o programa funciona</h3><p>As propriedades de Nova Roma continuam caras, e ter uma casa continua sendo uma conquista. A Bolsa não substitui isso: garante que não comprar uma casa não obrigue ninguém a abandonar Roma. O programa é uma parceria do Senado com os Caesari, responsáveis por parte da infraestrutura bancária e de construção da cidade. Em vez de casas, mantém edifícios residenciais com apartamentos menores e mais simples, alugados abaixo do preço do resto de Nova Roma. Famílias podem pedir unidades maiores conforme a necessidade e a disponibilidade, mas não há mansões, terrenos particulares ou imóveis de luxo. Licenciados para cargos incompatíveis com o serviço ativo incluem, por exemplo, determinados cargos no Senado.</p></article>` });

  T.push({ page: 'extras', id: 'panteoes', fonte: M('§4 Influência dos Panteões nos Estados Unidos'), replace: `
<p class="section-lead">Gregos, nórdicos, celtas e egípcios têm estruturas, territórios e formas próprias de organização nos Estados Unidos. Com a Legião agora na Itália, essas sedes ficam do outro lado do oceano.</p>
<div class="grid two">
<article class="paper-card"><span class="label">GRAECVS</span><h3>Acampamento Meio-Sangue</h3><p>Em Long Island, Nova York, continua sendo o principal centro dos semideuses gregos nos Estados Unidos: protegido por fronteiras mágicas e organizado ao redor dos chalés dos deuses, funciona como centro de treinamento e refúgio. Romanos foram enviados para ajudar a construir uma pequena cidade perto do Acampamento, inspirada em Nova Roma – ainda muito mais frágil e menos protegida que a original. A participação da Duodécima se concentra na construção e na infraestrutura; defesa, administração e proteção a longo prazo cabem aos gregos.</p></article>
<article class="paper-card"><span class="label">NORDICVS</span><h3>Hrafnheim</h3><p>Nas montanhas de Washington, entre vales, rios e florestas de coníferas, é o principal forte nórdico conhecido pela Duodécima: forja, biblioteca, enfermaria, mercado, estábulos, campo de treinamento, pavilhão, alojamentos e estruturas de vigília, ainda bem menor que os acampamentos grego e romano, mas em expansão. Os antigos agrupamentos internos perderam poder com ataques há alguns anos, e hoje os habitantes dividem os espaços conforme a necessidade. Romanos ajudam na construção, fruto da parceria entre os povos, mas o forte segue essencialmente nórdico.</p></article>
<article class="paper-card"><span class="label">CELTAE</span><h3>Ilha de Skye</h3><p>Na Flórida, relativamente perto da influência do Acampamento Meio-Sangue, fica a principal concentração celta conhecida, chamada de Ilha de Skye em referência à ilha associada a Scáthach. Os celtas são muito menos centralizados: há células, postos e acampamentos menores pelo país, em florestas, pântanos e parques nacionais, alguns temporários, outros ligados à Ilha. Um exemplo conhecido foi a base de Kisatchie, atacada e destruída pelos romanos. A extensão real da rede continua desconhecida.</p></article>
<article class="paper-card"><span class="label">AEGYPTIVS</span><h3>Presença dispersa</h3><p>A presença egípcia é a mais incerta. Sabe-se de magos, Olhos dos Deuses e outros indivíduos ligados ao panteão espalhados pelos Estados Unidos, mas não há informação confiável sobre uma sede, território ou estrutura central. Quem criar um personagem egípcio pode decidir livremente de onde ele vem e como chega.</p></article>
</div>` });

  /* ======================= DOMUS ======================= */

  T.push({ page: 'domus', id: 'rebentos', fonte: M('§7 Rebentos de Roma'), append: `
<h3 class="subheading">Honesta Missio, em detalhe</h3>
<div class="grid two">
<article class="paper-card"><h3>Um final digno</h3><p>A melhor honra que podemos dar àquilo que criamos é um final digno. Por isso, ninguém é cobrado a encerrar a história de um personagem por ter alcançado um cargo ou uma conquista: só o jogador sabe quando aquela história terminou. Enquanto não pedir a Honesta Missio, o Rebento continua em missões, eventos e RPs, e segue progredindo se ainda não estiver no nível máximo.</p></article>
<article class="paper-card"><h3>Depois do pedido</h3><p>O personagem continua sendo do jogador e pode seguir sendo usado em RP, inclusive pelos bots do servidor, mantendo relações, família, propriedades e profissão em Nova Roma. Recomendamos conversar com os Dii Consentis sobre a função que ele passa a exercer na cidade. Uso por outros jogadores depende de autorização. Pedidos de missão própria, a cada três meses OFF, não têm prioridade sobre conteúdos de personagens ativos e podem demorar mais; participações depois da Honesta Missio ainda podem render pontos, recompensas ou pequenos benefícios.</p></article>
</div>
<article class="paper-card"><h3>Reset</h3><p>Depois da Honesta Missio, o personagem passa a ser um NPC da cidade e fica <strong>imune ao reset</strong>. O reset só acontece se o jogador continuar usando o personagem como principal e ficar sem jogar com ele.</p></article>` });

  /* Runas superiores (decisão da Staff, 25/11/2026): o dano extra é de 1d4 ou 1d6, definido na
     aprovação. Condutores seguem como no site: cristal, cinzas ou água. */
  T.push({ page: 'crafting', fonte: 'Decisão da Staff · 25/11/2026 (runas superiores)', fn(root) {
    const sec = root.querySelector('section#runas');
    if (!sec) return;
    for (const el of sec.querySelectorAll('p, li, span, div')) {
      if (el.children.length > 3) continue;
      if (el.innerHTML.includes('+1d4 dano')) el.innerHTML = el.innerHTML.replace('+1d4 dano', '+1d4 ou +1d6 de dano');
    }
    const dano = [...sec.querySelectorAll('.paper-card')].find(c => /Dano/.test(c.querySelector('h3')?.textContent || ''));
    if (dano) dano.insertAdjacentHTML('beforeend', '<p>Na runa <strong>superior</strong>, o dano extra é de <strong>1d4 ou 1d6</strong>, definido com a Staff na aprovação: tipos mais comuns, como fogo e gelo, podem chegar a 1d6; tipos como radiante ficam em 1d4.</p>');
  } });

  window.GUIA_TEXTOS = T;
})();
