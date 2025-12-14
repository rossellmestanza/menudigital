# 🍽️ Menú Digital - Sistema de Pedidos para Restaurantes

Aplicación web moderna para menú digital con sistema de pedidos integrado con WhatsApp, panel de administración y base de datos MongoDB.

## ✨ Características

### Para Clientes
- 📱 Interfaz moderna y responsiva
- 🛒 Carrito de compras interactivo
- 📲 Envío de pedidos directo a WhatsApp
- 🏷️ Filtrado por categorías
- 💰 Precios en Soles (S/)

### Para Administradores
- 🔐 Panel de administración seguro
- ➕ Gestión de productos (CRUD completo)
- 📂 Gestión de categorías
- ⚙️ Configuración del restaurante
- 🖼️ Soporte para imágenes de productos

## 🚀 Tecnologías

- **Frontend:** Next.js 15 + React 19
- **Estilos:** Tailwind CSS
- **Base de Datos:** MongoDB
- **Autenticación:** JWT con cookies HTTP-only
- **Deploy:** Vercel

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd "menú digital"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Edita el archivo `.env.local` con tus datos:

```env
# MongoDB Atlas (crear cuenta gratis en https://www.mongodb.com/cloud/atlas)
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/menu-digital?retryWrites=true&w=majority

# Clave secreta para JWT (genera una aleatoria)
JWT_SECRET=tu-clave-super-secreta-cambiar-esto

# Configuración pública
NEXT_PUBLIC_RESTAURANT_NAME=Mi Restaurante
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
```

### 4. Inicializar la base de datos

Ejecuta el script de inicialización para crear el usuario admin y datos de ejemplo:

```bash
node scripts/init-db.js
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Credenciales por Defecto

- **Usuario:** admin
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia estas credenciales después del primer inicio de sesión.

## 📱 Configuración de WhatsApp

1. Ve al panel de administración
2. Accede a la pestaña "Configuración"
3. Ingresa tu número de WhatsApp con código de país (ej: 51999999999 para Perú)
4. Los pedidos se enviarán automáticamente a este número

## 🌐 Deploy en Vercel

### 1. Crear cuenta en Vercel

Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita.

### 2. Importar proyecto

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones en pantalla.

### 3. Configurar variables de entorno

En el dashboard de Vercel, ve a:
- Proyecto → Settings → Environment Variables
- Agrega todas las variables del archivo `.env.local`

### 4. Deploy

```bash
vercel --prod
```

## 📊 Estructura de la Base de Datos

### Colecciones:

**admins**
- username
- password (hash bcrypt)

**categories**
- name
- icon (emoji)
- order
- active

**products**
- name
- description
- price
- category (referencia)
- image (URL)
- active
- order

**config**
- restaurantName
- whatsappNumber
- currency
- welcomeMessage
- logo
- coverImage

## 🎨 Personalización

### Colores

Edita `tailwind.config.js` para cambiar los colores:

```js
colors: {
  primary: '#FF6B35',   // Naranja principal
  secondary: '#004E89', // Azul secundario
  accent: '#F7931E',    // Acento dorado
  dark: '#1A1A1A',      // Texto oscuro
}
```

### Logo e Imágenes

Actualiza la configuración desde el panel de administración.

## 📝 Uso del Panel de Administración

1. Accede a `/admin`
2. Inicia sesión con tus credenciales
3. Gestiona productos, categorías y configuración
4. Los cambios se reflejan inmediatamente en el menú público

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Construir para producción
npm start        # Iniciar servidor de producción
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT almacenado en cookies HTTP-only
- Validación de autenticación en todas las rutas admin
- Variables de entorno para datos sensibles

## 📞 Soporte

Para soporte o consultas, abre un issue en el repositorio.

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

---

**¡Desarrollado con ❤️ para restaurantes peruanos!** 🇵🇪
