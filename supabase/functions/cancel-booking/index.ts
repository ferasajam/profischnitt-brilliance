// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const { token } = await req.json();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ ok: false, message: "Missing Supabase service creds" }), { status: 500 });
  }
  const client = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = client.createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('cancellation_token', token)
    .select('id')
    .single();

  if (error) return new Response(JSON.stringify({ ok: false, error }), { status: 400 });
  return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200 });
});