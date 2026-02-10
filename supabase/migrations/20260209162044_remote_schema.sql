drop extension if exists "pg_net";

create extension if not exists "btree_gist" with schema "public";

create type "public"."app_role" as enum ('admin', 'staff', 'customer');


  create table "public"."app_settings" (
    "key" text not null,
    "value" text not null,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."app_settings" enable row level security;


  create table "public"."bookings" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid,
    "stylist_id" uuid not null,
    "service_id" uuid not null,
    "booking_date" date not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "status" text not null default 'pending'::text,
    "customer_name" text not null,
    "customer_email" text not null,
    "customer_phone" text,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "cancellation_token" uuid default gen_random_uuid(),
    "attendance_confirmed" boolean not null default false,
    "start_at" timestamp without time zone generated always as ((booking_date + start_time)) stored,
    "end_at" timestamp without time zone generated always as ((booking_date + end_time)) stored,
    "slot_range" tsrange generated always as (
CASE
    WHEN (status = 'cancelled'::text) THEN NULL::tsrange
    ELSE tsrange((booking_date + start_time), (booking_date + end_time), '[)'::text)
END) stored
      );


alter table "public"."bookings" enable row level security;


  create table "public"."loyalty_points" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "points" integer not null default 0,
    "total_earned" integer not null default 0,
    "total_redeemed" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."loyalty_points" enable row level security;


  create table "public"."loyalty_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "booking_id" uuid,
    "points" integer not null,
    "transaction_type" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."loyalty_transactions" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "email" text,
    "phone" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "booking_id" uuid,
    "customer_id" uuid,
    "stylist_id" uuid,
    "service_id" uuid,
    "rating" integer not null,
    "comment" text,
    "is_anonymous" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."reviews" enable row level security;


  create table "public"."services" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "duration_minutes" integer not null default 30,
    "price" numeric(10,2) not null,
    "category" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."services" enable row level security;


  create table "public"."stylist_services" (
    "id" uuid not null default gen_random_uuid(),
    "stylist_id" uuid not null,
    "service_id" uuid not null
      );


alter table "public"."stylist_services" enable row level security;


  create table "public"."stylists" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "specialty" text,
    "bio" text,
    "image_url" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "title" text,
    "instagram_url" text,
    "serves_women" boolean not null default true,
    "serves_men" boolean not null default true
      );


alter table "public"."stylists" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "role" public.app_role not null default 'customer'::public.app_role,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_roles" enable row level security;


  create table "public"."working_hours" (
    "id" uuid not null default gen_random_uuid(),
    "stylist_id" uuid not null,
    "day_of_week" integer not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "is_available" boolean not null default true
      );


alter table "public"."working_hours" enable row level security;

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (key);

CREATE UNIQUE INDEX bookings_cancellation_token_key ON public.bookings USING btree (cancellation_token);

select 1; 
-- CREATE INDEX bookings_no_overlap ON public.bookings USING gist (stylist_id, slot_range);

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX loyalty_points_customer_id_key ON public.loyalty_points USING btree (customer_id);

CREATE UNIQUE INDEX loyalty_points_pkey ON public.loyalty_points USING btree (id);

CREATE UNIQUE INDEX loyalty_transactions_pkey ON public.loyalty_transactions USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id);

CREATE UNIQUE INDEX stylist_services_pkey ON public.stylist_services USING btree (id);

CREATE UNIQUE INDEX stylist_services_stylist_id_service_id_key ON public.stylist_services USING btree (stylist_id, service_id);

CREATE UNIQUE INDEX stylists_pkey ON public.stylists USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);

CREATE UNIQUE INDEX working_hours_pkey ON public.working_hours USING btree (id);

CREATE UNIQUE INDEX working_hours_stylist_id_day_of_week_key ON public.working_hours USING btree (stylist_id, day_of_week);

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."loyalty_points" add constraint "loyalty_points_pkey" PRIMARY KEY using index "loyalty_points_pkey";

alter table "public"."loyalty_transactions" add constraint "loyalty_transactions_pkey" PRIMARY KEY using index "loyalty_transactions_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."services" add constraint "services_pkey" PRIMARY KEY using index "services_pkey";

alter table "public"."stylist_services" add constraint "stylist_services_pkey" PRIMARY KEY using index "stylist_services_pkey";

alter table "public"."stylists" add constraint "stylists_pkey" PRIMARY KEY using index "stylists_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."working_hours" add constraint "working_hours_pkey" PRIMARY KEY using index "working_hours_pkey";

alter table "public"."bookings" add constraint "bookings_cancellation_token_key" UNIQUE using index "bookings_cancellation_token_key";

alter table "public"."bookings" add constraint "bookings_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_customer_id_fkey";

alter table "public"."bookings" add constraint "bookings_no_overlap" EXCLUDE USING gist (stylist_id WITH =, slot_range WITH &&);

alter table "public"."bookings" add constraint "bookings_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_service_id_fkey";

alter table "public"."bookings" add constraint "bookings_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."bookings" validate constraint "bookings_status_check";

alter table "public"."bookings" add constraint "bookings_stylist_id_fkey" FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_stylist_id_fkey";

alter table "public"."loyalty_points" add constraint "loyalty_points_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."loyalty_points" validate constraint "loyalty_points_customer_id_fkey";

alter table "public"."loyalty_points" add constraint "loyalty_points_customer_id_key" UNIQUE using index "loyalty_points_customer_id_key";

alter table "public"."loyalty_transactions" add constraint "loyalty_transactions_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL not valid;

alter table "public"."loyalty_transactions" validate constraint "loyalty_transactions_booking_id_fkey";

alter table "public"."loyalty_transactions" add constraint "loyalty_transactions_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."loyalty_transactions" validate constraint "loyalty_transactions_customer_id_fkey";

alter table "public"."loyalty_transactions" add constraint "loyalty_transactions_transaction_type_check" CHECK ((transaction_type = ANY (ARRAY['earned'::text, 'redeemed'::text, 'bonus'::text, 'expired'::text]))) not valid;

alter table "public"."loyalty_transactions" validate constraint "loyalty_transactions_transaction_type_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."reviews" add constraint "reviews_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_booking_id_fkey";

alter table "public"."reviews" add constraint "reviews_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_customer_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_service_id_fkey";

alter table "public"."reviews" add constraint "reviews_stylist_id_fkey" FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_stylist_id_fkey";

alter table "public"."stylist_services" add constraint "stylist_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE not valid;

alter table "public"."stylist_services" validate constraint "stylist_services_service_id_fkey";

alter table "public"."stylist_services" add constraint "stylist_services_stylist_id_fkey" FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE CASCADE not valid;

alter table "public"."stylist_services" validate constraint "stylist_services_stylist_id_fkey";

alter table "public"."stylist_services" add constraint "stylist_services_stylist_id_service_id_key" UNIQUE using index "stylist_services_stylist_id_service_id_key";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_role_key" UNIQUE using index "user_roles_user_id_role_key";

alter table "public"."working_hours" add constraint "working_hours_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))) not valid;

alter table "public"."working_hours" validate constraint "working_hours_day_of_week_check";

alter table "public"."working_hours" add constraint "working_hours_stylist_id_day_of_week_key" UNIQUE using index "working_hours_stylist_id_day_of_week_key";

alter table "public"."working_hours" add constraint "working_hours_stylist_id_fkey" FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE CASCADE not valid;

alter table "public"."working_hours" validate constraint "working_hours_stylist_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.award_loyalty_on_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_booked_slots(_stylist_id uuid, _date date)
 RETURNS TABLE(start_time time without time zone, end_time time without time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b.start_time, b.end_time
  FROM public.bookings b
  WHERE b.stylist_id = _stylist_id
    AND b.booking_date = _date
    AND b.status IN ('pending','confirmed');
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."loyalty_points" to "anon";

grant insert on table "public"."loyalty_points" to "anon";

grant references on table "public"."loyalty_points" to "anon";

grant select on table "public"."loyalty_points" to "anon";

grant trigger on table "public"."loyalty_points" to "anon";

grant truncate on table "public"."loyalty_points" to "anon";

grant update on table "public"."loyalty_points" to "anon";

grant delete on table "public"."loyalty_points" to "authenticated";

grant insert on table "public"."loyalty_points" to "authenticated";

grant references on table "public"."loyalty_points" to "authenticated";

grant select on table "public"."loyalty_points" to "authenticated";

grant trigger on table "public"."loyalty_points" to "authenticated";

grant truncate on table "public"."loyalty_points" to "authenticated";

grant update on table "public"."loyalty_points" to "authenticated";

grant delete on table "public"."loyalty_points" to "service_role";

grant insert on table "public"."loyalty_points" to "service_role";

grant references on table "public"."loyalty_points" to "service_role";

grant select on table "public"."loyalty_points" to "service_role";

grant trigger on table "public"."loyalty_points" to "service_role";

grant truncate on table "public"."loyalty_points" to "service_role";

grant update on table "public"."loyalty_points" to "service_role";

grant delete on table "public"."loyalty_transactions" to "anon";

grant insert on table "public"."loyalty_transactions" to "anon";

grant references on table "public"."loyalty_transactions" to "anon";

grant select on table "public"."loyalty_transactions" to "anon";

grant trigger on table "public"."loyalty_transactions" to "anon";

grant truncate on table "public"."loyalty_transactions" to "anon";

grant update on table "public"."loyalty_transactions" to "anon";

grant delete on table "public"."loyalty_transactions" to "authenticated";

grant insert on table "public"."loyalty_transactions" to "authenticated";

grant references on table "public"."loyalty_transactions" to "authenticated";

grant select on table "public"."loyalty_transactions" to "authenticated";

grant trigger on table "public"."loyalty_transactions" to "authenticated";

grant truncate on table "public"."loyalty_transactions" to "authenticated";

grant update on table "public"."loyalty_transactions" to "authenticated";

grant delete on table "public"."loyalty_transactions" to "service_role";

grant insert on table "public"."loyalty_transactions" to "service_role";

grant references on table "public"."loyalty_transactions" to "service_role";

grant select on table "public"."loyalty_transactions" to "service_role";

grant trigger on table "public"."loyalty_transactions" to "service_role";

grant truncate on table "public"."loyalty_transactions" to "service_role";

grant update on table "public"."loyalty_transactions" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."services" to "anon";

grant insert on table "public"."services" to "anon";

grant references on table "public"."services" to "anon";

grant select on table "public"."services" to "anon";

grant trigger on table "public"."services" to "anon";

grant truncate on table "public"."services" to "anon";

grant update on table "public"."services" to "anon";

grant delete on table "public"."services" to "authenticated";

grant insert on table "public"."services" to "authenticated";

grant references on table "public"."services" to "authenticated";

grant select on table "public"."services" to "authenticated";

grant trigger on table "public"."services" to "authenticated";

grant truncate on table "public"."services" to "authenticated";

grant update on table "public"."services" to "authenticated";

grant delete on table "public"."services" to "service_role";

grant insert on table "public"."services" to "service_role";

grant references on table "public"."services" to "service_role";

grant select on table "public"."services" to "service_role";

grant trigger on table "public"."services" to "service_role";

grant truncate on table "public"."services" to "service_role";

grant update on table "public"."services" to "service_role";

grant delete on table "public"."stylist_services" to "anon";

grant insert on table "public"."stylist_services" to "anon";

grant references on table "public"."stylist_services" to "anon";

grant select on table "public"."stylist_services" to "anon";

grant trigger on table "public"."stylist_services" to "anon";

grant truncate on table "public"."stylist_services" to "anon";

grant update on table "public"."stylist_services" to "anon";

grant delete on table "public"."stylist_services" to "authenticated";

grant insert on table "public"."stylist_services" to "authenticated";

grant references on table "public"."stylist_services" to "authenticated";

grant select on table "public"."stylist_services" to "authenticated";

grant trigger on table "public"."stylist_services" to "authenticated";

grant truncate on table "public"."stylist_services" to "authenticated";

grant update on table "public"."stylist_services" to "authenticated";

grant delete on table "public"."stylist_services" to "service_role";

grant insert on table "public"."stylist_services" to "service_role";

grant references on table "public"."stylist_services" to "service_role";

grant select on table "public"."stylist_services" to "service_role";

grant trigger on table "public"."stylist_services" to "service_role";

grant truncate on table "public"."stylist_services" to "service_role";

grant update on table "public"."stylist_services" to "service_role";

grant delete on table "public"."stylists" to "anon";

grant insert on table "public"."stylists" to "anon";

grant references on table "public"."stylists" to "anon";

grant select on table "public"."stylists" to "anon";

grant trigger on table "public"."stylists" to "anon";

grant truncate on table "public"."stylists" to "anon";

grant update on table "public"."stylists" to "anon";

grant delete on table "public"."stylists" to "authenticated";

grant insert on table "public"."stylists" to "authenticated";

grant references on table "public"."stylists" to "authenticated";

grant select on table "public"."stylists" to "authenticated";

grant trigger on table "public"."stylists" to "authenticated";

grant truncate on table "public"."stylists" to "authenticated";

grant update on table "public"."stylists" to "authenticated";

grant delete on table "public"."stylists" to "service_role";

grant insert on table "public"."stylists" to "service_role";

grant references on table "public"."stylists" to "service_role";

grant select on table "public"."stylists" to "service_role";

grant trigger on table "public"."stylists" to "service_role";

grant truncate on table "public"."stylists" to "service_role";

grant update on table "public"."stylists" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."working_hours" to "anon";

grant insert on table "public"."working_hours" to "anon";

grant references on table "public"."working_hours" to "anon";

grant select on table "public"."working_hours" to "anon";

grant trigger on table "public"."working_hours" to "anon";

grant truncate on table "public"."working_hours" to "anon";

grant update on table "public"."working_hours" to "anon";

grant delete on table "public"."working_hours" to "authenticated";

grant insert on table "public"."working_hours" to "authenticated";

grant references on table "public"."working_hours" to "authenticated";

grant select on table "public"."working_hours" to "authenticated";

grant trigger on table "public"."working_hours" to "authenticated";

grant truncate on table "public"."working_hours" to "authenticated";

grant update on table "public"."working_hours" to "authenticated";

grant delete on table "public"."working_hours" to "service_role";

grant insert on table "public"."working_hours" to "service_role";

grant references on table "public"."working_hours" to "service_role";

grant select on table "public"."working_hours" to "service_role";

grant trigger on table "public"."working_hours" to "service_role";

grant truncate on table "public"."working_hours" to "service_role";

grant update on table "public"."working_hours" to "service_role";


  create policy "manage app_settings"
  on "public"."app_settings"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "read app_settings"
  on "public"."app_settings"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage all bookings"
  on "public"."bookings"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Allow cancellation by token"
  on "public"."bookings"
  as permissive
  for update
  to public
using ((cancellation_token IS NOT NULL))
with check ((status = ANY (ARRAY['cancelled'::text, 'pending'::text, 'confirmed'::text])));



  create policy "Bookings: anon read by cancellation token"
  on "public"."bookings"
  as permissive
  for select
  to anon
using ((cancellation_token IS NOT NULL));



  create policy "Bookings: insert by authenticated user (owns customer_id)"
  on "public"."bookings"
  as permissive
  for insert
  to authenticated
with check (((customer_id = ( SELECT auth.uid() AS uid)) OR (customer_id IS NULL)));



  create policy "Bookings: insert by visitor (anon)"
  on "public"."bookings"
  as permissive
  for insert
  to anon
with check (((customer_id IS NULL) AND (customer_name IS NOT NULL) AND (customer_email IS NOT NULL) AND (customer_phone IS NOT NULL) AND (service_id IS NOT NULL) AND (stylist_id IS NOT NULL) AND (booking_date IS NOT NULL) AND (start_time IS NOT NULL) AND (end_time IS NOT NULL) AND (status IS NOT NULL)));



  create policy "Users can update own bookings"
  on "public"."bookings"
  as permissive
  for update
  to public
using (((auth.uid() IS NOT NULL) AND (auth.uid() = customer_id)))
with check (((auth.uid() IS NOT NULL) AND (auth.uid() = customer_id)));



  create policy "Users can view own bookings"
  on "public"."bookings"
  as permissive
  for select
  to public
using (((auth.uid() IS NOT NULL) AND (auth.uid() = customer_id)));



  create policy "Admins can manage all points"
  on "public"."loyalty_points"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Users can view own points"
  on "public"."loyalty_points"
  as permissive
  for select
  to public
using ((auth.uid() = customer_id));



  create policy "Admins can manage all transactions"
  on "public"."loyalty_transactions"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Users can view own transactions"
  on "public"."loyalty_transactions"
  as permissive
  for select
  to public
using ((auth.uid() = customer_id));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Allow insert reviews"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check (((rating >= 1) AND (rating <= 5)));



  create policy "Anyone can view reviews"
  on "public"."reviews"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage services"
  on "public"."services"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Admins can view all services"
  on "public"."services"
  as permissive
  for select
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Anyone can view active services"
  on "public"."services"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Admins can manage stylist services"
  on "public"."stylist_services"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Anyone can view stylist services"
  on "public"."stylist_services"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage stylists"
  on "public"."stylists"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Admins can view all stylists"
  on "public"."stylists"
  as permissive
  for select
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Anyone can view active stylists"
  on "public"."stylists"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Admins can manage all roles"
  on "public"."user_roles"
  as permissive
  for all
  to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));



  create policy "Users can view own roles"
  on "public"."user_roles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can manage working hours"
  on "public"."working_hours"
  as permissive
  for all
  to authenticated
using (public.is_admin_or_staff(auth.uid()));



  create policy "Anyone can view working hours"
  on "public"."working_hours"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER bookings_award_loyalty BEFORE UPDATE OF status ON public.bookings FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.award_loyalty_on_completion();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON public.stylists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


