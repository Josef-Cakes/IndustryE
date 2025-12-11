package com.industryE.ecommerce.dto;

import com.industryE.ecommerce.Enum.Status;

import java.math.BigDecimal;
import java.util.List;

public class AdminStatsResponse {
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long lowStockProducts;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private List<ProductCategoryStats> categoryStats;
    private List<RecentOrderStats> recentOrders;
    
    // Constructors
    public AdminStatsResponse() {}
    
    public AdminStatsResponse(Long totalUsers, Long totalProducts, Long totalOrders, 
                             BigDecimal totalRevenue, Long lowStockProducts, Long pendingOrders, 
                             Long completedOrders, Long cancelledOrders) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.lowStockProducts = lowStockProducts;
        this.pendingOrders = pendingOrders;
        this.completedOrders = completedOrders;
        this.cancelledOrders = cancelledOrders;
    }
    
    // Getters and setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    
    public Long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Long totalProducts) { this.totalProducts = totalProducts; }
    
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(Long lowStockProducts) { this.lowStockProducts = lowStockProducts; }
    
    public Long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }
    
    public Long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Long completedOrders) { this.completedOrders = completedOrders; }
    
    public Long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(Long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
    
    public List<ProductCategoryStats> getCategoryStats() { return categoryStats; }
    public void setCategoryStats(List<ProductCategoryStats> categoryStats) { this.categoryStats = categoryStats; }
    
    public List<RecentOrderStats> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrderStats> recentOrders) { this.recentOrders = recentOrders; }
    
    // Inner classes for nested statistics
    public static class ProductCategoryStats {
        private String category;
        private Long count;
        private BigDecimal totalRevenue;
        
        public ProductCategoryStats() {}
        
        public ProductCategoryStats(String category, Long count, BigDecimal totalRevenue) {
            this.category = category;
            this.count = count;
            this.totalRevenue = totalRevenue;
        }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
        
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }
    
    public static class RecentOrderStats {
        private Long orderId;
        private String orderNumber;
        private String customerName;
        private BigDecimal amount;
        private Status status;
        private String orderDate;
        
        public RecentOrderStats() {}
        
        public RecentOrderStats(Long orderId, String orderNumber, String customerName, 
                               BigDecimal amount, Status status, String orderDate) {
            this.orderId = orderId;
            this.orderNumber = orderNumber;
            this.customerName = customerName;
            this.amount = amount;
            this.status = status;
            this.orderDate = orderDate;
        }
        
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        
        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
        
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public Status getStatus() { return status; }
        public void setStatus(Status status) { this.status = status; }
        
        public String getOrderDate() { return orderDate; }
        public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
    }
}
