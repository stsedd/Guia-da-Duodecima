/* Guia da Duodécima · configuração das contas (Supabase)
   Os dois valores abaixo são PÚBLICOS por natureza: o endereço do projeto e a chave
   "anon"/"publishable" do Supabase. Quem protege os dados é o banco (RLS), não o segredo
   desta chave. NUNCA coloque aqui a chave "service_role"/"secret" nem o segredo do Discord.

   Enquanto os campos estiverem vazios, o site funciona normalmente em modo visitante. */
window.DUODECIMA_ONLINE = {
  supabaseUrl: 'https://ovgshjdzowyxagqxrtny.supabase.co',      // ex.: 'https://abcdefghijklmnop.supabase.co'
  supabaseKey: 'sb_publishable_hIuWaTU95TTKHAcyRkqOpA_74uMV6t_',      // a chave "anon public" (legacy) ou "publishable" (sb_publishable_…)
  discordGuildId: '1498461819902234624'
};
