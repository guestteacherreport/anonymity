alter table public.teachers
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zipcode text;

-- Backfill from each teacher's school so /api/browse-teachers can filter by
-- location directly on the teachers table instead of joining through
-- schools on every request.
update public.teachers t
set city = s.city,
    state = s.state,
    zipcode = s.zipcode
from public.schools s
where t.school_id = s.id;

create index if not exists teachers_city_idx on public.teachers (city);
create index if not exists teachers_state_idx on public.teachers (state);
create index if not exists teachers_zipcode_idx on public.teachers (zipcode);
