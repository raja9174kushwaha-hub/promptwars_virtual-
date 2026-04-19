import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AttendeeLayout } from "@/pages/attendee/AttendeeLayout";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import CompanyPage from "./pages/CompanyPage";
import Events from "./pages/dashboard/Events";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EventDetail from "./pages/dashboard/EventDetail";
import Attendees from "./pages/dashboard/Attendees";
import Analytics from "./pages/dashboard/Analytics";
import Integrations from "./pages/dashboard/Integrations";
import SettingsPage from "./pages/dashboard/SettingsPage";
import SeatingArrangement from "./pages/dashboard/SeatingArrangement";
import SecurityIoT from "./pages/dashboard/SecurityIoT";
import VenueMapAdmin from "./pages/dashboard/VenueMapAdmin";
import VenueLive from "./pages/dashboard/VenueLive";
import VenueLivePublic from "./pages/VenueLivePublic";
import EntryPass from "./pages/EntryPass";
import NotFound from "./pages/NotFound";
import AttendeeHome from "./pages/attendee/AttendeeHome";
import MyEvents from "./pages/attendee/MyEvents";
import AttendeeTicket from "./pages/attendee/AttendeeTicket";
import ExploreEvents from "./pages/attendee/ExploreEvents";
import VenueMap from "./pages/attendee/VenueMap";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="app-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/register/:slug" element={<Register />} />
              <Route path="/company/:companySlug" element={<CompanyPage />} />
              <Route path="/venue/:slug" element={<VenueLivePublic />} />
              <Route path="/pass/:token" element={<EntryPass />} />

              {/* Dashboard (protected) */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/events" replace />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute requiredMode="organizer">
                  <DashboardLayout>
                    <Routes>
                      <Route path="events" element={<Events />} />
                      <Route path="events/create" element={<CreateEvent />} />
                      <Route path="events/:id" element={<EventDetail />} />
                      <Route path="events/:id/edit" element={<CreateEvent />} />
                      <Route path="events/:id/live" element={<VenueLive />} />
                      <Route path="attendees" element={<Attendees />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="integrations" element={<Integrations />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="seating" element={<SeatingArrangement />} />
                      <Route path="security" element={<SecurityIoT />} />
                      <Route path="venue-map" element={<VenueMapAdmin />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Attendee Portal (protected) */}
              <Route path="/attendee" element={<Navigate to="/attendee/home" replace />} />
              <Route path="/attendee/*" element={
                <ProtectedRoute requiredMode="attendee">
                  <AttendeeLayout>
                    <Routes>
                      <Route path="home" element={<AttendeeHome />} />
                      <Route path="my-events" element={<MyEvents />} />
                      <Route path="ticket/:eventId" element={<AttendeeTicket />} />
                      <Route path="explore" element={<ExploreEvents />} />
                      <Route path="map" element={<VenueMap />} />
                    </Routes>
                  </AttendeeLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
