package com.pharmacy.repositories;

import com.pharmacy.models.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByBranchId(Long branchId);

    // Get the highest local ID currently assigned to a branch
    @Query("SELECT MAX(p.branchLocalId) FROM Prescription p WHERE p.branch.id = :branchId")
    Long findMaxLocalIdByBranch(@Param("branchId") Long branchId);
}