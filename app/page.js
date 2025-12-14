'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function HomePage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [config, setConfig] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, configRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories'),
                fetch('/api/config'),
            ])

            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()
            const configData = await configRes.json()

            setProducts(productsData)
            setCategories(categoriesData)
            setConfig(configData)
        } catch (error) {
            console.error('Error al cargar datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (product) => {
        const existingItem = cart.find((item) => item._id === product._id)

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            )
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item._id !== productId))
    }

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId)
        } else {
            setCart(
                cart.map((item) =>
                    item._id === productId ? { ...item, quantity: newQuantity } : item
                )
            )
        }
    }

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    const sendWhatsAppOrder = () => {
        if (cart.length === 0) return

        const message = `¡Hola! Me gustaría hacer el siguiente pedido:\n\n${cart
            .map(
                (item) =>
                    `• ${item.name} x${item.quantity} - ${config?.currency || 'S/'}${(
                        item.price * item.quantity
                    ).toFixed(2)}`
            )
            .join('\n')}\n\n*Total: ${config?.currency || 'S/'}${getTotal().toFixed(
                2
            )}*`

        const whatsappNumber = config?.whatsappNumber || '51999999999'
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`

        window.open(url, '_blank')
    }

    const filteredProducts =
        selectedCategory === 'all'
            ? products
            : products.filter((p) => p.category === selectedCategory)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Cargando menú...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-gray-200 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                <span className="text-2xl">🍽️</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-dark">
                                    {config?.restaurantName || 'Mi Restaurante'}
                                </h1>
                                <p className="text-sm text-gray-600">Menú Digital</p>
                            </div>
                        </div>
                        <a
                            href="/admin"
                            className="text-sm text-gray-500 hover:text-primary transition-colors"
                        >
                            Admin
                        </a>
                    </div>
                </div>
            </header>

            {/* Categories */}
            <div className="sticky top-20 z-30 glass border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === 'all'
                                    ? 'bg-primary text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category._id}
                                onClick={() => setSelectedCategory(category._id)}
                                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === category._id
                                        ? 'bg-primary text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category.icon} {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className="card overflow-hidden animate-fadeIn"
                        >
                            {product.image && (
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-dark mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-primary">
                                        {config?.currency || 'S/'} {product.price.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">
                            No hay productos en esta categoría
                        </p>
                    </div>
                )}
            </main>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setShowCart(true)}
                    className="cart-fab w-16 h-16 flex items-center justify-center"
                >
                    <div className="relative">
                        <span className="text-3xl">🛒</span>
                        <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    </div>
                </button>
            )}

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-dark">Tu Pedido</h2>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-500 hover:text-dark text-3xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between py-4 border-b border-gray-200"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-dark">{item.name}</h3>
                                        <p className="text-primary font-bold mt-1">
                                            {config?.currency || 'S/'} {item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item._id, item.quantity - 1)
                                            }
                                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="font-semibold w-8 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(item._id, item.quantity + 1)
                                            }
                                            className="w-8 h-8 bg-primary text-white rounded-full hover:bg-opacity-90 font-bold"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xl font-semibold text-dark">Total:</span>
                                <span className="text-3xl font-bold text-primary">
                                    {config?.currency || 'S/'} {getTotal().toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={sendWhatsAppOrder}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <span className="text-2xl">📱</span>
                                <span>Enviar Pedido por WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
