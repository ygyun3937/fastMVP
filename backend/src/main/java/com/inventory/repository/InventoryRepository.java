package com.inventory.repository;

import com.inventory.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByItemCode(String itemCode);

    List<Inventory> findByCategory(String category);

    @Query("SELECT i FROM Inventory i WHERE i.currentStock < i.minStock")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.itemName LIKE %?1% OR i.itemCode LIKE %?1%")
    List<Inventory> searchByKeyword(String keyword);

    boolean existsByItemCode(String itemCode);
}
