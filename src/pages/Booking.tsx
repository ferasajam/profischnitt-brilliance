import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
}

interface Stylist {
  id: string;
  name: string;
  image_url: string | null;
}

// Mock available time slots
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

type BookingStep = "gender" | "service" | "stylist" | "datetime" | "details" | "confirmation";

const Booking = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>("gender");
  const [gender, setGender] = useState<"men" | "women" | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<Array<{ start_time: string; end_time: string }>>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const currentService = services.find(s => s.id === selectedService);
  const currentStylist = stylists.find(s => s.id === selectedStylist);

  // Load services when gender changes
  useEffect(() => {
    if (!gender) return;
    const category = gender === 'men' ? 'Herren' : 'Damen';
    (async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, category, duration_minutes, price')
        .eq('is_active', true)
        .eq('category', category)
        .order('name');
      setServices(data || []);
      setSelectedService(null);
    })();
  }, [gender]);

  // Load stylists based on selected service or gender category
  useEffect(() => {
    if (!gender) return;
    const category = gender === 'men' ? 'Herren' : 'Damen';
    (async () => {
      if (selectedService) {
        // Stylists linked to the chosen service
        const { data } = await supabase
          .from('stylist_services')
          .select('stylist_id, stylists(id, name, image_url)')
          .eq('service_id', selectedService);
        const result: Stylist[] = (data || [])
          .map((r: any) => r.stylists)
          .filter(Boolean);
        setStylists(result);
      } else {
        // Stylists linked to any service in the chosen category
        const { data } = await supabase
          .from('stylist_services')
          .select('stylist_id, services(category), stylists(id, name, image_url)')
          .eq('services.category', category);
        const byId = new Map<string, Stylist>();
        (data || []).forEach((row: any) => {
          if (row.stylists) byId.set(row.stylists.id, row.stylists);
        });
        setStylists([...byId.values()]);
      }
      setSelectedStylist(null);
    })();
  }, [gender, selectedService]);

  // Load booked slots for selected stylist + date
  useEffect(() => {
    const loadBusy = async () => {
      if (!selectedStylist || !selectedDate) {
        setBusySlots([]);
        return;
      }
      const booking_date = selectedDate.toISOString().slice(0, 10);
      const { data } = await supabase.rpc('get_booked_slots', {
        _stylist_id: selectedStylist,
        _date: booking_date,
      });
      setBusySlots((data as any[])?.map((r: any) => ({ start_time: r.start_time, end_time: r.end_time })) || []);
      setSelectedTime(null);
    };
    loadBusy();
  }, [selectedStylist, selectedDate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime) return;

    const start = selectedTime + ":00"; // HH:MM:SS
    const [h, m] = selectedTime.split(":").map(Number);
    const endDate = new Date(selectedDate);
    endDate.setHours(h, m + (currentService?.duration_minutes || 30), 0, 0);
    const end = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

    const booking_date = selectedDate.toISOString().slice(0, 10);

    const cancellation_token = (crypto as any).randomUUID ? (crypto as any).randomUUID() : undefined;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user?.id ?? null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date,
        start_time: start,
        end_time: end,
        status: 'pending',
        stylist_id: selectedStylist,
        service_id: selectedService,
        cancellation_token,
      })
      .select('id, cancellation_token')
      .single();

    if (error) {
      // If another user just booked this slot, the DB constraint will reject
      if ((error as any).code === '23P01' || (error as any).message?.includes('bookings_no_overlap')) {
        alert('Dieser Termin wurde gerade von jemand anderem gebucht. Bitte wählen Sie eine andere Zeit.');
        // Reload busy slots to refresh availability
        const { data: refreshed } = await supabase.rpc('get_booked_slots', {
          _stylist_id: selectedStylist,
          _date: booking_date,
        });
        setBusySlots((refreshed as any[])?.map((r: any) => ({ start_time: r.start_time, end_time: r.end_time })) || []);
        setSelectedTime(null);
        return;
      }
      return;
    }

    if (data) {
      try {
        const cancelLink = `${window.location.origin}/cancel?token=${data.cancellation_token}`;
        await supabase.functions.invoke('send-confirmation', {
          body: {
            to: formData.email,
            name: formData.name,
            booking: {
              service: currentService?.name,
              stylist: currentStylist?.name,
              date: booking_date,
              time: selectedTime,
            },
            cancelLink,
          },
        });
      } catch {}
      nextStep();
    }
  };

  // Generate next 90 days (approx. 3 months), exclude Sundays
  const dates = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  }).filter(date => date.getDay() !== 0); // Exclude Sundays

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('de-DE', { month: 'short' });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
              Termin vereinbaren
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Buchen Sie Ihren <span className="text-gold-gradient">Termin</span>
            </h1>
            <p className="text-muted-foreground">
              Wählen Sie Ihre Leistung, Ihren Stylisten und Ihre bevorzugte Zeit
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
                      Ich suche Services für...
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { value: "men", icon: User, label: "Herren" },
                      { value: "women", icon: Users, label: "Damen" },
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
                      Zurück
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Leistung wählen
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
                            {service.name.toLowerCase().includes('bart') ? (
                              <Scissors className="w-6 h-6 text-primary" />
                            ) : service.name.toLowerCase().includes('style') || service.name.toLowerCase().includes('wave') ? (
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
                              {service.duration_minutes} Min.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-primary font-semibold text-lg">
                            {service.price}€
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
                      Zurück
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Stylisten wählen
                    </h2>
                    <div className="w-20" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {stylist.image_url && (
                          <img
                            src={stylist.image_url}
                            alt={stylist.name}
                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-border"
                          />
                        )}
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
                      Zurück
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Datum & Uhrzeit wählen
                    </h2>
                    <div className="w-20" />
                  </div>

                  {/* Date Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Datum auswählen</span>
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
                            {getDayName(date)}
                          </span>
                          <span className="text-xl font-semibold text-foreground block">
                            {date.getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getMonthName(date)}
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
                        <span className="font-medium text-foreground">Verfügbare Zeiten</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {timeSlots.map((time) => {
                          // Determine if this start time would overlap any busy slot
                          const [h, m] = time.split(":").map(Number);
                          const start = new Date(selectedDate);
                          start.setHours(h, m, 0, 0);
                          const end = new Date(start);
                          end.setMinutes(end.getMinutes() + (currentService?.duration_minutes || 30));

                          const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
                          const candStart = fmt(start);
                          const candEnd = fmt(end);

                          const overlaps = busySlots.some((b) => {
                            // intervals [a,b) && [c,d) overlap if a < d && c < b
                            return (candStart < b.end_time) && (b.start_time < candEnd);
                          });

                          // Optional: prevent past times for today
                          const now = new Date();
                          const isToday = selectedDate.toDateString() === now.toDateString();
                          const isPast = isToday && start <= now;

                          const disabled = overlaps || isPast || !currentService;

                          return (
                            <motion.button
                              key={time}
                              whileHover={{ scale: disabled ? 1 : 1.05 }}
                              whileTap={{ scale: disabled ? 1 : 0.95 }}
                              onClick={() => !disabled && setSelectedTime(time)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                disabled
                                  ? 'border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                                  : selectedTime === time
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/50 bg-card text-foreground'
                              }`}
                              aria-disabled={disabled}
                            >
                              {time}
                            </motion.button>
                          );
                        })}
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
                        Weiter
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
                      Zurück
                    </Button>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Ihre Daten
                    </h2>
                    <div className="w-20" />
                  </div>

                  {/* Booking Summary */}
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Buchungsübersicht</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leistung</span>
                        <span className="text-foreground">{currentService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stylist</span>
                        <span className="text-foreground">{currentStylist?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Datum & Uhrzeit</span>
                        <span className="text-foreground">
                          {selectedDate && formatDate(selectedDate)} um {selectedTime} Uhr
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-border">
                        <span className="font-semibold text-foreground">Gesamt</span>
                        <span className="font-semibold text-primary">{currentService?.price}€</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Vollständiger Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Max Mustermann"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="max@beispiel.de"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefonnummer</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="015214414146"
                        required
                        className="bg-card border-border focus:border-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="silver"
                      size="xl"
                      className="w-full"
                    >
                      Termin bestätigen
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
                    Buchung <span className="text-gold-gradient">bestätigt!</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Vielen Dank, {formData.name}! Eine Bestätigungs-E-Mail wurde an {formData.email} gesendet. 
                    Wir freuen uns auf Ihren Besuch!
                  </p>
                  <div className="p-6 rounded-xl bg-card border border-border inline-block text-left mb-8">
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Leistung</span>
                        <span className="text-foreground font-medium">{currentService?.name}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Stylist</span>
                        <span className="text-foreground font-medium">{currentStylist?.name}</span>
                      </div>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Datum</span>
                        <span className="text-foreground font-medium">
                          {selectedDate && formatDate(selectedDate)} um {selectedTime} Uhr
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="silverOutline"
                      size="xl"
                      className="w-full"
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
                      Weiteren Termin buchen
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
