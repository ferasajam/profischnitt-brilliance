-- Create app_settings key-value table for configurable parameters
CREATE TABLE IF NOT EXISTS public.app_settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Read policy: allow anyone to read settings (adjust if needed)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'read app_settings'
	) THEN
		CREATE POLICY "read app_settings" ON public.app_settings FOR SELECT USING (true);
	END IF;
END$$;

-- Write policy: only admin/staff may manage settings
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'manage app_settings'
	) THEN
		CREATE POLICY "manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));
	END IF;
END$$;

-- Seed default loyalty threshold if missing
INSERT INTO public.app_settings(key, value)
SELECT 'loyalty_threshold', '10'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'loyalty_threshold');

