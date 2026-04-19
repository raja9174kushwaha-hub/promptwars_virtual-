-- FIX FLAWS & AVOID DATA LEAKS IN RLS POLICIES

-- 1. FIX: Attendees cannot currently see their own registrations unless they are the organizer.
--    We will add a policy to let them see registrations matched to their authenticated email.
DROP POLICY IF EXISTS "Attendees can view own registrations" ON public.registrations;
CREATE POLICY "Attendees can view own registrations"
  ON public.registrations
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (
    lower(trim(COALESCE(data->>'Email Address', data->>'email', data->>'Email', ''))) = lower(trim(auth.jwt()->>'email'))
    AND auth.jwt()->>'email' IS NOT NULL
  );

-- 2. CRITICAL SECURITY FIX: The previous policy on `entry_passes` allowed anyone to fetch ALL passes for any live event.
--    This meant anyone could steal QR codes/tickets of other attendees. 
--    We drop the insecure policy and restrict it to owners and the specific attendee who owns the pass.
DROP POLICY IF EXISTS "Public can view pass by token via function" ON public.entry_passes;
DROP POLICY IF EXISTS "Attendees can view own passes" ON public.entry_passes;
CREATE POLICY "Attendees can view own passes" 
  ON public.entry_passes 
  AS PERMISSIVE FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r 
      WHERE r.id = entry_passes.registration_id 
      AND lower(trim(COALESCE(r.data->>'Email Address', r.data->>'email', r.data->>'Email', ''))) = lower(trim(auth.jwt()->>'email'))
      AND auth.jwt()->>'email' IS NOT NULL
    )
  );
