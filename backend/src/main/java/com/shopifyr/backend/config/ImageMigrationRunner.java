package com.shopifyr.backend.config;

import com.shopifyr.backend.model.Category;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.repository.CategoryRepository;
import com.shopifyr.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImageMigrationRunner implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting image path migration...");

        // Update Products
        List<Product> products = productRepository.findAll();
        int productCount = 0;
        for (Product product : products) {
            if (product.getImageUrl() != null && product.getImageUrl().startsWith("/images/")) {
                String newUrl = product.getImageUrl().replace("/images/", "/assets/images/");
                product.setImageUrl(newUrl);
                productRepository.save(product);
                productCount++;
            }
        }
        log.info("Updated {} products with new image paths", productCount);

        // Update Categories
        List<Category> categories = categoryRepository.findAll();
        int categoryCount = 0;
        for (Category category : categories) {
            if (category.getImageUrl() != null && category.getImageUrl().startsWith("/images/")) {
                String newUrl = category.getImageUrl().replace("/images/", "/assets/images/");
                category.setImageUrl(newUrl);
                categoryRepository.save(category);
                categoryCount++;
            }
        }
        log.info("Updated {} categories with new image paths", categoryCount);
        
        log.info("Image path migration completed.");
    }
}
