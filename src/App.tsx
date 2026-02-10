import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

import Index from "./pages/Index";
import Eroeffnungsangebote from "./pages/Eroeffnungsangebote";
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
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
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
                <Route path="/eroeffnungsangebote" element={<Eroeffnungsangebote />} />
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
                {/* Legal */}
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/impressum" element={<Impressum />} />
                {/* Backwards-compatible paths */}
                <Route path="/privacy" element={<Datenschutz />} />
                <Route path="/terms" element={<Impressum />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CookieConsentBanner />
            {/* Floating WhatsApp Button */}
            <a
              href="https://wa.me/4915214414146"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Chat"
              className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="currentColor">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.13 2.484 7.23L4 29l7.012-2.293A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.91-.52-5.6-1.51l-.4-.23-4.16 1.36 1.37-4.05-.26-.42C6.52 19.01 6 17.03 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.13-.61.14-.18.27-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.13-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.29-.34.43-.51.14-.17.18-.29.29-.48.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.31s.99 2.68 1.13 2.87c.14.19 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/>
              </svg>
            </a>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
