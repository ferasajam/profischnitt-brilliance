// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  bookingId: string;
}

interface BookingRecord {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  notes: string | null;
  stylist_id: string | null;
  service: { name?: string | null } | null;
  stylist: { name?: string | null } | null;
}

interface AppSettingRecord {
  value: string;
}

const parseRecipients = (value: string | null | undefined) => {
  return Array.from(
    new Set(
      (value ?? "")
        .split(/[\n,;]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const digits = entry.replace(/\D/g, "");
          if (digits.startsWith("00")) return digits.slice(2);
          return digits;
        })
        .filter((entry) => entry.length >= 8),
    ),
  );
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const body = (await req.json()) as Body;
  if (!body.bookingId) {
    return new Response(
      JSON.stringify({ ok: false, message: "Missing bookingId" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ ok: false, message: "Missing Supabase service creds" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const whatsappApiVersion = Deno.env.get("WHATSAPP_API_VERSION") ?? "v22.0";

  const client = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = client.createClient(supabaseUrl, supabaseKey);

  const bookingResult = await supabase
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_phone,
      booking_date,
      start_time,
      notes,
      stylist_id,
      service:services(name),
      stylist:stylists(name)
    `)
    .eq("id", body.bookingId)
    .maybeSingle();

  const booking = bookingResult.data as BookingRecord | null;
  const bookingError = bookingResult.error;

  if (bookingError || !booking) {
    return new Response(
      JSON.stringify({ ok: false, message: "Booking not found", error: bookingError }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const settingResult = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "booking_whatsapp_recipients")
    .maybeSingle();

  const setting = settingResult.data as AppSettingRecord | null;
  let stylistWhatsAppPhone: string | null = null;

  if (booking.stylist_id) {
    const stylistPhoneResult = await supabase
      .from("stylists")
      .select("whatsapp_phone")
      .eq("id", booking.stylist_id)
      .maybeSingle();

    if (!stylistPhoneResult.error) {
      stylistWhatsAppPhone = (stylistPhoneResult.data as { whatsapp_phone?: string | null } | null)?.whatsapp_phone ?? null;
    } else if (stylistPhoneResult.error.code !== "42703") {
      console.error("[send-booking-whatsapp] Could not load stylist whatsapp_phone", stylistPhoneResult.error);
    }
  }

  const recipients = Array.from(
    new Set([
      ...parseRecipients(setting?.value),
      ...parseRecipients(stylistWhatsAppPhone),
    ]),
  );

  if (!recipients.length) {
    return new Response(
      JSON.stringify({ ok: true, sent: 0, skipped: "No recipients configured" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const dateText = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${booking.booking_date}T12:00:00Z`));

  const timeText = String(booking.start_time ?? "").slice(0, 5);
  const message = [
    "Neue Terminbuchung",
    `Kunde: ${booking.customer_name}`,
    `Telefon: ${booking.customer_phone ?? "-"}`,
    `Leistung: ${booking.service?.name ?? "Friseurtermin"}`,
    `Stylist: ${booking.stylist?.name ?? "Unser Team"}`,
    `Datum: ${dateText}`,
    `Uhrzeit: ${timeText} Uhr`,
    booking.notes ? `Notiz: ${booking.notes}` : null,
  ].filter(Boolean).join("\n");

  if (!whatsappAccessToken || !whatsappPhoneNumberId) {
    console.log("[send-booking-whatsapp] Missing WhatsApp config. Would send:", {
      recipients,
      message,
    });

    return new Response(
      JSON.stringify({ ok: true, dryRun: true, recipients }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const results = [] as Array<{ to: string; ok: boolean; data: unknown }>;

  for (const recipient of recipients) {
    const response = await fetch(`https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const data = await response.json().catch(() => null);
    results.push({ to: recipient, ok: response.ok, data });
  }

  const ok = results.every((entry) => entry.ok);

  return new Response(
    JSON.stringify({ ok, sent: results.filter((entry) => entry.ok).length, results }),
    { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
