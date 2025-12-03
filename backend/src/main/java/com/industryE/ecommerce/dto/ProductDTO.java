package com.industryE.ecommerce.dto;

import java.util.List;

public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String availableSizes;
    private Boolean inStock;
    private String image;
    private String color;
    private String brand;
    private Double rating;
    private String sizeInventoryJson; // Raw JSON from database
    private List<ProductSizeInventoryDTO> sizeInventory; // Parsed inventory for frontend
    
    // Default constructor
    public ProductDTO() {
    }
    
    // Constructor with fields
    public ProductDTO(Long id, String name, String description, Double price, 
                     String category, String availableSizes, Boolean inStock,
                     String image, String color, String brand, Double rating) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.availableSizes = availableSizes;
        this.inStock = inStock;
        this.image = image;
        this.color = color;
        this.brand = brand;
        this.rating = rating;
    }
    
    // Legacy constructor for backward compatibility
    public ProductDTO(Long id, String name, String description, Double price, 
                     String category, String availableSizes, Boolean inStock) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.availableSizes = availableSizes;
        this.inStock = inStock;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getAvailableSizes() {
        return availableSizes;
    }
    
    public void setAvailableSizes(String availableSizes) {
        this.availableSizes = availableSizes;
    }
    
    public Boolean getInStock() {
        return inStock;
    }
    
    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getBrand() {
        return brand;
    }
    
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public String getSizeInventoryJson() {
        return sizeInventoryJson;
    }
    
    public void setSizeInventoryJson(String sizeInventoryJson) {
        this.sizeInventoryJson = sizeInventoryJson;
    }
    
    public List<ProductSizeInventoryDTO> getSizeInventory() {
        return sizeInventory;
    }
    
    public void setSizeInventory(List<ProductSizeInventoryDTO> sizeInventory) {
        this.sizeInventory = sizeInventory;
    }
}
