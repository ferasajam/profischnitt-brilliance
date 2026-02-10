-- Add gender audience flags to stylists (admin-controlled)
ALTER TABLE public.stylists
  ADD COLUMN IF NOT EXISTS serves_women BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS serves_men BOOLEAN NOT NULL DEFAULT true;

-- Ensure existing rows have sane defaults
UPDATE public.stylists
SET
  serves_women = COALESCE(serves_women, true),
  serves_men = COALESCE(serves_men, true)
WHERE serves_women IS NULL OR serves_men IS NULL;
