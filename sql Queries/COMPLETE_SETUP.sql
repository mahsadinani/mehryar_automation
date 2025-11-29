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
  sessions_count integer default 0,
  banner text
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

alter table if exists students add column if not exists gender text;
alter table if exists applicants add column if not exists gender text;

insert into courses (id, name, teacher, tuition, hour, sessions_count)
values
('EDU-1','کاربر ICDL','آقایان حیاتی و رئیسه، خانم مرادی',7740000,'36',12),
('EDU-2','ویژه بازار کار (Word-Excel-PowerPoint)','آقای حیاتی',9500000,'24',8),
('EDU-3','طراحی کتاب با هوش مصنوعی','آقای حیاتی',6500000,'6',3),
('EDU-4','طراحی فاکتور و حسابداری در Excel','آقای حیاتی',7610000,'8',4),
('EDU-5','ورد و اکسل مبتدی (خصوصی)','آقای حیاتی، خانم مرادی',7000000,'8',4),
('EDU-6','ورد و اکسل پیشرفته (خصوصی)','آقای حیاتی',8200000,'8',4),
('EDU-7','فتوشاپ مقدماتی','آقای رئیسه',8720000,'20',7),
('EDU-8','فتوشاپ پیشرفته','آقای رئیسه',10500000,'20',7),
('EDU-9','ایلاستریتور مقدماتی','خانم ایمانی',8860000,'24',8),
('EDU-10','ایلاستریتور پیشرفته','خانم ایمانی',10000000,'24',8),
('EDU-11','کمپ جامع افترافکت','آقای مسلمی',18940000,'36',12),
('EDU-12','کمپ جامع کورل','آقای رستمی',9000000,'20',10),
('EDU-13','طراحی سایت فروشگاهی با وردپرس (قالب ساز)','آقای عبیری',13960000,'20',10),
('EDU-14','طراحی سایت فروشگاهی با برنامه نویسی','گروه مدرسین',18000000,'30',12),
('EDU-15','SEO مدیر','گروه مدرسین',27950000,'30',12),
('EDU-16','دوره جامع UI/UX','گروه مدرسین',35000000,'40',12),
('EDU-17','Network+','آقای عبیری',6250000,'12',6),
('EDU-18','ساخت VPN','آقای عبیری',6000000,'8',4),
('EDU-19','برنامه‌نویسی وب مقدماتی (HTML, CSS, PHP)','گروه مدرسین',23000000,'48',16),
('EDU-20','برنامه‌نویسی Java','گروه مدرسین',16700000,'30',15),
('EDU-21','برنامه نویسی Python مقدماتی','آقای کاظمی، خانم رضایی',10000000,'20',10),
('EDU-22','برنامه نویسی Python پیشرفته','آقای کاظمی، خانم رضایی',14000000,'24',12),
('EDU-23','برنامه نویسی ارشد پیشرفته و کدزنی','گروه مدرسین',36000000,'90',30),
('EDU-24','تایپ و تندزنی','خانم مرادی',3500000,'6',2),
('EDU-25','تکنسین سخت افزار کامپیوتر (اسمبل و ارتقاء سیستم)','گروه مدرسین',18500000,'24',8),
('EDU-26','تدوین فیلم و صدا با SSP','آقای مسلمی',22850000,'36',12),
('EDU-27','دوره جامع اتوکد (2 بعدی و 3 بعدی)','آقای حشمتی',13800000,'30',15),
('EDU-28','بوت کمپ Premiere','آقای مسلمی',7870000,'20',10),
('EDU-29','کمپ گرافیک رایانه INDESIGN','خانم ایمانی',7500000,'24',12),
('EDU-30','موشن گرافیک و طراح جلوه‌های ویژه با ایلاستریتور و افترافکت','آقای مسلمی',26870000,'36',12),
('EDU-31','فروش و بازاریابی','آقای واعظ نیا',18000000,'18',6),
('EDU-32','دوره جامع منابع انسانی','خانم نظری',20000000,'18',6),
('EDU-33','کارگاه کارآفرینی','آقای واعظ نیا',30000000,'16',4),
('EDU-34','دوره جامع خلاقیت','خانم آشوری',10000000,'12',4),
('EDU-35','دوره رباتیک مقدماتی ترمیک 5 (زیر 15 سال)','آقای کاظمی',15250000,'16',8),
('EDU-36','دوره رباتیک پیشرفته ترمیک 8 (زیر 15 سال)','آقای کاظمی',19150000,'20',10),
('EDU-37','داستان نویسی اسکرچ جونیور (10 تا 12 سال)','گروه مدرسین',6200000,'12',6),
('EDU-38','بازی سازی با اسکرچ (12 تا 15 سال)','گروه مدرسین',8450000,'16',8),
('EDU-39','دوره اصول فنون مذاکره (ویژه بازار کار)','خانم آشوری',5000000,'8',4),
('EDU-40','دوره‌های گرافیک دیزاین (آپدیت متخصصین)','آقای رستمی',20000000,'16',8),
('EDU-41','طراحی محصول و بسته بندی (تخصصی)','خانم ایمانی',25000000,'12',6),
('EDU-42','طراحی لوگو (تخصصی)','خانم ایمانی',20000000,'12',6),
('EDU-43','هوش تجاری با نرم افزار QlikView','آقای حیاتی',26000000,'20',10),
('EDU-44','ابزارهای هوش مصنوعی و پرامپت نویسی','خانم آشوری',5000000,'6',2),
('EDU-45','تولید محتوا با موبایل و هوش مصنوعی','آقای حیاتی',15000000,'16',8),
('EDU-46','نویسندگی خلاق و کپی رایتینگ','خانم صادقی',6000000,'6',6),
('EDU-47','نقاشی خلاقانه و پاسپارتو','خانم جلالی منش',7000000,'10',5),
('EDU-48','بوت کمپ اختراعات','خانم آشوری',18000000,'24',6),
('EDU-49','عکاسی با موبایل و طراحی آلبوم محصول با هوش مصنوعی','آقای حیاتی',10000000,'12',6),
('EDU-50','موشن پاور','آقای حیاتی',5000000,'6',3),
('EDU-51','داشبورد مدیریت حرفه‌ای Power BI','آقای حیاتی',11450000,'20',10),
('EDU-52','بازاریاب فروش','آقای واعظ نیا',25000000,'24',8),
('EDU-53','حسابداری حقوق و دستمزد','گروه مدرسین',6500000,'12',6),
('EDU-54','حسابداری عمومی مقدماتی','گروه مدرسین',9240000,'24',12),
('EDU-55','حسابداری عمومی پیشرفته (با سامانه مالیاتی)','گروه مدرسین',34000000,'30',15),
('EDU-56','لینوکس ترمیک (2 ترم)','گروه مدرسین',12000000,'24',12),
('EDU-57','برنامه‌نویسی با Matlab','گروه مدرسین',12380000,'16',8),
('EDU-58','کسب درآمد از یوتیوب','آقای حیاتی',10000000,'8',4),
('EDU-59','وبلاگ‌نویسی وب‌سایت','گروه مدرسین',5000000,'8',4),
('EDU-60','مدیر تبلیغات و بازاریابی (کمپین تبلیغاتی)','آقای نیکخو',18000000,'20',10),
('EDU-61','مدیریت برند','آقای مهدوی',20000000,'16',4),
('EDU-62','3D Max سه‌بعدی‌سازی','آقای حشمتی',10000000,'16',8),
('EDU-63','نرم‌افزار حسابداری سپیدار','آقای حیاتی',6640000,'12',6),
('EDU-64','خلاقیت در صنعت تبلیغات','آقای نیکخو',20000000,'20',10),
('EDU-65','Visio 2020','آقای حیاتی',6400000,'12',4),
('EDU-66','Word 2020','آقای حیاتی',6400000,'12',4),
('EDU-67','Excel 2020','آقای حیاتی',7650000,'12',4),
('EDU-68','PowerPoint 2020','آقای حیاتی',5000000,'12',4),
('EDU-69','Access 2020','آقای حیاتی',7800000,'8',4),
('EDU-70','Outlook 2020','آقای حیاتی',4200000,'6',2),
('EDU-71','ساخت ربات و چت‌بات با هوش مصنوعی','خانم آشوری',8000000,'8',4),
('EDU-72','تصویرسازی و ساخت ویدیو با هوش مصنوعی','خانم آشوری',10000000,'8',4),
('EDU-73','بوت‌کمپ متاورس','خانم آشوری',15000000,'12',4),
('EDU-74','الگوریتم‌نویسی با هوش مصنوعی','خانم آشوری',10000000,'12',6)
on conflict (id) do update set
  name = excluded.name,
  teacher = excluded.teacher,
  tuition = excluded.tuition,
  hour = excluded.hour,
  sessions_count = excluded.sessions_count;

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
