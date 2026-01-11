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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-salon.jpg";

const services = [
  {
    icon: User,
    title: "Men's Haircut",
    description: "Precision cuts and classic styles tailored to your features",
    price: "From €35",
  },
  {
    icon: Users,
    title: "Women's Haircut",
    description: "Elegant cuts and styling for every occasion",
    price: "From €45",
  },
  {
    icon: Scissors,
    title: "Beard Grooming",
    description: "Expert beard shaping, trimming, and hot towel treatments",
    price: "From €25",
  },
  {
    icon: Sparkles,
    title: "Waves & Styling",
    description: "Modern wave techniques and advanced styling services",
    price: "From €40",
  },
];

const openingHours = [
  { day: "Monday - Friday", hours: "09:00 - 19:00" },
  { day: "Saturday", hours: "09:00 - 17:00" },
  { day: "Sunday", hours: "Closed" },
];

const Index = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Profischnitt Salon Interior"
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

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]"
            >
              <span className="text-foreground">PROFI</span>
              <span className="text-gold-gradient">SCHNITT</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl"
            >
              Where artistry meets precision. Experience premium hairstyling 
              for men and women in an atmosphere of pure luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild variant="gold" size="xl">
                <Link to="/booking">Book an Appointment</Link>
              </Button>
              <Button asChild variant="goldOutline" size="xl">
                <Link to="/team">Meet Our Team</Link>
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

      {/* Services Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Our Services
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Premium <span className="text-gold-gradient">Hairstyling</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From classic cuts to modern styling, we offer a full range of premium 
              services for men and women.
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
            <Button asChild variant="goldOutline" size="lg">
              <Link to="/booking">View All Services & Book</Link>
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
                    Opening Hours
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
                  Get in Touch
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
                      <span className="text-sm text-muted-foreground block">Phone</span>
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        +49 123 456 78
                      </span>
                    </div>
                  </a>
                  <a
                    href="mailto:info@profischnitt.de"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Email</span>
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        info@profischnitt.de
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">Address</span>
                      <span className="text-foreground font-medium">
                        Zum Erlenbusch 13, 48167 Münster
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-border">
                  <span className="text-sm text-muted-foreground mb-4 block">Follow Us</span>
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
              Visit Our <span className="text-gold-gradient">Salon</span>
            </h2>
            <p className="text-muted-foreground">
              Find us in the heart of Münster
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2437.3!2d7.6!3d51.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDU0JzAwLjAiTiA3wrAzNicwMC4wIkU!5e0!3m2!1sen!2sde!4v1"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Profischnitt Hairstyling Location"
                className="grayscale"
              />
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
              Ready for a <span className="text-gold-gradient">Transformation</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Book your appointment today and experience the art of premium hairstyling.
            </p>
            <Button asChild variant="gold" size="xl">
              <Link to="/booking">Book Your Appointment</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
