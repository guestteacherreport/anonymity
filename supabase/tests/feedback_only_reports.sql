-- Database tests for 20261028000000_feedback_only_reports.sql.
--
-- DO NOT RUN AGAINST PRODUCTION. Run against a local/isolated copy of the
-- schema after applying the migration, e.g.
--   psql "$ISOLATED_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/feedback_only_reports.sql
-- Everything runs in one transaction that is rolled back at the end. Each
-- check raises (and aborts) on failure and prints NOTICE 'PASS ...' on success.
-- If users/reports have extra NOT NULL columns in your copy, add them to the
-- inserts below.

begin;

do $$
declare
  v_guest bigint;
  v_guest2 bigint;
  v_admin bigint;
  v_report bigint;
  v_feedback bigint;
  i integer;
begin
  insert into public.users (email, full_name, role)
    values ('fb-test-guest@example.invalid', 'FB Guest', 'guest_teacher') returning id into v_guest;
  insert into public.users (email, full_name, role)
    values ('fb-test-guest2@example.invalid', 'FB Guest 2', 'guest_teacher') returning id into v_guest2;
  insert into public.users (email, full_name, role)
    values ('fb-test-admin@example.invalid', 'FB Admin', 'admin') returning id into v_admin;

  -- Normal report still inserts and defaults to feedback_only = false.
  insert into public.reports (user_id, job_id, school_name, feedback)
    values (v_guest, 'FB-TEST-JOB-1', 'Test School', 'normal') returning id into v_report;
  perform 1 from public.reports where id = v_report and feedback_only = false;
  if not found then raise exception 'FAIL default feedback_only'; end if;
  raise notice 'PASS normal report insert';

  -- Guest teacher feedback only: accepted.
  insert into public.reports (user_id, job_id, school_name, feedback, feedback_only)
    values (v_guest, null, 'Test School', 'private', true) returning id into v_feedback;
  raise notice 'PASS guest teacher feedback insert';

  -- Admin / unknown user: rejected.
  begin
    insert into public.reports (user_id, school_name, feedback, feedback_only)
      values (v_admin, 'Test School', 'x', true);
    raise exception 'FAIL admin feedback accepted';
  exception when sqlstate 'GTF02' then raise notice 'PASS admin feedback rejected';
  end;
  begin
    insert into public.reports (user_id, school_name, feedback, feedback_only)
      values (null, 'Test School', 'x', true);
    raise exception 'FAIL anonymous feedback accepted';
  exception when sqlstate 'GTF02' or check_violation then raise notice 'PASS no-user feedback rejected';
  end;

  -- Feedback only with a Job ID: rejected.
  begin
    insert into public.reports (user_id, job_id, school_name, feedback, feedback_only)
      values (v_guest2, 'FB-TEST-JOB-2', 'Test School', 'x', true);
    raise exception 'FAIL feedback with job id accepted';
  exception when check_violation then raise notice 'PASS feedback with job id rejected';
  end;

  -- Cannot be approved / published / scheduled.
  begin
    update public.reports set status = 2 where id = v_feedback;
    raise exception 'FAIL feedback approved';
  exception when check_violation then raise notice 'PASS approve blocked';
  end;
  begin
    update public.reports set published_at = now() where id = v_feedback;
    raise exception 'FAIL feedback published';
  exception when check_violation then raise notice 'PASS publish blocked';
  end;
  begin
    update public.reports set scheduled_publish_at = now() where id = v_feedback;
    raise exception 'FAIL feedback scheduled';
  exception when check_violation then raise notice 'PASS schedule blocked';
  end;

  -- Cannot be flipped into a normal report (or the reverse).
  begin
    update public.reports set feedback_only = false where id = v_feedback;
    raise exception 'FAIL feedback flipped to report';
  exception when sqlstate 'GTF03' then raise notice 'PASS flag immutable (feedback -> report)';
  end;
  begin
    update public.reports set feedback_only = true where id = v_report;
    raise exception 'FAIL report flipped to feedback';
  exception when sqlstate 'GTF03' then raise notice 'PASS flag immutable (report -> feedback)';
  end;

  -- Rejecting is still allowed (status 3).
  update public.reports set status = 3, rejection_date = now() where id = v_feedback;
  raise notice 'PASS reject allowed';

  -- Daily limit: v_guest already has 1 today; 4 more allowed, 6th rejected.
  for i in 2..5 loop
    insert into public.reports (user_id, school_name, feedback, feedback_only)
      values (v_guest, 'Test School', 'private ' || i, true);
  end loop;
  raise notice 'PASS feedback 1-5 accepted';
  begin
    insert into public.reports (user_id, school_name, feedback, feedback_only)
      values (v_guest, 'Test School', 'private 6', true);
    raise exception 'FAIL 6th feedback accepted';
  exception when sqlstate 'GTF01' then raise notice 'PASS 6th feedback rejected';
  end;

  -- Back-dating created_at does not bypass the limit (trigger overwrites it).
  begin
    insert into public.reports (user_id, school_name, feedback, feedback_only, created_at)
      values (v_guest, 'Test School', 'backdated', true, now() - interval '3 days');
    raise exception 'FAIL backdated feedback bypassed the limit';
  exception when sqlstate 'GTF01' then raise notice 'PASS backdating does not bypass limit';
  end;

  -- Normal reports are unaffected by the feedback limit.
  insert into public.reports (user_id, job_id, school_name, feedback)
    values (v_guest, 'FB-TEST-JOB-3', 'Test School', 'normal after limit');
  raise notice 'PASS normal report after feedback limit';

  -- Another guest teacher has their own limit.
  insert into public.reports (user_id, school_name, feedback, feedback_only)
    values (v_guest2, 'Test School', 'other user', true);
  raise notice 'PASS limit is per user';

  -- Normal report approval path still works.
  update public.reports set status = 2, approval_date = now(), published_at = now() where id = v_report;
  raise notice 'PASS normal report approve/publish';
end
$$;

-- RLS: the public API roles never see feedback-only rows.
set local role anon;
do $$
begin
  if exists (select 1 from public.reports where feedback_only) then
    raise exception 'FAIL anon can read feedback only';
  end if;
  raise notice 'PASS anon cannot read feedback only';
end
$$;
reset role;

set local role authenticated;
do $$
begin
  if exists (select 1 from public.reports where feedback_only) then
    raise exception 'FAIL authenticated can read feedback only';
  end if;
  raise notice 'PASS authenticated cannot read feedback only';
end
$$;
reset role;

rollback;
