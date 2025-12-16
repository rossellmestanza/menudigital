// Script para inicializar la base de datos con usuario admin y datos de ejemplo
const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/menu-digital?retryWrites=true&w=majority'

async function initDatabase() {
    console.log('🚀 Inicializando base de datos...\n')

    const client = new MongoClient(MONGODB_URI)

    try {
        await client.connect()
        console.log('✅ Conectado a MongoDB\n')

        const db = client.db('menu-digital')

        // Crear usuario admin
        console.log('👤 Creando usuario administrador...')
        const adminCollection = db.collection('admins')
        const existingAdmin = await adminCollection.findOne({ username: 'admin' })

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10)
            await adminCollection.insertOne({
                username: 'admin',
                password: hashedPassword,
                createdAt: new Date(),
            })
            console.log('✅ Usuario admin creado (usuario: admin, contraseña: admin123)\n')
        } else {
            console.log('ℹ️  Usuario admin ya existe\n')
        }

        // Crear categorías de ejemplo
        console.log('📂 Creando categorías de ejemplo...')
        const categoriesCollection = db.collection('categories')
        const categoryCount = await categoriesCollection.countDocuments()

        if (categoryCount === 0) {
            const categories = [
                { name: 'Entradas', icon: '🥗', order: 1, active: true },
                { name: 'Platos Principales', icon: '🍴', order: 2, active: true },
                { name: 'Bebidas', icon: '🥤', order: 3, active: true },
                { name: 'Postres', icon: '🍰', order: 4, active: true },
            ]

            const result = await categoriesCollection.insertMany(categories)
            console.log(`✅ ${result.insertedCount} categorías creadas\n`)

            // Guardar IDs para usar en productos
            const insertedCategories = await categoriesCollection.find({}).toArray()

            // Crear productos de ejemplo
            console.log('🍽️  Creando productos de ejemplo...')
            const productsCollection = db.collection('products')

            const products = [
                {
                    name: 'Ensalada César',
                    description: 'Lechuga fresca, crutones, parmesano y aderezo césar',
                    price: 18.50,
                    category: insertedCategories.find(c => c.name === 'Entradas')._id,
                    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
                    active: true,
                    order: 1,
                },
                {
                    name: 'Tequeños',
                    description: 'Deliciosos tequeños crujientes rellenos de queso',
                    price: 15.00,
                    category: insertedCategories.find(c => c.name === 'Entradas')._id,
                    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
                    active: true,
                    order: 2,
                },
                {
                    name: 'Lomo Saltado',
                    description: 'Clásico peruano con lomo, cebolla, tomate y papas fritas',
                    price: 35.00,
                    category: insertedCategories.find(c => c.name === 'Platos Principales')._id,
                    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800',
                    active: true,
                    order: 1,
                },
                {
                    name: 'Arroz con Pollo',
                    description: 'Arroz verde con pollo tierno y salsa criolla',
                    price: 28.00,
                    category: insertedCategories.find(c => c.name === 'Platos Principales')._id,
                    image: 'https://images.unsplash.com/photo-1603133577154-05699d26c724?w=800',
                    active: true,
                    order: 2,
                },
                {
                    name: 'Inca Kola',
                    description: 'Bebida nacional del Perú - 500ml',
                    price: 5.00,
                    category: insertedCategories.find(c => c.name === 'Bebidas')._id,
                    image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800',
                    active: true,
                    order: 1,
                },
                {
                    name: 'Chicha Morada',
                    description: 'Refrescante bebida tradicional peruana',
                    price: 6.00,
                    category: insertedCategories.find(c => c.name === 'Bebidas')._id,
                    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
                    active: true,
                    order: 2,
                },
                {
                    name: 'Suspiro Limeño',
                    description: 'Postre tradicional peruano de manjar blanco y merengue',
                    price: 12.00,
                    category: insertedCategories.find(c => c.name === 'Postres')._id,
                    image: 'https://images.unsplash.com/photo-1488474339733-16f9f93c0bc6?w=800',
                    active: true,
                    order: 1,
                },
                {
                    name: 'Mazamorra Morada',
                    description: 'Delicioso postre de maíz morado con frutas',
                    price: 10.00,
                    category: insertedCategories.find(c => c.name === 'Postres')._id,
                    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
                    active: true,
                    order: 2,
                },
            ]

            const productsResult = await productsCollection.insertMany(products)
            console.log(`✅ ${productsResult.insertedCount} productos creados\n`)
        } else {
            console.log('ℹ️  Ya existen categorías y productos\n')
        }

        // Crear configuración inicial
        console.log('⚙️  Creando configuración inicial...')
        const configCollection = db.collection('config')
        const existingConfig = await configCollection.findOne({ _id: 'main' })

        if (!existingConfig) {
            await configCollection.insertOne({
                _id: 'main',
                restaurantName: 'Mi Restaurante',
                whatsappNumber: '51999999999',
                phoneNumber: '51999999999',
                currency: 'S/',
                welcomeMessage: '¡Bienvenido a nuestro menú digital!',
                logo: '',
                coverImage: '',
                socialMedia: {
                    facebook: '',
                    instagram: '',
                    tiktok: ''
                },
                themeColors: {
                    primary: '#FF6B35',
                    secondary: '#004E89',
                    accent: '#F7931E',
                    dark: '#1A1A1A'
                },
                createdAt: new Date(),
            })
            console.log('✅ Configuración inicial creada\n')
        } else {
            console.log('ℹ️  Configuración ya existe\n')
        }

        console.log('🎉 ¡Base de datos inicializada correctamente!\n')
        console.log('📝 Próximos pasos:')
        console.log('1. Ejecuta: npm run dev')
        console.log('2. Accede al panel admin en: http://localhost:3000/admin')
        console.log('3. Usuario: admin | Contraseña: admin123')
        console.log('4. ¡Personaliza tu menú!\n')

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('\n⚠️  Asegúrate de:')
        console.error('1. Tener una cuenta en MongoDB Atlas (https://www.mongodb.com/cloud/atlas)')
        console.error('2. Crear un cluster gratuito')
        console.error('3. Configurar la variable MONGODB_URI en .env.local')
        console.error('4. Permitir acceso desde cualquier IP (0.0.0.0/0) en Network Access\n')
    } finally {
        await client.close()
    }
}

initDatabase()
