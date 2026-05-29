package com.pharmacy.services;

import com.pharmacy.dto.OrderRequest;
import com.pharmacy.models.*;
import com.pharmacy.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BranchRepository branchRepository;

    /**
     * Get suppliers with product counts filtered by branch
     */
    public List<Supplier> getSuppliersByBranch(Long branchId) {
        return supplierRepository.findAll().stream().map(supplier -> {
            long count = medicineRepository.findBySupplier_IdAndBranch_Id(supplier.getId(), branchId)
                    .stream()
                    .filter(Medicine::isActive)
                    .count();

            supplier.setProductCount(count);
            return supplier;
        }).collect(Collectors.toList());
    }

    public List<Supplier> getSuppliersByRole(Long branchId, String role) {
        return getSuppliersByBranch(branchId).stream()
                .filter(s -> role.equalsIgnoreCase(s.getSupplierType()))
                .collect(Collectors.toList());
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public Supplier saveSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier saveSupplier(Supplier supplier, Long branchId) {
        supplier.setBranchId(branchId);
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier details) {
        Supplier supplier = getSupplierById(id);
        supplier.setCompanyName(details.getCompanyName());
        supplier.setContactPerson(details.getContactPerson());
        supplier.setEmail(details.getEmail());
        supplier.setPhone(details.getPhone());
        supplier.setAddress(details.getAddress());
        supplier.setCategory(details.getCategory());
        supplier.setSupplierType(details.getSupplierType());
        supplier.setStatus(details.getStatus());
        return supplierRepository.saveAndFlush(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        boolean hasMeds = medicineRepository.findBySupplier_Id(id)
                .stream()
                .anyMatch(Medicine::isActive);

        if (hasMeds) {
            throw new RuntimeException("Cannot delete supplier: Active medicines are still assigned.");
        }
        supplierRepository.deleteById(id);
    }

    public List<Medicine> getSupplierProducts(Long supplierId, Long branchId) {
        return medicineRepository.findBySupplier_IdAndBranch_Id(supplierId, branchId);
    }

    // --- PROCUREMENT ORDER METHODS ---

    @Transactional
    public Order createProcurementOrder(OrderRequest request, Long branchId) {
        Supplier supplier = getSupplierById(request.getSupplierId());
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        Order order = new Order();
        order.setSupplier(supplier);
        order.setBranch(branch);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("IN_TRANSIT");
        order.setTotalAmount(BigDecimal.valueOf(request.getTotalAmount()));

        final Order savedOrder = orderRepository.save(order);

        List<OrderItem> items = request.getItems().stream().map(itemDto -> {
            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);

            Medicine med = medicineRepository.findById(itemDto.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));

            item.setMedicine(med);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(BigDecimal.valueOf(itemDto.getUnitPrice()));

            return item;
        }).collect(Collectors.toList());

        orderItemRepository.saveAll(items);
        savedOrder.setItems(items); // Syncing the list for the immediate UI response

        return savedOrder;
    }

    public List<Order> getOrdersBySupplierAndBranch(Long supplierId, Long branchId) {
        return orderRepository.findBySupplierIdAndBranchId(supplierId, branchId);
    }

    /**
     * Fixes the UI Counter issues and correctly updates medicine stock levels.
     */
    @Transactional
    public Order receiveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Use "DELIVERED" to ensure the green counter in Screenshot (41).png increments
        if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order has already been received.");
        }

        // 1. Update Status
        order.setStatus("DELIVERED");

        // 2. Inventory Logic: Using 'stockLevel' from your Medicine model
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                Medicine med = item.getMedicine();
                if (med != null) {
                    // Get current level (default to 0 if null) and add the ordered quantity
                    int currentStock = (med.getStockLevel() != null) ? med.getStockLevel() : 0;
                    med.setStockLevel(currentStock + item.getQuantity());

                    medicineRepository.save(med);
                }
            });
        }

        return orderRepository.save(order);
    }
}