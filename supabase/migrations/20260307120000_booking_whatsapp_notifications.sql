ALTER TABLE public.stylists
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

INSERT INTO public.app_settings(key, value)
SELECT 'booking_whatsapp_recipients', ''
WHERE NOT EXISTS (
  SELECT 1
  FROM public.app_settings
  WHERE key = 'booking_whatsapp_recipients'
);
