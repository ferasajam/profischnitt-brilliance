// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let token: string | null = null;

  if (req.method === "GET") {
    token = url.searchParams.get("token") || url.searchParams.get("cancel");
  } else if (req.method === "POST") {
    const body = await req.json().catch(() => ({} as any));
    token = body.token ?? null;
  } else {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  if (!token) {
    return new Response(
      JSON.stringify({ ok: false, message: "Missing token" }),
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
  const client = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = client.createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('cancellation_token', token)
    .select('id')
    .single();

  if (error) {
    // If GET, redirect to site with failure param; else JSON
    if (req.method === "GET") {
      const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:8080";
      return new Response(null, { status: 302, headers: { Location: `${siteUrl}/cancel?status=failed` } });
    }
    return new Response(
      JSON.stringify({ ok: false, error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (req.method === "GET") {
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:8080";
    return new Response(null, { status: 302, headers: { Location: `${siteUrl}/cancel?status=cancelled` } });
  }

  return new Response(
    JSON.stringify({ ok: true, id: data.id }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});