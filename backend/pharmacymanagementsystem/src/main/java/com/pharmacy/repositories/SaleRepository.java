package com.pharmacy.repositories;

import com.pharmacy.models.Branch;
import com.pharmacy.models.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

       // --- BRANCH & SEARCH QUERIES ---
       List<Sale> findByBranchId(Long branchId);

       Optional<Sale> findByIdAndBranchId(Long id, Long branchId);

       List<Sale> findByBranch(Branch branch);

       List<Sale> findByTransactionId(String transactionId);

       List<Sale> findBySoldById(Long userId);

       List<Sale> findByCustomerId(Long customerId);

       @Query("SELECT COALESCE(SUM(s.totalAmount), 0.0) FROM Sale s WHERE s.branch.id = :branchId")
       Double getRevenueByBranch(@Param("branchId") Long branchId);

       // --- REPORTING QUERIES (FIXED FOR PRICE/SELLINGPRICE) ---
       @Query("SELECT COALESCE(SUM(s.totalAmount), 0.0) FROM Sale s " +
                     "WHERE s.branch.id = :branchId " +
                     "AND FUNCTION('DATE_FORMAT', s.saleDate, '%Y-%m') = :period")
       Double findTotalRevenueByBranchAndPeriod(@Param("branchId") Long branchId,
                     @Param("period") String period);

       /**
        * Total Transactions: Counts the number of sales in the period.
        */
       @Query("SELECT COUNT(s) FROM Sale s " +
                     "WHERE s.branch.id = :branchId " +
                     "AND FUNCTION('DATE_FORMAT', s.saleDate, '%Y-%m') = :period")
       Long countOrdersByBranchAndPeriod(@Param("branchId") Long branchId, @Param("period") String period);

       @Query("SELECT COALESCE(SUM(si.quantity * m.price), 0.0) FROM SaleItem si " +
                     "JOIN si.sale s JOIN si.medicine m " +
                     "WHERE s.branch.id = :branchId " +
                     "AND FUNCTION('DATE_FORMAT', s.saleDate, '%Y-%m') = :period")
       Double findTotalCostByBranchAndPeriod(@Param("branchId") Long branchId,
                     @Param("period") String period);

       @Query("SELECT DISTINCT c.name FROM SaleItem si " +
                     "JOIN si.sale s JOIN si.medicine m JOIN m.category c " +
                     "WHERE s.branch.id = :branchId " +
                     "AND FUNCTION('DATE_FORMAT', s.saleDate, '%Y-%m') = :period")
       List<String> findTopCategoriesByBranch(@Param("branchId") Long branchId,
                     @Param("period") String period);
}