insert into tech_courses (id, name_fa, name_en, tuition, code, hours)
values
('10023698720','کاربر icdl','Programming With ICDL',0,'10023698720',120)
on conflict (code) do update set
  name_fa = excluded.name_fa,
  name_en = excluded.name_en,
  tuition = excluded.tuition,
  hours = excluded.hours;
