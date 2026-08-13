alter table public.reports
  add column if not exists publish_delay_days integer not null default 0 check (publish_delay_days >= 0),
  add column if not exists published_at timestamptz;

update public.reports
set published_at = approval_date
where status = 2
  and published_at is null;
