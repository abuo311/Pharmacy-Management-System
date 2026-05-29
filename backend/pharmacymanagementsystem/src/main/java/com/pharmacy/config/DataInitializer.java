package com.pharmacy.config;

import com.pharmacy.models.*;
import com.pharmacy.repositories.BranchRepository;
import com.pharmacy.repositories.CustomerRepository;
import com.pharmacy.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking system default users...");

        // 1. Fetch a default branch to assign to users
        // If no branch exists, you might need to create one first
        Branch defaultBranch = branchRepository.findAll().stream().findFirst().orElse(null);

        // 2. Create Default Users with the assigned branch
        createDefaultUser("admin", "admin123", "System Administrator", Role.ADMIN, defaultBranch);
        createDefaultUser("pharmacist", "pharm123", "Head Pharmacist", Role.PHARMACIST, defaultBranch);
        createDefaultUser("cashier", "cash123", "Default Cashier", Role.CASHIER, defaultBranch);
        createDefaultUser("manager", "manage123", "Store Manager", Role.MANAGER, defaultBranch);

        // 3. Create Default Walk-in Customers for all branches
        createDefaultCustomersForAllBranches();
    }

    private void createDefaultUser(String username, String password, String fullName, Role role, Branch branch) {
        userRepository.findByUsername(username).ifPresentOrElse(
            existingUser -> {
                // 🔥 FIX: If the user exists but has NO branch, update it now
                if (existingUser.getBranch() == null && branch != null) {
                    existingUser.setAssignedBranch(branch);
                    userRepository.save(existingUser);
                    System.out.println(">>> Updated " + username + " with default branch: " + branch.getName());
                }
            },
            () -> {
                // Create new user if they don't exist
                User user = User.builder()
                        .name(fullName)
                        .username(username)
                        .password(passwordEncoder.encode(password))
                        .role(role)
                        .assignedBranch(branch) // 🔥 IMPORTANT: Linking the branch here
                        .status("ACTIVE")
                        .build();

                userRepository.save(user);
                System.out.println(">>> Created Default " + role + ": [" + username + "]");
            }
        );
    }

    private void createDefaultCustomersForAllBranches() {
        System.out.println("Verifying default customers for all branches...");
        branchRepository.findAll().forEach(branch -> {
            boolean exists = customerRepository.findByNameAndBranchId("Walk-in Customer", branch.getId()).isPresent();
            if (!exists) {
                Customer defaultCustomer = Customer.builder()
                        .name("Walk-in Customer")
                        .phone("0000000000")
                        .address("N/A")
                        .email("walkin@pharmacy.com")
                        .debtBalance(BigDecimal.ZERO)
                        .loyaltyPoints(0)
                        .isRegistered(false)
                        .createdAt(LocalDateTime.now())
                        .branch(branch)
                        .build();

                customerRepository.save(defaultCustomer);
                System.out.println(">>> Created Walk-in Customer for Branch: " + branch.getName());
            }
        });
    }
}