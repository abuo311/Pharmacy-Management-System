package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.*;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // ✅ FIXED
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Transient
    private Long categoryId;

    @Column(name = "selling_price")
    @JsonProperty("sellingPrice")
    private BigDecimal sellingPrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "productCount" })
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Branch branch;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Supplier supplier;

    private String manufacturer;

    @Column(name = "min_alert_level")
    private Integer minAlertLevel;

    @Column(name = "stock_level", nullable = false)
    private Integer stockLevel;

    // ✅ Good (keep this)
    @Column(nullable = false, precision = 10, scale = 2)
    @JsonProperty("supplyPrice")
    private BigDecimal price;

    @Column(name = "expiry_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expiryDate;

    @Column(name = "shelf_location")
    private String shelfLocation;

    // ✅ Already correct
    @Builder.Default
    @Column(name = "prescription_required")
    private boolean prescriptionRequired = false;

    // ✅ Safe computed field
    @Transient
    public boolean isLowStock() {
        return minAlertLevel != null && stockLevel != null && stockLevel <= minAlertLevel;
    }

    // ✅ Transient IDs for frontend
    @Transient
    private Long supplierId;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
}