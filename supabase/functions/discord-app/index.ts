// Guia da Duodécima · login pelo app do Discord (celular)
//
// O site não consegue ler o endereço de autorização do Discord que o Supabase gera
// (o /auth/v1/authorize sempre redireciona). Esta função pede esse endereço ao próprio
// Supabase e devolve em JSON; o site troca https://discord.com/... por discord://...
// para o celular abrir o app do Discord e a pessoa só tocar em "Autorizar".
//
// Não guarda nada, não recebe segredo e só aceita voltar para o endereço do Guia.
// O endereço devolvido é o mesmo que qualquer pessoa recebe ao clicar em "Entrar".
// Implantação: nome "discord-app", sem exigir JWT (é chamada antes do login).

const ORIGENS = ['https://stsedd.github.io', 'http://localhost:5178'];
const VOLTAS = ['https://stsedd.github.io/Guia-da-Duodecima/', 'http://localhost:5178/'];

Deno.serve(async (req: Request) => {
  const origem = req.headers.get('origin') ?? '';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': ORIGENS.includes(origem) ? origem : ORIGENS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Vary': 'Origin',
    'Cache-Control': 'no-store'
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const json = (status: number, corpo: unknown) =>
    new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
  if (req.method !== 'GET') return json(405, { erro: 'Use GET.' });

  const volta = new URL(req.url).searchParams.get('redirect_to') ?? '';
  if (!VOLTAS.some(v => volta.startsWith(v)) || volta.length > 300) return json(400, { erro: 'Endereço de volta não permitido.' });

  const base = Deno.env.get('SUPABASE_URL');
  if (!base) return json(500, { erro: 'Configuração do projeto indisponível.' });
  // Sem code_challenge: o retorno vem com a sessão no endereço (fluxo implícito), então funciona
  // mesmo quando o app do Discord devolve a pessoa a outro navegador do celular.
  const alvo = `${base}/auth/v1/authorize?provider=discord&scopes=guilds&redirect_to=${encodeURIComponent(volta)}`;
  let local = '';
  try {
    const r = await fetch(alvo, { redirect: 'manual' });
    local = r.headers.get('location') ?? '';
  } catch (_) {
    return json(502, { erro: 'Não consegui falar com o login do Supabase.' });
  }
  if (!/^https:\/\/(discord\.com|discordapp\.com|ptb\.discord\.com|canary\.discord\.com)\//.test(local)) {
    return json(502, { erro: 'O Supabase não devolveu o endereço do Discord.' });
  }
  return json(200, { url: local });
});
