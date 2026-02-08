package com.inventory.service;

import com.inventory.dto.TransactionRequest;
import com.inventory.model.Inventory;
import com.inventory.model.InventoryTransaction;
import com.inventory.model.Project;
import com.inventory.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final InventoryTransactionRepository transactionRepository;
    private final InventoryService inventoryService;
    private final ProjectService projectService;

    public List<InventoryTransaction> getAllTransactions() {
        return transactionRepository.findAllOrderByDateDesc();
    }

    public List<InventoryTransaction> getTransactionsByInventory(Long inventoryId) {
        return transactionRepository.findByInventoryId(inventoryId);
    }

    public List<InventoryTransaction> getTransactionsByProject(Long projectId) {
        return transactionRepository.findByProjectId(projectId);
    }

    public List<InventoryTransaction> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByDateRange(startDate, endDate);
    }

    @Transactional
    public InventoryTransaction createTransaction(TransactionRequest request) {
        Inventory inventory = inventoryService.getInventoryById(request.getInventoryId());

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectService.getProjectById(request.getProjectId());
        }

        // 재고 수량 업데이트
        int quantityChange = request.getTransactionType() == InventoryTransaction.TransactionType.IN
                ? request.getQuantity()
                : -request.getQuantity();

        inventoryService.updateStock(inventory.getId(), quantityChange);

        // 거래 기록 생성
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setInventory(inventory);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setQuantity(request.getQuantity());
        transaction.setProject(project);
        transaction.setReferenceNo(request.getReferenceNo());
        transaction.setTransactionDate(request.getTransactionDate() != null
                ? request.getTransactionDate()
                : LocalDateTime.now());
        transaction.setNotes(request.getNotes());
        transaction.setCreatedBy(request.getCreatedBy());

        return transactionRepository.save(transaction);
    }
}
