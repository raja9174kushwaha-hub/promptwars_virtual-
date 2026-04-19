-- Venues
CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_capacity integer,
  doors_open_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX venues_event_id_unique ON public.venues(event_id);

-- Zone types: gate, concourse, section, concession, restroom, exit, first_aid
CREATE TABLE public.venue_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  zone_type text NOT NULL DEFAULT 'concourse',
  capacity integer,
  service_rate_per_min numeric,
  pos_x integer NOT NULL DEFAULT 50,
  pos_y integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX venue_zones_venue_idx ON public.venue_zones(venue_id);

-- Wait time pings (staff or anonymous)
CREATE TABLE public.wait_time_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.venue_zones(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'staff',
  queue_length integer,
  density_pct integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wait_time_pings_zone_idx ON public.wait_time_pings(zone_id, created_at DESC);

-- Entry passes
CREATE TABLE public.entry_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  gate_zone_id uuid REFERENCES public.venue_zones(id) ON DELETE SET NULL,
  arrival_slot timestamptz,
  pass_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX entry_passes_registration_unique ON public.entry_passes(registration_id);
CREATE UNIQUE INDEX entry_passes_token_unique ON public.entry_passes(pass_token);

-- Broadcasts
CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.venue_zones(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX broadcasts_event_idx ON public.broadcasts(event_id, created_at DESC);

-- Incidents
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.venue_zones(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX incidents_event_idx ON public.incidents(event_id, created_at DESC);

-- Updated_at triggers
CREATE TRIGGER venues_updated BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wait_time_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- venues policies
CREATE POLICY "Owners manage venues" ON public.venues FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Public can view venues for live events" ON public.venues FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = venues.event_id AND events.status = 'live'::event_status));

-- venue_zones policies
CREATE POLICY "Owners manage zones" ON public.venue_zones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM venues v JOIN events e ON e.id = v.event_id WHERE v.id = venue_zones.venue_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM venues v JOIN events e ON e.id = v.event_id WHERE v.id = venue_zones.venue_id AND e.user_id = auth.uid()));
CREATE POLICY "Public can view zones for live events" ON public.venue_zones FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM venues v JOIN events e ON e.id = v.event_id WHERE v.id = venue_zones.venue_id AND e.status = 'live'::event_status));

-- wait_time_pings policies
CREATE POLICY "Owners view all pings" ON public.wait_time_pings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM venue_zones z JOIN venues v ON v.id = z.venue_id JOIN events e ON e.id = v.event_id WHERE z.id = wait_time_pings.zone_id AND e.user_id = auth.uid()));
CREATE POLICY "Public can view recent pings for live events" ON public.wait_time_pings FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM venue_zones z JOIN venues v ON v.id = z.venue_id JOIN events e ON e.id = v.event_id WHERE z.id = wait_time_pings.zone_id AND e.status = 'live'::event_status));
CREATE POLICY "Anyone can submit ping for live event zone" ON public.wait_time_pings FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM venue_zones z JOIN venues v ON v.id = z.venue_id JOIN events e ON e.id = v.event_id WHERE z.id = wait_time_pings.zone_id AND e.status = 'live'::event_status));

-- entry_passes policies
CREATE POLICY "Owners manage passes" ON public.entry_passes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = entry_passes.event_id AND events.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = entry_passes.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Public can view pass by token via function" ON public.entry_passes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = entry_passes.event_id AND events.status = 'live'::event_status));

-- broadcasts policies
CREATE POLICY "Owners manage broadcasts" ON public.broadcasts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = broadcasts.event_id AND events.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = broadcasts.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Public view broadcasts for live events" ON public.broadcasts FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = broadcasts.event_id AND events.status = 'live'::event_status));

-- incidents policies (organizer-only)
CREATE POLICY "Owners manage incidents" ON public.incidents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = incidents.event_id AND events.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = incidents.event_id AND events.user_id = auth.uid()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.wait_time_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_zones;

-- Helper: assign gate by least-loaded balance
CREATE OR REPLACE FUNCTION public.assign_entry_pass(p_registration_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_venue_id uuid;
  v_gate_id uuid;
  v_event_date timestamptz;
  v_pass_id uuid;
BEGIN
  SELECT r.event_id INTO v_event_id FROM registrations r WHERE r.id = p_registration_id;
  IF v_event_id IS NULL THEN RETURN NULL; END IF;

  SELECT id INTO v_venue_id FROM venues WHERE event_id = v_event_id;
  IF v_venue_id IS NULL THEN RETURN NULL; END IF;

  SELECT event_date INTO v_event_date FROM events WHERE id = v_event_id;

  -- Pick the gate with the fewest assigned passes
  SELECT z.id INTO v_gate_id
  FROM venue_zones z
  LEFT JOIN entry_passes p ON p.gate_zone_id = z.id
  WHERE z.venue_id = v_venue_id AND z.zone_type = 'gate'
  GROUP BY z.id
  ORDER BY count(p.id) ASC, z.created_at ASC
  LIMIT 1;

  -- Stagger arrival slots in 15-minute buckets starting 90 min before event
  INSERT INTO entry_passes (registration_id, event_id, gate_zone_id, arrival_slot)
  VALUES (
    p_registration_id,
    v_event_id,
    v_gate_id,
    COALESCE(v_event_date, now()) - interval '90 minutes' +
      (((SELECT count(*) FROM entry_passes WHERE event_id = v_event_id) % 6) * interval '15 minutes')
  )
  ON CONFLICT (registration_id) DO UPDATE SET gate_zone_id = EXCLUDED.gate_zone_id
  RETURNING id INTO v_pass_id;

  RETURN v_pass_id;
END;
$$;

-- Auto-assign on registration insert
CREATE OR REPLACE FUNCTION public.handle_new_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assign_entry_pass(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_registration_created
  AFTER INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_registration();