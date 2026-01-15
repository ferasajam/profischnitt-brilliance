import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Team from "./pages/Team";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Bookings from "./pages/admin/Bookings";
import Stylists from "./pages/admin/Stylists";
import Services from "./pages/admin/Services";
import Customers from "./pages/admin/Customers";
import Loyalty from "./pages/admin/Loyalty";
import NotFound from "./pages/NotFound";
import Review from "./pages/Review";
import Cancel from "./pages/Cancel";
import Profile from "./pages/Profile";
import Leistungen from "./pages/Leistungen";
import { ScrollToTop } from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 pt-20">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/team" element={<Team />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/leistungen" element={<Leistungen />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cancel" element={<Cancel />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="stylists" element={<Stylists />} />
                  <Route path="services" element={<Services />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="loyalty" element={<Loyalty />} />
                </Route>
                <Route path="/review" element={<Review />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
