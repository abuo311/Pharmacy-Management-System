package com.pharmacy.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String color; // Stores Tailwind classes: "bg-blue-100 text-blue-600"

    // This field can be calculated dynamically,
    // but we can store it for performance if needed.
    @OneToMany(mappedBy = "category")
    @JsonIgnore // 👈 Add this to stop the infinite loop in logs
    private List<Medicine> medicines;
    @Transient
    private long productCount;
}