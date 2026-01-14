package com.shopifyr.backend.controller;

import com.shopifyr.backend.dto.ReviewRequest;
import com.shopifyr.backend.model.Review;
import com.shopifyr.backend.repository.UserRepository;
import com.shopifyr.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<Review> createReview(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(reviewService.createReview(userId, productId, request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(
            Authentication authentication,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(reviewService.updateReview(userId, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            Authentication authentication,
            @PathVariable Long reviewId
    ) {
        Long userId = getUserId(authentication);
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Double> getProductAverageRating(@PathVariable Long productId) {
        Double rating = reviewService.getProductAverageRating(productId);
        return ResponseEntity.ok(rating != null ? rating : 0.0);
    }

    private Long getUserId(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }
}
