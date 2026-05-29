package com.pharmacy.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // ✅ CHANGE THIS
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch assignedBranch;

    // ✅ HELPER: This fixes the "getBranchId() is undefined" error
    // It safely navigates the relationship to return the ID
    public Long getBranchId() {
        return assignedBranch != null ? assignedBranch.getId() : null;
    }

    // ✅ HELPER: Allows setting branch by ID if needed during updates
    public void setBranchId(Long branchId) {
        if (branchId == null) {
            this.assignedBranch = null;
        } else {
            // We create a "proxy" branch object with just the ID
            // to satisfy the relationship without a full DB look-up
            Branch branch = new Branch();
            branch.setId(branchId);
            this.assignedBranch = branch;
        }
    }

    @Builder.Default
    private String status = "ACTIVE";

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    public Branch getBranch() {
        return this.assignedBranch;
    }
}