package com.industryE.ecommerce.config;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.entity.Review;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.repository.ProductRepository;
import com.industryE.ecommerce.repository.ReviewRepository;
import com.industryE.ecommerce.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        createAdminUser();
        
        // Only populate products if the database is empty
        if (productRepository.count() == 0) {
            List<Product> sampleProducts = Arrays.asList(
                new Product(
                    "Air Jordan 1 Low",
                    "The Air Jordan 1 Low offers all the appeal of the original AJ1 with a more versatile, everyday wearable aesthetic.",
                    4995.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "casual",
                    "AIRJORDAN1LOW.jpg",
                    "White/Black",
                    "Jordan",
                    4.8
                ),
                new Product(
                    "Air Zoom Pegasus 41",
                    "Responsive cushioning in the Pegasus provides an energized ride for everyday road running.",
                    6895.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "running",
                    "AIRZOOMPEGASUS41.jpg",
                    "Black/White", 
                    "Nike",
                    4.9
                ),
                new Product(
                    "G.T. Jump Academy EP",
                    "Designed for explosive jumps and quick cuts on the basketball court.",
                    5495.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "sports",
                    "G.T.JUMPACADEMYEP.jpg",
                    "Blue/White",
                    "Nike",
                    4.7
                ),
                new Product(
                    "Jordan Air Rev",
                    "A classic Jordan silhouette with modern performance features.",
                    7295.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "sports",
                    "JORDAN+AIR+REV.jpg",
                    "Red/Black",
                    "Jordan",
                    4.8
                ),
                new Product(
                    "Legend 10 Elite FG",
                    "Professional-grade football boots designed for elite performance on firm ground.",
                    12995.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "sports",
                    "LEGEND10ELITEFG.jpg",
                    "Green/Black",
                    "Nike",
                    4.9
                ),
                new Product(
                    "Nike Dunk Low Retro",
                    "The iconic basketball shoe returns with premium materials and classic colorways.",
                    5995.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "casual",
                    "NIKEDUNKLOWRETRO.jpg",
                    "White/Green",
                    "Nike",
                    4.6
                ),
                new Product(
                    "Nike P-6000 Premium",
                    "Retro-inspired running shoe with modern comfort and style.",
                    4495.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "casual",
                    "NIKEP-6000PRM.jpg",
                    "Grey/Silver",
                    "Nike",
                    4.5
                ),
                new Product(
                    "Phantom 6 High Elite LE FG",
                    "Limited edition elite football boots with cutting-edge technology.",
                    15995.0,
                    "[\"7\", \"7.5\", \"8\", \"8.5\", \"9\", \"9.5\", \"10\", \"10.5\", \"11\", \"11.5\", \"12\"]",
                    "limited",
                    "PHANTOM6HIGHELITELEFG.jpg",
                    "Black/Gold",
                    "Nike",
                    5.0
                )
            );
            
            // Build the inventory JSON with 50 quantity per size
            String inventoryJson = buildInventoryJson(50);
            System.out.println("Setting inventory JSON on all products: " + inventoryJson);
            
            // Set inventory on each product BEFORE saving
            for (Product product : sampleProducts) {
                product.setSizeInventory(inventoryJson);
            }
            
            // Save products with inventory already set
            List<Product> savedProducts = productRepository.saveAll(sampleProducts);
            
            System.out.println("Sample products and size inventories created successfully");
            System.out.println("Saved " + savedProducts.size() + " products with inventory");
            
            // Create sample reviews
            createSampleReviews(savedProducts);
        }
    }
    
    private void createSampleReviews(List<Product> products) {
        // Create multiple demo users with different names for variety
        String[] demoUserNames = {
            "Sneaker Head",
            "Jordan Fan",
            "Nike Enthusiast",
            "Shoe Collector",
            "Kicks Lover",
            "Sneaker Pro",
            "Footwear Expert",
            "Style Seeker"
        };
        
        List<User> demoUsers = new java.util.ArrayList<User>();
        
        // Create demo users if they don't exist
        for (int i = 0; i < demoUserNames.length; i++) {
            String email = "demo" + i + "@shoestop.com";
            User demoUser = userRepository.findByEmail(email).orElse(null);
            if (demoUser == null) {
                demoUser = new User();
                demoUser.setName(demoUserNames[i]);
                demoUser.setEmail(email);
                demoUser.setPassword("password");
                demoUser.setRole(User.Role.USER);
                demoUser.setPhone("+098765432" + i);
                demoUser.setLocation("Manila");
                demoUser.setBio("I love shoes!");
                userRepository.save(demoUser);
            }
            demoUsers.add(demoUser);
        }

        String[] positiveComments = {
            "Absolutely love these kicks! Super comfortable.",
            "Great quality and fits perfectly.",
            "Fast delivery and the box was in perfect condition.",
            "Best purchase I've made this year.",
            "Looks even better in person!"
        };
        
        Random random = new Random();
        
        for (Product product : products) {
            // Add 2-4 reviews per product
            int reviewCount = 2 + random.nextInt(3);
            double ratingSum = 0;
            
            for (int i = 0; i < reviewCount; i++) {
                int rating = 4 + random.nextInt(2); // 4 or 5 stars
                String comment = positiveComments[random.nextInt(positiveComments.length)];
                
                // Randomly select a demo user for each review
                User selectedUser = demoUsers.get(random.nextInt(demoUsers.size()));
                
                Review review = new Review(rating, comment, selectedUser, product);
                // Spread out creation times slightly if needed, but default is now()
                reviewRepository.save(review);
                ratingSum += rating;
            }
            
            // Update product average rating
            if (reviewCount > 0) {
                product.setRating(ratingSum / reviewCount);
                productRepository.save(product);
            }
        }
        
        System.out.println("Sample reviews created successfully");
    }

    private void createAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@shoestop.com").isEmpty()) {
            User adminUser = new User();
            adminUser.setName("Administrator");
            adminUser.setEmail("admin@shoestop.com");
            adminUser.setPassword("admin123"); // Store as plain text to match AuthService logic
            adminUser.setRole(User.Role.ADMIN);
            adminUser.setPhone("+1234567890");
            adminUser.setLocation("Admin Office");
            adminUser.setBio("System Administrator");
            
            userRepository.save(adminUser);
            System.out.println("Admin user created successfully");
            System.out.println("Email: admin@shoestop.com");
            System.out.println("Password: admin123");
        } else {
            System.out.println("Admin user already exists");
        }
    }
    
    /**
     * Builds the inventory JSON string with the specified quantity per size.
     * Format: {"7":{"quantity":50,"reserved":0},"7.5":{"quantity":50,"reserved":0},...}
     */
    private String buildInventoryJson(int quantityPerSize) {
        String[] sizes = {"7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"};
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < sizes.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(sizes[i]).append("\":");
            sb.append("{\"quantity\":").append(quantityPerSize).append(",\"reserved\":0}");
        }
        sb.append("}");
        return sb.toString();
    }
}
