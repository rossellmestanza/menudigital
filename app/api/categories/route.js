import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db('menu-digital')

        const categories = await db
            .collection('categories')
            .find({ active: true })
            .sort({ order: 1 })
            .toArray()

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error al obtener categorías:', error)
        return NextResponse.json(
            { error: 'Error al obtener categorías' },
            { status: 500 }
        )
    }
}
