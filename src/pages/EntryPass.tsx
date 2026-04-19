import { useParams } from "react-router-dom";
import { useEntryPassByToken } from "@/hooks/useVenue";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function EntryPass() {
  const { token } = useParams();
  const { data: pass, isLoading } = useEntryPassByToken(token);

  const { data: details } = useQuery({
    queryKey: ["pass-details", pass?.id],
    enabled: !!pass,
    queryFn: async () => {
      const [{ data: event }, { data: gate }] = await Promise.all([
        supabase.from("events").select("name,event_date,slug").eq("id", pass!.event_id).single(),
        pass!.gate_zone_id
          ? supabase.from("venue_zones").select("name").eq("id", pass!.gate_zone_id).single()
          : Promise.resolve({ data: null }),
      ]);
      return { event, gate };
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading pass…</div>;
  if (!pass) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Pass not found</h1>
        <p className="text-sm text-muted-foreground mt-1">This entry pass is invalid or expired.</p>
      </div>
    </div>
  );

  const slot = pass.arrival_slot ? new Date(pass.arrival_slot) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex flex-col">
      <header className="p-4"><Logo size="sm" /></header>
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl bg-card shadow-xl overflow-hidden border border-border/50"
        >
          <div className="bg-foreground text-background p-6 text-center">
            <p className="text-xs uppercase tracking-widest opacity-70">Smart Entry Pass</p>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>{details?.event?.name ?? "Event"}</h1>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl">
              <QRCode value={pass.pass_token} size={180} />
            </div>
          </div>
          <div className="px-6 pb-6 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Your Gate</p>
              <p className="font-bold text-lg mt-0.5">{details?.gate?.name ?? "TBA"}</p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Arrive by</p>
              <p className="font-bold text-lg mt-0.5">{slot ? slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <a
              href={details?.event?.slug ? `/venue/${details.event.slug}` : "#"}
              className="block w-full text-center rounded-full bg-primary text-primary-foreground py-3 font-medium text-sm"
            >
              Open live venue map
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
