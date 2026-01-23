import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Scissors, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Music2,
  Sparkles,
  User,
  Users,
  Facebook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-salon.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const services = [
  {
    icon: User,
    title: "Herrenhaarschnitt",
    description: "Präzise Schnitte und klassische Styles, perfekt auf Ihre Gesichtszüge abgestimmt",
    price: "Ab 21€",
  },
  {
    icon: Users,
    title: "Damenhaarschnitt",
    description: "Elegante Schnitte und Styling für jeden Anlass",
    price: "Ab 35€",
  },
  {
    icon: Scissors,
    title: "Bartpflege",
    description: "Professionelle Bartformung, Trimmen und Heißtuchbehandlungen",
    price: "Ab 13€",
  },
  {
    icon: Sparkles,
    title: "Dauerwelle & Styling",
    description: "Moderne Wave-Techniken und fortgeschrittene Styling-Services",
    price: "Ab 50€",
  },
];

const openingHours = [
  { day: "Montag - Freitag", hours: "09:00 - 19:00" },
  { day: "Samstag", hours: "09:00 - 19:00" },
  { day: "Sonntag", hours: "Geschlossen" },
];

const Index = () => {
  const [threshold, setThreshold] = useState<number>(10);

  useEffect(() => {
    (async () => {
      type UnknownBuilder = { select: (q: string) => UnknownBuilder; eq: (c: string, v: unknown) => UnknownBuilder; maybeSingle: () => Promise<unknown> };
      const builder = (supabase as unknown as { from: (t: string) => UnknownBuilder }).from('app_settings');
      const res = await builder.select('value').eq('key','loyalty_threshold').maybeSingle() as { data?: { value?: string } };
      const v = Number(res?.data?.value);
      setThreshold(Number.isFinite(v) && v > 0 ? v : 10);
    })();
  }, []);
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Diva Haarstudio Salon Interieur"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-radial-gold" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
                Premium Hairstyling in Münster
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="mb-6"
            >
              <img
                src="/res/Logo.png"
                alt="Diva Haarstudio Logo"
                className="max-w-[320px] md:max-w-[420px] w-[80vw] md:w-full h-auto ml-0 md:mx-0"
                style={{ display: 'block' }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl"
            >
              Wo Handwerkskunst auf Präzision trifft. Erleben Sie premium 
              Hairstyling für Damen und Herren in einer Atmosphäre purer Eleganz.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild variant="silver" size="xl">
                <Link to="/booking">Termin buchen</Link>
              </Button>
              <Button asChild variant="silverOutline" size="xl">
                <Link to="/team">Unser Team</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Banner for Loyalty */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center md:text-left text-sm md:text-base text-foreground">
              Jetzt registrieren und nach <span className="font-semibold text-primary">{threshold}</span> Punkten einen <span className="text-silver-gradient">Gratis-Haarschnitt</span> erhalten.
            </p>
            <Button asChild variant="silver">
              <Link to="/auth?tab=register">Jetzt registrieren</Link>
            </Button>
          </div>
        </div>
        {/* Laufender Banner */}
        <div className="w-full bg-primary/10 border-y border-primary py-2 mt-4 overflow-hidden">
          <marquee behavior="scroll" direction="left" scrollamount="6" className="text-primary font-semibold text-sm md:text-base px-2 md:px-0">
            Wir öffnen auch am Samstagen und Montagen. Jetzt Termin sichern!
          </marquee>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Unsere Leistungen
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Premium <span className="text-silver-gradient" style={{background: 'linear-gradient(90deg, #bcbcbc 0%, #e0e0e0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                Hairstyling
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Von klassischen Schnitten bis zu modernem Styling bieten wir eine 
              komplette Palette an Premium-Services für Damen und Herren.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <AnimatedSection key={service.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group p-8 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {service.description}
                  </p>
                  <span className="text-primary font-semibold">{service.price}</span>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4} className="text-center mt-12">
            <Button asChild variant="silverOutline" size="lg">
              <Link to="/leistungen">Alle Leistungen</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Opening Hours & Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Opening Hours */}
            <AnimatedSection direction="left">
              <div className="p-8 md:p-12 rounded-3xl bg-card border border-border">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground">
                    Öffnungszeiten
                  </h3>
                </div>
                <div className="space-y-4">
                  {openingHours.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between items-center py-3 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{item.day}</span>
                      <span className="text-foreground font-medium">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection direction="right">
              <div className="p-8 md:p-12 rounded-3xl bg-card border border-border">
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-8">
                  Kontaktieren Sie uns
                </h3>
                <div className="space-y-6">
                  <a
                    href="tel:+4912345678"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Telefon</span>
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        015214414146
                      </span>
                    </div>
                  </a>
                  <a
                    href="mailto:info@diva-haarstudio.de"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">E-Mail</span>
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        info@diva-haarstudio.de
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Adresse</span>
                      <span className="text-foreground font-medium">
                        Zum Erlenbusch 13, 48167 Münster
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-border">
                  <span className="text-sm text-muted-foreground mb-4 block">Folgen Sie uns</span>
                  <div className="flex gap-4">
                    <motion.a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/20 border border-border hover:border-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-primary" />
                    </motion.a>
                   
                    <motion.a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/20 border border-border hover:border-primary transition-colors"
                    >
                      <Music2 className="w-5 h-5 text-primary" />
                    </motion.a>


                     <motion.a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/20 border border-border hover:border-primary transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-primary" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Besuchen Sie unseren <span className="text-silver-gradient" style={{background: 'linear-gradient(90deg, #bcbcbc 0%, #e0e0e0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                Salon
              </span>
            </h2>
            <p className="text-muted-foreground">
              Finden Sie uns im Herzen von Münster-Hiltrup
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2533.4719283422704!2d7.673737876766184!3d51.91810127145644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b9ae8e145d420f%3A0xf0c3e1d3f57c4b6b!2sZum%20Erlenbusch%2013%2C%2048167%20M%C3%BCnster!5e0!3m2!1sde!2sde!4v1736940000000!5m2!1sde!2sde"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Diva Haarstudio Standort"
                className="w-full h-64 md:h-96"
              />
              <div className="mt-6 text-center">
                <span className="text-foreground font-medium text-lg">Zum Erlenbusch 13, 48167 Münster</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Bereit für eine <span className="text-silver-gradient">Verwandlung</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Buchen Sie noch heute Ihren Termin und erleben Sie die Kunst des Premium Hairstylings.
            </p>
            <Button asChild variant="silver" size="xl">
              <Link to="/booking">Jetzt Termin buchen</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
