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
    const [showProductDetails, setShowProductDetails] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    // Product customization states
    const [selectedVariables, setSelectedVariables] = useState({})
    const [selectedExtras, setSelectedExtras] = useState([])

    // Order form states
    const [orderType, setOrderType] = useState('delivery')
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [tableNumber, setTableNumber] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('efectivo')
    const [observations, setObservations] = useState('')
    const [showOrderForm, setShowOrderForm] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    // Apply theme colors dynamically
    useEffect(() => {
        if (config?.themeColors) {
            document.documentElement.style.setProperty('--color-primary', config.themeColors.primary)
            document.documentElement.style.setProperty('--color-secondary', config.themeColors.secondary)
            document.documentElement.style.setProperty('--color-accent', config.themeColors.accent)
            document.documentElement.style.setProperty('--color-dark', config.themeColors.dark)
        }
    }, [config])

    const fetchData = async () => {
        try {
            const [configRes, productsRes, categoriesRes] = await Promise.all([
                fetch('/api/config'),
                fetch('/api/products'),
                fetch('/api/categories'),
            ])

            const configData = await configRes.json()
            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()

            setConfig(configData)
            setProducts(productsData)
            setCategories(categoriesData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (product, customVariables = {}, customExtras = []) => {
        // Calculate total price with extras
        const extrasPrice = customExtras.reduce((sum, extra) => sum + extra.price, 0)
        const totalPrice = product.price + extrasPrice

        // Create unique ID based on product and customization
        const customizationKey = JSON.stringify({ id: product._id, vars: customVariables, extras: customExtras.map(e => e.name) })

        // Check if exact same configuration exists
        const existingItem = cart.find((item) =>
            item._id === product._id &&
            JSON.stringify({ vars: item.selectedVariables, extras: item.selectedExtras?.map(e => e.name) }) ===
            JSON.stringify({ vars: customVariables, extras: customExtras.map(e => e.name) })
        )

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item === existingItem
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            )
        } else {
            setCart([...cart, {
                ...product,
                quantity: 1,
                basePrice: product.price,
                price: totalPrice,
                selectedVariables: customVariables,
                selectedExtras: customExtras
            }])
        }

        // Reset selections
        setSelectedVariables({})
        setSelectedExtras([])
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

        // Validación según tipo de pedido
        if (orderType === 'delivery') {
            if (!customerName || !customerPhone || !deliveryAddress) {
                alert('⚠️ Por favor completa: Nombre, Teléfono y Dirección')
                return
            }
        } else if (orderType === 'llevar') {
            if (!customerName || !customerPhone) {
                alert('⚠️ Por favor completa: Nombre y Teléfono')
                return
            }
        } else if (orderType === 'mesa') {
            if (!tableNumber) {
                alert('⚠️ Por favor indica el número de mesa')
                return
            }
        }

        // Encabezado del tipo de pedido
        let orderTypeText = ''
        if (orderType === 'delivery') orderTypeText = '🚚 *DELIVERY*'
        else if (orderType === 'llevar') orderTypeText = '🛍️ *PARA LLEVAR*'
        else if (orderType === 'mesa') orderTypeText = '🍽️ *EN MESA*'

        // Lista de productos con detalles de variables y extras
        const productsList = cart
            .map((item) => {
                let itemText = `• ${item.name} x${item.quantity} - ${config?.currency || 'S/'}${(item.price * item.quantity).toFixed(2)}`

                // Add variables if present
                if (item.selectedVariables && Object.keys(item.selectedVariables).length > 0) {
                    const varsText = Object.entries(item.selectedVariables)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                    itemText += `\\n  ↳ ${varsText}`
                }

                // Add extras if present
                if (item.selectedExtras && item.selectedExtras.length > 0) {
                    const extrasText = item.selectedExtras.map(e => e.name).join(', ')
                    itemText += `\\n  ↳ Extras: ${extrasText}`
                }

                return itemText
            })
            .join('\\n')


        // Información del cliente
        let customerInfo = ''
        if (orderType === 'delivery') {
            customerInfo = `\\n📋 *DATOS:*\\nNombre: ${customerName}\\nTeléfono: ${customerPhone}\\nDirección: ${deliveryAddress}\\nPago: ${paymentMethod.toUpperCase()}`
            if (observations) customerInfo += `\\nObservaciones: ${observations}`
        } else if (orderType === 'llevar') {
            customerInfo = `\\n📋 *DATOS:*\\nNombre: ${customerName}\\nTeléfono: ${customerPhone}`
        } else if (orderType === 'mesa') {
            customerInfo = `\\n🔢 *MESA:* ${tableNumber}`
        }

        const message = `¡Hola! Quiero hacer un pedido:\\n\\n${orderTypeText}\\n\\n${productsList}${customerInfo}\\n\\n💰 *Total: ${config?.currency || 'S/'}${getTotal().toFixed(2)}*`

        const whatsappNumber = config?.whatsappNumber || '51999999999'
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

        window.open(url, '_blank')

        // Resetear formulario
        setShowCart(false)
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setDeliveryAddress('')
        setTableNumber('')
        setObservations('')
        setShowOrderForm(false)
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
                            Acceder
                        </a>
                    </div>
                </div>
            </header>

            {/* Cover Image & Profile */}
            <div className="relative">
                {/* Cover Image */}
                {config?.coverImage && (
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                        <Image
                            src={config.coverImage}
                            alt="Portada"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Logo & Info */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative -mt-16 md:-mt-20 mb-6">
                        {config?.logo ? (
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                                <Image
                                    src={config.logo}
                                    alt={config?.restaurantName || 'Logo'}
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                                <span className="text-5xl">🍽️</span>
                            </div>
                        )}
                    </div>

                    {/* Welcome Message */}
                    {config?.welcomeMessage && (
                        <div className="mb-6">
                            <p className="text-lg text-gray-700 text-center md:text-left">
                                {config.welcomeMessage}
                            </p>
                        </div>
                    )}

                    {/* Social Media & Contact */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        {/* WhatsApp */}
                        {config?.whatsappNumber && (
                            <a
                                href={`https://wa.me/${config.whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>WhatsApp</span>
                            </a>
                        )}

                        {/* Phone */}
                        {config?.phoneNumber && (
                            <a
                                href={`tel:${config.phoneNumber}`}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>Llamar</span>
                            </a>
                        )}

                        {/* Facebook */}
                        {config?.socialMedia?.facebook && (
                            <a
                                href={config.socialMedia.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        )}

                        {/* Instagram */}
                        {config?.socialMedia?.instagram && (
                            <a
                                href={config.socialMedia.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        )}

                        {/* TikTok */}
                        {config?.socialMedia?.tiktok && (
                            <a
                                href={config.socialMedia.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                                aria-label="TikTok"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="sticky top-20 z-30 glass border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${selectedCategory === 'all'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category._id}
                                onClick={() => setSelectedCategory(category._id)}
                                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${selectedCategory === category._id
                                    ? 'bg-primary text-white shadow-md'
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
                            className="card overflow-hidden animate-fadeIn cursor-pointer"
                            onClick={() => {
                                setSelectedProduct(product)
                                setShowProductDetails(true)
                            }}
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // If product has variables or extras, open modal. Otherwise, add directly
                                            if (product.variables?.length > 0 || product.extras?.length > 0) {
                                                setSelectedProduct(product)
                                                setShowProductDetails(true)
                                            } else {
                                                addToCart(product)
                                            }
                                        }}
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

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {/* WhatsApp Button */}
                {config?.whatsappNumber && (
                    <a
                        href={`https://wa.me/${config.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                        aria-label="WhatsApp"
                    >
                        <span className="text-2xl">💬</span>
                        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            WhatsApp
                        </span>
                    </a>
                )}

                {/* Phone Button */}
                {config?.phoneNumber && (
                    <a
                        href={`tel:${config.phoneNumber}`}
                        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                        aria-label="Llamar"
                    >
                        <span className="text-2xl">📞</span>
                        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Llamar
                        </span>
                    </a>
                )}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-6 left-6 w-16 h-16 bg-primary hover:bg-opacity-90 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
                >
                    <div className="relative">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span className="absolute -top-2 -right-2 bg-white text-primary font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center">
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
                                    onClick={() => {
                                        setShowCart(false)
                                        setShowOrderForm(false)
                                    }}
                                    className="text-gray-500 hover:text-dark text-3xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Products List - Only show when NOT in order form */}
                        {!showOrderForm && (
                            <div className="flex-1 overflow-y-auto p-6">
                                {cart.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center space-x-4 mb-4 pb-4 border-b"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-dark">{item.name}</h3>

                                            {/* Show selected variables */}
                                            {item.selectedVariables && Object.keys(item.selectedVariables).length > 0 && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {Object.entries(item.selectedVariables).map(([key, value]) => (
                                                        <span key={key} className="mr-2">
                                                            {key}: <span className="font-medium">{value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Show selected extras */}
                                            {item.selectedExtras && item.selectedExtras.length > 0 && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                                                </div>
                                            )}

                                            <p className="text-primary font-bold">
                                                {config?.currency || 'S/'} {item.price.toFixed(2)}
                                                {item.selectedExtras && item.selectedExtras.length > 0 && (
                                                    <span className="text-xs text-gray-600 ml-1">
                                                        (Base: {config?.currency || 'S/'}{item.basePrice.toFixed(2)})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, item.quantity - 1)
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-8 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, item.quantity + 1)
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
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
                        )}

                        {/* Order Form - Scrollable */}
                        {showOrderForm && (
                            <div className="flex-1 overflow-y-auto p-6">
                                <button
                                    onClick={() => setShowOrderForm(false)}
                                    className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-dark transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span>Volver al resumen</span>
                                </button>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-dark">📝 Datos del Pedido</h3>

                                    {/* Order Type Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Pedido</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setOrderType('delivery')}
                                                className={`py-3 px-2 rounded-lg font-semibold transition-all text-sm ${orderType === 'delivery'
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                🚚 Delivery
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOrderType('llevar')}
                                                className={`py-3 px-2 rounded-lg font-semibold transition-all text-sm ${orderType === 'llevar'
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                🛍️ Llevar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOrderType('mesa')}
                                                className={`py-3 px-2 rounded-lg font-semibold transition-all text-sm ${orderType === 'mesa'
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                🍽️ Mesa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delivery Fields */}
                                    {orderType === 'delivery' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Nombre <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Teléfono <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="987654321"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Dirección <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={deliveryAddress}
                                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Calle, número, referencia..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Método de Pago <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    <option value="efectivo">💵 Efectivo</option>
                                                    <option value="yape">📱 Yape</option>
                                                    <option value="plin">📱 Plin</option>
                                                    <option value="otro">💳 Otro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Observaciones (Opcional)
                                                </label>
                                                <textarea
                                                    value={observations}
                                                    onChange={(e) => setObservations(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Indicaciones adicionales..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Llevar Fields */}
                                    {orderType === 'llevar' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Nombre <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Teléfono <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="987654321"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Mesa Fields */}
                                    {orderType === 'mesa' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Número de Mesa <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={tableNumber}
                                                onChange={(e) => setTableNumber(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Ej: 12"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xl font-semibold text-dark">Total:</span>
                                <span className="text-3xl font-bold text-primary">
                                    {config?.currency || 'S/'} {getTotal().toFixed(2)}
                                </span>
                            </div>

                            {/* Two-Step Checkout */}
                            {!showOrderForm ? (
                                <button
                                    onClick={() => setShowOrderForm(true)}
                                    className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Confirmar Pedido</span>
                                </button>
                            ) : (
                                <button
                                    onClick={sendWhatsAppOrder}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                >
                                    <span className="text-2xl">📱</span>
                                    <span>Enviar Pedido por WhatsApp</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {showProductDetails && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowProductDetails(false)
                                    setSelectedProduct(null)
                                }}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {selectedProduct.image && (
                                <div className="relative h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <Image
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <h2 className="text-3xl font-bold text-dark mb-3">{selectedProduct.name}</h2>

                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <span className="text-3xl font-bold text-primary">
                                    {config?.currency || 'S/'} {selectedProduct.price.toFixed(2)}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-dark mb-2">Descripción</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {selectedProduct.description || 'Sin descripción disponible.'}
                                </p>
                            </div>

                            {/* Product Variables - Interactive Selection */}
                            {selectedProduct.variables && selectedProduct.variables.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-dark mb-3">
                                        🔧 Opciones {selectedProduct.variables.some(v => v.required) && <span className="text-red-500 text-sm">(Requerido)</span>}
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedProduct.variables.map((variable, varIndex) => (
                                            <div key={varIndex} className="bg-gray-50 p-4 rounded-lg">
                                                <p className="font-semibold text-gray-700 mb-2">
                                                    {variable.name}
                                                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                                                </p>
                                                <div className="space-y-2">
                                                    {variable.options.map((option, optIndex) => {
                                                        // Handle both string options and object options {name, priceModifier}
                                                        const optionName = typeof option === 'string' ? option : option.name
                                                        const optionValue = typeof option === 'string' ? option : option.name

                                                        return (
                                                            <label key={optIndex} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                                                                <input
                                                                    type="radio"
                                                                    name={`variable-${varIndex}`}
                                                                    value={optionValue}
                                                                    checked={selectedVariables[variable.name] === optionValue}
                                                                    onChange={(e) => setSelectedVariables({
                                                                        ...selectedVariables,
                                                                        [variable.name]: e.target.value
                                                                    })}
                                                                    className="w-4 h-4 text-primary focus:ring-primary"
                                                                />
                                                                <span className="text-gray-700">{optionName}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Extras - Interactive Selection */}
                            {selectedProduct.extras && selectedProduct.extras.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-dark mb-3">➕ Extras Disponibles</h3>
                                    <div className="space-y-2">
                                        {selectedProduct.extras.map((extra, index) => (
                                            <label key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExtras.some(e => e.name === extra.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedExtras([...selectedExtras, extra])
                                                            } else {
                                                                setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name))
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-primary focus:ring-primary rounded"
                                                    />
                                                    <span className="text-gray-700">{extra.name}</span>
                                                </div>
                                                <span className="font-semibold text-primary">
                                                    +{config?.currency || 'S/'}{extra.price.toFixed(2)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            {/* Price Summary */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600">Precio base:</span>
                                    <span className="font-semibold text-gray-700">
                                        {config?.currency || 'S/'}{selectedProduct.price.toFixed(2)}
                                    </span>
                                </div>
                                {selectedExtras.length > 0 && (
                                    <>
                                        {selectedExtras.map((extra, i) => (
                                            <div key={i} className="flex items-center justify-between mb-1 text-sm">
                                                <span className="text-gray-600">+ {extra.name}:</span>
                                                <span className="text-gray-700">
                                                    {config?.currency || 'S/'}{extra.price.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-300 my-2"></div>
                                    </>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-semibold text-dark">Total:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {config?.currency || 'S/'}
                                        {(selectedProduct.price + selectedExtras.reduce((sum, e) => sum + e.price, 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // Validate required variables
                                    const requiredVars = selectedProduct.variables?.filter(v => v.required) || []
                                    const missingRequired = requiredVars.filter(v => !selectedVariables[v.name])

                                    if (missingRequired.length > 0) {
                                        alert(`⚠️ Por favor selecciona: ${missingRequired.map(v => v.name).join(', ')}`)
                                        return
                                    }

                                    setShowProductDetails(false)
                                    setSelectedProduct(null)
                                    addToCart(selectedProduct, selectedVariables, selectedExtras)
                                }}
                                className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Agregar al Carrito</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
