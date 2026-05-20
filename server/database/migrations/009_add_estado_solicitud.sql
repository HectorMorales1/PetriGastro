ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_solicitud VARCHAR(30) DEFAULT 'pendiente_verificacion';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_solicitud TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;

UPDATE usuarios SET estado_solicitud = 'aprobado', email_verificado = true WHERE estado_solicitud IS NULL OR estado_solicitud = 'pendiente_verificacion';
