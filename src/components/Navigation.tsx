import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "Startseite" },
  { href: "/team", label: "Team" },
  { href: "/booking", label: "Termin buchen" },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, isStaff, user } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setFirstName(""); setLastName(""); return; }
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      setFirstName((data?.first_name as string) || "");
      setLastName((data?.last_name as string) || "");
    })();
    return () => { active = false; };
  }, [user]);

  const initials = useMemo(() => {
    const a = (firstName || "").trim();
    const b = (lastName || "").trim();
    if (a || b) {
      return `${a.charAt(0) || ''}${b.charAt(0) || ''}`.toUpperCase() || 'P';
    }
    const email = user?.email || '';
    return (email.charAt(0) || 'P').toUpperCase();
  }, [firstName, lastName, user]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
    >
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-full border border-primary/50 group-hover:border-primary group-hover:bg-primary/10 transition-colors"
          >
            <Scissors className="w-5 h-5 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-wide text-foreground">
              PROFISCHNITT
            </span>
            <span className="text-[10px] tracking-[0.3em] text-primary uppercase">
              Hairstyling
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative group"
            >
              <span
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-px bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: location.pathname === link.href ? "100%" : 0,
                }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {(isAdmin || isStaff) && (
            <Button asChild variant="gold" size="lg">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          {user ? null : (
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Anmelden</Link>
            </Button>
          )}
          <Button asChild variant="gold" size="lg">
            <Link to="/booking">Termin buchen</Link>
          </Button>
          {user && (
            <Link to="/profile" aria-label="Profil" className="ml-1">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>

        {/* Mobile Header Controls: Avatar + Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link to="/profile" onClick={() => setIsOpen(false)} aria-label="Profil">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground"
            aria-label="Menü öffnen"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 text-lg font-medium ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button asChild variant="gold" className="w-full mt-4">
                  <Link to="/booking" onClick={() => setIsOpen(false)}>
                    Termin buchen
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 }}
              >
                {user ? (
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      Profil
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      Anmelden
                    </Link>
                  </Button>
                )}
              </motion.div>
              {(isAdmin || isStaff) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      Admin
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
