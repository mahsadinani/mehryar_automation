# 📋 راهنمای اجرای دستی اسکریپت‌های SQL

## 🔧 روش پیشنهادی: اجرای مستقیم در Supabase

### مرحله 1: ساخت ترکیبی از تمام اسکریپت‌ها

برای راحتی، تمام اسکریپت‌ها رو ترکیب کردم تا یهجا اجرا بشن:

```sql
-- 00_reset.sql - پاک کردن تمام جدول‌ها
drop table if exists attendance cascade;
drop table if exists transactions cascade;
drop table if exists student_finance_profiles cascade;
drop table if exists students cascade;
drop table if exists classes cascade;
drop table if exists tech_courses cascade;
drop table if exists courses cascade;

-- 01_schema.sql - ساخت جدول‌ها
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
```

### مرحله 2: اجرا در Supabase

1. به [supabase.com](https://supabase.com) برید و لاگین کنید
2. پروژه‌تون رو انتخاب کنید
3. از منوی سمت چپ برید به **SQL Editor**
4. کد بالا رو کپی کنید و بزنید **Run**

### مرحله 3: اضافه کردن داده‌ها

حالا این دوتا رو جداگانه اجرا کنید:

**دوره‌های مدرسه (74 تا):**
```sql
-- محتوای فایل 02_seed_school_courses.sql رو اینجا کپی کنید
```

**دوره فنی ICDL:**
```sql
-- محتوای فایل 03_seed_tech_courses.sql رو اینجا کپی کنید
insert into tech_courses (id, name_fa, name_en, tuition, code, hours)
values
('10023698720','کاربر icdl','Programming With ICDL',0,'10023698720',120)
on conflict (code) do update set
  name_fa = excluded.name_fa,
  name_en = excluded.name_en,
  tuition = excluded.tuition,
  hours = excluded.hours;
```

## ✅ بعد از اجرا

1. به آدرس Vercel برید
2. برید به صفحه اصلی
3. باید دوره‌ها رو ببینید!

## 🔍 تست کردن

برای تست کردن:
```
https://your-app.vercel.app/api/courses
https://your-app.vercel.app/api/tech-courses
```

اگر مشکلی داشتید، لاگ‌های Vercel رو چک کنید!