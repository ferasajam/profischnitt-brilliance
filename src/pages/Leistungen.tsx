
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Edit, Loader2, Save, X } from "lucide-react";

type HerrenPreis = {
  service: string;
  preis: string;
};

type DamenPreis = {
  leistung: string;
  kurz?: string;
  mittel?: string;
  lang?: string;
};

type Preisliste = {
  damen: DamenPreis[];
  herren: HerrenPreis[];
};

type AppSettingsClient = {
  from: (table: "app_settings") => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { value: string } | null;
          error: { message?: string } | null;
        }>;
      };
    };
    upsert: (
      values: { key: string; value: string },
      options: { onConflict: string }
    ) => Promise<{ error: { message?: string } | null }>;
  };
};

const DEFAULT_PREISLISTE: Preisliste = {
  damen: [
    { leistung: "Schneiden", kurz: "28 €", mittel: "38 €", lang: "45 €" },
    { leistung: "Stylen", kurz: "25 €", mittel: "30 €", lang: "35 €" },
    { leistung: "Waschen, Schneiden, Föhnen", kurz: "44 €", mittel: "51 €", lang: "59 €" },
    { leistung: "Mädchen Haarschnitt bis 10 Jahre", kurz: "15 €" },
    { leistung: "Ansatz Farbe 2cm(30ml+vol)", kurz: "ab 35 €" },
    { leistung: "Komplettfärben", kurz: "50 €", mittel: "60 €", lang: "ab 70 €" },
    { leistung: "KomplettTönung", kurz: "39 €", mittel: "49 €", lang: "ab 59 €" },
    { leistung: "Foliesträhnen", kurz: "60 €", mittel: "80 €", lang: "ab 100 €" },
    { leistung: "Balayage", kurz: "ab 150 €" },
    { leistung: "Haubensträhnen", kurz: "50 €" },
    { leistung: "Highlights", kurz: "ab 69 €" },
    { leistung: "Ombré", kurz: "ab 125 €" },
    { leistung: "Airtouch", kurz: "ab 150 €" },
    { leistung: "Glossing", kurz: "39 €", mittel: "49 €", lang: "59 €" },
    { leistung: "Dauerwelle", kurz: "59 €", mittel: "75 €", lang: "100 €" },
    { leistung: "Haar-Glättung", kurz: "ab 300 €" },
    { leistung: "Haarverlängerung", kurz: "ab 300 €" },
    { leistung: "Hochsteckfrisur", kurz: "ab 80 €" },
    { leistung: "Pflege Maske mit Kopfmassage", kurz: "15 €" },
    { leistung: "Olaplex Pflege", kurz: "25 €" },
    { leistung: "Farbe / Haarkur", kurz: "30 €" },
    { leistung: "waschen", kurz: "5 €" },
    { leistung: "Augenbrauen färben", kurz: "10 €" },
    { leistung: "Wimpern färben", kurz: "13 €" },
    { leistung: "Alltags-Make-up", kurz: "60 €" },
    { leistung: "Abend Make-up", kurz: "100 €" },
    { leistung: "Hochzeit Make-up", kurz: "150 €" },
  ],
  herren: [
    { service: "Schneiden", preis: "21 €" },
    { service: "Maschine Schnitt", preis: "17 €" },
    { service: "Bart", preis: "13 €" },
    { service: "Haar und Bart", preis: "29 €" },
    { service: "Jungs bis 18", preis: "17 €" },
    { service: "Kinder bis 9 Jahre", preis: "14 €" },
    { service: "Dauerwelle", preis: "ab 45 €" },
    { service: "Haubensträhnen", preis: "ab 30 €" },
    { service: "Färben", preis: "ab 30 €" },
    { service: "Gesichtswaxing", preis: "10 €" },
    { service: "Augenbrauen zupfen", preis: "8 €" },
    { service: "Gesichtsreinigung", preis: "10 €" },
  ],
};

function formatPrice(value?: string) {
  if (!value) return "—";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized.replace(/\s*€$/, "\u00A0€");
}

function normalizeDamenItem(item: Partial<DamenPreis>): DamenPreis {
  return {
    leistung: String(item.leistung || ""),
    kurz: item.kurz || "",
    mittel: item.mittel || "",
    lang: item.lang || "",
  };
}

function normalizeHerrenItem(item: Partial<HerrenPreis>): HerrenPreis {
  return {
    service: String(item.service || ""),
    preis: item.preis || "",
  };
}

function sanitizePreisliste(raw: unknown): Preisliste {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PREISLISTE;
  }

  const candidate = raw as Partial<Preisliste>;
  return {
    damen: Array.isArray(candidate.damen)
      ? candidate.damen.map((item) => normalizeDamenItem(item))
      : DEFAULT_PREISLISTE.damen,
    herren: Array.isArray(candidate.herren)
      ? candidate.herren.map((item) => normalizeHerrenItem(item))
      : DEFAULT_PREISLISTE.herren,
  };
}

export default function Leistungen() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const appSettingsClient = supabase as unknown as AppSettingsClient;
  const [preisliste, setPreisliste] = useState<Preisliste>(DEFAULT_PREISLISTE);
  const [draftPreisliste, setDraftPreisliste] = useState<Preisliste>(DEFAULT_PREISLISTE);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreisliste = async () => {
      const { data, error } = await appSettingsClient
        .from("app_settings")
        .select("value")
        .eq("key", "public_price_list")
        .maybeSingle();

      if (error) {
        toast({
          title: "Fehler",
          description: "Preisliste konnte nicht geladen werden. Standardwerte werden angezeigt.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data?.value) {
        setPreisliste(DEFAULT_PREISLISTE);
        setDraftPreisliste(DEFAULT_PREISLISTE);
        setIsLoading(false);
        return;
      }

      try {
        const parsed = sanitizePreisliste(JSON.parse(data.value));
        setPreisliste(parsed);
        setDraftPreisliste(parsed);
      } catch {
        toast({
          title: "Fehler",
          description: "Gespeicherte Preisliste ist ungültig. Standardwerte werden angezeigt.",
          variant: "destructive",
        });
        setPreisliste(DEFAULT_PREISLISTE);
        setDraftPreisliste(DEFAULT_PREISLISTE);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPreisliste();
  }, [appSettingsClient, toast]);

  const visiblePreisliste = useMemo(
    () => (isEditing ? draftPreisliste : preisliste),
    [draftPreisliste, isEditing, preisliste]
  );

  const handleDamenPriceChange = (index: number, field: "kurz" | "mittel" | "lang", value: string) => {
    setDraftPreisliste((current) => ({
      ...current,
      damen: current.damen.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const handleHerrenPriceChange = (index: number, value: string) => {
    setDraftPreisliste((current) => ({
      ...current,
      herren: current.herren.map((item, itemIndex) => (
        itemIndex === index ? { ...item, preis: value } : item
      )),
    }));
  };

  const startEditing = () => {
    setDraftPreisliste(preisliste);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftPreisliste(preisliste);
    setIsEditing(false);
  };

  const savePreisliste = async () => {
    setIsSaving(true);

    const { error } = await appSettingsClient.from("app_settings").upsert(
      {
        key: "public_price_list",
        value: JSON.stringify(draftPreisliste),
      },
      { onConflict: "key" }
    );

    setIsSaving(false);

    if (error) {
      toast({
        title: "Fehler",
        description: "Preisliste konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      return;
    }

    setPreisliste(draftPreisliste);
    setIsEditing(false);
    toast({
      title: "Gespeichert",
      description: "Die Preise wurden aktualisiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen py-16">
        <div className="container mx-auto flex max-w-4xl items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-center md:text-left text-foreground">Unsere Preisliste</h1>
          {isAdmin && (
            <div className="flex items-center justify-center gap-2 md:justify-end">
              {!isEditing ? (
                <Button onClick={startEditing} variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={cancelEditing} variant="outline" disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                  <Button onClick={savePreisliste} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Speichern
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-4">Damen</h2>
          <div className="mb-6 text-base text-foreground">
            Individuelle Damenhaarschnitte, moderne Farbtechniken und Styling in Münster-Hiltrup.<br />
            Ob Schnitt, Farbe, Balayage oder Dauerwelle - wir beraten Sie persönlich und typgerecht.<br />
            Ihr Damenfriseur für natürliche und ausdrucksstarke Ergebnisse.
          </div>
          <Table className="rounded-xl border border-border bg-card text-sm md:text-base">
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="py-3 text-left">Leistung</TableHead>
                <TableHead className="py-3 text-right whitespace-nowrap">Kurz</TableHead>
                <TableHead className="py-3 text-right whitespace-nowrap">Mittel</TableHead>
                <TableHead className="py-3 text-right whitespace-nowrap">Lang</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePreisliste.damen.map((item, index) => (
                <TableRow key={item.leistung}>
                  <TableCell className="py-2 text-foreground">{item.leistung}</TableCell>
                  <TableCell className="py-2 text-right text-primary font-semibold">
                    {isEditing ? (
                      <Input
                        value={draftPreisliste.damen[index]?.kurz || ""}
                        onChange={(event) => handleDamenPriceChange(index, "kurz", event.target.value)}
                        className="ml-auto h-9 max-w-[110px] text-right"
                        aria-label={`${item.leistung} kurz`}
                      />
                    ) : (
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.kurz)}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-right text-primary font-semibold">
                    {isEditing ? (
                      <Input
                        value={draftPreisliste.damen[index]?.mittel || ""}
                        onChange={(event) => handleDamenPriceChange(index, "mittel", event.target.value)}
                        className="ml-auto h-9 max-w-[110px] text-right"
                        aria-label={`${item.leistung} mittel`}
                      />
                    ) : (
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.mittel)}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-right text-primary font-semibold">
                    {isEditing ? (
                      <Input
                        value={draftPreisliste.damen[index]?.lang || ""}
                        onChange={(event) => handleDamenPriceChange(index, "lang", event.target.value)}
                        className="ml-auto h-9 max-w-[110px] text-right"
                        aria-label={`${item.leistung} lang`}
                      />
                    ) : (
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.lang)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-4">Herren</h2>
          <div className="mb-6 text-base text-foreground">
            Professionelle Herrenhaarschnitte, Bartpflege und Styling in Münster-Hiltrup.<br />
            Von klassischen Schnitten bis zu modernen Fades und Maschinenhaarschnitten - präzise, sauber und typgerecht.<br />
            Ihr Herrenfriseur & Barbier für ein gepflegtes und selbstbewusstes Auftreten.
          </div>
          <Table className="rounded-xl border border-border bg-card text-sm md:text-base">
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="py-3 text-left">Service</TableHead>
                <TableHead className="py-3 text-right whitespace-nowrap">Preis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePreisliste.herren.map((item, index) => (
                <TableRow key={item.service}>
                  <TableCell className="py-2 text-foreground">{item.service}</TableCell>
                  <TableCell className="py-2 text-right text-primary font-semibold">
                    {isEditing ? (
                      <Input
                        value={draftPreisliste.herren[index]?.preis || ""}
                        onChange={(event) => handleHerrenPriceChange(index, event.target.value)}
                        className="ml-auto h-9 max-w-[110px] text-right"
                        aria-label={`${item.service} preis`}
                      />
                    ) : (
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.preis)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <div className="text-center mt-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button asChild variant="silver" size="xl">
              <Link to="/booking">Termin buchen</Link>
            </Button>
            <Button asChild variant="silverOutline" size="xl">
              {/* <Link to="/eroeffnungsangebote">Eroffnungsangebote</Link> */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
