import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Send, Route, RadioTower, Users, Flame } from "lucide-react";

export default function VenueMapAdmin() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center">
            Crowd Control Map <MapIcon className="w-8 h-8 ml-3 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Manage attendee flow and send directional notifications.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Route className="w-4 h-4 mr-2" /> Draw Evacuation Route</Button>
          <Button><Send className="w-4 h-4 mr-2" /> Push Alert to Zone</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center text-sm"><RadioTower className="w-4 h-4 mr-2" /> Zone Controls</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Entrance A</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Flowing</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">342 people/min</p>
                </div>
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Hall B Expo</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">Heavy</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Recommend diverting to Hall C.</p>
                  <Button size="sm" variant="destructive" className="w-full h-7 mt-2 text-[10px]">Divert Traffic</Button>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Food Court</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Moderate</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Peak hours starting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden relative border-2 border-border/50">
            {/* Highly stylized placeholder for an interactive venue map */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-8">
               
               <div className="relative w-full max-w-2xl aspect-video border-[6px] border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl bg-white dark:bg-slate-900 overflow-hidden isolate p-4 grid grid-cols-3 grid-rows-3 gap-2">
                 {/* Map grid simulation */}
                 <div className="col-span-1 row-span-3 bg-slate-100 dark:bg-slate-800 rounded-xl relative flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold tracking-widest rotate-[-90deg]">HALL A</span>
                 </div>
                 
                 <div className="col-span-2 row-span-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl relative flex items-center justify-center border border-amber-200 dark:border-amber-700/30 overflow-hidden">
                    <span className="text-amber-600 dark:text-amber-400 font-bold tracking-widest z-10">HALL B (MAIN EXPO)</span>
                    {/* Heatmap simulation */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-destructive rounded-full blur-3xl opacity-40 mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                     <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-amber-500 rounded-full blur-2xl opacity-40 mix-blend-multiply dark:mix-blend-screen" />
                 </div>

                  <div className="col-span-1 row-span-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-700/30">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest text-xs">FOOD COURT</span>
                 </div>

                  <div className="col-span-1 row-span-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold tracking-widest text-xs">ENTRANCE</span>
                 </div>

                 {/* Interactive Markers */}
                 <div className="absolute top-[20%] left-[45%] lg:left-[55%] flex flex-col items-center">
                    <div className="w-8 h-8 bg-destructive/20 border border-destructive rounded-full flex items-center justify-center ring-4 ring-destructive/10 animate-pulse">
                      <Flame className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="bg-background text-foreground text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded shadow-sm">Overcrowded</span>
                 </div>
               </div>

               <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Normal Flow</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Moderate</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Heavy Traffic</div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
