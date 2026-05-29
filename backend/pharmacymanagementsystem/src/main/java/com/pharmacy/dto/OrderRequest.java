package com.pharmacy.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Long supplierId;
    private Long branchId;
    private Double totalAmount;
    private List<OrderItemRequest> items; // ✅ This must be the specific class below

    @Data
    public static class OrderItemRequest {
        private Long medicineId;
        private Integer quantity;
        private Double unitPrice;
    }
}