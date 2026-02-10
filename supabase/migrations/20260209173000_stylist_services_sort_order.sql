-- Add per-stylist ordering for services shown in booking
ALTER TABLE public.stylist_services
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Backfill existing links in a stable order (category, then name)
WITH ranked AS (
  SELECT
    ss.id,
    row_number() OVER (
      PARTITION BY ss.stylist_id
      ORDER BY s.category NULLS LAST, s.name
    ) - 1 AS rn
  FROM public.stylist_services ss
  JOIN public.services s ON s.id = ss.service_id
)
UPDATE public.stylist_services ss
SET sort_order = ranked.rn
FROM ranked
WHERE ss.id = ranked.id
  AND ss.sort_order IS NULL;

CREATE INDEX IF NOT EXISTS stylist_services_stylist_sort_order_idx
  ON public.stylist_services (stylist_id, sort_order);
