package com.pharmacy.repositories;

import com.pharmacy.models.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

        // --- FETCH ACTIVE INVENTORY ---
        // Strictly find active medicines for a specific branch
        List<Medicine> findByBranch_IdAndActiveTrue(Long branchId);

        // --- FIND ONE (SECURE) ---
        // Ensures that when fetching a single medicine for editing, it belongs to the
        // branch
        Optional<Medicine> findByIdAndBranch_Id(Long id, Long branchId);

        // --- STOCK MANAGEMENT ---
        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Transactional
        @Query("UPDATE Medicine m SET m.stockLevel = m.stockLevel + :quantity WHERE m.id = :medicineId AND m.branch.id = :branchId")
        void incrementStock(
                        @Param("medicineId") Long medicineId,
                        @Param("quantity") Integer quantity,
                        @Param("branchId") Long branchId);

        // --- SEARCH & FILTER ---
        List<Medicine> findByBranch_Id(Long branchId);

        List<Medicine> findByCategory_IdAndBranch_Id(Long categoryId, Long branchId);

        List<Medicine> findByNameContainingIgnoreCaseAndBranch_Id(String name, Long branchId);

        boolean existsByNameIgnoreCaseAndBranch_Id(String name, Long branchId);

        // Add this method inside your MedicineRepository interface
        List<Medicine> findByCategory_Id(Long categoryId);

        // Add this to MedicineRepository.java
        List<Medicine> findBySupplier_Id(Long supplierId);

        // --- ALERTS ---
        @Query("SELECT m FROM Medicine m WHERE m.branch.id = :branchId AND m.active = true AND m.stockLevel <= m.minAlertLevel")
        List<Medicine> findLowStockMedicinesByBranch(@Param("branchId") Long branchId);

        @Query("SELECT COUNT(m) FROM Medicine m WHERE m.branch.id = :branchId AND m.active = true AND m.expiryDate < :today")
        Long countExpiredByBranch(@Param("branchId") Long branchId, @Param("today") LocalDate today);

        // --- BULK UPDATE ---
        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Transactional
        @Query("UPDATE Medicine m SET " +
                        "m.name = :name, " +
                        "m.price = :price, " + // This maps to supplyPrice in your React payload
                        "m.sellingPrice = :sellingPrice, " +
                        "m.stockLevel = :stock, " +
                        "m.manufacturer = :man, " +
                        "m.expiryDate = :expiry, " +
                        "m.shelfLocation = :shelf, " +
                        "m.prescriptionRequired = :req, " +
                        "m.minAlertLevel = :minAlert, " +
                        "m.category.id = :catId, " + // Direct ID assignment is safer in JPQL
                        "m.supplier.id = :supId " + // Direct ID assignment
                        "WHERE m.id = :id AND m.branch.id = :branchId")
        void updateMedicineManually(
                        @Param("id") Long id,
                        @Param("branchId") Long branchId,
                        @Param("name") String name,
                        @Param("price") BigDecimal price,
                        @Param("sellingPrice") BigDecimal sellingPrice,
                        @Param("stock") Integer stock,
                        @Param("man") String man,
                        @Param("expiry") LocalDate expiry,
                        @Param("shelf") String shelf,
                        @Param("req") boolean req,
                        @Param("minAlert") Integer minAlert,
                        @Param("catId") Long catId,
                        @Param("supId") Long supId);

        // --- CROSS-BRANCH QUERIES (ADMIN ONLY USE CASE) ---
        @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.stockLevel <= m.minAlertLevel")
        List<Medicine> findAllLowStockAcrossAllBranches();

        // Branch specific supplier filtering
        List<Medicine> findBySupplier_IdAndBranch_Id(Long supplierId, Long branchId);
}