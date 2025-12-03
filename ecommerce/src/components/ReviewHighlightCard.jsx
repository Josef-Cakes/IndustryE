import React from 'react'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import './ReviewHighlightCard.css'

const ReviewHighlightCard = ({ reviews, rating }) => {
  // Get the top review (first one, or highest rated)
  const topReview = reviews && reviews.length > 0 
    ? reviews.reduce((best, current) => current.rating > best.rating ? current : best, reviews[0])
    : null

  const handleScrollToReviews = () => {
    const reviewsSection = document.querySelector('.reviews-section')
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Don't render if no reviews
  if (!reviews || reviews.length === 0) {
    return null
  }

  // Truncate review text to create an excerpt
  const getExcerpt = (text, maxLength = 80) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  // Calculate average rating or use provided rating
  const displayRating = rating || (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)

  return (
    <div 
      className="review-highlight-card"
      onClick={handleScrollToReviews}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleScrollToReviews()}
    >
      {/* Quote icon in corner */}
      <div className="quote-icon">
        <FormatQuoteIcon />
      </div>

      {/* Star rating */}
      <div className="highlight-rating">
        <div className="highlight-stars">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`highlight-star ${i < Math.round(displayRating) ? 'filled' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="highlight-rating-text">
          {displayRating.toFixed(1)} out of 5
        </span>
      </div>

      {/* Review excerpt */}
      {topReview && (
        <p className="highlight-excerpt">
          "{getExcerpt(topReview.comment)}"
        </p>
      )}

      {/* Link to all reviews */}
      <span className="highlight-link">
        Read all {reviews.length} review{reviews.length !== 1 ? 's' : ''} →
      </span>
    </div>
  )
}

export default ReviewHighlightCard

