-- === enums ===
CREATE TYPE public.race_review_status AS ENUM ('draft','pending_verification','needs_changes','approved','published','postponed','cancelled','archived');
CREATE TYPE public.organizer_status AS ENUM ('pending','verified','rejected');
CREATE TYPE public.suggestion_status AS ENUM ('pending','approved','rejected');

-- === races: new columns ===
ALTER TABLE public.races
  ADD COLUMN owner_id uuid,
  ADD COLUMN review_status public.race_review_status NOT NULL DEFAULT 'draft',
  ADD COLUMN admin_notes text NOT NULL DEFAULT '',
  ADD COLUMN schedule_info text NOT NULL DEFAULT '',
  ADD COLUMN course_info text NOT NULL DEFAULT '',
  ADD COLUMN results_info text NOT NULL DEFAULT '',
  ADD COLUMN published_at timestamptz,
  ADD COLUMN published_by uuid,
  ADD COLUMN view_count integer NOT NULL DEFAULT 0;

UPDATE public.races SET review_status = 'published', published_at = now();

CREATE INDEX idx_races_owner ON public.races(owner_id);
CREATE INDEX idx_races_review_status ON public.races(review_status);

DROP POLICY IF EXISTS "Races are publicly readable" ON public.races;
DROP POLICY IF EXISTS "Admins can insert races" ON public.races;
DROP POLICY IF EXISTS "Admins can update races" ON public.races;
DROP POLICY IF EXISTS "Admins can delete races" ON public.races;

CREATE POLICY "Published races are publicly readable" ON public.races
  FOR SELECT TO anon, authenticated
  USING (review_status IN ('published','postponed','cancelled'));

CREATE POLICY "Owners can read their own races" ON public.races
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Admins can read all races" ON public.races
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert races" ON public.races
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update races" ON public.races
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete races" ON public.races
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- === organizer profiles ===
CREATE TABLE public.organizer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  org_name text NOT NULL,
  contact_person text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  proof text NOT NULL DEFAULT '',
  previous_event_url text NOT NULL DEFAULT '',
  status public.organizer_status NOT NULL DEFAULT 'pending',
  admin_notes text NOT NULL DEFAULT '',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organizer_profiles TO authenticated;
GRANT SELECT ON public.organizer_profiles TO anon;
GRANT ALL ON public.organizer_profiles TO service_role;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified organizer profiles are public" ON public.organizer_profiles
  FOR SELECT TO anon, authenticated USING (status = 'verified');
CREATE POLICY "Users can read their own organizer profile" ON public.organizer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all organizer profiles" ON public.organizer_profiles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can apply as organizer" ON public.organizer_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins can update organizer profiles" ON public.organizer_profiles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER organizer_profiles_updated_at BEFORE UPDATE ON public.organizer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- verified-organizer helper
CREATE OR REPLACE FUNCTION private.is_verified_organizer(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organizer_profiles WHERE user_id = _user_id AND status = 'verified')
$$;

CREATE POLICY "Verified organizers can create races" ON public.races
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND private.is_verified_organizer(auth.uid())
    AND review_status IN ('draft','pending_verification')
  );

CREATE POLICY "Verified organizers can update their own races" ON public.races
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() AND private.is_verified_organizer(auth.uid()))
  WITH CHECK (owner_id = auth.uid() AND private.is_verified_organizer(auth.uid()));

-- === race suggestions ===
CREATE TABLE public.race_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_name text NOT NULL,
  race_date date,
  location text NOT NULL DEFAULT '',
  organizer_name text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  submitter_name text NOT NULL DEFAULT '',
  submitter_email text NOT NULL DEFAULT '',
  submitted_by uuid,
  status public.suggestion_status NOT NULL DEFAULT 'pending',
  admin_notes text NOT NULL DEFAULT '',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.race_suggestions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.race_suggestions TO authenticated;
GRANT ALL ON public.race_suggestions TO service_role;
ALTER TABLE public.race_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can suggest a race" ON public.race_suggestions
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Admins can read suggestions" ON public.race_suggestions
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update suggestions" ON public.race_suggestions
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER race_suggestions_updated_at BEFORE UPDATE ON public.race_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- === race reports ===
CREATE TABLE public.race_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES public.races(id) ON DELETE CASCADE,
  reason text NOT NULL,
  reporter_email text NOT NULL DEFAULT '',
  reported_by uuid,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.race_reports TO anon;
GRANT SELECT, INSERT, UPDATE ON public.race_reports TO authenticated;
GRANT ALL ON public.race_reports TO service_role;
ALTER TABLE public.race_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report a race" ON public.race_reports
  FOR INSERT TO anon, authenticated WITH CHECK (resolved = false);
CREATE POLICY "Admins can read reports" ON public.race_reports
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reports" ON public.race_reports
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- === audit log ===
CREATE TABLE public.race_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid REFERENCES public.races(id) ON DELETE SET NULL,
  action text NOT NULL,
  note text NOT NULL DEFAULT '',
  actor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.race_audit_log TO authenticated;
GRANT ALL ON public.race_audit_log TO service_role;
ALTER TABLE public.race_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actors can log their own actions" ON public.race_audit_log
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());
CREATE POLICY "Admins can read the audit log" ON public.race_audit_log
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owners can read their race audit log" ON public.race_audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.races r WHERE r.id = race_id AND r.owner_id = auth.uid()));