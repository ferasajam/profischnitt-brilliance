import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "Startseite" },
  { href: "/leistungen", label: "Leistungen" },
  // { href: "/eroeffnungsangebote", label: "Eröffnungsangebote" },
  { href: "/team", label: "Team" },
  { href: "/auth?tab=contact", label: "Anmelden", authOnly: false },
    { href: "/auth?tab=register", label: "Registrieren", authOnly: false },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, isStaff, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        setFirstName("");
        setLastName("");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setFirstName(data?.first_name || "");
      setLastName(data?.last_name || "");
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const initials = useMemo(() => {
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return (user?.email?.charAt(0) || "P").toUpperCase();
  }, [firstName, lastName, user]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
    >
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* LOGO + MOTTO */}
        <Link to="/" className="flex items-center gap-6 flex-1 min-w-0">
          <img
            src="/res/Logo.png"
            alt="Diva Haarstudio Logo"
            className="w-32 sm:w-40 h-20 sm:h-24 object-contain shrink-0"
          />

          {/* MOTTO */}
          <div className="flex flex-col justify-center min-w-0 mt-2 sm:mt-0">
            {/* MOBILE */}
            <span
              className="sm:hidden text-2xl text-foreground/80 leading-tight break-words min-w-[320px]"
              style={{
                fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                letterSpacing: "0.03em",
              }}
            >
              Dein Haar<br />deine Krone 
            </span>

            {/* DESKTOP / TABLET */}
            <div className="hidden sm:flex flex-col border-l border-border/60 pl-3">
              <span
                className="text-2xl text-foreground/70 min-w-[320px] break-words"
                style={{
                  fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                  letterSpacing: "0.04em",
                }}
              >
                Dein Haar
              </span>
              <span
                className="text-3xl text-primary min-w-[320px] break-words"
                style={{
                  fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                  letterSpacing: "0.05em",
                }}
              >
                deine Krone 
              </span>
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks
            .filter((link) => {
              // Zeige Anmelden/Registrieren nur, wenn kein User eingeloggt ist
              if ((link.href.startsWith("/auth")) && user) return false;
              return true;
            })
            .map((link) => (
              <Link key={link.href} to={link.href} className="relative group">
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
          {user && isAdmin && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex-1 max-w-[120px]">
              <Button
                asChild
                variant="silver"
                size="sm"
                className="w-full shadow-lg shadow-primary/20 px-2 py-1"
              >
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-1"
                >
                  <Scissors className="w-4 h-4" />
                  <span className="text-xs">Admin</span>
                </Link>
              </Button>
            </motion.div>
          )}
          {user && (
            <Link to="/profile">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          {user && (
            <Link to="/profile">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
            aria-label="Menü öffnen"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks
                .filter((link) => {
                  if ((link.href.startsWith("/auth")) && user) return false;
                  return true;
                })
                .map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              {user && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground/70 hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
