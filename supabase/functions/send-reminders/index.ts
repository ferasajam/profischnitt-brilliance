// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("MAIL_FROM") ?? "noreply@profischnitt.de";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ ok: false, message: "Missing Supabase service creds" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const client = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = client.createClient(supabaseUrl, supabaseKey);

  // Find bookings for tomorrow
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, customer_email, customer_name, booking_date, start_time, services(name), stylists(name)')
    .eq('booking_date', dateStr)
    .eq('status', 'confirmed');

  if (error) {
    return new Response(
      JSON.stringify({ ok: false, error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!apiKey) {
    console.log("[send-reminders] Would send ", bookings?.length || 0, " reminders.");
    return new Response(
      JSON.stringify({ ok: true, count: bookings?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  for (const b of bookings || []) {
    const subject = `Termin-Erinnerung: ${b.services?.name ?? 'Friseurtermin'}`;
    const html = `
      <h2>Erinnerung an Ihren Termin</h2>
      <p>Hallo ${b.customer_name},</p>
      <p>Ihr Termin findet morgen statt:</p>
      <ul>
        <li>Leistung: <strong>${b.services?.name ?? 'Friseurtermin'}</strong></li>
        <li>Stylist: <strong>${b.stylists?.name ?? 'Unser Team'}</strong></li>
        <li>Datum: <strong>${b.booking_date}</strong></li>
        <li>Uhrzeit: <strong>${b.start_time?.slice(0,5)}</strong></li>
      </ul>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: b.customer_email, subject, html }),
    });
  }

  return new Response(
    JSON.stringify({ ok: true, count: bookings?.length || 0 }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});