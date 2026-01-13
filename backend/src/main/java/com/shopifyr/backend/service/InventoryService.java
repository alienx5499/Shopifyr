package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.InventoryRequest;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Inventory;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.repository.InventoryRepository;
import com.shopifyr.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                             ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Inventory updateInventory(InventoryRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(request.productId())
                .orElseGet(() -> Inventory.builder().product(product).quantity(0).build());

        inventory.setQuantity(request.quantity());
        return inventoryRepository.save(inventory);
    }

    public Inventory getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
    }
}
