package com.pharmacy.services;

import com.pharmacy.models.Medicine;
import com.pharmacy.models.StockAdjustment;
import com.pharmacy.repositories.MedicineRepository;
import com.pharmacy.repositories.StockAdjustmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final MedicineRepository medicineRepository;

    @Transactional
    public StockAdjustment processAdjustment(StockAdjustment adjustment) {
        // 1. Fetch the medicine
        Medicine medicine = medicineRepository.findById(adjustment.getMedicine().getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        // 2. Calculate new stock level
        int newStock = medicine.getStockLevel() + adjustment.getQuantity();
        
        if (newStock < 0) {
            throw new IllegalArgumentException("Operation failed: Stock cannot be negative.");
        }

        // 3. Update Medicine stock
        medicine.setStockLevel(newStock);
        medicineRepository.save(medicine);

        // 4. Save the adjustment record
        return adjustmentRepository.save(adjustment);
    }

    /**
     * ✅ FIXED: Properly calling the repository methods
     */
    public List<StockAdjustment> getHistory(Long medicineId, Long branchId) {
        if (branchId != null) {
            // Call the repository method for branch-specific history
            return adjustmentRepository.findByMedicineIdAndBranchIdOrderByAdjustmentDateDesc(medicineId, branchId);
        }
        // Fallback to general history
        return adjustmentRepository.findByMedicineIdOrderByAdjustmentDateDesc(medicineId);
    }

    // Keep this for backward compatibility
    public List<StockAdjustment> getHistoryByMedicineId(Long medicineId) {
        return adjustmentRepository.findByMedicineIdOrderByAdjustmentDateDesc(medicineId);
    }
}