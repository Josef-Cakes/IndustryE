import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import '../css/CartPage.css'
import CartItem from '../components/CartItem'

const CartPage = ({ cart, updateQuantity, removeFromCart, isAuthenticated, user }) => {
  const navigate = useNavigate()
  const [loadingItems, setLoadingItems] = useState(new Set())
  const [selectedItems, setSelectedItems] = useState(new Set()) // store keys: `${id}-${size||'no-size'}`

  const calculateTotal = () => {
    // Optionally calculate total for all or selected — here it's all
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleContinueShopping = () => navigate('/shoes')
  const handleMyOrders = () => navigate('/orders')

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item to checkout.")
      return
    }

    // Build selected cart items array
    const selectedCartItems = cart.filter(item => 
      selectedItems.has(`${item.id}-${item.size || 'no-size'}`)
    )

    if (selectedCartItems.length === 0) {
      alert("No selected items found. Please try again.")
      return
    }

    // Navigate to checkout with selected items in state
    navigate('/checkout', { state: { selectedCartItems } })
  }

  const handleLogin = () => navigate('/login')

  const handleUpdateQuantity = async (id, newQuantity, size) => {
    const itemKey = `${id}-${size || 'no-size'}`
    setLoadingItems(prev => new Set([...prev, itemKey]))
    
    try {
      await updateQuantity(id, newQuantity, size)
      // keep selection as-is
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    }
  }

  const handleRemoveFromCart = async (id, size) => {
    const itemKey = `${id}-${size || 'no-size'}`
    setLoadingItems(prev => new Set([...prev, itemKey]))
    
    try {
      await removeFromCart(id, size)
      // remove from selection if it was selected
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    }
  }

  // Toggle selection for a given item
  const toggleSelectItem = (item, checked) => {
    const key = `${item.id}-${item.size || 'no-size'}`
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (checked) newSet.add(key)
      else newSet.delete(key)
      return newSet
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Please Log In to View Your Cart</h2>
            <p>You need to be logged in to access your shopping cart and make purchases.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={handleLogin}>
                Log In
              </button>
              <button className="btn-secondary" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything yet. Start shopping or check your previous orders!</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="btn-primary" onClick={handleMyOrders}>
                My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Optional: number of selected items and selected total
  const selectedCount = selectedItems.size
  const selectedTotal = cart
    .filter(item => selectedItems.has(`${item.id}-${item.size || 'no-size'}`))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
        </div>
        
        <div className="cart-items">
          {cart.map((item) => {
            const itemKey = `${item.id}-${item.size || 'no-size'}`
            const isLoading = loadingItems.has(itemKey)
            const isSelected = selectedItems.has(itemKey)
            
            return (
              <CartItem
                key={itemKey}
                item={item}
                isLoading={isLoading}
                isSelected={isSelected}
                onSelect={toggleSelectItem}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
              />
            )
          })}
        </div>

        <div className="cart-actions">
          <button className="continue-shopping-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Selected Items</span>
            <span>{selectedCount} item{selectedCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="summary-row">
            <span>Selected Total</span>
            <span>₱ {selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal (all)</span>
            <span>₱ {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summary-total">
            <span>Total (selected)</span>
            <span>₱ {selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          {isAuthenticated ? (
            <button
              className="checkout-btn btn-primary"
              onClick={handleCheckout}
              disabled={selectedItems.size === 0}
              title={selectedItems.size === 0 ? 'Select at least 1 item to checkout' : 'Proceed to checkout'}
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="auth-required">
              <p className="auth-message">Please log in to complete your purchase</p>
              <button className="login-btn btn-primary" onClick={handleLogin}>
                Log In to Checkout
              </button>
              <p className="guest-info">Don't have an account? <a href="/signup">Sign up here</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPage
