import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export const useSales = () => {
  const queryClient = useQueryClient();

  // ✅ Get authenticated user
  const user = useAuthStore((state) => state.user);

  // ✅ FIXED: Safely normalize branch ID
  const rawBranchId = user?.branchId || '1';

  const activeBranchId =
    typeof rawBranchId === 'string' && rawBranchId.includes(':')
      ? parseInt(rawBranchId.split(':')[0], 10)
      : parseInt(rawBranchId, 10) || 1;

  // ===============================
  // FETCH MEDICINES
  // ===============================
  const {
    data: medicines = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicines-pos', activeBranchId],

    queryFn: async () => {
      try {
        const response = await api.get('/medicines', {
          headers: {
            'X-Branch-Id': activeBranchId
          }
        });

        // ✅ Ensure response is always array
        const meds = Array.isArray(response.data)
          ? response.data
          : [];

        return meds
          .map((med) => ({
            ...med,

            // ✅ Normalize price fields
            sellingPrice:
              Number(
                med.sellingPrice ??
                med.price ??
                med.selling_price ??
                0
              ) || 0,

            // ✅ Normalize stock
            stockLevel:
              Number(med.stockLevel ?? med.stock ?? 0) || 0
          }))
          .filter((med) => med.stockLevel > 0);

      } catch (err) {
        console.error('Medicine Fetch Error:', err);
        throw err;
      }
    },

    staleTime: 1000 * 60,
    refetchOnWindowFocus: false
  });

  // ===============================
  // CHECKOUT MUTATION
  // ===============================
  const checkoutMutation = useMutation({

    mutationFn: async (saleData) => {
      const userId = user?.id;

      if (!userId) {
        throw new Error('User session not found. Please log in again.');
      }

      // ✅ Ensure items is array
      const safeItems = Array.isArray(saleData?.items)
        ? saleData.items
        : [];

      // ✅ Full normalized payload
      const completeSaleData = {
        ...saleData,
        totalAmount: Number(saleData?.totalAmount || 0),
        discount: Number(saleData?.discount || 0),
        paymentMethod: saleData?.paymentMethod || 'CASH',
        branchId: activeBranchId,
        customerId: saleData?.customerId || null,
        soldBy: {
          id: userId
        },
        items: safeItems.map((item) => ({
          medicine: {
            id: item?.medicine?.id || item?.id
          },
          quantity: Number(item?.quantity || 1),
          unitPrice: Number(item?.unitPrice || item?.sellingPrice || 0)
        }))
      };

      console.log('CHECKOUT PAYLOAD:', completeSaleData);

      const response = await api.post(
        '/sales/checkout',
        completeSaleData,
        {
          headers: {
            'X-Branch-Id': activeBranchId
          }
        }
      );

      console.log('CHECKOUT RESPONSE:', response.data);

      // ✅ Normalize backend response
      const responseData = response?.data || {};

      return {
        ...responseData,
        // ✅ Force safe array
        items: Array.isArray(responseData?.items)
          ? responseData.items
          : Array.isArray(responseData?.saleItems)
          ? responseData.saleItems
          : []
      };
    },

    onSuccess: (data) => {
      console.log('NORMALIZED SALE RESPONSE:', data);
      toast.success('Sale completed successfully!');

      // ✅ Refresh medicine stock and dependent records
      queryClient.invalidateQueries({
        queryKey: ['medicines-pos', activeBranchId]
      });
      queryClient.invalidateQueries({
        queryKey: ['medicines']
      });
      queryClient.invalidateQueries({
        queryKey: ['inventory']
      });
      queryClient.invalidateQueries({
        queryKey: ['customers', activeBranchId]
      });
    },

    onError: (error) => {
      console.error('Checkout Error:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Checkout failed.';
      toast.error(msg);
    }
  });

  return {
    medicines,
    isLoading,
    error,
    checkoutMutation
  };
};