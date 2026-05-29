package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Enumerated(EnumType.STRING)
    private AdjustmentType type; 

    @Column(nullable = false)
    private Integer quantity; 

    private String reason; 

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier; 

    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy; 

    // ✅ FIX: Changed from String to Long to match your Repository and Controller logic
    private Long branchId;

    @Builder.Default // ✅ FIX: Prevents the Lombok warning about ignoring default values
    private LocalDateTime adjustmentDate = LocalDateTime.now();

    @PrePersist
    protected void onAdjustment() {
        if (adjustmentDate == null) {
            adjustmentDate = LocalDateTime.now();
        }
    }
}