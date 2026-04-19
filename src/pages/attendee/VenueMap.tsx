import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation2, Search, Coffee, Armchair, DoorClosed, Map } from "lucide-react";

export default function VenueMap() {
  const [search, setSearch] = useState("");

  const destinations = [
    { title: "My Seat (B-12)", icon: Armchair, type: "seat", time: "2 min walk" },
    { title: "Food Court", icon: Coffee, type: "amenity", time: "5 min walk" },
    { title: "Exit A", icon: DoorClosed, type: "exit", time: "1 min walk" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold">Venue Map</h1>
        <p className="text-muted-foreground mt-1 text-sm">Find your way around the event.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search for booths, stages, or restrooms..." 
          className="pl-9 h-12 rounded-xl bg-card border-border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Suggested Routes */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {destinations.map((dest, i) => (
          <Button key={i} variant="secondary" className="rounded-xl h-auto py-3 px-4 flex-col items-start gap-2 shrink-0 bg-card border border-border hover:bg-muted">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <dest.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{dest.title}</p>
                <p className="text-xs text-muted-foreground">{dest.time}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* 3D Map View Simulation */}
      <Card className="overflow-hidden border-2 rounded-2xl">
        <div className="relative aspect-[4/3] sm:aspect-video bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay" />
          
          <div className="w-full max-w-md bg-slate-800 rounded-3xl p-3 border-4 border-slate-700 shadow-2xl relative isolate rotation-3d transform-gpu rotate-x-12 rotate-y-[-5deg] scale-105 transition-transform duration-1000 hover:rotate-x-0 hover:rotate-y-0">
            {/* Path SVG Simulation */}
            <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.5))' }}>
               <path d="M 50 250 L 150 250 L 150 100 L 300 100" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 8" className="animate-dash" />
            </svg>

            {/* Layout Box 1 */}
            <div className="h-24 bg-slate-700 rounded-xl mb-3 flex items-center justify-center opacity-80 border-b-4 border-slate-600">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Stage</span>
            </div>
            {/* Layout Box 2 */}
            <div className="flex gap-3 h-40">
              <div className="flex-1 bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Seats A</span>
              </div>
              <div className="flex-1 bg-primary/20 rounded-xl flex items-center justify-center border-2 border-primary relative overflow-hidden group">
                <span className="text-primary font-bold uppercase tracking-widest text-xs z-10">Seats B</span>
                {/* Current target marker */}
                <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping z-0" />
                <MapPin className="relative z-10 w-6 h-6 text-primary mt-6 group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>
          
          {/* Navigation Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl">
             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
               <Navigation2 className="w-5 h-5 text-primary-foreground transform -rotate-45" />
             </div>
             <div>
               <p className="text-white font-bold text-sm">Proceed straight</p>
               <p className="text-white/60 text-xs text-center">in 50 feet</p>
             </div>
          </div>

        </div>
      </Card>
      
      <style>{`
        .animate-dash {
          animation: dash 1.5s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </div>
  );
}
