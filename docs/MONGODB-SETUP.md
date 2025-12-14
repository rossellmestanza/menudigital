# 🗄️ Guía de Configuración de MongoDB Atlas

## Paso 1: Crear Cuenta en MongoDB Atlas

1. Ve a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en "Try Free"
3. Regístrate con tu email o cuenta de Google

## Paso 2: Crear un Cluster Gratuito

1. Selecciona el plan **FREE** (M0 Sandbox)
2. Elige el proveedor de nube (recomendado: AWS)
3. Selecciona la región más cercana a Perú (ej: São Paulo, Brazil)
4. Dale un nombre a tu cluster (ej: "menu-digital-cluster")
5. Haz clic en "Create Cluster"

⏱️ La creación del cluster puede tardar 3-5 minutos

## Paso 3: Configurar Acceso a la Base de Datos

### 3.1 Crear Usuario de Base de Datos

1. En el menú lateral, ve a **Database Access**
2. Haz clic en "+ ADD NEW DATABASE USER"
3. Método de autenticación: **Password**
4. Crea un usuario:
   - Username: `menudigital`
   - Password: Genera una contraseña segura (guárdala)
5. Database User Privileges: **Read and write to any database**
6. Haz clic en "Add User"

### 3.2 Permitir Acceso desde Cualquier IP

1. En el menú lateral, ve a **Network Access**
2. Haz clic en "+ ADD IP ADDRESS"
3. Selecciona "ALLOW ACCESS FROM ANYWHERE"
   - Esto agregará `0.0.0.0/0`
4. Haz clic en "Confirm"

⚠️ **Nota:** Para producción, es mejor limitar las IPs específicas

## Paso 4: Obtener la Cadena de Conexión

1. Ve a **Database** en el menú lateral
2. En tu cluster, haz clic en "Connect"
3. Selecciona "Connect your application"
4. Driver: **Node.js**
5. Version: **6.7 or later**
6. Copia la connection string que se muestra:

```
mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Paso 5: Configurar tu Aplicación

1. Abre el archivo `.env.local` en tu proyecto
2. Reemplaza la línea de MONGODB_URI:

```env
MONGODB_URI=mongodb+srv://menudigital:TU_PASSWORD@cluster.mongodb.net/menu-digital?retryWrites=true&w=majority
```

**Importante:**
- Reemplaza `TU_PASSWORD` con la contraseña que creaste
- Agrega `/menu-digital` antes del `?` para especificar el nombre de la base de datos

### Ejemplo Completo:

```env
# Si tu usuario es: menudigital
# Y tu password es: miPass123!
# Y tu cluster es: cluster0.abc123.mongodb.net

MONGODB_URI=mongodb+srv://menudigital:miPass123!@cluster0.abc123.mongodb.net/menu-digital?retryWrites=true&w=majority
```

## Paso 6: Inicializar la Base de Datos

```bash
node scripts/init-db.js
```

Este script creará:
- Usuario administrador
- Categorías de ejemplo
- Productos de ejemplo
- Configuración inicial

## Verificar la Conexión

1. En MongoDB Atlas, ve a **Database**
2. Haz clic en "Browse Collections"
3. Deberías ver tu base de datos `menu-digital` con las colecciones:
   - admins
   - categories
   - products
   - config

## 🚨 Solución de Problemas

### Error: "connection refused" o "timeout"

**Solución:**
1. Verifica que hayas agregado `0.0.0.0/0` en Network Access
2. Espera 2-3 minutos después de agregar la IP

### Error: "authentication failed"

**Solución:**
1. Verifica que el usuario y password sean correctos
2. Si la contraseña tiene caracteres especiales (@ # $ %), codifícalos:
   - `@` = `%40`
   - `#` = `%23`
   - `$` = `%24`

Ejemplo: `myP@ss#123` → `myP%40ss%23123`

### Error: "database not found"

**Solución:**
- Asegúrate de incluir `/menu-digital` en la URI antes del `?`

## 📊 Monitoreo y Administración

### Ver Datos en MongoDB Compass (Opcional)

1. Descarga [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Instálalo y ábrelo
3. Pega tu connection string
4. Haz clic en "Connect"

Ahora puedes ver y editar tus datos visualmente.

### Límites del Plan Gratuito

- **Almacenamiento:** 512 MB
- **RAM:** 512 MB compartida
- **Conexiones:** Hasta 500 conexiones simultáneas

Para un restaurante pequeño/mediano, esto es **más que suficiente**.

## 🔐 Seguridad para Producción

Cuando despliegues en Vercel:

1. En MongoDB Atlas, ve a **Network Access**
2. Elimina `0.0.0.0/0`
3. Agrega solo las IPs de Vercel:
   - Ve a tu proyecto en Vercel
   - Settings → Domains → Ver las IPs
   - Agrégalas en MongoDB Atlas

## 💡 Consejos

1. **Backups:** El plan gratuito no incluye backups automáticos. MongoDB guarda snapshots por 24 horas.
2. **Nombre de base de datos:** Siempre usa el mismo nombre (`menu-digital`) en todos los entornos
3. **Variables de entorno:** Nunca subas al repositorio el archivo `.env.local`

---

¿Listo? ¡Ahora tu menú digital está conectado a MongoDB! 🎉
