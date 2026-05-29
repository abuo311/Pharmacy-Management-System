package com.pharmacy.services.impl;

import com.pharmacy.models.User;
import com.pharmacy.repositories.UserRepository;
import com.pharmacy.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User createStaff(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + user.getUsername() + "' is already taken!");
        }

        // 🔥 Password encoding safety
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // 🔥 Normalize status
        if (user.getStatus() == null || user.getStatus().isBlank()) {
            user.setStatus("ACTIVE");
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> getStaffByBranch(Long branchId) {
        // Assuming your repository has findByBranchId or findByAssignedBranchId
        return userRepository.findByAssignedBranchId(branchId);
    }

    @Override
    public User getStaffById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id: " + id));
    }

    @Override
    @Transactional
    public User updateStaff(Long id, User userDetails) {
        User existingUser = getStaffById(id);
        return applyUserUpdates(existingUser, userDetails);
    }

    @Override
    @Transactional
    public User editStaffInBranch(Long staffId, User userDetails, Long branchId) {
        User existingUser = getStaffById(staffId);

        // 🔥 SECURITY CROSS-CHECK: Ensure staff belongs to the branch
        if (!existingUser.getBranchId().equals(branchId)) {
            throw new RuntimeException("Unauthorized: This staff member does not belong to your branch.");
        }

        return applyUserUpdates(existingUser, userDetails);
    }

    @Override
    @Transactional
    public void deleteStaff(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Staff member not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteStaffFromBranch(Long staffId, Long branchId) {
        User user = getStaffById(staffId);

        // 🔥 SECURITY CROSS-CHECK
        if (!user.getBranchId().equals(branchId)) {
            throw new RuntimeException("Unauthorized: Cannot delete staff from a different branch.");
        }

        userRepository.delete(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    /**
     * Internal helper to map updates from userDetails to existingUser
     */
    private User applyUserUpdates(User existingUser, User userDetails) {
        existingUser.setName(userDetails.getName());
        existingUser.setRole(userDetails.getRole());

        // Update branch assignment if provided
        if (userDetails.getBranchId() != null) {
            existingUser.setBranchId(userDetails.getBranchId());
        }

        if (userDetails.getStatus() != null && !userDetails.getStatus().isBlank()) {
            existingUser.setStatus(userDetails.getStatus().toUpperCase());
        }

        // Safe Username Update
        if (userDetails.getUsername() != null &&
                !existingUser.getUsername().equals(userDetails.getUsername())) {
            if (existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("Username already taken!");
            }
            existingUser.setUsername(userDetails.getUsername());
        }

        // Password Update Safety
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            if (!userDetails.getPassword().startsWith("$2a$")) {
                existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
        }

        return userRepository.save(existingUser);
    }
}