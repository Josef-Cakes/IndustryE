import React, { useState } from "react"
import '../css/CartPage.css'

const CartItem = ({ item, isLoading, isSelected = false, onSelect, onUpdateQuantity, onRemove }) => {
  const [confirmRemove, setConfirmRemove] = useState(null)
  const itemKey = `${item.id}-${item.size || 'no-size'}`

  return (
    <div key={itemKey} className={`cart-item ${isLoading ? 'loading' : ''}`}>
      {/* SELECT CHECKBOX */}
      <div className="item-select">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect && onSelect(item, e.target.checked)}
          disabled={isLoading}
        />
      </div>

      <div className="item-image">
        <img src={item.image} alt={item.name} />
      </div>

      <div className="item-details">
        <h3>{item.name}</h3>
        <p className="item-color">{item.color}</p>
        {item.size && <p className="item-size">Size: {item.size}</p>}
        <p className="item-price">₱ {parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className="item-quantity">
        <button 
          onClick={() => {
            if (item.quantity > 1 && onUpdateQuantity) {
              onUpdateQuantity(item.id, item.quantity - 1, item.size)
            } else if (item.quantity === 1 && onRemove) {
              setConfirmRemove({
                itemName: item.name,
                itemSize: item.size,
                onConfirm: () => {
                  onRemove(item.id, item.size)
                  setConfirmRemove(null)
                }
              })
            }
          }}
          className="quantity-btn"
          disabled={isLoading}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1, item.size)}
          className="quantity-btn"
          disabled={isLoading}
        >
          +
        </button>
      </div>

      <div className="item-total">
        ₱ {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <button 
        className="remove-btn" 
        onClick={() => onRemove(item.id, item.size)}
        title="Remove item from cart"
        disabled={isLoading}
      >
        {isLoading ? '⟳' : '×'}
      </button>

      {/* Toast-style Confirmation Dialog */}
      {confirmRemove && (
        <div className="confirm-toast-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="confirm-toast" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-toast-content">
              <span className="confirm-toast-icon">⚠️</span>
              <div className="confirm-toast-message-container">
                <span className="confirm-toast-message">Remove item from cart?</span>
                <span className="confirm-toast-item">
                  "{confirmRemove.itemName}" {confirmRemove.itemSize && `(Size: ${confirmRemove.itemSize})`}
                </span>
              </div>
            </div>
            <div className="confirm-toast-actions">
              <button 
                className="confirm-toast-btn cancel-btn"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-toast-btn confirm-btn"
                onClick={confirmRemove.onConfirm}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartItem
