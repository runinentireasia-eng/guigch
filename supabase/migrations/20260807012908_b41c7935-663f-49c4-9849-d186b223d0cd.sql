ALTER TABLE public.races
  ADD COLUMN IF NOT EXISTS elevation_gain_m integer,
  ADD COLUMN IF NOT EXISTS price_info text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS reg_deadline date;