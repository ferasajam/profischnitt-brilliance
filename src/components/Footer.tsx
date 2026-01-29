import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Music2, Phone, Mail, MapPin, Facebook } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            {/* Logo + Motto */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/res/Logo.png"
                alt="Diva Haarstudio Logo"
                className="w-32 sm:w-40 h-20 sm:h-24 object-contain shrink-0"
              />

              {/* MOTTO */}
              <div className="flex flex-col justify-center min-w-0 mt-2 sm:mt-0">
                {/* MOBILE */}
                <span
                  className="sm:hidden text-base text-muted-foreground leading-tight"
                  style={{
                    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                    letterSpacing: "0.03em",
                  }}
                >
                  Dein Haar<br />deine Krone 👑
                </span>

                {/* DESKTOP */}
                <div className="hidden sm:flex flex-col border-l border-border/60 pl-3">
                  <span
                    className="text-xl text-muted-foreground"
                    style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Dein Haar
                  </span>
                  <span
                    className="text-2xl text-primary min-w-[320px] break-words"
                    style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                      letterSpacing: "0.05em",
                    }}
                  >
                    deine Krone 👑
                  </span>
                </div>
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
              >
                <Instagram className="w-5 h-5 text-primary" />
              </motion.a>

              <motion.a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <Music2 className="w-5 h-5 text-primary" />
              </motion.a>

              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <Facebook className="w-5 h-5 text-primary" />
              </motion.a>
            </div>
          </div>

          {/* Rest unverändert */}
          {/* Quick Links / Kontakt / Öffnungszeiten */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Diva Haarstudio. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary">Datenschutz</Link>
              <Link to="/terms" className="hover:text-primary">Impressum</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
