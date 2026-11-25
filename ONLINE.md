# Contas do Guia da Duodécima (Supabase + Discord)

Tudo de graça: Supabase no plano Free (sem cartão), login pelo Discord e automações do GitHub em repositório público. Nenhuma senha, segredo ou chave privada fica no repositório nem passa pelo Claude.

## Estado da implantação (24/11/2026)

- Projeto exclusivo Duodecima criado no Supabase, região São Paulo, plano Free.
- Esquema instalado com RLS e permissões; configuração pública ligada ao site.
- Pendente: habilitar o provedor Discord no painel, configurar a URL de retorno e conceder o primeiro papel de Dono após login verificado. Não envie segredos pelo GitHub ou pelo chat.
- Callback OAuth no Discord: `https://ovgshjdzowyxagqxrtny.supabase.co/auth/v1/callback`.
- Site URL e redirect permitido no Supabase: `https://stsedd.github.io/Guia-da-Duodecima/principia.html`.
- A validação do link de fama verifica formato, servidor e duplicidade; não lê o conteúdo da mensagem nem atesta o valor lançado.
- O perfil passa a usar identidade confirmada pela API do Discord, não metadados editáveis do usuário.
- **Ficha na conta ativada em 25/11/2026** (migração `duodecima_ficha_na_conta`, aplicada pelo conector do Supabase): colunas, versões, função de salvar, bucket privado `fichas` e permissões conferidos no banco real; contas e personagens intactos.
- Donos definidos em 25/11/2026: @ezra_bdx e @hopefulnessispunk, ambos com permissão máxima (passo 7 concluído). Os outros papéis de Staff são dados pelo Praetorium, aba Jogadores.
- **Login pelo app do Discord (celular):** Edge Function `discord-app` ([código](supabase/functions/discord-app/index.ts)) implantada em 25/11/2026, com "Verify JWT" desligado (ela é chamada antes do login e só devolve o endereço público de autorização). Testada pelo site: devolve o endereço do Discord e recusa voltas para outros sites. Falta só o teste num celular de verdade.

## O que já está pronto no site

- **Minha Conta** (selo com avatar e @ no canto inferior esquerdo; no celular, no alto da tela inicial): entrar com o Discord, sair e excluir a conta.
- **Membro ou visitante:** no login, o banco confere se a conta do Discord está no servidor da Duodécima. Ninguém lê cargos. Quem não está no servidor entra como visitante: vê o Guia inteiro e a Tabula Famae, mas não usa a ficha nem cadastra personagens.
- **Personagens e fama:** cada membro cadastra os personagens e lança a fama com o link da mensagem no Discord. A barra e o título atualizam sozinhos.
- **Tabula Famae:** ranking público de fama com título automático. O @ dos jogadores só aparece para membros logados.
- **Ficha na conta:** a Minha Ficha fica guardada no personagem da conta e abre em qualquer aparelho. Mudanças sobem sozinhas alguns segundos depois; se dois aparelhos mexerem ao mesmo tempo, o jogador escolhe qual versão fica e a outra vai para as versões da conta (as 20 mais recentes). Imagens da ficha vão para o Storage, em pasta privada de cada conta.
- **Praetorium:** painel da Staff com personagens, fama, jogadores e auditoria. Aparece só para quem tem papel de Staff ou Dono, e o banco confere o papel de novo a cada ação.
- **Automações:** sinal diário para o Supabase não pausar, lembrete a cada 5 dias e backup semanal opcional.

Enquanto `principia/online-config.js` estiver vazio, o site funciona normalmente em modo visitante.

## Passo a passo (uma vez, uns 20 minutos)

### 1. Criar o projeto no Supabase
1. Entre em https://supabase.com e crie uma conta (pode ser com o GitHub).
2. **New project**. Nome: `duodecima`. Região: **South America (São Paulo)**. Plano: **Free**.
3. Crie uma senha forte para o banco e guarde no seu gerenciador de senhas. Ela só é usada no backup (passo 9).

### 2. Criar o banco
1. No projeto, abra **SQL Editor** → **New query**.
2. Cole o conteúdo inteiro de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Deve terminar com "Success".

### 3. Criar o app no Discord
1. Abra https://discord.com/developers/applications → **New Application** → nome `Guia da Duodécima`.
2. Em **OAuth2**, copie o **Client ID**. Clique em **Reset Secret** e copie o **Client Secret**. O segredo vai só para o painel do Supabase, nunca para o repositório ou para conversas.
3. Ainda em **OAuth2 → Redirects**, adicione o endereço de retorno que o Supabase mostra no passo 4 (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`) e salve.

### 4. Ligar o Discord no Supabase
1. **Authentication → Sign In / Providers → Discord**: ative e cole o Client ID e o Client Secret. Salve.
2. Ainda em Providers, **desative o Email**, porque o site só usa o Discord.

### 5. Endereços permitidos
Em **Authentication → URL Configuration**:
- **Site URL:** `https://stsedd.github.io/Guia-da-Duodecima/principia.html`
- **Redirect URLs:** adicione o mesmo endereço e, se quiser testar no computador, `http://localhost:5178/principia.html`.

### 6. Ligar o site ao banco
1. Em **Project Settings → API Keys** (ou no botão **Connect**), copie o **Project URL** e a chave **publishable** (ou a `anon public`, na aba Legacy).
2. Cole os dois em [`principia/online-config.js`](principia/online-config.js), nos campos `supabaseUrl` e `supabaseKey`, e publique. Se preferir, mande os dois para o Claude, porque são públicos por natureza. **Nunca** use a chave `service_role`/`secret`.

### 7. Virar dono
1. Abra o site, clique no selo do canto e em **Entrar com o Discord**.
2. Depois do primeiro login e da verificação de membro, rode no SQL Editor, trocando `SEU_ID_DISCORD` pelo ID numérico da sua conta Discord (não pelo @):
   ```sql
   insert into public.papeis (usuario_id, papel) select id, 'dono' from public.perfis where discord_id = 'SEU_ID_DISCORD' and membro;
   ```
3. Recarregue o site: o Praetorium aparece nos ícones da direita. A partir daí, você dá papel de Staff aos outros pela aba **Jogadores**.

### 8. Automações do GitHub
Em **Actions**, confira se os fluxos estão ligados e rode cada um uma vez em **Run workflow**:
- **Supabase · manter ativo**: roda todo dia e grava um sinal no banco. Se falhar, o GitHub avisa por e-mail.
- **Supabase · lembrete a cada 5 dias**: abre uma issue marcando você, com a situação do banco e das últimas execuções. Feche a issue depois de conferir. Ele também mantém os agendamentos ligados, porque o GitHub desliga fluxos agendados depois de 60 dias sem atividade no repositório.

### 9. Backup semanal (opcional, recomendado)
O plano Free não guarda backups. Para ligar o backup, crie dois segredos em **Settings → Secrets and variables → Actions**:
- `SUPABASE_DB_URL`: a connection string do **Session pooler** (Supabase → **Connect**), com a senha do banco do passo 1.
- `BACKUP_PASSPHRASE`: uma senha longa só para os backups.

Toda semana, o fluxo **Supabase · backup semanal** guarda um arquivo criptografado como artefato da execução, por 90 dias. Para abrir um backup: `gpg -d duodecima-AAAA-MM-DD.tar.gz.gpg > backup.tar.gz`. O backup leva as fichas (texto) e as versões; as imagens do Storage não entram nele.

## Login pelo app do Discord

- **Celular:** "Entrar pelo app do Discord" abre o app para a pessoa tocar em **Autorizar**, sem digitar senha. Depois o app devolve a pessoa ao navegador padrão do celular, já logada.
  - O site pede o endereço de autorização à função `discord-app` do Supabase e troca `https://discord.com/…` por `discord://-/oauth2/authorize…`.
  - **Android:** o Chrome abre o app; sem o app instalado, vai para o site do Discord.
  - **iPhone:** se o app não abrir em 2,5 s, o login segue pelo navegador.
  - Há também o link "Entrar pelo navegador".
- **Ressalva:** o Discord não documenta esse caminho. A equipe dele diz que, de propósito, não abre o login (OAuth) no app, porque nem sempre consegue devolver a pessoa ao navegador certo. Por isso esse login volta com a sessão no próprio endereço (fluxo implícito), e funciona mesmo que caia em outro navegador. Se um dia o app parar de aceitar, o login continua pelo navegador sozinho.
- **Atalho instalado na tela inicial:** se a pessoa estiver usando o Guia como atalho na tela inicial do iPhone, a volta cai no Safari, que tem outro armazenamento. Ela fica logada no Safari, não no atalho; nesse caso, vale usar "Entrar pelo navegador" dentro do atalho.
- **Computador:** o app do Discord para desktop não aprova logins de sites. Na página do Discord, use **Entrar com QR Code** e escaneie com o app do celular: também não precisa digitar senha. Depois disso, o navegador fica logado no Discord e os próximos logins pedem só "Autorizar".

## Atualização: ficha na conta (25/11/2026)

Uma vez só, uns 2 minutos:

1. Supabase → **SQL Editor** → **New query**.
2. Cole o conteúdo inteiro de [`supabase/schema.sql`](supabase/schema.sql) (a versão nova) e clique em **Run**. Deve terminar com "Success". Os dados atuais (contas, personagens, fama, papéis) continuam intactos; o arquivo foi testado rodando por cima do esquema anterior com dados.
3. Confira em **Storage** que apareceu o bucket **fichas**, marcado como privado.
4. Recarregue o site. Na Minha Ficha, o selo ao lado do nome passa a mostrar a conta: "Só neste navegador" → toque nele e escolha **Guardar aqui** (num personagem que já existe) ou **Cadastrar e guardar a ficha**.

O que o arquivo acrescenta:
- **Colunas:** `ficha_revisao`, `ficha_salva_em` e `ficha_salva_por` em `personagens`, preenchidas só pelo banco.
- **Tabela de versões:** `fichas_versoes`, com as 20 últimas versões de cada ficha. Ninguém escreve nela direto; só o banco.
- **Função de salvar:** `salvar_ficha`, que detecta quando outro aparelho salvou antes.
- **Bucket de imagens:** `fichas` no Storage, privado, até 1 MB por imagem e cota de 400 imagens / 100 MB por conta.
- **Auditoria:** salvar a ficha não gera registro na auditoria, porque a ficha tem o próprio histórico.

Se algo der erro na parte do Storage, mande só a mensagem de erro; nenhuma chave é necessária.

## Segurança

- **Regras no banco:** todas as permissões estão no banco (RLS e funções em `supabase/schema.sql`). Esconder um botão no site é só conforto visual.
- **Personagens e fama:**
  - Ninguém vê ou altera personagens de outra conta.
  - Linhagem, panteão, divindade e títulos especiais só mudam com a Staff. A divindade pode ser escolhida uma única vez, na reclamação.
  - Lançamentos de fama não são editados nem apagados: a remoção fica marcada, com autor e motivo.
- **Fichas:**
  - Só o dono do personagem e a Staff leem a ficha e as versões dela. Salvar exige ser o dono e membro do servidor, ou Staff; quem salvou por último fica registrado.
  - As imagens ficam numa pasta com o ID da conta, num bucket privado. Ninguém envia para a pasta de outra conta, e só o dono e a Staff baixam.
  - Num computador compartilhado, a Minha Ficha esconde as fichas ligadas a outra conta.
  - Excluir a conta apaga também as imagens da pessoa.
- **Papéis e auditoria:** só o Dono dá ou tira papéis, e o banco impede que o último Dono saia. Toda mudança em personagens, fama, papéis e contas vai para a auditoria, que só a Staff lê.
- **Dados guardados:** ID, @, nome e avatar do Discord, mais "está no servidor: sim/não". O e-mail fica só no sistema de login do Supabase. Cada pessoa pode excluir a própria conta, com personagens e fama.
- **Validade da confirmação:** vale por 90 dias (`membro_validade_dias` na tabela `config`). Depois disso, o site pede um novo login com o Discord.

## Regras de fama no banco

As regras vêm do documento-mestre:

- **Fama inicial automática:**
  - gregos −10, celtas −15, nórdicos e egípcios 0;
  - filhos (prole romana) de Iuppiter, Bellona e Marte Ultor recebem +15 na reclamação.
- **Títulos:**
  - Odiado abaixo de 0; gregos, celtas e filhos de Netuno continuam Odiados até 25;
  - Conhecido a partir de 25;
  - Influente a partir de 50;
  - Famoso a partir de 80;
  - Rebento de Roma Aeterna só com a confirmação da Staff ("Elegível a Rebento" a partir de 100).
- **Piso de título:** filhos de Iuppiter, Bellona e Marte Ultor são Conhecidos desde a reclamação. A Staff pode dar um título mínimo (ex.: Centuriões são Influentes).
- **Requisitos narrativos:** missão, MVP e cargo de Legionário não são conferidos pelo banco; seguem com a Staff.

## Arquivos

| Arquivo | O que faz |
| --- | --- |
| `supabase/schema.sql` | Banco inteiro: tabelas, regras de acesso, fama, títulos, fichas e versões, bucket de imagens, auditoria e sinal de vida. Pode rodar de novo sem perder dados. |
| `supabase/functions/discord-app/index.ts` | Edge Function do login pelo app do Discord no celular: devolve o endereço de autorização para o site abrir no app. |
| `principia/ficha/nuvem.js` | Ficha na conta: envio, recebimento, conflitos entre aparelhos, imagens no Storage e a gaveta "Ficha na conta". |
| `principia/online-config.js` | Endereço e chave pública do Supabase. |
| `principia/principia-online.js` | Login, Minha Conta, Tabula Famae, Praetorium e trava da Minha Ficha. |
| `principia/principia-online.css` | Visual das janelas novas. |
| `.github/workflows/supabase-*.yml` | Sinal diário, lembrete de 5 dias e backup semanal. |
