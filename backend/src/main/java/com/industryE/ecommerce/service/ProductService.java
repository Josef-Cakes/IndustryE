package com.industryE.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.industryE.ecommerce.dto.ProductDTO;
import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductSizeInventoryService sizeInventoryService;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setAvailableSizes(productDTO.getAvailableSizes());
        existingProduct.setInStock(productDTO.getInStock());
        
        // Update image and other fields if provided (preserve existing values if not provided)
        if (productDTO.getImage() != null && !productDTO.getImage().trim().isEmpty()) {
            existingProduct.setImage(productDTO.getImage());
        }
        // If image is null or empty, keep the existing image
        
        if (productDTO.getColor() != null && !productDTO.getColor().trim().isEmpty()) {
            existingProduct.setColor(productDTO.getColor());
        }
        if (productDTO.getBrand() != null && !productDTO.getBrand().trim().isEmpty()) {
            existingProduct.setBrand(productDTO.getBrand());
        }
        if (productDTO.getRating() != null) {
            existingProduct.setRating(productDTO.getRating());
        }
        
        Product updatedProduct = productRepository.save(existingProduct);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        
        // Size inventory is now embedded in the product, so just delete the product
        productRepository.deleteById(id);
    }

    // Helper methods
    public ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getAvailableSizes(),
                product.getInStock(),
                product.getImage(),
                product.getColor(),
                product.getBrand(),
                product.getRating()
        );
        
        // Add size inventory information
        dto.setSizeInventory(sizeInventoryService.getSizeInventoryByProductId(product.getId()));
        
        return dto;
    }

    private Product convertToEntity(ProductDTO productDTO) {
        Product product = new Product(
                productDTO.getName(),
                productDTO.getDescription(),
                productDTO.getPrice(),
                productDTO.getAvailableSizes(),
                productDTO.getCategory(),
                productDTO.getImage(),
                productDTO.getColor(),
                productDTO.getBrand(),
                productDTO.getRating()
        );
        Boolean inStock = productDTO.getInStock();
        product.setInStock(inStock == null ? Boolean.TRUE : inStock);
        return product;
    }
}
