import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AttendeeTicket() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ticket", eventId, user?.id],
    queryFn: async () => {
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("event_id", eventId!)
        .eq("data->>email", user?.email ?? "")
        .single();
      if (regErr) throw regErr;
      return reg as any;
    },
    enabled: !!eventId && !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-96 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button className="mt-4" asChild>
          <Link to="/attendee/my-events">Back to My Events</Link>
        </Button>
      </div>
    );
  }

  const event = data.events;
  const ticketCode = `${event.slug}-${data.id.slice(0, 8).toUpperCase()}`;
  const qrValue = `${window.location.origin}/pass/${data.id}`;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/attendee/my-events">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ticket Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-border">
          {/* Header */}
          <div
            className="p-8 text-white"
            style={{ background: `linear-gradient(135deg, ${event.primary_color ?? "#7C3AED"}, ${event.primary_color ?? "#7C3AED"}99)` }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {event.event_type ?? "event"}
            </span>
            <h1 className="text-2xl font-bold mt-2 leading-tight">{event.name}</h1>

            <div className="mt-4 space-y-2">
              {event.event_date && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
                </div>
              )}
              {event.event_date && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Clock className="w-4 h-4 shrink-0" />
                  {format(new Date(event.event_date), "h:mm a")}
                </div>
              )}
              {event.registration_limit && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Users className="w-4 h-4 shrink-0" />
                  {event.registration_limit} capacity
                </div>
              )}
            </div>
          </div>

          {/* Ticket perforation */}
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-background -ml-3 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border" />
            <div className="w-6 h-6 rounded-full bg-background -mr-3 shrink-0" />
          </div>

          {/* QR Section */}
          <div className="bg-card p-8 flex flex-col items-center gap-5">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <QRCode value={qrValue} size={160} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Ticket ID</p>
              <p className="text-lg font-mono font-bold text-foreground mt-1">{ticketCode}</p>
            </div>

            {/* Attendee Info */}
            <div className="w-full rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Registered As</p>
              <p className="font-semibold text-foreground text-sm">{(data.data as any)?.name || user?.user_metadata?.full_name || "Attendee"}</p>
              <p className="text-sm text-muted-foreground">{(data.data as any)?.email || user?.email}</p>
            </div>

            <div className={`w-full text-center py-2 rounded-full text-sm font-semibold ${
              data.status === "checked_in"
                ? "bg-green-500/10 text-green-600"
                : data.status === "cancelled"
                ? "bg-red-500/10 text-red-600"
                : "bg-blue-500/10 text-blue-600"
            }`}>
              {data.status === "checked_in" ? "✓ Checked In" : data.status === "cancelled" ? "✗ Cancelled" : "● Registered"}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
