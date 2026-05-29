package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Inside com.pharmacy.models.OrderItem
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference // ✅ Jackson will STOP here and NOT go back to the Order
    private Order order;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    // Automatically calculate subtotal before saving
    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}