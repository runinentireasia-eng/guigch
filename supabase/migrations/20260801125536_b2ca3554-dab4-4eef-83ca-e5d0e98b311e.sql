DROP POLICY IF EXISTS "Verified organizer profiles are public" ON public.organizer_profiles;

CREATE OR REPLACE VIEW public.verified_organizers
WITH (security_invoker = off) AS
SELECT id, org_name, status
FROM public.organizer_profiles
WHERE status = 'verified';

GRANT SELECT ON public.verified_organizers TO anon, authenticated;