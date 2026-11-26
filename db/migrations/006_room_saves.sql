-- Protocolo 3: o player age na vez dele pela ficha — efeitos com salvaguarda
-- (magias de área, Agarrar e Empurrar do Ataque Desarmado) e cura (poções,
-- magias), dois eventos novos no log da sala.
alter table room_events drop constraint room_events_kind_check;
alter table room_events add constraint room_events_kind_check check (kind in ('roll', 'chat', 'request', 'attack', 'save', 'heal'));
