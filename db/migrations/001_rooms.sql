-- Salas online: o que o mestre e os players publicam. A campanha continua local.
-- `version` cresce a cada escrita da sala; docs e eventos guardam a versão em que
-- mudaram, e quem reconecta pede tudo com `version > since`.

create table rooms (
  id uuid primary key default gen_random_uuid(),
  -- Alfabeto sem I, O, 0 e 1 (fáceis de confundir ao ditar o código).
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  name text not null default '' check (char_length(name) <= 120),
  campaign_id uuid not null,
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  role text not null check (role in ('gm', 'player')),
  display_name text not null check (char_length(display_name) between 1 and 60),
  -- sha256 do token do aparelho; o token em si nunca é gravado.
  token_hash bytea not null unique,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  kicked_at timestamptz
);
create index room_members_room_idx on room_members (room_id);
create unique index room_members_one_gm_idx on room_members (room_id) where role = 'gm';

-- Documentos que se substituem inteiros: a ficha de cada player, a mesa e as notas compartilhadas.
create table room_docs (
  room_id uuid not null references rooms(id) on delete cascade,
  kind text not null check (kind in ('sheet', 'table', 'note')),
  id text not null,
  owner_member_id uuid references room_members(id) on delete set null,
  data jsonb,
  version bigint not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (room_id, kind, id)
);
create index room_docs_since_idx on room_docs (room_id, version);

-- Log que só cresce (rolagens e chat), podado para os últimos registros da sala.
create table room_events (
  room_id uuid not null references rooms(id) on delete cascade,
  version bigint not null,
  kind text not null check (kind in ('roll', 'chat')),
  actor_member_id uuid references room_members(id) on delete set null,
  gm_only boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (room_id, version)
);
