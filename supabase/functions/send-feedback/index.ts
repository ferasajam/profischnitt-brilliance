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
  bookingId: string;
  reviewLink: string;
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
  const from = Deno.env.get("MAIL_FROM") ?? "noreply@diva-haarstudio.de";

  const subject = `Wie war Ihr Termin?`;
  const html = `
    <h2>Wir freuen uns über Ihr Feedback</h2>
    <p>Hallo ${body.name},</p>
    <p>Vielen Dank für Ihren Besuch! Wir würden gerne Ihre Meinung hören.</p>
    <p>Sie können anonym bewerten, wenn Sie möchten.</p>
    <p><a href="${body.reviewLink}">Jetzt Bewertung abgeben</a></p>
  `;

  if (!apiKey) {
    console.log("[send-feedback] Missing RESEND_API_KEY. Would send:", {
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