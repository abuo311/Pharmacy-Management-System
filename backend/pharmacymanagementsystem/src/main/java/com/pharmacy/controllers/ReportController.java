package com.pharmacy.controllers;

import com.pharmacy.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*") 
public class ReportController {

    private final DashboardService dashboardService;

    @Autowired
    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Period should be in "YYYY-MM" format
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getBranchSummary(
            @RequestParam(name = "branchId") Long branchId, 
            @RequestParam(name = "period") String period) {
        
        try {
            // dashboardService.getBranchMetrics should return a Map or Object containing:
            // totalRevenue, totalCost, netProfit, branchBreakdown, topCategories
            Object summary = dashboardService.getBranchMetrics(branchId, period);
            
            if (summary == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No report data found for this period."));
            }
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error generating report: " + e.getMessage()));
        }
    }
}