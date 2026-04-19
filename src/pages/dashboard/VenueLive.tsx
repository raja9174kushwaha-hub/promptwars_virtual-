import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEvent } from "@/hooks/useEvents";
import {
  useVenue, useUpsertVenue, useZones, useCreateZone, useDeleteZone,
  useLatestPings, useSubmitPing, useBroadcasts, useSendBroadcast,
  useIncidents, useCreateIncident, useResolveIncident, VenueZone,
} from "@/hooks/useVenue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ZoneHeatmap, ZoneCard } from "@/components/venue/ZoneHeatmap";
import { toast } from "sonner";
import { ArrowLeft, Plus, Megaphone, AlertTriangle, Trash2, Radio, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const ZONE_TYPES = ["gate", "concourse", "section", "concession", "restroom", "first_aid", "exit"];

export default function VenueLive() {
  const { id } = useParams();
  const { data: event } = useEvent(id);
  const { data: venue } = useVenue(id);
  const upsertVenue = useUpsertVenue();
  const { data: zones = [] } = useZones(venue?.id);
  const { data: pings = {} } = useLatestPings(venue?.id);
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();
  const submitPing = useSubmitPing();
  const { data: broadcasts = [] } = useBroadcasts(id);
  const sendBroadcast = useSendBroadcast();
  const { data: incidents = [] } = useIncidents(id);
  const createIncident = useCreateIncident();
  const resolveIncident = useResolveIncident();

  const [selected, setSelected] = useState<VenueZone | null>(null);
  const [venueName, setVenueName] = useState("");
  const [venueCap, setVenueCap] = useState("");

  // New zone
  const [zName, setZName] = useState("");
  const [zType, setZType] = useState("gate");
  const [zCap, setZCap] = useState("");
  const [zRate, setZRate] = useState("");

  // Broadcast
  const [bTitle, setBTitle] = useState("");
  const [bBody, setBBody] = useState("");
  const [bSeverity, setBSeverity] = useState("info");

  // Incident
  const [iTitle, setITitle] = useState("");
  const [iCategory, setICategory] = useState("medical");

  // Ping update
  const [pQueue, setPQueue] = useState("");
  const [pDensity, setPDensity] = useState("");

  if (!event) return <div className="p-6">Loading…</div>;

  const handleCreateVenue = async () => {
    if (!venueName.trim()) return toast.error("Venue name required");
    await upsertVenue.mutateAsync({
      event_id: id!,
      name: venueName,
      total_capacity: venueCap ? parseInt(venueCap) : null,
    });
    toast.success("Venue created");
    setVenueName(""); setVenueCap("");
  };

  const handleAddZone = async () => {
    if (!venue || !zName.trim()) return;
    await createZone.mutateAsync({
      venue_id: venue.id,
      name: zName,
      zone_type: zType,
      capacity: zCap ? parseInt(zCap) : null,
      service_rate_per_min: zRate ? parseFloat(zRate) : null,
      pos_x: 20 + Math.floor(Math.random() * 60),
      pos_y: 20 + Math.floor(Math.random() * 60),
    });
    setZName(""); setZCap(""); setZRate("");
    toast.success("Zone added");
  };

  const handlePing = async () => {
    if (!selected) return;
    await submitPing.mutateAsync({
      zone_id: selected.id,
      source: "staff",
      queue_length: pQueue ? parseInt(pQueue) : null,
      density_pct: pDensity ? parseInt(pDensity) : null,
    });
    setPQueue(""); setPDensity("");
    toast.success("Status updated");
  };

  const handleBroadcast = async () => {
    if (!bTitle.trim()) return;
    await sendBroadcast.mutateAsync({
      event_id: id!,
      title: bTitle,
      body: bBody || null,
      severity: bSeverity,
      zone_id: selected?.id ?? null,
    });
    setBTitle(""); setBBody("");
    toast.success("Broadcast sent");
  };

  const handleIncident = async () => {
    if (!iTitle.trim()) return;
    await createIncident.mutateAsync({
      event_id: id!,
      title: iTitle,
      category: iCategory,
      zone_id: selected?.id ?? null,
    });
    setITitle("");
    toast.success("Incident logged");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/dashboard/events/${id}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to event
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            SmartVenue Live <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted-foreground">{event.name}</p>
        </div>
        {venue && (
          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/venue/${event.slug}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" /> Attendee view
            </Link>
          </Button>
        )}
      </div>

      {!venue ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card p-6 sm:p-8 border border-border/50 max-w-xl">
          <h2 className="text-lg font-semibold mb-1">Set up your venue</h2>
          <p className="text-sm text-muted-foreground mb-4">Create the digital twin of your venue to enable live operations.</p>
          <div className="space-y-3">
            <div>
              <Label>Venue name</Label>
              <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g. Stadium North Arena" />
            </div>
            <div>
              <Label>Total capacity (optional)</Label>
              <Input type="number" value={venueCap} onChange={(e) => setVenueCap(e.target.value)} placeholder="50000" />
            </div>
            <Button onClick={handleCreateVenue} className="rounded-full h-11 w-full">Create venue</Button>
          </div>
        </motion.div>
      ) : (
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="map" className="rounded-full">Live Map</TabsTrigger>
            <TabsTrigger value="zones" className="rounded-full">Zones</TabsTrigger>
            <TabsTrigger value="broadcasts" className="rounded-full">Broadcasts</TabsTrigger>
            <TabsTrigger value="incidents" className="rounded-full">Incidents</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div>
                <ZoneHeatmap zones={zones} pings={pings} onSelect={setSelected} selectedId={selected?.id} />
              </div>
              <div className="space-y-3">
                {selected ? (
                  <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl bg-card p-4 border border-border/50 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground capitalize">{selected.zone_type}</p>
                      <h3 className="font-semibold">{selected.name}</h3>
                    </div>
                    <ZoneCard zone={selected} ping={pings[selected.id]} />
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium">Update live status</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Queue" type="number" value={pQueue} onChange={(e) => setPQueue(e.target.value)} />
                        <Input placeholder="Density %" type="number" max={100} value={pDensity} onChange={(e) => setPDensity(e.target.value)} />
                      </div>
                      <Button size="sm" onClick={handlePing} className="w-full rounded-full">
                        <Radio className="w-3.5 h-3.5 mr-1.5" /> Ping update
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-2xl bg-muted/30 p-6 text-sm text-muted-foreground text-center border border-dashed border-border">
                    Tap a zone on the map to update its live status
                  </div>
                )}
                <div className="rounded-2xl bg-card p-4 border border-border/50 space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Quick broadcast</p>
                  <Input placeholder="Title" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
                  <Textarea placeholder="Message" rows={2} value={bBody} onChange={(e) => setBBody(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={bSeverity} onValueChange={setBSeverity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleBroadcast} className="rounded-full">Send</Button>
                  </div>
                  {selected && <p className="text-xs text-muted-foreground">Targeting: {selected.name}</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <div className="rounded-2xl bg-card p-4 border border-border/50 space-y-3">
              <p className="font-medium text-sm">Add a zone</p>
              <div className="grid sm:grid-cols-5 gap-2">
                <Input placeholder="Name" value={zName} onChange={(e) => setZName(e.target.value)} />
                <Select value={zType} onValueChange={setZType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ZONE_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Capacity" type="number" value={zCap} onChange={(e) => setZCap(e.target.value)} />
                <Input placeholder="Service / min" type="number" step="0.1" value={zRate} onChange={(e) => setZRate(e.target.value)} />
                <Button onClick={handleAddZone} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zones.map((z) => (
                <div key={z.id} className="relative">
                  <ZoneCard zone={z} ping={pings[z.id]} />
                  <Button
                    size="sm" variant="ghost"
                    className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteZone.mutate({ id: z.id, venue_id: z.venue_id })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="broadcasts" className="space-y-3">
            {broadcasts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No broadcasts yet</p>
            ) : broadcasts.map((b) => (
              <div key={b.id} className="rounded-2xl bg-card p-4 border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.severity === "critical" ? "bg-primary text-primary-foreground" : b.severity === "warning" ? "bg-amber-500/20 text-amber-700" : "bg-muted"}`}>{b.severity}</span>
                      <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold">{b.title}</p>
                    {b.body && <p className="text-sm text-muted-foreground mt-1">{b.body}</p>}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div className="rounded-2xl bg-card p-4 border border-border/50 space-y-3">
              <p className="font-medium text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Log incident</p>
              <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
                <Input placeholder="What happened?" value={iTitle} onChange={(e) => setITitle(e.target.value)} />
                <Select value={iCategory} onValueChange={setICategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="lost_found">Lost &amp; Found</SelectItem>
                    <SelectItem value="crowding">Crowding</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleIncident} className="rounded-full">Log</Button>
              </div>
            </div>
            <div className="space-y-2">
              {incidents.map((inc) => (
                <div key={inc.id} className="rounded-2xl bg-card p-4 border border-border/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{inc.category.replace("_", " ")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inc.status === "open" ? "bg-primary/15 text-primary" : "bg-emerald-500/15 text-emerald-700"}`}>{inc.status}</span>
                    </div>
                    <p className="font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(inc.created_at).toLocaleString()}</p>
                  </div>
                  {inc.status === "open" && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => resolveIncident.mutate(inc.id)}>Resolve</Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
