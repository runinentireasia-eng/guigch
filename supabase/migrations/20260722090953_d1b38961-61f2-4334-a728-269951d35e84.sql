
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Auto-grant admin role to the very first signed-up user, and 'user' role to others
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Races
CREATE TABLE public.races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  race_date DATE NOT NULL,
  location_mn TEXT NOT NULL DEFAULT '',
  location_en TEXT NOT NULL DEFAULT '',
  organizer_mn TEXT NOT NULL DEFAULT '',
  organizer_en TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('road','trail','ultra','fun')),
  distances TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closing_soon','waitlist')),
  register_url TEXT NOT NULL DEFAULT '',
  description_mn TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.races TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.races TO authenticated;
GRANT ALL ON public.races TO service_role;

ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Races are publicly readable"
  ON public.races FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert races"
  ON public.races FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update races"
  ON public.races FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete races"
  ON public.races FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER races_set_updated_at
  BEFORE UPDATE ON public.races
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the 8 existing races
INSERT INTO public.races (name_mn,name_en,race_date,location_mn,location_en,organizer_mn,organizer_en,category,distances,status,register_url,description_mn,description_en) VALUES
('Улаанбаатар Олон Улсын Марафон','Ulaanbaatar International Marathon','2026-05-30','Сүхбаатарын талбай, Улаанбаатар','Sühbaatar Square, Ulaanbaatar','УБ Хотын Захиргаа','UB City Council','road',ARRAY['5K','10K','21K','42K'],'open','https://ubmarathon.mn','Монголын хамгийн том хотын марафон. Дэлхийн Атлетикийн зэрэглэлтэй.','Mongolia''s largest urban marathon. World Athletics certified.'),
('Нар мандахаас жаргах хүртэлх','Mongolia Sunrise to Sunset','2026-08-01','Хатгал, Хөвсгөл нуур','Hatgal, Lake Khövsgöl','Ecoleap Mongolia','Ecoleap Mongolia','ultra',ARRAY['42K','100K'],'open','https://ms2s.org','Хөвсгөл нуурын эрэг дагуух хэт холын гүйлт. 20 жилийн уламжлалтай.','Ultra-distance run along the shores of Lake Khövsgöl. Running for 20+ years.'),
('Хөвсгөл Мөсөн Марафон','Khövsgöl Ice Marathon','2026-03-03','Хөвсгөл нуурын мөс','Frozen Lake Khövsgöl','Ice Marathon MGL','Ice Marathon MGL','road',ARRAY['21K','42K'],'closing_soon','https://icemarathon.mn','-30°C-т мөсөн дээгүүр гүйдэг цорын ганц марафон. Хязгаарлагдмал суудал.','The only marathon run across a frozen lake at -30°C. Limited entries.'),
('Говийн Марш','The Gobi March','2026-07-19','Орхон хөндий, Хархорин','Orkhon Valley, Karakorum','RacingThePlanet','RacingThePlanet','ultra',ARRAY['250K / 7 өдөр'],'waitlist','https://racingtheplanet.com/gobi','7 хоногийн өөрийгөө тэжээх олон үе шаттай хэт марафон.','Seven-day self-supported multi-stage ultra across the Gobi.'),
('Наадмын Гүйлт','Naadam Festival Run','2026-07-11','Үндэсний Их Наадмын цогцолбор','National Sports Stadium','Монголын Атлетикийн Холбоо','Mongolian Athletic Federation','fun',ARRAY['3K','5K'],'open','https://maf.mn/naadam-run','Үндэсний баярын өдрийн олон нийтийн гүйлт. Гэр бүлээрээ.','Family-friendly community run on the national holiday.'),
('Тэрэлж Уулын Гүйлт','Terelj Skyline Trail','2026-06-14','Горхи-Тэрэлж Байгалийн Цогцолбор','Gorkhi-Terelj National Park','Mongolia Trail Runners','Mongolia Trail Runners','trail',ARRAY['12K','25K','50K'],'open','https://trailrun.mn/terelj','Гурван зайтай уулын зам. 2,000м хүртэлх өндөрлөг.','Three-distance mountain trail. Elevation up to 2,000m.'),
('Чингис Хааны Хагас Марафон','Genghis Khan Half Marathon','2026-09-12','Цонжин Болдог хөшөө','Tsonjin Boldog Monument','Monnis Sports Club','Monnis Sports Club','road',ARRAY['10K','21K'],'open','https://ghmarathon.mn','Аварга том мориттой хөшөөнөөс эхлэх хагас марафон.','Half marathon starting from the giant equestrian statue.'),
('Алтайн Хэт Марафон','Altai Ultra','2026-08-22','Өлгий, Баян-Өлгий','Ölgii, Bayan-Ölgii','Altai Adventures','Altai Adventures','trail',ARRAY['30K','60K'],'open','https://altaiultra.mn','Казах бүргэдчидийн нутагт өндөр уулын гүйлт.','High-altitude trail run in the land of the Kazakh eagle hunters.');
