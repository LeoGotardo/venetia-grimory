-- Conta (login Firebase): cópia das fichas, campanhas, monstros e mapas de área
-- de cada usuário, uma linha por registro. O app continua local-first; isto é o
-- espelho que junta os aparelhos da mesma conta (api/sync).

-- Um por uid do Firebase. `version` numera as escritas da conta: cada push trava
-- esta linha, então os `seq` de uma conta ficam visíveis sempre em ordem — uma
-- busca por `seq > cursor` nunca pula uma escrita que confirmou depois.
create table cloud_users (
  user_id text primary key,
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cloud_records (
  user_id text not null,
  kind text not null check (kind in ('sheet', 'campaign', 'monster', 'area_map')),
  id text not null,
  -- JSON do registro como o app gravou (texto, para o hash bater dos dois lados); null = apagado.
  data text,
  -- Quando o conteúdo mudou no aparelho que escreveu: o last-write-wins compara isto.
  updated_at timestamptz not null,
  seq bigint not null,
  primary key (user_id, kind, id)
);

create index cloud_records_seq_idx on cloud_records (user_id, seq);
