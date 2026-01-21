import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors, Instagram, Music2, Phone, Mail, MapPin } from "lucide-react";
import { Facebook } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-full border border-primary/50">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold tracking-wide text-foreground">
                  Diva 
                </span>
                <span className="text-[10px] tracking-[0.3em] text-primary">
                  Haarstudio
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium Hairstyling für Damen und Herren. Wo Handwerkskunst auf Präzision trifft.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
                aria-label="TikTok"
              >
                <Music2 className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-primary" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Schnellzugriff</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Startseite" },
                { href: "/team", label: "Unser Team" },
                { href: "/leistungen", label: "Leistungen" },
                ].map((link) => ( 
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
                <li>
                  <Link to="/eroeffnungsangebote" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Eröffnungsangebote
                  </Link>
                </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Kontakt</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:025161082"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  02516 1082
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@diva-haarstudio.de"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  info@diva-haarstudio.de
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Zum Erlenbusch 13<br />
                    48167 Münster, Deutschland
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Öffnungszeiten</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-muted-foreground">
                <span>Montag - Freitag</span>
                <span className="text-foreground">09:00 - 19:00</span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>Samstag</span>
                <span className="text-foreground">09:00 - 19:00</span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>Sonntag</span>
                <span className="text-foreground">Geschlossen</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Diva Haarstudio. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Datenschutz
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Impressum
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
