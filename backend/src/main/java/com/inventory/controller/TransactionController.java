package com.inventory.controller;

import com.inventory.dto.TransactionRequest;
import com.inventory.model.InventoryTransaction;
import com.inventory.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<InventoryTransaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/inventory/{inventoryId}")
    public ResponseEntity<List<InventoryTransaction>> getTransactionsByInventory(@PathVariable Long inventoryId) {
        return ResponseEntity.ok(transactionService.getTransactionsByInventory(inventoryId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InventoryTransaction>> getTransactionsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(transactionService.getTransactionsByProject(projectId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<InventoryTransaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<InventoryTransaction> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(request));
    }
}
