package com.pharmacy.services.impl;

import com.pharmacy.models.Order;
import com.pharmacy.repositories.OrderRepository;
import com.pharmacy.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Order> getDeliveredOrdersByMedicineAndBranch(Long medicineId, Long branchId) {
        // We filter for 'DELIVERED' because only completed orders
        // should affect the physical stock audit ledger.
        return orderRepository.findDeliveredOrdersByMedicineAndBranch(medicineId, branchId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByBranch(Long branchId) {
        return orderRepository.findByBranchId(branchId);
    }
}