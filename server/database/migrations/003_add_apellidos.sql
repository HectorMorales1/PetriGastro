-- Add apellidos column to usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos VARCHAR(100);
