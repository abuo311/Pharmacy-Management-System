package com.pharmacy.controllers;

import com.pharmacy.models.Order;
import com.pharmacy.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;

    /**
     * READ: Fetch all DELIVERED orders containing a specific medicine for a branch.
     * This is used by the Stock History Ledger to show procurement history.
     */
    @GetMapping("/medicine/{medicineId}/delivered")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> getDeliveredOrdersByMedicine(
            @PathVariable Long medicineId,
            @RequestParam Long branchId) {

        try {
            List<Order> orders = orderService.getDeliveredOrdersByMedicineAndBranch(medicineId, branchId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch order history", "message", e.getMessage()));
        }
    }

    /**
     * READ: Get all orders for a specific branch (General list)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST')")
    public ResponseEntity<?> getBranchOrders(@RequestHeader("X-Branch-Id") Long branchId) {
        return ResponseEntity.ok(orderService.getOrdersByBranch(branchId));
    }
}