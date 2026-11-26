create or replace function public.fama_inicial(panteao text, linhagem text, divindade text)
returns integer
language sql immutable
set search_path = ''
as $$
  select case
    when panteao = 'celta' then -15
    when panteao = 'grego' then -10
    when panteao = 'romano' and linhagem = 'prole' and divindade = 'netuno' then -15
    when panteao = 'romano' and linhagem = 'prole' and divindade in ('iuppiter', 'bellona', 'marte') then 15
    else 0
  end;
$$;
