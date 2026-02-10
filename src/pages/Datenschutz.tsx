import { Link } from "react-router-dom";

export default function Datenschutz() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
          Datenschutzerklärung
        </h1>
        <p className="text-muted-foreground mb-10">
          Wir freuen uns über Ihr Interesse an unserer Website. Der Schutz Ihrer personenbezogenen
          Daten ist uns wichtig. Nachfolgend informieren wir Sie gemäß der Datenschutz-Grundverordnung
          (DSGVO) darüber, welche Daten wir verarbeiten, zu welchen Zwecken und welche Rechte Sie haben.
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">1. Verantwortlicher</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-foreground font-medium">Diva Haarstudio (Einzelunternehmen)</p>
            <p className="text-muted-foreground">Inhaber: Ahmad Kanbour</p>
            <p className="text-muted-foreground">Zum Erlenbusch 13, 48167 Münster, Deutschland</p>
            <p className="text-muted-foreground">Telefon: +49 (0) 251 61082</p>
            <p className="text-muted-foreground">E-Mail: info@diva-haarstudio.de</p>
            <p className="text-muted-foreground">Website: https://diva-haarstudio.de/</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
          <p className="text-muted-foreground">
            Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können
            (z.B. Name, E-Mail-Adresse, Telefonnummer, IP-Adresse). Wir verarbeiten personenbezogene
            Daten nur, soweit dies zur Bereitstellung dieser Website sowie zur Erbringung unserer Leistungen
            erforderlich ist oder Sie in die Verarbeitung eingewilligt haben.
          </p>
          <p className="text-muted-foreground">
            Diese Website richtet sich an Kundinnen und Kunden in Deutschland. Eine automatisierte
            Entscheidungsfindung oder Profiling findet nicht statt.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">3. Hosting</h2>
          <p className="text-muted-foreground">
            Unsere Website wird bei einem Hosting-Dienstleister in Deutschland oder der Europäischen Union betrieben.
            Der Hosting-Anbieter verarbeitet in unserem Auftrag Zugriffsdaten (z.B. IP-Adresse, Zeitpunkt des Abrufs,
            angeforderte Seite), um die Website auszuliefern und die Sicherheit sowie Stabilität zu gewährleisten.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">4. Zugriffsdaten / Server-Logfiles</h2>
          <p className="text-muted-foreground">
            Beim Aufruf unserer Website erheben wir bzw. unser Hosting-Dienstleister automatisiert Informationen
            in sogenannten Server-Logfiles. Dies sind insbesondere:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>IP-Adresse (ggf. in gekürzter Form, abhängig vom Hosting-Setup)</li>
            <li>Datum und Uhrzeit der Anfrage</li>
            <li>aufgerufene Seite/Datei</li>
            <li>übertragene Datenmenge</li>
            <li>Referrer-URL</li>
            <li>Browsertyp/-version, Betriebssystem</li>
          </ul>
          <p className="text-muted-foreground">
            Die Verarbeitung erfolgt zur technischen Bereitstellung, Fehleranalyse sowie zur Abwehr von Angriffsversuchen.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">5. Kontaktaufnahme (E-Mail, Telefon, Kontaktformular)</h2>
          <p className="text-muted-foreground">
            Wenn Sie uns kontaktieren (z.B. per E-Mail, Telefon oder über ein Kontaktformular), verarbeiten wir die von Ihnen
            übermittelten Daten (z.B. Name, E-Mail-Adresse, Telefonnummer, Inhalt der Nachricht), um Ihre Anfrage zu bearbeiten.
          </p>
          <p className="text-muted-foreground">
            Pflichtangaben ergeben sich aus dem jeweiligen Formular bzw. der notwendigen Kommunikation. Ohne diese Angaben können
            wir Ihre Anfrage ggf. nicht beantworten.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">6. Online-Terminbuchung</h2>
          <p className="text-muted-foreground">
            Auf unserer Website können Sie Termine online anfragen bzw. buchen. Dabei verarbeiten wir insbesondere folgende Daten:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Name</li>
            <li>E-Mail-Adresse</li>
            <li>Telefonnummer (falls angegeben)</li>
            <li>gebuchte Leistung, gewünschter Stylist, Datum/Uhrzeit</li>
          </ul>
          <p className="text-muted-foreground">
            Zweck der Verarbeitung ist die Terminverwaltung, Kommunikation mit Ihnen sowie die Durchführung vorvertraglicher Maßnahmen
            und die Erfüllung des Behandlungs-/Dienstleistungsvertrags.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">7. Benutzerkonto, Profil & Bonus-/Treueprogramm</h2>
          <p className="text-muted-foreground">
            Sie können ein Benutzerkonto anlegen. Dabei verarbeiten wir die für Registrierung und Login erforderlichen Daten
            (insbesondere E-Mail-Adresse und Passwort) sowie ggf. freiwillige Profilangaben (z.B. Vor- und Nachname).
            Wenn Sie an unserem Bonus-/Treueprogramm teilnehmen, verarbeiten wir zudem Informationen über Ihren Punktestand.
          </p>
          <p className="text-muted-foreground">
            Die Verarbeitung erfolgt zur Kontoverwaltung, zur Bereitstellung geschützter Bereiche (z.B. Profil) und zur Abwicklung
            des Treueprogramms.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">8. Bewertungen / Feedback</h2>
          <p className="text-muted-foreground">
            Sofern wir Ihnen einen Feedback-Link bereitstellen, können Sie eine Bewertung abgeben. Dabei verarbeiten wir Ihre Bewertung
            (z.B. Sternebewertung), ggf. einen Kommentar sowie eine Angabe, ob die Bewertung anonym erfolgen soll.
            Feedback-Links können aus Sicherheitsgründen als einmalig nutzbare Links ausgestaltet sein.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">9. Versand von E-Mails (Terminbestätigungen, Erinnerungen, Feedback)</h2>
          <p className="text-muted-foreground">
            Für die Zustellung bestimmter E-Mails (z.B. Terminbestätigungen, Erinnerungen oder Feedback-E-Mails) nutzen wir einen
            Versanddienstleister. Dabei werden insbesondere Ihre E-Mail-Adresse, Ihr Name sowie Termin-/Serviceinformationen an den
            Dienstleister übermittelt, damit die E-Mail zugestellt werden kann.
          </p>
          <p className="text-muted-foreground">
            Der Versand erfolgt ausschließlich zweckgebunden. Wir verwenden diese Daten nicht für eigenständige Werbung außerhalb der
            hierfür vorgesehenen Einwilligungen.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">10. Newsletter</h2>
          <p className="text-muted-foreground">
            Wenn Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse (und ggf. Ihren Namen) zur Zusendung.
            Die Anmeldung erfolgt im Double-Opt-In-Verfahren: Sie erhalten nach der Anmeldung eine E-Mail, in der Sie die Anmeldung
            bestätigen müssen. Erst danach wird die Adresse für den Newsletterversand freigeschaltet.
          </p>
          <p className="text-muted-foreground">
            Sie können den Newsletter jederzeit abbestellen (Widerruf der Einwilligung), z.B. über den Abmeldelink in jeder
            Newsletter-E-Mail oder durch Nachricht an info@diva-haarstudio.de.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">11. Einbindung von Google Maps (Kartenanzeige)</h2>
          <p className="text-muted-foreground">
            Auf unserer Website kann Google Maps eingebunden sein, um unseren Standort anzuzeigen. Aus Datenschutzgründen wird die Karte
            erst nach Ihrer aktiven Bestätigung („Karte laden“) geladen. Erst dann wird eine Verbindung zu Servern von Google hergestellt.
            Dabei können insbesondere Ihre IP-Adresse und ggf. weitere technische Informationen verarbeitet werden.
          </p>
          <p className="text-muted-foreground">
            Weitere Informationen finden Sie in den Datenschutzhinweisen von Google.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">12. Social Media Links (Instagram, TikTok, Facebook, WhatsApp)</h2>
          <p className="text-muted-foreground">
            Auf unserer Website verlinken wir auf unsere Profile bei sozialen Netzwerken. Es handelt sich um reine Links.
            Beim bloßen Besuch unserer Website werden keine Daten automatisch an diese Anbieter übertragen. Erst wenn Sie den Link anklicken,
            werden Sie zum jeweiligen Anbieter weitergeleitet.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">13. Cookies, Local Storage & ähnliche Technologien</h2>
          <p className="text-muted-foreground">
            Wir setzen technisch notwendige Speichertechnologien ein, um die Website sicher und nutzbar bereitzustellen.
            Dazu gehören insbesondere:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Local Storage für Sitzungs-/Login-Funktionen (z.B. Benutzerkonto)</li>
            <li>ein technisches Cookie zur Speicherung von UI-Einstellungen (z.B. Sidebar-Zustand)</li>
            <li>Local Storage zur Unterdrückung eines Hinweis-/Marketing-Popups nach Ihrer Entscheidung</li>
          </ul>
          <p className="text-muted-foreground">
            Diese Speicherungen sind für die Bereitstellung der Funktionen erforderlich und dienen nicht der Erstellung von Nutzerprofilen.
          </p>
          <p className="text-muted-foreground">
            Sofern Sie „Alle akzeptieren“ wählen, können optionale Inhalte (z.B. eingebettete Karten) ohne zusätzliche Bestätigung geladen werden.
            Sie können Ihre Auswahl jederzeit über den Link „Cookies“ im Footer erneut aufrufen und ändern.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">14. Rechtsgrundlagen (Art. 6 DSGVO)</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Einwilligung: Art. 6 Abs. 1 lit. a DSGVO (z.B. Newsletter, optionales Laden externer Inhalte)</li>
            <li>Vertrag / vorvertragliche Maßnahmen: Art. 6 Abs. 1 lit. b DSGVO (z.B. Terminbuchung, Kundenkonto)</li>
            <li>Rechtliche Verpflichtung: Art. 6 Abs. 1 lit. c DSGVO (z.B. Aufbewahrungspflichten)</li>
            <li>Berechtigte Interessen: Art. 6 Abs. 1 lit. f DSGVO (z.B. IT-Sicherheit, Missbrauchs-/Betrugsprävention, Stabilität)</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">15. Speicherdauer</h2>
          <p className="text-muted-foreground">
            Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist. Darüber hinaus speichern
            wir Daten nur, soweit gesetzliche Aufbewahrungspflichten bestehen (z.B. handels- und steuerrechtliche Pflichten). Danach werden
            die Daten gelöscht oder anonymisiert.
          </p>
          <p className="text-muted-foreground">
            Server-Logfiles werden in der Regel für einen begrenzten Zeitraum gespeichert und anschließend automatisch gelöscht,
            sofern keine sicherheitsrelevante Auswertung erforderlich ist.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">16. Weitergabe von Daten</h2>
          <p className="text-muted-foreground">
            Wir geben personenbezogene Daten nur weiter, wenn dies zur Vertragserfüllung erforderlich ist, Sie eingewilligt haben,
            eine rechtliche Verpflichtung besteht oder wir berechtigte Interessen an der Weitergabe haben.
            Empfänger können insbesondere Hosting- und IT-Dienstleister, Backend-Dienstleister sowie E-Mail-Versanddienstleister sein.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">17. Betroffenenrechte (Art. 15–21 DSGVO)</h2>
          <p className="text-muted-foreground">
            Sie haben jederzeit folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="text-muted-foreground">
            Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an info@diva-haarstudio.de.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">18. Widerrufsrecht (bei Einwilligungen)</h2>
          <p className="text-muted-foreground">
            Sofern eine Verarbeitung auf Ihrer Einwilligung beruht, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.
            Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">19. Beschwerderecht bei einer Aufsichtsbehörde (NRW)</h2>
          <p className="text-muted-foreground">
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig in Nordrhein-Westfalen ist insbesondere:
          </p>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-foreground font-medium">Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)</p>
            <p className="text-muted-foreground">Kavalleriestraße 2–4, 40213 Düsseldorf</p>
            <p className="text-muted-foreground">Telefon: +49 (0) 211 38424-0</p>
            <p className="text-muted-foreground">E-Mail: poststelle@ldi.nrw.de</p>
            <p className="text-muted-foreground">Website: https://www.ldi.nrw.de/</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">20. SSL-/TLS-Verschlüsselung</h2>
          <p className="text-muted-foreground">
            Diese Website nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://“
            und dem Schloss-Symbol in der Adresszeile Ihres Browsers.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold text-foreground">21. Stand der Datenschutzerklärung</h2>
          <p className="text-muted-foreground">Stand: 09.02.2026</p>
        </section>
      </div>
    </div>
  );
}
