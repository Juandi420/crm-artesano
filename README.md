# CRM Artesano - Sistema de Pedidos

Sistema CRM completo para negocios artesanales de alimentos, con gestión de pedidos, productos y clientes.

## 🎯 Características

### Para Clientes:
- ✅ Registro y login de usuarios
- ✅ Catálogo de productos con precios
- ✅ Carrito de compras
- ✅ Realizar pedidos con:
  - Selección de productos y cantidades
  - Dirección de entrega
  - Fecha deseada
  - Notas especiales
- ✅ Historial de pedidos
- ✅ Ver detalles de cada pedido

### Para el Artesano (Admin):
- ✅ Dashboard administrativo
- ✅ Ver todos los pedidos entrantes
- ✅ Gestionar estados de pedidos (pendiente, en preparación, completado, cancelado)
- ✅ Ver información completa de clientes
- ✅ Agregar y gestionar productos
- ✅ Estadísticas de ventas
- ✅ Historial completo guardado en base de datos

## 🚀 Instalación

### Requisitos previos:
- Node.js (versión 14 o superior)
- npm (viene con Node.js)

### Pasos:

1. **Instalar dependencias:**
```bash
npm install
```

2. **Iniciar el servidor:**
```bash
npm start
```

3. **Abrir en el navegador:**
```
http://localhost:3000
```

## 👤 Credenciales de Acceso

### Admin (Artesano):
- **Email:** admin@artesano.com
- **Contraseña:** admin123

### Crear cuenta de cliente:
- Los clientes pueden registrarse directamente desde la interfaz web

## 📁 Estructura del Proyecto

```
crm-artesano/
├── server.js          # Backend con Express y SQLite
├── package.json       # Dependencias del proyecto
├── crm_artesano.db   # Base de datos SQLite (se crea automáticamente)
└── public/
    ├── index.html     # HTML principal
    └── app.js         # Frontend React
```

## 🎨 Diseño

El CRM tiene un diseño orgánico y cálido, perfecto para un negocio artesanal:
- Paleta de colores terracota, oliva y crema
- Tipografía elegante (Cormorant Garamond + Outfit)
- Textura granulada para efecto artesanal
- Animaciones suaves y naturales
- Interfaz responsive

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación con JSON Web Tokens (JWT)
- Validación de permisos por rol (admin/cliente)
- Protección de rutas sensibles

## 📊 Base de Datos

SQLite con las siguientes tablas:
- **usuarios:** Clientes y administradores
- **productos:** Catálogo de productos
- **pedidos:** Información de pedidos
- **pedido_items:** Detalles de productos en cada pedido

## 🔧 API Endpoints

### Autenticación:
- `POST /api/registro` - Registrar nuevo cliente
- `POST /api/login` - Iniciar sesión

### Productos:
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)

### Pedidos:
- `POST /api/pedidos` - Crear nuevo pedido
- `GET /api/mis-pedidos` - Pedidos del usuario actual
- `GET /api/pedidos` - Todos los pedidos (admin)
- `GET /api/pedidos/:id` - Detalle de un pedido
- `PUT /api/pedidos/:id/estado` - Cambiar estado (admin)

### Estadísticas:
- `GET /api/estadisticas` - Estadísticas del negocio (admin)

## 🎯 Flujo de Uso

### Para el Cliente:
1. Registrarse o iniciar sesión
2. Ver catálogo de productos
3. Agregar productos al carrito
4. Finalizar pedido con dirección y fecha
5. Ver historial de pedidos

### Para el Artesano:
1. Iniciar sesión con cuenta admin
2. Ver pedidos entrantes en tiempo real
3. Cambiar estado de pedidos
4. Gestionar catálogo de productos
5. Ver estadísticas de ventas

## 🛠️ Personalización

Para personalizar el CRM para tu cliente:

1. **Cambiar productos iniciales:** Edita la función `initDatabase()` en `server.js`
2. **Modificar colores:** Cambia las variables CSS en `public/index.html`
3. **Agregar logo:** Reemplaza el título "Artesano" en los componentes
4. **Personalizar unidades:** Agrega más opciones en el selector de unidades

## 📦 Despliegue

Para poner el CRM en producción:

1. **Hosting recomendado:**
   - Heroku
   - Railway
   - Render
   - DigitalOcean

2. **Variables de entorno:**
   - Cambiar `JWT_SECRET` en producción
   - Configurar URL del servidor

3. **Base de datos:**
   - Para producción considerar PostgreSQL o MySQL
   - SQLite funciona bien para negocios pequeños

## 💡 Próximas Mejoras

Ideas para expandir el CRM:
- [ ] Notificaciones por email/WhatsApp
- [ ] Pasarela de pagos integrada
- [ ] Reportes en PDF
- [ ] Gestión de inventario
- [ ] Sistema de descuentos
- [ ] App móvil
- [ ] Múltiples ubicaciones
- [ ] Programa de fidelidad

## 📞 Soporte

Este CRM está listo para usarse y personalizarse según las necesidades específicas de tu cliente artesano.

## 📄 Licencia

MIT License - Libre para uso comercial y personal
