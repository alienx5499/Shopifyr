package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.ReviewRequest;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Order;
import com.shopifyr.backend.model.OrderItem;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.model.Review;
import com.shopifyr.backend.model.User;
import com.shopifyr.backend.repository.OrderRepository;
import com.shopifyr.backend.repository.ProductRepository;
import com.shopifyr.backend.repository.ReviewRepository;
import com.shopifyr.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         ProductRepository productRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Review createReview(Long userId, Long productId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if user has purchased this product
        if (!hasUserPurchasedProduct(userId, productId)) {
            throw new IllegalArgumentException("You can only review products you have purchased");
        }

        // Check if review already exists
        if (reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own reviews");
        }

        review.setRating(request.rating());
        review.setComment(request.comment());

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public Double getProductAverageRating(Long productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }

    private boolean hasUserPurchasedProduct(Long userId, Long productId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(OrderItem::getProduct)
                .anyMatch(product -> product.getId().equals(productId));
    }
}
