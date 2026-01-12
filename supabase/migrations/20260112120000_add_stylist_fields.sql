-- Add optional title and instagram_url to stylists
ALTER TABLE public.stylists
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Ensure existing rows have sane defaults
UPDATE public.stylists SET title = COALESCE(title, 'Stylist') WHERE title IS NULL;