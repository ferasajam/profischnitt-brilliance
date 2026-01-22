
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function parsePreis(preis) {
  // Extrahiere die Zahl aus dem Preisstring, z.B. "ab 45 €" -> 45, "17 €" -> 17
  if (!preis) return 0;
  const match = preis.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const herrenPreise = [
  { service: "Dauerwelle", preis: "ab 45 €" },
  { service: "Haubensträhnen", preis: "ab 30 €" },
  { service: "Färben", preis: "ab 30 €" },
  { service: "Haar und Bart", preis: "29 €" },
  { service: "Schneiden", preis: "21 €" },
  { service: "Maschine Schnitt", preis: "17 €" },
  { service: "Jungs bis 18", preis: "17 €" },
  { service: "Kinder bis 9 Jahre", preis: "14 €" },
  { service: "Bart", preis: "13 €" },
  { service: "Gesichtswaxing", preis: "10 €" },
  { service: "Gesichtsreinigung", preis: "10 €" },
  { service: "Augenbrauen zupfen", preis: "8 €" },
].sort((a, b) => parsePreis(a.preis) - parsePreis(b.preis));

const angebote = [
  { angebot: "10 Folien-Highlights + Haarschnitt", preis: "60 €" },
  { angebot: "Ansatzfarbe + Haarschnitt (Waschen + Schneiden + Föhnen)", preis: "60 €" },
  { angebot: "Haarschnitt intensiv", preis: "ab 35 €" },
  { angebot: "Premium-Protein & Collagen Treatment", preis: "ab 200 €" },
  { angebot: "Haarverlängerung (für traumhaft langes Haar)", preis: "ab 250 €" },
  { angebot: "Pflege mask + kopfmassage", preis: "15 €" },
];

const damenPreise = [
  { leistung: "Waschen, Schneiden, Föhnen", kurz: "44 €", mittel: "51 €", lang: "59 €" },
  { leistung: "Ansatz Farbe", kurz: "35 €", mittel: "45 €", lang: "ab 55 €" },
  { leistung: "Komplett Färben", kurz: "50 €", mittel: "60 €", lang: "ab 70 €" },
  { leistung: "Folie Strähnen", kurz: "56 €", mittel: "62 €", lang: "ab 71 €" },
  { leistung: "Komplett Tönung", kurz: "39 €", mittel: "49 €", lang: "ab 60 €" },
  { leistung: "Glossing", kurz: "31 €", mittel: "38 €", lang: "44 €" },
  { leistung: "Dauerwelle", kurz: "50 €", mittel: "75 €", lang: "ab 90 €" },
  // Ergänzungen explizit wie gewünscht
  { leistung: "Ansatz Farbe", kurz: "35 €", mittel: "45 €", lang: "ab 55 €" },
  { leistung: "Komplett Färben", kurz: "50 €", mittel: "60 €", lang: "ab 70 €" },
].sort((a, b) => {
  // Sortiere nach dem niedrigsten Preis (kurz < mittel < lang)
  const preisA = Math.min(parsePreis(a.kurz), parsePreis(a.mittel), parsePreis(a.lang));
  const preisB = Math.min(parsePreis(b.kurz), parsePreis(b.mittel), parsePreis(b.lang));
  return preisA - preisB;
});

const damenEinzelpreise = [
  { leistung: "Ombré Technique", preis: "ab 100 €" },
  { leistung: "Airtouch Technic",preis: "ab 120 €" },
  { leistung: "Balayage", preis: "ab 90 €" },
  { leistung: "Highlights", preis: "ab 50 €" },
  { leistung: "Waschen", preis: "5 €" },
  { leistung: "Pflege Maske mit Kopfmassage", preis: "15 €" },
  { leistung: "Olaplex Pflege", preis: "25 €" },
  { leistung: "Hochsteck Frisur", preis: "ab 80 €" },
  { leistung: "Haar Glättung", preis: "ab 300 €" },
  { leistung: "Haar Verlängerung", preis: "ab 300 €" },
  { leistung: "Augenbrauen zupfen", preis: "10 €" },
  { leistung: "Augenbrauen färben", preis: "10 €" },
  { leistung: "Wimpernfärben", preis: "13 €" },
  { leistung: "Mädchen Haarschnitt bis 10 Jahre", preis: "ab 19 €" },
].sort((a, b) => parsePreis(a.preis) - parsePreis(b.preis));


export default function Leistungen() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-10 text-foreground">Unsere Preisliste</h1>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">Herren</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card rounded-xl border border-border">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Preis</th>
                </tr>
              </thead>
              <tbody>
                {herrenPreise.map((item) => (
                  <tr key={item.service} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 text-foreground">{item.service}</td>
                    <td className="py-2 px-4 text-primary font-semibold">{item.preis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* ...existing code... */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">Damen</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card rounded-xl border border-border">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-3 px-4 text-left">Leistung</th>
                  <th className="py-3 px-4 text-left">Kurz</th>
                  <th className="py-3 px-4 text-left">Mittel</th>
                  <th className="py-3 px-4 text-left">Lang</th>
                </tr>
              </thead>
              <tbody>
                {damenPreise.map((item) => (
                  <tr key={item.leistung} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 text-foreground">{item.leistung}</td>
                    <td className="py-2 px-4 text-primary font-semibold">{item.kurz}</td>
                    <td className="py-2 px-4 text-primary font-semibold">{item.mittel}</td>
                    <td className="py-2 px-4 text-primary font-semibold">{item.lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Einzelpreise Damen */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">Einzelpreise Damen</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card rounded-xl border border-border">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="py-3 px-4 text-left">Leistung</th>
                  <th className="py-3 px-4 text-left">Preis</th>
                </tr>
              </thead>
              <tbody>
                {damenEinzelpreise.map((item) => (
                  <tr key={item.leistung} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 text-foreground">{item.leistung}</td>
                    <td className="py-2 px-4 text-primary font-semibold">{item.preis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Angebote section removed as requested */}
        <div className="text-center mt-10">
          <div className="flex flex-col items-center gap-4">
            <Button asChild variant="gold" size="lg">
              <Link to="/eroeffnungsangebote">Eröffnungsangebote</Link>
            </Button>
            <Button asChild variant="gold" size="xl">
              <Link to="/booking">Termin buchen</Link>
            </Button>
           
          </div>
        </div>
      </div>
    </div>
  );
}
