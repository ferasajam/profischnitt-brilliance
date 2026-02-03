-- One-time feedback / review link

-- Add one-time token state to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS feedback_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS feedback_used BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS feedback_used_at TIMESTAMP WITH TIME ZONE;

-- Backfill token for existing rows (in case the column existed/was NULL)
UPDATE public.bookings
SET feedback_token = gen_random_uuid()
WHERE feedback_token IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN feedback_token SET NOT NULL;

-- Enforce at most one review per booking (when booking_id is present)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_booking
  ON public.reviews (booking_id)
  WHERE booking_id IS NOT NULL;

-- Read-only context for the Review page (works for anon via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_review_context_by_token(_token UUID)
RETURNS TABLE (
  booking_id UUID,
  stylist_id UUID,
  service_id UUID,
  is_used BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.stylist_id,
    b.service_id,
    (b.feedback_used OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.booking_id = b.id)) AS is_used
  FROM public.bookings b
  WHERE b.feedback_token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_context_by_token(UUID) TO anon, authenticated;

-- Submit review exactly once per token/booking (idempotent if already submitted)
CREATE OR REPLACE FUNCTION public.submit_review_with_token(
  _token UUID,
  _rating INTEGER,
  _comment TEXT,
  _is_anonymous BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b RECORD;
  review_id UUID;
BEGIN
  SELECT id, stylist_id, service_id, feedback_used, status
    INTO b
  FROM public.bookings
  WHERE feedback_token = _token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF b.status <> 'completed' THEN
    RAISE EXCEPTION 'booking_not_completed';
  END IF;

  -- If a review already exists, mark token as used and return the existing review id
  SELECT r.id INTO review_id
  FROM public.reviews r
  WHERE r.booking_id = b.id
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.bookings
      SET feedback_used = true,
          feedback_used_at = COALESCE(feedback_used_at, now())
      WHERE id = b.id;

    RETURN review_id;
  END IF;

  IF b.feedback_used THEN
    RAISE EXCEPTION 'token_used';
  END IF;

  -- Insert review; unique index protects against duplicates
  INSERT INTO public.reviews (booking_id, stylist_id, service_id, rating, comment, is_anonymous)
  VALUES (b.id, b.stylist_id, b.service_id, _rating, _comment, COALESCE(_is_anonymous, false))
  RETURNING id INTO review_id;

  UPDATE public.bookings
    SET feedback_used = true,
        feedback_used_at = now()
    WHERE id = b.id;

  RETURN review_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Another request inserted first; treat as used and return existing review id
    SELECT r.id INTO review_id
    FROM public.reviews r
    WHERE r.booking_id = b.id
    LIMIT 1;

    UPDATE public.bookings
      SET feedback_used = true,
          feedback_used_at = COALESCE(feedback_used_at, now())
      WHERE id = b.id;

    RETURN review_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_review_with_token(UUID, INTEGER, TEXT, BOOLEAN) TO anon, authenticated;
