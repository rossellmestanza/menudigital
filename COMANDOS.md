# ⚡ Comandos Útiles para tu Menú Digital

## 🚀 Iniciar Aplicación

### Desarrollo (con hot-reload)
```bash
npm run dev
```
Abre: http://localhost:3000

### Producción (después de build)
```bash
npm run build
npm start
```

---

## 🗄️ Base de Datos

### Inicializar base de datos con datos de ejemplo
```bash
node scripts/init-db.js
```

Crea:
- Usuario admin (admin / admin123)
- 4 categorías
- 8 productos de ejemplo
- Configuración inicial

### Generar clave secreta JWT
```bash
node scripts/generate-secret.js
```

---

## 🛠️ Desarrollo

### Instalar dependencias
```bash
npm install
```

### Limpiar caché de Next.js
```bash
# Windows
Remove-Item -Recurse -Force .next

# Mac/Linux
rm -rf .next
```

### Verificar build antes de deploy
```bash
npm run build
```

---

## 🌐 Deploy en Vercel

### Primera vez (instalación global)
```bash
npm install -g vercel
```

### Login en Vercel
```bash
vercel login
```

### Deploy de prueba
```bash
vercel
```

### Deploy a producción
```bash
vercel --prod
```

### Ver logs
```bash
vercel logs https://tu-proyecto.vercel.app
```

---

## 🔐 Seguridad

### Generar hash de contraseña (bcrypt)
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-password', 10))"
```

### Generar JWT Secret aleatorio
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Gestión de Dependencias

### Ver dependencias instaladas
```bash
npm list
```

### Actualizar dependencias
```bash
npm update
```

### Verificar vulnerabilidades
```bash
npm audit
```

### Arreglar vulnerabilidades
```bash
npm audit fix
```

---

## 🐛 Debugging

### Ver estructura del proyecto
```bash
# Windows
tree /F

# Mac/Linux
tree
```

### Ver puertos en uso (si el puerto 3000 está ocupado)
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Matar proceso en puerto 3000 (Windows)
```bash
# Primero encuentra el PID con el comando anterior
taskkill /PID <numero-PID> /F
```

---

## 📊 MongoDB

### Validar connection string
```bash
node -e "const { MongoClient } = require('mongodb'); new MongoClient(process.env.MONGODB_URI).connect().then(() => console.log('✅ Conexión exitosa')).catch(e => console.log('❌ Error:', e.message))"
```

### Ver variables de entorno
```bash
# Windows
type .env.local

# Mac/Linux
cat .env.local
```

---

## 🎨 Customización

### Personalizar colores (después de editar tailwind.config.js)
```bash
# Borra .next y reinicia
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 📝 Git (Control de versiones)

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit"
```

### Conectar con GitHub
```bash
git remote add origin https://github.com/tu-usuario/menu-digital.git
git branch -M main
git push -u origin main
```

### Actualizar cambios
```bash
git add .
git commit -m "Descripción de cambios"
git push
```

---

## 🔄 Actualizaciones

### Actualizar Next.js
```bash
npm install next@latest react@latest react-dom@latest
```

### Actualizar todas las dependencias
```bash
npm update
```

---

## 📱 Testing Local en Red Local

### Ver tu IP local
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### Acceder desde otros dispositivos
```bash
# Ejecuta normalmente
npm run dev

# Luego abre en tu teléfono:
# http://TU-IP-LOCAL:3000
# Ejemplo: http://192.168.1.100:3000
```

---

## 🚨 Solución Rápida de Problemas

### Panel admin no carga
```bash
# Verifica que MongoDB esté conectado
node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('OK'))"
```

### Cambios no se reflejan
```bash
# Reinicia el servidor
# Ctrl + C para detener
npm run dev
```

### Error de permisos en scripts
```bash
# Windows: Ejecutar PowerShell como Administrador
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Limpiar todo y empezar de nuevo
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item package-lock.json
npm install
npm run dev
```

---

## 📖 Ayuda Rápida

```bash
# Ver comandos disponibles
npm run

# Ayuda de Next.js
npx next --help

# Ayuda de Vercel
vercel --help
```

---

## 🎯 Atajos de Teclado (Desarrollo)

- `Ctrl + C` - Detener servidor
- `Ctrl + Shift + R` - Recargar sin caché (navegador)
- `F12` - Abrir DevTools (navegador)
- `Ctrl + Shift + I` - Inspeccionar elemento

---

## 💡 Tips Útiles

### Hot reload no funciona
```bash
# Agrega esto a next.config.js
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}
```

### Puerto personalizado
```bash
# En lugar de 3000, usa otro puerto
npm run dev -- -p 3001
```

---

¡Guarda este archivo para referencia rápida! 📌
