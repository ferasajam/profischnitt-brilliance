import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";

// Placeholder stylist data - will be managed from admin panel with database
const stylists = [
  {
    id: 1,
    name: "Marco Rossi",
    role: "Master Stylist",
    specialties: ["Men's Cuts", "Beard Grooming", "Classic Styles"],
    bio: "With over 15 years of experience, Marco brings Italian precision and artistry to every cut. Known for his attention to detail and personalized consultations.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    instagram: "@marco.styles",
  },
  {
    id: 2,
    name: "Elena Schmidt",
    role: "Creative Director",
    specialties: ["Women's Styling", "Color Specialist", "Waves & Texture"],
    bio: "Elena's creative vision has shaped the salon's artistic direction. Her expertise in color theory and modern techniques creates stunning transformations.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face",
    instagram: "@elena.hair",
  },
  {
    id: 3,
    name: "David Chen",
    role: "Senior Stylist",
    specialties: ["Modern Cuts", "Fades", "Asian Hair Expert"],
    bio: "David combines traditional techniques with contemporary trends. His precision fades and textured cuts have earned him a loyal following.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    instagram: "@david.cuts",
  },
  {
    id: 4,
    name: "Sophie Weber",
    role: "Stylist",
    specialties: ["Balayage", "Bridal Styling", "Extensions"],
    bio: "Sophie's passion for bridal and special occasion styling makes her the go-to expert for life's important moments. Her balayage work is sought after.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    instagram: "@sophie.styling",
  },
];

const Team = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Meet the Artists
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              Our <span className="text-gold-gradient">Team</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              A collective of passionate stylists dedicated to the art of hairstyling. 
              Each brings their unique expertise and creative vision to deliver exceptional results.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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
                        <img
                          src={stylist.image}
                          alt={stylist.name}
                          className="w-full h-full object-cover"
                        />
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
                              {stylist.role}
                            </span>
                          </div>
                        </div>
                        <motion.a
                          href={`https://instagram.com/${stylist.instagram.slice(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                        >
                          <Instagram className="w-5 h-5 text-primary" />
                        </motion.a>
                      </div>

                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        {stylist.bio}
                      </p>

                      {/* Specialties */}
                      <div className="mb-6">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
                          Specialties
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {stylist.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium border border-border"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-primary text-primary"
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          5.0 Rating
                        </span>
                      </div>
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
              Book with Your <span className="text-gold-gradient">Favorite Stylist</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Choose the artist who matches your style vision and book your appointment today.
            </p>
            <Button asChild variant="gold" size="xl">
              <Link to="/booking">Book Appointment</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Team;
