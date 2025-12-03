import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ReviewModal from '../components/ReviewModal'
import '../css/OrderHistoryPage.css'

const OrderHistoryPage = ({ user, addToCart, setToast }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewProductId, setReviewProductId] = useState(null)
  const [reviewProductName, setReviewProductName] = useState('')
  const [editingReview, setEditingReview] = useState(null)
  const [productReviews, setProductReviews] = useState({}) // Cache for product reviews
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  useEffect(() => {
    fetchUserOrders()
  }, [])
  
  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your orders.')
        return
      }

      const response = await axios.get('http://localhost:8080/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.')
      } else {
        setError('Failed to load orders. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingOrderDetails(true)
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Check for existing reviews for each product in the order
      const orderData = response.data
      if (orderData.orderItems && orderData.orderItems.length > 0) {
        const reviewChecks = {}
        for (const item of orderData.orderItems) {
          const productId = item.productId || item.product?.id
          if (productId) {
            const review = await fetchUserReviewForProduct(productId)
            reviewChecks[productId] = review
          }
        }
        setProductReviews(reviewChecks)
      }
      
      setSelectedOrder(orderData)
      setShowOrderModal(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Failed to load order details. Please try again.')
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  const closeOrderModal = () => {
    setShowOrderModal(false)
    setSelectedOrder(null)
  }

  const formatOrderStatus = (status) => {
    const statusClass = `order-status status-${status.toLowerCase()}`
    return <span className={statusClass}>{status}</span>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (order) => {
    fetchOrderDetails(order.id)
  }

  const handleReorder = async (order) => {
    try {
      if (!order.orderItems || order.orderItems.length === 0) {
        setToast({
          message: 'No items found in this order.',
          type: 'error'
        })
        return
      }

      // Fetch product details for each item and add to cart
      const token = localStorage.getItem('token')
      let addedCount = 0
      let failedItems = []

      for (const orderItem of order.orderItems) {
        try {
          // Fetch product details from backend
          const productResponse = await axios.get(`http://localhost:8080/api/products/${orderItem.productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          const product = productResponse.data
          
          // Map product with local images
          const { mapProductWithImages } = await import('../utils/imageMapper')
          const productWithImages = mapProductWithImages(product)

          // Create product object with selectedSize for addToCart
          const productForCart = {
            ...productWithImages,
            id: product.id,
            name: product.name || orderItem.productName,
            price: parseFloat(orderItem.unitPrice),
            image: productWithImages.images?.[0] || orderItem.productImage || 'https://via.placeholder.com/200',
            selectedSize: orderItem.size // Set the size from the order
          }

          // Add to cart with the original quantity
          if (addToCart) {
            await addToCart(productForCart, orderItem.quantity)
            addedCount++
          }
        } catch (error) {
          console.error(`Error adding item ${orderItem.productName} to cart:`, error)
          failedItems.push(orderItem.productName)
        }
      }

      // Show success/error message and navigate to cart
      if (addedCount > 0 && failedItems.length === 0) {
        setToast({
          message: `Successfully added ${addedCount} item(s) to your cart!`,
          type: 'success'
        })
        navigate('/cart')
      } else if (addedCount > 0 && failedItems.length > 0) {
        setToast({
          message: `Added ${addedCount} item(s) to cart. Failed to add: ${failedItems.join(', ')}`,
          type: 'warning'
        })
        navigate('/cart')
      } else {
        setToast({
          message: 'Failed to add items to cart. Please try again.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error reordering:', error)
      setToast({
        message: 'Failed to reorder items. Please try again.',
        type: 'error'
      })
    }
  }

  const handleMarkAsReceived = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/mark-received`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Refresh orders to show updated status
      await fetchUserOrders()
      
      // Fetch the updated order details to get items for review
      const orderDetailsResponse = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const order = orderDetailsResponse.data
      
      console.log('Order data:', order) // Debug
      console.log('Order items:', order.orderItems) // Debug
      
      // If order has items, prompt user to review the first item
      if (order.orderItems && order.orderItems.length > 0) {
        const firstItem = order.orderItems[0]
        console.log('First item:', firstItem) // Debug
        
        // Try to get productId from the order item
        const productId = firstItem.productId || firstItem.product?.id
        console.log('Product ID:', productId) // Debug
        
        if (productId) {
          // Immediately open review modal without alert
          setReviewProductId(productId)
          setReviewProductName(firstItem.productName || firstItem.product?.name || 'Product')
          setShowReviewModal(true)
        }
      }
    } catch (error) {
      console.error('Error marking order as received:', error)
      alert(error.response?.data?.message || error.response?.data || 'Failed to mark order as received. Please try again.')
    }
  }

  const fetchUserReviewForProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/api/reviews/user/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      // 404 means no review exists, which is fine
      if (error.response?.status === 404) {
        return null
      }
      console.error('Error fetching user review:', error)
      return null
    }
  }

  const handleWriteReview = async (item) => {
    // Use productId if available, fallback to parsing from item or checking structure
    const productId = item.productId || item.product?.id
    
    if (!productId) {
      console.error('Product ID not found for review', item)
      return
    }
    
    // Check if user already has a review for this product
    const existingReview = await fetchUserReviewForProduct(productId)
    
    setReviewProductId(productId)
    setReviewProductName(item.productName || item.product?.name || 'Product')
    setEditingReview(existingReview)
    setShowReviewModal(true)
  }

  // Check if user has reviewed a product (for button display)
  const checkProductReview = async (productId) => {
    if (productReviews[productId] !== undefined) {
      return productReviews[productId]
    }
    const review = await fetchUserReviewForProduct(productId)
    setProductReviews(prev => ({ ...prev, [productId]: review }))
    return review
  }

  if (loading) {
    return (
      <div className="order-history">
        <div className="container">
          <div className="order-history-header">
            <h1>My Orders</h1>
            <p className="order-history-subtitle">Track and manage your purchases</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-history">
        <div className="container">
          <div className="order-history-header">
            <h1>My Orders</h1>
            <p className="order-history-subtitle">Track and manage your purchases</p>
          </div>
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={fetchUserOrders}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="order-history">
      <div className="container">
        <div className="order-history-header">
          <h1>My Orders</h1>
          <p className="order-history-subtitle">
            Track and manage your purchases • {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2 className="empty-title">No Orders Yet</h2>
            <p className="empty-subtitle">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
            <Link to="/shoes" className="shop-now-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-grid">
              {orders.slice(0, visibleCount).map((order, index) => (
              <div key={order.id} className="order-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="order-header">
                  <h3 className="order-number">Order #{order.orderNumber || order.id}</h3>
                  {formatOrderStatus(order.status || 'COMPLETED')}
                </div>

                <div className="order-details">
                  <div className="order-detail-item">
                    <span className="detail-label">Total Amount</span>
                    <span className="detail-value total-amount">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="order-detail-item">
                    <span className="detail-label">Order Date</span>
                    <span className="detail-value order-date">
                      {formatDate(order.orderDate || order.createdAt)}
                    </span>
                  </div>

                  <div className="order-detail-item">
                    <span className="detail-label">Items</span>
                    <span className="detail-value">
                      {order.items?.length || order.orderItems?.length || 1} item{(order.items?.length || order.orderItems?.length || 1) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {order.shippingAddress && (
                    <div className="order-detail-item">
                      <span className="detail-label">Delivery Address</span>
                      <span className="detail-value">
                        {order.shippingAddress}
                      </span>
                    </div>
                  )}
                </div>

                {(order.items || order.orderItems) && (
                  <div className="order-items">
                    <div className="items-header">Order Items</div>
                    <div className="order-items-list">
                      {(order.items || order.orderItems).slice(0, 3).map((item, itemIndex) => (
                        <div key={itemIndex} className="order-item">
                          <div className="item-info">
                            <div className="item-name">
                              {item.productName || item.product?.name || 'Product'}
                            </div>
                            <div className="item-details">
                              Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(order.items || order.orderItems).length > 3 && (
                        <div className="order-item">
                          <div className="item-info">
                            <div className="item-name">
                              +{(order.items || order.orderItems).length - 3} more item{(order.items || order.orderItems).length - 3 !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="order-actions">
                  <button 
                    className="action-btn view-details-btn"
                    onClick={() => handleViewDetails(order)}
                    disabled={loadingOrderDetails}
                  >
                    {loadingOrderDetails ? 'Loading...' : 'View Details'}
                  </button>
                  {order.status === 'DELIVERED' && (
                    <button 
                      className="action-btn mark-received-btn"
                      onClick={() => handleMarkAsReceived(order.id)}
                    >
                      ✓ Mark as Received
                    </button>
                  )}
                  {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                    <button 
                      className="action-btn reorder-btn"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
            
            {/* Load More Button */}
            {orders.length > visibleCount && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={() => setVisibleCount(prev => Math.min(prev + 3, orders.length))}
                >
                  Load More Orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeOrderModal}>×</button>
            <div className="order-modal-content">
              <div className="order-modal-header">
                <h2>Order Details</h2>
                <div className="order-modal-info">
                  <p><strong>Order Number:</strong> #{selectedOrder.orderNumber}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                  <p><strong>Status:</strong> {formatOrderStatus(selectedOrder.status)}</p>
                </div>
              </div>

              <div className="order-modal-body">
                {/* Shipping Information */}
                <div className="modal-section">
                  <h3>Shipping Information</h3>
                  {selectedOrder.shippingInfo ? (
                    <div className="shipping-details">
                      <p><strong>Name:</strong> {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                      <p><strong>Address:</strong> {selectedOrder.shippingInfo.address}</p>
                      <p><strong>City:</strong> {selectedOrder.shippingInfo.city}</p>
                      <p><strong>Province:</strong> {selectedOrder.shippingInfo.province}</p>
                      <p><strong>Postal Code:</strong> {selectedOrder.shippingInfo.postalCode}</p>
                      <p><strong>Phone:</strong> {selectedOrder.shippingInfo.phone}</p>
                    </div>
                  ) : (
                    <p>No shipping information available</p>
                  )}
                </div>

                {/* Order Items */}
                <div className="modal-section">
                  <h3>Order Items</h3>
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    <div className="modal-order-items">
                      {selectedOrder.orderItems.map((item, index) => (
                        <div key={index} className="modal-order-item">
                          <div className="item-details">
                            <h4>{item.productName}</h4>
                            <p>Quantity: {item.quantity}</p>
                            {item.size && <p>Size: {item.size}</p>}
                          </div>
                          <div className="item-pricing">
                            <p>Unit Price: {formatCurrency(item.unitPrice)}</p>
                            <p><strong>Total: {formatCurrency(item.totalPrice)}</strong></p>
                          </div>
                          
                          {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED') && (
                            <div style={{ marginLeft: '1rem' }}>
                              <button 
                                className="review-action-btn"
                                onClick={() => handleWriteReview(item)}
                              >
                                {productReviews[item.productId || item.product?.id] ? (
                                  <>✎ Edit Review</>
                                ) : (
                                  <>★ Write Review</>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No order items available</p>
                  )}
                </div>

                {/* Payment Information */}
                <div className="modal-section">
                  <h3>Payment Information</h3>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Cash on Delivery'}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'Pending'}</p>
                  <div className="order-total">
                    <h3><strong>Total Amount: {formatCurrency(selectedOrder.totalAmount)}</strong></h3>
                  </div>
                </div>
              </div>

              <div className="order-modal-footer">
                <button className="btn-secondary" onClick={closeOrderModal}>
                  Close
                </button>
                {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED') && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleReorder(selectedOrder)}
                  >
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          open={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setEditingReview(null)
          }}
          productId={reviewProductId}
          productName={reviewProductName}
          editMode={!!editingReview}
          existingReview={editingReview}
          onReviewSubmitted={async () => {
            setShowReviewModal(false)
            setEditingReview(null)
            
            // Refresh the review for the product that was just reviewed
            if (reviewProductId) {
              const updatedReview = await fetchUserReviewForProduct(reviewProductId)
              setProductReviews(prev => ({
                ...prev,
                [reviewProductId]: updatedReview
              }))
            }
            
            setShowSuccessModal(true)
          }}
        />
      )}

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <span style={{ fontSize: '1.5rem' }}>✓</span> Success!
        </DialogTitle>
        <DialogContent 
          sx={{ 
            padding: '24px !important',
            display: 'flex !important', 
            justifyContent: 'center !important', 
            alignItems: 'center !important',
            minHeight: '80px',
            height: 'auto'
          }}
        >
          <Typography sx={{ 
            color: '#b3b3b3', 
            fontSize: '1rem', 
            lineHeight: 1.6, 
            textAlign: 'center', 
            margin: 0,
            width: '100%'
          }}>
            Review submitted successfully! Thank you for your feedback.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => setShowSuccessModal(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f94c10 100%)',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '8px 24px',
              '&:hover': {
                background: 'linear-gradient(135deg, #f94c10 0%, #e63900 100%)',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default OrderHistoryPage