-- Extend bookings with cancellation token and attendance flag
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancellation_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS attendance_confirmed BOOLEAN NOT NULL DEFAULT false;

-- Reviews table for haircuts/services
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES public.stylists(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- RLS: Allow insert of reviews with optional anonymity
-- In a production app, you'd validate via signed tokens or auth; simplified here
CREATE POLICY "Allow insert reviews" ON public.reviews FOR INSERT WITH CHECK (rating >= 1 AND rating <= 5);

-- Loyalty point awarding when booking completed
CREATE OR REPLACE FUNCTION public.award_loyalty_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.customer_id IS NOT NULL THEN
    -- Mark attendance
    NEW.attendance_confirmed = true;

    -- Upsert loyalty points
    INSERT INTO public.loyalty_points (customer_id, points, total_earned)
    VALUES (NEW.customer_id, 1, 1)
    ON CONFLICT (customer_id)
    DO UPDATE SET points = public.loyalty_points.points + 1,
                  total_earned = public.loyalty_points.total_earned + 1,
                  updated_at = now();

    -- Record transaction
    INSERT INTO public.loyalty_transactions (customer_id, booking_id, points, transaction_type, description)
    VALUES (NEW.customer_id, NEW.id, 1, 'earned', 'Attendance confirmed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS bookings_award_loyalty ON public.bookings;
CREATE TRIGGER bookings_award_loyalty
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.award_loyalty_on_completion();