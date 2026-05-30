-- ============================================================
-- Referral & Promo Code System — run in Supabase SQL Editor
-- ============================================================

-- 1. Extend user_packages
ALTER TABLE public.user_packages
  ADD COLUMN IF NOT EXISTS is_shareable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_with_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. codes table
CREATE TABLE IF NOT EXISTS public.codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text        UNIQUE NOT NULL,
  type        text        NOT NULL CHECK (type IN ('referral', 'promo')),
  owner_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  discount_pct integer,
  max_uses    integer,
  uses_count  integer     NOT NULL DEFAULT 0,
  expires_at  timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- 3. referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id     uuid REFERENCES public.codes(id) NOT NULL,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_id uuid REFERENCES auth.users(id) NOT NULL,
  package_id  uuid REFERENCES public.user_packages(id) NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 4. RLS
ALTER TABLE public.codes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leer propio código o promos" ON public.codes;
CREATE POLICY "Leer propio código o promos" ON public.codes
  FOR SELECT USING (owner_id = auth.uid() OR type = 'promo');

DROP POLICY IF EXISTS "Leer mis referrals" ON public.referrals;
CREATE POLICY "Leer mis referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Allow users to see packages they are shared on
DROP POLICY IF EXISTS "Ver paquete compartido conmigo" ON public.user_packages;
CREATE POLICY "Ver paquete compartido conmigo" ON public.user_packages
  FOR SELECT USING (shared_with_id = auth.uid());

-- 5. Helper: generate unique referral code (PREFIX-XXXX)
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name   text;
  v_prefix text;
  v_code   text;
  attempts int := 0;
BEGIN
  SELECT COALESCE(raw_user_meta_data->>'full_name', '') INTO v_name
  FROM auth.users WHERE id = p_user_id;

  v_prefix := UPPER(LEFT(REGEXP_REPLACE(SPLIT_PART(v_name, ' ', 1), '[^A-Za-z]', '', 'g'), 4));
  IF LENGTH(v_prefix) < 2 THEN v_prefix := 'USR'; END IF;

  LOOP
    v_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.codes WHERE code = v_code);
    attempts := attempts + 1;
    IF attempts > 20 THEN RAISE EXCEPTION 'Could not generate unique referral code'; END IF;
  END LOOP;

  RETURN v_code;
END;
$$;

-- 6. Trigger: auto-create referral code on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.codes (code, type, owner_id)
  VALUES (public.generate_referral_code(NEW.id), 'referral', NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Backfill existing users who don't have a referral code yet
DO $$
DECLARE u RECORD;
BEGIN
  FOR u IN
    SELECT id FROM auth.users
    WHERE id NOT IN (
      SELECT owner_id FROM public.codes WHERE owner_id IS NOT NULL AND type = 'referral'
    )
  LOOP
    INSERT INTO public.codes (code, type, owner_id)
    VALUES (public.generate_referral_code(u.id), 'referral', u.id);
  END LOOP;
END;
$$;
