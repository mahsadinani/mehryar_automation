alter table if exists students
  add column if not exists full_name text
  generated always as (coalesce(name,'') || ' ' || coalesce(last_name,'')) stored;

-- Optional one-time migration if you plan to drop last_name and store everything in name
-- update students set name = trim(concat_ws(' ', name, last_name));
-- alter table if exists students drop column if exists last_name;
