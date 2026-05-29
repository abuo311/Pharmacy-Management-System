package com.pharmacy.services;

import com.pharmacy.models.Prescription;
import com.pharmacy.models.User;
import com.pharmacy.repositories.PrescriptionRepository;
import com.pharmacy.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository repository;
    private final UserRepository userRepository;

    public PrescriptionService(PrescriptionRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (prescription.getBranch() == null || prescription.getBranch().getId() == null) {
            prescription.setBranch(currentUser.getBranch());
        }

        // Logic: Set Local ID per Branch (e.g., #1, #2)
        Long currentMax = repository.findMaxLocalIdByBranch(prescription.getBranch().getId());
        prescription.setBranchLocalId(currentMax == null ? 1L : currentMax + 1);

        prescription.setIssueDate(LocalDate.now());
        prescription.setCreatedBy(currentUser);
        if (prescription.getStatus() == null) prescription.setStatus("Pending");

        return repository.save(prescription);
    }

    // 🔥 NEW: Update logic for the Edit button
    @Transactional
    public Prescription updatePrescription(Long id, Prescription details) {
        Prescription existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        // Update only the fields that should be editable
        existing.setPatientName(details.getPatientName());
        existing.setDoctorName(details.getDoctorName());
        existing.setDiagnosis(details.getDiagnosis());
        existing.setStatus(details.getStatus());
        
        // We do NOT update branchLocalId or Branch here to keep history consistent
        
        return repository.save(existing);
    }

    // 🔥 NEW: Delete logic for the Delete button
    @Transactional
    public void deletePrescription(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete: Prescription not found");
        }
        repository.deleteById(id);
    }

    public List<Prescription> getByBranch(Long branchId) {
        return repository.findByBranchId(branchId);
    }
}