package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.WishlistResponse;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.model.User;
import com.shopifyr.backend.model.Wishlist;
import com.shopifyr.backend.repository.ProductRepository;
import com.shopifyr.backend.repository.UserRepository;
import com.shopifyr.backend.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository,
            ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return wishlistRepository.findAllByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void addToWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if already exists
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .createdAt(wishlist.getCreatedAt())
                .product(com.shopifyr.backend.dto.ProductResponse.builder()
                        .id(wishlist.getProduct().getId())
                        .name(wishlist.getProduct().getName())
                        .description(wishlist.getProduct().getDescription())
                        .price(wishlist.getProduct().getPrice())
                        .imageUrl(wishlist.getProduct().getImageUrl())
                        .categoryId(wishlist.getProduct().getCategory().getId())
                        .categoryName(wishlist.getProduct().getCategory().getName())
                        .brandId(wishlist.getProduct().getBrand() != null ? wishlist.getProduct().getBrand().getId()
                                : null)
                        .brandName(wishlist.getProduct().getBrand() != null ? wishlist.getProduct().getBrand().getName()
                                : null)
                        .isActive(wishlist.getProduct().getIsActive())
                        .createdAt(wishlist.getProduct().getCreatedAt())
                        .updatedAt(wishlist.getProduct().getUpdatedAt())
                        .build())
                .build();
    }
}
