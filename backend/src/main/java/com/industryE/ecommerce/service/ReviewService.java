package com.industryE.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.industryE.ecommerce.dto.ReviewDTO;
import com.industryE.ecommerce.entity.Product;
import com.industryE.ecommerce.entity.Review;
import com.industryE.ecommerce.entity.User;
import com.industryE.ecommerce.repository.ProductRepository;
import com.industryE.ecommerce.repository.ReviewRepository;
import com.industryE.ecommerce.repository.UserRepository;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ReviewDTO addReview(Long userId, Long productId, ReviewDTO reviewDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        
        // Update product average rating
        updateProductRating(product, reviewDto.getRating());

        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview);
    }
    
    private void updateProductRating(Product product, int newRating) {
        // This is a simplified average calculation. 
        // In a real app, you might want to recalculate from all reviews 
        // or store review count and sum in the product entity.
        // For now, we'll just fetch all reviews to recalculate to be accurate.
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        
        double sum = newRating;
        int count = 1;
        
        if (!reviews.isEmpty()) {
            sum += reviews.stream().mapToInt(Review::getRating).sum();
            count += reviews.size();
        }
        
        double newAverage = sum / count;
        product.setRating(newAverage); // Assuming Product has setRating(double)
        productRepository.save(product);
    }

    private ReviewDTO convertToDTO(Review review) {
        return new ReviewDTO(
            review.getId(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt(),
            review.getUser().getName(),
            review.getUser().getId(),
            review.getProduct().getId()
        );
    }
}

