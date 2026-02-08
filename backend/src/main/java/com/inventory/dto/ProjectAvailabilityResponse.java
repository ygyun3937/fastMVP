package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAvailabilityResponse {

    private Long projectId;
    private String projectName;
    private boolean allItemsAvailable;
    private List<ItemAvailability> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemAvailability {
        private Long itemId;
        private String itemCode;
        private String itemName;
        private Integer requiredQuantity;
        private Integer availableStock;
        private Integer shortfall;
        private boolean isAvailable;
    }
}
