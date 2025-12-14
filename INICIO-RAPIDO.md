# 📝 Inicio Rápido - Menú Digital

## 🎯 Primeros Pasos (5 minutos)

### 1. Instalar Dependencias (Ya está ejecutándose)

Las dependencias se están instalando automáticamente.

### 2. Configurar MongoDB Atlas

Tienes dos opciones:

#### Opción A: Usar MongoDB Local (Para Pruebas)

Si quieres probar rápidamente SIN configurar MongoDB Atlas:

```bash
# Instalar MongoDB localmente
# Windows: Descarga de https://www.mongodb.com/try/download/community
# Luego en .env.local usa:
MONGODB_URI=mongodb://localhost:27017/menu-digital
```

#### Opción B: MongoDB Atlas (Recomendado - GRATIS)

Sigue la guía completa en: `docs/MONGODB-SETUP.md`

**Resumen ultra-rápido:**
1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Crear usuario de base de datos
4. Permitir acceso desde cualquier IP (0.0.0.0/0)
5. Copiar connection string
6. Configurarlo en `.env.local`

### 3. Configurar Variables de Entorno

Abre `.env.local` y configura:

```env
# Tu connection string de MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/menu-digital?retryWrites=true&w=majority

# Clave secreta (genera una aleatoria)
JWT_SECRET=cambiar-por-clave-super-segura-minimo-32-caracteres

# Información de tu restaurante
NEXT_PUBLIC_RESTAURANT_NAME=Mi Restaurante
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
```

### 4. Inicializar Base de Datos

```bash
node scripts/init-db.js
```

Esto creará:
- ✅ Usuario admin (admin / admin123)
- ✅ 4 categorías de ejemplo
- ✅ 8 productos de ejemplo
- ✅ Configuración inicial

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Abre http://localhost:3000

## 🎨 Personalización Inmediata

### Cambiar Colores

Edita `tailwind.config.js`:

```js
colors: {
  primary: '#FF6B35',   // Color principal (botones, precios)
  secondary: '#004E89', // Color secundario
  accent: '#F7931E',    // Color de acento
  dark: '#1A1A1A',      // Color del texto
}
```

### Cambiar Información del Restaurante

1. Ve a http://localhost:3000/admin
2. Login: `admin` / `admin123`
3. Pestaña "Configuración"
4. Actualiza:
   - Nombre del restaurante
   - Número de WhatsApp
   - Símbolo de moneda
   - Mensaje de bienvenida

## 📱 Funcionalidades Principales

### Para Clientes:
- Ver menú con categorías
- Filtrar por categoría
- Agregar productos al carrito
- Enviar pedido por WhatsApp

### Para Admin:
- Gestionar productos (crear, editar, eliminar)
- Gestionar categorías
- Configurar información del restaurante
- Activar/desactivar productos

## 🚀 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Construir para producción (probar antes de deploy)
npm run build

# Ejecutar en modo producción (después de build)
npm start

# Inicializar/reiniciar base de datos
node scripts/init-db.js
```

## 📂 Estructura del Proyecto

```
menú digital/
├── app/                      # Aplicación Next.js
│   ├── page.js              # Página principal (menú para clientes)
│   ├── layout.js            # Layout raíz
│   ├── globals.css          # Estilos globales
│   ├── admin/               # Panel de administración
│   │   ├── page.js          # Login admin
│   │   └── dashboard/
│   │       └── page.js      # Dashboard admin
│   └── api/                 # API Routes
│       ├── auth/            # Autenticación
│       ├── products/        # Productos públicos
│       ├── categories/      # Categorías públicas
│       ├── config/          # Configuración pública
│       └── admin/           # APIs protegidas
├── lib/                     # Utilidades
│   ├── mongodb.js          # Conexión a MongoDB
│   └── auth.js             # Autenticación JWT
├── scripts/                # Scripts de utilidad
│   └── init-db.js         # Inicializar base de datos
├── docs/                   # Documentación
│   ├── MONGODB-SETUP.md   # Guía MongoDB
│   └── DEPLOY-VERCEL.md   # Guía Deploy
├── .env.local             # Variables de entorno
├── package.json           # Dependencias
└── README.md             # Documentación principal
```

## 🔐 Seguridad

### Cambiar Credenciales Admin

**MUY IMPORTANTE:** Después de inicializar la base de datos, cambia las credenciales por defecto.

Para cambiar el password del admin:

```bash
# Opción 1: Desde MongoDB Compass/Atlas
# Actualiza manualmente el documento en la colección "admins"
# El password debe ser un hash bcrypt

# Opción 2: Script Node.js rápido
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-nueva-password', 10))"
# Copia el hash y actualízalo en MongoDB
```

### JWT Secret

Genera una clave segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y actualiza `JWT_SECRET` en `.env.local`

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"

1. Verifica que `MONGODB_URI` esté correctamente configurada en `.env.local`
2. Si usas MongoDB Atlas, verifica Network Access (0.0.0.0/0)
3. Verifica credenciales de usuario de base de datos

### Error: "Module not found"

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Página en blanco / No carga productos

1. Verifica que hayas ejecutado `node scripts/init-db.js`
2. Verifica la conexión a MongoDB
3. Revisa la consola del navegador (F12)

### WhatsApp no funciona

1. Verifica el formato del número: `51999999999` (sin +, espacios ni guiones)
2. Asegúrate de incluir el código de país
3. Prueba el enlace manualmente: `https://wa.me/51999999999`

## 📞 Soporte

### Recursos:

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Checklist Antes de Deploy:

- [ ] La aplicación funciona localmente
- [ ] Los productos se muestran correctamente
- [ ] El carrito funciona
- [ ] WhatsApp envía mensajes
- [ ] El login admin funciona
- [ ] Puedes crear/editar/eliminar productos
- [ ] Cambiaste las credenciales por defecto
- [ ] Configuraste todas las variables de entorno
- [ ] Probaste `npm run build` sin errores

## 🎉 ¡Listo para Deploy!

Cuando todo funcione localmente, sigue la guía:

📖 `docs/DEPLOY-VERCEL.md`

---

**¿Preguntas? ¿Problemas?**

Revisa primero:
1. README.md
2. docs/MONGODB-SETUP.md
3. docs/DEPLOY-VERCEL.md

¡Buena suerte con tu menú digital! 🍽️✨
