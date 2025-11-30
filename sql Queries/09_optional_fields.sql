update classes set code = coalesce(nullif(code, ''), id) where code is null or code = '';
alter table classes alter column code set not null;
alter table classes alter column title drop not null;
alter table courses alter column name set not null;
alter table students alter column name drop not null;
alter table applicants alter column name drop not null;
alter table tech_courses alter column name_fa drop not null;
