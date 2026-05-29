package com.pharmacy.controllers;

import com.pharmacy.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardContentController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardContentController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @RequestParam Long branchId, 
            @RequestParam(defaultValue = "2026-04") String period) {
        
        Map<String, Object> data = dashboardService.getBranchMetrics(branchId, period);
        return ResponseEntity.ok(data);
    }
}