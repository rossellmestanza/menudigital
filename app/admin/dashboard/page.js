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

            if (res.ok) {
                await fetchData()
                setShowModal(false)
                setEditingItem(null)
            }
        } catch (error) {
            console.error('Error al guardar producto:', error)
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

            if (res.ok) {
                await fetchData()
                setShowModal(false)
                setEditingItem(null)
            }
        } catch (error) {
            console.error('Error al guardar categoría:', error)
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

                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                                    Número de WhatsApp (con código de país)
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
                                    rows={3}
                                />
                            </div>

                            <button onClick={saveConfig} className="btn-primary">
                                Guardar Configuración
                            </button>
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
