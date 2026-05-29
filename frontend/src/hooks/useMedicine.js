import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicineApi } from '../api/axiosConfig'; 

export const useMedicine = (branchId) => {
  const queryClient = useQueryClient();

  const fetchMedicines = useQuery({
    queryKey: ['medicines', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const response = await medicineApi.getInventory(branchId);
      return response.data;
    },
    enabled: !!branchId,
  });

  const getMedicineOrderHistory = (medicineId) => {
    return useQuery({
      queryKey: ['medicine-order-history', medicineId, branchId],
      queryFn: async () => {
        const response = await medicineApi.get(`/orders/medicine/${medicineId}/delivered`, {
          params: { branchId: branchId }
        });
        return response.data;
      },
      enabled: !!medicineId && !!branchId,
    });
  };

  /**
   * FIX: Improved payload builder to handle "Manufacturer side" updates
   * Ensure supplier relationship is mapped correctly for Spring Boot/JPA
   */
  const buildPayload = (data, id = null) => {
    // Look for ID in all possible locations (flat field or nested object)
    const catId = data.categoryId || data.category?.id;
    const supId = data.supplierId || data.supplier?.id;

    return {
      ...(id && { id: Number(id) }),
      name: data.name,
      manufacturer: data.manufacturer,
      supplyPrice: Number(data.supplyPrice || data.price || 0),
      sellingPrice: Number(data.sellingPrice || 0),
      stockLevel: Number(data.stockLevel || 0),
      minAlertLevel: Number(data.minAlertLevel || 0),
      expiryDate: data.expiryDate,
      shelfLocation: data.shelfLocation || "",
      prescriptionRequired: Boolean(data.prescriptionRequired),
      
      // Sending BOTH the object structure and the flat ID often fixes 
      // JPA update issues where the relationship isn't being detected.
      category: catId ? { id: Number(catId) } : null,
      categoryId: catId ? Number(catId) : null,
      
      supplier: supId ? { id: Number(supId) } : null,
      supplierId: supId ? Number(supId) : null,
      
      branch: { id: Number(branchId) },
      branchId: Number(branchId)
    };
  };

  const addMedicine = useMutation({
    mutationFn: (formData) => medicineApi.saveMedicine(buildPayload(formData)),
    onSuccess: () => {
      // Invalidate all related lists to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines-pos'] });
    }
  });

  const updateMedicine = useMutation({
    mutationFn: ({ id, data }) => {
      const payload = buildPayload(data, id);
      return medicineApi.updateMedicine(id, payload);
    },
    onSuccess: (data, variables) => {
      // 1. Clear the specific branch list
      queryClient.invalidateQueries({ queryKey: ['medicines', branchId] });
      // 2. Clear the POS list
      queryClient.invalidateQueries({ queryKey: ['medicines-pos'] });
      // 3. Force a refetch of the global medicines key just in case
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    }
  });

  const deleteMedicine = useMutation({
    mutationFn: (id) => medicineApi.deleteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines', branchId] });
    }
  });

  return {
    medicines: fetchMedicines.data || [],
    isLoading: fetchMedicines.isLoading,
    isRefetching: fetchMedicines.isRefetching,
    getMedicineOrderHistory,
    addMedicine: addMedicine.mutateAsync,
    updateMedicine: updateMedicine.mutateAsync,
    deleteMedicine: deleteMedicine.mutateAsync
  };
};