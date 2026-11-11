-- Exclusão de conta (api/sync/delete): os registros saem e a linha de cloud_users
-- fica como marca, com `deleted_at`. Só o uid sobra. Um uid excluído não volta a
-- entrar no Firebase (um novo login com a mesma conta Google gera outro uid); a
-- marca existe porque o ID token de outro aparelho continua válido por até ~1 h
-- depois da exclusão, e sem ela um push nesse intervalo regravaria dados na conta.
alter table cloud_users add column deleted_at timestamptz;
