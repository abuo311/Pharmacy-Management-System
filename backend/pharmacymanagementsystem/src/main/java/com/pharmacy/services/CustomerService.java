package com.pharmacy.services;

import com.pharmacy.models.Customer;
import com.pharmacy.models.Branch;
import com.pharmacy.repositories.CustomerRepository;
import com.pharmacy.repositories.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;

    public List<Customer> getAllCustomersByBranch(Long branchId) {
        return customerRepository.findByBranchId(branchId);
    }

    // Ensures a user can only fetch customers belonging to their active branch
    // session
    public Customer getCustomerById(Long id, Long branchId) {
        return customerRepository.findById(id)
                .filter(c -> c.getBranch() != null && c.getBranch().getId().equals(branchId))
                .orElseThrow(() -> new RuntimeException("Customer not found or belongs to another branch."));
    }

    @Transactional
    public Customer registerCustomer(Customer customer, Long branchId) {
        // ✅ Optimization: Obtains an entity proxy reference directly without executing
        // an unnecessary SELECT query
        if (!branchRepository.existsById(branchId)) {
            throw new RuntimeException("Branch not found with ID: " + branchId);
        }
        Branch branchRef = branchRepository.getReferenceById(branchId);
        customer.setBranch(branchRef);

        // Initialize clean fallback states for new members
        if (customer.getDebtBalance() == null)
            customer.setDebtBalance(BigDecimal.ZERO);
        if (customer.getLoyaltyPoints() == null)
            customer.setLoyaltyPoints(0);
        customer.setRegistered(true);

        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer details, Long branchId) {
        Customer customer = getCustomerById(id, branchId);

        customer.setName(details.getName());
        customer.setPhone(details.getPhone());
        customer.setEmail(details.getEmail());
        customer.setAddress(details.getAddress());

        return customerRepository.saveAndFlush(customer);
    }

    @Transactional
    public Customer reduceDebt(Long id, BigDecimal paymentAmount, Long branchId) {
        Customer customer = getCustomerById(id, branchId);
        BigDecimal currentDebt = customer.getDebtBalance() != null ? customer.getDebtBalance() : BigDecimal.ZERO;

        // Subtract payment from current balance ledger
        customer.setDebtBalance(currentDebt.subtract(paymentAmount));
        return customerRepository.saveAndFlush(customer);
    }

    @Transactional
    public Customer addLoyaltyPoints(Long id, Integer points, Long branchId) {
        Customer customer = getCustomerById(id, branchId);
        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;

        customer.setLoyaltyPoints(currentPoints + points);
        return customerRepository.saveAndFlush(customer);
    }

    // ✅ Added: Processes premium points redemptions safely initiated by the UI
    // interface
    @Transactional
    public Customer redeemLoyaltyPoints(Long id, Integer points, Long branchId) {
        Customer customer = getCustomerById(id, branchId);
        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;

        if (currentPoints < points) {
            throw new RuntimeException("Insufficient royalty points balance. Current total: " + currentPoints);
        }

        customer.setLoyaltyPoints(currentPoints - points);
        return customerRepository.saveAndFlush(customer);
    }

    @Transactional
    public void deleteCustomer(Long id, Long branchId) {
        // Scope security verification before removal execution
        Customer customer = getCustomerById(id, branchId);
        customerRepository.delete(customer);
    }
}