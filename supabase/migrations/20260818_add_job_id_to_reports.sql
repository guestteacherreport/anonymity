alter table public.reports
  add column if not exists job_id text;

-- One Job ID can only ever have one report. NULLs (existing reports, which
-- predate this field) are not considered equal by a unique index, so this
-- does not affect any pre-existing rows.
create unique index if not exists reports_job_id_unique_idx
  on public.reports (job_id);
