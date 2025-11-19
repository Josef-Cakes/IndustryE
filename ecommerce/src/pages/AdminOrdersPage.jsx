import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Tabs,
  Tab,
  Box,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Search, ShoppingCart, Payment, LocalShipping, CheckCircle } from "@mui/icons-material"
import "../css/OrdersManagement.css"
import OrderTable from "../components/OrderTable"
import OrderDetailsDialog from "../components/OrderDetailsDialog"
import axiosInstance from "../utils/axiosConfig"

const paymentStatusOptions = ["PENDING", "PAID", "FAILED"]
const deliveryStatusOptions = ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"]

export default function AdminOrdersPage({ onNavigate }) {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    title: '',
    message: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('No admin token found')
        navigate('/admin/login')
        return
      }

      const response = await axiosInstance.get('/admin/orders')

      // Transform backend data to match frontend format
      const transformedOrders = response.data.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber || `ORD-${order.id}`,
        customerName: order.shippingInfo ? 
          `${order.shippingInfo.firstName || ''} ${order.shippingInfo.lastName || ''}`.trim() : 
          'N/A',
        email: order.user?.email || 'N/A',
        phone: order.shippingInfo?.phone || 'N/A',
        orderItems: order.orderItems || [],
        total: parseFloat(order.totalAmount || 0),
        paymentStatus: order.paymentStatus?.toLowerCase() || 'pending',
        deliveryStatus: order.status?.toLowerCase() || 'processing',
        orderDate: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A',
        shippingAddress: order.shippingInfo ? 
          `${order.shippingInfo.address || ''}, ${order.shippingInfo.city || ''}, ${order.shippingInfo.province || ''}`.replace(/^,\s*|,\s*$/g, '') : 
          'N/A',
        paymentMethod: order.paymentMethod || 'N/A'
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, field, value) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (field === 'deliveryStatus') {
        // Update order status in backend
        await axiosInstance.put(`/admin/orders/${orderId}/status`, null, {
          params: { status: value.toUpperCase() }
        })
        
        // Show success message
        const orderNumber = orders.find(o => o.id === orderId)?.orderNumber || `#${orderId}`
        showSuccessDialog('Order Status Updated', `Order ${orderNumber} status has been updated to ${value.toUpperCase()}`)
      } else if (field === 'paymentStatus') {
        // Update payment status in backend
        await axiosInstance.put(`/admin/orders/${orderId}/payment-status`, null, {
          params: { paymentStatus: value.toUpperCase() }
        })
        
        // Show success message
        const orderNumber = orders.find(o => o.id === orderId)?.orderNumber || `#${orderId}`
        showSuccessDialog('Payment Status Updated', `Order ${orderNumber} payment status has been updated to ${value.toUpperCase()}`)
      }

      // Update local state immediately for UI responsiveness
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, [field]: value } : order
        )
      )
      
      // Refresh orders from backend to ensure data consistency
      setTimeout(() => {
        fetchOrders()
      }, 1000)
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status')
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin/login')
      }
    }
  }

  const getFilteredOrders = () => {
    let filtered = orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber?.toString().includes(searchTerm) ||
        order.id.toString().includes(searchTerm)
    )

    switch (tabValue) {
      case 1: // Pending Payment
        filtered = filtered.filter((order) => order.paymentStatus === "pending")
        break
      case 2: // Processing
        filtered = filtered.filter((order) => order.deliveryStatus === "processing")
        break
      case 3: // Shipped
        filtered = filtered.filter((order) => order.deliveryStatus === "shipped")
        break
      default: // All Orders
        break
    }

    return filtered
  }

  const filteredOrders = getFilteredOrders()

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const showSuccessDialog = (title, message) => {
    setSuccessDialog({
      open: true,
      title,
      message
    })
  }

  const closeSuccessDialog = () => {
    setSuccessDialog({
      open: false,
      title: '',
      message: ''
    })
  }

  // Calculate statistics from backend data
  const pendingOrders = orders.filter((order) => order.paymentStatus === "pending").length
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid")
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const shippedOrders = orders.filter((order) => order.deliveryStatus === "shipped").length

  if (loading) {
    return (
      <div className="orders-container">
        <Container maxWidth="xl" className="orders-content">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <Container maxWidth="xl" className="orders-content">
        {/* Header with Back Button */}
        <Box className="orders-header" mb={3}>
          <Button 
            onClick={() => onNavigate("dashboard")}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Back to Dashboard
          </Button>
          <Typography variant="h4" className="orders-title">
            Orders Management
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} className="orders-stats">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-header">
                  <ShoppingCart className="stat-icon" />
                  <Typography variant="h4">{orders.length}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-header">
                  <Payment className="stat-icon warning" />
                  <Typography variant="h4">{pendingOrders}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Pending Payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-header">
                  <LocalShipping className="stat-icon" />
                  <Typography variant="h4">{shippedOrders}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Shipped Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-header">
                  <CheckCircle className="stat-icon success" />
                  <Typography variant="h4">₱{totalRevenue.toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box className="orders-controls">
          <TextField
            placeholder="Search orders, customers, or order numbers..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            className="search-field"
          />
        </Box>

        {/* Tabs */}
        <Box className="orders-tabs">
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Orders" />
            <Tab label="Pending Payment" />
            <Tab label="Processing" />
            <Tab label="Shipped" />
          </Tabs>
        </Box>

        {/* Orders Table */}
        <OrderTable 
          orders={filteredOrders} 
          onStatusChange={handleStatusChange} 
          onViewDetails={handleViewDetails} 
          paymentStatusOptions={paymentStatusOptions}
          deliveryStatusOptions={deliveryStatusOptions}
        />

        {/* Order Details Dialog */}
        <OrderDetailsDialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
          order={selectedOrder} 
        />

        {/* Success Dialog */}
        <Dialog open={successDialog.open} onClose={closeSuccessDialog}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            {successDialog.title}
          </DialogTitle>
          <DialogContent>
            <Typography>{successDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeSuccessDialog} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  )
}

export { paymentStatusOptions, deliveryStatusOptions }
