import { AnimatePresence, motion } from "framer-motion";
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
  Facebook,
  X,
} from "lucide-react";
import herrenhaarschnittImg from "@/assets/Herrenhaarschnitt.png";
import damenhaarschnittImg from "@/assets/Damenhaarschnitt.png";
import bartpflegeImg from "@/assets/Bartpflege.png";
import wavesImg from "@/assets/waves.png";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-salon.png";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BOOKING_POPUP_STORAGE_KEY = "marketing_booking_popup_suppress_until";
const BOOKING_POPUP_SCROLL_THRESHOLD = 0.3; // 30% (akzeptabler Bereich: 25–35%)
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BOOKING_POPUP_CLOSE_DAYS = 14;
const BOOKING_POPUP_CTA_DAYS = 30;

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

const services = [
  {
    image: herrenhaarschnittImg,
    title: "Herrenhaarschnitt",
    description:
      "Präzise Schnitte und klassische Styles, perfekt auf Ihre Gesichtszüge abgestimmt",
    price: "Ab 21€",
  },
  {
    image: damenhaarschnittImg,
    title: "Damenhaarschnitt",
    description: "Elegante Schnitte und Styling für jeden Anlass",
    price: "Ab 35€",
  },
  {
    image: bartpflegeImg,
    title: "Bartpflege",
    description: "Professionelle Bartformung, Trimmen und Heißtuchbehandlungen",
    price: "Ab 13€",
  },
  {
    image: wavesImg,
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

type BookingPopupController = {
  isOpen: boolean;
  close: () => void;
  onCtaClick: () => void;
};

const useBookingMarketingPopup = (): BookingPopupController => {
  const [isOpen, setIsOpen] = useState(false);
  const [suppressUntil, setSuppressUntil] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(BOOKING_POPUP_STORAGE_KEY);
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  });
  const hasFiredRef = useRef(false);

  const suppressForDays = useCallback((days: number) => {
    const until = Date.now() + days * MS_PER_DAY;
    setSuppressUntil(until);
    try {
      localStorage.setItem(BOOKING_POPUP_STORAGE_KEY, String(until));
    } catch {
      // ignore
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    suppressForDays(BOOKING_POPUP_CLOSE_DAYS);
  }, [suppressForDays]);

  const onCtaClick = useCallback(() => {
    suppressForDays(BOOKING_POPUP_CTA_DAYS);
    setIsOpen(false);
  }, [suppressForDays]);

  // Trigger (Option A – Scroll): show popup after real interaction (scroll >= 30%)
  useEffect(() => {
    const onScroll = () => {
      if (hasFiredRef.current) return;
      if (isOpen) return;
      if (suppressUntil && Date.now() < suppressUntil) return;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const scrollTop = window.scrollY ?? doc.scrollTop;
      const progress = Math.max(0, Math.min(1, scrollTop / scrollable));

      if (progress >= BOOKING_POPUP_SCROLL_THRESHOLD) {
        hasFiredRef.current = true; // only once per page view
        setIsOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen, suppressUntil]);

  // UX: ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return { isOpen, close, onCtaClick };
};

type BookingMarketingPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onCtaClick: () => void;
};

const BookingMarketingPopup = ({ isOpen, onClose, onCtaClick }: BookingMarketingPopupProps) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // focus for quick ESC/tab access (a11y)
    closeButtonRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ perspective: 1000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Backdrop with animated blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(8px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Terminbuchung"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 60, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8,
            }}
            className="relative w-full max-w-lg mx-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-secondary/30 p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <motion.button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-200"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon Badge */}
              <motion.div
                className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-7 h-7 text-primary" />
              </motion.div>

              {/* Headline */}
              <motion.h3
                className="font-serif text-2xl md:text-3xl font-bold text-foreground pr-12 leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                Bereit für deinen{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    background:
                      "linear-gradient(135deg, #bcbcbc 0%, #e0e0e0 50%, #bcbcbc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  neuen Look
                </span>
                ?
              </motion.h3>

              {/* Description */}
              <motion.p
                className="mt-3 text-muted-foreground text-base md:text-lg leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sichere dir jetzt deinen Wunschtermin – schnell & unkompliziert online buchen.
              </motion.p>

              {/* Features */}
              <motion.div
                className="mt-5 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {[
                  { icon: Clock, text: "Sofort bestätigt" },
                  { icon: Scissors, text: "Professionell" },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-sm text-muted-foreground"
                  >
                    <feature.icon className="w-3.5 h-3.5 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="mt-6 flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    asChild
                    variant="silver"
                    size="xl"
                    className="w-full shadow-lg shadow-primary/20"
                  >
                    <Link
                      to="/booking"
                      onClick={onCtaClick}
                      className="flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-5 h-5" />
                      <span>Jetzt Termin buchen</span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="silverOutline"
                    size="xl"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Später
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Index = () => {
  const [threshold, setThreshold] = useState<number>(10);
  const bookingPopup = useBookingMarketingPopup();

  useEffect(() => {
    (async () => {
      type UnknownBuilder = {
        select: (q: string) => UnknownBuilder;
        eq: (c: string, v: unknown) => UnknownBuilder;
        maybeSingle: () => Promise<unknown>;
      };
      const builder = (supabase as unknown as { from: (t: string) => UnknownBuilder }).from(
        "app_settings"
      );
      const res = (await builder
        .select("value")
        .eq("key", "loyalty_threshold")
        .maybeSingle()) as { data?: { value?: string } };
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
            className="w-full h-full object-cover opacity-35"
          />

      {/* Schwarze Grundabdunklung */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Edler Verlauf von links (Text-Lesbarkeit) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/10 to-transparent" />
</div>


        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 -mt-0 md:-mt-26 flex justify-center items-center min-h-[90vh]">
          <div className="max-w-3xl">
            {/* Enhanced Hero Content with Modern Animations */}
<motion.div
  variants={heroContainer}
  initial="hidden"
  animate="visible"
  className="space-y-8"
>
  {/* Logo with Scale Animation */}
  <motion.div
    variants={heroItem}
    className="mb-8"
  >
    <motion.img
      src="/res/Logo.png"
      alt="Diva Haarstudio Logo"
      className="max-w-[340px] md:max-w-[460px] w-[85vw] md:w-full h-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>

  {/* Headline with Gradient Accent */}
  <motion.div variants={heroItem} className="space-y-4">
    <h1 className="font-serif text-3xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
      Willkommen in unserem{" "}
      <span className="block mt-2">
        modernen{" "}
        <span
          className="text-silver-gradient"
          style={{
            background: "linear-gradient(135deg, #bcbcbc 0%, #e0e0e0 50%, #bcbcbc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Damen- & Herrensalon
        </span>
      </span>
    </h1>
  </motion.div>

  {/* Description with Staggered Text Reveal */}
  <motion.div
    variants={heroItem}
    className="max-w-2xl space-y-6"
  >
    <motion.p
      className="text-base md:text-xl text-foreground/90 leading-relaxed"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      Schönheit, Stil und Wohlbefinden unter einem Dach. Unser Salon steht für
      professionelle Haarschnitte, moderne Farbtechniken und individuelle
      Beratung – für Damen und Herren.
    </motion.p>

    {/* Highlighted Motto Section */}
    <motion.div
      className="relative pl-6 border-l-4 border-primary/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <p className="text-base md:text-lg space-y-2">
        <span className="block font-semibold text-foreground text-lg md:text-xl">
          Ihr Stil. Ihre Ausstrahlung. Unsere Leidenschaft.
        </span>
        <span className="block text-muted-foreground">
          Unser Motto:{" "}
          <span className="font-bold text-primary">
            Dein Haar … deine Krone
          </span>{" "}
          – wir bringen es zum Strahlen!
        </span>
      </p>
    </motion.div>
  </motion.div>

  {/* CTA Buttons with Hover Effects */}
  <motion.div
    variants={heroItem}
    className="flex flex-wrap gap-4 pt-4"
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button asChild variant="silver" size="xl" className="shadow-lg">
        <Link to="/booking" className="flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          <span>Termin buchen</span>
        </Link>
      </Button>
    </motion.div>

    
  </motion.div>

  {/* Optional: Trust Indicators */}
  <motion.div
    variants={heroItem}
    className="flex flex-wrap items-center gap-6 pt-6 text-sm text-muted-foreground"
  >
    <div className="flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-primary" />
      <span>Premium Qualität</span>
    </div>
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-primary" />
      <span>Erfahrene Stylisten</span>
    </div>
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-primary" />
      <span>Flexible Termine</span>
    </div>
  </motion.div>
</motion.div>
          </div>
        </div>
        {/* Scroll Indicator entfernt */}
      </section>

      {/* CTA Banner for Loyalty */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center md:text-left text-sm md:text-base text-foreground">
              Jetzt registrieren und nach{" "}
              <span className="font-semibold text-primary">{threshold}</span> Punkten einen{" "}
              <span className="text-silver-gradient">Gratis-Haarschnitt</span> erhalten.
            </p>
            <Button asChild variant="silver">
              <Link to="/auth?tab=register">Jetzt registrieren</Link>
            </Button>
          </div>
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
              Premium{" "}
              <span
                className="text-silver-gradient"
                style={{
                  background: "linear-gradient(90deg, #bcbcbc 0%, #e0e0e0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hairstyling
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Von klassischen Schnitten bis zu modernem Styling bieten wir eine komplette
              Palette an Premium-Services für Damen und Herren.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <AnimatedSection key={service.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group p-8 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-500 flex flex-col items-center"
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 object-cover rounded-xl shadow-lg mb-6 border border-border"
                      style={{ maxWidth: "100%", objectPosition: "center" }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors overflow-hidden">
                      {/* @ts-expect-error icon is optional */}
                      {service.icon && <service.icon className="w-7 h-7 text-primary" />}
                    </div>
                  )}
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3 text-center">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center">
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
                  <a href="tel:025161082" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Telefon (Festnetz)</span>
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        025161082
                      </span>
                    </div>
                  </a>
                  <a href="tel:015214414146" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Mobilnummer</span>
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
                  <span className="text-sm text-muted-foreground mb-4 block">
                    Folgen Sie uns
                  </span>
                  <div className="flex gap-4">
                    <motion.a
                      href="https://www.instagram.com/diva_haar_studio?igsh=MWcweXU1anp2aXFqYw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/20 border border-border hover:border-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-primary" />
                    </motion.a>

                    <motion.a
                      href="https://www.tiktok.com/@divahaarstudio?_r=1&_t=ZG-93YeYIE19iy"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-secondary hover:bg-primary/20 border border-border hover:border-primary transition-colors"
                    >
                      <Music2 className="w-5 h-5 text-primary" />
                    </motion.a>

                    <motion.a
                      href="https://www.facebook.com/share/1AXdeye6CK/?mibextid=wwXIfr"
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
              Besuchen Sie unseren{" "}
              <span
                className="text-silver-gradient"
                style={{
                  background: "linear-gradient(90deg, #bcbcbc 0%, #e0e0e0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Salon
              </span>
            </h2>
            <p className="text-muted-foreground">Finden Sie uns im Herzen von Münster-Hiltrup</p>
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
                <span className="text-foreground font-medium text-lg">
                  Zum Erlenbusch 13, 48167 Münster
                </span>
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
              Buchen Sie noch heute Ihren Termin und erleben Sie die Kunst des Premium
              Hairstylings.
            </p>
            <Button asChild variant="silver" size="xl">
              <Link to="/booking">Jetzt Termin buchen</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Marketing Popup (Terminbuchung) */}
      <BookingMarketingPopup
        isOpen={bookingPopup.isOpen}
        onClose={bookingPopup.close}
        onCtaClick={bookingPopup.onCtaClick}
      />
    </div>
  );
};

export default Index;
