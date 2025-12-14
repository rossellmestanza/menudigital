// Script de prueba con connection string alternativa
const { MongoClient } = require('mongodb')

// Formato estándar (sin SRV)
const MONGODB_URI_STANDARD = 'mongodb://menudigital:JQD8jxDU84PooVDl@ac-8dcrqmz-shard-00-00.f1kburo.mongodb.net:27017,ac-8dcrqmz-shard-00-01.f1kburo.mongodb.net:27017,ac-8dcrqmz-shard-00-02.f1kburo.mongodb.net:27017/menu-digital?ssl=true&replicaSet=atlas-rdqfqg-shard-0&authSource=admin&retryWrites=true&w=majority'

// Tu connection string original con SRV
const MONGODB_URI_SRV = 'mongodb+srv://menudigital:JQD8jxDU84PooVDl@cluster0.f1kburo.mongodb.net/menu-digital?retryWrites=true&w=majority'

async function testBothConnections() {
    console.log('🔍 Probando ambas connection strings...\n')

    // Probar SRV primero
    console.log('1️⃣ Probando formato SRV (mongodb+srv://)...')
    const clientSRV = new MongoClient(MONGODB_URI_SRV, {
        serverSelectionTimeoutMS: 10000,
    })

    try {
        await clientSRV.connect()
        console.log('✅ ¡Conexión SRV exitosa!\n')
        await clientSRV.close()
        return true
    } catch (error) {
        console.log('❌ Conexión SRV falló:', error.message, '\n')
        await clientSRV.close()
    }

    // Probar estándar
    console.log('2️⃣ Probando formato estándar (mongodb://)...')
    const clientStandard = new MongoClient(MONGODB_URI_STANDARD, {
        serverSelectionTimeoutMS: 10000,
    })

    try {
        await clientStandard.connect()
        console.log('✅ ¡Conexión estándar exitosa!\n')
        console.log('💡 Usa la connection string estándar en .env.local')
        await clientStandard.close()
        return true
    } catch (error) {
        console.log('❌ Conexión estándar también falló:', error.message, '\n')
        await clientStandard.close()
    }

    // Si ambas fallan
    console.log('⚠️  Ambas connection strings fallaron.')
    console.log('\n💡 Posibles soluciones:')
    console.log('1. Desactiva temporalmente tu antivirus/firewall')
    console.log('2. Usa otra red WiFi o datos móviles')
    console.log('3. Cambia los DNS de Windows a Google DNS (8.8.8.8)')
    console.log('4. Espera un poco más (el cluster puede estar propagándose)\n')

    return false
}

testBothConnections().then(success => {
    process.exit(success ? 0 : 1)
})
