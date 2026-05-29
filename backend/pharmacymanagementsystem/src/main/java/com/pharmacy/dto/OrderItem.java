package com.pharmacy.dto;

import lombok.Data;

@Data
public class OrderItem {
    private Long medicineId;
    private Integer quantity;
    private Double unitPrice;
}