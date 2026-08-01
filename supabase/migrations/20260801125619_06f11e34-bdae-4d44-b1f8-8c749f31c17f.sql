DROP VIEW IF EXISTS public.verified_organizers;

REVOKE SELECT ON public.organizer_profiles FROM anon;
GRANT SELECT (id, org_name, status) ON public.organizer_profiles TO anon;

CREATE POLICY "Anon can see verified organizer names"
ON public.organizer_profiles
FOR SELECT
TO anon
USING (status = 'verified');