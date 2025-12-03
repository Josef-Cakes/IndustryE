import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/AuthPage.css'

const SignUpPage = ({ setToast }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }    setIsLoading(true)
    
    // Connect to Spring Boot backend
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Show success toast
        setToast({
          message: 'Account created successfully! Please log in with your credentials.',
          type: 'success'
        })
        // Redirect to login page immediately
        navigate('/login')
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      setErrors({ general: 'Connection error. Please make sure the server is running.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <h1>Join ShoeStop Today</h1>
            <p>Create your account and start your shopping journey</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="btn-primary auth-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? 
              <Link to="/login" className="link-btn">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="image-content">
            <div style={{fontSize: '80px', marginBottom: '20px'}}>👟</div>
            <h3>Step Into Style!</h3>
            <p>Join thousands of satisfied customers and discover your perfect pair</p>
            <div className="features-list">
              <div className="feature-item">
                <span>✓</span> Premium Quality Shoes
              </div>
              <div className="feature-item">
                <span>✓</span> Fast & Free Shipping
              </div>
              <div className="feature-item">
                <span>✓</span> 30-Day Return Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage