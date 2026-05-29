 package com.pharmacy.dto;
 import lombok.Builder;
 import lombok.Data;    
import java.util.List;  
@Data
@Builder
public class ReportSummaryDTO {
    private Double totalRevenue;
    private Double totalCost;
    private Double netProfit;
    private List<BranchSalesDTO> branchBreakdown;
    private List<String> topCategories;
}

