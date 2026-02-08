package com.inventory.dto;

import com.inventory.model.InventoryTransaction;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionRequest {

    @NotNull(message = "재고 ID는 필수입니다")
    private Long inventoryId;

    @NotNull(message = "거래 유형은 필수입니다")
    private InventoryTransaction.TransactionType transactionType;

    @NotNull(message = "수량은 필수입니다")
    private Integer quantity;

    private Long projectId;

    private String referenceNo;

    private LocalDateTime transactionDate;

    private String notes;

    private String createdBy;
}
