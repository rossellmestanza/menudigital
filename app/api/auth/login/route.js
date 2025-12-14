import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import clientPromise from '@/lib/mongodb'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db('menu-digital')

        const admin = await db.collection('admins').findOne({ username })

        if (!admin) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            )
        }

        const isValidPassword = await bcrypt.compare(password, admin.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            )
        }

        const token = await generateToken({
            id: admin._id.toString(),
            username: admin.username,
        })

        const cookieStore = await cookies()
        cookieStore.set('admin-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 días
        })

        return NextResponse.json({
            success: true,
            user: {
                id: admin._id.toString(),
                username: admin.username,
            },
        })
    } catch (error) {
        console.error('Error en login:', error)
        return NextResponse.json(
            { error: 'Error al iniciar sesión' },
            { status: 500 }
        )
    }
}
