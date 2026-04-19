import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePublicEvents } from "@/hooks/useMyRegistrations";
import { CalendarDays, Search, Clock, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";

const EVENT_TYPE_COLORS: Record<string, string> = {
  conference: "bg-purple-500/10 text-purple-600",
  workshop: "bg-blue-500/10 text-blue-600",
  networking: "bg-pink-500/10 text-pink-600",
  webinar: "bg-teal-500/10 text-teal-600",
  hackathon: "bg-orange-500/10 text-orange-600",
  meetup: "bg-cyan-500/10 text-cyan-600",
};

export default function ExploreEvents() {
  const { data: events = [], isLoading } = usePublicEvents();
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Explore Events</h1>
        <p className="text-muted-foreground mt-1">Discover and register for upcoming events.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10 h-11 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">No events found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((event, i) => {
            const isUpcoming = !event.event_date || !isPast(new Date(event.event_date));
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Color accent bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: event.primary_color ?? "#7C3AED" }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${EVENT_TYPE_COLORS[event.event_type ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                      {event.event_type ?? "event"}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-1.5 mb-4">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(event.event_date), "EEE, MMM d · h:mm a")}
                      </div>
                    )}
                    {event.registration_limit && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {event.registration_limit} spots available
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="w-full rounded-full"
                    variant={isUpcoming ? "default" : "outline"}
                    disabled={!isUpcoming}
                    asChild={isUpcoming}
                  >
                    {isUpcoming ? (
                      <Link to={`/register/${event.slug}`}>
                        Register Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    ) : (
                      <span>Event Ended</span>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
