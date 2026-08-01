DROP POLICY IF EXISTS "Anon can see verified organizer names" ON public.organizer_profiles;
REVOKE ALL ON public.organizer_profiles FROM anon;