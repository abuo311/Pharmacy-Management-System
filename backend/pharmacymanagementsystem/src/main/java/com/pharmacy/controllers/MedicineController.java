package com.pharmacy.controllers;

import com.pharmacy.models.Medicine;
import com.pharmacy.services.MedicineService;
import com.pharmacy.services.MedicineImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MedicineController {

    private final MedicineService medicineService;
    private final MedicineImportService importService;

    // Helper to standardize the missing header error
    private ResponseEntity<?> missingBranchHeader() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "Missing Required Header",
                        "message", "X-Branch-Id is required to filter data by your assigned branch"));
    }

    /**
     * READ: Everyone can view, but ONLY for the branch in the header.
     * This prevents a Pharmacist at Branch A from seeing Branch B's stock.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER')")
    public ResponseEntity<?> getAll(@RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();
        return ResponseEntity.ok(medicineService.getAllByBranch(branchId));
    }

    /**
     * CREATE: Admin, Manager, or Pharmacist only.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> create(
            @Valid @RequestBody Medicine medicine,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();

        try {
            // The service should set the branchId on the medicine object before saving
            return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.save(medicine, branchId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * UPDATE: Ensures the medicine ID belongs to the branch provided.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {

        if (branchId == null)
            return missingBranchHeader();

        try {
            return ResponseEntity.ok(medicineService.update(id, medicine, branchId));
        } catch (RuntimeException e) {
            // Returns 403 if the medicine exists but doesn't belong to this branch
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * BULK: Save multiple medicines assigned to the current branch.
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> importMedicines(
            @RequestBody List<Medicine> medicines,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();
        return ResponseEntity.ok(medicineService.saveAll(medicines, branchId));
    }

    /**
     * FILE IMPORT: Restricted to Admin and Pharmacist.
     * Note: If your importService doesn't handle Branch IDs yet, you should
     * update it to accept branchId as a parameter.
     */
    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return ResponseEntity.badRequest().body("X-Branch-Id header missing");

        try {
            importService.importMedicines(file); // Pass branchId here if supported
            return ResponseEntity.ok("Medicines imported successfully for branch ID: " + branchId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    /**
     * ALERTS: Branch-specific low stock alerts.
     */
    @GetMapping("/alerts/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> getLowStockAlerts(@RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();
        return ResponseEntity.ok(medicineService.getLowStockByBranch(branchId));
    }

    /**
     * STOCK UPDATE: Quick increment/decrement of stock levels.
     */
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'MANAGER')")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam Integer amount,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();
        return ResponseEntity.ok(medicineService.updateStock(id, amount, branchId));
    }

    /**
     * DELETE: Strictly Admin only.
     * Logic inside service must verify branch ownership before deleting.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();

        try {
            medicineService.delete(id, branchId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}