// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  to: string;
  name: string;
  booking: { service?: string; stylist?: string; date: string; time: string };
  cancelLink: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  const body = (await req.json()) as Body;

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("MAIL_FROM") ?? "noreply@profischnitt.de";

  const subject = `Terminbestätigung: ${body.booking.service ?? "Friseurtermin"}`;
  const html = `
    <h2>Bestätigung Ihres Termins</h2>
    <p>Hallo ${body.name},</p>
    <p>Ihr Termin ist bestätigt:</p>
    <ul>
      <li>Leistung: <strong>${body.booking.service ?? "Friseurtermin"}</strong></li>
      <li>Stylist: <strong>${body.booking.stylist ?? "Unser Team"}</strong></li>
      <li>Datum: <strong>${body.booking.date}</strong></li>
      <li>Uhrzeit: <strong>${body.booking.time}</strong></li>
    </ul>
    <p>Wenn Sie den Termin stornieren möchten, klicken Sie hier:
      <a href="${body.cancelLink}">Termin stornieren</a></p>
    <p>Wir freuen uns auf Ihren Besuch!</p>
  `;

  if (!apiKey) {
    console.log("[send-confirmation] Missing RESEND_API_KEY. Would send:", {
      to: body.to,
      subject,
    });
    return new Response(
      JSON.stringify({ ok: false, message: "Email not sent (no API key)" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: body.to,
      subject,
      html,
    }),
  });

  const data = await res.json();
  const ok = res.ok;
  return new Response(
    JSON.stringify({ ok, data }),
    { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});