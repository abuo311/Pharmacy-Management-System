package com.pharmacy.repositories;

import com.pharmacy.models.User;
import com.pharmacy.models.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    /**
     * Finds users by the ID of the assignedBranch.
     * This matches the 'assignedBranch' field in your User model.
     * JPA interprets 'AssignedBranchId' as 'assignedBranch.id'.
     */
    List<User> findByAssignedBranchId(Long branchId);

    /**
     * Finds users by passing the full Branch object.
     */
    List<User> findByAssignedBranch(Branch assignedBranch);

    boolean existsByUsername(String username);
}