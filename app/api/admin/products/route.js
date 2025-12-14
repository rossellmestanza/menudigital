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

// Obtener todos los productos (admin)
export async function GET() {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const client = await clientPromise
        const db = client.db('menu-digital')

        const products = await db
            .collection('products')
            .find({})
            .sort({ category: 1, order: 1 })
            .toArray()

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Crear producto
export async function POST(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db('menu-digital')

        const result = await db.collection('products').insertOne({
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

// Actualizar producto
export async function PUT(request) {
    try {
        const user = await checkAuth()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id, ...data } = await request.json()
        const client = await clientPromise
        const db = client.db('menu-digital')

        await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                },
            }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Eliminar producto
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

        await db.collection('products').deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
