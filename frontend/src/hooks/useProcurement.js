import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

export const useProcurement = (supplierId, branchId) => {
    const queryClient = useQueryClient();
    const [basket, setBasket] = useState([]);

    // 1. Fetch Catalog
    const { data: catalog = [], isLoading: isCatalogLoading } = useQuery({
        queryKey: ['supplier-catalog', supplierId],
        queryFn: async () => {
            const { data } = await api.get(`/suppliers/${supplierId}/catalog`);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!supplierId,
    });

    // 2. Fetch Orders
    const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
        queryKey: ['supplier-orders', supplierId, branchId],
        queryFn: async () => {
            const { data } = await api.get(`/suppliers/${supplierId}/orders`, {
                params: { branchId: Number(branchId) }
            });
            return Array.isArray(data) ? data : [];
        },
        enabled: !!supplierId && !!branchId,
    });

    // 3. Mutation to send a NEW order
    const submitOrderMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                supplierId: Number(supplierId),
                branchId: Number(branchId),
                items: basket.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    unitPrice: item.supplyPrice
                })),
                totalAmount: basket.reduce((sum, item) => sum + (item.supplyPrice * item.quantity), 0)
            };
            return api.post('/suppliers/orders', payload);
        },
        onSuccess: () => {
            toast.success("Order Sent!");
            setBasket([]);
            queryClient.invalidateQueries({ queryKey: ['supplier-orders', supplierId, branchId] });
        }
    });

  // Inside useProcurement.js
const receiveOrderMutation = useMutation({
    // Change .post back to .put based on the 405 error in the logs
    mutationFn: (orderId) => api.put(`/suppliers/orders/${orderId}/receive`), 
    onSuccess: () => {
        toast.success("Stock Received & Inventory Updated!");
        queryClient.invalidateQueries({ queryKey: ['supplier-orders', supplierId, branchId] });
        queryClient.invalidateQueries({ queryKey: ['medicines', Number(branchId)] });
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to receive stock");
    }
});

    return {
        catalog,
        isCatalogLoading,
        orders,
        isOrdersLoading,
        basket,
        addToBasket: (product) => {
            if (basket.find(i => i.medicineId === product.id || i.id === product.id)) {
                return toast.error("Already in basket");
            }
            setBasket([...basket, { 
                ...product, 
                medicineId: product.id, 
                quantity: 1,
                supplyPrice: product.supplyPrice || product.price || 0 
            }]);
        },
        removeFromBasket: (id) => setBasket(basket.filter(i => i.medicineId !== id && i.id !== id)),
        updateQuantity: (id, q) => setBasket(basket.map(i => 
            (i.medicineId === id || i.id === id) ? { ...i, quantity: q } : i
        )),
        // ✅ Fixes the Basket input crash
        updatePrice: (id, p) => setBasket(basket.map(i => 
            (i.medicineId === id || i.id === id) ? { ...i, supplyPrice: parseFloat(p) || 0 } : i
        )),
        
        // Actions
        submitOrder: submitOrderMutation.mutate,
        submitOrderAsync: submitOrderMutation.mutateAsync, // ✅ Required for toast.promise
        
        receiveOrder: receiveOrderMutation.mutate,
        receiveOrderAsync: receiveOrderMutation.mutateAsync, // ✅ Required for toast.promise
        
        isSubmitting: submitOrderMutation.isPending,
        isReceiving: receiveOrderMutation.isPending
    };
};