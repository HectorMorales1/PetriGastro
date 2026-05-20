-- Fechas de ejemplo para los próximos 7 días

DO $$
DECLARE
  dia INTEGER;
  fecha DATE;
  fecha_id INTEGER;
  hora TEXT;
BEGIN
  FOR i IN 1..7 LOOP
    fecha := CURRENT_DATE + i;
    dia := EXTRACT(DOW FROM fecha)::INTEGER;
    
    -- Solo generar para días activos (1-5 = lunes-viernes)
    IF dia IN (1, 2, 3, 4, 5) THEN
      INSERT INTO fechas_disponibles (fecha) VALUES (fecha) RETURNING id INTO fecha_id;
      
      INSERT INTO horarios_disponibles (fecha_id, hora) VALUES 
        (fecha_id, '12:00'),
        (fecha_id, '13:00'),
        (fecha_id, '14:00'),
        (fecha_id, '19:00'),
        (fecha_id, '20:00'),
        (fecha_id, '21:00');
    END IF;
  END LOOP;
END $$;