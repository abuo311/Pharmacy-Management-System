import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

export const usePurchaseOrder = (supplierId, branchId) => {
  const queryClient = useQueryClient();
  const [basket, setBasket] = useState([]);

  const addToBasket = (product) => {
    setBasket(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        toast.error("Already in basket");
        return prev;
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        supplyPrice: product.supplyPrice || 0 
      }];
    });
  };

  const removeFromBasket = (id) => {
    setBasket(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, q) => {
    setBasket(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, parseInt(q) || 0) } : item
    ));
  };

  const updatePrice = (id, p) => {
    setBasket(prev => prev.map(item => 
      item.id === id ? { ...item, supplyPrice: parseFloat(p) || 0 } : item
    ));
  };

  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      const total = basket.reduce((sum, item) => sum + (item.supplyPrice * item.quantity), 0);
      const payload = {
        supplierId: Number(supplierId),
        branchId: Number(branchId),
        items: basket.map(item => ({
          medicineId: item.id,
          quantity: item.quantity,
          unitPrice: item.supplyPrice
        })),
        totalAmount: total
      };
      return await api.post('/suppliers/orders', payload);
    },
    onSuccess: () => {
      toast.success("Purchase Order Sent!");
      // CRITICAL: Only invalidate the specific relevant queries
      queryClient.invalidateQueries({ queryKey: ['supplier-orders', Number(supplierId), Number(branchId)] });
      setBasket([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit order");
    }
  });

  return { 
    basket, 
    addToBasket, 
    removeFromBasket, 
    updateQuantity, 
    updatePrice,
    submitOrder: submitOrderMutation.mutateAsync,
    isSubmitting: submitOrderMutation.isPending
  };
};