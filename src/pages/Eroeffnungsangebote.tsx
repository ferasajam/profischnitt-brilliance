
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function formatPrice(value?: string) {
  if (!value) return "—";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized.replace(/\s*€$/, "\u00A0€");
}

const eroeffnungsangebote = [
  {
    nr: "1.",
    angebot: "10 Folien Highlights für kurze Haare + Haarschnitt",
    preis: "60 €",
  },
  {
    nr: "2.",
    angebot: "Ansatzfarbe für kurze Haare + Haarschnitt",
    preis: "60 €",
  },
  {
    nr: "3.",
    angebot: "Waschen + Schneiden föhnen",
    preis: "ab 35 €",
  },
  {
    nr: "4.",
    angebot: "Haarglättung mit Protein für traumhaft langes Haar",
    preis: "ab 200 €",
  },
  {
    nr: "5.",
    angebot: "Haarverlängerung für traumhaft langes Haar",
    preis: "ab 250 €",
  },
];

const herrenAngebote = [
  { nr: "1.", service: "Maschinenschnitt", preis: "17 €" },
  { nr: "2.", service: "Haarschnitt", preis: "21 €" },
  { nr: "3.", service: "Haar und Bart", preis: "29 €" },
  { nr: "4.", service: "Bart", preis: "13 €" },
  { nr: "5.", service: "Kinder bis 9 Jahre", preis: "14 €" },
];


const Eroeffnungsangebote = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-8 text-foreground">Unsere Eröffnungsangebote</h1>
        <h2 className="text-2xl font-semibold text-primary mb-4 mt-2">Angebote für Damen</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full bg-card rounded-xl border border-border text-sm md:text-base">
            <thead>
              <tr className="bg-secondary/50">
                <th className="py-3 px-4 text-left">Nr.</th>
                <th className="py-3 px-4 text-left">Angebot</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Preis</th>
              </tr>
            </thead>
            <tbody>
              {eroeffnungsangebote.map((item) => (
                <tr key={item.nr} className="border-b border-border last:border-0">
                  <td className="py-2 px-4 text-foreground font-semibold">{item.nr}</td>
                  <td className="py-2 px-4 text-foreground">{item.angebot}</td>
                  <td className="py-2 px-4 text-right text-primary font-semibold">
                    <span className="whitespace-nowrap tabular-nums">{formatPrice(item.preis)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="text-2xl font-semibold text-primary mb-4 mt-8">Angebote für Herren</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full bg-card rounded-xl border border-border text-sm md:text-base">
            <thead>
              <tr className="bg-secondary/50">
                <th className="py-3 px-4 text-left">Nr.</th>
                <th className="py-3 px-4 text-left">Service</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Preis</th>
              </tr>
            </thead>
            <tbody>
              {herrenAngebote.map((item) => (
                <tr key={item.service} className="border-b border-border last:border-0">
                  <td className="py-2 px-4 text-foreground font-semibold">{item.nr}</td>
                  <td className="py-2 px-4 text-foreground">{item.service}</td>
                  <td className="py-2 px-4 text-right text-primary font-semibold">
                    <span className="whitespace-nowrap tabular-nums">{formatPrice(item.preis)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-secondary/10 rounded-xl p-4 text-center text-lg font-bold text-primary mb-4 flex items-center justify-center gap-2">
          <span className="inline-block bg-gradient-to-r from-gold to-yellow-300 text-gold px-3 py-1 rounded-full mr-2">5€ GESCHENK</span>
          <span>bei jedem Herrenhaarschnitt</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
          <Button asChild size="xl">
            <Link to="/booking">Termin buchen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Eroeffnungsangebote;
