alter table public.student_finance_profiles
  alter column created_at set default now();
alter table public.student_finance_profiles add column if not exists class_code text;
alter table public.student_finance_profiles add column if not exists upfront_amount numeric(12,0) default 0 not null;
alter table public.student_finance_profiles add column if not exists upfront_date date;
alter table public.student_finance_profiles add column if not exists installments jsonb default '[]'::jsonb not null;
alter table public.student_finance_profiles add column if not exists status text default 'در انتظار تسویه';
alter table public.student_finance_profiles add column if not exists discount numeric(12,0) default 0 not null;
alter table public.student_finance_profiles add column if not exists course_tuition numeric(12,0) default 0 not null;

alter table public.student_finance_profiles
  alter column upfront_amount type numeric(12,0);
alter table public.student_finance_profiles
  alter column upfront_amount set default 0;
update public.student_finance_profiles set upfront_amount = 0 where upfront_amount is null;
alter table public.student_finance_profiles
  alter column upfront_amount set not null;

alter table public.student_finance_profiles
  alter column installments type jsonb using
    case
      when installments is null then '[]'::jsonb
      when pg_typeof(installments)::text = 'jsonb' then installments
      when pg_typeof(installments)::text = 'json' then installments::jsonb
      else '[]'::jsonb
    end;
alter table public.student_finance_profiles
  alter column installments set default '[]'::jsonb;
update public.student_finance_profiles set installments = '[]'::jsonb where installments is null;
alter table public.student_finance_profiles
  alter column installments set not null;

alter table public.student_finance_profiles
  alter column upfront_date type date using upfront_date::date;

alter table public.student_finance_profiles
  alter column status set default 'در انتظار تسویه';
update public.student_finance_profiles set status = 'در انتظار تسویه' where status is null or btrim(status) = '';


create index if not exists idx_sfp_student on public.student_finance_profiles (student_id);
create index if not exists idx_sfp_class on public.student_finance_profiles (class_code);
create index if not exists idx_sfp_status on public.student_finance_profiles (status);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'chk_sfp_status_values'
      and conrelid = 'public.student_finance_profiles'::regclass
  ) then
    alter table public.student_finance_profiles
      add constraint chk_sfp_status_values
        check (status in ('تسویه شده','کنسل شده','در انتظار تسویه'));
  end if;
end$$;
