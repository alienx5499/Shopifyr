package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.analytics.*;
import com.shopifyr.backend.model.Category;
import com.shopifyr.backend.model.Inventory;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.model.User;
import com.shopifyr.backend.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemAnalyticsRepository orderItemAnalyticsRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public AnalyticsService(OrderRepository orderRepository,
                            OrderItemAnalyticsRepository orderItemAnalyticsRepository,
                            InventoryRepository inventoryRepository,
                            ProductRepository productRepository,
                            CategoryRepository categoryRepository,
                            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemAnalyticsRepository = orderItemAnalyticsRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<DailySalesDto> getDailySales(LocalDate start, LocalDate end) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.plusDays(1).atStartOfDay().minusNanos(1);
        return orderRepository.getDailySales(s, e).stream()
                .map(row -> new DailySalesDto(
                        (LocalDate) row[0],
                        (BigDecimal) row[1]
                ))
                .toList();
    }

    public List<MonthlySalesDto> getMonthlySales(int year) {
        LocalDateTime start = YearMonth.of(year, 1).atDay(1).atStartOfDay();
        LocalDateTime end = YearMonth.of(year, 12).atEndOfMonth().atTime(23, 59, 59);
        return orderRepository.getMonthlySales(start, end).stream()
                .map(row -> {
                    Object ts = row[0];
                    String month = ts.toString();
                    return new MonthlySalesDto(month, (BigDecimal) row[1]);
                })
                .toList();
    }

    public List<StatusCountDto> getOrderCountByStatus() {
        return orderRepository.getOrderCountByStatus().stream()
                .map(row -> new StatusCountDto(row[0].toString(), ((Number) row[1]).longValue()))
                .toList();
    }

    public List<CategoryRevenueDto> getRevenuePerCategory(LocalDate start, LocalDate end) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.plusDays(1).atStartOfDay().minusNanos(1);
        List<Object[]> rows = orderItemAnalyticsRepository.findTopProducts(s, e);

        Map<Long, CategoryRevenueDto> byCategory = rows.stream()
                .map(row -> {
                    Long productId = (Long) row[0];
                    BigDecimal revenue = (BigDecimal) row[2];
                    Product product = productRepository.findById(productId).orElseThrow();
                    Category category = product.getCategory();
                    return new CategoryRevenueDto(
                            category.getId(),
                            category.getName(),
                            revenue
                    );
                })
                .collect(Collectors.toMap(
                        CategoryRevenueDto::categoryId,
                        dto -> dto,
                        (a, b) -> new CategoryRevenueDto(
                                a.categoryId(),
                                a.categoryName(),
                                a.revenue().add(b.revenue())
                        )
                ));

        return byCategory.values().stream().toList();
    }

    public List<TopProductDto> getTopProducts(LocalDate start, LocalDate end, int limit) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.plusDays(1).atStartOfDay().minusNanos(1);
        return orderItemAnalyticsRepository.findTopProducts(s, e).stream()
                .limit(limit)
                .map(row -> {
                    Long productId = (Long) row[0];
                    long qty = ((Number) row[1]).longValue();
                    BigDecimal revenue = (BigDecimal) row[2];
                    Product product = productRepository.findById(productId).orElseThrow();
                    return new TopProductDto(productId, product.getName(), qty, revenue);
                })
                .toList();
    }

    public List<TopCustomerDto> getTopCustomers(LocalDate start, LocalDate end, int limit) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.plusDays(1).atStartOfDay().minusNanos(1);
        return orderItemAnalyticsRepository.findTopCustomers(s, e).stream()
                .limit(limit)
                .map(row -> {
                    Long userId = (Long) row[0];
                    BigDecimal revenue = (BigDecimal) row[1];
                    User user = userRepository.findById(userId).orElseThrow();
                    return new TopCustomerDto(userId, user.getUsername(), revenue);
                })
                .toList();
    }

    public List<LowStockItemDto> getLowStockItems(int threshold) {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getQuantity() != null && inv.getQuantity() <= threshold)
                .map(inv -> {
                    Product product = inv.getProduct();
                    return new LowStockItemDto(product.getId(), product.getName(), inv.getQuantity());
                })
                .toList();
    }
}

