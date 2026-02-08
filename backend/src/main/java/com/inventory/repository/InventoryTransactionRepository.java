package com.inventory.repository;

import com.inventory.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByInventoryId(Long inventoryId);

    List<InventoryTransaction> findByProjectId(Long projectId);

    List<InventoryTransaction> findByTransactionType(InventoryTransaction.TransactionType transactionType);

    @Query("SELECT it FROM InventoryTransaction it WHERE it.transactionDate BETWEEN ?1 AND ?2 ORDER BY it.transactionDate DESC")
    List<InventoryTransaction> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT it FROM InventoryTransaction it ORDER BY it.transactionDate DESC")
    List<InventoryTransaction> findAllOrderByDateDesc();
}
