package com.pharmacy.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pharmacy.models.StockAdjustment;
import com.pharmacy.models.AdjustmentType;
import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    // Basic lookup
    List<StockAdjustment> findByMedicineId(Long medicineId);

    // Filter by adjustment type (RESTOCK, DAMAGE, etc.)
    List<StockAdjustment> findByType(AdjustmentType type);

    // General history for a medicine across all branches
   List<StockAdjustment> findByMedicineIdAndBranchIdOrderByAdjustmentDateDesc(Long medicineId, Long branchId);

    // Change "AndBranchId" to "AndBranch" if the field in your Model is named
    // 'branch'
    List<StockAdjustment> findByMedicineIdOrderByAdjustmentDateDesc(Long medicineId);
}