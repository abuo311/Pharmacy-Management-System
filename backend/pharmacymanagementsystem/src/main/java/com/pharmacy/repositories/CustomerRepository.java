package com.pharmacy.repositories;

import com.pharmacy.models.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Fetch all customers for a specific branch
    List<Customer> findByBranchId(Long branchId);

    // Search for a customer by phone within a specific branch
    Optional<Customer> findByPhoneAndBranchId(String phone, Long branchId);
    
    // Security check: Find customer only if they belong to this branch
    Optional<Customer> findByIdAndBranchId(Long id, Long branchId);

    // Used by DataInitializer to check for existing default customers
    Optional<Customer> findByNameAndBranchId(String name, Long branchId);
}