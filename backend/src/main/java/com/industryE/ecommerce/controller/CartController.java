package com.industryE.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.industryE.ecommerce.dto.AddToCartRequest;
import com.industryE.ecommerce.dto.CartResponse;
import com.industryE.ecommerce.dto.UpdateCartItemRequest;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.security.JwtTokenProvider;
import com.industryE.ecommerce.service.CartService;
import com.industryE.ecommerce.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest httpRequest) {
        try {
            User user = getUserFromToken(httpRequest);
            CartResponse cart = cartService.getCartByUser(user);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to get cart: " + e.getMessage()));
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request, 
                                     HttpServletRequest httpRequest) {
        try {
            User user = getUserFromToken(httpRequest);
            CartResponse cart = cartService.addToCart(user, request);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to add to cart: " + e.getMessage()));
        }
    }
    
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long itemId,
                                          @Valid @RequestBody UpdateCartItemRequest request,
                                          HttpServletRequest httpRequest) {
        try {
            User user = getUserFromToken(httpRequest);
            CartResponse cart = cartService.updateCartItem(user, itemId, request);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update cart item: " + e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}/select")
    public ResponseEntity<?> toggleSelect(
            @PathVariable Long itemId,
            @RequestBody boolean selected,
            HttpServletRequest request
    ) {
        User user = getUserFromToken(request);
        CartResponse resp = cartService.selectItem(user, itemId, selected);
        return ResponseEntity.ok(resp);
    }

    
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long itemId,
                                          HttpServletRequest httpRequest) {
        try {
            User user = getUserFromToken(httpRequest);
            CartResponse cart = cartService.removeFromCart(user, itemId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to remove from cart: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(HttpServletRequest httpRequest) {
        try {
            User user = getUserFromToken(httpRequest);
            cartService.clearCart(user);
            return ResponseEntity.ok(new SuccessResponse("Cart cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to clear cart: " + e.getMessage()));
        }
    }
    
    private User getUserFromToken(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        String email = jwtTokenProvider.getUsernameFromToken(token);
        return userService.findByEmail(email);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }
    
    public static class ErrorResponse {
        private final String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
    
    public static class SuccessResponse {
        private final String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
