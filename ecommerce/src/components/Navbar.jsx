import React, { useState } from 'react'
import logo from '../assets/images/logo2.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import '../css/Navbar.css'

const Navbar = ({ cartItemCount, isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleBrandClick = () => {
    if (isAuthenticated) {
      navigate('/shoes')
    } else {
      navigate('/')
    }
  }

  const handleCartClick = () => {
    navigate('/cart')
  }

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  const handleSearchClick = () => {
    navigate('/search')
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    onLogout()
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <nav className="vertical-navbar">
      <div className="nav-container">
        {/* Brand Section */}

        <div className="nav-brand" onClick={handleBrandClick}>
          <img src={logo} alt="ShoeStop Logo" className="brand-icon" style={{ width: '100px', height: '100px', objectFit: 'contain', marginLeft: '45px' }} />
          <div className="brand-text">ShoeStop</div>
        </div>

          {/* User Info - Only show when authenticated */}
          {isAuthenticated && user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}
        {/* Navigation Links */}
        <div className="nav-links">
          {/* General Navigation */}
          <div className="nav-section-title">Menu</div>
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
              >
                <span className="nav-label">Home</span>
              </Link>
            </>
          )}

          <Link
            to="/shoes"
            className={`nav-link ${currentPath === '/shoes' ? 'active' : ''}`}
          >
            <span className="nav-label">Shoes</span>
          </Link>

          <Link
            to="/about"
            className={`nav-link ${currentPath === '/about' ? 'active' : ''}`}
          >
            <span className="nav-label">About Us</span>
          </Link>

          {/* Auth Links - Show based on auth status */}
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}
              >
                <span className="nav-label">Login</span>
              </Link>
              <Link
                to="/signup"
                className={`nav-link ${currentPath === '/signup' ? 'active' : ''}`}
              >
                <span className="nav-label">Sign Up</span>
              </Link>
            </>
          ) : (
            <>
              <button
                className={`nav-link ${currentPath === '/profile' ? 'active' : ''}`}
                onClick={handleProfileClick}
              >
                <span className="nav-label">Profile</span>
              </button>
              <Link
                to="/orders"
                className={`nav-link ${currentPath === '/orders' ? 'active' : ''}`}
              >
                <span className="nav-label">My Orders</span>
              </Link>
              
              <button
                className="nav-link"
                onClick={handleLogoutClick}
              >
                <span className="nav-label">Logout</span>
              </button>
            </>
          )}
        </div>

        {/* Action Buttons - Only show when authenticated */}
        {isAuthenticated && (
          <div className="nav-actions">
            <div className="action-buttons">
              <button className="search-btn" title="Search" onClick={handleSearchClick}>
                <span>🔍</span>
              </button>
              <button onClick={handleCartClick} className="cart-btn" title="Cart">
                <span>🛒</span>
                <span className="cart-count">{cartItemCount}</span>
              </button>
            </div>
            <button className="contact-btn btn-primary" onClick={() => alert("Contact functionality coming soon!")}>
              Contact Us
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={showLogoutModal}
        onClose={handleLogoutCancel}
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
          color: '#ffffff',
          padding: '16px 24px'
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ 
          padding: '24px !important',
          display: 'flex !important',
          justifyContent: 'center !important',
          alignItems: 'center !important',
          minHeight: '80px',
          height: 'auto'
        }}>
          <Typography sx={{ 
            color: '#b3b3b3', 
            fontSize: '1rem', 
            lineHeight: 1.6, 
            textAlign: 'center',
            margin: 0,
            width: '100%'
          }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={handleLogoutCancel}
            sx={{ 
              color: '#b3b3b3',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
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
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  )
}

export default Navbar