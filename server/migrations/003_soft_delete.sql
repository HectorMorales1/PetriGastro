DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN deleted_at TIMESTAMP;
  END IF;
END $$;
