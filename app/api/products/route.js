import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db('menu-digital')

        const products = await db
            .collection('products')
            .find({ active: true })
            .sort({ category: 1, order: 1 })
            .toArray()

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error al obtener productos:', error)
        return NextResponse.json(
            { error: 'Error al obtener productos' },
            { status: 500 }
        )
    }
}
