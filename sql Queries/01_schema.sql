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
create unique index if not exists ux_tech_courses_code on tech_courses(code);

create table if not exists students (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  course_id text references courses(id) on delete set null,
  status text default 'active',
  last_name text,
  father_name text,
  national_id text,
  address text,
  emergency_phone text,
  issuer text,
  english_name text,
  student_id text
);

create index if not exists idx_students_course on students(course_id);
create unique index if not exists ux_students_student_id on students(student_id);

create table if not exists applicants (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  course text,
  note text,
  status text default 'new',
  familiarity text,
  complete boolean default false,
  pre_register boolean default false,
  waiting_applicant boolean default false,
  next_courses_info boolean default false,
  cancelled boolean default false,
  send_course_info boolean default false
);

create index if not exists idx_applicants_created on applicants(created_at);

create table if not exists classes (
  id text primary key,
  created_at timestamptz default now(),
  course_id text references courses(id) on delete cascade,
  title text not null,
  teacher text,
  start timestamptz,
  room text,
  code text,
  time text,
  days text,
  sessions_count integer default 0,
  sessions jsonb,
  end_date timestamptz,
  certificate_issue_date timestamptz,
  tech_course_code text
);

create index if not exists idx_classes_course_start on classes(course_id, start);

create table if not exists attendance (
  class_id text not null,
  student_id text not null,
  present boolean default false,
  updated_at timestamptz default now(),
  primary key (class_id, student_id)
);

create table if not exists transactions (
  id text primary key,
  created_at timestamptz default now(),
  student_id text references students(id) on delete cascade,
  amount numeric default 0,
  note text
);

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

create table if not exists leads (
  id text primary key,
  created_at timestamptz default now(),
  name text,
  contact text,
  source text
);

create table if not exists data_links (
  key text primary key,
  url text
);
