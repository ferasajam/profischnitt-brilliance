
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const herrenPreise = [
  { service: "Maschine Schnitt", preis: "17 €" },
  { service: "Schneiden", preis: "21 €" },
  { service: "Bart", preis: "13 €" },
  { service: "Haar und Bart", preis: "29 €" },
  { service: "Kinder bis 9 Jahre", preis: "14 €" },
  { service: "Jungs bis 18", preis: "17 €" },
  { service: "Gesichtswaxing", preis: "10 €" },
  { service: "Gesichtsreinigung", preis: "10 €" },
];

const angebote = [
  { angebot: "10 Folien-Highlights + Haarschnitt", preis: "60 €" },
  { angebot: "Ansatzfarbe + Haarschnitt (Waschen + Schneiden + Föhnen)", preis: "60 €" },
  { angebot: "Haarschnitt intensiv", preis: "ab 35 €" },
  { angebot: "Premium-Protein & Collagen Treatment", preis: "ab 200 €" },
  { angebot: "Haarverlängerung (für traumhaft langes Haar)", preis: "ab 250 €" },
  { angebot: "Pflege mask + kopfmassage", preis: "15 €" },
];

const damenPreise = [
  { leistung: "Schnitt + Styling", kurz: "35 €", mittel: "40 €", lang: "45 €" },
  { leistung: "Styling", kurz: "20 €", mittel: "25 €", lang: "ab 30 €" },
  { leistung: "Farbe", kurz: "40 €", mittel: "50 €", lang: "ab 60 €" },
  { leistung: "Strähnen + Glösing", kurz: "70 €", mittel: "80 €", lang: "ab 90 €" },
  { leistung: "Balayage", kurz: "80 €", mittel: "90 €", lang: "ab 100 €" },
  { leistung: "Dauerwelle", kurz: "50 €", mittel: "75 €", lang: "ab 100 €" },
];

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
