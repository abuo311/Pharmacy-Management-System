package com.pharmacy.services;

import com.pharmacy.models.*;
import com.pharmacy.repositories.SaleRepository;
import com.pharmacy.repositories.MedicineRepository;
import com.pharmacy.repositories.BranchRepository;
import com.pharmacy.repositories.CustomerRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;

    /**
     * Fetch all sales by branch
     */
    public List<Sale> getAllSalesByBranch(Long branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("Branch ID cannot be null");
        }
        return saleRepository.findByBranchId(branchId);
    }

    @Transactional
    public Sale processSale(Sale sale, Long branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("Branch ID cannot be null");
        }

        // ==============================
        // 1. FIND BRANCH
        // ==============================
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        sale.setBranch(branch);

        // ==============================
        // 2. GENERATE TRANSACTION ID
        // ==============================
        sale.setTransactionId(
                "TRX-" + UUID.randomUUID().toString()
                        .substring(0, 8)
                        .toUpperCase());

        if (sale.getStatus() == null) {
            sale.setStatus("COMPLETED");
        }

        // ==============================
        // 3. ATTACH CUSTOMER (Fixed Lambda Scope / Effectively Final Error)
        // ==============================
        if (sale.getCustomer() != null && sale.getCustomer().getId() != null) {
            final Long customerIdToFind = sale.getCustomer().getId(); // Declared final for lambda safety
            Customer customer = customerRepository.findById(customerIdToFind)
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerIdToFind));
            sale.setCustomer(customer);
        } else {
            sale.setCustomer(null); // Explicit fallback handling for walk-in accounts
        }

        // ==============================
        // 4. PROCESS ITEMS
        // ==============================
        for (SaleItem item : sale.getItems()) {
            if (item.getMedicine() != null && item.getMedicine().getId() != null) {
                final Long medId = item.getMedicine().getId(); // Final declaration for null type safety

                Medicine medicine = medicineRepository.findById(medId)
                        .filter(m -> m.getBranch() != null && branchId.equals(m.getBranch().getId()))
                        .orElseThrow(() -> new RuntimeException("Medicine not available in this branch: " + medId));

                if (medicine.getStockLevel() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for: " + medicine.getName());
                }

                // Reduce stock
                medicine.setStockLevel(medicine.getStockLevel() - item.getQuantity());
                medicineRepository.save(medicine);

                // Save price at sale
                item.setPriceAtSale(medicine.getSellingPrice());
            }

            // Link sale
            item.setSale(sale);
        }

        // ==============================
        // 5. LOYALTY / DEBT
        // ==============================
        if (sale.getCustomer() != null && sale.getCustomer().getId() != null) {
            final Long customerId = sale.getCustomer().getId();

            int pointsEarned = sale.getTotalAmount()
                    .divide(new BigDecimal("10"), 0, java.math.RoundingMode.DOWN)
                    .intValue();

            if (pointsEarned > 0) {
                customerService.addLoyaltyPoints(
                        customerId,
                        pointsEarned,
                        branchId);
            }

            if ("DEBT".equalsIgnoreCase(sale.getPaymentMethod())) {
                customerService.reduceDebt(
                        customerId,
                        sale.getTotalAmount().negate(),
                        branchId);
            }
        }

        // ==============================
        // 6. SAVE SALE
        // ==============================
        return saleRepository.save(sale);
    }

    @Transactional
    public Sale refundSale(Long saleId, Long branchId) {
        if (saleId == null || branchId == null) {
            throw new IllegalArgumentException("Sale ID and Branch ID cannot be null");
        }

        Sale sale = saleRepository.findById(saleId)
                .filter(s -> s.getBranch() != null && branchId.equals(s.getBranch().getId()))
                .orElseThrow(() -> new RuntimeException("Sale not found in this branch"));

        if ("REFUNDED".equals(sale.getStatus())) {
            throw new RuntimeException("Sale already refunded");
        }

        sale.setStatus("REFUNDED");

        // Restore stock
        for (SaleItem item : sale.getItems()) {
            if (item.getMedicine() != null && item.getMedicine().getId() != null) {
                Medicine medicine = medicineRepository.findById(item.getMedicine().getId())
                        .orElseThrow(() -> new RuntimeException("Medicine record missing"));

                medicine.setStockLevel(medicine.getStockLevel() + item.getQuantity());
                medicineRepository.save(medicine);
            }
        }

        // Reverse debt if debt sale
        if (sale.getCustomer() != null && sale.getCustomer().getId() != null &&
                "DEBT".equalsIgnoreCase(sale.getPaymentMethod())) {

            final Long customerId = sale.getCustomer().getId();
            customerService.reduceDebt(
                    customerId,
                    sale.getTotalAmount(),
                    branchId);
        }

        return saleRepository.save(sale);
    }
}