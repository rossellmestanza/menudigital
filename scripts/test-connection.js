// Script de prueba con la connection string CORRECTA
const { MongoClient } = require('mongodb')

const MONGODB_URI = 'mongodb+srv://menudigital:JQD8jxDU84PooVDl@cluster0.f1bkore.mongodb.net/menu-digital?retryWrites=true&w=majority&appName=Cluster0'

async function testConnection() {
  console.log('🔍 Probando conexión a MongoDB Atlas (URL CORREGIDA)...\n')

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })

  try {
    console.log('⏳ Conectando...')
    await client.connect()
    console.log('✅ ¡CONEXIÓN EXITOSA a MongoDB Atlas!\n')

    // Probar comando ping
    await client.db("admin").command({ ping: 1 })
    console.log('✅ Ping exitoso a la base de datos\n')

    const db = client.db('menu-digital')
    const collections = await db.listCollections().toArray()

    console.log('📊 Colecciones existentes:')
    if (collections.length === 0) {
      console.log('   (ninguna - base de datos nueva)\n')
    } else {
      collections.forEach(col => console.log(`   - ${col.name}`))
      console.log()
    }

    console.log('🎉 ¡TODO LISTO! Ahora ejecuta: node scripts/init-db.js')
    return true
  } catch (error) {
    console.error('❌ Error de conexión:', error.message, '\n')
    return false
  } finally {
    await client.close()
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
