import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function checkAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
        return null
    }

    return await verifyToken(token.value)
}

// Obtener todas las categorías (admin)
export async function GET() {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const client = await clientPromise
        const db = client.db('menu-digital')

        const categories = await db
            .collection('categories')
            .find({})
            .sort({ order: 1 })
            .toArray()

        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Crear categoría
export async function POST(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db('menu-digital')

        const result = await db.collection('categories').insertOne({
            ...data,
            active: data.active ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return NextResponse.json({ success: true, id: result.insertedId })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Actualizar categoría
export async function PUT(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db('menu-digital')

        // Extract _id and remove it from update data
        const categoryId = data._id || data.id
        if (!categoryId) {
            return NextResponse.json({ error: 'ID de categoría requerido' }, { status: 400 })
        }

        // Remove _id and id from data to avoid MongoDB error
        const { _id, id, ...updateData } = data

        const result = await db.collection('categories').updateOne(
            { _id: new ObjectId(categoryId) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                },
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error al actualizar categoría:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Eliminar categoría
export async function DELETE(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        const client = await clientPromise
        const db = client.db('menu-digital')

        await db.collection('categories').deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
