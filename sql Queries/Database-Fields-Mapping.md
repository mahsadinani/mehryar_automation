# راهنمای فیلدهای دیتابیس و اتصال آن‌ها

این سند توضیح می‌دهد هر فیلد در جداول Supabase به کدام بخش از UI، فرآیند یا وب‌هوک متصل است.

## 1) دوره‌های آموزشگاهی (courses)
- `id` شناسه دوره؛ استفاده در کلاس‌ها به‌عنوان `course_id`
- `created_at` زمان ایجاد
- `banner` بنر دوره
- `name` نام دوره؛ استفاده در UI «دوره‌ها» و «فرم ورودی»
- `teacher` مدرس دوره
- `tuition` شهریه؛ نمایش فارسی در UI
- `hour` ساعات دوره
- `sessions_count` تعداد جلسات؛ پیش‌فرض در «افزودن کلاس»
- اتصال‌ها: UI «دوره‌ها»، «فرم ورودی»، API `/api/courses`

## 2) دوره‌های فنی (tech_courses)
- `id` شناسه داخلی
- `created_at` زمان ایجاد
- `name_fa` نام فارسی دوره فنی
- `name_en` نام انگلیسی دوره (برای صدور گواهی)
- `tuition` شهریه
- `code` کد دوره فنی (ارتباط با کلاس‌ها و صدور گواهی)
- `hours` ساعات دوره (برای صدور گواهی)
- اتصال‌ها: UI «دوره‌ها»، کلاس‌ها (`tech_course_code`)، API `/api/tech-courses`

## 3) شاگردان (students)
- `id` شناسه شاگرد؛ اتصال به حضور و مالی
- `created_at` زمان ایجاد
- `name` نام؛ نمایش در لیست و انتخاب‌ها
- `last_name` نام خانوادگی
- `english_name` نام لاتین (صدور گواهی)
- `phone` شماره تماس
- `email` ایمیل
- `course_id` ارتباط با دوره آموزشگاهی
- `status` وضعیت شاگرد
- `father_name` نام پدر
- `national_id` کد ملی (منبع تولید `student_id`)
- `address` نشانی
- `emergency_phone` شماره اضطراری
- `student_id` شناسه دانشجویی (منبع: کد ملی بدون صفرهای ابتدایی)
- `issuer` صادره از (نمایش و صدور گواهی)
- اتصال‌ها: UI «لیست شاگردان»، مالی شاگردان، کلاس‌ها، صدور گواهی؛ API `/api/students`

## 4) متقاضیان (applicants)
- `id` شناسه متقاضی
- `created_at` زمان ایجاد
- `name` نام متقاضی
- `phone` شماره تماس
- `email` ایمیل
- `course` نام دوره انتخاب‌شده در فرم ورودی
- `familiarity` نحوه آشنایی
- `note` توضیحات
- `status` وضعیت کلی (بر اساس دکمه‌های وضعیت)
- `complete` تکمیل ثبت نام
- `pre_register` ارسال فرم پیش‌ثبت‌نام
- `waiting_applicant` منتظر خبر
- `next_courses_info` اطلاع از دوره‌های بعدی
- `cancelled` انصراف از ثبت نام
- `send_course_info` ارسال اطلاعات دوره
- اتصال‌ها: UI «فرم ورودی»، وب‌هوک n8n، API `/api/applicants`

## 5) کلاس‌ها (classes)
- `id` شناسه کلاس
- `created_at` زمان ایجاد
- `course_id` اتصال به دوره آموزشگاهی
- `title` عنوان کلاس (از نام دوره)
- `teacher` مدرس کلاس
- `start` تاریخ شروع کلاس
- `end` پایان جلسه/محدوده
- `room` مکان کلاس
- `code` کد کلاس (در مالی و صدور گواهی)
- `time` ساعت کلاس
- `days` روزهای برگزاری (CSV)
- `sessions_count` تعداد جلسات
- `sessions` آرایه جلسات `{date,cancelled,held}`
- `end_date` تاریخ پایان دوره
- `certificate_issue_date` تاریخ صدور مدرک
- `tech_course_code` کد دوره فنی مرتبط (تامین نام لاتین و ساعات)
- اتصال‌ها: UI «کلاس‌ها»، حضور، مالی، صدور گواهی؛ API `/api/classes`

## 6) حضور (attendance)
- `class_id` اتصال کلاس
- `student_id` اتصال شاگرد
- `present` حضور/غیاب
- `updated_at` زمان ثبت
- اتصال‌ها: UI «ثبت حضور»، API `/api/classes/attendance`

## 7) تراکنش‌ها (transactions)
- `id` شناسه تراکنش
- `created_at` زمان ایجاد
- `student_id` اتصال شاگرد
- `amount` مبلغ
- `note` توضیح
- اتصال‌ها: UI «مالی»، API `/api/finance/transactions`

## 8) پروفایل مالی شاگردان (student_finance_profiles)
- `id` شناسه پروفایل
- `created_at` زمان ایجاد
- `student_id` شاگرد
- `class_code` کد کلاس
- `upfront_amount` مبلغ پیش‌پرداخت
- `upfront_date` تاریخ پیش‌پرداخت
- `installments` اقساط `{amount,date}`
- `status` وضعیت تسویه
- اتصال‌ها: UI «مالی شاگردان»، API `/api/finance/student-profiles`

## 9) لینک‌ها (data_links)
- `key` کلید فرم/منبع
- `url` لینک Google Sheet مرتبط (List Box)
- اتصال‌ها: UI «لینک‌های Sheets»، API `/api/data-links`

## روابط کلیدی
- `classes.course_id → courses.id`
- `classes.tech_course_code → tech_courses.code`
- `attendance.class_id → classes.id`, `attendance.student_id → students.id`
- `transactions.student_id → students.id`
- `student_finance_profiles.student_id → students.id`, `student_finance_profiles.class_code → classes.code`

## ارتباط با UI و وب‌هوک‌ها
- فرم ورودی: ارسال به وب‌هوک n8n و ذخیره در `applicants`
- دوره‌ها: مدیریت آموزشگاهی/فنی و ایمپورت
- لیست شاگردان: افزودن/ویرایش و «صادره از»
- کلاس‌ها: افزودن کلاس، روزها، جلسات
- مالی: پروفایل مالی شاگردان
- لینک‌های Sheets: مدیریت نسخه‌های Google Sheets