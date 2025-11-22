create table if not exists courses (
  id text primary key,
  created_at timestamptz default now(),
  banner text,
  name text not null,
  teacher text,
  tuition numeric default 0,
  hour text,
  sessions_count integer default 0
);

create index if not exists idx_courses_name on courses(name);

create table if not exists students (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  course_id text references courses(id) on delete set null,
  status text default 'active'
);

create index if not exists idx_students_course on students(course_id);

alter table students add column if not exists last_name text;
alter table students add column if not exists father_name text;
alter table students add column if not exists national_id text;
alter table students add column if not exists address text;
alter table students add column if not exists emergency_phone text;
alter table students add column if not exists issuer text;
alter table students add column if not exists english_name text;
alter table students add column if not exists student_id text;
create unique index if not exists ux_students_student_id on students(student_id);

create table if not exists applicants (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  course text,
  note text,
  status text default 'new'
);

create index if not exists idx_applicants_created on applicants(created_at);

alter table applicants add column if not exists familiarity text;
alter table applicants add column if not exists complete boolean default false;
alter table applicants add column if not exists pre_register boolean default false;
alter table applicants add column if not exists waiting_applicant boolean default false;
alter table applicants add column if not exists next_courses_info boolean default false;
alter table applicants add column if not exists cancelled boolean default false;
alter table applicants add column if not exists send_course_info boolean default false;

create table if not exists classes (
  id text primary key,
  created_at timestamptz default now(),
  course_id text references courses(id) on delete cascade,
  title text not null,
  teacher text,
  start timestamptz,
  end timestamptz,
  room text,
  code text,
  time text,
  days text,
  sessions_count integer default 0,
  sessions jsonb
);
alter table classes add column if not exists end_date timestamptz;
alter table classes add column if not exists certificate_issue_date timestamptz;
alter table classes add column if not exists tech_course_code text;

create index if not exists idx_classes_course_start on classes(course_id, start);

create table if not exists tech_courses (
  id text primary key,
  created_at timestamptz default now(),
  name_fa text not null,
  name_en text,
  tuition numeric default 0,
  code text,
  hours integer default 0
);

create index if not exists idx_tech_courses_name on tech_courses(name_fa);
create table if not exists student_finance_profiles (
  id text primary key,
  created_at timestamptz default now(),
  student_id text references students(id) on delete cascade,
  class_code text,
  upfront_amount numeric default 0,
  upfront_date timestamptz,
  installments jsonb default '[]',
  status text
);
create unique index if not exists ux_student_finance on student_finance_profiles(student_id, class_code);