import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useEffect } from "react";

export type Venue = Tables<"venues">;
export type VenueZone = Tables<"venue_zones">;
export type WaitTimePing = Tables<"wait_time_pings">;
export type Broadcast = Tables<"broadcasts">;
export type Incident = Tables<"incidents">;
export type EntryPass = Tables<"entry_passes">;

export function useVenue(eventId: string | undefined) {
  return useQuery({
    queryKey: ["venue", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("venues").select("*").eq("event_id", eventId!).maybeSingle();
      if (error) throw error;
      return data as Venue | null;
    },
    enabled: !!eventId,
  });
}

export function useUpsertVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"venues">) => {
      const { data, error } = await supabase.from("venues").upsert(input, { onConflict: "event_id" }).select().single();
      if (error) throw error;
      return data as Venue;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ["venue", data.event_id] }),
  });
}

export function useZones(venueId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!venueId) return;
    const ch = supabase.channel(`zones-${venueId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "venue_zones", filter: `venue_id=eq.${venueId}` },
        () => qc.invalidateQueries({ queryKey: ["zones", venueId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [venueId, qc]);

  return useQuery({
    queryKey: ["zones", venueId],
    queryFn: async () => {
      const { data, error } = await supabase.from("venue_zones").select("*").eq("venue_id", venueId!).order("created_at");
      if (error) throw error;
      return data as VenueZone[];
    },
    enabled: !!venueId,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"venue_zones">) => {
      const { data, error } = await supabase.from("venue_zones").insert(input).select().single();
      if (error) throw error;
      return data as VenueZone;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ["zones", data.venue_id] }),
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, venue_id }: { id: string; venue_id: string }) => {
      const { error } = await supabase.from("venue_zones").delete().eq("id", id);
      if (error) throw error;
      return venue_id;
    },
    onSuccess: (venue_id) => qc.invalidateQueries({ queryKey: ["zones", venue_id] }),
  });
}

// Latest ping per zone (for live density)
export function useLatestPings(venueId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!venueId) return;
    const ch = supabase.channel(`pings-${venueId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wait_time_pings" },
        () => qc.invalidateQueries({ queryKey: ["pings", venueId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [venueId, qc]);

  return useQuery({
    queryKey: ["pings", venueId],
    queryFn: async () => {
      const { data: zones } = await supabase.from("venue_zones").select("id").eq("venue_id", venueId!);
      if (!zones?.length) return {} as Record<string, WaitTimePing>;
      const ids = zones.map((z) => z.id);
      const { data, error } = await supabase
        .from("wait_time_pings")
        .select("*")
        .in("zone_id", ids)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const latest: Record<string, WaitTimePing> = {};
      (data as WaitTimePing[]).forEach((p) => { if (!latest[p.zone_id]) latest[p.zone_id] = p; });
      return latest;
    },
    enabled: !!venueId,
  });
}

export function useSubmitPing() {
  return useMutation({
    mutationFn: async (input: TablesInsert<"wait_time_pings">) => {
      const { error } = await supabase.from("wait_time_pings").insert(input);
      if (error) throw error;
    },
  });
}

export function useBroadcasts(eventId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!eventId) return;
    const ch = supabase.channel(`bc-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "broadcasts", filter: `event_id=eq.${eventId}` },
        () => qc.invalidateQueries({ queryKey: ["broadcasts", eventId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [eventId, qc]);

  return useQuery({
    queryKey: ["broadcasts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("broadcasts").select("*").eq("event_id", eventId!).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Broadcast[];
    },
    enabled: !!eventId,
  });
}

export function useSendBroadcast() {
  return useMutation({
    mutationFn: async (input: TablesInsert<"broadcasts">) => {
      const { error } = await supabase.from("broadcasts").insert(input);
      if (error) throw error;
    },
  });
}

export function useIncidents(eventId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!eventId) return;
    const ch = supabase.channel(`inc-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents", filter: `event_id=eq.${eventId}` },
        () => qc.invalidateQueries({ queryKey: ["incidents", eventId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [eventId, qc]);

  return useQuery({
    queryKey: ["incidents", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("incidents").select("*").eq("event_id", eventId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Incident[];
    },
    enabled: !!eventId,
  });
}

export function useCreateIncident() {
  return useMutation({
    mutationFn: async (input: TablesInsert<"incidents">) => {
      const { error } = await supabase.from("incidents").insert(input);
      if (error) throw error;
    },
  });
}

export function useResolveIncident() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("incidents").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
  });
}

// Public attendee pass lookup by token
export function useEntryPassByToken(token: string | undefined) {
  return useQuery({
    queryKey: ["pass", token],
    queryFn: async () => {
      const { data, error } = await supabase.from("entry_passes").select("*").eq("pass_token", token!).maybeSingle();
      if (error) throw error;
      return data as EntryPass | null;
    },
    enabled: !!token,
  });
}

// Density helpers (Little's Law: wait_min = queue / service_rate)
export function estimateWait(zone: VenueZone, ping?: WaitTimePing): number | null {
  if (!ping?.queue_length || !zone.service_rate_per_min) return null;
  return Math.round(ping.queue_length / Number(zone.service_rate_per_min));
}

export function densityColor(pct: number | null | undefined): string {
  if (pct == null) return "hsl(var(--muted))";
  if (pct < 40) return "hsl(142 70% 45%)";
  if (pct < 70) return "hsl(38 92% 55%)";
  return "hsl(var(--primary))";
}

export function densityLabel(pct: number | null | undefined): string {
  if (pct == null) return "No data";
  if (pct < 40) return "Clear";
  if (pct < 70) return "Busy";
  return "Crowded";
}
