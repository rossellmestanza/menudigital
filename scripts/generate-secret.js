// Script para generar una clave JWT secreta segura
const crypto = require('crypto')

console.log('\n🔐 Generador de Clave Secreta JWT\n')
console.log('━'.repeat(60))

// Generar una clave aleatoria de 32 bytes (256 bits)
const secret = crypto.randomBytes(32).toString('hex')

console.log('\n✅ Tu clave secreta JWT (cópiala):\n')
console.log(`   ${secret}`)
console.log('\n━'.repeat(60))
console.log('\n📝 Cómo usarla:\n')
console.log('1. Copia la clave de arriba')
console.log('2. Abre el archivo .env.local')
console.log('3. Actualiza la línea JWT_SECRET con esta clave:')
console.log(`\n   JWT_SECRET=${secret}\n`)
console.log('━'.repeat(60))
console.log('\n⚠️  IMPORTANTE: No compartas esta clave con nadie\n')
