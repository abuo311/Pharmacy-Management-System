package com.pharmacy.services;

import com.pharmacy.models.Medicine;
import com.pharmacy.models.Category;
import com.pharmacy.models.Branch;
import com.pharmacy.repositories.MedicineRepository;
import com.pharmacy.repositories.SupplierRepository;
import com.pharmacy.repositories.CategoryRepository;
import com.pharmacy.repositories.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final BranchRepository branchRepository;
    private final SupplierRepository supplierRepository;

    /**
     * Fetch all active medicines strictly for the specific branch.
     */
    public List<Medicine> getAllByBranch(Long branchId) {
        return medicineRepository.findByBranch_IdAndActiveTrue(branchId);
    }

    /**
     * Save a new medicine and force-link it to the specified branch.
     */
    @Transactional
    public Medicine save(Medicine medicine, Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch context not found."));

        medicine.setBranch(branch);

        // Map Category if ID is provided
        if (medicine.getCategory() == null && medicine.getCategoryId() != null) {
            categoryRepository.findById(medicine.getCategoryId())
                    .ifPresent(medicine::setCategory);
        }

        // Map Supplier if ID is provided
        if (medicine.getSupplier() == null && medicine.getSupplierId() != null) {
            supplierRepository.findById(medicine.getSupplierId())
                    .ifPresent(medicine::setSupplier);
        }

        medicine.setActive(true);
        return medicineRepository.save(medicine);
    }

    /**
     * Import multiple medicines assigned to the current branch.
     */
    @Transactional
    public List<Medicine> saveAll(List<Medicine> medicines, Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found for import context: " + branchId));

        List<Medicine> validMedicines = medicines.stream()
                // Prevent duplicate names within the same branch
                .filter(med -> !medicineRepository.existsByNameIgnoreCaseAndBranch_Id(med.getName(), branchId))
                .map(med -> {
                    med.setBranch(branch);
                    med.setActive(true);

                    if (med.getStockLevel() == null)
                        med.setStockLevel(0);
                    if (med.getSellingPrice() == null)
                        med.setSellingPrice(med.getPrice());

                    if (med.getCategory() != null && med.getCategory().getId() != null) {
                        Long categoryId = med.getCategory().getId();
                        if (categoryId != null) {
                            categoryRepository.findById(categoryId)
                                    .ifPresent(med::setCategory);
                        }
                    }
                    return med;
                })
                .collect(Collectors.toList());

        return medicineRepository.saveAll(validMedicines);
    }

    /**
     * Update medicine details with strict branch ownership validation.
     */
    @Transactional
    public Medicine update(Long id, Medicine details, Long branchId) {
        Medicine medicine = medicineRepository.findById(id)
                .filter(m -> Objects.equals(m.getBranch().getId(), branchId))
                .orElseThrow(() -> new RuntimeException("Access Denied: Medicine does not belong to your branch."));

        medicine.setName(details.getName());
        medicine.setManufacturer(details.getManufacturer());
        medicine.setPrice(details.getPrice());
        medicine.setSellingPrice(details.getSellingPrice());
        medicine.setStockLevel(details.getStockLevel() != null ? details.getStockLevel() : 0);
        medicine.setMinAlertLevel(details.getMinAlertLevel());
        medicine.setExpiryDate(details.getExpiryDate());
        medicine.setShelfLocation(details.getShelfLocation());
        medicine.setPrescriptionRequired(details.isPrescriptionRequired());
        medicine.setActive(details.isActive());

        // --- CATEGORY UPDATE ---
        if (details.getCategory() != null && details.getCategory().getId() != null) {
            Category category = categoryRepository.findById(details.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Selected Category not found"));
            medicine.setCategory(category);
        } else {
            medicine.setCategory(null);
        }

        // --- FIX: ADD SUPPLIER UPDATE (This was missing!) ---
        if (details.getSupplier() != null && details.getSupplier().getId() != null) {
            supplierRepository.findById(details.getSupplier().getId())
                    .ifPresentOrElse(
                            medicine::setSupplier,
                            () -> {
                                throw new RuntimeException("Selected Supplier not found");
                            });
        } else if (details.getSupplierId() != null) {
            // Fallback for flat ID if sent
            supplierRepository.findById(details.getSupplierId())
                    .ifPresent(medicine::setSupplier);
        } else {
            medicine.setSupplier(null);
        }

        return medicineRepository.saveAndFlush(medicine);
    }

    /**
     * Get branch-specific low stock alerts.
     */
    public List<Medicine> getLowStockByBranch(Long branchId) {
        return medicineRepository.findLowStockMedicinesByBranch(branchId);
    }

    /**
     * Soft delete: Only allowed if the medicine belongs to the requester's branch.
     */
    @Transactional
    public void delete(Long id, Long branchId) {
        Medicine medicine = medicineRepository.findById(id)
                .filter(m -> Objects.equals(m.getBranch().getId(), branchId))
                .orElseThrow(() -> new RuntimeException("Delete Denied: Medicine not found in your branch context."));

        medicine.setActive(false);
        medicineRepository.save(medicine);

        log.info("Soft-deleted Medicine ID: {} for Branch: {}", id, branchId);
    }

    /**
     * Update stock levels (Inventory adjustment) with branch validation.
     */
    @Transactional
    public Medicine updateStock(Long id, Integer quantity, Long branchId) {
        Medicine medicine = medicineRepository.findById(id)
                .filter(m -> Objects.equals(m.getBranch().getId(), branchId))
                .orElseThrow(() -> new RuntimeException("Stock Update Denied: Medicine belongs to another branch."));

        int currentStock = medicine.getStockLevel() != null ? medicine.getStockLevel() : 0;
        medicine.setStockLevel(currentStock + quantity);
        return medicineRepository.saveAndFlush(medicine);
    }
}