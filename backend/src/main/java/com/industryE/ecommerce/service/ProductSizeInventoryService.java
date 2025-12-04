package com.industryE.ecommerce.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.industryE.ecommerce.dto.ProductSizeInventoryDTO;
import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.repository.ProductRepository;

@Service
@Transactional
public class ProductSizeInventoryService {

    @Autowired
    private ProductRepository productRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Inner class to represent size inventory data
    public static class SizeInventoryData {
        private Integer quantity = 0;
        private Integer reserved = 0;
        
        public SizeInventoryData() {}
        
        public SizeInventoryData(Integer quantity, Integer reserved) {
            this.quantity = quantity;
            this.reserved = reserved;
        }
        
        // Getters and setters for Jackson serialization
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        
        public Integer getReserved() {
            return reserved;
        }
        
        public void setReserved(Integer reserved) {
            this.reserved = reserved;
        }
        
        @JsonIgnore
        public Integer getAvailable() {
            return quantity - reserved;
        }
    }

    public List<ProductSizeInventoryDTO> getSizeInventoryByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return parseInventoryToDTO(product);
    }

    public ProductSizeInventoryDTO getSizeInventory(Long productId, String size) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        SizeInventoryData data = inventory.get(size);
        
        if (data == null) {
            return null;
        }
        
        return new ProductSizeInventoryDTO(
            null, // No separate ID since it's embedded
            size,
            data.getQuantity(),
            data.getReserved()
        );
    }

    public boolean checkAvailability(Long productId, String size, Integer requestedQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        SizeInventoryData data = inventory.get(size);
        
        if (data == null) {
            return false;
        }
        
        return data.getAvailable() >= requestedQuantity;
    }

    public void reserveInventory(Long productId, String size, Integer quantity) {
        System.out.println("reserveInventory called: productId=" + productId + ", size=" + size + ", qty=" + quantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        System.out.println("Current inventory JSON: " + product.getSizeInventory());
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        
        if (inventory.isEmpty()) {
            System.err.println("WARNING: Parsed inventory is empty! Original JSON: " + product.getSizeInventory());
        }
        
        SizeInventoryData data = inventory.get(size);
        
        if (data == null) {
            System.err.println("Size " + size + " not found. Available sizes: " + inventory.keySet());
            throw new RuntimeException("Size " + size + " not found for product");
        }
        
        if (data.getAvailable() < quantity) {
            throw new RuntimeException("Insufficient inventory for size " + size + ". Available: " + data.getAvailable());
        }
        
        data.setReserved(data.getReserved() + quantity);
        String serialized = serializeInventory(inventory);
        System.out.println("Serialized inventory: " + serialized);
        
        product.setSizeInventory(serialized);
        productRepository.save(product);
        System.out.println("Inventory reserved successfully");
    }

    public void releaseReservedInventory(Long productId, String size, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        SizeInventoryData data = inventory.get(size);
        
        if (data != null) {
            data.setReserved(Math.max(0, data.getReserved() - quantity));
            product.setSizeInventory(serializeInventory(inventory));
            productRepository.save(product);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void confirmSale(Long productId, String size, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        SizeInventoryData data = inventory.get(size);
        
        if (data == null) {
            throw new RuntimeException("Size " + size + " not found for product");
        }
        
        if (data.getReserved() < quantity) {
            throw new RuntimeException("Cannot confirm sale: not enough reserved quantity");
        }
        
        data.setQuantity(data.getQuantity() - quantity);
        data.setReserved(data.getReserved() - quantity);
        product.setSizeInventory(serializeInventory(inventory));
        productRepository.save(product);
    }

    public void initializeInventoryForProduct(Long productId, List<String> sizes, Integer quantityPerSize) {
        System.out.println("Initializing inventory for product ID: " + productId + " with " + quantityPerSize + " per size");
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        
        for (String size : sizes) {
            if (!inventory.containsKey(size)) {
                inventory.put(size, new SizeInventoryData(quantityPerSize, 0));
            }
        }
        
        String serialized = serializeInventory(inventory);
        System.out.println("Serialized inventory for product " + productId + ": " + serialized);
        
        product.setSizeInventory(serialized);
        Product saved = productRepository.save(product);
        System.out.println("Saved product " + saved.getId() + " with inventory: " + saved.getSizeInventory());
    }

    public void updateInventory(Long productId, String size, Integer newQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        
        SizeInventoryData data = inventory.get(size);
        if (data != null) {
            data.setQuantity(newQuantity);
            data.setReserved(Math.min(data.getReserved(), newQuantity));
        } else {
            inventory.put(size, new SizeInventoryData(newQuantity, 0));
        }
        
        product.setSizeInventory(serializeInventory(inventory));
        productRepository.save(product);
    }

    public boolean hasAvailableInventory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        
        return inventory.values().stream()
                .anyMatch(data -> data.getAvailable() > 0);
    }

    // Helper methods for JSON parsing/serialization
    private Map<String, SizeInventoryData> parseInventory(String json) {
        if (json == null || json.isEmpty()) {
            System.out.println("WARNING: Inventory JSON is null or empty");
            return new HashMap<>();
        }
        
        try {
            Map<String, SizeInventoryData> result = objectMapper.readValue(json, new TypeReference<Map<String, SizeInventoryData>>() {});
            System.out.println("Parsed inventory with " + result.size() + " sizes");
            return result;
        } catch (JsonProcessingException e) {
            System.err.println("CRITICAL ERROR parsing inventory JSON: " + e.getMessage());
            System.err.println("JSON was: " + json);
            e.printStackTrace();
            // Return empty map - this will cause data loss! Consider throwing instead
            return new HashMap<>();
        }
    }

    private String serializeInventory(Map<String, SizeInventoryData> inventory) {
        try {
            return objectMapper.writeValueAsString(inventory);
        } catch (JsonProcessingException e) {
            System.err.println("Error serializing inventory: " + e.getMessage());
            return "{}";
        }
    }

    private List<ProductSizeInventoryDTO> parseInventoryToDTO(Product product) {
        Map<String, SizeInventoryData> inventory = parseInventory(product.getSizeInventory());
        List<ProductSizeInventoryDTO> result = new ArrayList<>();
        
        for (Map.Entry<String, SizeInventoryData> entry : inventory.entrySet()) {
            SizeInventoryData data = entry.getValue();
            result.add(new ProductSizeInventoryDTO(
                null, // No separate ID
                entry.getKey(),
                data.getQuantity(),
                data.getReserved()
            ));
        }
        
        // Sort by size for consistent ordering
        result.sort((a, b) -> {
            try {
                return Double.compare(Double.parseDouble(a.getSize()), Double.parseDouble(b.getSize()));
            } catch (NumberFormatException e) {
                return a.getSize().compareTo(b.getSize());
            }
        });
        
        return result;
    }
    
    // Public method to get raw inventory JSON for a product
    public String getInventoryJson(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return product.getSizeInventory();
    }
}
