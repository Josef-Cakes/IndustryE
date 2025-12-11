package com.industryE.ecommerce.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.industryE.ecommerce.dto.AddToCartRequest;
import com.industryE.ecommerce.dto.CartResponse;
import com.industryE.ecommerce.dto.UpdateCartItemRequest;
import com.industryE.ecommerce.entity.Cart;
import com.industryE.ecommerce.entity.CartItem;
import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.repository.CartItemRepository;
import com.industryE.ecommerce.repository.CartRepository;
import com.industryE.ecommerce.repository.ProductRepository;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductSizeInventoryService sizeInventoryService;

    public CartResponse getCartByUser(User user) {
        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(user.getId());

        if (cartOpt.isPresent()) {
            return convertToResponse(cartOpt.get());
        } else {
            // Create new empty cart
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setItems(new ArrayList<>());
            Cart savedCart = cartRepository.save(newCart);
            return convertToResponse(savedCart);
        }
    }

    public CartResponse addToCart(User user, AddToCartRequest request) {
        // Check size availability first
        if (!sizeInventoryService.checkAvailability(request.getProductId(), request.getSize(), request.getQuantity())) {
            throw new RuntimeException("Size " + request.getSize() + " is not available or insufficient quantity");
        }

        // Get or create cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        // Get product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item already exists in cart with same size
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSize(
                cart.getId(), product.getId(), request.getSize());

        if (existingItem.isPresent()) {
            // Always set the quantity to the requested value (replace, do not add)
            CartItem item = existingItem.get();
            int newQuantity = request.getQuantity();

            // Check if new quantity is available
            if (!sizeInventoryService.checkAvailability(request.getProductId(), request.getSize(), newQuantity)) {
                throw new RuntimeException("Cannot set quantity to " + newQuantity + ". Only " +
                        sizeInventoryService.getSizeInventory(request.getProductId(), request.getSize())
                                .getAvailableQuantity() +
                        " available in size " + request.getSize());
            }

            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setSize(request.getSize());
            newItem.setQuantity(request.getQuantity());
            newItem.setUnitPrice(BigDecimal.valueOf(product.getPrice()));
            cartItemRepository.save(newItem);
        }

        // Update cart timestamp
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return getCartByUser(user);
    }

    public CartResponse selectItem(User user, Long itemId, boolean selected) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        item.setSelected(selected);
        cartItemRepository.save(item);

        return getCartByUser(user);
    }


    public CartResponse updateCartItem(User user, Long cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify the cart belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        // Update cart timestamp
        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return getCartByUser(user);
    }

    public CartResponse removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify the cart belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);

        // Update cart timestamp
        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return getCartByUser(user);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void clearCart(User user) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(user.getId());
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteByCartId(cart.getId());
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }

    private CartResponse convertToResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());

        if (cart.getItems() != null) {
            List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                    .map(this::convertItemToResponse)
                    .collect(Collectors.toList());
            response.setItems(itemResponses);

            // Calculate total
            BigDecimal total = itemResponses.stream()
                    .map(CartResponse.CartItemResponse::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setTotalAmount(total);
        } else {
            response.setItems(new ArrayList<>());
            response.setTotalAmount(BigDecimal.ZERO);
        }

        return response;
    }

    private CartResponse.CartItemResponse convertItemToResponse(CartItem item) {
        CartResponse.CartItemResponse response = new CartResponse.CartItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setProductImage(""); // Images handled in frontend
        response.setSize(item.getSize());
        response.setUnitPrice(item.getUnitPrice());
        response.setQuantity(item.getQuantity());
        response.setTotalPrice(item.getTotalPrice());
        return response;
    }
}
