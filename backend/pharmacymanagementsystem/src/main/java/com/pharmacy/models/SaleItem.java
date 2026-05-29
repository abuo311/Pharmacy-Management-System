package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_items")
@Getter // Use explicit getters
@Setter // Use explicit setters
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "sale") // EXCLUDE to stop infinite loop
@EqualsAndHashCode(exclude = "sale") // EXCLUDE to stop infinite loop
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    private Integer quantity;

    private BigDecimal priceAtSale; // Price locked at execution moment

    @ManyToOne
    @JoinColumn(name = "sale_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Sale sale;
}