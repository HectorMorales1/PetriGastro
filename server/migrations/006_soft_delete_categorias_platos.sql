DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categorias' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE categorias ADD COLUMN deleted_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'platos' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE platos ADD COLUMN deleted_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categorias_deleted_at') THEN
    CREATE INDEX idx_categorias_deleted_at ON categorias(deleted_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_platos_deleted_at') THEN
    CREATE INDEX idx_platos_deleted_at ON platos(deleted_at);
  END IF;
END $$;
