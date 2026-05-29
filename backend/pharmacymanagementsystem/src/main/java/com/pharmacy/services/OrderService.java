package com.pharmacy.services;

import com.pharmacy.models.Order;
import java.util.List;

public interface OrderService {
    List<Order> getDeliveredOrdersByMedicineAndBranch(Long medicineId, Long branchId);

    List<Order> getOrdersByBranch(Long branchId);
    // Add other methods like saveOrder or updateStatus as needed
}