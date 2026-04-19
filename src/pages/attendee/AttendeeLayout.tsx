import { useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, CalendarDays, Compass, LogOut, Map as MapIcon, Siren, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

const attendeeNav = [
  { title: "Home", url: "/attendee/home", icon: Home },
  { title: "My Events", url: "/attendee/my-events", icon: CalendarDays },
  { title: "Explore", url: "/attendee/explore", icon: Compass },
  { title: "Venue Map", url: "/attendee/map", icon: MapIcon },
];

export function AttendeeLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSOS = () => {
    // Simulate sending SOS to organizer
    localStorage.setItem('sos_alert', JSON.stringify({
      time: Date.now(),
      user: user?.email || 'Unknown Attendee',
      location: 'Seat B-12 (Sector A)'
    }));
    toast.error("SOS Alert Dispatched to Security!", {
      duration: 5000,
      icon: <Siren className="w-5 h-5 text-destructive" />
    });
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-14 flex items-center px-6 gap-4 border-b border-border/50">
        <Link to="/attendee/home" className="mr-6 shrink-0">
          <Logo size="sm" />
        </Link>
        {/* Attendee badge */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
          Attendee Portal
        </span>
        <div className="flex-1 flex items-center h-full overflow-x-auto">
          <div className="flex items-center gap-1">
            {attendeeNav.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-full transition-colors hover:text-foreground hover:bg-muted"
                activeClassName="bg-foreground text-background hover:bg-foreground hover:text-background"
              >
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <span className="text-xs text-muted-foreground hidden lg:block truncate max-w-[160px]">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main ref={mainRef} className="flex-1 p-4 sm:p-6 overflow-auto relative">
        {children}

        {/* FLOATING SOS BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="destructive" className="w-14 h-14 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all animate-pulse">
                <Siren className="w-7 h-7" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-destructive/20 bg-destructive/5">
              <DialogHeader>
                <DialogTitle className="flex items-center text-destructive text-2xl">
                  <AlertTriangle className="w-6 h-6 mr-2" /> EMERGENCY SOS
                </DialogTitle>
                <DialogDescription className="text-base text-foreground mt-2">
                  Are you sure you want to dispatch security and medical teams to your location? 
                  <br/><br/>
                  <strong>Your registered location:</strong> Seat B-12 (Sector A)
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="button" variant="destructive" onClick={handleSOS}>Yes, Send Help Now!</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
