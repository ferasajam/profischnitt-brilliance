


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'staff',
    'customer'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_loyalty_on_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."award_loyalty_on_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_booked_slots"("_stylist_id" "uuid", "_date" "date") RETURNS TABLE("start_time" time without time zone, "end_time" time without time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT b.start_time, b.end_time
  FROM public.bookings b
  WHERE b.stylist_id = _stylist_id
    AND b.booking_date = _date
    AND b.status IN ('pending','confirmed');
$$;


ALTER FUNCTION "public"."get_booked_slots"("_stylist_id" "uuid", "_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_staff"("_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;


ALTER FUNCTION "public"."is_admin_or_staff"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "stylist_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "booking_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "customer_phone" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cancellation_token" "uuid" DEFAULT "gen_random_uuid"(),
    "attendance_confirmed" boolean DEFAULT false NOT NULL,
    "start_at" timestamp without time zone GENERATED ALWAYS AS (("booking_date" + "start_time")) STORED,
    "end_at" timestamp without time zone GENERATED ALWAYS AS (("booking_date" + "end_time")) STORED,
    "slot_range" "tsrange" GENERATED ALWAYS AS (
CASE
    WHEN ("status" = 'cancelled'::"text") THEN NULL::"tsrange"
    ELSE "tsrange"(("booking_date" + "start_time"), ("booking_date" + "end_time"), '[)'::"text")
END) STORED,
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "total_earned" integer DEFAULT 0 NOT NULL,
    "total_redeemed" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."loyalty_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "booking_id" "uuid",
    "points" integer NOT NULL,
    "transaction_type" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earned'::"text", 'redeemed'::"text", 'bonus'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."loyalty_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "customer_id" "uuid",
    "stylist_id" "uuid",
    "service_id" "uuid",
    "rating" integer NOT NULL,
    "comment" "text",
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer DEFAULT 30 NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "category" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stylist_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stylist_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "sort_order" integer
);


ALTER TABLE "public"."stylist_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stylists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "specialty" "text",
    "bio" "text",
    "image_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text",
    "instagram_url" "text",
    "serves_women" boolean DEFAULT true NOT NULL,
    "serves_men" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."stylists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'customer'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."working_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stylist_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    CONSTRAINT "working_hours_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."working_hours" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_cancellation_token_key" UNIQUE ("cancellation_token");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_no_overlap" EXCLUDE USING "gist" ("stylist_id" WITH =, "slot_range" WITH &&);



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_customer_id_key" UNIQUE ("customer_id");



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stylist_services"
    ADD CONSTRAINT "stylist_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stylist_services"
    ADD CONSTRAINT "stylist_services_stylist_id_service_id_key" UNIQUE ("stylist_id", "service_id");



ALTER TABLE ONLY "public"."stylists"
    ADD CONSTRAINT "stylists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."working_hours"
    ADD CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."working_hours"
    ADD CONSTRAINT "working_hours_stylist_id_day_of_week_key" UNIQUE ("stylist_id", "day_of_week");



CREATE INDEX "stylist_services_stylist_sort_order_idx" ON "public"."stylist_services" USING "btree" ("stylist_id", "sort_order");



CREATE OR REPLACE TRIGGER "bookings_award_loyalty" BEFORE UPDATE OF "status" ON "public"."bookings" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."award_loyalty_on_completion"();



CREATE OR REPLACE TRIGGER "update_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_loyalty_points_updated_at" BEFORE UPDATE ON "public"."loyalty_points" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stylists_updated_at" BEFORE UPDATE ON "public"."stylists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stylist_services"
    ADD CONSTRAINT "stylist_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stylist_services"
    ADD CONSTRAINT "stylist_services_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."working_hours"
    ADD CONSTRAINT "working_hours_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylists"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all bookings" ON "public"."bookings" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage all points" ON "public"."loyalty_points" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage all roles" ON "public"."user_roles" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all transactions" ON "public"."loyalty_transactions" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage services" ON "public"."services" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage stylist services" ON "public"."stylist_services" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage stylists" ON "public"."stylists" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can manage working hours" ON "public"."working_hours" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can view all services" ON "public"."services" FOR SELECT TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Admins can view all stylists" ON "public"."stylists" FOR SELECT TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



CREATE POLICY "Allow cancellation by token" ON "public"."bookings" FOR UPDATE USING (("cancellation_token" IS NOT NULL)) WITH CHECK (("status" = ANY (ARRAY['cancelled'::"text", 'pending'::"text", 'confirmed'::"text"])));



CREATE POLICY "Allow insert reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((("rating" >= 1) AND ("rating" <= 5)));



CREATE POLICY "Anyone can view active services" ON "public"."services" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view active stylists" ON "public"."stylists" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Anyone can view stylist services" ON "public"."stylist_services" FOR SELECT USING (true);



CREATE POLICY "Anyone can view working hours" ON "public"."working_hours" FOR SELECT USING (true);



CREATE POLICY "Bookings: anon read by cancellation token" ON "public"."bookings" FOR SELECT TO "anon" USING (("cancellation_token" IS NOT NULL));



CREATE POLICY "Bookings: insert by authenticated user (owns customer_id)" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK ((("customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("customer_id" IS NULL)));



CREATE POLICY "Bookings: insert by visitor (anon)" ON "public"."bookings" FOR INSERT TO "anon" WITH CHECK ((("customer_id" IS NULL) AND ("customer_name" IS NOT NULL) AND ("customer_email" IS NOT NULL) AND ("customer_phone" IS NOT NULL) AND ("service_id" IS NOT NULL) AND ("stylist_id" IS NOT NULL) AND ("booking_date" IS NOT NULL) AND ("start_time" IS NOT NULL) AND ("end_time" IS NOT NULL) AND ("status" IS NOT NULL)));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own bookings" ON "public"."bookings" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "customer_id"))) WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "customer_id")));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own bookings" ON "public"."bookings" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "customer_id")));



CREATE POLICY "Users can view own points" ON "public"."loyalty_points" FOR SELECT USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own transactions" ON "public"."loyalty_transactions" FOR SELECT USING (("auth"."uid"() = "customer_id"));



ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "manage app_settings" ON "public"."app_settings" TO "authenticated" USING ("public"."is_admin_or_staff"("auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read app_settings" ON "public"."app_settings" FOR SELECT USING (true);



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stylist_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stylists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."working_hours" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."award_loyalty_on_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."award_loyalty_on_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_loyalty_on_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_booked_slots"("_stylist_id" "uuid", "_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_booked_slots"("_stylist_id" "uuid", "_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_booked_slots"("_stylist_id" "uuid", "_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_staff"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_staff"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_staff"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_points" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_points" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_points" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_transactions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."stylist_services" TO "anon";
GRANT ALL ON TABLE "public"."stylist_services" TO "authenticated";
GRANT ALL ON TABLE "public"."stylist_services" TO "service_role";



GRANT ALL ON TABLE "public"."stylists" TO "anon";
GRANT ALL ON TABLE "public"."stylists" TO "authenticated";
GRANT ALL ON TABLE "public"."stylists" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."working_hours" TO "anon";
GRANT ALL ON TABLE "public"."working_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."working_hours" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







