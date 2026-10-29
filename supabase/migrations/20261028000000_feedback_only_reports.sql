-- "Feedback only" submissions (Submit Report -> "I don't have a Job ID").
--
-- A signed-in Guest Teacher without a Job ID can send private feedback. It is
-- stored as a normal reports row flagged feedback_only = true so the admin
-- Reports list, CSV export and My Reports keep working on one table, but it
-- must never become a public report. The application checks all of this too
-- (lib/feedbackOnly.ts, app/api/submit-report, app/api/reports/[id]/approve,
-- lib/publishReport.ts); this migration makes the database the final guard:
--
--   * feedback_only rows can never be approved (status 2), published
--     (published_at / scheduled_publish_at / approval_date) or carry a Job ID;
--   * the flag is fixed at insert, so a report can't be flipped either way
--     afterwards;
--   * only a user whose role is guest_teacher can own a feedback_only row;
--   * at most 5 feedback_only rows per user per UTC calendar day (normal Job
--     ID reports are not counted or limited);
--   * the anon/authenticated API roles can never see feedback_only rows.
--
-- Every public path (teacher/school pages, home page counts, ratings,
-- summaries, monthly stats) already requires status = 2 and published_at not
-- null, which the check constraint below makes impossible for these rows.
--
-- Existing rows all get feedback_only = false and are otherwise unchanged.
-- Apply this BEFORE deploying the code that references reports.feedback_only.

alter table public.reports
  add column if not exists feedback_only boolean not null default false;

alter table public.reports
  drop constraint if exists reports_feedback_only_never_public;

alter table public.reports
  add constraint reports_feedback_only_never_public check (
    not feedback_only
    or (
      job_id is null
      and user_id is not null
      and status is distinct from 2
      and published_at is null
      and scheduled_publish_at is null
      and approval_date is null
    )
  );

-- Serves the daily-limit count below.
create index if not exists reports_feedback_only_user_created_idx
  on public.reports (user_id, created_at)
  where feedback_only;

create or replace function public.reports_guard_feedback_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_today_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.feedback_only is distinct from old.feedback_only then
      raise exception 'reports.feedback_only cannot be changed after submission'
        using errcode = 'GTF03';
    end if;
    return new;
  end if;

  -- INSERT
  if not new.feedback_only then
    return new;
  end if;

  select u.role into v_role from public.users u where u.id = new.user_id;

  if v_role is distinct from 'guest_teacher' then
    raise exception 'Feedback-only submissions require a Guest Teacher account'
      using errcode = 'GTF02';
  end if;

  -- The daily window is based on the server clock, never a client value.
  new.created_at := now();

  -- Serialise concurrent submissions from the same user so two requests
  -- can't both see 4 and both insert a 5th/6th row.
  perform pg_advisory_xact_lock(hashtextextended('reports_feedback_only:' || new.user_id::text, 0));

  select count(*) into v_today_count
  from public.reports r
  where r.user_id = new.user_id
    and r.feedback_only
    and r.created_at >= (date_trunc('day', now() at time zone 'UTC') at time zone 'UTC');

  if v_today_count >= 5 then
    raise exception 'Daily feedback-only limit reached'
      using errcode = 'GTF01';
  end if;

  return new;
end;
$$;

revoke all on function public.reports_guard_feedback_only() from public, anon, authenticated;

drop trigger if exists reports_guard_feedback_only on public.reports;

create trigger reports_guard_feedback_only
  before insert or update on public.reports
  for each row
  execute function public.reports_guard_feedback_only();

-- The app only talks to reports through the service role, which bypasses
-- RLS. Make sure the public API roles can never read or write feedback-only
-- rows, whatever other policies exist. A restrictive policy only narrows
-- access, so existing permissive policies (if any) keep working for normal
-- reports. If RLS on reports was previously disabled, enabling it means the
-- anon/authenticated keys get no direct table access unless a permissive
-- policy grants it - nothing in this codebase uses them for reports.
alter table public.reports enable row level security;

drop policy if exists reports_hide_feedback_only on public.reports;

create policy reports_hide_feedback_only
  on public.reports
  as restrictive
  for all
  to anon, authenticated
  using (feedback_only = false)
  with check (feedback_only = false);
