package com.industryE.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.industryE.ecommerce.dto.CreateOrderRequest;
import com.industryE.ecommerce.dto.OrderResponse;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.security.JwtTokenProvider;
import com.industryE.ecommerce.service.OrderService;
import com.industryE.ecommerce.service.UserService;

import jakarta.persistence.criteria.Order;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, 
                                       HttpServletRequest httpRequest) {
        try {
            // Extract and validate user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            String email = jwtTokenProvider.getUsernameFromToken(token);
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User not found"));
            }
            
            // Create order for the authenticated user only
            OrderResponse order = orderService.createOrder(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create order: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getUserOrders(HttpServletRequest httpRequest) {
        try {
            // Extract and validate user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            String email = jwtTokenProvider.getUsernameFromToken(token);
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User not found"));
            }
            
            // Get orders for the authenticated user only
            List<OrderResponse> orders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch orders: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long orderId, HttpServletRequest httpRequest) {
        try {
            // Extract and validate user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            String email = jwtTokenProvider.getUsernameFromToken(token);
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User not found"));
            }
            
            // Get order details only if it belongs to the authenticated user
            OrderResponse order = orderService.getOrderById(orderId, user.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Order not found or access denied"));
        }
    }
    
    @PutMapping("/{orderId}/mark-received")
    public ResponseEntity<?> markOrderAsReceived(@PathVariable Long orderId, HttpServletRequest httpRequest) {
        try {
            // Extract and validate user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            String email = jwtTokenProvider.getUsernameFromToken(token);
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User not found"));
            }
            
            // Mark order as completed/received for the authenticated user
            OrderResponse order = orderService.markOrderAsReceived(orderId, user.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/orders/{orderId}/mark-received")
    public ResponseEntity<?> markAsReceived(@PathVariable Long orderId) {
        try {
            Order order = (Order) orderService.markAsReceived(orderId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }
    
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}