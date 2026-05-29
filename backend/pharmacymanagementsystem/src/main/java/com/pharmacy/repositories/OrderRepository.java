package com.pharmacy.repositories;

import com.pharmacy.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ✅ ADD THIS METHOD to resolve the "undefined" error
    List<Order> findBySupplierIdAndBranchId(Long supplierId, Long branchId);

    // Fetches orders for a branch where the status is 'DELIVERED'
    // and the order contains the specific medicine ID in its items list.
    @Query("SELECT o FROM Order o JOIN o.items i " +
            "WHERE o.branch.id = :branchId " +
            "AND o.status = 'DELIVERED' " +
            "AND i.medicine.id = :medicineId")
    List<Order> findDeliveredOrdersByMedicineAndBranch(
            @Param("medicineId") Long medicineId,
            @Param("branchId") Long branchId);

    List<Order> findByBranchId(Long branchId);
}