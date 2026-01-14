package com.shopifyr.backend.repository;

import com.shopifyr.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DATE(o.createdAt), SUM(o.totalAmount) " +
            "FROM Order o " +
            "WHERE o.createdAt BETWEEN :start AND :end " +
            "GROUP BY DATE(o.createdAt) " +
            "ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailySales(LocalDateTime start, LocalDateTime end);

    @Query("SELECT FUNCTION('DATE_TRUNC', 'month', o.createdAt), SUM(o.totalAmount) " +
            "FROM Order o " +
            "WHERE o.createdAt BETWEEN :start AND :end " +
            "GROUP BY FUNCTION('DATE_TRUNC', 'month', o.createdAt) " +
            "ORDER BY FUNCTION('DATE_TRUNC', 'month', o.createdAt)")
    List<Object[]> getMonthlySales(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderCountByStatus();
}

