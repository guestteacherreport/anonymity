alter table public.calendar_event
  add column if not exists assignment_id text;

-- Speeds up grouping the individual daily rows that belong to the same
-- multi-day assignment when building the Upcoming Jobs list. Existing rows
-- (pre-dating this column) get NULL and are simply never grouped, matching
-- their previous standalone behavior.
create index if not exists calendar_event_assignment_id_idx
  on public.calendar_event (assignment_id);
