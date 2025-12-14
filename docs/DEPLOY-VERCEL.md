# 🚀 Guía de Deploy en Vercel

## ¿Qué es Vercel?

Vercel es una plataforma de hosting gratuita optimizada para Next.js. Ofrece:
- ✅ Deploy gratuito ilimitado
- ✅ SSL automático (HTTPS)
- ✅ CDN global
- ✅ Dominio personalizado gratis

## Requisitos Previos

- ✅ Cuenta en GitHub (opcional pero recomendado)
- ✅ MongoDB Atlas configurado
- ✅ Aplicación funcionando localmente

## Método 1: Deploy con CLI (Más Rápido)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login en Vercel

```bash
vercel login
```

Se abrirá tu navegador. Inicia sesión con:
- Email
- GitHub
- GitLab
- Bitbucket

### Paso 3: Deploy

```bash
vercel
```

Responde las preguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No
- **Project name?** → menu-digital (o el que prefieras)
- **Directory?** → ./ (presiona Enter)
- **Override settings?** → No

¡Listo! Tu app estará en una URL como: `https://menu-digital-xxx.vercel.app`

### Paso 4: Configurar Variables de Entorno

```bash
# Opción 1: Via CLI
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production

# Luego pega los valores cuando te lo pida
```

```bash
# Opción 2: Via Dashboard
# Ve a: vercel.com → Tu proyecto → Settings → Environment Variables
```

Agrega estas variables:
- `MONGODB_URI` → Tu connection string de MongoDB
- `JWT_SECRET` → Una clave secreta (mínimo 32 caracteres)

### Paso 5: Re-deploy con las Variables

```bash
vercel --prod
```

## Método 2: Deploy con GitHub (Recomendado para Equipos)

### Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `menu-digital`
3. Privacidad: Público o Privado
4. No inicialices con README
5. Clic en "Create repository"

### Paso 2: Subir tu Código

```bash
# Inicializar Git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit - Menú Digital"

# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/menu-digital.git
git branch -M main
git push -u origin main
```

### Paso 3: Importar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Haz clic en "Import Git Repository"
3. Selecciona tu repositorio `menu-digital`
4. Framework Preset: **Next.js** (se detecta automáticamente)
5. Build Settings: (dejar por defecto)
6. Haz clic en "Deploy"

### Paso 4: Configurar Variables de Entorno

1. Durante el deploy, haz clic en "Environment Variables"
2. Agrega:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `clave-super-secreta-minimo-32-caracteres` |

3. Haz clic en "Deploy"

## Verificar el Deploy

1. Espera 2-3 minutos
2. Cuando termine, verás: "🎉 Congratulations!"
3. Haz clic en "Visit" para ver tu sitio

### URLs Generadas:

- **Producción:** `https://tu-proyecto.vercel.app`
- **Preview:** Se crea una para cada commit

## Configurar Dominio Personalizado (Opcional)

### Opción 1: Dominio Gratuito de Vercel

Tu sitio ya tiene un dominio: `https://menu-digital.vercel.app`

### Opción 2: Tu Propio Dominio

1. En Vercel, ve a: Project → Settings → Domains
2. Ingresa tu dominio (ej: `mirestaurante.com`)
3. Sigue las instrucciones para configurar:
   - **Si compraste en Vercel:** Automático ✅
   - **Si lo tienes en otro lugar:** Configurar registros DNS

Ejemplo de configuración DNS:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Variables de Entorno en Vercel

### Ver Variables

```bash
vercel env ls
```

### Agregar Variable

```bash
vercel env add NUEVA_VARIABLE production
```

### Eliminar Variable

```bash
vercel env rm VARIABLE_NAME production
```

### Variables por Entorno

Vercel soporta 3 entornos:
- **Production** → Deploy principal
- **Preview** → Branches y PRs
- **Development** → Local (no aplica)

## Re-deploy Manual

### Vía CLI:

```bash
# Deploy de prueba
vercel

# Deploy a producción
vercel --prod
```

### Vía Dashboard:

1. Ve a tu proyecto en vercel.com
2. Pestaña "Deployments"
3. Encuentra el deployment
4. Clic en "..." → "Redeploy"

## Actualizar tu Aplicación

### Si usas GitHub:

```bash
git add .
git commit -m "Actualización: descripción de cambios"
git push
```

Vercel automáticamente detecta el cambio y hace deploy.

### Si usas CLI:

```bash
vercel --prod
```

## Logs y Debugging

### Ver Logs en Tiempo Real:

```bash
vercel logs https://tu-proyecto.vercel.app
```

### Ver Logs en Dashboard:

1. Proyecto → Functions
2. Selecciona una función
3. Ver ejecuciones recientes

## Configuración Avanzada

### `vercel.json`

Crea este archivo en la raíz para configuraciones especiales:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

Regiones disponibles:
- `gru1` - São Paulo, Brazil (más cercano a Perú)
- `iad1` - Washington D.C., USA
- `sfo1` - San Francisco, USA

## Límites del Plan Gratuito

- ✅ Deploy ilimitado
- ✅ 100 GB de ancho de banda/mes
- ✅ SSL automático
- ✅ Dominio personalizado
- ✅ Funciones serverless (100 GB-hrs)

Para un restaurante: **Más que suficiente** 🎉

## Monitorear Uso

1. Ve a tu cuenta en Vercel
2. Settings → Usage
3. Verás gráficos de:
   - Bandwidth
   - Build minutes
   - Serverless function executions

## Problemas Comunes

### Error: "Build failed"

**Solución:**
1. Verifica que `npm run build` funcione localmente
2. Revisa los logs en Vercel
3. Asegúrate de tener todas las variables de entorno

### Error: "Cannot connect to MongoDB"

**Solución:**
1. Verifica que `MONGODB_URI` esté correctamente configurada
2. En MongoDB Atlas → Network Access → Permitir 0.0.0.0/0
3. Espera 2-3 minutos después de cambiar Network Access

### Error: "Module not found"

**Solución:**
```bash
# Limpiar caché de Vercel
vercel --force
```

### Sitio lento

**Solución:**
1. Optimiza imágenes (usa Next.js Image component)
2. Activa ISR (Incremental Static Regeneration)
3. Usa CDN para assets estáticos

## Seguridad en Producción

### 1. Cambiar Credenciales Admin

Después del deploy, ve a `/admin` y cambia:
- Usuario por defecto
- Contraseña por defecto

### 2. JWT Secret

Usa un generador de claves:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. MongoDB Access

- Limita IPs en Network Access
- Usa contraseñas fuertes
- Rota credenciales periódicamente

## Analytics (Opcional)

Vercel ofrece analytics gratuitos:

1. Proyecto → Analytics
2. Activa "Enable Analytics"
3. Ve métricas de:
   - Visitantes únicos
   - Page views
   - Países de origen
   - Performance

## Siguiente Paso: Custom Domain

Si quieres un dominio profesional:

1. Compra en: Namecheap, GoDaddy, o Vercel
2. Configura en Vercel → Domains
3. Ejemplo: `www.mirestaurante.com`

---

## ✅ Checklist Final

Antes de compartir tu menú digital:

- [ ] MongoDB Atlas configurado
- [ ] Variables de entorno en Vercel
- [ ] Deploy exitoso
- [ ] Admin login funciona
- [ ] Productos visibles en el menú
- [ ] WhatsApp configurado correctamente
- [ ] Credenciales admin cambiadas
- [ ] Dominio personalizado (opcional)

---

¡Felicidades! Tu menú digital está en línea y accesible desde cualquier dispositivo 🎉📱

**URL de prueba:** `https://tu-proyecto.vercel.app`
