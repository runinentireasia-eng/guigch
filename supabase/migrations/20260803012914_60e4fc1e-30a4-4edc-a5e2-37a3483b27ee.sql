create or replace function public.bind_suggestion_owner()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null then new.submitted_by := null; else new.submitted_by := auth.uid(); end if;
  return new;
end;
$$;

create or replace function public.bind_report_owner()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null then new.reported_by := null; else new.reported_by := auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists bind_suggestion_owner_trg on public.race_suggestions;
create trigger bind_suggestion_owner_trg before insert on public.race_suggestions
  for each row execute function public.bind_suggestion_owner();

drop trigger if exists bind_report_owner_trg on public.race_reports;
create trigger bind_report_owner_trg before insert on public.race_reports
  for each row execute function public.bind_report_owner();

revoke execute on function public.bind_suggestion_owner() from anon, authenticated;
revoke execute on function public.bind_report_owner() from anon, authenticated;

drop policy if exists "Anyone can suggest a race" on public.race_suggestions;
create policy "Guests can suggest a race" on public.race_suggestions for insert to anon
  with check (status = 'pending'::suggestion_status and submitted_by is null);
create policy "Users can suggest a race as themselves" on public.race_suggestions for insert to authenticated
  with check (status = 'pending'::suggestion_status and submitted_by = auth.uid());

drop policy if exists "Anyone can report a race" on public.race_reports;
create policy "Guests can report a race" on public.race_reports for insert to anon
  with check (resolved = false and reported_by is null);
create policy "Users can report a race as themselves" on public.race_reports for insert to authenticated
  with check (resolved = false and reported_by = auth.uid());

drop policy if exists "Users can read own suggestions" on public.race_suggestions;
create policy "Users can read own suggestions" on public.race_suggestions for select to authenticated
  using (submitted_by = auth.uid());
drop policy if exists "Users can read own reports" on public.race_reports;
create policy "Users can read own reports" on public.race_reports for select to authenticated
  using (reported_by = auth.uid());