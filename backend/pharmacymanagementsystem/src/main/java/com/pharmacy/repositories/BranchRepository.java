package com.pharmacy.repositories;

import com.pharmacy.models.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByActiveTrue(); // Use this for dropdowns in the UI
    Optional<Branch> findByName(String name);
}