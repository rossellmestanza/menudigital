'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (res.ok) {
                router.push('/admin/dashboard')
            } else {
                setError(data.error || 'Error al iniciar sesión')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 flex items-center justify-center p-4">
            <div className="card max-w-md w-full p-8 animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-dark mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-gray-600">Ingresa tus credenciales</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-sm text-primary hover:text-opacity-80 transition-colors"
                    >
                        ← Volver al menú
                    </a>
                </div>
            </div>
        </div>
    )
}
