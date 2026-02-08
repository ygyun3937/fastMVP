package com.inventory.controller;

import com.inventory.model.Inventory;
import com.inventory.model.InventoryTransaction;
import com.inventory.model.Project;
import com.inventory.service.InventoryService;
import com.inventory.service.ProjectService;
import com.inventory.service.TransactionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final InventoryService inventoryService;
    private final ProjectService projectService;
    private final TransactionService transactionService;

    @GetMapping("/inventory-status")
    public ResponseEntity<InventoryStatusReport> getInventoryStatus() {
        List<Inventory> allInventory = inventoryService.getAllInventory();
        List<Inventory> lowStock = inventoryService.getLowStockItems();

        long totalItems = allInventory.size();
        long lowStockItems = lowStock.size();
        int totalStock = allInventory.stream()
                .mapToInt(Inventory::getCurrentStock)
                .sum();

        InventoryStatusReport report = new InventoryStatusReport();
        report.setTotalItems(totalItems);
        report.setLowStockItems(lowStockItems);
        report.setTotalStock(totalStock);
        report.setInventoryList(allInventory);
        report.setLowStockList(lowStock);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/project-summary")
    public ResponseEntity<ProjectSummaryReport> getProjectSummary() {
        List<Project> allProjects = projectService.getAllProjects();

        Map<Project.ProjectStatus, Long> statusCounts = new HashMap<>();
        for (Project.ProjectStatus status : Project.ProjectStatus.values()) {
            long count = allProjects.stream()
                    .filter(p -> p.getStatus() == status)
                    .count();
            statusCounts.put(status, count);
        }

        ProjectSummaryReport report = new ProjectSummaryReport();
        report.setTotalProjects((long) allProjects.size());
        report.setStatusCounts(statusCounts);
        report.setProjects(allProjects);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/transaction-history")
    public ResponseEntity<TransactionHistoryReport> getTransactionHistory() {
        List<InventoryTransaction> allTransactions = transactionService.getAllTransactions();

        long totalTransactions = allTransactions.size();
        long inTransactions = allTransactions.stream()
                .filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.IN)
                .count();
        long outTransactions = allTransactions.stream()
                .filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.OUT)
                .count();

        int totalInQuantity = allTransactions.stream()
                .filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.IN)
                .mapToInt(InventoryTransaction::getQuantity)
                .sum();

        int totalOutQuantity = allTransactions.stream()
                .filter(t -> t.getTransactionType() == InventoryTransaction.TransactionType.OUT)
                .mapToInt(InventoryTransaction::getQuantity)
                .sum();

        TransactionHistoryReport report = new TransactionHistoryReport();
        report.setTotalTransactions(totalTransactions);
        report.setInTransactions(inTransactions);
        report.setOutTransactions(outTransactions);
        report.setTotalInQuantity(totalInQuantity);
        report.setTotalOutQuantity(totalOutQuantity);
        report.setTransactions(allTransactions);

        return ResponseEntity.ok(report);
    }

    @Data
    public static class InventoryStatusReport {
        private Long totalItems;
        private Long lowStockItems;
        private Integer totalStock;
        private List<Inventory> inventoryList;
        private List<Inventory> lowStockList;
    }

    @Data
    public static class ProjectSummaryReport {
        private Long totalProjects;
        private Map<Project.ProjectStatus, Long> statusCounts;
        private List<Project> projects;
    }

    @Data
    public static class TransactionHistoryReport {
        private Long totalTransactions;
        private Long inTransactions;
        private Long outTransactions;
        private Integer totalInQuantity;
        private Integer totalOutQuantity;
        private List<InventoryTransaction> transactions;
    }
}
