package com.pharmacy.controllers;

import com.pharmacy.models.User;
import com.pharmacy.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 🔥 ADMIN/MANAGER - Get staff for a specific branch
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getUsersByBranch(@RequestParam Long branchId) {
        // Now returns only staff belonging to the requested branch
        return ResponseEntity.ok(userService.getStaffByBranch(branchId));
    }

    // 🔥 ADMIN ONLY - Create user (linked to branch via User object)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createStaff(user));
    }

    // 🔥 ADMIN ONLY - Full Update (Edit User)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> editUser(
            @PathVariable Long id,
            @RequestParam Long branchId,
            @RequestBody User userDetails) {
        // Uses the branch-aware edit method to ensure security
        return ResponseEntity.ok(userService.editStaffInBranch(id, userDetails, branchId));
    }

    // 🔥 ADMIN ONLY - Update status (Partial Update)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody String status) {

        User existing = userService.getStaffById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        existing.setStatus(status);
        userService.updateStaff(id, existing); // Regular update

        return ResponseEntity.ok().body("Status updated successfully");
    }

    // 🔥 ADMIN ONLY - Delete user from specific branch
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam Long branchId) {
        // Uses branch-secure deletion to prevent cross-branch unauthorized deletes
        userService.deleteStaffFromBranch(id, branchId);
        return ResponseEntity.ok().body("User deleted successfully from branch");
    }
}