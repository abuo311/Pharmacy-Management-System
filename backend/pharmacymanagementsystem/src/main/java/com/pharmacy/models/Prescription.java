package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String doctorName;

    private String diagnosis;

    // Inside Prescription.java
    private Long branchLocalId; // This will be 1, 2, 3... per branch

    private LocalDate issueDate;

    // 🔥 ADDED: Status field to track validation progress
    @Builder.Default
    private String status = "Pending";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Optional link to sale
    @OneToOne(mappedBy = "prescription")
    private Sale sale;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionItem> items;

    /**
     * Automatically set the date and default status before saving to DB
     */
    @PrePersist
    protected void onCreate() {
        if (this.issueDate == null) {
            this.issueDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = "Pending";
        }
    }
}