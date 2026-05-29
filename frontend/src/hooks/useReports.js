import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig'; // ✅ use your configured instance

export const useReports = (branchId, period) => {
  return useQuery({
    queryKey: ['reports', branchId, period],

    queryFn: async () => {
      try {
        const response = await api.get('/reports/summary', {
          params: { branchId, period }
        });

        console.log("✅ Report API Response:", response.data);

        return response.data;

      } catch (error) {
        console.error("❌ Report API Error:", error.response || error);
        throw error;
      }
    },

    enabled: !!branchId && !!period,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1, // avoid spamming failing endpoint
  });
};