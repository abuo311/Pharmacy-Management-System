package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor
public class BranchSalesDTO {
    private String branchName;
    private Double amount;
    private Double percentage;
}
