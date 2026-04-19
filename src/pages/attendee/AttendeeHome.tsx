import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRegistrations } from "@/hooks/useMyRegistrations";
import { usePublicEvents } from "@/hooks/useMyRegistrations";
import { CalendarDays, Compass, Ticket, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";

export default function AttendeeHome() {
  const { user } = useAuth();
  const { data: registrations = [] } = useMyRegistrations();
  const { data: publicEvents = [] } = usePublicEvents();

  const upcomingRegistrations = registrations.filter(
    (r) => r.events && !isPast(new Date(r.events.event_date ?? Date.now()))
  );
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-1">Welcome back, {firstName}! 👋</h1>
        <p className="text-white/80">Here's a look at your upcoming events and activities.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Registrations", value: registrations.length, icon: Ticket, color: "text-purple-500" },
          { label: "Upcoming Events", value: upcomingRegistrations.length, icon: CalendarDays, color: "text-blue-500" },
          { label: "Events to Explore", value: publicEvents.length, icon: Compass, color: "text-green-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Upcoming Events</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/attendee/my-events">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        {upcomingRegistrations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Ticket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">No upcoming events</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Explore and register for events below!</p>
            <Button size="sm" className="mt-4" asChild>
              <Link to="/attendee/explore">Explore Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRegistrations.slice(0, 3).map((reg) => (
              <div key={reg.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (reg.events?.primary_color ?? "#7C3AED") + "22" }}>
                  <CalendarDays className="w-5 h-5" style={{ color: reg.events?.primary_color ?? "#7C3AED" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{reg.events?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {reg.events?.event_date ? format(new Date(reg.events.event_date), "EEE, MMM d · h:mm a") : "Date TBD"}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full shrink-0" asChild>
                  <Link to={`/attendee/ticket/${reg.event_id}`}>View Ticket</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
