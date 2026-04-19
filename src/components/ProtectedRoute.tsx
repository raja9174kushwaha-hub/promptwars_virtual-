import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ 
  children, 
  requiredMode 
}: { 
  children: React.ReactNode;
  requiredMode?: "organizer" | "attendee";
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const savedMode = localStorage.getItem("userMode");
  if (requiredMode && savedMode && requiredMode !== savedMode) {
    if (savedMode === "organizer") return <Navigate to="/dashboard/events" replace />;
    if (savedMode === "attendee") return <Navigate to="/attendee/home" replace />;
  }

  return <>{children}</>;
}
