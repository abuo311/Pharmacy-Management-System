package com.pharmacy.controllers;

import com.pharmacy.models.Category;
import com.pharmacy.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CategoryController {

    private final CategoryService categoryService;

    // Helper to handle missing branch header
    private ResponseEntity<?> missingBranchHeader() {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "X-Branch-Id header is required"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER')")
    public ResponseEntity<?> getAll(@RequestHeader(value = "X-Branch-Id", required = false) Long branchId) {
        if (branchId == null)
            return missingBranchHeader();

        // Passing the branchId to get counts specific to this branch
        return ResponseEntity.ok(categoryService.getAllCategories(branchId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Category> create(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}