package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.PaymentRequest;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Order;
import com.shopifyr.backend.model.OrderStatus;
import com.shopifyr.backend.model.Payment;
import com.shopifyr.backend.model.PaymentStatus;
import com.shopifyr.backend.repository.OrderRepository;
import com.shopifyr.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
