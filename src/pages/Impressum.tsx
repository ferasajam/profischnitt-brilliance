import { Link } from "react-router-dom";

export default function Impressum() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Impressum</h1>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-foreground font-medium">Diva Haarstudio</p>
            <p className="text-muted-foreground">Gewerbebetrieb (Einzelunternehmen)</p>
            <p className="text-muted-foreground">Inhaber: Ahmad Kanbour</p>
            <p className="text-muted-foreground">Zum Erlenbusch 13, 48167 Münster, Deutschland</p>
            <p className="text-muted-foreground">Telefon: +49 (0) 251 61082</p>
            <p className="text-muted-foreground">E-Mail: info@diva-haarstudio.de</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Angaben gemäß § 18 Abs. 2 MStV</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-foreground font-medium">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
            <p className="text-muted-foreground">Ahmad Kanbour</p>
            <p className="text-muted-foreground">Zum Erlenbusch 13, 48167 Münster, Deutschland</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Haftung für Inhalte</h2>
          <p className="text-muted-foreground">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="text-muted-foreground">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
            Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
            Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Haftung für Links</h2>
          <p className="text-muted-foreground">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich.
          </p>
          <p className="text-muted-foreground">
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
            Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
            Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Urheberrecht</h2>
          <p className="text-muted-foreground">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
          <p className="text-muted-foreground">
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
            Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Streitbeilegung / Verbraucherschlichtung</h2>
          <p className="text-muted-foreground">
            Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
          <p className="text-muted-foreground">
            Hinweis: Die Europäische Online-Streitbeilegungsplattform (OS/ODR) wurde zum 20.07.2025 eingestellt.
          </p>
        </section>
      </div>
    </div>
  );
}
