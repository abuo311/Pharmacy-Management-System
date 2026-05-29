package com.pharmacy.controllers;

import com.pharmacy.dto.OrderRequest;
import com.pharmacy.models.Supplier;
import com.pharmacy.models.Order;
import com.pharmacy.services.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {
    private final SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public List<Supplier> getAll(@RequestHeader("X-Branch-Id") Long branchId) {
        return supplierService.getSuppliersByBranch(branchId);
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<List<Supplier>> getByRole(
            @RequestHeader("X-Branch-Id") Long branchId,
            @RequestParam String role) {
        return ResponseEntity.ok(supplierService.getSuppliersByRole(branchId, role));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Supplier> create(
            @RequestHeader("X-Branch-Id") Long branchId,
            @RequestBody Supplier supplier) {
        supplier.setBranchId(branchId);
        return ResponseEntity.ok(supplierService.saveSupplier(supplier));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request,
            @RequestHeader("X-Branch-Id") Long branchId // Or however you retrieve the ID
    ) {
        // Pass both arguments now
        return ResponseEntity.ok(supplierService.createProcurementOrder(request, branchId));
    }

    @GetMapping("/{id}/catalog")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> getCatalog(
            @PathVariable Long id,
            @RequestHeader("X-Branch-Id") Long branchId) { // Changed from @RequestParam to @RequestHeader
        return ResponseEntity.ok(supplierService.getSupplierProducts(id, branchId));
    }

    @GetMapping("/{id}/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> getOrders(
            @PathVariable Long id,
            @RequestHeader("X-Branch-Id") Long branchId) { // Apply the same fix here for consistency
        return ResponseEntity.ok(supplierService.getOrdersBySupplierAndBranch(id, branchId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<Supplier> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PutMapping("/orders/{orderId}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Order> receiveOrder(@PathVariable Long orderId) {
        Order updatedOrder = supplierService.receiveOrder(orderId);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Supplier> update(
            @PathVariable Long id,
            @RequestBody Supplier supplierDetails) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, supplierDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}