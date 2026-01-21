import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Eroeffnungsangebote = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-8 w-full flex justify-center"
      >
        <img
          src="/res/angebote.png"
          alt="Eröffnungsangebote"
          className="max-w-[480px] w-full h-full min-h-[320px] md:min-h-[720px] rounded-2xl shadow-lg object-cover"
        />
      </motion.div>
      <Button asChild variant="gold" size="xl">
        <Link to="/booking">Termin buchen</Link>
      </Button>
    </div>
  );
};

export default Eroeffnungsangebote;
