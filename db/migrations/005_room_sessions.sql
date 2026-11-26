-- Sessões inteiras na sala (protocolo 2): a agenda de sessões vira documento,
-- e os pedidos de teste do mestre e os ataques dos players viram eventos.
alter table room_docs drop constraint room_docs_kind_check;
alter table room_docs add constraint room_docs_kind_check check (kind in ('sheet', 'table', 'note', 'schedule'));
alter table room_events drop constraint room_events_kind_check;
alter table room_events add constraint room_events_kind_check check (kind in ('roll', 'chat', 'request', 'attack'));
-- A participação na sala também vai com a conta (celular e web entram como o mesmo membro).
alter table cloud_records drop constraint cloud_records_kind_check;
alter table cloud_records add constraint cloud_records_kind_check check (kind in ('sheet', 'campaign', 'monster', 'area_map', 'room'));
