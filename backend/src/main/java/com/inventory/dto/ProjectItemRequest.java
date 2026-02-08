package com.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectItemRequest {

    @NotNull(message = "재고 ID는 필수입니다")
    private Long inventoryId;

    @NotNull(message = "필요 수량은 필수입니다")
    private Integer requiredQuantity;

    private Integer allocatedQuantity = 0;

    private String notes;
}
