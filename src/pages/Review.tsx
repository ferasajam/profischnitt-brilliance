import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

const rpc = (supabase as unknown as {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: PostgrestError | null }>;
}).rpc;

export default function Review() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? params.get("t");
  const bookingId = params.get("bookingId");
  const stylistId = params.get("stylistId");
  const serviceId = params.get("serviceId");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsed, setIsUsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setErrorMessage(null);
      setLinkErrorMessage(null);
      setIsLoading(true);

      // Preferred flow: token-based one-time link
      if (token) {
        const { data, error } = await rpc("get_review_context_by_token", {
          _token: token,
        });

        if (!active) return;

        if (error) {
          setLinkErrorMessage("Ungültiger oder abgelaufener Link.");
          setIsUsed(false);
          setIsLoading(false);
          return;
        }

        const ctx = (Array.isArray(data) ? data[0] : data) as
          | { booking_id?: string | null; is_used?: boolean | null }
          | null
          | undefined;
        if (!ctx?.booking_id) {
          setLinkErrorMessage("Ungültiger oder abgelaufener Link.");
          setIsUsed(false);
          setIsLoading(false);
          return;
        }

        setIsUsed(Boolean(ctx.is_used));
        setIsLoading(false);
        return;
      }

      // Legacy flow: treat link as single-use by checking if a review already exists
      if (!bookingId) {
        setLinkErrorMessage("Ungültiger Link.");
        setIsUsed(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        // If RLS blocks or other errors occur, fail open (show form) rather than locking users out.
        setIsUsed(false);
        setIsLoading(false);
        return;
      }

      setIsUsed(Boolean(data?.id));
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, bookingId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);

    // Preferred flow: submit via one-time token RPC
    if (token) {
      const { error } = await rpc("submit_review_with_token", {
        _token: token,
        _rating: rating,
        _comment: comment,
        _is_anonymous: isAnon,
      });

      if (error) {
        // Most common: already used
        setIsUsed(true);
        setErrorMessage("Dieser Link wurde bereits verwendet.");
        return;
      }

      setSubmitted(true);
      return;
    }

    // Legacy flow (kept for backwards compatibility)
    if (!serviceId || !stylistId) return;
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      stylist_id: stylistId,
      service_id: serviceId,
      rating,
      comment,
      is_anonymous: isAnon,
    });

    if (error) {
      if ((error as PostgrestError | null)?.code === "23505") {
        setIsUsed(true);
        setErrorMessage("Dieser Link wurde bereits verwendet.");
        return;
      }
      setErrorMessage("Bewertung konnte nicht gespeichert werden.");
      return;
    }

    setSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Link wird geprüft…</p>
      </div>
    );
  }

  if (isUsed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl">Link bereits verwendet</h2>
        <p className="text-muted-foreground">Dieser Feedback-Link kann nur einmal genutzt werden.</p>
      </div>
    );
  }

  if (linkErrorMessage) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl">Link ungültig</h2>
        <p className="text-muted-foreground">{linkErrorMessage}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl">Danke für Ihr Feedback!</h2>
        <p className="text-muted-foreground">Ihre Bewertung wurde gespeichert.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl mb-6">Bewertung abgeben</h1>
      <form onSubmit={submit} className="max-w-md space-y-4">
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        <div>
          <Label>Bewertung (1-5)</Label>
          <Input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} />
        </div>
        <div>
          <Label>Kommentar (optional)</Label>
          <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} />
        </div>
        <div className="flex items-center gap-2">
          <input id="anon" type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} />
          <Label htmlFor="anon">Anonym bewerten</Label>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            type="submit"
            variant="silver"
            size="xl"
            className="w-full shadow-lg shadow-primary/20"
          >
            <span className="flex items-center justify-center gap-2">
              <Scissors className="w-5 h-5" />
              <span>Absenden</span>
            </span>
          </Button>
        </motion.div>
      </form>
    </div>
  );
}