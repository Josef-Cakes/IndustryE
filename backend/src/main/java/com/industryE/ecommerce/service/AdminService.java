package com.industryE.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.industryE.ecommerce.dto.AdminStatsResponse;
import com.industryE.ecommerce.dto.OrderResponse;
import com.industryE.ecommerce.dto.ProductDTO;
import com.industryE.ecommerce.dto.ProductSizeInventoryDTO;
import com.industryE.ecommerce.dto.UserResponse;
import com.industryE.ecommerce.entity.Order;
import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.repository.OrderRepository;
import com.industryE.ecommerce.repository.ProductRepository;
import com.industryE.ecommerce.repository.UserRepository;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductSizeInventoryService sizeInventoryService;

    // Dashboard Statistics
    @Transactional(readOnly = true)
    public AdminStatsResponse getDashboardStats() {
        // Count only users with role 'USER' to exclude admin accounts from active customers
        Long totalUsers = userRepository.countByRole(User.Role.USER);
        Long totalProducts = productRepository.count();
        Long totalOrders = orderRepository.count();
        
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        
        Long lowStockProducts = getLowStockProductsCount();
        Long pendingOrders = orderRepository.countByStatus("PENDING");
        Long completedOrders = orderRepository.countByStatus("COMPLETED");
        Long cancelledOrders = orderRepository.countByStatus("CANCELLED");
        
        AdminStatsResponse stats = new AdminStatsResponse(
            totalUsers, totalProducts, totalOrders, totalRevenue,
            lowStockProducts, pendingOrders, completedOrders, cancelledOrders
        );
        
        // Add category statistics
        stats.setCategoryStats(getCategoryStats());
        
        // Add recent orders
        stats.setRecentOrders(getRecentOrderStats());
        
        return stats;
    }

    // Product Management
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productService.getAllProducts();
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        
        // Initialize inventory for all available sizes with 0 quantity
        if (createdProduct.getAvailableSizes() != null) {
            try {
                // Parse available sizes JSON
                String sizesJson = createdProduct.getAvailableSizes();
                if (sizesJson.startsWith("[") && sizesJson.endsWith("]")) {
                    // Remove brackets and quotes, split by comma
                    sizesJson = sizesJson.substring(1, sizesJson.length() - 1);
                    String[] sizesArray = sizesJson.split(",");
                    
                    for (String sizeStr : sizesArray) {
                        String size = sizeStr.trim().replaceAll("\"", "");
                        if (!size.isEmpty()) {
                            sizeInventoryService.updateInventory(createdProduct.getId(), size, 0);
                        }
                    }
                }
                
                // Refresh the product with inventory data
                return productService.getProductById(createdProduct.getId());
            } catch (Exception e) {
                // If JSON parsing fails, just return the created product
                System.err.println("Failed to initialize inventory for product " + createdProduct.getId() + ": " + e.getMessage());
            }
        }
        
        return createdProduct;
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        return productService.updateProduct(id, productDTO);
    }

    @Transactional
    public void deleteProduct(Long id) {
        // First check if product exists
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        
        // Use product service to handle cascading deletion
        productService.deleteProduct(id);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts() {
        List<Product> allProducts = productRepository.findAll();
        return allProducts.stream()
            .filter(this::isLowStock)
            .map(productService::convertToDTO)
            .collect(Collectors.toList());
    }

    private boolean isLowStock(Product product) {
        List<ProductSizeInventoryDTO> inventories = sizeInventoryService.getSizeInventoryByProductId(product.getId());
        return inventories.stream()
            .anyMatch(inv -> inv.getAvailableQuantity() <= 5); // Consider low stock if any size has <= 5 items
    }

    private Long getLowStockProductsCount() {
        List<Product> allProducts = productRepository.findAll();
        return allProducts.stream()
            .filter(this::isLowStock)
            .count();
    }

    // Order Management
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllOrderByOrderDateDesc();
        return orders.stream()
            .map(this::convertToOrderResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return convertToOrderResponse(order);
    }

    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        
        // Validate status
        if (!isValidOrderStatus(status)) {
            throw new RuntimeException("Invalid order status: " + status);
        }
        
        order.setStatus(status.toUpperCase());
        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }

    public OrderResponse updateOrderPaymentStatus(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        
        // Validate payment status
        if (!isValidPaymentStatus(paymentStatus)) {
            throw new RuntimeException("Invalid payment status: " + paymentStatus);
        }
        
        order.setPaymentStatus(paymentStatus.toUpperCase());
        Order updatedOrder = orderRepository.save(order);
        return convertToOrderResponse(updatedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(String status) {
        List<Order> orders = orderRepository.findByStatus(status.toUpperCase());
        return orders.stream()
            .map(this::convertToOrderResponse)
            .collect(Collectors.toList());
    }

    private boolean isValidOrderStatus(String status) {
        return status != null && 
               (status.equalsIgnoreCase("PENDING") || 
                status.equalsIgnoreCase("PROCESSING") ||
                status.equalsIgnoreCase("SHIPPED") ||
                status.equalsIgnoreCase("DELIVERED") ||
                status.equalsIgnoreCase("COMPLETED") ||
                status.equalsIgnoreCase("CANCELLED"));
    }

    private boolean isValidPaymentStatus(String paymentStatus) {
        return paymentStatus != null && 
               (paymentStatus.equalsIgnoreCase("PENDING") || 
                paymentStatus.equalsIgnoreCase("PAID") ||
                paymentStatus.equalsIgnoreCase("FAILED"));
    }

    // User Management
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
            .map(this::convertToUserResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToUserResponse(user);
    }

    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Validate and set role
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            user.setRole(userRole);
            User updatedUser = userRepository.save(user);
            return convertToUserResponse(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    // Inventory Management
    public void updateInventory(Long productId, String size, Integer quantity) {
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        
        // Use the service to update inventory (now embedded in Product)
        sizeInventoryService.updateInventory(productId, size, quantity);
    }

    // Helper methods
    private List<AdminStatsResponse.ProductCategoryStats> getCategoryStats() {
        List<String> categories = productRepository.findDistinctCategories();
        return categories.stream()
            .map(category -> {
                Long count = productRepository.countByCategory(category);
                // For revenue calculation, you might want to join with order items
                return new AdminStatsResponse.ProductCategoryStats(category, count, BigDecimal.ZERO);
            })
            .collect(Collectors.toList());
    }

    private List<AdminStatsResponse.RecentOrderStats> getRecentOrderStats() {
        List<Order> recentOrders = orderRepository.findTop10RecentOrders();
        return recentOrders.stream()
            .map(order -> new AdminStatsResponse.RecentOrderStats(
                order.getId(),
                order.getOrderNumber(),
                order.getUser().getName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getOrderDate().toString()
            ))
            .collect(Collectors.toList());
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        
        // Set shipping info
        OrderResponse.ShippingInfo shippingInfo = new OrderResponse.ShippingInfo();
        shippingInfo.setFirstName(order.getShippingFirstName());
        shippingInfo.setLastName(order.getShippingLastName());
        shippingInfo.setAddress(order.getShippingAddress());
        shippingInfo.setCity(order.getShippingCity());
        shippingInfo.setProvince(order.getShippingProvince());
        shippingInfo.setPostalCode(order.getShippingPostalCode());
        shippingInfo.setPhone(order.getShippingPhone());
        response.setShippingInfo(shippingInfo);
        
        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderResponse.OrderItemResponse> orderItems = order.getOrderItems().stream()
                .map(item -> {
                    OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
                    itemResponse.setProductName(item.getProductName());
                    itemResponse.setProductImage(item.getProductImage());
                    itemResponse.setSize(item.getSize());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice());
                    itemResponse.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    return itemResponse;
                })
                .collect(Collectors.toList());
            response.setOrderItems(orderItems);
        }
        
        return response;
    }

    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getPhone(),
            user.getLocation(),
            user.getBio(),
            user.getRole().name()
        );
    }
}
