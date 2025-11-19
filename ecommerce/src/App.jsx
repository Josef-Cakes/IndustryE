import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './css/App.css'
import Navbar from './components/Navbar'
import Shoes from './pages/Shoes'
import Toast from './components/Toast'
import AboutPage from './pages/AboutPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import SearchPage from './pages/SearchPage'
import DetailsShoesPage from './pages/DetailsShoesPage'
import AdminApp from './components/AdminApp'
import { localShoesData } from './data/shoesData'

// API base URL
const API_BASE_URL = 'http://localhost:8080/api'

// Helper function to get local image for a product
const getLocalImageForProduct = (productId, productName) => {
  const localProduct = localShoesData.find(product => product.id === productId)
  if (localProduct) {
    return localProduct.image
  }
  
  // Fallback: try to find by name match
  const nameMatch = localShoesData.find(product => 
    product.name.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(product.name.toLowerCase())
  )
  
  if (nameMatch) {
    return nameMatch.image
  }
  
  // Default fallback image or empty string
  return ''
}

// Axios interceptor to add auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Router-enabled App Component
function AppContent() {
  const [cart, setCart] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize authentication state and cart from localStorage/backend
  useEffect(() => {
    // Check regular user authentication
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        // Set up axios default headers for authentication
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        
        // Validate token by making a test request
        axios.get(`${API_BASE_URL}/cart`)
          .then(() => {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            setIsAuthenticated(true)
            // Load cart from backend
            loadCartFromBackend()
          })
          .catch(error => {
            console.error('Token validation failed:', error)
            // Clear invalid credentials but preserve cart for guest mode
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
            // Load any guest cart from localStorage
            const guestCart = localStorage.getItem('cart')
            if (guestCart) {
              try {
                setCart(JSON.parse(guestCart))
              } catch (e) {
                console.error('Error parsing guest cart:', e)
                setCart([])
              }
            }
          })
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        // Load any guest cart from localStorage
        const guestCart = localStorage.getItem('cart')
        if (guestCart) {
          try {
            setCart(JSON.parse(guestCart))
          } catch (e) {
            console.error('Error parsing guest cart:', e)
            setCart([])
          }
        }
      }
    } else {
      // For non-authenticated users, load cart from localStorage if exists
      const guestCart = localStorage.getItem('cart')
      if (guestCart) {
        try {
          setCart(JSON.parse(guestCart))
        } catch (e) {
          console.error('Error parsing guest cart:', e)
          setCart([])
          localStorage.removeItem('cart')
        }
      }
      delete axios.defaults.headers.common['Authorization']
    }
  }, [])

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  // Load cart from backend (for authenticated users)
  const loadCartFromBackend = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`)
      if (response.data && response.data.items) {
        const cartItems = response.data.items.map(item => ({
          id: item.productId, // Use productId as the main id for frontend
          name: item.productName,
          price: item.unitPrice,
          quantity: item.quantity,
          size: item.size, // Include size information
          image: getLocalImageForProduct(item.productId, item.productName), // Use local images
          color: 'Default', // You might want to add color to backend
          cartItemId: item.id // Keep the cart item ID for backend operations
        }))
        setCart(cartItems)
        return cartItems
      }
      return []
    } catch (error) {
      console.error('Error loading cart from backend:', error)
      return []
    }
  }

  const addToCart = async (product, quantity = 1) => {
    // Check if product has selectedSize (from DetailsShoesPage)
    const productSize = product.selectedSize
    if (!productSize) {
      setToast({
        message: 'Please select a size before adding to cart',
        type: 'error'
      })
      return
    }

    const existingItem = cart.find(item => item.id === product.id && item.size === productSize)
    let updatedCart

    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id && item.size === productSize
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      updatedCart = [...cart, { ...product, quantity, size: productSize }]
    }
    
    setCart(updatedCart)
    
    // For authenticated users, sync with backend
    if (isAuthenticated) {
      try {
        await axios.post(`${API_BASE_URL}/cart/add`, {
          productId: product.id,
          quantity: quantity,
          size: productSize
        })
        
        // Show success toast
        setToast({
          message: `${quantity} ${product.name} (Size ${productSize}) added to cart!`,
          type: 'success'
        })
      } catch (error) {
        console.error('Error syncing cart with backend:', error)
        // Revert cart state if backend sync fails
        setCart(cart)
        
        // Extract error message from backend response
        const errorMessage = error.response?.data?.message || 'Failed to add item to cart. Please try again.'
        setToast({
          message: errorMessage,
          type: 'error'
        })
        return
      }
    } else {
      // For guest users, save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setToast({
        message: `${quantity} ${product.name} (Size ${productSize}) added to cart! Please log in to save your cart.`,
        type: 'success'
      })
    }
  }

  const handleLogin = async (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Set up axios default headers for authentication
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    // Load the user's cart from backend
    let backendCart = await loadCartFromBackend()
    // Get guest cart from localStorage
    const guestCartRaw = localStorage.getItem('cart')
    let guestCart = []
    if (guestCartRaw) {
      try {
        guestCart = JSON.parse(guestCartRaw)
      } catch (e) {
        guestCart = []
      }
    }
    // Only merge guest cart if backend cart is empty and guest cart has items
    if (backendCart.length === 0 && guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await axios.post(`${API_BASE_URL}/cart/add`, {
            productId: item.id,
            quantity: item.quantity,
            size: item.size
          })
        }
        backendCart = await loadCartFromBackend()
      } catch (error) {
        console.error('Error merging guest cart:', error)
      }
    }
    setCart(backendCart)
    // Always clear guest cart after login
    localStorage.removeItem('cart')
    setToast({
      message: `Welcome back, ${userData.name}!`,
      type: 'success'
    })
    navigate('/shoes')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setCart([]) // Clear in-memory cart on logout
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    navigate('/')
    setToast({
      message: 'Successfully logged out!',
      type: 'success'
    })
  }

  const closeToast = () => {
    setToast(null)
  }
  const updateQuantity = async (id, newQuantity, size) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size)
      return
    }

    const updatedCart = cart.map(item =>
      (item.id === id && item.size === size) ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    
    if (isAuthenticated) {
      // Sync with backend for authenticated users
      try {
        const cartItem = cart.find(item => item.id === id && item.size === size)
        if (cartItem) {
          const itemId = cartItem.cartItemId || cartItem.id
          await axios.put(`${API_BASE_URL}/cart/items/${itemId}`, {
            quantity: newQuantity
          })
        }
      } catch (error) {
        console.error('Error updating cart item:', error)
        // Revert cart state if backend sync fails
        setCart(cart)
        setToast({
          message: 'Failed to update cart. Please try again.',
          type: 'error'
        })
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    }
  }

  const removeFromCart = async (id, size) => {
    const updatedCart = cart.filter(item => !(item.id === id && item.size === size))
    setCart(updatedCart)
    
    if (isAuthenticated) {
      // Sync with backend for authenticated users
      try {
        const cartItem = cart.find(item => item.id === id && item.size === size)
        if (cartItem) {
          const itemId = cartItem.cartItemId || cartItem.id
          await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`)
        }
        
        setToast({
          message: 'Item removed from cart',
          type: 'success'
        })
      } catch (error) {
        console.error('Error removing cart item:', error)
        // Revert cart state if backend sync fails
        setCart(cart)
        setToast({
          message: 'Failed to remove item. Please try again.',
          type: 'error'
        })
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setToast({
        message: 'Item removed from cart',
        type: 'success'
      })
    }
  }

  const handleOrderComplete = (order) => {
    setOrderDetails(order)
    // Clear cart after successful order
    setCart([])
    
    // Clear cart on backend if authenticated
    if (isAuthenticated) {
      try {
        axios.delete(`${API_BASE_URL}/cart/clear`)
      } catch (error) {
        console.error('Error clearing cart on backend:', error)
      }
    }
  }

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="app">
      {/* Only show Navbar for non-admin routes */}
      {!isAdminRoute && (
        <Navbar 
          cartItemCount={cartItemCount}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}
      <main className={`main-content ${isAdminRoute ? 'admin-content' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/shoes" /> : <LandingPage />
          } />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/shoes" /> : <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/shoes" /> : <SignUpPage setToast={setToast} />
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shoes" element={<Shoes addToCart={addToCart} isAuthenticated={isAuthenticated} user={user} />} />
          <Route path="/shoes/:id" element={<DetailsShoesPage addToCart={addToCart} isAuthenticated={isAuthenticated} />} />
          <Route path="/search" element={<SearchPage addToCart={addToCart} isAuthenticated={isAuthenticated} />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            isAuthenticated ? <ProfilePage user={user} setUser={setUser} setToast={setToast} onLogout={handleLogout} /> : <Navigate to="/login" />
          } />
          <Route path="/cart" element={
            <CartPage 
              cart={cart} 
              updateQuantity={updateQuantity} 
              removeFromCart={removeFromCart}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          } />
          <Route path="/checkout" element={
            <CheckoutPage 
              cart={cart} 
              user={user} 
              onOrderComplete={handleOrderComplete}
              isAuthenticated={isAuthenticated}
              updateQuantity={updateQuantity}
            />
          } />
          <Route path="/orders" element={
            isAuthenticated ? <OrderHistoryPage user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/order-confirmation" element={
            <OrderConfirmationPage orderDetails={orderDetails} />
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminApp isAuthenticated={isAuthenticated} user={user} />} />
          
          {/* Redirect any unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </div>
  )
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
