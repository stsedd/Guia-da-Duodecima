# Principia — interface de terminal do Guia

Proposta de nova interface para o Guia da Duodécima, inspirada no site da PostHog: o Guia abre como o computador da Principia. Há uma sequência de inicialização, uma área de trabalho com os arquivos da legião e janelas que abrem cada parte do Guia. No celular, a mesma interface vira uma tela inicial de aparelho, com apps em tela cheia.

A proposta convive com o site atual: `index.html` continua intacto e a nova versão responde em `principia.html`.

## O que não muda

- **Conteúdo idêntico.** As páginas continuam sendo montadas pelo mesmo motor (`app-v24.js` e todas as camadas), com a mesma sincronização com o Duodécima Core e o mesmo snapshot local de fallback. Nas 7 páginas, o texto, as âncoras, as imagens e os blocos expansíveis renderizados em `principia.html` são idênticos aos do `index.html` (conferido por hash do texto, contagem de âncoras, imagens e `details`).
- **Links diretos.** O formato `#page:deuses:deus-vulcano` continua valendo; basta trocar `index.html` por `principia.html` no endereço. Na Principia, links para o Combate (`#page:combate:cond-cego`) também funcionam na primeira carga — veja "Correções" abaixo.
- **Arquivos existentes.** A camada nova só adiciona arquivos, com uma exceção pequena em `guide-stabilization-v251.js` (ver "Correções").

## Estrutura em 11 abas (novembro de 2026)

A pedido da Staff, a interface passou a se chamar **Guia da Duodécima** (o nome "Principia" fica só para o prédio de comando do lore) e o Guia foi reorganizado em 11 abas: **Character Archive**, Combate, **Cursus Honorum**, Crafting, **Familiares**, Magia, **Deuses e Devoção**, **A Casa do Lobo**, **Roma**, **Infos Extras e Mecânicas** e Domus Memoriae.

- **Como funciona:** `principia/principia-estrutura.js` carrega antes do `app-v24.js`, lê as páginas que o motor já monta (Sistema, Sobre Roma etc., com o Core e todas as camadas) e monta as abas novas com as **mesmas seções**. O mapa "seção antiga → aba nova" fica em `PLAN`, no topo do arquivo. A versão final é remontada quando o Core e as camadas terminam (`PRINCIPIA_ESTRUTURA_READY`).
- **Páginas antigas:** `sistema` e `roma` continuam existindo como fonte, mas não aparecem na navegação. As abas novas usam chaves próprias (`personagem`, `cursus`, `familiares`, `casa-do-lobo`, `roma-hoje`, `extras`) porque camadas antigas reescrevem a página `roma` toda vez que ela aparece (recolocariam a trama de Morcan Glass, por exemplo).
- **Links antigos:** `#page:sistema:afinidade` abre `#page:deuses:afinidade`, `#page:roma:coortes` abre `#page:roma-hoje:coortes` e assim por diante. Vale para links colados no Discord, cliques em textos antigos, a Minha Ficha e o Tabularium.
- **Correções aprovadas pela Staff (24/11/2026):** Celtas liberados com −15 de Fama; Praetoria = triunvirato de Cassius, Cyrus e Jasmine, com Blume como ex-pretora em destaque; a Trama mostra só a Helix Vitae; Morcan Glass morreu; regras de Fama de Odiado e Conhecido; DT em todo o Guia; subtítulos novos dos quadros da Domus; Rebentos de Roma depois dos quadros. Todas ficam em `FIX`, em `principia-estrutura.js`.
- **Conferência:** nenhum texto das páginas antigas se perde na montagem; as únicas diferenças são as correções acima (comparação automática dos textos, feita a cada mudança).
- **Busca:** o motor guardava a primeira lista de busca e nunca via as atualizações das camadas (por isso aparecia texto antigo). `principia-early.js` passa a atualizar essa lista no lugar, e o índice é refeito com as abas novas.
- **Visual:** um tema por modo em todas as abas (sem faixas alternadas de papel), um fio entre seções, artes laterais com a altura do texto, "51 kits" ao lado da abertura de Deuses e a linha inteira de cada deus clicável.
- **Ícones provisórios:** `cursus`, `familiares`, `casa-do-lobo` e `extras` são recortes das artes existentes, até chegarem os PNGs definitivos.
- **Textos do Discord:** `principia/guia-textos.js` traz os textos do documento-mestre da Staff (consolidado dos canais do Discord, 24/11/2026) como blocos que completam ou substituem seções: Heranças Divinas e O d20 e as rolagens (novas), Devoção Divina completa, Forja (unificada com a antiga "Forja & Materiais"), Alquimia (receitas novas, críticos e preços), Runas, Familiares, Coortes, Hierarquia, Economia, Morte & Vida, Descanso, Status, Estrangeiros, Outros Panteões, Passagem do Tempo, Bolsa Décimus, Combate e Rebentos. Cada bloco guarda a origem em `data-fonte`. Regras com divergência ainda sem resposta da Staff continuam com o texto do Core (lista no topo do arquivo).

## Design system v3 "pôster"

Na `principia.html`, as 13 folhas legadas do `index.html` foram substituídas por uma folha única, `principia/guia-ds.css`, e a camada `principia/principia-guia.js` monta capas e banners a cada página. O HTML do conteúdo é o mesmo (texto, âncoras e acordeões idênticos aos do `index.html`); só a apresentação muda. O `index.html` continua com as folhas antigas e não foi tocado.

- **Direção:** pôster editorial em preto, vermelho e papel, inspirado nas referências enviadas e no branding da legião. Títulos gigantes condensados (Anton), rótulos largos em caixa-alta (Archivo expandida), texto em Inter, números grandes, poucas caixas e muitas linhas.
- **Capitular gótica:** a primeira letra dos textos narrativos (aberturas, introdução da Magia, situação de Roma, quem era cada deus, biografias da Domus) usa UnifrakturMaguntia em um quadro vermelho, como nos manuscritos medievais.
- **Capas:** cada arquivo abre com o banner original em alta resolução, de ponta a ponta da janela, e o título gigante logo abaixo. Roma usa a arte SPQR em 1920×1080 ocupando a tela; Deuses abre com o friso dos seis panteões; o Sistema escreve "SISTEMA" sobre a borda do banner.
- **Banners:** os banners das seções foram trocados pelos originais em 1920 px e passaram a ir de borda a borda, sem moldura nem corte. Faixas que existiam mas não eram usadas entraram em Economia, Forja, Magia (introdução e círculos) e Roma (trama, retorno à Itália e devoção). No Combate só fica a capa: os banners secundários saíram para o texto fluir.
- **Capítulos em faixas:** os capítulos alternam fundo preto e papel (no tema Dia, ao contrário), e cada capítulo começa com o nome dele em letreiro vazado gigante que desliza devagar.
- **Domus Memoriae:** os quadros viraram recortes PNG sobre o fundo, sem moldura, com o numeral romano do rebento gigante atrás.
- **Lideranças e panteões:** retratos em preto e branco que ganham cor ao passar o mouse; panteões em mosaico de pôsteres.
- **Aba Ficha:** a barra de abas do Guia ganhou a aba **Ficha**, que abre a Minha Ficha ao lado do Guia.
- **Arquivos de arte:** `assets/principia/hq/` guarda os WebP gerados a partir dos originais (`b-*` banners, `a-*` artes quadradas sem a moldura vermelha, `c-*` recortes da Domus, `cover-roma`, `m-influencia`). O mapeamento fica no topo de `principia/principia-guia.js`.
- **Layout pela janela, não pela tela:** as grades usam *container queries*, então se ajustam também quando o Guia divide a tela com a Minha Ficha.
- **Movimento:** letreiro dos capítulos, capa que se dissolve ao rolar, acordeões com abertura animada e linhas que acendem em vermelho. Tudo some com "reduzir movimento".
- **Camadas injetadas:** `guide-stabilization-v251.js` e `lineage-core-v25.js` injetavam CSS com `!important`. A `principia.html` declara `<style>` vazios com os mesmos ids, e as camadas pulam a injeção; o design system cobre esses blocos.
- **Painel "Nesta página":** as seções longas ganham capítulos (Sistema: Personagem, Mecânicas, Roma, Outros sistemas; Combate, Magia e Sobre Roma com agrupamentos próprios). A ordem e os links não mudam; os capítulos ficam em `NAV_CHAPTERS`, no `principia/principia.js`.
- **Ícones da área de trabalho:** não foram alterados; aguardam os PNGs dedicados.

## Música

O app Música e as playlists do Spotify foram removidos por decisão da Staff (2026-11-24), para não depender de conta pessoal no Spotify. Não há mais nenhum script ou link do Spotify no Guia.

## Correções

- **Notas de acúmulo dos talentos:** a ponte do Core (`core-bridge-v24.js`) reconstrói a seção de talentos; quando terminava depois da camada de estabilização, apagava as notas "Único · só pode ser adquirido uma vez". `guide-stabilization-v251.js` agora espera o `DUODECIMA_CORE_READY` antes de aplicar os ajustes (uma linha). O `index.html` recebe a mesma correção quando o arquivo sair do cache; a `principia.html` usa `?v=2.6.12`.
- **Links diretos para o Combate:** a página Combate só é registrada depois do Core, então o motor tratava `#page:combate:…` como Sistema na primeira carga (acontece também no `index.html`). A Principia guarda o link original e, quando a página passa a existir, abre o destino certo (`resumeLatePage`, em `principia/principia.js`).

## Arquivos novos

| Arquivo | Função |
| --- | --- |
| `principia.html` | Entrada: carrega os mesmos JS do `index.html`, o design system e a camada Principia. |
| `principia/guia-ds.css` | Design system "pôster" do conteúdo do Guia (substitui as 13 folhas legadas na Principia). |
| `principia/principia-guia.js` | Capas, banners em alta, artes e letreiros de capítulo aplicados a cada página. |
| `principia/principia-estrutura.js` | Monta as 11 abas a partir das páginas do motor, aplica as correções aprovadas e redireciona os links antigos. |
| `principia/guia-textos.js` | Textos migrados do documento-mestre do Discord, com a origem de cada bloco. |
| `assets/principia/hq/` | Banners e artes em alta resolução gerados a partir dos originais. |
| `principia/principia-early.js` | Carrega antes do motor e faz a rolagem e o histórico funcionarem dentro da janela. |
| `principia/principia.js` | Área de trabalho, janelas, menus, busca, Tabularium, tela do celular e inicialização. |
| `principia/principia.css` | Visual da interface e ajustes do conteúdo dentro das janelas. |
| `principia/principia-ficha.js` | App Minha Ficha: importa o JSON da Ficha Oficial e mostra o personagem ao lado do Guia. |
| `principia/manifest.webmanifest` | Permite adicionar a Principia à tela inicial do celular. |
| `assets/principia/` | Papel de parede SPQR, ícones dos apps (recortes dos banners da legião) e marcas LEG·XII. |

## Recursos

- **Inicialização:** tela de terminal com a marca da legião e um registro real do carregamento (arquivos, versão do Core, registros de busca). Toque ou qualquer tecla pula. Roda completa uma vez por sessão; links diretos abrem com a versão curta.
- **Área de trabalho:** ícones dos 7 arquivos à esquerda e utilitários à direita (Tabularium, Mapas, Ficha Oficial, Leia-me, Preferências), papel de parede com paralaxe e relógio com a data no calendário romano.
- **Janela do arquivo:** abas para alternar entre as páginas, caminho com a seção atual, painel "Nesta página", barra de progresso de leitura, botão de copiar link da seção e barra de status com o selo do Core. Pode ser movida, redimensionada, maximizada e minimizada.
- **Menus da barra superior:** cada menu lista todas as seções do arquivo; o de Deuses lista os grupos do panteão e cada divindade.
- **Busca:** `Ctrl K`, `⌘ K` ou `/` abrem a busca do Guia em formato Spotlight.
- **Tabularium:** explorador com o Guia inteiro em pastas e documentos, com filtro.
- **Visualizador de imagens:** mapas e retratos abrem ampliados em janela própria.
- **Preferências:** tema Noite/Dia (o mesmo do site atual), quatro papéis de parede, reduzir animações e ligar/desligar a inicialização.
- **iMessage:** ícone de celular na área de trabalho, no dock do celular e na barra superior, que abre o canal do iMessage no Discord. No celular, o link abre direto no app do Discord. O endereço do canal fica só em `IMESSAGE_URL`, no `principia/principia.js`.
- **Minha Ficha (prévia de teste):** importa o `.json` exportado pela Ficha Oficial e mostra o personagem numa janela da Principia: capa, retrato, HP, Energia, Sanidade, atributos, combate, perícias, talentos, habilidades com as estacas, itens, Roma e história. Cada habilidade, talento e condição tem um link que abre a regra no Guia. No computador, **Lado a lado** coloca a ficha à esquerda e o Guia à direita; no celular, os botões **Ficha** e **Guia** alternam entre as duas telas sem perder o lugar. Os arquivos importados ficam num banco próprio do navegador (`principia_fichas_v1`, IndexedDB), separado dos dados da Ficha Oficial, e nada é enviado. Os números seguem as fórmulas de referência da ficha atual sobre os dados do Core; bônus de Rebento e efeitos de habilidades sobre perícias ainda não entram nas contas. O código fica em `principia/principia-ficha.js`.
- **Celular:** tela inicial com busca, grade de apps e dock; apps em tela cheia com botão de voltar e gaveta de seções.
- **Acessibilidade:** respeita "reduzir movimento" do sistema, funciona por teclado (Esc fecha menus e janelas, setas navegam nos menus) e mantém o foco visível.

## Manutenção

- Quando o `index.html` ganhar uma camada nova de **JS**, replique a mesma linha no `principia.html`, na mesma posição. Camadas novas de **CSS** não entram na Principia: o visual equivalente vai para `principia/guia-ds.css`, na seção da página correspondente.
- Para adotar a Principia como padrão, basta publicar o conteúdo de `principia.html` como `index.html`.
- As preferências ficam no navegador de cada pessoa (`principia_wall`, `principia_motion`, `principia_boot`, `principia_wins`, `principia_seen`). A chave antiga `principia_music` não é mais lida.

## Pontos para validar

- O painel "Nesta página" e os menus passam a mostrar o título visível de cada seção (por exemplo, **Status** em vez de "HP Sanidade Energia"). As palavras-chave continuam no `data-title` e seguem alimentando a busca.
- Os ícones dos apps são recortes dos banners já existentes. Para trocar qualquer um por uma arte dedicada, basta substituir o arquivo correspondente em `assets/principia/icons/`, sem mexer no código.
