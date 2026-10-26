-- Database-level guarantee that no two accounts share an email address,
-- ignoring case. The application checks are case-insensitive but cannot
-- prevent races (e.g. a signup and an email-change confirmation for the same
-- address at the same moment); this index does.
--
-- PREREQUISITE (database owner): existing duplicates must be resolved first.
-- Count them (no addresses are returned) with:
--
--   select count(*) as duplicate_groups, coalesce(sum(n), 0) as rows_involved
--   from (
--     select count(*) as n
--     from public.users
--     where email is not null
--     group by lower(email)
--     having count(*) > 1
--   ) d;
--
-- If duplicates exist this migration FAILS with an exception (and changes
-- nothing), so the guarantee can never be silently missing. Merge the
-- duplicates, then re-run it.
do $$
declare
  v_duplicate_groups bigint;
begin
  select count(*) into v_duplicate_groups
  from (
    select 1
    from public.users
    where email is not null
    group by lower(email)
    having count(*) > 1
  ) d;

  if v_duplicate_groups > 0 then
    raise exception 'users_email_lower_unique_idx not created: % case-insensitive duplicate email group(s) exist in public.users', v_duplicate_groups
      using hint = 'Resolve the duplicate accounts, then re-run this migration.';
  end if;

  create unique index if not exists users_email_lower_unique_idx on public.users (lower(email));
end;
$$;
