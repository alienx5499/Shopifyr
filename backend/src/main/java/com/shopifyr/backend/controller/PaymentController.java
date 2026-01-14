package com.shopifyr.backend.controller;

import com.shopifyr.backend.dto.PaymentRequest;
import com.shopifyr.backend.model.Payment;
import com.shopifyr.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<Payment> initiatePayment(
            @RequestParam Long orderId,
            @RequestParam(required = false, defaultValue = "STRIPE") String provider
    ) {
        return ResponseEntity.ok(paymentService.initiatePayment(orderId, provider));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Payment> confirmPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request.orderId(), request.providerPaymentId()));
    }

    @PostMapping("/fail")
    public ResponseEntity<Payment> failPayment(@RequestParam Long orderId) {
        return ResponseEntity.ok(paymentService.failPayment(orderId));
    }
}
