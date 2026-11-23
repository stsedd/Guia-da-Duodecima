# Principia — interface de terminal do Guia

Proposta de nova interface para o Guia da Duodécima, inspirada no site da PostHog: o Guia abre como o computador da Principia. Há uma sequência de inicialização, uma área de trabalho com os arquivos da legião e janelas que abrem cada parte do Guia. No celular, a mesma interface vira uma tela inicial de aparelho, com apps em tela cheia.

A proposta convive com o site atual: `index.html` continua intacto e a nova versão responde em `principia.html`.

## O que não muda

- **Conteúdo idêntico.** As páginas continuam sendo montadas pelo mesmo motor (`app-v24.js` e todas as camadas), com a mesma sincronização com o Duodécima Core e o mesmo snapshot local de fallback. Nas 7 páginas, o texto, as âncoras, as imagens e os blocos expansíveis renderizados em `principia.html` são idênticos aos do `index.html`.
- **Links diretos.** O formato `#page:deuses:deus-vulcano` continua valendo; basta trocar `index.html` por `principia.html` no endereço.
- **Nenhum arquivo existente foi alterado.** A camada nova só adiciona arquivos.

## Arquivos novos

| Arquivo | Função |
| --- | --- |
| `principia.html` | Entrada: carrega os mesmos CSS/JS do `index.html` mais a camada Principia. |
| `principia/principia-early.js` | Carrega antes do motor e faz a rolagem e o histórico funcionarem dentro da janela. |
| `principia/principia.js` | Área de trabalho, janelas, menus, busca, Tabularium, tela do celular e inicialização. |
| `principia/principia.css` | Visual da interface e ajustes do conteúdo dentro das janelas. |
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
- **Música:** a pessoa cola o link de uma playlist, álbum ou música do Spotify e pode salvar vários, com o nome do personagem. O player oficial do Spotify fica numa janela; fechar ou minimizar a janela não para a música, e o mini-player da barra superior pausa e retoma de qualquer lugar. Quem está logado no Spotify naquele navegador ouve as faixas completas; sem login, o Spotify toca prévias de 30 segundos. O script do Spotify só é carregado quando alguém usa o app.
- **Celular:** tela inicial com busca, grade de apps e dock; apps em tela cheia com botão de voltar e gaveta de seções.
- **Acessibilidade:** respeita "reduzir movimento" do sistema, funciona por teclado (Esc fecha menus e janelas, setas navegam nos menus) e mantém o foco visível.

## Manutenção

- Quando o `index.html` ganhar uma camada nova de CSS ou JS, replique a mesma linha no `principia.html`, na mesma posição.
- Para adotar a Principia como padrão, basta publicar o conteúdo de `principia.html` como `index.html`.
- As preferências ficam no navegador de cada pessoa (`principia_wall`, `principia_motion`, `principia_boot`, `principia_wins`, `principia_seen` e, para as playlists, `principia_music`).

## Pontos para validar

- O painel "Nesta página" e os menus passam a mostrar o título visível de cada seção (por exemplo, **Status** em vez de "HP Sanidade Energia"). As palavras-chave continuam no `data-title` e seguem alimentando a busca.
- Os ícones dos apps são recortes dos banners já existentes. Para trocar qualquer um por uma arte dedicada, basta substituir o arquivo correspondente em `assets/principia/icons/`, sem mexer no código.
