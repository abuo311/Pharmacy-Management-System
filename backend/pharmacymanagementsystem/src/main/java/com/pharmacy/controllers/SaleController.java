package com.pharmacy.controllers;

import com.pharmacy.models.Sale;
import com.pharmacy.services.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales(
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {

        // Safety Fallback: Default to main branch (1L) if header isn't passed cleanly
        Long effectiveBranchId = (branchId != null) ? branchId : 1L;

        System.out.println("[Minamo Audit] Fetching sales ledger history for Branch ID: " + effectiveBranchId);
        List<Sale> sales = saleService.getAllSalesByBranch(effectiveBranchId);
        return ResponseEntity.ok(sales);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody Sale sale,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        try {
            Long effectiveBranchId = (branchId != null) ? branchId : 1L;
            System.out.println("[Minamo Processing] Initializing safe checkout for Branch ID: " + effectiveBranchId);

            Sale completedSale = saleService.processSale(sale, effectiveBranchId);
            return ResponseEntity.ok(completedSale);
        } catch (RuntimeException e) {
            System.err.println("[Checkout Error] Failed to process transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<?> refundSale(
            @PathVariable Long id,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        try {
            Long effectiveBranchId = (branchId != null) ? branchId : 1L;
            System.out.println("[Minamo Processing] Executing reverse stock authorization on Sale ID: " + id
                    + " for Branch: " + effectiveBranchId);

            Sale refundedSale = saleService.refundSale(id, effectiveBranchId);
            return ResponseEntity.ok(refundedSale);
        } catch (RuntimeException e) {
            System.err.println("[Refund Error] Reverse allocation failed on Node Identity: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}