DROP FUNCTION IF EXISTS public.get_verified_organizer_names();

CREATE TABLE public.organizer_directory (
  organizer_id uuid PRIMARY KEY,
  org_name text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.organizer_directory TO anon, authenticated;
GRANT ALL ON public.organizer_directory TO service_role;

ALTER TABLE public.organizer_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizer directory is public"
ON public.organizer_directory
FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.sync_organizer_directory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.organizer_directory WHERE organizer_id = OLD.id;
    RETURN OLD;
  END IF;

  IF NEW.status = 'verified' THEN
    INSERT INTO public.organizer_directory (organizer_id, org_name, verified, updated_at)
    VALUES (NEW.id, NEW.org_name, true, now())
    ON CONFLICT (organizer_id) DO UPDATE
      SET org_name = EXCLUDED.org_name, verified = true, updated_at = now();
  ELSE
    DELETE FROM public.organizer_directory WHERE organizer_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_organizer_directory() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_organizer_directory_trg ON public.organizer_profiles;
CREATE TRIGGER sync_organizer_directory_trg
AFTER INSERT OR UPDATE OR DELETE ON public.organizer_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_organizer_directory();

INSERT INTO public.organizer_directory (organizer_id, org_name, verified)
SELECT id, org_name, true FROM public.organizer_profiles WHERE status = 'verified'
ON CONFLICT (organizer_id) DO NOTHING;