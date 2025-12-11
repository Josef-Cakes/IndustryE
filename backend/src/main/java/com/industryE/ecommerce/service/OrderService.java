package com.industryE.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.industryE.ecommerce.Enum.Status;
import com.industryE.ecommerce.Enum.PaymentStatus;
import com.industryE.ecommerce.dto.CreateOrderRequest;
import com.industryE.ecommerce.dto.OrderResponse;
import com.industryE.ecommerce.entity.Order;
import com.industryE.ecommerce.entity.OrderItem;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductSizeInventoryService productSizeInventoryService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, User user) {
        try {
            // Validate input
            if (request == null) {
                throw new IllegalArgumentException("Order request cannot be null");
            }
            if (user == null) {
                throw new IllegalArgumentException("User cannot be null");
            }
            if (request.getTotalAmount() == null || request.getTotalAmount() <= 0) {
                throw new IllegalArgumentException("Total amount must be greater than 0");
            }

            // Create the order entity
            Order order = new Order();
            order.setUser(user);
            order.setOrderNumber(generateOrderNumber());
            order.setTotalAmount(BigDecimal.valueOf(request.getTotalAmount()));
            order.setStatus(Status.PENDING);

            // Set shipping information
            if (request.getShippingInfo() != null) {
                order.setShippingFirstName(request.getShippingInfo().getFirstName());
                order.setShippingLastName(request.getShippingInfo().getLastName());
                order.setShippingAddress(request.getShippingInfo().getAddress());
                order.setShippingCity(request.getShippingInfo().getCity());
                order.setShippingProvince(request.getShippingInfo().getProvince());
                order.setShippingPostalCode(request.getShippingInfo().getPostalCode());
                order.setShippingPhone(request.getShippingInfo().getPhone());
            }

            order.setPaymentMethod(request.getPaymentMethod());

            // Create order items and establish bidirectional relationship
            List<OrderItem> orderItems = new ArrayList<>();
            if (request.getItems() != null && !request.getItems().isEmpty()) {
                for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                    // Check size inventory before creating order item
                    boolean available = productSizeInventoryService.checkAvailability(
                        itemRequest.getProductId(), itemRequest.getSize(), itemRequest.getQuantity()
                    );
                    if (!available) {
                        throw new RuntimeException("Size " + itemRequest.getSize() + " is out of stock or insufficient quantity.");
                    }
                    // Reserve inventory (optional: for more robust concurrency)
                    productSizeInventoryService.reserveInventory(
                        itemRequest.getProductId(), itemRequest.getSize(), itemRequest.getQuantity()
                    );

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order); // Set reference to order
                    orderItem.setProductId(itemRequest.getProductId());
                    orderItem.setProductName(itemRequest.getName());
                    orderItem.setProductImage(itemRequest.getImage() != null ? itemRequest.getImage() : "");
                    orderItem.setSize(itemRequest.getSize());
                    orderItem.setUnitPrice(BigDecimal.valueOf(itemRequest.getPrice()));
                    orderItem.setQuantity(itemRequest.getQuantity());
                    orderItem.setTotalPrice(BigDecimal.valueOf(itemRequest.getPrice() * itemRequest.getQuantity()));

                    orderItems.add(orderItem);
                }

                // Set order items on the order to complete bidirectional relationship
                order.setOrderItems(orderItems);
            }

            // Save order with items (cascade will handle order items)
            Order savedOrder = orderRepository.save(order);

            return convertToResponse(savedOrder);
        } catch (Exception e) {
            // Log the exception details for debugging
            System.err.println("Order creation failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        // Critical fix: Only return orders that belong to the specific user
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        // Critical fix: Ensure order belongs to the requesting user
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));
        return convertToResponse(order);
    }
    
    @Transactional
    public OrderResponse markOrderAsReceived(Long orderId, Long userId) {
        // Ensure order belongs to the requesting user
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        if (order.getStatus() != Status.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be marked as received");
        }

        if (order.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot mark order as received — Payment is not completed");
        }
        
        // Don't allow marking as received if already completed or cancelled
        if (order.getStatus().equals(Status.COMPLETED)) {
            throw new RuntimeException("Order is already marked as completed");
        }
        if (order.getStatus().equals(Status.CANCELLED)) {
            throw new RuntimeException("Cannot mark cancelled orders as received");
        }
        
        // Mark as COMPLETED
        order.setStatus(Status.COMPLETED);
        Order updatedOrder = orderRepository.save(order);
        
        return convertToResponse(updatedOrder);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }

    private OrderResponse convertToResponse(Order order) {
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

        // Set order items
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<OrderResponse.OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                    .map(this::convertOrderItemToResponse)
                    .collect(Collectors.toList());
            response.setOrderItems(orderItemResponses);
        }

        return response;
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Status newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // BLOCK IF PAYMENT NOT PAID
        if (newStatus == Status.DELIVERED &&
            order.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot mark as Delivered — Payment is not completed");
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        return convertToResponse(order);
    }
    
    private OrderResponse.OrderItemResponse convertOrderItemToResponse(OrderItem orderItem) {
        OrderResponse.OrderItemResponse response = new OrderResponse.OrderItemResponse();
        response.setProductId(orderItem.getProductId());
        response.setProductName(orderItem.getProductName());
        response.setProductImage(orderItem.getProductImage());
        response.setSize(orderItem.getSize());
        response.setUnitPrice(orderItem.getUnitPrice());
        response.setQuantity(orderItem.getQuantity());
        response.setTotalPrice(orderItem.getTotalPrice());
        return response;
    }
}