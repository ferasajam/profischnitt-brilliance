import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Award, Star, Sparkles, ShieldCheck, Scissors, HandCoins, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stylist {
  id: string;
  name: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  instagram_url: string | null;
  serves_women?: boolean;
  serves_men?: boolean;
}

const heroVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

const heroStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const Team = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [reviews, setReviews] = useState<
    Record<string, Array<{ rating: number; comment: string; service_id: string }>>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStylists = async () => {
      const { data } = await supabase
        .from("stylists")
        .select("id, name, title, specialty, bio, image_url, instagram_url, serves_women, serves_men")
        .eq("is_active", true)
        .order("name");

      // Damen zuerst
      const sorted = (data || []).sort((a, b) => {
        const aWomen = Boolean(a.serves_women);
        const bWomen = Boolean(b.serves_women);
        if (aWomen !== bWomen) return aWomen ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setStylists(sorted);
      setIsLoading(false);
    };

    loadStylists();

    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("stylist_id, service_id, rating, comment");

      const map: Record<
        string,
        Array<{ rating: number; comment: string; service_id: string }>
      > = {};

      (data || []).forEach((r) => {
        if (!r.stylist_id) return;
        map[r.stylist_id] = map[r.stylist_id] || [];
        map[r.stylist_id].push({
          rating: r.rating as number,
          comment: r.comment as string,
          service_id: r.service_id as string,
        });
      });

      setReviews(map);
    })();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        {/* subtle background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-25 bg-primary/30" />
          <div className="absolute -bottom-32 right-[-6rem] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20 bg-secondary" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={heroVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/60 backdrop-blur">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Lernen Sie die Künstler kennen</span>
            </motion.div>

            <motion.h1
              variants={heroVariants}
              className="mt-6 font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Unser Team
            </motion.h1>

            <motion.p
              variants={heroVariants}
              className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              Unser Ziel ist es, jeden Besuch zu einem besonderen Erlebnis zu machen.
              Wir arbeiten mit hochwertigen Produkten und nehmen uns Zeit für Ihre Wünsche. Kundenzufriedenheit, Präzision und Stil stehen bei uns an erster Stelle.
              Unser Team besteht aus erfahrenen Friseurinnen und Friseuren, die Trends kennen und Ihr Haar mit Leidenschaft pflegen.
              Warum wir?
            </motion.p>

            <motion.div
              variants={heroVariants}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            >
              {[
                { icon: Smile, label: "Professionelle Beratung" },
                { icon: Scissors, label: "Moderne Techniken" },
                { icon: ShieldCheck, label: "Hygienische Arbeitsweise" },
                { icon: Sparkles, label: "Angenehme Atmosphäre" },
                { icon: HandCoins, label: "Faire Preise" },
              ].map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 backdrop-blur px-4 py-3"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {isLoading && (
              <div className="flex items-center justify-center h-40 md:col-span-2">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {!isLoading && stylists.length === 0 && (
              <p className="text-muted-foreground text-center py-8 md:col-span-2">
                Keine aktiven Stylisten vorhanden.
              </p>
            )}

            {stylists.map((stylist, index) => (
              <AnimatedSection
                key={stylist.id}
                delay={index * 0.15}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="lg:w-2/5 relative overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        className="h-80 lg:h-full"
                      >
                        {stylist.image_url && (
                          <img
                            src={stylist.image_url}
                            alt={stylist.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent lg:bg-gradient-to-r" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/5 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-2xl font-semibold text-foreground mb-1">
                            {stylist.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-primary text-sm font-medium">
                              {stylist.title || "Stylist"}
                            </span>
                          </div>
                        </div>

                        {stylist.instagram_url && (
                          <motion.a
                            href={
                              stylist.instagram_url.startsWith("@")
                                ? `https://instagram.com/${stylist.instagram_url.slice(1)}`
                                : stylist.instagram_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                          >
                            <Instagram className="w-5 h-5 text-primary" />
                          </motion.a>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        {stylist.bio}
                      </p>

                      {/* Specialties */}
                      <div className="mb-6">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
                          Spezialgebiete
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(stylist.specialty || "")
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((specialty) => (
                              <span
                                key={specialty}
                                className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium border border-border"
                              >
                                {specialty}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Reviews */}
                      {(reviews[stylist.id] && reviews[stylist.id].length > 0) && (
                        <div className="mt-6">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                            Bewertungen
                          </span>
                          <div className="space-y-3">
                            {reviews[stylist.id].slice(0, 3).map((rev, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-secondary/50 border border-border"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 fill-primary text-primary"
                                    />
                                  ))}
                                </div>
                                {rev.comment && (
                                  <p className="text-sm text-muted-foreground">{rev.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mock Bewertungen für Maha Wazzan (wie echte Reviews) */}
                      {stylist.name === "Maha Wazzan" && (!reviews[stylist.id] || reviews[stylist.id].length === 0) && (
                        <div className="mt-6">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                            Bewertungen
                          </span>
                          <div className="space-y-3">
                            {[
                              { rating: 5, comment: "„Perfekte Beratung und ein wunderschönes Ergebnis.“" },
                              { rating: 5, comment: "„Absolute Empfehlung für Damenfrisuren!“" },
                            ].map((rev, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-secondary/50 border border-border"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-star w-4 h-4 fill-primary text-primary"
                                    >
                                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                    </svg>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">{rev.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Buchen Sie bei Ihrem <span className="text-gold-gradient">Lieblingsstylisten</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Wählen Sie den Künstler, der zu Ihrer Stilvorstellung passt, und buchen Sie
              noch heute Ihren Termin.
            </p>
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
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Team;
