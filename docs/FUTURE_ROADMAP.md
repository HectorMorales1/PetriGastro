# PetriGastro - Roadmap Futurista

## 1. Tecnologías Elegidas

### Frontend
- **Framework:** React
- **Motivo:** Ya tenés experiencia previa, ecosistema maduro, componentes reutilizables.

### Backend
- **Framework:** Node.js + Express
- **Motivo:** Mismo lenguaje que el frontend (JavaScript), fácil integración con React, gran cantidad de librerías.

### Base de Datos
- **Motor:** PostgreSQL
- **Herramienta de gestión:** pgAdmin o DBeaver
- **Motivo:** Robusto para escala mediana, interfaz visual para consultar datos, estructura relacional ideal para el modelo de datos.

---

## 2. Modelo de Datos

### Entidades Principales
- **Usuarios:** id, nombre, email, contraseña, rol (cliente/admin), fecha_creacion
- **Platos:** id, nombre, descripcion, precio, categoria, imagen, disponible
- **Pedidos:** id, usuario_id, fecha, estado, total
- **Pedido_Platos:** pedido_id, plato_id, cantidad, precio_unitario

---

## 3. Plan de Migración

### Fase 1: Frontend (React)
- Reorganizar código HTML/JS actual en componentes React.
- Implementar routing con React Router.
- Gestionar estado con Context API o Redux.

### Fase 2: Backend (Node.js + Express)
- Crear API REST para manejar usuarios, platos y pedidos.
- Implementar autenticación (JWT).
- Conectar con PostgreSQL.

### Fase 3: Base de Datos (PostgreSQL)
- Crear tablas según el modelo de datos.
- Configurar pgAdmin para gestión visual.
- Implementar relaciones e índices.

### Fase 4: Integración
- Conectar frontend con backend.
- Implementar lógica de pedidos.
- Tests y despliegue.

---

## 4. Estructura de Carpetas Sugerida

```
petrigastro/
├── client/              # React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
├── server/              # Node.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
└── database/
    └── scripts/
```

---

## 5. Próximos Pasos Inmediatos
1. Iniciar proyecto React con Vite o Create React App.
2. Iniciar proyecto Node.js con Express.
3. Configurar PostgreSQL e instalar pgAdmin.
4. Definir migrations y seeders de la base de datos.