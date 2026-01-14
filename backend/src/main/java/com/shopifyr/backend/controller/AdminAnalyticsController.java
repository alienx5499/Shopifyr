package com.shopifyr.backend.controller;

import com.shopifyr.backend.dto.analytics.*;
import com.shopifyr.backend.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    public AdminAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/sales/daily")
    public ResponseEntity<List<DailySalesDto>> getDailySales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(analyticsService.getDailySales(startDate, endDate));
    }

    @GetMapping("/sales/monthly")
    public ResponseEntity<List<MonthlySalesDto>> getMonthlySales(
            @RequestParam int year
    ) {
        return ResponseEntity.ok(analyticsService.getMonthlySales(year));
    }

    @GetMapping("/orders/status")
    public ResponseEntity<List<StatusCountDto>> getOrdersByStatus() {
        return ResponseEntity.ok(analyticsService.getOrderCountByStatus());
    }

    @GetMapping("/revenue/category")
    public ResponseEntity<List<CategoryRevenueDto>> getRevenuePerCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(analyticsService.getRevenuePerCategory(startDate, endDate));
    }

    @GetMapping("/top/products")
    public ResponseEntity<List<TopProductDto>> getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTopProducts(startDate, endDate, limit));
    }

    @GetMapping("/top/customers")
    public ResponseEntity<List<TopCustomerDto>> getTopCustomers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTopCustomers(startDate, endDate, limit));
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<List<LowStockItemDto>> getLowStockItems(
            @RequestParam(defaultValue = "10") int threshold
    ) {
        return ResponseEntity.ok(analyticsService.getLowStockItems(threshold));
    }
}

