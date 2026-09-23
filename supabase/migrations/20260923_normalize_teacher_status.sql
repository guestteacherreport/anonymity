-- The admin Edit Teacher form used to save Inactive as 2 while everything
-- else (create, CSV import, the status filter) uses 0. Fold those rows back
-- into 0 so the Status: Inactive filter finds them.
update public.teachers
set status = 0
where status = 2;
