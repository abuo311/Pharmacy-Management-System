package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- BRANCH SCOPING ---
    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private String companyName;

    private String contactPerson;

    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String category;

    @Column(name = "supplier_type")
    private String supplierType;

    @Builder.Default
    @Column(nullable = false)
    private String status = "Active";

    private LocalDateTime createdAt;

    // ✅ ADDED: This allows the Service to set counts dynamically per branch
    @Transient
    private long productCount;

    // ✅ ADDED: Helper for Service/Controller if they use .getName()
    public String getName() {
        return this.companyName;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "Active";
        }
        if (this.supplierType == null) {
            this.supplierType = "DISTRIBUTOR";
        }
    }
}