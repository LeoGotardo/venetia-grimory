-- Rolagens e chat: o nome de quem falou fica no evento (o membro pode sair da
-- sala depois), e "privado" passa a valer para o mestre e o autor, não só o mestre.
alter table room_events rename column gm_only to is_private;
alter table room_events add column actor_name text not null default '';
create index room_events_since_idx on room_events (room_id, version);
