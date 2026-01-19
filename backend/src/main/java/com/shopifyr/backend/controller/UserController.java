package com.shopifyr.backend.controller;

import com.shopifyr.backend.model.User;
import com.shopifyr.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(user);
    }

    @org.springframework.web.bind.annotation.PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @org.springframework.web.bind.annotation.RequestBody com.shopifyr.backend.dto.UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.firstName() != null)
            user.setFirstName(request.firstName());
        if (request.lastName() != null)
            user.setLastName(request.lastName());
        if (request.phoneNumber() != null)
            user.setPhoneNumber(request.phoneNumber());
        if (request.addressLine1() != null)
            user.setAddressLine1(request.addressLine1());
        if (request.addressLine2() != null)
            user.setAddressLine2(request.addressLine2());
        if (request.city() != null)
            user.setCity(request.city());
        if (request.state() != null)
            user.setState(request.state());
        if (request.zipCode() != null)
            user.setZipCode(request.zipCode());
        if (request.country() != null)
            user.setCountry(request.country());

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}
