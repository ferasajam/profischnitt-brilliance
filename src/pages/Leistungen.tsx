
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function parsePreis(preis) {
  // Extrahiere die Zahl aus dem Preisstring, z.B. "ab 45 €" -> 45, "17 €" -> 17
  if (!preis) return 0;
  const match = preis.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function formatPrice(value?: string) {
  if (!value) return "—";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  // Keep currency symbol attached to the number on mobile (no "10\n€")
  return normalized.replace(/\s*€$/, "\u00A0€");
}

const herrenPreise = [
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
];

const damenPreise = [
  { leistung: "Schneiden", kurz: "28 €", mittel: "38 €", lang: "45 €" },
  { leistung: "Stylen", kurz: "25 €", mittel: "30 €", lang: "35 €" },
  { leistung: "Waschen, Schneiden, Föhnen", kurz: "44 €", mittel: "51 €", lang: "59 €" },
  { leistung: "Mädchen Haarschnitt bis 10 Jahre", kurz: "15 €" },
  { leistung: "Ansatz Farbe 2cm(30ml+vol)", kurz: "ab 35 €" },
  { leistung: "Komplettfärben", kurz: "50 €", mittel: "60 €", lang: "ab 70 €" },
  { leistung: "KomplettTönung", kurz: "39 €", mittel: "49 €", lang: "ab 59 €" },
  { leistung: "Foliesträhnen", kurz: "60 €", mittel: "80 €", lang: "ab 100 €" },
  { leistung: "Balayage", kurz: "ab 150 €"},
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
];



export default function Leistungen() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-10 text-foreground">Unsere Preisliste</h1>
        {/* Damenpreise zuerst */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-4">Damen</h2>
          <div className="mb-6 text-base text-foreground">
            Individuelle Damenhaarschnitte, moderne Farbtechniken und Styling in Münster-Hiltrup.<br />
            Ob Schnitt, Farbe, Balayage oder Dauerwelle – wir beraten Sie persönlich und typgerecht.<br />
            Ihr Damenfriseur für natürliche und ausdrucksstarke Ergebnisse.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-xl border border-border text-sm md:text-base">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-3 px-4 text-left">Leistung</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Kurz</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Mittel</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Lang</th>
                </tr>
              </thead>
              <tbody>
                {damenPreise.map((item) => (
                  <tr key={item.leistung} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 text-foreground">{item.leistung}</td>
                    <td className="py-2 px-4 text-right text-primary font-semibold">
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.kurz)}</span>
                    </td>
                    <td className="py-2 px-4 text-right text-primary font-semibold">
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.mittel)}</span>
                    </td>
                    <td className="py-2 px-4 text-right text-primary font-semibold">
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.lang)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        {/* Herrenpreise danach */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-4">Herren</h2>
          <div className="mb-6 text-base text-foreground">
            Professionelle Herrenhaarschnitte, Bartpflege und Styling in Münster-Hiltrup.<br />
            Von klassischen Schnitten bis zu modernen Fades und Maschinenhaarschnitten – präzise, sauber und typgerecht.<br />
            Ihr Herrenfriseur & Barbier für ein gepflegtes und selbstbewusstes Auftreten.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-xl border border-border text-sm md:text-base">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Preis</th>
                </tr>
              </thead>
              <tbody>
                {herrenPreise.map((item) => (
                  <tr key={item.service} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 text-foreground">{item.service}</td>
                    <td className="py-2 px-4 text-right text-primary font-semibold">
                      <span className="whitespace-nowrap tabular-nums">{formatPrice(item.preis)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Angebote section removed as requested */}
        <div className="text-center mt-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button asChild variant="silver" size="xl">
              <Link to="/booking">Termin buchen</Link>
            </Button>
            <Button asChild variant="silverOutline" size="xl">
              <Link to="/eroeffnungsangebote">Eröffnungsangebote</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
