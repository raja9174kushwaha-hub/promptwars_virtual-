import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, Settings, Plus, MonitorPlay, Armchair, Circle, Users, Square } from "lucide-react";

type LayoutType = "theater" | "stadium" | "workshop" | "banquet";
type StagePosition = "front" | "center" | "none";

export default function SeatingArrangement() {
  const [activeSector, setActiveSector] = useState("A");
  const [layoutType, setLayoutType] = useState<LayoutType>("theater");
  const [stagePosition, setStagePosition] = useState<StagePosition>("front");

  // Standard Straight Rows (Theater / Concert / Meeting)
  const renderTheater = (rows: number, cols: number, startRow: string) => {
    return Array.from({ length: rows }).map((_, rIndex) => (
      <div key={rIndex} className="flex gap-2 justify-center mb-2">
        <div className="w-6 text-xs text-muted-foreground flex items-center justify-center font-bold">
          {String.fromCharCode(startRow.charCodeAt(0) + rIndex)}
        </div>
        {Array.from({ length: cols }).map((_, cIndex) => {
          const isVip = rIndex < 2;
          return (
            <div
              key={cIndex}
              className={`w-8 h-8 rounded-t-lg rounded-b-sm border-b-4 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-110 ${
                isVip
                  ? "bg-amber-100 border-amber-400 text-amber-700 shadow-sm"
                  : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              }`}
            >
              {cIndex + 1}
            </div>
          );
        })}
      </div>
    ));
  };

  // U-Shape / Workshop
  const renderWorkshop = () => {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
         <div className="flex gap-16">
            {/* Left Wing */}
            <div className="flex flex-col gap-2">
              {Array.from({length: 6}).map((_, i) => (
                 <div key={`l-${i}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-l-lg border-l-4 bg-primary/10 border-primary/30 text-primary flex items-center justify-center text-[10px] font-bold">L{i+1}</div>
                    <div className="w-12 h-8 bg-muted rounded-sm" /> {/* Desk */}
                 </div>
              ))}
            </div>
            {/* Right Wing */}
            <div className="flex flex-col gap-2">
              {Array.from({length: 6}).map((_, i) => (
                 <div key={`r-${i}`} className="flex items-center gap-2">
                    <div className="w-12 h-8 bg-muted rounded-sm" /> {/* Desk */}
                    <div className="w-8 h-8 rounded-r-lg border-r-4 bg-primary/10 border-primary/30 text-primary flex items-center justify-center text-[10px] font-bold">R{i+1}</div>
                 </div>
              ))}
            </div>
         </div>
         {/* Bottom Connecting Wing */}
         <div className="flex flex-col items-center gap-2">
            <div className="w-64 h-12 bg-muted rounded-sm" />
            <div className="flex gap-2">
               {Array.from({length: 6}).map((_, i) => (
                 <div key={`b-${i}`} className="w-8 h-8 rounded-b-lg border-b-4 bg-primary/10 border-primary/30 text-primary flex items-center justify-center text-[10px] font-bold">B{i+1}</div>
               ))}
            </div>
         </div>
      </div>
    );
  };

  // Round Tables (Banquet / Gala)
  const renderBanquet = () => {
    return (
      <div className="grid grid-cols-3 gap-12 mt-8">
         {Array.from({length: 6}).map((_, tableIdx) => (
           <div key={tableIdx} className="relative w-32 h-32 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-500">T-{tableIdx + 1}</span>
              </div>
              {/* Seats around the table */}
              {Array.from({length: 8}).map((_, seatIdx) => {
                 const angle = (seatIdx * 45) * (Math.PI / 180);
                 const radius = 34; // Distance from center
                 const top = `calc(50% + ${Math.sin(angle) * radius}px - 10px)`;
                 const left = `calc(50% + ${Math.cos(angle) * radius}px - 10px)`;
                 return (
                   <div 
                      key={seatIdx} 
                      className="absolute w-5 h-5 rounded-full bg-primary/10 border border-primary/40 text-[8px] flex items-center justify-center font-bold text-primary cursor-pointer hover:bg-primary/30"
                      style={{ top, left }}
                   >
                     {seatIdx + 1}
                   </div>
                 );
              })}
           </div>
         ))}
      </div>
    );
  };

  // Stadium Mode (Curved Around Central Area)
  const renderStadium = () => {
    return (
       <div className="relative w-[600px] h-[400px] flex items-center justify-center mt-12">
          {/* Main Stadium Pitch/Court */}
          {stagePosition === "center" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-4 border-emerald-500/30 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <span className="font-bold tracking-widest text-emerald-600/50">MATCH PITCH</span>
            </div>
          )}

          {/* Curved seating rings */}
          {Array.from({length: 3}).map((_, ringIdx) => {
             const seatsInRing = 16 + (ringIdx * 8);
             const radius = 100 + (ringIdx * 40);
             return Array.from({length: seatsInRing}).map((_, seatIdx) => {
                // If it's front stage, only draw a semi-circle top curve, otherwise full oval.
                const startAngle = stagePosition === "front" ? Math.PI : 0;
                const endAngle = stagePosition === "front" ? Math.PI * 2 : Math.PI * 2;
                const angleStep = (endAngle - startAngle) / (seatsInRing);
                const angle = startAngle + (seatIdx * angleStep);

                const top = `calc(50% + ${Math.sin(angle) * radius}px - 12px)`;
                const left = `calc(50% + ${Math.cos(angle) * radius}px - 12px)`;
                
                return (
                 <div 
                    key={`${ringIdx}-${seatIdx}`} 
                    className="absolute w-6 h-6 rounded bg-primary/10 border border-primary/40 text-[8px] flex items-center justify-center font-bold text-primary cursor-pointer hover:bg-primary/30 hover:scale-125 transition-transform"
                    style={{ 
                      top, left, 
                      transform: `rotate(${angle + Math.PI/2}rad)` 
                    }}
                 >
                   {seatIdx + 1}
                 </div>
                );
             });
          })}
       </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Venue Layout Designer</h1>
          <p className="text-muted-foreground mt-1">Design seats based on your event's specific needs.</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Settings className="w-4 h-4 mr-2" /> Global Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Global Seating Settings</DialogTitle>
                <DialogDescription>
                  Configure rules that apply across all sectors and layouts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency" className="col-span-3">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">Max Capacity</Label>
                  <Input id="capacity" type="number" defaultValue="5000" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="spacing" className="text-right">Seat Spacing</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="spacing" className="col-span-3">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="spacious">Spacious (Social Distancing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button><Plus className="w-4 h-4 mr-2" /> Add Sector</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left pane: Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-primary/20 bg-primary/5">
     <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="font-semibold text-sm mb-2">Venue Layout Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={layoutType === "theater" ? "default" : "outline"} 
                    className="h-14 flex-col gap-1 text-xs"
                    onClick={() => setLayoutType("theater")}
                  >
                    <Armchair className="w-4 h-4" /> Theater
                  </Button>
                  <Button 
                    variant={layoutType === "stadium" ? "default" : "outline"} 
                    className="h-14 flex-col gap-1 text-xs"
                    onClick={() => setLayoutType("stadium")}
                  >
                    <Circle className="w-4 h-4" /> Stadium
                  </Button>
                  <Button 
                    variant={layoutType === "workshop" ? "default" : "outline"} 
                    className="h-14 flex-col gap-1 text-xs"
                    onClick={() => setLayoutType("workshop")}
                  >
                    <Square className="w-4 h-4" /> Workshop
                  </Button>
                  <Button 
                    variant={layoutType === "banquet" ? "default" : "outline"} 
                    className="h-14 flex-col gap-1 text-xs"
                    onClick={() => setLayoutType("banquet")}
                  >
                    <Users className="w-4 h-4" /> Banquet
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Stage Position</h3>
                <Select value={stagePosition} onValueChange={(val) => setStagePosition(val as StagePosition)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front (Concerts / Panels)</SelectItem>
                    <SelectItem value="center">Center / 360° (Sports / Boxing)</SelectItem>
                    <SelectItem value="none">No Stage / Scattered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center"><Map className="w-4 h-4 mr-2" /> Sectors</h3>
              <div className="space-y-2">
                {['A', 'B', 'Balcony'].map(sector => (
                  <Button
                    key={sector}
                    variant={activeSector === sector ? "default" : "ghost"}
                    className="w-full justify-start font-medium"
                    onClick={() => setActiveSector(sector)}
                  >
                    Sector {sector}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right pane: Visual Map */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[600px] border-2 border-border/50 shadow-sm relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-8 relative z-10 bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Sector {activeSector}</h2>
                  <Badge variant="secondary" className="capitalize text-xs">{layoutType} Layout</Badge>
                  {stagePosition !== "none" && (
                     <Badge variant="outline" className="capitalize text-xs text-muted-foreground">{stagePosition} Stage</Badge>
                  )}
                </div>
                <Button size="sm" variant="default"><Armchair className="w-3.5 h-3.5 mr-2" /> Publish Layout</Button>
              </div>

              {/* Grid Background Pattern */}
              <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/graphy.png')] opacity-[0.03] pointer-events-none" />

              {/* Stage indicator (if front layout) */}
              {stagePosition === "front" && layoutType !== "stadium" && (
                <div className="w-full max-w-lg mx-auto h-16 bg-slate-900 rounded-t-3xl flex items-center justify-center mb-12 shadow-2xl relative">
                  <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <span className="font-display font-semibold tracking-widest text-slate-400 flex items-center gap-2 text-sm">
                    <MonitorPlay className="w-5 h-5" /> MAIN STAGE
                  </span>
                </div>
              )}

              {/* Render Selected Layout */}
              <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                {layoutType === "theater" && renderTheater(6, 14, 'A')}
                {layoutType === "workshop" && renderWorkshop()}
                {layoutType === "banquet" && renderBanquet()}
                {layoutType === "stadium" && renderStadium()}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
