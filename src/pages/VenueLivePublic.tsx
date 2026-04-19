import { useParams } from "react-router-dom";
import { useEventBySlug } from "@/hooks/useEvents";
import { useVenue, useZones, useLatestPings, useBroadcasts, useSubmitPing, estimateWait, densityColor, densityLabel } from "@/hooks/useVenue";
import { ZoneHeatmap, ZoneCard } from "@/components/venue/ZoneHeatmap";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Radio } from "lucide-react";

export default function VenueLivePublic() {
  const { slug } = useParams();
  const { data: event, isLoading } = useEventBySlug(slug);
  const { data: venue } = useVenue(event?.id);
  const { data: zones = [] } = useZones(venue?.id);
  const { data: pings = {} } = useLatestPings(venue?.id);
  const { data: broadcasts = [] } = useBroadcasts(event?.id);
  const submitPing = useSubmitPing();
  const [selected, setSelected] = useState<typeof zones[0] | null>(null);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!event || !venue) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold mb-1">No live venue</h1>
        <p className="text-sm text-muted-foreground">This event hasn't enabled SmartVenue Live yet.</p>
      </div>
    </div>
  );

  const reportLong = async (zoneId: string) => {
    await submitPing.mutateAsync({ zone_id: zoneId, source: "attendee", density_pct: 85, queue_length: 20 });
    toast.success("Thanks — reported");
  };

  const sortedByWait = [...zones]
    .filter((z) => ["concession", "restroom"].includes(z.zone_type))
    .map((z) => ({ z, wait: estimateWait(z, pings[z.id]), density: pings[z.id]?.density_pct ?? 0 }))
    .sort((a, b) => (a.wait ?? 999) - (b.wait ?? 999));

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 sm:px-6 h-14 flex items-center gap-2 border-b border-border/40">
        <Logo size="sm" />
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
        </span>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{venue.name}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>{event.name}</h1>
        </div>

        <AnimatePresence>
          {broadcasts.slice(0, 3).map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-2xl p-4 flex items-start gap-3 ${b.severity === "critical" ? "bg-primary/10 border border-primary/30" : "bg-muted"}`}
            >
              <Megaphone className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{b.title}</p>
                {b.body && <p className="text-xs text-muted-foreground mt-0.5">{b.body}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Live map</h2>
          <ZoneHeatmap zones={zones} pings={pings} onSelect={setSelected} selectedId={selected?.id} />
        </section>

        {selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ZoneCard zone={selected} ping={pings[selected.id]} />
            <Button variant="outline" onClick={() => reportLong(selected.id)} className="w-full rounded-full h-11">
              <Radio className="w-4 h-4 mr-2" /> Report long line here
            </Button>
          </motion.div>
        )}

        {sortedByWait.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Shortest waits right now</h2>
            <div className="space-y-2">
              {sortedByWait.slice(0, 5).map(({ z, wait, density }) => (
                <button key={z.id} onClick={() => setSelected(z)} className="w-full text-left rounded-2xl bg-card p-3 border border-border/50 flex items-center gap-3 hover:bg-muted/50 transition">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: densityColor(density) }}>
                    {z.zone_type === "concession" ? "🍔" : "🚻"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{z.name}</p>
                    <p className="text-xs text-muted-foreground">{densityLabel(density)}</p>
                  </div>
                  <span className="text-sm font-semibold">{wait != null ? `~${wait}m` : "—"}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
