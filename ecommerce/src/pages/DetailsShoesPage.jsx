import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mapProductWithImages } from '../utils/imageMapper'
import axios from 'axios'
import '../css/DetailsShoesPage.css'
// Add MUI and zoom dependencies
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import CircularProgress from '@mui/material/CircularProgress'

const DetailsShoesPage = ({ addToCart, isAuthenticated }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shoe, setShoe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [sizeInventory, setSizeInventory] = useState([])
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('') // 'error', 'warning', 'success'
  const [modalOpen, setModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [reviews, setReviews] = useState([])

  const autoSlideRef = useRef()

  // Available sizes for shoes
  const availableSizes = [
    '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'
  ]

  useEffect(() => {
    fetchShoeDetails()
    fetchReviews()
  }, [id])

  // Auto-slide effect for image gallery
  useEffect(() => {
    // Stop auto-slide when modal is open
    if (!shoe || !shoe.images || shoe.images.length <= 1 || modalOpen) {
      clearInterval(autoSlideRef.current)
      return
    }

    autoSlideRef.current = setInterval(() => {
      setSelectedImageIndex(prev =>
        prev + 1 < shoe.images.length ? prev + 1 : 0
      )
    }, 3500) // Change image every 3.5 seconds

    return () => clearInterval(autoSlideRef.current)
  }, [shoe, shoe?.images?.length, modalOpen])

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/reviews/product/${id}`)
      setReviews(response.data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const fetchShoeDetails = async () => {
    try {
      setLoading(true)
      // Fetch product from backend API
      const response = await axios.get(`http://localhost:8080/api/products/${id}`)
      
      if (!response.data) {
        setError('Shoe not found.')
        return
      }
      
      // Map backend data with local images
      const shoeData = mapProductWithImages(response.data)
      
      // Parse sizes from JSON string if needed
      if (typeof shoeData.availableSizes === 'string') {
        shoeData.sizes = JSON.parse(shoeData.availableSizes)
      } else {
        shoeData.sizes = shoeData.availableSizes || availableSizes
      }
      
      // Add additional features
      shoeData.features = [
        'Premium materials',
        'Comfortable fit', 
        'Durable construction',
        'Versatile style'
      ]
      
      setShoe(shoeData)
      setSizeInventory(shoeData.sizeInventory || [])
    } catch (error) {
      console.error('Error loading shoe details:', error)
      setError('Failed to load shoe details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setAlertMessage('Please select a size before adding to cart.')
      setAlertType('error')
      setTimeout(() => {
        setAlertMessage('')
        setAlertType('')
      }, 3000)
      return
    }

    // Check size availability (latest from backend)
    const sizeInfo = sizeInventory.find(inv => inv.size === selectedSize)
    if (!sizeInfo || sizeInfo.availableQuantity < quantity) {
      const availableQty = sizeInfo ? sizeInfo.availableQuantity : 0
      setAlertMessage(
        `Sorry, only ${availableQty} item(s) available in size ${selectedSize}. Please adjust quantity or select another size.`
      )
      setAlertType('error')
      return
    }

    const shoeWithDetails = {
      ...shoe,
      selectedSize,
      image: shoe.images[0] // Use main image for cart
    }

    try {
      await addToCart(shoeWithDetails, quantity)
      
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAlertMessage('Failed to add item to cart. Please try again.')
      setAlertType('error')
      setTimeout(() => {
        setAlertMessage('')
        setAlertType('')
      }, 3000)
    }
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Helper function to get size availability info
  const getSizeAvailability = (size) => {
    const sizeInfo = sizeInventory.find(inv => inv.size === size)
    return sizeInfo ? sizeInfo.availableQuantity : 0
  }

  // Helper function to check if size is available
  const isSizeAvailable = (size) => {
    return getSizeAvailability(size) > 0
  }

  // Reset zoom and rotation when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setZoom(1)
      setRotation(0)
    }
  }, [modalOpen])

  // Show MUI loading spinner for at least 1.5 seconds
  const [showLoading, setShowLoading] = useState(true)
  useEffect(() => {
    if (loading) {
      setShowLoading(true)
      const timer = setTimeout(() => setShowLoading(false), 1500)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(false)
    }
  }, [loading])

  if (loading || showLoading) {
    return (
      <div className="details-page loading">
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 24,
            }}
          >
            <CircularProgress size={64} thickness={5} sx={{ color: '#ff6b35' }} />
            <p
              style={{
                color: '#b3b3b3',
                fontSize: '1.2rem',
                margin: 0,
              }}
            >
              Loading shoe details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !shoe) {
    return (
      <div className="details-page error">
        <div className="container">
          <div className="error-message">
            <h2>Oops! Something went wrong</h2>
            <p>{error || 'Shoe not found'}</p>
            <button onClick={() => navigate('/shoes')} className="back-btn">
              Back to Shoes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="details-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/shoes')} className="breadcrumb-link">
            Shoes
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{shoe.name}</span>
        </div>

        <div className="product-details">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div
              className="main-image"
              style={{ cursor: 'zoom-in' }}
              onClick={() => setModalOpen(true)}
              title="Click to zoom"
            >
              <img 
                src={shoe.images[selectedImageIndex]} 
                alt={shoe.name}
                style={{ transition: 'transform 0.3s' }}
              />
            </div>
            <div className="thumbnail-images">
              {shoe.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${shoe.name} view`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Modal for zoomable and rotatable image */}
          <Dialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            maxWidth="md"
            PaperProps={{
              style: { 
                background: 'rgba(30,30,30,0.98)', 
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }
            }}
          >
            <div style={{ position: 'relative', padding: 0, background: 'transparent' }}>
              <IconButton
                onClick={() => setModalOpen(false)}
                style={{ position: 'absolute', top: 12, right: 12, color: '#fff', zIndex: 2 }}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 350,
                  minHeight: 350,
                  padding: 32,
                  background: 'transparent'
                }}
              >
                <img
                  src={shoe.images[selectedImageIndex]}
                  alt={shoe.name}
                  style={{
                    maxWidth: '80vw',
                    maxHeight: '70vh',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s',
                    borderRadius: 16,
                    boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                    background: '#fff'
                  }}
                />
                <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => setZoom(z => Math.max(1, z - 0.2))}
                    disabled={zoom <= 1}
                    style={{ color: '#fff', background: 'rgba(0,0,0,0.3)' }}
                    aria-label="Zoom out"
                  >
                    <ZoomOutIcon />
                  </IconButton>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>{Math.round(zoom * 100)}%</span>
                  <IconButton
                    onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                    disabled={zoom >= 3}
                    style={{ color: '#fff', background: 'rgba(0,0,0,0.3)' }}
                    aria-label="Zoom in"
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setRotation(r => r - 90)}
                    style={{ color: '#fff', background: 'rgba(0,0,0,0.3)' }}
                    aria-label="Rotate left"
                  >
                    <RotateLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setRotation(r => r + 90)}
                    style={{ color: '#fff', background: 'rgba(0,0,0,0.3)' }}
                    aria-label="Rotate right"
                  >
                    <RotateRightIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          </Dialog>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{shoe.name}</h1>
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < Math.floor(shoe.rating) ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">({typeof shoe.rating === 'number' ? shoe.rating.toFixed(1) : shoe.rating})</span>
              </div>
              <div className="product-price">
                <span className="price">₱{parseFloat(shoe.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="product-description">
              <p>{shoe.description}</p>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              <h3>Select Size</h3>
              <div
                className="size-options"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '0.5rem',
                }}
              >
                {shoe.sizes.map((size) => {
                  const available = getSizeAvailability(size)
                  const isAvailable = available > 0
                  return (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      title={!isAvailable ? 'Out of stock' : `${available} available`}
                    >
                      {size}
                      {!isAvailable && <span className="out-of-stock-indicator">×</span>}
                    </button>
                  )
                })}
              </div>
              {!selectedSize && (
                <p className="size-hint">Please select a size</p>
              )}
              {selectedSize && (
                <p className="size-availability">
                  Size {selectedSize}: {getSizeAvailability(selectedSize)} available
                </p>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={incrementQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="purchase-actions">
              {/* Alert Messages */}
              {alertMessage && (
                <div className={`alert-message ${alertType}`}>
                  {alertType === 'error' && '⚠ '}
                  {alertType === 'warning' && '⚠ '}
                  {alertType === 'success' && '✓ '}
                  {alertMessage}
                </div>
              )}
              {showSuccessMessage && (
                <div className="success-message">
                  ✓ Added to cart successfully!
                </div>
              )}
              {isAuthenticated && (
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !isSizeAvailable(selectedSize)}
                >
                  Add to Cart - ₱{(shoe.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              )}
              {!isAuthenticated && (
                <button 
                  className="login-required-btn btn-secondary"
                  onClick={() => navigate('/login')}
                >
                  Login to Add to Cart
                </button>
              )}
            </div>

            {/* Product Features */}
            <div className="product-features">
              <h3>Features</h3>
              <ul>
                {shoe.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-item">
                <span><strong>Category:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--accent-orange)' }}>{shoe.category}</span></span>
              </div>
              <div className="info-item">
                <span><strong>Product ID:</strong> {shoe.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      <span className="author-name">{review.userName || 'Anonymous'}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="review-content">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Dialog for messages */}
        <Dialog open={!!alertMessage} onClose={() => setAlertMessage('')}>
          <DialogTitle>Notice</DialogTitle>
          <DialogContent>
            <div style={{ minWidth: 220 }}>{alertMessage}</div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlertMessage('')} autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default DetailsShoesPage
