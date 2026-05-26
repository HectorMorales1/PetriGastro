# Plan: Actualizar hash bcrypt para admin@petrigastro.com

## ⚠️ Problema detectado
El hash anterior (`$2b$10$Br2llXQRva...`) fue corrupto porque PowerShell expandió los `$` como variables. No coincide con `admin123`.

## Hash correcto (verificado en Node.js)
```
$2b$10$z0gpI8YQpTnnWOkqxEUhrO4FTit88h.BKQN1VjFIrsg1xatMJztji
```
Contraseña: `admin123` ✅ (bcrypt.compare devuelve `true`)

## Archivos a modificar

### 1. `schema.sql` (líneas 30-31)
Reemplazar hash antiguo por el nuevo en ambos INSERT.

### 2. `server/migrations/001_initial.sql` (líneas 33-34)
Mismo cambio.

## Nota
Tras aplicar los cambios, ejecutar en la BD:
```sql
DELETE FROM pedido_feedback;
DELETE FROM pedido_detalles;
DELETE FROM pedidos;
DELETE FROM reservas;
DELETE FROM usuarios;
```
Y luego re-ejecutar `server/migrate.js` o los INSERT para recrear usuarios con el hash correcto.
