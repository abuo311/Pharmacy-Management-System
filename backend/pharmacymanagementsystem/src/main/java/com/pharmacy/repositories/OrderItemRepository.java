package com.pharmacy.repositories;

import com.pharmacy.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Use findByOrder_Id to explicitly tell JPA to look
     * for the 'id' field inside the 'order' object.
     */
    List<OrderItem> findByOrder_Id(Long orderId);
}