-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create stylists table
CREATE TABLE public.stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stylist_services junction table
CREATE TABLE public.stylist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylists(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (stylist_id, service_id)
);

-- Create working_hours table for stylist availability
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES public.stylists(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (stylist_id, day_of_week)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES public.stylists(id) ON DELETE SET NULL NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty_points table
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (customer_id)
);

-- Create loyalty_transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'bonus', 'expired')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create has_role function to check user roles (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for stylists (public read, admin/staff write)
CREATE POLICY "Anyone can view active stylists" ON public.stylists FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all stylists" ON public.stylists FOR SELECT TO authenticated USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage stylists" ON public.stylists FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for services (public read, admin/staff write)
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all services" ON public.services FOR SELECT TO authenticated USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for stylist_services
CREATE POLICY "Anyone can view stylist services" ON public.stylist_services FOR SELECT USING (true);
CREATE POLICY "Admins can manage stylist services" ON public.stylist_services FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for working_hours
CREATE POLICY "Anyone can view working hours" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Admins can manage working hours" ON public.working_hours FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Anyone can create guest bookings" ON public.bookings FOR INSERT WITH CHECK (customer_id IS NULL);

-- RLS Policies for loyalty_points
CREATE POLICY "Users can view own points" ON public.loyalty_points FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all points" ON public.loyalty_points FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for loyalty_transactions
CREATE POLICY "Users can view own transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all transactions" ON public.loyalty_transactions FOR ALL TO authenticated USING (public.is_admin_or_staff(auth.uid()));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  
  -- Initialize loyalty points
  INSERT INTO public.loyalty_points (customer_id, points)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON public.stylists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (name, description, duration_minutes, price, category) VALUES
('Herrenhaarschnitt', 'Klassischer Herrenhaarschnitt mit Beratung', 30, 32.00, 'Herren'),
('Damenhaarschnitt', 'Individueller Schnitt nach Ihren Wünschen', 45, 48.00, 'Damen'),
('Waschen & Föhnen', 'Professionelle Haarpflege und Styling', 30, 28.00, 'Styling'),
('Färben', 'Vollständige Coloration mit Premium-Produkten', 90, 85.00, 'Farbe'),
('Strähnchen', 'Highlights und Lowlights für natürliche Effekte', 120, 95.00, 'Farbe'),
('Bart trimmen', 'Präzise Bartpflege und Formung', 20, 18.00, 'Herren'),
('Hochsteckfrisur', 'Elegante Frisur für besondere Anlässe', 60, 65.00, 'Styling'),
('Haarbehandlung', 'Intensive Pflegebehandlung für gesundes Haar', 45, 45.00, 'Pflege');

-- Insert default stylists
INSERT INTO public.stylists (name, specialty, bio) VALUES
('Anna Schmidt', 'Damen-Styling', 'Spezialisiert auf moderne Schnitte und Colorationen. 10 Jahre Erfahrung in der Branche.'),
('Max Weber', 'Herren-Frisuren', 'Experte für klassische und moderne Herrenhaarschnitte. Bartpflege-Spezialist.'),
('Sophie Müller', 'Farbtechnik', 'Kreative Coloristin mit Fokus auf natürliche Looks und Balayage-Techniken.');