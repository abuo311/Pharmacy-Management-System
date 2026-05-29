package com.pharmacy.controllers;

import com.pharmacy.models.Prescription;
import com.pharmacy.services.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription")
public class PrescriptionController {

    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Prescription> create(@RequestBody Prescription prescription) {
        // Debug line to see what branch ID is coming from React
        System.out.println("Saving prescription for Branch ID: " + prescription.getBranch().getId());

        return ResponseEntity.ok(service.createPrescription(prescription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prescription> update(@PathVariable Long id, @RequestBody Prescription prescription) {
        return ResponseEntity.ok(service.updatePrescription(id, prescription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }

    // 🔥 FIXED: Remove the "/api/prescription" prefix here
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Prescription>> getByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(service.getByBranch(branchId));
    }
}