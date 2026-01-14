package com.shopifyr.backend.repository;

import com.shopifyr.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemAnalyticsRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.product.id, SUM(oi.quantity), SUM(oi.unitPrice * oi.quantity) " +
            "FROM OrderItem oi " +
            "WHERE oi.order.createdAt BETWEEN :start AND :end " +
            "GROUP BY oi.product.id " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProducts(LocalDateTime start, LocalDateTime end);

    @Query("SELECT oi.order.user.id, SUM(oi.unitPrice * oi.quantity) " +
            "FROM OrderItem oi " +
            "WHERE oi.order.createdAt BETWEEN :start AND :end " +
            "GROUP BY oi.order.user.id " +
            "ORDER BY SUM(oi.unitPrice * oi.quantity) DESC")
    List<Object[]> findTopCustomers(LocalDateTime start, LocalDateTime end);
}

