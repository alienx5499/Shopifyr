package com.shopifyr.backend.controller;

import com.shopifyr.backend.dto.PaymentRequest;
import com.shopifyr.backend.dto.PaymentSessionResponse;
import com.shopifyr.backend.model.Payment;
import com.shopifyr.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    /**
     * Simulate creation of a checkout session with an external payment provider
     * such as Stripe or Razorpay. In a real integration, this would call the
     * provider's API and return the hosted checkout URL.
     */
    @PostMapping("/provider/{provider}/session")
    public ResponseEntity<PaymentSessionResponse> createPaymentSession(
            @PathVariable String provider,
            @RequestParam Long orderId
    ) {
        return ResponseEntity.ok(paymentService.createPaymentSession(orderId, provider));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Payment> confirmPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request.orderId(), request.providerPaymentId()));
    }

    @PostMapping("/fail")
    public ResponseEntity<Payment> failPayment(@RequestParam Long orderId) {
        return ResponseEntity.ok(paymentService.failPayment(orderId));
    }

    /**
     * Generic webhook endpoint to receive asynchronous notifications
     * from payment providers (Stripe, Razorpay, etc.).
     *
     * For a real integration, you would verify the signature header
     * and parse the payload according to the provider's spec.
     */
    @PostMapping("/provider/{provider}/webhook")
    public ResponseEntity<Void> handleWebhook(
            @PathVariable String provider,
            @RequestBody Map<String, Object> payload,
            @RequestHeader Map<String, String> headers
    ) {
        paymentService.handleWebhook(provider, payload, headers);
        return ResponseEntity.ok().build();
    }
}
