import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db('menu-digital')

        const config = await db.collection('config').findOne({ _id: 'main' })

        if (!config) {
            // Configuración por defecto
            return NextResponse.json({
                restaurantName: 'Mi Restaurante',
                whatsappNumber: '51999999999',
                currency: 'S/',
                welcomeMessage: '¡Bienvenido a nuestro menú digital!',
                logo: '',
                coverImage: '',
            })
        }

        return NextResponse.json(config)
    } catch (error) {
        console.error('Error al obtener configuración:', error)
        return NextResponse.json(
            { error: 'Error al obtener configuración' },
            { status: 500 }
        )
    }
}
