-- Normalize installments array: ensure numeric amounts >= 0 and ISO dates
update public.student_finance_profiles sfp
set installments = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'amount', greatest(0, coalesce(nullif(regexp_replace(it->>'amount','[^0-9.-]','','g'), '')::numeric, 0)),
        'date', case
          when (it->>'date') ~ '^\d{4}-\d{2}-\d{2}$' then it->>'date'
          when (it->>'date') ~ '^\d{4}/\d{2}/\d{2}$' then replace(it->>'date','/','-')
          else null
        end
      )
    )
    from jsonb_array_elements(
      case 
        when pg_typeof(sfp.installments)::text = 'jsonb' then sfp.installments
        when pg_typeof(sfp.installments)::text = 'json' then sfp.installments::jsonb
        else '[]'::jsonb
      end
    ) it
  ),
  '[]'::jsonb
);

-- Clamp negative monetary fields to zero
update public.student_finance_profiles set upfront_amount = greatest(0, upfront_amount);
update public.student_finance_profiles set discount = greatest(0, discount);
update public.student_finance_profiles set course_tuition = greatest(0, course_tuition);

-- Optional: ensure status has valid values
update public.student_finance_profiles
set status = case
  when status in ('تسویه شده','کنسل شده','در انتظار تسویه') then status
  when status ~* 'cancel|کنسل|لغو' then 'کنسل شده'
  when status ~* 'settled|paid|تسویه\s*شده' then 'تسویه شده'
  else 'در انتظار تسویه'
end;
