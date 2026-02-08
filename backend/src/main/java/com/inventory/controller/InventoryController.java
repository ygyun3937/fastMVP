package com.inventory.controller;

import com.inventory.dto.InventoryRequest;
import com.inventory.model.Inventory;
import com.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "재고 관리", description = "재고 CRUD 및 검색 API")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "재고 목록 조회", description = "전체 재고 목록을 조회합니다")
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    @Operation(summary = "재고 상세 조회", description = "ID로 특정 재고를 조회합니다")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/code/{itemCode}")
    public ResponseEntity<Inventory> getInventoryByCode(@PathVariable String itemCode) {
        return ResponseEntity.ok(inventoryService.getInventoryByItemCode(itemCode));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Inventory>> getInventoryByCategory(@PathVariable String category) {
        return ResponseEntity.ok(inventoryService.getInventoryByCategory(category));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "재고 부족 품목 조회", description = "최소 재고 미달 품목 목록을 조회합니다")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/search")
    @Operation(summary = "재고 검색", description = "품목코드 또는 품목명으로 재고를 검색합니다")
    public ResponseEntity<List<Inventory>> searchInventory(@RequestParam String keyword) {
        return ResponseEntity.ok(inventoryService.searchInventory(keyword));
    }

    @PostMapping
    @Operation(summary = "재고 등록", description = "새로운 재고를 등록합니다")
    public ResponseEntity<Inventory> createInventory(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryService.createInventory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "재고 수정", description = "기존 재고 정보를 수정합니다")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "재고 삭제", description = "재고를 삭제합니다")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }
}
