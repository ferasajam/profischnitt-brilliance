import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

export default function Cancel() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"idle" | "processing" | "cancelled" | "failed">("idle");

  useEffect(() => {
    const token = params.get("token") || params.get("cancel");
    const presetStatus = params.get("status");

    if (presetStatus) {
      setStatus(presetStatus === "cancelled" ? "cancelled" : "failed");
      return;
    }

    if (!token) {
      setStatus("failed");
      return;
    }

    const run = async () => {
      try {
        setStatus("processing");
        const { data, error } = await supabase.functions.invoke("cancel-booking", {
          method: "POST",
          body: { token },
        });
        if (error) {
          setStatus("failed");
        } else {
          setStatus("cancelled");
        }
      } catch (e) {
        setStatus("failed");
      }
    };
    run();
  }, [params]);

  return (
    <div className="bg-background min-h-screen">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Termin Stornierung
            </span>
            {status === "processing" && (
              <>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Wir verarbeiten Ihre Stornierung
                </h1>
                <p className="text-muted-foreground">Bitte einen Moment Geduld...</p>
              </>
            )}
            {status === "cancelled" && (
              <>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Ihr Termin wurde storniert
                </h1>
                <p className="text-muted-foreground mb-6">
                  Wir haben Ihre Buchung erfolgreich als storniert markiert. Sie können jederzeit einen neuen Termin vereinbaren.
                </p>
                <Button asChild variant="gold">
                  <a href="/booking">Neuen Termin buchen</a>
                </Button>
              </>
            )}
            {status === "failed" && (
              <>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Stornierung fehlgeschlagen
                </h1>
                <p className="text-muted-foreground mb-6">
                  Der Stornolink ist ungültig oder wurde bereits verwendet. Bitte kontaktieren Sie uns, falls Sie Hilfe benötigen.
                </p>
                <Button asChild variant="goldOutline">
                  <a href="/">Zur Startseite</a>
                </Button>
              </>
            )}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
