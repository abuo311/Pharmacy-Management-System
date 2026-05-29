package com.pharmacy.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pharmacy_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyProfile {
    @Id
    @Builder.Default
    private Long id = 1L; // Ensures only one profile exists

    private String name;
    private String motto;
    private String email;
    private String phone;
    private String hours;
    private String address;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String logo; // Stores Base64 string of the logo
}