package com.pharmacy.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "pharmacy_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacySetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pharmacy name is required")
    @Column(nullable = false)
    private String pharmacyName;

    @Email(message = "Invalid email formatting")
    @NotBlank(message = "Contact email is required")
    private String contactEmail;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Address location is required")
    private String addressLocation;

    private String taxIdentificationNumber;
    private String currencySymbol;

    private String motto;

    @NotBlank(message = "Working days configuration is required")
    private String workingDays; // e.g., "Monday - Saturday"

    @NotBlank(message = "Working hours configuration is required")
    private String workingHours; // e.g., "8:00 AM - 10:00 PM"

    // Stores image data cleanly as a base64 dynamic string
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String logoData;
}