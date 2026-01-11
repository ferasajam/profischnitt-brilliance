import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Users, 
  Scissors, 
  Sparkles, 
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedSection } from "@/components/AnimatedSection";

// Placeholder data - will come from database
const stylists = [
  { id: 1, name: "Marco Rossi", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { id: 2, name: "Elena Schmidt", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { id: 3, name: "David Chen", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
  { id: 4, name: "Sophie Weber", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
];

const menServices = [
  { id: "men-cut", name: "Haircut", price: 35, duration: 30 },
  { id: "men-cut-beard", name: "Haircut + Beard", price: 50, duration: 45 },
  { id: "men-beard", name: "Beard Grooming", price: 25, duration: 20 },
];

const womenServices = [
  { id: "women-cut", name: "Haircut", price: 45, duration: 45 },
  { id: "women-cut-style", name: "Haircut + Styling", price: 65, duration: 60 },
  { id: "women-waves", name: "Waves & Styling", price: 40, duration: 45 },
  { id: "women-color", name: "Color Treatment", price: 80, duration: 90 },
];

// Mock available time slots
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

type BookingStep = "gender" | "service" | "stylist" | "datetime" | "details" | "confirmation";

const Booking = () => {
  const [step, setStep] = useState<BookingStep>("gender");
  const [gender, setGender] = useState<"men" | "women" | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const services = gender === "men" ? menServices : womenServices;
  const currentService = services.find(s => s.id === selectedService);
  const currentStylist = stylists.find(s => s.id === selectedStylist);

  const steps: BookingStep[] = ["gender", "service", "stylist", "datetime", "details", "confirmation"];
  const currentStepIndex = steps.indexOf(step);

  const nextStep = () => {
    const next = steps[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const prevStep = () => {
    const prev = steps[currentStepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  }).filter(date => date.getDay() !== 0); // Exclude Sundays

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Book Your Visit
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Schedule an <span className="text-gold-gradient">Appointment</span>
            </h1>
            <p className="text-muted-foreground">
              Choose your service, stylist, and preferred time
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={`flex items-center ${i < steps.length - 2 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {i < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < steps.length - 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      i < currentStepIndex ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Gender Selection */}
              {step === "gender" && (
                <motion.div
                  key="gender"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      I'm looking for services for...
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: "men", icon: User, label: "Men" },
                      { value: "women", icon: Users, label: "Women" },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setGender(option.value as "men" | "women");
                          setSelectedService(null);
                          nextStep();
                        }}
                        className={`p-8 rounded-2xl border-2 transition-all ${
                          gender === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                          <option.icon className="w-8 h-8 text-primary" />
                        </div>
                        <span className="font-serif text-xl font-semibold text-foreground">
                          {option.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Service Selection */}
              {step === "service" && (
                <motion.div
                  key="service"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Select a Service
                    </h2>
                    <div className="w-20" />
                  </div>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <motion.button
                        key={service.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedService(service.id);
                          nextStep();
                        }}
                        className={`w-full p-6 rounded-xl border-2 transition-all flex items-center justify-between ${
                          selectedService === service.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                            {service.id.includes('beard') ? (
                              <Scissors className="w-6 h-6 text-primary" />
                            ) : service.id.includes('waves') || service.id.includes('style') ? (
                              <Sparkles className="w-6 h-6 text-primary" />
                            ) : (
                              <Scissors className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-semibold text-foreground block">
                              {service.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-primary font-semibold text-lg">
                            €{service.price}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Stylist Selection */}
              {step === "stylist" && (
                <motion.div
                  key="stylist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Choose Your Stylist
                    </h2>
                    <div className="w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {stylists.map((stylist) => (
                      <motion.button
                        key={stylist.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedStylist(stylist.id);
                          nextStep();
                        }}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedStylist === stylist.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <img
                          src={stylist.image}
                          alt={stylist.name}
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-border"
                        />
                        <span className="font-semibold text-foreground block">
                          {stylist.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Date & Time Selection */}
              {step === "datetime" && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Select Date & Time
                    </h2>
                    <div className="w-20" />
                  </div>

                  {/* Date Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Select a Date</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {dates.map((date) => (
                        <motion.button
                          key={date.toISOString()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all min-w-[100px] ${
                            selectedDate?.toDateString() === date.toDateString()
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <span className="text-xs text-muted-foreground block">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-xl font-semibold text-foreground block">
                            {date.getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">Available Times</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTime === time
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-primary/50 bg-card text-foreground'
                            }`}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {selectedDate && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-4"
                    >
                      <Button
                        variant="gold"
                        size="lg"
                        className="w-full"
                        onClick={nextStep}
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 5: Contact Details */}
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Your Details
                    </h2>
                    <div className="w-20" />
                  </div>

                  {/* Booking Summary */}
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="text-foreground">{currentService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stylist</span>
                        <span className="text-foreground">{currentStylist?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span className="text-foreground">
                          {selectedDate && formatDate(selectedDate)} at {selectedTime}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-border">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-semibold text-primary">€{currentService?.price}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+49 123 456 789"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full"
                    >
                      Confirm Booking
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 6: Confirmation */}
              {step === "confirmation" && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6"
                  >
                    <Check className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                    Booking <span className="text-gold-gradient">Confirmed!</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Thank you, {formData.name}! A confirmation email has been sent to {formData.email}. 
                    We look forward to seeing you!
                  </p>
                  <div className="p-6 rounded-xl bg-card border border-border inline-block text-left mb-8">
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Service</span>
                        <span className="text-foreground font-medium">{currentService?.name}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Stylist</span>
                        <span className="text-foreground font-medium">{currentStylist?.name}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Date</span>
                        <span className="text-foreground font-medium">
                          {selectedDate && formatDate(selectedDate)} at {selectedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="goldOutline"
                      onClick={() => {
                        setStep("gender");
                        setGender(null);
                        setSelectedService(null);
                        setSelectedStylist(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setFormData({ name: "", email: "", phone: "" });
                      }}
                    >
                      Book Another Appointment
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
