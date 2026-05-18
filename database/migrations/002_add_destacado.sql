-- Add destacado (featured) column to platos
ALTER TABLE platos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- Index for faster queries of featured dishes
CREATE INDEX IF NOT EXISTS idx_platos_destacado ON platos(destacado) WHERE destacado = true;
