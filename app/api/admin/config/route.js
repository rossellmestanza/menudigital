import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

async function checkAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
        return null
    }

    return await verifyToken(token.value)
}

// Actualizar configuración
export async function PUT(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db('menu-digital')

        await db.collection('config').updateOne(
            { _id: 'main' },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
