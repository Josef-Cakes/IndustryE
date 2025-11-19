import React from "react"

const CartItem = ({ item, isLoading, onUpdateQuantity, onRemove }) => {
  const itemKey = `${item.id}-${item.size || 'no-size'}`
  return (
    <div key={itemKey} className={`cart-item ${isLoading ? 'loading' : ''}`}>
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
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.size)}
          className="quantity-btn"
          disabled={item.quantity <= 1 || isLoading}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.size)}
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
    </div>
  )
}

export default CartItem
