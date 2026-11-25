-- =====================================================================
-- Guia da Duodécima · banco de dados no Supabase
-- Contas (login com Discord), papéis da Staff, personagens, fama e auditoria.
--
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem perder dados: tudo usa "if not exists" / "create or replace".
--
-- Segurança: toda regra de permissão está aqui, no banco (RLS + funções).
-- Esconder botões no site é só conforto visual; quem decide é o banco.
-- =====================================================================

create extension if not exists http with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Configuração
-- ---------------------------------------------------------------------
create table if not exists public.config (
  chave text primary key,
  valor text not null
);
insert into public.config (chave, valor) values
  ('discord_guild_id', '1498461819902234624'),  -- servidor da Duodécima
  ('membro_validade_dias', '90')                 -- depois disso, o site pede um novo login
on conflict (chave) do nothing;

alter table public.config enable row level security;
drop policy if exists "config: leitura" on public.config;
create policy "config: leitura" on public.config for select using (true);

-- ---------------------------------------------------------------------
-- 2. Perfis (um por conta do Discord) e papéis da Staff
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text unique,
  discord_usuario text,
  nome_exibicao text,
  avatar_url text,
  membro boolean not null default false,
  membro_verificado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.papeis (
  usuario_id uuid primary key references public.perfis(id) on delete cascade,
  papel text not null check (papel in ('admin', 'dono')),
  concedido_por uuid references public.perfis(id) on delete set null,
  concedido_em timestamptz not null default now()
);

create or replace function public.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.papeis where usuario_id = auth.uid() and papel in ('admin', 'dono'));
$$;

create or replace function public.eh_dono() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.papeis where usuario_id = auth.uid() and papel = 'dono');
$$;

-- Membro = conta do Discord que está no servidor da Duodécima (verificada no login).
-- Ninguém lê cargos do Discord: só "está ou não está no servidor".
create or replace function public.eh_membro() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.eh_admin() or exists (
    select 1 from public.perfis p
    where p.id = auth.uid()
      and p.membro
      and p.membro_verificado_em > now() - make_interval(days => coalesce(
        (select valor::int from public.config where chave = 'membro_validade_dias'), 90))
  );
$$;

-- Cria o perfil; a identidade e o avatar são confirmados pela API do Discord.
create or replace function public.sincronizar_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- O perfil nasce sem identidade pública: os dados vêm da API do Discord
  -- após a confirmação do token, nunca dos metadados editáveis pelo usuário.
  insert into public.perfis (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists perfil_ao_criar_conta on auth.users;
create trigger perfil_ao_criar_conta
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.sincronizar_perfil();

alter table public.perfis enable row level security;
drop policy if exists "perfis: o próprio e a Staff" on public.perfis;
create policy "perfis: o próprio e a Staff" on public.perfis
  for select using (id = (select auth.uid()) or (select public.eh_admin()));

alter table public.papeis enable row level security;
drop policy if exists "papeis: o próprio e a Staff" on public.papeis;
create policy "papeis: o próprio e a Staff" on public.papeis
  for select using (usuario_id = (select auth.uid()) or (select public.eh_admin()));

-- ---------------------------------------------------------------------
-- 3. Personagens
-- ---------------------------------------------------------------------
create table if not exists public.personagens (
  id uuid primary key default gen_random_uuid(),
  jogador_id uuid references public.perfis(id) on delete cascade,   -- vazio = cadastro feito pela Staff
  nome text not null check (char_length(btrim(nome)) between 1 and 80),
  linhagem text not null default 'prole' check (linhagem in ('prole', 'legado')),
  panteao text not null default 'romano' check (panteao in ('romano', 'grego', 'celta', 'nordico', 'egipcio', 'outro')),
  divindade text check (divindade is null or divindade ~ '^[a-z0-9-]{2,40}$'),   -- id do deus no Core (mecânica romana)
  coorte text check (coorte is null or char_length(coorte) <= 40),
  titulo_minimo text check (titulo_minimo is null or titulo_minimo in ('conhecido', 'influente', 'famoso')),  -- só a Staff (ex.: Centurião → influente)
  rebento_confirmado boolean not null default false,                                                       -- só a Staff
  publico boolean not null default true,      -- aparece na Tabula Famae
  dados jsonb not null default '{}'::jsonb check (pg_column_size(dados) < 600000),  -- a ficha (JSON da Ficha Oficial; imagens no Storage)
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  excluido_em timestamptz
);
create index if not exists personagens_jogador on public.personagens (jogador_id) where excluido_em is null;
-- Ficha na conta: revisão, data e autor do último salvamento (preenchidos pelo banco, ver seção 3.1).
alter table public.personagens add column if not exists ficha_revisao integer not null default 0;
alter table public.personagens add column if not exists ficha_salva_em timestamptz;
alter table public.personagens add column if not exists ficha_salva_por uuid references public.perfis(id) on delete set null;

create or replace function public.proteger_personagem() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.atualizado_em := now();
  -- Staff e o SQL Editor (sem usuário) podem tudo.
  if auth.uid() is null or public.eh_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.criado_em := now();
    new.excluido_em := null;
    if new.jogador_id is distinct from auth.uid() then
      raise exception 'O personagem precisa ficar na sua conta.' using errcode = '42501';
    end if;
    if new.rebento_confirmado or new.titulo_minimo is not null then
      raise exception 'Títulos especiais são definidos pela Staff.' using errcode = '42501';
    end if;
    if (select count(*) from public.personagens where jogador_id = auth.uid() and excluido_em is null) >= 12 then
      raise exception 'Limite de 12 personagens por conta.' using errcode = '54000';
    end if;
  else
    if new.jogador_id is distinct from old.jogador_id
       or new.rebento_confirmado is distinct from old.rebento_confirmado
       or new.titulo_minimo is distinct from old.titulo_minimo
       or new.linhagem is distinct from old.linhagem
       or new.panteao is distinct from old.panteao
       or new.criado_em is distinct from old.criado_em
       or (old.divindade is not null and new.divindade is distinct from old.divindade) then
      raise exception 'Prole, panteão e títulos só mudam com a Staff.' using errcode = '42501';
    end if;
    if old.excluido_em is not null and new.excluido_em is distinct from old.excluido_em then
      raise exception 'Só a Staff restaura personagens excluídos.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists proteger_personagem on public.personagens;
create trigger proteger_personagem
  before insert or update on public.personagens
  for each row execute function public.proteger_personagem();

alter table public.personagens enable row level security;
drop policy if exists "personagens: ver os seus" on public.personagens;
create policy "personagens: ver os seus" on public.personagens
  for select using (jogador_id = (select auth.uid()) or (select public.eh_admin()));
drop policy if exists "personagens: criar" on public.personagens;
create policy "personagens: criar" on public.personagens
  for insert with check ((jogador_id = (select auth.uid()) and (select public.eh_membro())) or (select public.eh_admin()));
drop policy if exists "personagens: editar" on public.personagens;
create policy "personagens: editar" on public.personagens
  for update using ((jogador_id = (select auth.uid()) and (select public.eh_membro())) or (select public.eh_admin()))
  with check ((jogador_id = (select auth.uid()) and (select public.eh_membro())) or (select public.eh_admin()));

-- ---------------------------------------------------------------------
-- 3.1 Ficha na conta
-- A ficha é o mesmo JSON da Ficha Oficial, guardado em personagens.dados.
-- As imagens (retrato, capa, artes) vão para o Storage, no bucket privado
-- "fichas"; o JSON guarda só a referência ("duo-img:<id da conta>/<hash>.webp").
-- Quem lê: o dono e a Staff. Quem salva: o dono (membro do servidor) e a Staff.
-- ---------------------------------------------------------------------
create table if not exists public.fichas_versoes (
  id bigint generated always as identity primary key,
  personagem_id uuid not null references public.personagens(id) on delete cascade,
  revisao integer not null,
  dados jsonb not null,
  motivo text check (motivo is null or char_length(motivo) <= 80),
  salva_em timestamptz,
  salva_por uuid references public.perfis(id) on delete set null,
  criada_em timestamptz not null default now()
);
create index if not exists fichas_versoes_personagem on public.fichas_versoes (personagem_id, id desc);

-- Revisão, data e autor da ficha são do banco: o site não consegue forjar.
-- Antes de cada troca, a ficha anterior vira uma versão: no máximo uma a cada 15 minutos,
-- ou sempre que o site informar o motivo (ex.: "antes de restaurar"). Ficam as 20 mais recentes.
create or replace function public.versionar_ficha() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  motivo text := nullif(current_setting('duodecima.motivo_versao', true), '');
begin
  if tg_op = 'INSERT' then
    new.ficha_revisao := case when new.dados = '{}'::jsonb then 0 else 1 end;
    new.ficha_salva_em := case when new.dados = '{}'::jsonb then null else now() end;
    new.ficha_salva_por := case when new.dados = '{}'::jsonb then null else auth.uid() end;
    return new;
  end if;
  if new.dados is not distinct from old.dados then
    new.ficha_revisao := old.ficha_revisao;
    new.ficha_salva_em := old.ficha_salva_em;
    new.ficha_salva_por := old.ficha_salva_por;
    return new;
  end if;
  -- A revisão só cresce (nunca volta a 0), para nenhum aparelho confundir uma ficha nova com a antiga.
  -- Ficha tirada da conta (dados = {}) fica sem data: "ficha_salva_em vazio" = sem ficha na conta.
  new.ficha_revisao := old.ficha_revisao + 1;
  new.ficha_salva_em := case when new.dados = '{}'::jsonb then null else now() end;
  new.ficha_salva_por := auth.uid();
  if old.dados is distinct from '{}'::jsonb and (motivo is not null or not exists (
       select 1 from public.fichas_versoes v where v.personagem_id = old.id and v.criada_em > now() - interval '15 minutes')) then
    insert into public.fichas_versoes (personagem_id, revisao, dados, motivo, salva_em, salva_por)
    values (old.id, old.ficha_revisao, old.dados, coalesce(motivo, 'automática'), old.ficha_salva_em, old.ficha_salva_por);
    delete from public.fichas_versoes v
     where v.personagem_id = old.id
       and v.id not in (select x.id from public.fichas_versoes x where x.personagem_id = old.id order by x.id desc limit 20);
  end if;
  return new;
end $$;

drop trigger if exists versionar_ficha on public.personagens;
create trigger versionar_ficha
  before insert or update on public.personagens
  for each row execute function public.versionar_ficha();

alter table public.fichas_versoes enable row level security;
drop policy if exists "versões: as dos seus personagens" on public.fichas_versoes;
create policy "versões: as dos seus personagens" on public.fichas_versoes
  for select using (
    (select public.eh_admin())
    or exists (select 1 from public.personagens p where p.id = personagem_id and p.jogador_id = (select auth.uid()))
  );
-- Sem INSERT/UPDATE/DELETE para o site: as versões só nascem pelo gatilho acima.

-- Salva a ficha se ninguém salvou outra por cima desde a revisão que o aparelho conhece.
-- Se outro aparelho salvou antes, devolve {conflito: true} e o site pergunta qual versão manter.
create or replace function public.salvar_ficha(personagem uuid, ficha jsonb, revisao_base integer, motivo text default null)
returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  p record;
  nova integer;
  em timestamptz;
begin
  if auth.uid() is null then raise exception 'Entre com o Discord primeiro.' using errcode = '28000'; end if;
  if ficha is null or jsonb_typeof(ficha) <> 'object' then raise exception 'Ficha inválida.' using errcode = '22023'; end if;
  -- Roda com as permissões de quem chamou: o RLS só mostra os próprios personagens (ou todos, para a Staff).
  select x.jogador_id, x.ficha_revisao, x.ficha_salva_em, x.excluido_em into p
    from public.personagens x where x.id = personagem;
  if not found then raise exception 'Personagem não encontrado na sua conta.' using errcode = '42501'; end if;
  if not (public.eh_admin() or (p.jogador_id = auth.uid() and public.eh_membro())) then
    raise exception 'Só o dono do personagem (membro do servidor) ou a Staff salva esta ficha.' using errcode = '42501';
  end if;
  if p.excluido_em is not null then raise exception 'Este personagem foi excluído da conta.' using errcode = '42501'; end if;
  if p.ficha_revisao is distinct from revisao_base then
    return jsonb_build_object('ok', false, 'conflito', true, 'revisao', p.ficha_revisao, 'salva_em', p.ficha_salva_em);
  end if;
  perform set_config('duodecima.motivo_versao', coalesce(left(btrim(motivo), 80), ''), true);
  update public.personagens x set dados = ficha
   where x.id = personagem and x.ficha_revisao = revisao_base
  returning x.ficha_revisao, x.ficha_salva_em into nova, em;
  perform set_config('duodecima.motivo_versao', '', true);
  if nova is null then
    select x.ficha_revisao, x.ficha_salva_em into nova, em from public.personagens x where x.id = personagem;
    return jsonb_build_object('ok', false, 'conflito', true, 'revisao', nova, 'salva_em', em);
  end if;
  return jsonb_build_object('ok', true, 'revisao', nova, 'salva_em', em);
exception when check_violation then
  raise exception 'A ficha passou do limite de tamanho da conta (600 KB sem as imagens).' using errcode = '54000';
end $$;

-- Imagens das fichas: bucket privado; cada conta escreve só na própria pasta (<id da conta>/…),
-- até 1 MB por imagem e uma cota por conta. Ler: o dono e a Staff.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fichas', 'fichas', false, 1048576, array['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.cota_imagens_ok() returns boolean
language sql stable security definer set search_path = '' as $$
  select count(*) < 400 and coalesce(sum((o.metadata->>'size')::bigint), 0) < 100 * 1024 * 1024
  from storage.objects o
  where o.bucket_id = 'fichas' and (storage.foldername(o.name))[1] = auth.uid()::text;
$$;

drop policy if exists "fichas: ver imagens" on storage.objects;
create policy "fichas: ver imagens" on storage.objects for select to authenticated
  using (bucket_id = 'fichas' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.eh_admin())));
drop policy if exists "fichas: enviar imagens" on storage.objects;
create policy "fichas: enviar imagens" on storage.objects for insert to authenticated
  with check (bucket_id = 'fichas' and (storage.foldername(name))[1] = (select auth.uid())::text
              and (select public.eh_membro()) and (select public.cota_imagens_ok()));
drop policy if exists "fichas: apagar imagens" on storage.objects;
create policy "fichas: apagar imagens" on storage.objects for delete to authenticated
  using (bucket_id = 'fichas' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.eh_admin())));

-- ---------------------------------------------------------------------
-- 4. Fama: cada ganho ou perda é um registro com o link da mensagem no Discord
-- ---------------------------------------------------------------------
create table if not exists public.fama_registros (
  id uuid primary key default gen_random_uuid(),
  personagem_id uuid not null references public.personagens(id) on delete cascade,
  quantidade integer not null check (quantidade between -500 and 500 and quantidade <> 0),
  motivo text not null check (char_length(btrim(motivo)) between 3 and 300),
  link_discord text not null check (char_length(link_discord) <= 200),
  criado_por uuid references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now(),
  removido_em timestamptz,
  removido_por uuid references public.perfis(id) on delete set null,
  motivo_remocao text check (motivo_remocao is null or char_length(motivo_remocao) <= 300)
);
create index if not exists fama_por_personagem on public.fama_registros (personagem_id) where removido_em is null;
create unique index if not exists fama_link_ativo_unico on public.fama_registros (personagem_id, link_discord) where removido_em is null;

create or replace function public.validar_fama() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  guild text := (select valor from public.config where chave = 'discord_guild_id');
begin
  new.link_discord := btrim(coalesce(new.link_discord, ''));
  -- Donos e Staff podem ajustar a fama de qualquer jogador sem uma mensagem do Discord:
  -- o registro ganha um marcador único "staff:<id>" (o site mostra "ajuste da Staff").
  if new.link_discord = '' and auth.uid() is not null and public.eh_admin() then
    new.link_discord := 'staff:' || gen_random_uuid()::text;
  elsif new.link_discord !~ ('^https://(www\.|ptb\.|canary\.)?discord(app)?\.com/channels/' || guild || '/[0-9]{5,25}/[0-9]{5,25}/?$') then
    raise exception 'Use o link de uma mensagem do servidor da Duodécima (botão direito na mensagem → Copiar link da mensagem).' using errcode = '22023';
  end if;
  -- Canonicaliza host e barra final para detectar links repetidos.
  new.link_discord := regexp_replace(regexp_replace(new.link_discord,
    '^https://(www\.|ptb\.|canary\.)?discord(app)?\.com/', 'https://discord.com/'), '/$', '');
  new.motivo := btrim(new.motivo);
  if auth.uid() is not null then
    new.criado_por := auth.uid();
  end if;
  if auth.uid() is null or public.eh_admin() then
    return new;
  end if;
  new.criado_em := now();
  new.removido_em := null;
  new.removido_por := null;
  new.motivo_remocao := null;
  if exists (select 1 from public.fama_registros f
             where f.personagem_id = new.personagem_id and f.link_discord = new.link_discord and f.removido_em is null) then
    raise exception 'Esse link já foi lançado para este personagem.' using errcode = '23505';
  end if;
  if (select count(*) from public.fama_registros where criado_por = auth.uid() and criado_em > now() - interval '1 day') >= 40 then
    raise exception 'Muitos registros em pouco tempo. Tente de novo amanhã ou fale com a Staff.' using errcode = '54000';
  end if;
  return new;
end $$;

drop trigger if exists validar_fama on public.fama_registros;
create trigger validar_fama
  before insert on public.fama_registros
  for each row execute function public.validar_fama();

alter table public.fama_registros enable row level security;
drop policy if exists "fama: ver a dos seus personagens" on public.fama_registros;
create policy "fama: ver a dos seus personagens" on public.fama_registros
  for select using (
    (select public.eh_admin())
    or exists (select 1 from public.personagens p where p.id = personagem_id and p.jogador_id = (select auth.uid()))
  );
drop policy if exists "fama: lançar nos seus personagens" on public.fama_registros;
create policy "fama: lançar nos seus personagens" on public.fama_registros
  for insert with check (
    (select public.eh_admin())
    or ((select public.eh_membro()) and exists (
      select 1 from public.personagens p
      where p.id = personagem_id and p.jogador_id = (select auth.uid()) and p.excluido_em is null))
  );
-- Sem UPDATE/DELETE direto: apagar é pela função apagar_fama (confere quem pode e fica na auditoria).

create or replace function public.remover_fama(registro uuid, motivo text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r record;
begin
  select f.*, p.jogador_id into r
  from public.fama_registros f join public.personagens p on p.id = f.personagem_id
  where f.id = registro;
  if not found then raise exception 'Registro não encontrado.'; end if;
  if auth.uid() is null or not coalesce(public.eh_admin() or (r.jogador_id = auth.uid() and r.criado_por = auth.uid()), false) then
    raise exception 'Você não pode remover este registro.' using errcode = '42501';
  end if;
  update public.fama_registros
     set removido_em = now(), removido_por = auth.uid(), motivo_remocao = left(btrim(remover_fama.motivo), 300)
   where id = registro and removido_em is null;
end $$;

create or replace function public.restaurar_fama(registro uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then raise exception 'Só a Staff restaura registros.' using errcode = '42501'; end if;
  update public.fama_registros set removido_em = null, removido_por = null, motivo_remocao = null where id = registro;
end $$;

-- Apagar de verdade (25/11/2026, pedido da Staff): o lançamento sai da conta e da Tabula, e o link fica livre
-- para lançar de novo. Quem pode: quem lançou, no próprio personagem, ou a Staff. A auditoria guarda a cópia.
create or replace function public.apagar_fama(registro uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r record;
begin
  select f.*, p.jogador_id into r
  from public.fama_registros f join public.personagens p on p.id = f.personagem_id
  where f.id = registro;
  if not found then raise exception 'Registro não encontrado.'; end if;
  if auth.uid() is null or not coalesce(public.eh_admin() or (r.jogador_id = auth.uid() and r.criado_por = auth.uid()), false) then
    raise exception 'Você não pode apagar este registro.' using errcode = '42501';
  end if;
  delete from public.fama_registros where id = registro;
end $$;

-- Fama inicial automática (regras do Guia):
--   gregos −10; celtas −15; nórdicos e egípcios 0;
--   filhos (prole romana) de Iuppiter, Bellona ou Marte Ultor recebem +15 ao serem reclamados.
create or replace function public.fama_inicial(panteao text, linhagem text, divindade text) returns integer
language sql immutable set search_path = '' as $$
  select (case panteao when 'grego' then -10 when 'celta' then -15 else 0 end)
       + (case when panteao = 'romano' and linhagem = 'prole' and divindade in ('iuppiter', 'bellona', 'marte') then 15 else 0 end);
$$;

-- Título pela fama (regras do Guia):
--   < 0 Odiado · 25 Conhecido · 50 Influente · 80 Famoso · Rebento só com confirmação da Staff.
--   Gregos, celtas e filhos de Netuno continuam Odiados até chegarem a 25.
--   Filhos de Iuppiter, Bellona e Marte Ultor são Conhecidos desde a reclamação.
--   "titulo_minimo" é o piso dado pela Staff (ex.: Centuriões são Influentes).
-- Requisitos narrativos de cada título (missão, MVP, Legionário) não são checados aqui.
create or replace function public.titulo_fama(total integer, panteao text, linhagem text, divindade text,
                                              titulo_minimo text, rebento boolean) returns text
language plpgsql immutable set search_path = '' as $$
declare
  ordem text[] := array['odiado', 'nenhum', 'conhecido', 'influente', 'famoso'];
  n int;
  piso int := 1;
begin
  if rebento then return 'rebento'; end if;
  n := case when total >= 80 then 5 when total >= 50 then 4 when total >= 25 then 3 when total >= 0 then 2 else 1 end;
  if n < 3 and (panteao in ('grego', 'celta') or (divindade = 'netuno' and linhagem = 'prole')) then n := 1; end if;
  if panteao = 'romano' and linhagem = 'prole' and divindade in ('iuppiter', 'bellona', 'marte') then piso := 3; end if;
  if titulo_minimo is not null then piso := greatest(piso, array_position(ordem, titulo_minimo)); end if;
  return nullif(ordem[greatest(n, piso)], 'nenhum');
end $$;

-- Personagens com fama total e título (respeita as permissões de quem pergunta).
-- Colunas explícitas: a ficha (dados) não passa por aqui. Recriada do zero porque as colunas mudaram.
drop view if exists public.personagens_fama;
create view public.personagens_fama with (security_invoker = true) as
select p.id, p.jogador_id, p.nome, p.linhagem, p.panteao, p.divindade, p.coorte, p.titulo_minimo,
       p.rebento_confirmado, p.publico, p.criado_em, p.atualizado_em, p.excluido_em,
       p.ficha_revisao, p.ficha_salva_em, t.fama,
       public.titulo_fama(t.fama, p.panteao, p.linhagem, p.divindade, p.titulo_minimo, p.rebento_confirmado) as titulo,
       (t.fama >= 100 and not p.rebento_confirmado) as elegivel_rebento
from public.personagens p
cross join lateral (
  select public.fama_inicial(p.panteao, p.linhagem, p.divindade)
       + coalesce((select sum(f.quantidade) from public.fama_registros f
                   where f.personagem_id = p.id and f.removido_em is null), 0)::int as fama
) t;

-- Tabula Famae: ranking público. O @ do jogador só aparece para membros do servidor.
create or replace function public.tabula_famae()
returns table (posicao bigint, personagem_id uuid, nome text, linhagem text, panteao text, divindade text,
               coorte text, fama integer, titulo text, elegivel_rebento boolean, jogador text, jogador_avatar text)
language sql stable security definer set search_path = '' as $$
  with eu as (select public.eh_membro() as membro),
  soma as (
    select p.*, public.fama_inicial(p.panteao, p.linhagem, p.divindade)
         + coalesce((select sum(f.quantidade) from public.fama_registros f
                     where f.personagem_id = p.id and f.removido_em is null), 0)::int as total
    from public.personagens p
    where p.excluido_em is null and p.publico
  )
  select rank() over (order by s.total desc), s.id, s.nome, s.linhagem, s.panteao, s.divindade, s.coorte, s.total,
         public.titulo_fama(s.total, s.panteao, s.linhagem, s.divindade, s.titulo_minimo, s.rebento_confirmado),
         s.total >= 100 and not s.rebento_confirmado,
         case when eu.membro then pf.discord_usuario end,
         case when eu.membro then pf.avatar_url end
  from soma s cross join eu left join public.perfis pf on pf.id = s.jogador_id
  order by s.total desc, s.nome;
$$;

-- ---------------------------------------------------------------------
-- 5. Verificação de membro (Discord) e conta
-- ---------------------------------------------------------------------
-- O site manda o token do Discord que acabou de receber no login (escopo "guilds").
-- O banco confere se o token é desta mesma conta e se a lista de servidores inclui a Duodécima.
-- Nada além de "membro: sim/não" é guardado; o token não é salvo.
create or replace function public.verificar_membro(token_discord text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  meu_discord text;
  guild text := (select valor from public.config where chave = 'discord_guild_id');
  ua text := 'GuiaDuodecima (https://stsedd.github.io/Guia-da-Duodecima, 1.0)';
  ultimo timestamptz;
  r extensions.http_response;
  achou boolean;
  identidade jsonb;
begin
  if uid is null then raise exception 'Entre com o Discord primeiro.' using errcode = '28000'; end if;
  if token_discord is null or char_length(token_discord) not between 10 and 300 then
    raise exception 'Token do Discord inválido.' using errcode = '22023';
  end if;
  select membro_verificado_em into ultimo from public.perfis where id = uid;
  if ultimo > now() - interval '20 seconds' then
    return jsonb_build_object('membro', (select membro from public.perfis where id = uid), 'verificado_em', ultimo);
  end if;
  select coalesce(i.provider_id, i.identity_data->>'sub') into meu_discord
  from auth.identities i where i.user_id = uid and i.provider = 'discord' limit 1;
  if meu_discord is null then raise exception 'Esta conta não entrou pelo Discord.' using errcode = '28000'; end if;

  begin
    perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS', '8000');
  exception when others then null;
  end;

  r := extensions.http(('GET', 'https://discord.com/api/v10/users/@me',
        array[extensions.http_header('Authorization', 'Bearer ' || token_discord), extensions.http_header('User-Agent', ua)],
        null, null)::extensions.http_request);
  if r.status <> 200 then raise exception 'O Discord não confirmou o login (%). Entre de novo.', r.status; end if;
  identidade := r.content::jsonb;
  if (identidade ->> 'id') is distinct from meu_discord then
    raise exception 'Esse token não é desta conta.' using errcode = '42501';
  end if;

  r := extensions.http(('GET', 'https://discord.com/api/v10/users/@me/guilds?limit=200',
        array[extensions.http_header('Authorization', 'Bearer ' || token_discord), extensions.http_header('User-Agent', ua)],
        null, null)::extensions.http_request);
  if r.status <> 200 then raise exception 'O Discord não listou os servidores (%). Entre de novo.', r.status; end if;
  select exists (select 1 from jsonb_array_elements(r.content::jsonb) g where g->>'id' = guild) into achou;

  update public.perfis set
    discord_id = meu_discord,
    discord_usuario = identidade->>'username',
    nome_exibicao = coalesce(nullif(identidade->>'global_name', ''), identidade->>'username'),
    avatar_url = case when identidade->>'avatar' ~ '^(a_)?[a-f0-9]+$'
      then 'https://cdn.discordapp.com/avatars/' || meu_discord || '/' || (identidade->>'avatar') || '.png'
      else null end,
    membro = achou, membro_verificado_em = now(), atualizado_em = now()
  where id = uid;
  return jsonb_build_object('membro', achou, 'verificado_em', now());
end $$;

-- Resumo da conta para o site: perfil, papel e se vale como membro agora.
create or replace function public.minha_conta() returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'perfil', (select to_jsonb(p) from public.perfis p where p.id = auth.uid()),
    'papel', (select papel from public.papeis where usuario_id = auth.uid()),
    'membro', public.eh_membro()
  ) end;
$$;

-- Staff: marcar alguém como membro ou visitante à mão (ex.: problema no login).
create or replace function public.definir_membro(alvo uuid, valor boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then raise exception 'Só a Staff pode fazer isso.' using errcode = '42501'; end if;
  update public.perfis set membro = valor, membro_verificado_em = now() where id = alvo;
end $$;

-- Dono: dar ou tirar papéis ("admin", "dono" ou null para tirar).
create or replace function public.definir_papel(alvo uuid, novo text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_dono() then raise exception 'Só o dono pode mudar papéis.' using errcode = '42501'; end if;
  if novo is not null and novo not in ('admin', 'dono') then raise exception 'Papel inválido.'; end if;
  if alvo = auth.uid() and novo is distinct from 'dono'
     and (select count(*) from public.papeis where papel = 'dono') <= 1 then
    raise exception 'Você é o único dono: promova outra pessoa antes.';
  end if;
  if novo is null then
    delete from public.papeis where usuario_id = alvo;
  else
    insert into public.papeis (usuario_id, papel, concedido_por) values (alvo, novo, auth.uid())
    on conflict (usuario_id) do update set papel = excluded.papel, concedido_por = excluded.concedido_por, concedido_em = now();
  end if;
end $$;

-- Excluir a própria conta: apaga perfil, personagens e fama (LGPD). A auditoria guarda o histórico da Staff.
create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Entre primeiro.' using errcode = '28000'; end if;
  if public.eh_dono() and (select count(*) from public.papeis where papel = 'dono') <= 1 then
    raise exception 'Você é o único dono: passe o cargo para outra pessoa antes de excluir a conta.';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------------------------------------------------------------------
-- 6. Auditoria (só a Staff lê; ninguém edita)
-- ---------------------------------------------------------------------
create table if not exists public.auditoria (
  id bigint generated always as identity primary key,
  quando timestamptz not null default now(),
  quem uuid,
  acao text not null,
  tabela text not null,
  registro text,
  antes jsonb,
  depois jsonb
);
create index if not exists auditoria_quando on public.auditoria (quando desc);

create or replace function public.registrar_auditoria() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  -- A ficha tem o próprio histórico (fichas_versoes); salvar a ficha não enche a auditoria.
  ignorar text[] := array['dados', 'atualizado_em', 'membro_verificado_em', 'ficha_revisao', 'ficha_salva_em', 'ficha_salva_por'];
  a jsonb;
  d jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then a := to_jsonb(old) - ignorar; end if;
  if tg_op in ('INSERT', 'UPDATE') then d := to_jsonb(new) - ignorar; end if;
  if tg_op = 'UPDATE' and a = d then return new; end if;
  insert into public.auditoria (quem, acao, tabela, registro, antes, depois)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce(d->>'id', a->>'id', d->>'usuario_id', a->>'usuario_id'), a, d);
  return coalesce(new, old);
end $$;

drop trigger if exists auditoria on public.personagens;
create trigger auditoria after insert or update or delete on public.personagens
  for each row execute function public.registrar_auditoria();
drop trigger if exists auditoria on public.fama_registros;
create trigger auditoria after insert or update or delete on public.fama_registros
  for each row execute function public.registrar_auditoria();
drop trigger if exists auditoria on public.papeis;
create trigger auditoria after insert or update or delete on public.papeis
  for each row execute function public.registrar_auditoria();
drop trigger if exists auditoria on public.perfis;
create trigger auditoria after insert or update or delete on public.perfis
  for each row execute function public.registrar_auditoria();

alter table public.auditoria enable row level security;
drop policy if exists "auditoria: só a Staff" on public.auditoria;
create policy "auditoria: só a Staff" on public.auditoria for select using ((select public.eh_admin()));

-- ---------------------------------------------------------------------
-- 7. Sinal de vida (o GitHub chama todo dia para o projeto não pausar)
-- ---------------------------------------------------------------------
create table if not exists public.sinal_vida (
  id smallint primary key default 1 check (id = 1),
  ultimo timestamptz not null default now(),
  total bigint not null default 0
);
insert into public.sinal_vida (id) values (1) on conflict (id) do nothing;
alter table public.sinal_vida enable row level security;
drop policy if exists "sinal: leitura" on public.sinal_vida;
create policy "sinal: leitura" on public.sinal_vida for select using (true);

create or replace function public.manter_ativo() returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare
  t timestamptz;
begin
  update public.sinal_vida set ultimo = now(), total = total + 1
   where id = 1 and ultimo < now() - interval '10 minutes'
  returning ultimo into t;
  return coalesce(t, (select ultimo from public.sinal_vida where id = 1));
end $$;

-- ---------------------------------------------------------------------
-- 8. Permissões de acesso (além do RLS)
-- ---------------------------------------------------------------------
revoke all on public.config, public.perfis, public.papeis, public.personagens, public.fama_registros,
              public.auditoria, public.sinal_vida, public.personagens_fama from anon, authenticated;
grant select on public.config, public.sinal_vida to anon, authenticated;
grant select on public.perfis, public.papeis, public.auditoria, public.personagens_fama to authenticated;
grant select, insert, update on public.personagens to authenticated;
grant select, insert on public.fama_registros to authenticated;
revoke all on public.fichas_versoes from anon, authenticated;
grant select on public.fichas_versoes to authenticated;
revoke execute on function public.salvar_ficha(uuid, jsonb, integer, text), public.cota_imagens_ok() from public, anon;
grant execute on function public.salvar_ficha(uuid, jsonb, integer, text), public.cota_imagens_ok() to authenticated;
revoke execute on function public.versionar_ficha() from public, anon, authenticated;

-- Funções que mexem em conta, papéis ou fama: só para quem está logado (o banco ainda confere quem é).
revoke execute on function public.verificar_membro(text), public.minha_conta(),
                           public.remover_fama(uuid, text), public.restaurar_fama(uuid), public.apagar_fama(uuid),
                           public.definir_membro(uuid, boolean), public.definir_papel(uuid, text),
                           public.excluir_minha_conta() from public, anon;
grant execute on function public.verificar_membro(text), public.minha_conta(),
                          public.remover_fama(uuid, text), public.restaurar_fama(uuid), public.apagar_fama(uuid),
                          public.definir_membro(uuid, boolean), public.definir_papel(uuid, text),
                          public.excluir_minha_conta() to authenticated;
-- Funções de gatilho não são endpoints públicos.
revoke execute on function public.sincronizar_perfil(), public.proteger_personagem(), public.validar_fama(), public.registrar_auditoria() from public, anon, authenticated;
-- Leitura pública: ranking, sinal de vida e as regras de título.
grant execute on function public.tabula_famae(), public.manter_ativo(), public.eh_admin(), public.eh_dono(),
                          public.eh_membro(), public.fama_inicial(text, text, text),
                          public.titulo_fama(integer, text, text, text, text, boolean) to anon, authenticated;
revoke execute on function public.eh_admin(), public.eh_dono(), public.eh_membro() from public, anon;
grant execute on function public.eh_admin(), public.eh_dono(), public.eh_membro() to authenticated;

-- =====================================================================
-- Depois do seu primeiro login no site, rode SÓ a linha abaixo (trocando
-- SEU_ID_DISCORD pelo ID numérico da sua conta Discord verificada) para virar o dono:
--
-- insert into public.papeis (usuario_id, papel) select id, 'dono' from public.perfis where discord_id = 'SEU_ID_DISCORD' and membro;
-- =====================================================================
