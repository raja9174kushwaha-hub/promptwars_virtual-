import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMyRegistrations } from "@/hooks/useMyRegistrations";
import { CalendarDays, Clock, Ticket, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";

const statusConfig = {
  registered: { label: "Registered", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  checked_in: { label: "Checked In", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default function MyEvents() {
  const { data: registrations = [], isLoading } = useMyRegistrations();

  const upcoming = registrations.filter(
    (r) => r.events && !isPast(new Date(r.events.event_date ?? 0)) && r.status !== "cancelled"
  );
  const past = registrations.filter(
    (r) => r.events && (isPast(new Date(r.events.event_date ?? 0)) || r.status === "cancelled")
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Events</h1>
        <p className="text-muted-foreground mt-1">All the events you've registered for.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">No registrations yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Browse events and register to see them here.</p>
          <Button asChild>
            <Link to="/attendee/explore">Explore Events</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((reg, i) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (reg.events?.primary_color ?? "#7C3AED") + "22" }}
                    >
                      <CalendarDays className="w-6 h-6" style={{ color: reg.events?.primary_color ?? "#7C3AED" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{reg.events?.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig[reg.status as keyof typeof statusConfig]?.color}`}>
                          {statusConfig[reg.status as keyof typeof statusConfig]?.label ?? reg.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {reg.events?.event_date ? format(new Date(reg.events.event_date), "EEE, MMM d, yyyy · h:mm a") : "Date TBD"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full shrink-0" asChild>
                      <Link to={`/attendee/ticket/${reg.event_id}`}>
                        <Ticket className="w-3.5 h-3.5 mr-1.5" /> View Ticket
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Past Events ({past.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((reg, i) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      {reg.status === "cancelled" ? (
                        <XCircle className="w-6 h-6 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{reg.events?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reg.events?.event_date ? format(new Date(reg.events.event_date), "MMM d, yyyy") : "Date TBD"}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig[reg.status as keyof typeof statusConfig]?.color}`}>
                      {statusConfig[reg.status as keyof typeof statusConfig]?.label ?? reg.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
