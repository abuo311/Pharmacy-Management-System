package com.pharmacy.repositories;

import com.pharmacy.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    // ✅ Fix: Use BranchId (matches your entity field name)
    List<Supplier> findByBranchId(Long branchId);

    Optional<Supplier> findByCompanyName(String companyName);

    // ✅ Fix: Use BranchId
    List<Supplier> findByBranchIdAndStatus(Long branchId, String status);

    // ✅ Fix: Use BranchId
    List<Supplier> findByBranchIdAndCategory(Long branchId, String category);

    // ✅ Fix: Use BranchId
    List<Supplier> findByBranchIdAndSupplierType(Long branchId, String supplierType);

    // ✅ Fix: Use BranchId
    List<Supplier> findByBranchIdAndCompanyNameContainingIgnoreCase(Long branchId, String companyName);

    // ✅ Fix: Use BranchId
    List<Supplier> findByBranchIdAndCompanyNameContainingIgnoreCaseOrSupplierTypeContainingIgnoreCase(Long branchId, String name, String type);
}