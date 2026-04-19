import { VenueZone, WaitTimePing, densityColor, densityLabel, estimateWait } from "@/hooks/useVenue";
import { motion } from "framer-motion";

interface Props {
  zones: VenueZone[];
  pings: Record<string, WaitTimePing>;
  onSelect?: (zone: VenueZone) => void;
  selectedId?: string;
}

const typeIcon: Record<string, string> = {
  gate: "🚪",
  concession: "🍔",
  restroom: "🚻",
  section: "💺",
  exit: "🏃",
  first_aid: "⛑️",
  concourse: "🛤️",
};

export function ZoneHeatmap({ zones, pings, onSelect, selectedId }: Props) {
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto bg-muted/30 rounded-3xl overflow-hidden border border-border/50">
      {/* Grid backdrop */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "10% 10%",
      }} />
      {zones.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No zones yet — add your first zone to see the live map
        </div>
      )}
      {zones.map((z) => {
        const ping = pings[z.id];
        const color = densityColor(ping?.density_pct);
        const isSelected = selectedId === z.id;
        return (
          <motion.button
            key={z.id}
            type="button"
            onClick={() => onSelect?.(z)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${z.pos_x}%`, top: `${z.pos_y}%` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={ping?.density_pct && ping.density_pct >= 70 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="relative"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg ring-2 ring-background"
                style={{ backgroundColor: color, boxShadow: isSelected ? `0 0 0 4px ${color}` : undefined }}
              >
                {typeIcon[z.zone_type] ?? "📍"}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs font-medium bg-background/90 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">
                {z.name}
              </div>
            </motion.div>
          </motion.button>
        );
      })}
      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-background/80 backdrop-blur px-3 py-2 rounded-full text-xs shadow-sm">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(142 70% 45%)" }} /> Clear</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(38 92% 55%)" }} /> Busy</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--primary))" }} /> Crowded</span>
      </div>
    </div>
  );
}

export function ZoneCard({ zone, ping }: { zone: VenueZone; ping?: WaitTimePing }) {
  const wait = estimateWait(zone, ping);
  return (
    <div className="rounded-2xl bg-card p-4 border border-border/50">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: densityColor(ping?.density_pct) }}>
          {typeIcon[zone.zone_type] ?? "📍"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{zone.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{zone.zone_type.replace("_", " ")}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: densityColor(ping?.density_pct), color: "white" }}>
          {densityLabel(ping?.density_pct)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><p className="text-muted-foreground">Density</p><p className="font-semibold">{ping?.density_pct ?? "—"}%</p></div>
        <div><p className="text-muted-foreground">Queue</p><p className="font-semibold">{ping?.queue_length ?? "—"}</p></div>
        <div><p className="text-muted-foreground">Wait</p><p className="font-semibold">{wait != null ? `${wait}m` : "—"}</p></div>
      </div>
    </div>
  );
}
