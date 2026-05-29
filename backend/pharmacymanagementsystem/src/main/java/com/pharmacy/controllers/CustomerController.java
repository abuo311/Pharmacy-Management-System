package com.pharmacy.controllers;

import com.pharmacy.models.Customer;
import com.pharmacy.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Fetches all customers belonging to the specific branch via HTTP header.
     */
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(@RequestHeader("X-Branch-Id") Long branchId) {
        return ResponseEntity.ok(customerService.getAllCustomersByBranch(branchId));
    }

    /**
     * Registers a new customer and assigns them to the active branch.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Customer customer,
            @RequestHeader("X-Branch-Id") Long branchId) {
        try {
            Customer newCustomer = customerService.registerCustomer(customer, branchId);
            return ResponseEntity.ok(newCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Retrieves a single customer profile, verifying branch ownership.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomer(
            @PathVariable Long id,
            @RequestHeader("X-Branch-Id") Long branchId) {
        return ResponseEntity.ok(customerService.getCustomerById(id, branchId));
    }

    /**
     * Processes a debt payment for a customer at the specific branch.
     */
    @PutMapping("/{id}/pay-debt")
    public ResponseEntity<Customer> payDebt(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestHeader("X-Branch-Id") Long branchId) {
        return ResponseEntity.ok(customerService.reduceDebt(id, amount, branchId));
    }

    /**
     * Manually adjusts loyalty points for a customer within the branch context.
     */
    @PutMapping("/{id}/adjust-points")
    public ResponseEntity<Customer> adjustPoints(
            @PathVariable Long id,
            @RequestParam Integer points,
            @RequestHeader("X-Branch-Id") Long branchId) {
        return ResponseEntity.ok(customerService.addLoyaltyPoints(id, points, branchId));
    }

    /**
     * Processes loyalty points deduction/redemption for a customer at the specific
     * branch.
     * Maps to your React front-end logic.
     */
    @PutMapping("/{id}/redeem-royalties")
    public ResponseEntity<Customer> redeemRoyalties(
            @PathVariable Long id,
            @RequestParam Integer points,
            @RequestHeader("X-Branch-Id") Long branchId) {
        // Passing a negative value to your points adjustment engine to deduct balances
        // securely
        return ResponseEntity.ok(customerService.addLoyaltyPoints(id, -points, branchId));
    }
}