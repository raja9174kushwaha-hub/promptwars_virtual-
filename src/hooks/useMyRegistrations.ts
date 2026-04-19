import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MyRegistration = {
  id: string;
  event_id: string;
  data: Record<string, unknown>;
  status: string;
  created_at: string;
  events: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    event_date: string | null;
    event_type: string | null;
    status: string;
    primary_color: string | null;
  };
};

export function useMyRegistrations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-registrations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select(`*, events(id, name, slug, description, event_date, event_type, status, primary_color)`)
        .eq("data->>email", user?.email ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MyRegistration[];
    },
    enabled: !!user,
  });
}

export function usePublicEvents() {
  return useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "live")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
