package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryRequest {

    @NotBlank(message = "품목 코드는 필수입니다")
    private String itemCode;

    @NotBlank(message = "품목명은 필수입니다")
    private String itemName;

    private String category;

    @NotBlank(message = "단위는 필수입니다")
    private String unit;

    @NotNull(message = "현재 재고는 필수입니다")
    private Integer currentStock;

    private Integer minStock = 0;

    private BigDecimal unitPrice;

    private String location;
}
