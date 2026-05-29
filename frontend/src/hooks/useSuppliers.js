import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

export const useSuppliers = (branchId) => {
  const queryClient = useQueryClient();

  // 1. Fetch Suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', branchId],
    queryFn: async () => {
      const response = await api.get('/suppliers', {
        headers: { 'X-Branch-Id': branchId }
      });
      return response.data;
    },
    enabled: !!branchId,
  });

  // 2. Create Supplier
  const createSupplier = useMutation({
    mutationFn: (newSupplier) => api.post('/suppliers', newSupplier, {
      headers: { 'X-Branch-Id': branchId }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', branchId] });
      toast.success("Supplier added successfully");
    },
    onError: () => toast.error("Failed to add supplier")
  });

  // 3. Update Supplier (NEW)
  const updateSupplier = useMutation({
    mutationFn: (updatedData) => api.put(`/suppliers/${updatedData.id}`, updatedData, {
      headers: { 'X-Branch-Id': branchId }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', branchId] });
      toast.success("Supplier details updated");
    },
    onError: () => toast.error("Failed to update supplier")
  });

  // 4. Delete Supplier
  const deleteSupplier = useMutation({
    mutationFn: (id) => api.delete(`/suppliers/${id}`, {
        headers: { 'X-Branch-Id': branchId }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', branchId] });
      toast.success("Supplier removed");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to remove supplier";
      toast.error(message);
    }
  });
  

  return { 
    suppliers, 
    isLoading, 
    createSupplier, 
    updateSupplier, // Exported for the edit modal
    deleteSupplier 
  };
};
// Inside useSuppliers.js
export const useSupplierCategories = (branchId) => {
  return useQuery({
    queryKey: ['supplier-categories', branchId],
    queryFn: async () => {
      // ✅ Ensure this matches your new CategoryController path
      // ✅ Pass the branch header to satisfy the backend filter
      const response = await api.get('/categories', {
        headers: { 'X-Branch-Id': branchId || 1 }
      });
      return response.data;
    },
    enabled: !!branchId
  });
};