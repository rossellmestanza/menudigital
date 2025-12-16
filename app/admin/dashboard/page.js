'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('products')
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, configRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/categories'),
                fetch('/api/config'),
            ])

            if (productsRes.status === 401 || categoriesRes.status === 401) {
                router.push('/admin')
                return
            }

            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()
            const configData = await configRes.json()

            setProducts(productsData)
            setCategories(categoriesData)
            setConfig(configData)
        } catch (error) {
            console.error('Error al cargar datos:', error)
            router.push('/admin')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin')
    }

    const openProductModal = (product = null) => {
        setEditingItem(
            product || {
                name: '',
                description: '',
                price: 0,
                category: '',
                image: '',
                active: true,
                order: 0,
                extras: [],
                variables: []
            }
        )
        setShowModal(true)
    }

    const openCategoryModal = (category = null) => {
        setEditingItem(
            category || {
                name: '',
                icon: '📦',
                active: true,
                order: 0,
            }
        )
        setShowModal(true)
    }

    const saveProduct = async () => {
        try {
            const method = editingItem._id ? 'PUT' : 'POST'
            const res = await fetch('/api/admin/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            })

            const data = await res.json()

            if (res.ok) {
                await fetchData()
                setShowModal(false)
                setEditingItem(null)
                alert('✅ Producto guardado correctamente')
            } else {
                console.error('Error del servidor:', data)
                alert('❌ Error al guardar: ' + (data.error || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al guardar producto:', error)
            alert('❌ Error de conexión al guardar el producto')
        }
    }

    const saveCategory = async () => {
        try {
            const method = editingItem._id ? 'PUT' : 'POST'
            const res = await fetch('/api/admin/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            })

            const data = await res.json()

            if (res.ok) {
                await fetchData()
                setShowModal(false)
                setEditingItem(null)
                alert('✅ Categoría guardada correctamente')
            } else {
                console.error('Error del servidor:', data)
                alert('❌ Error al guardar: ' + (data.error || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al guardar categoría:', error)
            alert('❌ Error de conexión al guardar la categoría')
        }
    }

    const deleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return

        try {
            await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
            await fetchData()
        } catch (error) {
            console.error('Error al eliminar producto:', error)
        }
    }

    const deleteCategory = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

        try {
            await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
            await fetchData()
        } catch (error) {
            console.error('Error al eliminar categoría:', error)
        }
    }

    const saveConfig = async () => {
        try {
            await fetch('/api/admin/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            })
            alert('Configuración guardada correctamente')
        } catch (error) {
            console.error('Error al guardar configuración:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-dark">
                            Panel de Administración
                        </h1>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/"
                                target="_blank"
                                className="text-sm text-primary hover:text-opacity-80"
                            >
                                Ver Menú →
                            </a>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'products'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'categories'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Categorías
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'config'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Configuración
                        </button>
                        <button
                            onClick={() => setActiveTab('share')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'share'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            📱 Compartir
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-dark">Productos</h2>
                            <button
                                onClick={() => openProductModal()}
                                className="btn-primary"
                            >
                                + Nuevo Producto
                            </button>
                        </div>

                        {/* Desktop Table - Hidden on mobile */}
                        <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Precio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-dark">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {product.description?.substring(0, 50)}...
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-primary">
                                                S/ {product.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {categories.find((c) => c._id === product.category)
                                                    ?.name || 'Sin categoría'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${product.active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {product.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => openProductModal(product)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product._id)}
                                                    className="text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - Shown on mobile only */}
                        <div className="md:hidden space-y-4">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl shadow-md p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-dark text-lg flex-1">{product.name}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${product.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {product.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-semibold text-gray-700">Descripción:</span>{' '}
                                            {product.description?.substring(0, 60)}...
                                        </p>
                                        <p className="text-primary font-bold text-xl">
                                            S/ {product.price.toFixed(2)}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-semibold text-gray-700">Categoría:</span>{' '}
                                            {categories.find((c) => c._id === product.category)?.name || 'Sin categoría'}
                                        </p>
                                    </div>

                                    <div className="flex space-x-2 pt-3 border-t">
                                        <button
                                            onClick={() => openProductModal(product)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product._id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-dark">Categorías</h2>
                            <button
                                onClick={() => openCategoryModal()}
                                className="btn-primary"
                            >
                                + Nueva Categoría
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((category) => (
                                <div key={category._id} className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-3xl">{category.icon}</span>
                                            <div>
                                                <h3 className="font-bold text-dark">{category.name}</h3>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${category.active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {category.active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openCategoryModal(category)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category._id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Config Tab */}
                {activeTab === 'config' && config && (
                    <div>
                        <h2 className="text-2xl font-bold text-dark mb-6">Configuración del Restaurante</h2>

                        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                            {/* Información Básica */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-dark mb-4">📝 Información Básica</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nombre del Restaurante
                                        </label>
                                        <input
                                            type="text"
                                            value={config.restaurantName || ''}
                                            onChange={(e) =>
                                                setConfig({ ...config, restaurantName: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Símbolo de Moneda
                                        </label>
                                        <input
                                            type="text"
                                            value={config.currency || 'S/'}
                                            onChange={(e) =>
                                                setConfig({ ...config, currency: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mensaje de Bienvenida
                                    </label>
                                    <textarea
                                        value={config.welcomeMessage || ''}
                                        onChange={(e) =>
                                            setConfig({ ...config, welcomeMessage: e.target.value })
                                        }
                                        className="input-field"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Imágenes */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-dark mb-4">🖼️ Imágenes</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            URL del Logo
                                        </label>
                                        <input
                                            type="text"
                                            value={config.logo || ''}
                                            onChange={(e) =>
                                                setConfig({ ...config, logo: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="https://ejemplo.com/logo.png"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Logo circular del restaurante</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            URL de la Portada
                                        </label>
                                        <input
                                            type="text"
                                            value={config.coverImage || ''}
                                            onChange={(e) =>
                                                setConfig({ ...config, coverImage: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="https://ejemplo.com/portada.jpg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Imagen de banner superior</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-dark mb-4">📱 Contacto</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Número de WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={config.whatsappNumber || ''}
                                            onChange={(e) =>
                                                setConfig({ ...config, whatsappNumber: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="51999999999"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Con código de país (sin +)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Número de Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            value={config.phoneNumber || ''}
                                            onChange={(e) =>
                                                setConfig({ ...config, phoneNumber: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="5199999999"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Para llamadas directas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Redes Sociales */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-dark mb-4">🌐 Redes Sociales</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            🔵 Facebook
                                        </label>
                                        <input
                                            type="text"
                                            value={config.socialMedia?.facebook || ''}
                                            onChange={(e) =>
                                                setConfig({
                                                    ...config,
                                                    socialMedia: {
                                                        ...config.socialMedia,
                                                        facebook: e.target.value
                                                    }
                                                })
                                            }
                                            className="input-field"
                                            placeholder="https://facebook.com/turestaurante"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            📸 Instagram
                                        </label>
                                        <input
                                            type="text"
                                            value={config.socialMedia?.instagram || ''}
                                            onChange={(e) =>
                                                setConfig({
                                                    ...config,
                                                    socialMedia: {
                                                        ...config.socialMedia,
                                                        instagram: e.target.value
                                                    }
                                                })
                                            }
                                            className="input-field"
                                            placeholder="https://instagram.com/turestaurante"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            🎵 TikTok
                                        </label>
                                        <input
                                            type="text"
                                            value={config.socialMedia?.tiktok || ''}
                                            onChange={(e) =>
                                                setConfig({
                                                    ...config,
                                                    socialMedia: {
                                                        ...config.socialMedia,
                                                        tiktok: e.target.value
                                                    }
                                                })
                                            }
                                            className="input-field"
                                            placeholder="https://tiktok.com/@turestaurante"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Theme Colors Section */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-bold text-dark mb-4">🎨 Colores del Tema</h3>

                                {/* Predefined Color Palettes */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Paletas Sugeridas
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { name: 'Naranja (Por defecto)', primary: '#FF6B35', secondary: '#004E89', accent: '#F7931E' },
                                            { name: 'Azul Profesional', primary: '#2563EB', secondary: '#1E40AF', accent: '#3B82F6' },
                                            { name: 'Verde Natural', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
                                            { name: 'Rojo Pasión', primary: '#EF4444', secondary: '#DC2626', accent: '#F87171' },
                                            { name: 'Púrpura Moderno', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
                                            { name: 'Rosa Elegante', primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6' },
                                            { name: 'Amarillo Vibrante', primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' },
                                            { name: 'Turquesa Fresco', primary: '#14B8A6', secondary: '#0D9488', accent: '#2DD4BF' }
                                        ].map((palette, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            primary: palette.primary,
                                                            secondary: palette.secondary,
                                                            accent: palette.accent
                                                        }
                                                    })
                                                }}
                                                className="p-3 border-2 rounded-lg hover:border-gray-400 transition-all text-left"
                                            >
                                                <p className="text-xs font-semibold mb-2">{palette.name}</p>
                                                <div className="flex space-x-1">
                                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: palette.primary }} title="Primario"></div>
                                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: palette.secondary }} title="Secundario"></div>
                                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: palette.accent }} title="Acento"></div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Color Pickers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Color Primario
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={config.themeColors?.primary || '#FF6B35'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            primary: e.target.value
                                                        }
                                                    })
                                                }
                                                className="w-16 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.themeColors?.primary || '#FF6B35'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            primary: e.target.value
                                                        }
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded uppercase"
                                                placeholder="#FF6B35"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Botones principales, enlaces</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Color Secundario
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={config.themeColors?.secondary || '#004E89'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            secondary: e.target.value
                                                        }
                                                    })
                                                }
                                                className="w-16 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.themeColors?.secondary || '#004E89'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            secondary: e.target.value
                                                        }
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded uppercase"
                                                placeholder="#004E89"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Elementos secundarios</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Color de Acento
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={config.themeColors?.accent || '#F7931E'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            accent: e.target.value
                                                        }
                                                    })
                                                }
                                                className="w-16 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.themeColors?.accent || '#F7931E'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            accent: e.target.value
                                                        }
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded uppercase"
                                                placeholder="#F7931E"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Resaltados, badges</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Color Oscuro
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={config.themeColors?.dark || '#1A1A1A'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            dark: e.target.value
                                                        }
                                                    })
                                                }
                                                className="w-16 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.themeColors?.dark || '#1A1A1A'}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        themeColors: {
                                                            ...config.themeColors,
                                                            dark: e.target.value
                                                        }
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded uppercase"
                                                placeholder="#1A1A1A"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Textos principales</p>
                                    </div>
                                </div>

                                {/* Color Preview */}
                                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                    <h4 className="text-sm font-semibold mb-3">Vista Previa:</h4>
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            style={{ backgroundColor: config.themeColors?.primary || '#FF6B35' }}
                                            className="px-4 py-2 text-white rounded-lg font-semibold"
                                        >
                                            Botón Primario
                                        </button>
                                        <div
                                            className="p-3 rounded"
                                            style={{ backgroundColor: config.themeColors?.accent || '#F7931E', color: 'white' }}
                                        >
                                            Elemento con color de acento
                                        </div>
                                        <p style={{ color: config.themeColors?.dark || '#1A1A1A' }} className="font-semibold">
                                            Texto con color oscuro
                                        </p>
                                    </div>
                                </div>

                                {/* Contrast Warning */}
                                {config.themeColors?.primary && (
                                    <div className="mt-3">
                                        {(() => {
                                            // Simple contrast check
                                            const hex = config.themeColors.primary.replace('#', '')
                                            const r = parseInt(hex.substr(0, 2), 16)
                                            const g = parseInt(hex.substr(2, 2), 16)
                                            const b = parseInt(hex.substr(4, 2), 16)
                                            const brightness = (r * 299 + g * 587 + b * 114) / 1000

                                            if (brightness > 200) {
                                                return (
                                                    <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <span className="text-yellow-600 text-xl">⚠️</span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-yellow-800">Color muy claro detectado</p>
                                                            <p className="text-xs text-yellow-700 mt-1">
                                                                El color primario puede tener poco contraste con fondos blancos.
                                                                Considera usar un tono más oscuro para mejor legibilidad.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return null
                                        })()}
                                    </div>
                                )}
                            </div>

                            <button onClick={saveConfig} className="btn-primary w-full">
                                💾 Guardar Toda la Configuración
                            </button>
                        </div>
                    </div>
                )}

                {/* Share Tab */}
                {activeTab === 'share' && (
                    <div>
                        <h2 className="text-2xl font-bold text-dark mb-6">📱 Compartir Menú Digital</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Enlace del Menú */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-dark mb-4">🔗 Enlace del Menú</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            URL de tu menú digital:
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={typeof window !== 'undefined' ? window.location.origin : ''}
                                                readOnly
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (typeof window !== 'undefined') {
                                                        navigator.clipboard.writeText(window.location.origin)
                                                        alert('✅ Enlace copiado al portapapeles')
                                                    }
                                                }}
                                                className="px-4 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all whitespace-nowrap"
                                            >
                                                📋 Copiar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Compartir por:</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent('¡Mira nuestro menú digital! ' + (typeof window !== 'undefined' ? window.location.origin : ''))}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                <span>WhatsApp</span>
                                            </a>

                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                <span>Facebook</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Código QR */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-bold text-dark mb-4">📱 Código QR</h3>

                                <div className="space-y-4">
                                    {/* QR Code Preview */}
                                    <div className="flex justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        {typeof window !== 'undefined' && (
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin)}`}
                                                alt="QR Code"
                                                className="w-64 h-64 rounded-lg shadow-md"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 text-center">
                                            Escanea este código QR con tu celular para acceder al menú
                                        </p>

                                        {/* Download Button */}
                                        <a
                                            href={typeof window !== 'undefined' ? `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(window.location.origin)}` : '#'}
                                            download={`menu-qr-${config?.restaurantName || 'digital'}.png`}
                                            className="block w-full px-4 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold text-center transition-all"
                                        >
                                            ⬇️ Descargar QR (Alta Calidad)
                                        </a>

                                        <a
                                            href={typeof window !== 'undefined' ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin)}` : '#'}
                                            download={`menu-qr-${config?.restaurantName || 'digital'}-small.png`}
                                            className="block w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-center transition-all"
                                        >
                                            ⬇️ Descargar QR (Tamaño Medio)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Consejos de Uso</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Imprime el código QR y colócalo en las mesas de tu restaurante</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Comparte el enlace en tus redes sociales para que tus clientes vean el menú online</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Descarga el QR en alta calidad (1000x1000) para impresiones grandes</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Usa el QR de tamaño medio (500x500) para publicaciones en redes sociales</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-dark mb-6">
                            {editingItem._id
                                ? activeTab === 'products'
                                    ? 'Editar Producto'
                                    : 'Editar Categoría'
                                : activeTab === 'products'
                                    ? 'Nuevo Producto'
                                    : 'Nueva Categoría'}
                        </h2>

                        {activeTab === 'products' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, name: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={editingItem.description}
                                        onChange={(e) =>
                                            setEditingItem({
                                                ...editingItem,
                                                description: e.target.value,
                                            })
                                        }
                                        className="input-field"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Precio (S/)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingItem.price}
                                        onChange={(e) =>
                                            setEditingItem({
                                                ...editingItem,
                                                price: parseFloat(e.target.value),
                                            })
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={editingItem.category}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, category: e.target.value })
                                        }
                                        className="input-field"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        URL de Imagen
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.image}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, image: e.target.value })
                                        }
                                        className="input-field"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>

                                {/* Extras Section */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-md font-semibold text-dark">➕ Extras</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newExtras = [...(editingItem.extras || []), { name: '', price: 0 }]
                                                setEditingItem({ ...editingItem, extras: newExtras })
                                            }}
                                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                        >
                                            + Agregar Extra
                                        </button>
                                    </div>
                                    {editingItem.extras && editingItem.extras.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {editingItem.extras.map((extra, idx) => (
                                                <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre del extra"
                                                        value={extra.name}
                                                        onChange={(e) => {
                                                            const newExtras = [...editingItem.extras]
                                                            newExtras[idx].name = e.target.value
                                                            setEditingItem({ ...editingItem, extras: newExtras })
                                                        }}
                                                        className="flex-1 px-2 py-1 border rounded text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Precio"
                                                        value={extra.price}
                                                        onChange={(e) => {
                                                            const newExtras = [...editingItem.extras]
                                                            newExtras[idx].price = parseFloat(e.target.value) || 0
                                                            setEditingItem({ ...editingItem, extras: newExtras })
                                                        }}
                                                        className="w-24 px-2 py-1 border rounded text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newExtras = editingItem.extras.filter((_, i) => i !== idx)
                                                            setEditingItem({ ...editingItem, extras: newExtras })
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Variables Section */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-md font-semibold text-dark">🔀 Variables (Opciones)</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newVariables = [...(editingItem.variables || []), {
                                                    name: '',
                                                    required: false,
                                                    options: [{ name: '', priceModifier: 0 }]
                                                }]
                                                setEditingItem({ ...editingItem, variables: newVariables })
                                            }}
                                            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            + Agregar Variable
                                        </button>
                                    </div>
                                    {editingItem.variables && editingItem.variables.length > 0 && (
                                        <div className="space-y-4 max-h-64 overflow-y-auto">
                                            {editingItem.variables.map((variable, vIdx) => (
                                                <div key={vIdx} className="p-3 bg-gray-50 rounded border">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Nombre de la variable (ej: Tamaño)"
                                                            value={variable.name}
                                                            onChange={(e) => {
                                                                const newVariables = [...editingItem.variables]
                                                                newVariables[vIdx].name = e.target.value
                                                                setEditingItem({ ...editingItem, variables: newVariables })
                                                            }}
                                                            className="flex-1 px-2 py-1 border rounded text-sm font-semibold"
                                                        />
                                                        <label className="flex items-center text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={variable.required}
                                                                onChange={(e) => {
                                                                    const newVariables = [...editingItem.variables]
                                                                    newVariables[vIdx].required = e.target.checked
                                                                    setEditingItem({ ...editingItem, variables: newVariables })
                                                                }}
                                                                className="mr-1"
                                                            />
                                                            Requerido
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVariables = editingItem.variables.filter((_, i) => i !== vIdx)
                                                                setEditingItem({ ...editingItem, variables: newVariables })
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>

                                                    {/* Variable Options */}
                                                    <div className="ml-4 space-y-1">
                                                        {variable.options && variable.options.map((option, oIdx) => (
                                                            <div key={oIdx} className="flex items-center space-x-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Opción (ej: Pequeño)"
                                                                    value={option.name}
                                                                    onChange={(e) => {
                                                                        const newVariables = [...editingItem.variables]
                                                                        newVariables[vIdx].options[oIdx].name = e.target.value
                                                                        setEditingItem({ ...editingItem, variables: newVariables })
                                                                    }}
                                                                    className="flex-1 px-2 py-1 border rounded text-xs"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="+/- Precio"
                                                                    value={option.priceModifier || 0}
                                                                    onChange={(e) => {
                                                                        const newVariables = [...editingItem.variables]
                                                                        newVariables[vIdx].options[oIdx].priceModifier = parseFloat(e.target.value) || 0
                                                                        setEditingItem({ ...editingItem, variables: newVariables })
                                                                    }}
                                                                    className="w-24 px-2 py-1 border rounded text-xs"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newVariables = [...editingItem.variables]
                                                                        newVariables[vIdx].options = newVariables[vIdx].options.filter((_, i) => i !== oIdx)
                                                                        setEditingItem({ ...editingItem, variables: newVariables })
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVariables = [...editingItem.variables]
                                                                newVariables[vIdx].options.push({ name: '', priceModifier: 0 })
                                                                setEditingItem({ ...editingItem, variables: newVariables })
                                                            }}
                                                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                                        >
                                                            + Agregar opción
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 border-t pt-4 mt-4">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.active}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, active: e.target.checked })
                                        }
                                        className="w-5 h-5 text-primary"
                                    />
                                    <label className="text-sm font-semibold text-gray-700">
                                        Producto activo
                                    </label>
                                </div>

                                <div className="flex space-x-4 mt-6">
                                    <button onClick={saveProduct} className="btn-primary flex-1">
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingItem(null)
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, name: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Icono (emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.icon}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, icon: e.target.value })
                                        }
                                        className="input-field"
                                        placeholder="🍕"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Orden
                                    </label>
                                    <input
                                        type="number"
                                        value={editingItem.order}
                                        onChange={(e) =>
                                            setEditingItem({
                                                ...editingItem,
                                                order: parseInt(e.target.value),
                                            })
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.active}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, active: e.target.checked })
                                        }
                                        className="w-5 h-5 text-primary"
                                    />
                                    <label className="text-sm font-semibold text-gray-700">
                                        Categoría activa
                                    </label>
                                </div>

                                <div className="flex space-x-4 mt-6">
                                    <button onClick={saveCategory} className="btn-primary flex-1">
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingItem(null)
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
