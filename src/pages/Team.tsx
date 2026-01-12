import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Award, Star } from "lucide-react";
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
}

const Team = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [reviews, setReviews] = useState<Record<string, Array<{ rating: number; comment: string; service_id: string }>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStylists = async () => {
      const { data } = await supabase
        .from('stylists')
        .select('id, name, title, specialty, bio, image_url, instagram_url')
        .eq('is_active', true)
        .order('name');
      setStylists(data || []);
      setIsLoading(false);
    };
    loadStylists();
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('stylist_id, service_id, rating, comment');
      const map: Record<string, Array<{ rating: number; comment: string; service_id: string }>> = {};
      (data || []).forEach((r) => {
        if (!r.stylist_id) return;
        map[r.stylist_id] = map[r.stylist_id] || [];
        map[r.stylist_id].push({ rating: r.rating as number, comment: r.comment as string, service_id: r.service_id as string });
      });
      setReviews(map);
    })();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Lernen Sie die Künstler kennen
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              Unser <span className="text-gold-gradient">Team</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ein Kollektiv leidenschaftlicher Stylisten, die sich der Kunst des Hairstylings 
              verschrieben haben. Jeder bringt seine einzigartige Expertise und kreative Vision ein.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {isLoading && (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!isLoading && stylists.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Keine aktiven Stylisten vorhanden.</p>
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
                              {stylist.title || 'Stylist'}
                            </span>
                          </div>
                        </div>
                        {stylist.instagram_url && (
                          <motion.a
                            href={stylist.instagram_url.startsWith('@') ?
                              `https://instagram.com/${stylist.instagram_url.slice(1)}` : stylist.instagram_url}
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
                          {(stylist.specialty || '')
                            .split(',')
                            .map(s => s.trim())
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
                      {reviews[stylist.id] && reviews[stylist.id].length > 0 && (
                        <div className="mt-6">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Bewertungen</span>
                          <div className="space-y-3">
                            {reviews[stylist.id].slice(0, 3).map((rev, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
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
              Wählen Sie den Künstler, der zu Ihrer Stilvorstellung passt, und buchen Sie noch heute Ihren Termin.
            </p>
            <Button asChild variant="gold" size="xl">
              <Link to="/booking">Termin buchen</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Team;
