-- Single-use password-reset / set-password links.
--
-- Reset tokens are signed and carry a keyed fingerprint of the account's
-- password hash at the time they were issued (lib/password-reset-token.ts).
-- The application checks that fingerprint, then calls this function, which
-- writes the new hash only if the stored hash is still the one that was
-- checked. Check and write are a single UPDATE: a concurrent second request
-- with the same token waits on the row lock, re-evaluates the WHERE clause
-- against the committed new hash, matches nothing and gets false. A used
-- token therefore never works again, and a failed request (weak password,
-- error before this call, rolled-back transaction) does not consume it.
--
-- The expected value is sha256 of the current hash ('' when the account has
-- no password yet), so neither hash is ever placed in a request URL. Only
-- the service role (server-side API routes) may call it.
create or replace function public.reset_password_if_unchanged(
  p_user_id bigint,
  p_expected_password_sha256 text,
  p_new_password_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_new_password_hash is null or p_new_password_hash = '' then
    return false;
  end if;

  update public.users u
  set password = p_new_password_hash
  where u.id = p_user_id
    and encode(sha256(convert_to(coalesce(u.password, ''), 'UTF8')), 'hex') = p_expected_password_sha256;

  return found;
end;
$$;

revoke all on function public.reset_password_if_unchanged(bigint, text, text) from public, anon, authenticated;
grant execute on function public.reset_password_if_unchanged(bigint, text, text) to service_role;
