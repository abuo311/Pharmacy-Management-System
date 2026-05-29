package com.pharmacy.controllers;

import com.pharmacy.models.StockAdjustment;
import com.pharmacy.services.StockAdjustmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-adjustments")
@RequiredArgsConstructor // ✅ Best practice: Generates constructor for all final fields
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") 
public class StockAdjustmentController {

    // ✅ Use a single, final service reference
    private final StockAdjustmentService adjustmentService;

    @PostMapping
    public ResponseEntity<?> createAdjustment(@RequestBody StockAdjustment adjustment) {
        try {
            // Updates history and medicine stock level in one transaction
            StockAdjustment saved = adjustmentService.processAdjustment(adjustment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ✅ Unified Ledger Endpoint
     * This handles the request from your StockHistoryModal.jsx
     * URL: GET /api/stock-adjustments/medicine/{medicineId}
     */
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<StockAdjustment>> getLedger(
            @PathVariable Long medicineId,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        
        // Use the branchId from the header if provided, otherwise fallback to a default or general search
        List<StockAdjustment> ledger = adjustmentService.getHistory(medicineId, branchId);
        return ResponseEntity.ok(ledger);
    }
}