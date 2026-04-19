import { useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, CalendarDays, Compass, LogOut } from "lucide-react";

const attendeeNav = [
  { title: "Home", url: "/attendee/home", icon: Home },
  { title: "My Events", url: "/attendee/my-events", icon: CalendarDays },
  { title: "Explore", url: "/attendee/explore", icon: Compass },
];

export function AttendeeLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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
      <main ref={mainRef} className="flex-1 p-4 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
