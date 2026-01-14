package com.shopifyr.backend.service;

import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Order;
import com.shopifyr.backend.model.OrderStatus;
import com.shopifyr.backend.model.Payment;
import com.shopifyr.backend.model.PaymentStatus;
import com.shopifyr.backend.repository.OrderRepository;
import com.shopifyr.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          EmailService emailService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Payment initiatePayment(Long orderId, String provider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order is not in PENDING status");
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .provider(provider != null ? provider : "STRIPE")
                .build();

        return paymentRepository.save(payment);
    }

    /**
     * Create a payment "session" that mimics an external provider integration.
     * In a real-world scenario, this is where you would call Stripe/Razorpay
     * SDKs or REST APIs and receive a hosted checkout URL.
     */
    @Transactional
    public com.shopifyr.backend.dto.PaymentSessionResponse createPaymentSession(Long orderId, String provider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order is not in PENDING status");
        }

        // Ensure a payment record exists
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> initiatePayment(orderId, provider));

        BigDecimal amount = payment.getAmount();
        String normalizedProvider = provider != null ? provider.toUpperCase() : "STRIPE";

        // Fake checkout URL that frontends can redirect to for demo purposes
        String checkoutUrl = "https://payments.example.com/checkout/"
                + normalizedProvider.toLowerCase()
                + "/session/"
                + UUID.randomUUID();

        return new com.shopifyr.backend.dto.PaymentSessionResponse(
                order.getId(),
                amount,
                normalizedProvider,
                payment.getStatus().name(),
                checkoutUrl
        );
    }

    @Transactional
    public Payment confirmPayment(Long orderId, String providerPaymentId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setProviderPaymentId(providerPaymentId);
        payment = paymentRepository.save(payment);

        // Update order status
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        // Send order status update email
        try {
            emailService.sendOrderStatusUpdateEmail(
                    order.getUser().getEmail(),
                    order.getId(),
                    order.getStatus().name()
            );
        } catch (Exception e) {
            // Log error but don't fail the payment
            System.err.println("Failed to send order status update email: " + e.getMessage());
        }

        return payment;
    }

    @Transactional
    public Payment failPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);
        return paymentRepository.save(payment);
    }

    /**
     * Handle generic webhooks from payment providers. This implementation
     * is intentionally simple and acts as a stub that you can extend with
     * real Stripe/Razorpay payload parsing and signature verification.
     */
    @Transactional
    public void handleWebhook(String provider, Map<String, Object> payload, Map<String, String> headers) {
        // In a real integration:
        // 1. Verify signature from headers
        // 2. Parse event type and data
        // 3. Locate order/payment by external reference
        // 4. Update Payment + Order status accordingly

        Object orderIdValue = payload.get("orderId");
        Object providerPaymentIdValue = payload.get("providerPaymentId");

        if (orderIdValue == null) {
            // Nothing we can safely do without an order reference
            return;
        }

        Long orderId;
        try {
            orderId = Long.valueOf(orderIdValue.toString());
        } catch (NumberFormatException ex) {
            return;
        }

        String providerPaymentId = providerPaymentIdValue != null ? providerPaymentIdValue.toString() : null;

        // For demo purposes, treat any webhook with an orderId as a successful payment
        confirmPayment(orderId, providerPaymentId != null ? providerPaymentId : "webhook-" + provider);
    }
}
