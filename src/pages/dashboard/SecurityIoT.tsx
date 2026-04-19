import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Video, Users, Thermometer, ShieldCheck, Activity, AlertTriangle, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

const CAMERAS = [
  { id: 1, name: "Main Entrance", status: "active", threat: false, url: "https://images.unsplash.com/photo-1541818276707-1bc54de8f1ee?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "VIP Lounge", status: "active", threat: false, url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Hall A Center", status: "active", threat: true, url: "https://images.unsplash.com/photo-1470229722913-7c090be5c52c?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Emergency Exit 2", status: "active", threat: false, url: "https://images.unsplash.com/photo-1582216654890-a7d1fb7e0ce5?auto=format&fit=crop&q=80&w=800" },
  { id: 5, name: "Food Court", status: "active", threat: false, url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Parking Level 1", status: "offline", threat: false, url: "" }
];

export default function SecurityIoT() {
  const [pulse, setPulse] = useState(false);
  const [sosAlert, setSosAlert] = useState<{time: number, user: string, location: string} | null>(null);

  useEffect(() => {
    const i = setInterval(() => {
      setPulse(p => !p);
      const sosData = localStorage.getItem('sos_alert');
      if (sosData) {
        try {
          const parsed = JSON.parse(sosData);
          // Only show if the alert is less than 5 minutes old
          if (Date.now() - parsed.time < 300000) {
            setSosAlert(parsed);
          }
        } catch(e) {}
      }
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center">
            Security & IoT Command <ShieldCheck className="w-8 h-8 ml-3 text-emerald-500" />
          </h1>
          <p className="text-muted-foreground mt-1">Real-time CCTV and smart venue telemetry.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 h-8 px-3">
            <span className={`w-2 h-2 rounded-full bg-destructive mr-2 ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
            {sosAlert ? "2" : "1"} Alert(s) Active
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 h-8 px-3">
            System Nominal
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Alerts & Telemetry */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-destructive/30 shadow-sm overflow-hidden">
            <div className="bg-destructive/10 border-b border-destructive/20 p-3 flex items-center justify-between">
              <span className="font-semibold text-destructive flex items-center text-sm"><ShieldAlert className="w-4 h-4 mr-2" /> ACTIVE ALERTS</span>
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold">{sosAlert ? 2 : 1}</span>
            </div>
            <CardContent className="p-4 space-y-3 bg-destructive/5">
              
              {sosAlert && (
                <div className="p-3 bg-background rounded-lg border-2 border-red-500 shadow-lg relative overflow-hidden animate-pulse">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600" />
                  <h4 className="font-black text-red-600 uppercase flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> MEDICAL SOS</h4>
                  <p className="text-sm font-semibold mt-1">{sosAlert.location}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Attendee: {sosAlert.user}</p>
                  <Button size="sm" variant="destructive" className="w-full h-8 mt-3 text-xs font-bold" onClick={() => localStorage.removeItem('sos_alert')}>
                    Acknowledge & Dispatch
                  </Button>
                </div>
              )}

              <div className="p-3 bg-background rounded-lg border border-destructive/20 shadow-sm relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-destructive transition-opacity ${pulse ? 'opacity-100' : 'opacity-40'}`} />
                <h4 className="font-semibold text-sm">Crowd Density High</h4>
                <p className="text-xs text-muted-foreground mt-1">Hall A Center is at 95% capacity. Risk of bottleneck.</p>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded mt-2 inline-block">CAM-03</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center text-sm"><Activity className="w-4 h-4 mr-2" /> Live Telemetry</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center"><Users className="w-3 h-3 mr-1" /> Total Occupancy</span>
                    <span className="font-bold">4,192 / 5,000</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[84%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center"><Thermometer className="w-3 h-3 mr-1" /> Avg Temp</span>
                    <span className="font-bold text-amber-500">74°F</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[65%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CCTV Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMERAS.map((cam) => (
              <Card key={cam.id} className={`overflow-hidden border-2 ${cam.threat ? 'border-destructive' : 'border-transparent'} group`}>
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {cam.status === "offline" ? (
                    <div className="text-white/30 flex flex-col items-center">
                      <Video className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-mono tracking-widest uppercase">Signal Lost</span>
                    </div>
                  ) : (
                    <>
                      <img src={cam.url} className={`w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity ${cam.threat ? 'scale-105' : ''}`} alt={cam.name} />
                      {/* Fake video static/scanline overlay */}
                      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                    </>
                  )}
                  
                  {/* Camera overlay UI */}
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-md text-[9px] font-mono rounded px-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cam.status === 'offline' ? 'bg-muted' : pulse && cam.threat ? 'bg-destructive' : 'bg-red-500'}`} />
                      REC
                    </Badge>
                    {cam.threat && (
                      <Badge variant="outline" className="bg-destructive/80 text-white border-destructive text-[9px] font-mono rounded px-1.5 animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" /> ALERT
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
                      CAM-0{cam.id}: {cam.name.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                     <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
                      14:0{cam.id}:22
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
