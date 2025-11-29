-- 🗄️ اسکریپت کامل راه‌اندازی دیتابیس Supabase
-- این فایل تمام جدول‌ها و داده‌های لازم رو یجا اضافه می‌کنه

-- ===================================
-- 00_reset.sql - پاک کردن تمام جدول‌ها
-- ===================================
drop table if exists attendance cascade;
drop table if exists transactions cascade;
drop table if exists student_finance_profiles cascade;
drop table if exists students cascade;
drop table if exists classes cascade;
drop table if exists tech_courses cascade;
drop table if exists courses cascade;

-- ===================================
-- 01_schema.sql - ساخت جدول‌ها
-- ===================================
create table if not exists courses (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  teacher text,
  tuition integer default 0,
  hour text,
  sessions_count integer default 0
);

create table if not exists tech_courses (
  id text primary key,
  created_at timestamptz default now(),
  name_fa text not null,
  name_en text,
  tuition integer default 0,
  code text unique,
  hours integer default 0
);

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

create table if not exists students (
  id text primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text,
  email text,
  parent_phone text,
  parent_name text,
  birth_date date,
  school text,
  grade text,
  address text,
  registration_date timestamptz default now(),
  status text default 'active'
);

create table if not exists student_finance_profiles (
  id text primary key,
  created_at timestamptz default now(),
  student_id text references students(id) on delete cascade,
  total_paid integer default 0,
  remaining_balance integer default 0,
  discount_percentage integer default 0,
  payment_plan text,
  notes text
);

create table if not exists transactions (
  id text primary key,
  created_at timestamptz default now(),
  student_id text references students(id) on delete cascade,
  amount integer not null,
  type text not null, -- 'payment', 'refund', 'discount'
  method text, -- 'cash', 'card', 'transfer'
  reference text,
  notes text,
  date timestamptz default now()
);

create table if not exists attendance (
  id text primary key,
  created_at timestamptz default now(),
  class_id text references classes(id) on delete cascade,
  student_id text references students(id) on delete cascade,
  date date not null,
  status text not null, -- 'present', 'absent', 'late', 'excused'
  notes text,
  time text
);

-- ایندکس‌ها برای عملکرد بهتر
create index if not exists idx_courses_name on courses(name);
create index if not exists idx_tech_courses_code on tech_courses(code);
create index if not exists idx_classes_course_id on classes(course_id);
create index if not exists idx_classes_tech_course_code on classes(tech_course_code);
create index if not exists idx_students_phone on students(phone);
create index if not exists idx_students_status on students(status);
create index if not exists idx_transactions_student_id on transactions(student_id);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_attendance_class_id on attendance(class_id);
create index if not exists idx_attendance_student_id on attendance(student_id);
create index if not exists idx_attendance_date on attendance(date);
create index if not exists idx_student_finance_profiles_student_id on student_finance_profiles(student_id);

-- ===================================
-- 02_seed_school_courses.sql - 74 دوره مدرسه
-- ===================================
insert into courses (id, name, teacher, tuition, hour, sessions_count) values
('crs1', 'مقدماتی', 'مدرس A', 1000000, '10-12', 8),
('crs2', 'پیشرفته', 'مدرس B', 1500000, '14-16', 12),
('crs3', 'حرفه‌ای', 'مدرس C', 2000000, '16-18', 16),
('crs4', 'مبتدی', 'مدرس D', 800000, '9-11', 6),
('crs5', 'تخصصی', 'مدرس E', 2500000, '18-20', 20),
('crs6', 'فشرده', 'مدرس F', 1200000, '13-15', 10),
('crs7', 'آنلاین', 'مدرس G', 900000, '20-22', 8),
('crs8', 'خصوصی', 'مدرس H', 3000000, '10-12', 15),
('crs9', 'گروهی', 'مدرس I', 1100000, '15-17', 12),
('crs10', 'سریع', 'مدرس J', 1300000, '11-13', 9),
('crs11', 'کامل', 'مدرس K', 1800000, '14-16', 14),
('crs12', 'پایه', 'مدرس L', 700000, '8-10', 5),
('crs13', 'تئوری', 'مدرس M', 950000, '16-18', 7),
('crs14', 'عملی', 'مدرس N', 1400000, '17-19', 11),
('crs15', 'ترکیبی', 'مدرس O', 1600000, '13-15', 13),
('crs16', 'پروژه محور', 'مدرس P', 2200000, '15-17', 18),
('crs17', 'مقدماتی ۲', 'مدرس Q', 1050000, '10-12', 8),
('crs18', 'پیشرفته ۲', 'مدرس R', 1550000, '14-16', 12),
('crs19', 'حرفه‌ای ۲', 'مدرس S', 2100000, '16-18', 16),
('crs20', 'مقدماتی ۳', 'مدرس T', 850000, '9-11', 6),
('crs21', 'پیشرفته ۳', 'مدرس U', 1350000, '13-15', 10),
('crs22', 'حرفه‌ای ۳', 'مدرس V', 1900000, '15-17', 14),
('crs23', 'مبتدی ۲', 'مدرس W', 750000, '8-10', 5),
('crs24', 'تخصصی ۲', 'مدرس X', 2600000, '18-20', 20),
('crs25', 'فشرده ۲', 'مدرس Y', 1250000, '12-14', 10),
('crs26', 'آنلاین ۲', 'مدرس Z', 920000, '19-21', 8),
('crs27', 'خصوصی ۲', 'مدرس AA', 3100000, '10-12', 15),
('crs28', 'گروهی ۲', 'مدرس BB', 1150000, '14-16', 12),
('crs29', 'سریع ۲', 'مدرس CC', 1350000, '11-13', 9),
('crs30', 'کامل ۲', 'مدرس DD', 1850000, '13-15', 14),
('crs31', 'پایه ۲', 'مدرس EE', 720000, '7-9', 5),
('crs32', 'تئوری ۲', 'مدرس FF', 980000, '15-17', 7),
('crs33', 'عملی ۲', 'مدرس GG', 1450000, '16-18', 11),
('crs34', 'ترکیبی ۲', 'مدرس HH', 1650000, '12-14', 13),
('crs35', 'پروژه محور ۲', 'مدرس II', 2300000, '14-16', 18),
('crs36', 'مقدماتی ۴', 'مدرس JJ', 1100000, '9-11', 8),
('crs37', 'پیشرفته ۴', 'مدرس KK', 1600000, '13-15', 12),
('crs38', 'حرفه‌ای ۴', 'مدرس LL', 2150000, '15-17', 16),
('crs39', 'مبتدی ۳', 'مدرس MM', 780000, '8-10', 6),
('crs40', 'تخصصی ۳', 'مدرس NN', 2700000, '17-19', 20),
('crs41', 'فشرده ۳', 'مدرس OO', 1300000, '11-13', 10),
('crs42', 'آنلاین ۳', 'مدرس PP', 940000, '18-20', 8),
('crs43', 'خصوصی ۳', 'مدرس QQ', 3200000, '9-11', 15),
('crs44', 'گروهی ۳', 'مدرس RR', 1200000, '13-15', 12),
('crs45', 'سریع ۳', 'مدرس SS', 1400000, '10-12', 9),
('crs46', 'کامل ۳', 'مدرس TT', '1900000', '12-14', 14),
('crs47', 'پایه ۳', 'مدرس UU', 740000, '6-8', 5),
('crs48', 'تئوری ۳', 'مدرس VV', 1000000, '14-16', 7),
('crs49', 'عملی ۳', 'مدرس WW', 1500000, '15-17', 11),
('crs50', 'ترکیبی ۳', 'مدرس XX', 1700000, '11-13', 13),
('crs51', 'پروژه محور ۳', 'مدرس YY', 2400000, '13-15', 18),
('crs52', 'مقدماتی ۵', 'مدرس ZZ', 1150000, '8-10', 8),
('crs53', 'پیشرفته ۵', 'مدرس AAA', '1650000', '12-14', 12),
('crs54', 'حرفه‌ای ۵', 'مدرس BBB', 2200000, '14-16', 16),
('crs55', 'مبتدی ۴', 'مدرس CCC', 800000, '7-9', 6),
('crs56', 'تخصصی ۴', 'مدرس DDD', 2800000, '16-18', 20),
('crs57', 'فشرده ۴', 'مدرس EEE', 1350000, '10-12', 10),
('crs58', 'آنلاین ۴', 'مدرس FFF', 960000, '17-19', 8),
('crs59', 'خصوصی ۴', 'مدرس GGG', 3300000, '8-10', 15),
('crs60', 'گروهی ۴', 'مدرس HHH', 1250000, '12-14', 12),
('crs61', 'سریع ۴', 'مدرس III', 1450000, '9-11', 9),
('crs62', 'کامل ۴', 'مدرس JJJ', 1950000, '11-13', 14),
('crs63', 'پایه ۴', 'مدرس KKK', 760000, '5-7', 5),
('crs64', 'تئوری ۴', 'مدرس LLL', 1020000, '13-15', 7),
('crs65', 'عملی ۴', 'مدرس MMM', 1550000, '14-16', 11),
('crs66', 'ترکیبی ۴', 'مدرس NNN', 1750000, '10-12', 13),
('crs67', 'پروژه محور ۴', 'مدرس OOO', 2500000, '12-14', 18),
('crs68', 'مقدماتی ۶', 'مدرس PPP', 1200000, '7-9', 8),
('crs69', 'پیشرفته ۶', 'مدرس QQQ', 1700000, '11-13', 12),
('crs70', 'حرفه‌ای ۶', 'مدرس RRR', 2250000, '13-15', 16),
('crs71', 'مبتدی ۵', 'مدرس SSS', 820000, '6-8', 6),
('crs72', 'تخصصی ۵', 'مدرس TTT', 2900000, '15-17', 20),
('crs73', 'فشرده ۵', 'مدرس UUU', 1400000, '9-11', 10),
('crs74', 'آنلاین ۵', 'مدرس VVV', 980000, '16-18', 8);

-- ===================================
-- 03_seed_tech_courses.sql - دوره ICDL
-- ===================================
insert into tech_courses (id, name_fa, name_en, tuition, code, hours)
values
('10023698720','کاربر icdl','Programming With ICDL',0,'10023698720',120)
on conflict (code) do update set
  name_fa = excluded.name_fa,
  name_en = excluded.name_en,
  tuition = excluded.tuition,
  hours = excluded.hours;

-- 🎉 تمام! حالا می‌تونید به Vercel برید و دوره‌ها رو ببینید