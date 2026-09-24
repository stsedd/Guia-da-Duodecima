# Runtime ativo do Guia

Este arquivo separa o runtime publicado do histórico preservado pelo Git.

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

Cópias completas antigas deixaram de permanecer duplicadas no `main`: o histórico continua acessível pelos commits e versões do Git. Arquivos legados isolados que ainda existirem não fazem parte do runtime publicado e não devem receber correções novas.

- `v2.5.5`: corrige a semântica dos Legados no Guia. Composto = LEGADO + LEGADO e permanece na coluna esquerda; Direto = DEUS + LEGADO e permanece na coluna direita. Também corrige a frase de habilidades 6+ para se referir ao Legado Composto.

## Ordem de boot

1. conteúdo editorial local;
2. política de cache/fallback do Core;
3. bridge do Core;
4. patch de Legados;
5. estabilização editorial e reconstrução da busca;
6. aplicação do Guia.

Essa ordem garante que a busca global seja criada somente depois de todas as regras canônicas e patches de conteúdo terem sido aplicados.
