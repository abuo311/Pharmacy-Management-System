package com.pharmacy.repositories;

import com.pharmacy.models.Category;
import com.pharmacy.dto.CategoryStatsDTO; // Ensure this import matches your DTO package
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 1. Alphabetical ordering for the UI
    List<Category> findAllByOrderByNameAsc();

    // 2. Exact name search for validation
    Optional<Category> findByNameIgnoreCase(String name);

    Optional<Category> findByName(String name);

    // 3. Search-as-you-type functionality
    List<Category> findByNameContainingIgnoreCase(String keyword);

    // 4. Quick existence check
    boolean existsByNameIgnoreCase(String name);

    // 5. Filter by Tailwind color theme
    List<Category> findByColorContaining(String colorClass);

    // 6. JPQL: Dynamic product count (Requires DTO)
    @Query("SELECT new com.pharmacy.dto.CategoryStatsDTO(c.id, c.name, c.color, COUNT(m)) " +
           "FROM Category c LEFT JOIN Medicine m ON m.category.id = c.id " +
           "GROUP BY c.id, c.name, c.color")
    List<CategoryStatsDTO> findAllWithProductCount();

    // 7. Categories currently active in a specific branch
    @Query("SELECT DISTINCT c FROM Category c JOIN Medicine m ON m.category.id = c.id " +
           "WHERE m.branch.id = :branchId")
    List<Category> findActiveCategoriesByBranch(@Param("branchId") Long branchId);

    // 8. Identify categories that can be safely deleted (no products)
    @Query("SELECT c FROM Category c WHERE NOT EXISTS (SELECT m FROM Medicine m WHERE m.category.id = c.id)")
    List<Category> findEmptyCategories();

    // 9. Bulk selection support
    List<Category> findAllByIdIn(List<Long> ids);

    // 10. Manual theme update
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.color = :color WHERE c.id = :id")
    void updateCategoryTheme(@Param("id") Long id, @Param("color") String color);
}