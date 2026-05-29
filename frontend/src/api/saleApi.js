// 1. IMPORT YOUR CUSTOM INSTANCE
import api from './axiosConfig'; 

export const saleApi = {
  /**
   * Fetch all sales for the current branch
   * We pass the branchId as a param to ensure the backend filters correctly
   */
  getAllSales: (branchId) => api.get('/sales', {
    params: { branchId } // This sends ?branchId=X to the backend
  }),
  
  /**
   * Fetch a specific sale by ID
   */
  getSaleById: (id) => api.get(`/sales/${id}`),

  /**
   * Process a refund
   */
  processRefund: (id) => api.put(`/sales/${id}/refund`), 
  
  /**
   * Checkout / Process a new sale
   */
  checkout: (data) => api.post('/sales/checkout', data),

  /**
   * Get sales statistics for the current branch dashboard
   * Updated to accept branchId for localized summary data
   */
  getSalesSummary: (branchId) => api.get('/sales/summary', {
    params: { branchId }
  }),

  /**
   * OPTIONAL: If you want the backend to calculate "Today's Income" directly
   */
  getTodaysIncome: (branchId) => api.get('/sales/today', {
    params: { branchId }
  })
};

export default saleApi;