create table if not exists teachers (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  national_id text,
  skills text,
  note text
);

create index if not exists idx_teachers_name on teachers(name);
