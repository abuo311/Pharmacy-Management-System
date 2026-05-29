package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; 

    private String phone; 

    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    // --- NEW: BRANCH RELATIONSHIP ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Branch branch;
    // --------------------------------

    @Builder.Default
    @Column(name = "loyalty_points", nullable = false)
    private Integer loyaltyPoints = 0;

    @Builder.Default
    @Column(name = "debt_balance", precision = 10, scale = 2, nullable = false)
    private BigDecimal debtBalance = BigDecimal.ZERO; 

    @Builder.Default
    @Column(name = "is_registered", nullable = false)
    private boolean isRegistered = false; 

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.debtBalance == null) this.debtBalance = BigDecimal.ZERO;
        if (this.loyaltyPoints == null) this.loyaltyPoints = 0;
    }

    public void adjustDebt(BigDecimal amount) {
        if (this.debtBalance == null) this.debtBalance = BigDecimal.ZERO;
        this.debtBalance = this.debtBalance.add(amount);
    }

    public void addPoints(Integer points) {
        if (this.loyaltyPoints == null) this.loyaltyPoints = 0;
        this.loyaltyPoints += points;
    }
}