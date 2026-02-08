package com.inventory.service;

import com.inventory.dto.InventoryRequest;
import com.inventory.model.Inventory;
import com.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final NotificationService notificationService;

    public InventoryService(InventoryRepository inventoryRepository,
                           @Lazy NotificationService notificationService) {
        this.inventoryRepository = inventoryRepository;
        this.notificationService = notificationService;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("재고를 찾을 수 없습니다: " + id));
    }

    public Inventory getInventoryByItemCode(String itemCode) {
        return inventoryRepository.findByItemCode(itemCode)
                .orElseThrow(() -> new RuntimeException("재고를 찾을 수 없습니다: " + itemCode));
    }

    public List<Inventory> getInventoryByCategory(String category) {
        return inventoryRepository.findByCategory(category);
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public List<Inventory> searchInventory(String keyword) {
        return inventoryRepository.searchByKeyword(keyword);
    }

    @Transactional
    public Inventory createInventory(InventoryRequest request) {
        if (inventoryRepository.existsByItemCode(request.getItemCode())) {
            throw new RuntimeException("이미 존재하는 품목 코드입니다: " + request.getItemCode());
        }

        Inventory inventory = new Inventory();
        inventory.setItemCode(request.getItemCode());
        inventory.setItemName(request.getItemName());
        inventory.setCategory(request.getCategory());
        inventory.setUnit(request.getUnit());
        inventory.setCurrentStock(request.getCurrentStock());
        inventory.setMinStock(request.getMinStock());
        inventory.setUnitPrice(request.getUnitPrice());
        inventory.setLocation(request.getLocation());

        Inventory saved = inventoryRepository.save(inventory);

        // 최소 재고 미달 체크
        checkLowStockAndNotify(saved);

        return saved;
    }

    @Transactional
    public Inventory updateInventory(Long id, InventoryRequest request) {
        Inventory inventory = getInventoryById(id);

        if (!inventory.getItemCode().equals(request.getItemCode()) &&
                inventoryRepository.existsByItemCode(request.getItemCode())) {
            throw new RuntimeException("이미 존재하는 품목 코드입니다: " + request.getItemCode());
        }

        inventory.setItemCode(request.getItemCode());
        inventory.setItemName(request.getItemName());
        inventory.setCategory(request.getCategory());
        inventory.setUnit(request.getUnit());
        inventory.setCurrentStock(request.getCurrentStock());
        inventory.setMinStock(request.getMinStock());
        inventory.setUnitPrice(request.getUnitPrice());
        inventory.setLocation(request.getLocation());

        Inventory updated = inventoryRepository.save(inventory);

        // 최소 재고 미달 체크
        checkLowStockAndNotify(updated);

        return updated;
    }

    @Transactional
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException("재고를 찾을 수 없습니다: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @Transactional
    public void updateStock(Long id, int quantityChange) {
        Inventory inventory = getInventoryById(id);
        int newStock = inventory.getCurrentStock() + quantityChange;

        if (newStock < 0) {
            throw new RuntimeException("재고가 부족합니다");
        }

        inventory.setCurrentStock(newStock);
        inventoryRepository.save(inventory);

        // 최소 재고 미달 체크
        checkLowStockAndNotify(inventory);
    }

    private void checkLowStockAndNotify(Inventory inventory) {
        if (inventory.getCurrentStock() < inventory.getMinStock()) {
            notificationService.createLowStockNotification(inventory);
        }
    }
}
