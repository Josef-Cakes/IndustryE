import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Rating from '@mui/material/Rating'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import axios from 'axios'

const ReviewModal = ({ 
  open, 
  onClose, 
  productId, 
  productName, 
  onReviewSubmitted,
  editMode = false,
  existingReview = null
}) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form when editing
  useEffect(() => {
    if (editMode && existingReview) {
      setRating(existingReview.rating || 5)
      setComment(existingReview.comment || '')
    } else {
      setRating(5)
      setComment('')
    }
  }, [editMode, existingReview, open])

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      console.log('Edit mode:', editMode)
      console.log('Existing review:', existingReview)
      console.log('Review ID:', existingReview?.id)
      console.log('Token exists:', !!token)
      
      if (!token) {
        setError('Please log in to submit a review')
        return
      }
      
      if (editMode && existingReview?.id) {
        // Update existing review
        await axios.put(`http://localhost:8080/api/reviews/${existingReview.id}`, {
          rating,
          comment
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } else {
        // Create new review
        await axios.post('http://localhost:8080/api/reviews', {
          productId,
          rating,
          comment
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      // Reset form
      setRating(5)
      setComment('')
      onClose()
      
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      console.error('Response:', err.response?.data)
      const serverMessage = err.response?.data?.message || err.response?.data || ''
      if (serverMessage && typeof serverMessage === 'string') {
        setError(serverMessage)
      } else {
        setError(editMode ? 'Failed to update review. Please try again.' : 'Failed to submit review. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '1.3rem',
        fontWeight: 600,
        color: '#ffffff',
        background: 'linear-gradient(135deg, #ff6b35 0%, #f94c10 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {editMode ? 'Edit Your Review' : `Write a Review for ${productName}`}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="legend" sx={{ color: '#b3b3b3', mb: 1.5, fontSize: '0.95rem' }}>
              Rating
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, fontSize: '2rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  style={{
                    opacity: star <= rating ? 1 : 0.3,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  ⭐
                </span>
              ))}
            </Box>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Your Review"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={!!error}
            helperText={error}
            placeholder="What did you like or dislike? How was the fit?"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6b35',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': {
                  color: '#ff6b35',
                },
              },
              '& .MuiFormHelperText-root': {
                color: '#ef4444',
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px',
        gap: 1
      }}>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          sx={{
            color: '#b3b3b3',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          sx={{
            background: 'linear-gradient(135deg, #ff6b35 0%, #f94c10 100%)',
            color: '#ffffff',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            padding: '8px 24px',
            '&:hover': {
              background: 'linear-gradient(135deg, #f94c10 0%, #e63900 100%)',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(255, 107, 53, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {isSubmitting ? (editMode ? 'Updating...' : 'Submitting...') : (editMode ? 'Update Review' : 'Submit Review')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReviewModal

