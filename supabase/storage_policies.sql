-- Make sure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'event-assets';

-- Policy 1: allow anyone to select (read)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'event-assets');

-- Policy 2: allow authenticated users to upload (insert)
DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-assets');

-- Policy 3: allow authenticated users to update their own objects
DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
CREATE POLICY "Auth Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-assets');

-- Policy 4: allow authenticated users to delete their own objects
DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
CREATE POLICY "Auth Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-assets');
