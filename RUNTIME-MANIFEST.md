# Runtime ativo do Guia

Este arquivo separa o runtime publicado das cópias históricas mantidas no repositório.

## Entrada publicada

- `index.html`
- `styles-v24.css`
- `content-v24.js`
- `core-fetch-policy-v251.js`
- `core-bridge-v24.js`
- `lineage-core-v25.js`
- `guide-stabilization-v251.js`
- `app-v24.js`
- `core-snapshot.json` quando gerado pelo workflow de sincronização
- `assets/` e `assets/visual/`

`content.js`, `app.js`, `styles.css`, cópias anteriores e a pasta `guia-duodecima-github-clean/` permanecem apenas como histórico. Novas correções do site publicado devem ser feitas exclusivamente nos arquivos listados acima.

## Ordem de boot

1. conteúdo editorial local;
2. política de cache/fallback do Core;
3. bridge do Core;
4. patch de Legados;
5. estabilização editorial e reconstrução da busca;
6. aplicação do Guia.

Essa ordem garante que a busca global seja criada somente depois de todas as regras canônicas e patches de conteúdo terem sido aplicados.
