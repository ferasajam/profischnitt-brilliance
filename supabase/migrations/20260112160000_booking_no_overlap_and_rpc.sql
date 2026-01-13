-- Ensure btree_gist is available for exclusion constraints on uuid
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add generated timestamps and range for overlap checks
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITHOUT TIME ZONE GENERATED ALWAYS AS (booking_date + start_time) STORED,
  ADD COLUMN IF NOT EXISTS end_at   TIMESTAMP WITHOUT TIME ZONE GENERATED ALWAYS AS (booking_date + end_time) STORED,
  ADD COLUMN IF NOT EXISTS slot_range TSRANGE GENERATED ALWAYS AS (
    CASE
      WHEN status IN ('cancelled') THEN NULL
      ELSE tsrange(booking_date + start_time, booking_date + end_time, '[)')
    END
  ) STORED;

-- Prevent overlapping bookings per stylist (treat cancelled as non-blocking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_no_overlap
      EXCLUDE USING gist (
        stylist_id WITH =,
        slot_range WITH &&
      );
  END IF;
END$$;

-- Function to fetch booked slots for a stylist on a date (pending/confirmed)
CREATE OR REPLACE FUNCTION public.get_booked_slots(_stylist_id UUID, _date DATE)
RETURNS TABLE (start_time TIME, end_time TIME)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.start_time, b.end_time
  FROM public.bookings b
  WHERE b.stylist_id = _stylist_id
    AND b.booking_date = _date
    AND b.status IN ('pending','confirmed');
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(UUID, DATE) TO anon, authenticated;