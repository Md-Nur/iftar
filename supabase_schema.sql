-- Run this in the Supabase SQL Editor to set up the locations table

CREATE TABLE IF NOT EXISTS locations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  area        TEXT,
  iftar_type  TEXT NOT NULL DEFAULT 'অন্যান্য',
  target_audience TEXT NOT NULL DEFAULT 'সবার জন্য',
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read locations (public read)
CREATE POLICY "Public can read locations"
  ON locations FOR SELECT
  USING (true);

-- Allow anyone to insert new locations (open contribution)
CREATE POLICY "Anyone can add locations"
  ON locations FOR INSERT
  WITH CHECK (true);
