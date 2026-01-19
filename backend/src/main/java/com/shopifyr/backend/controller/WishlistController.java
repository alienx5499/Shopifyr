package com.shopifyr.backend.controller;

import com.shopifyr.backend.dto.WishlistResponse;
import com.shopifyr.backend.model.Wishlist;
import com.shopifyr.backend.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<WishlistResponse> wishlist = wishlistService.getWishlist(auth.getName());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        wishlistService.addToWishlist(auth.getName(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        wishlistService.removeFromWishlist(auth.getName(), productId);
        return ResponseEntity.ok().build();
    }
}
