import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export default function Review() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const stylistId = params.get("stylistId");
  const serviceId = params.get("serviceId");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !stylistId) return;
    await supabase.from('reviews').insert({
      booking_id: bookingId,
      stylist_id: stylistId,
      service_id: serviceId,
      rating,
      comment,
      is_anonymous: isAnon,
    });
    setSubmitted(true);
  };

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
        <Button type="submit" variant="gold">Absenden</Button>
      </form>
    </div>
  );
}