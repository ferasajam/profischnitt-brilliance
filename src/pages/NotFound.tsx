import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-8">
            <Scissors className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl font-bold mb-4">
            <span className="text-gold-gradient">404</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! This page seems to have gotten a trim it didn't need.
          </p>
          
          <Button asChild variant="gold" size="lg">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
