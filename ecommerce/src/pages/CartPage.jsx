import React, { useState } from "react"
import { useNavigate } from 'react-router-dom'
import '../css/CartPage.css'
import CartItem from '../components/CartItem'

const CartPage = ({ cart, updateQuantity, removeFromCart, isAuthenticated, user }) => {
  const navigate = useNavigate()
  const [loadingItems, setLoadingItems] = useState(new Set())
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleContinueShopping = () => {
    navigate('/shoes')
  }

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout')
    } else {
      navigate('/login')
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleUpdateQuantity = async (id, newQuantity, size) => {
    const itemKey = `${id}-${size || 'no-size'}`
    setLoadingItems(prev => new Set([...prev, itemKey]))
    
    try {
      console.log('Updating quantity:', { id, newQuantity, size })
      await updateQuantity(id, newQuantity, size)
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
      console.log('Removing from cart:', { id, size })
      await removeFromCart(id, size)
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
            <p>Start shopping to add items to your cart!</p>
            <button className="btn-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <p className="cart-count">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        
        <div className="cart-items">
          {cart.map((item) => {
            const itemKey = `${item.id}-${item.size || 'no-size'}`
            const isLoading = loadingItems.has(itemKey)
            
            return (
              <CartItem
                key={itemKey}
                item={item}
                isLoading={isLoading}
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
            <span>Subtotal</span>
            <span>₱ {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₱ {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          {isAuthenticated ? (
            <button className="checkout-btn btn-primary" onClick={handleCheckout}>
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