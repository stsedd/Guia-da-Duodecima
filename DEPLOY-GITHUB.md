# Deploy no GitHub Pages

1. Extraia o ZIP.
2. Na raiz do repositório devem aparecer diretamente `index.html`, `styles.css`, `app.js`, `content.js` e `assets/`.
3. Faça commit e push para a branch `main`.
4. Abra **Settings → Pages**.
5. Em **Source**, escolha **Deploy from a branch**.
6. Selecione **main** e **/(root)**.
7. Salve e aguarde a publicação.

A presença de `.nojekyll` evita processamento desnecessário pelo Jekyll.
