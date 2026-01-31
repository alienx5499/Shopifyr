package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.OrderItemResponse;
import com.shopifyr.backend.dto.OrderResponse;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Cart;
import com.shopifyr.backend.model.CartItem;
import com.shopifyr.backend.model.Inventory;
import com.shopifyr.backend.model.Order;
import com.shopifyr.backend.model.OrderItem;
import com.shopifyr.backend.model.OrderStatus;
import com.shopifyr.backend.model.User;
import com.shopifyr.backend.repository.CartRepository;
import com.shopifyr.backend.repository.InventoryRepository;
import com.shopifyr.backend.repository.OrderRepository;
import com.shopifyr.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            InventoryRepository inventoryRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place order with empty cart");
        }

        // Validate inventory and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product out of stock: " + cartItem.getProduct().getName()));

            if (inventory.getQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + cartItem.getProduct().getName());
            }

            // Reduce inventory
            inventory.setQuantity(inventory.getQuantity() - cartItem.getQuantity());
            inventoryRepository.save(inventory);

            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Send order confirmation email
        try {
            emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    order.getId(),
                    order.getTotalAmount().doubleValue());
        } catch (Exception e) {
            // Log error but don't fail the order
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return toResponse(order);
    }

    @Transactional
    public List<OrderResponse> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        orders.forEach(this::checkAndUpdateStatus);
        return orders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        checkAndUpdateStatus(order);

        return toResponse(order);
    }

    private void checkAndUpdateStatus(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            return;
        }

        long secondsSinceCreation = java.time.temporal.ChronoUnit.SECONDS.between(order.getCreatedAt(),
                java.time.LocalDateTime.now());

        boolean updated = false;

        // PENDING -> SHIPPED (Visually "Confirmed") after 15 seconds
        if (order.getStatus() == OrderStatus.PENDING && secondsSinceCreation >= 15) {
            order.setStatus(OrderStatus.SHIPPED);
            updated = true;
        }

        // SHIPPED -> DELIVERED after 60 seconds (1 minute total)
        if (order.getStatus() == OrderStatus.SHIPPED && secondsSinceCreation >= 60) {
            order.setStatus(OrderStatus.DELIVERED);
            updated = true;
        }

        if (updated) {
            try {
                orderRepository.save(order);
                System.out.println("Order #" + order.getId() + " status updated to " + order.getStatus());
            } catch (Exception e) {
                System.err.println("Failed to update order status for #" + order.getId() + ": " + e.getMessage());
            }
        }
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> {
                    try {
                        if (item.getProduct() == null) {
                            throw new RuntimeException("Missing product");
                        }
                        return new OrderItemResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName() != null ? item.getProduct().getName() : "Unknown Product",
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                                item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "");
                    } catch (Exception e) {
                        return new OrderItemResponse(
                                item.getId(),
                                -1L,
                                "Corrupted Item Data",
                                item.getQuantity() != null ? item.getQuantity() : 0,
                                item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                "");
                    }
                })
                .collect(Collectors.toList());

        java.time.LocalDateTime estimatedDelivery = null;
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CANCELLED
                && order.getCreatedAt() != null) {
            estimatedDelivery = order.getCreatedAt().plusDays(3);
        }

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                items,
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                estimatedDelivery);
    }
}
