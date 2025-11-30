alter table if exists applicants add column if not exists email text;
alter table if exists applicants add column if not exists familiarity text;
alter table if exists applicants add column if not exists complete boolean default false;
alter table if exists applicants add column if not exists pre_register boolean default false;
alter table if exists applicants add column if not exists waiting_applicant boolean default false;
alter table if exists applicants add column if not exists next_courses_info boolean default false;
alter table if exists applicants add column if not exists cancelled boolean default false;
alter table if exists applicants add column if not exists send_course_info boolean default false;

alter table if exists students add column if not exists english_name text;
alter table if exists students add column if not exists national_id text;
alter table if exists students add column if not exists student_id text;
alter table if exists students add column if not exists issuer text;
alter table if exists students add column if not exists father_name text;
alter table if exists students add column if not exists address text;
alter table if exists students add column if not exists phone text;
alter table if exists students add column if not exists emergency_phone text;
alter table if exists students add column if not exists gender text;
alter table if exists students add column if not exists email text;
alter table if exists students add column if not exists status text default 'active';

insert into applicants (id, name, phone, email, course, note, status, familiarity, complete, pre_register, waiting_applicant, next_courses_info, cancelled, send_course_info) values
('app-001','علی رضایی','09121234567','ali.rezaei@example.com','ICDL, فتوشاپ مقدماتی','تماس تلفنی اولیه انجام شد','registration_complete','اینستاگرام',true,true,false,false,false,true),
('app-002','نگار محمدی','09901234567','negar.mohammadi@example.com','حسابداری مقدماتی','نیاز به اطلاعات بیشتر شهریه','to_pre_registration','معرفی دوستان',false,true,false,false,false,true),
('app-003','پارسا کرمی','09133445566','parsa.karami@example.com','برنامه‌نویسی پایتون','علاقه‌مند به کلاس عصرها','waiting_applicant','جستجوی گوگل',false,false,true,false,false,false),
('app-004','ساناز موسوی','09351234567','sanaz.mousavi@example.com','طراحی گرافیک, موشن گرافیک','مصاحبه اولیه انجام شد','send_course_info','تابلو آموزشگاه',false,false,false,false,false,true),
('app-005','مهسا احمدی','09124567890','mahsa.ahmadi@example.com','ICDL پیشرفته','درخواست زمان‌بندی فشرده','registration_complete','تبلیغات محیطی',true,true,false,false,false,true),
('app-006','سینا قاسمی','09381231231','sina.ghasemi@example.com','زبان انگلیسی عمومی','سطح‌بندی انجام شد','to_pre_registration','وب‌سایت',false,true,false,false,false,true),
('app-007','آرین نصیری','09120001122','arian.nasiri@example.com','اکسل کاربردی','در انتظار تایید کارفرما','waiting_applicant','آگهی دیوار',false,false,true,false,false,false),
('app-008','نرگس سادات','09921231231','narges.sadat@example.com','وردپرس, سئو مقدماتی','نیاز به مشاوره زمان کلاس','send_course_info','یوتیوب',false,false,false,true,false,true),
('app-009','پویا رحیمی','09129876543','pouya.rahimi@example.com','جاوا اسکریپت','پیگیری ایمیلی انجام شد','registration_complete','معرفی شرکت',true,true,false,false,false,true),
('app-010','مریم رستمی','09350002233','maryam.rostami@example.com','حسابداری صنعتی','درخواست تقسیط شهریه','to_pre_registration','بروشور',false,true,false,true,false,true)
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  course = excluded.course,
  note = excluded.note,
  status = excluded.status,
  familiarity = excluded.familiarity,
  complete = excluded.complete,
  pre_register = excluded.pre_register,
  waiting_applicant = excluded.waiting_applicant,
  next_courses_info = excluded.next_courses_info,
  cancelled = excluded.cancelled,
  send_course_info = excluded.send_course_info;

insert into students (id, name, english_name, national_id, student_id, issuer, father_name, address, phone, emergency_phone, gender, email, status) values
('stu-001','علی رضایی','Ali Rezaei','0012345678','12345678','تهران','حسین','تهران، خیابان آزادی، پلاک 12','09121234567','02144223344','male','ali.rezaei@example.com','active'),
('stu-002','نگار محمدی','Negar Mohammadi','0045678912','45678912','کرج','اکبر','کرج، گوهردشت، خیابان پنجم','09351234567','02632567890','female','negar.mohammadi@example.com','active'),
('stu-003','پارسا کرمی','Parsa Karami','0087654321','87654321','اصفهان','مجید','اصفهان، خیابان چهارباغ بالا، پلاک 25','09133445566','03132221100','male','parsa.karami@example.com','active'),
('stu-004','ساناز موسوی','Sanaz Mousavi','0001234567','1234567','شیراز','نادر','شیراز، خیابان عفیف‌آباد، کوچه 3','09381231231','07132334455','female','sanaz.mousavi@example.com','active'),
('stu-005','مهسا احمدی','Mahsa Ahmadi','0098765432','98765432','تبریز','رضا','تبریز، ولیعصر، خیابان 20','09124567890','04133332211','female','mahsa.ahmadi@example.com','active'),
('stu-006','سینا قاسمی','Sina Ghasemi','0011122233','11122233','قم','حمید','قم، صفائیه، خیابان نشاط','09120001122','02537123456','male','sina.ghasemi@example.com','active'),
('stu-007','آرین نصیری','Arian Nasiri','0077001122','77001122','مشهد','حسن','مشهد، احمدآباد، کوچه لاله','09921231231','05138887766','male','arian.nasiri@example.com','active'),
('stu-008','نرگس سادات','Narges Sadat','0022334455','22334455','رشت','جواد','رشت، بیستون، خیابان 8','09129876543','01333221100','female','narges.sadat@example.com','active'),
('stu-009','پویا رحیمی','Pouya Rahimi','0055443322','55443322','یزد','کاظم','یزد، صفائیه، کوچه 10','09350002233','03537221144','male','pouya.rahimi@example.com','active'),
('stu-010','مریم رستمی','Maryam Rostami','0033001122','33001122','اهواز','غلامرضا','اهواز، نادری، خیابان 12','09137778899','06132224455','female','maryam.rostami@example.com','active')
on conflict (id) do update set
  name = excluded.name,
  english_name = excluded.english_name,
  national_id = excluded.national_id,
  student_id = excluded.student_id,
  issuer = excluded.issuer,
  father_name = excluded.father_name,
  address = excluded.address,
  phone = excluded.phone,
  emergency_phone = excluded.emergency_phone,
  gender = excluded.gender,
  email = excluded.email,
  status = excluded.status;
