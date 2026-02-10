import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getCookieConsentChoice,
  notifyCookieConsentChanged,
  setCookieConsentChoice,
  subscribeCookieConsentChoice,
  type CookieConsentChoice,
} from "@/lib/cookieConsent";

type ConsentState = CookieConsentChoice | null;

export function CookieConsentBanner() {
  const [choice, setChoice] = useState<ConsentState>(null);
  const [isOpen, setIsOpen] = useState(false);

  const hasDecision = useMemo(() => choice === "necessary" || choice === "all", [choice]);

  useEffect(() => {
    const current = getCookieConsentChoice();
    setChoice(current);
    setIsOpen(!current);

    const cleanup = subscribeCookieConsentChoice((next) => {
      setChoice(next);
      // don't force-open on changes from elsewhere
    });

    const onOpen = () => setIsOpen(true);
    window.addEventListener("cookie-consent:open", onOpen);

    return () => {
      cleanup();
      window.removeEventListener("cookie-consent:open", onOpen);
    };
  }, []);

  const decide = (next: CookieConsentChoice) => {
    setCookieConsentChoice(next);
    notifyCookieConsentChanged();
    setChoice(next);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-4 md:p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-foreground font-semibold">Cookies & Datenschutz</p>
            <p className="text-sm text-muted-foreground">
              Wir verwenden notwendige Cookies/Local-Storage für grundlegende Funktionen (z.B. Login).
              Optionale Inhalte (z.B. Google Maps) werden nur nach Ihrer Zustimmung geladen.
            </p>
            <p className="text-xs text-muted-foreground">
              Mehr Infos: <Link className="text-primary hover:underline" to="/datenschutz">Datenschutz</Link> ·{" "}
              <Link className="text-primary hover:underline" to="/impressum">Impressum</Link>
              {hasDecision ? (
                <> · <span className="text-muted-foreground">Sie können Ihre Auswahl jederzeit ändern.</span></>
              ) : null}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              variant="silverOutline"
              onClick={() => decide("necessary")}
              className="w-full sm:w-auto"
            >
              Ablehnen
            </Button>
            <Button
              variant="silverOutline"
              onClick={() => decide("necessary")}
              className="w-full sm:w-auto"
            >
              Nur notwendige
            </Button>
            <Button
              variant="silver"
              onClick={() => decide("all")}
              className="w-full sm:w-auto"
            >
              Alle akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
