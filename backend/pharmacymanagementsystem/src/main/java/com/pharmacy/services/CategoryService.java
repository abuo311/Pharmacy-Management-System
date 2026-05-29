package com.pharmacy.services;

import com.pharmacy.models.Category;
import com.pharmacy.repositories.CategoryRepository;
import com.pharmacy.repositories.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    /**
     * Fetches all categories but calculates product counts
     * ONLY for the medicines belonging to the specific branch.
     */
    public List<Category> getAllCategories(Long branchId) {
        return categoryRepository.findAll().stream().map(category -> {
            // ✅ Updated: Filters medicines by BOTH Category and Branch
            long count = medicineRepository.findByCategory_IdAndBranch_Id(category.getId(), branchId)
                    .stream()
                    .filter(m -> m.isActive())
                    .count();

            category.setProductCount(count);
            return category;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Category updateCategory(Long id, Category details) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(details.getName());
        category.setColor(details.getColor());

        return categoryRepository.saveAndFlush(category);
    }

    public Category saveCategory(Category category) {
        // Note: If categories are global, this stays the same.
        // If categories are branch-specific, you'd add a branch set here.
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        // Logic check: You might want to prevent deletion if medicines
        // exist in this category across ANY branch.
        boolean hasMedicines = medicineRepository.findByCategory_Id(id).stream().anyMatch(m -> m.isActive());
        if (hasMedicines) {
            throw new RuntimeException("Cannot delete category: Active medicines are still assigned to it.");
        }
        categoryRepository.deleteById(id);
    }
}