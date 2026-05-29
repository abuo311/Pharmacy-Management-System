package com.pharmacy.controllers;

import com.pharmacy.models.PharmacySetting;
import com.pharmacy.services.PharmacySettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/pharmacy")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows your React frontend to communicate without CORS issues
public class PharmacySettingController {

    private final PharmacySettingService settingsService;

    /**
     * Fetch global branding configuration details
     * GET /api/settings/pharmacy
     */
    @GetMapping
    public ResponseEntity<PharmacySetting> getPharmacyDetails() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    /**
     * Update global branding profile configurations
     * PUT /api/settings/pharmacy
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> savePharmacyDetails(@Valid @RequestBody PharmacySetting settings) {
        try {
            PharmacySetting updated = settingsService.updateSettings(settings);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            // Safe fallback trace print to diagnose underlying issues if validation or LOB
            // limits trip
            System.err.println("CRITICAL: Error committing store identity adjustments");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to update settings: " + e.getMessage());
        }
    }
}