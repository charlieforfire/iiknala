-- Run in Supabase SQL Editor
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guest boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS classes_deducted integer NOT NULL DEFAULT 1;
