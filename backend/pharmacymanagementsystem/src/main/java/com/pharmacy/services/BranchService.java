package com.pharmacy.services;

import com.pharmacy.models.Branch;
import com.pharmacy.repositories.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public List<Branch> getActiveBranches() {
        return branchRepository.findByActiveTrue();
    }

    public Branch saveBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    public Branch updateBranch(Long id, Branch updatedBranch) {
        return branchRepository.findById(id)
            .map(branch -> {
                branch.setName(updatedBranch.getName());
                branch.setLocation(updatedBranch.getLocation());
                branch.setType(updatedBranch.getType());
                branch.setActive(updatedBranch.isActive());
                return branchRepository.save(branch);
            })
            .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }
}