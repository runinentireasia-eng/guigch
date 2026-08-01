CREATE OR REPLACE FUNCTION public.get_verified_organizer_names()
RETURNS TABLE (org_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_name FROM public.organizer_profiles WHERE status = 'verified'
$$;

REVOKE ALL ON FUNCTION public.get_verified_organizer_names() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_verified_organizer_names() TO anon, authenticated;