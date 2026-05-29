package com.pharmacy.services;

import com.pharmacy.models.User;
import java.util.List;

public interface UserService {

    /**
     * Saves a new staff member and explicitly links them to a branch.
     * The branch ID should be inside the User object or passed as a parameter.
     */
    User createStaff(User user);

    /**
     * Retrieves staff members ONLY for a specific branch.
     * This is the critical change for multi-branch isolation.
     */
    List<User> getStaffByBranch(Long branchId);

    /**
     * Finds a specific staff member.
     * Implementation should ensure the staff belongs to the requester's branch
     * context.
     */
    User getStaffById(Long id);

    /**
     * Updates staff details (The "Edit" method).
     * Validates that the user exists and maintains branch consistency.
     */
    User updateStaff(Long id, User userDetails);

    /**
     * Targeted update for when a branch manager edits a staff member.
     * Includes a branchId check to prevent cross-branch editing.
     */
    User editStaffInBranch(Long staffId, User userDetails, Long branchId);

    /**
     * Removes a staff member from the system (The "Delete" method).
     */
    void deleteStaff(Long id);

    /**
     * Secure delete method that ensures the staff belongs to the specified branch
     * before performing the deletion.
     */
    void deleteStaffFromBranch(Long staffId, Long branchId);

    /**
     * Checks if a username already exists within the system.
     */
    boolean existsByUsername(String username);
}