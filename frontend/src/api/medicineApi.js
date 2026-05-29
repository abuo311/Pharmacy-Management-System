import api from './axiosConfig'; // ✅ USE INTERCEPTOR VERSION

const MEDICINE_URL = '/medicines';
const ORDERS_URL = '/orders';
const STOCK_ADJ_URL = '/stock-adjustments';

export const medicineApi = {
  // The interceptor handles the 'X-Branch-Id' header, but we keep the param for safety
  getInventory: (branchId) => api.get(MEDICINE_URL, { params: { branchId } }),
  getLowStock: () => api.get(`${MEDICINE_URL}/alerts/low-stock`),
  saveMedicine: (data) => api.post(MEDICINE_URL, data),
  saveBulk: (data) => api.post(`${MEDICINE_URL}/bulk`, data),
  updateMedicine: (id, data) => api.put(`${MEDICINE_URL}/${id}`, data),
  deleteMedicine: (id) => api.delete(`${MEDICINE_URL}/${id}`),
  adjustStock: (id, amount) => api.put(`${MEDICINE_URL}/${id}/stock?amount=${amount}`),
  // Helper for generic GET requests inside hooks
  get: (url, config) => api.get(url, config)
};

// ✅ ADDED: orderApi to resolve the crash in Screenshot (44).png
export const orderApi = {
  /**
   * Fetches delivered orders for a specific medicine.
   * Matches the backend endpoint: /api/orders/medicine/{id}/delivered
   */
  getMedicineHistory: (medicineId, branchId) => 
    api.get(`${ORDERS_URL}/medicine/${medicineId}/delivered`, { params: { branchId } }),
  
  getBranchOrders: () => api.get(ORDERS_URL)
};

// ✅ ADDED: stockAdjustmentApi for the Audit Ledger manual entries
export const stockAdjustmentApi = {
  getHistory: (medicineId) => api.get(`${STOCK_ADJ_URL}/medicine/${medicineId}`),
  processAdjustment: (data) => api.post(`${STOCK_ADJ_URL}/process`, data)
};

export const categoryApi = {
  getAll: () => api.get('/categories')
};

export const saleApi = {
  getAllSales: () => api.get('/sales'),
  processRefund: (id) => api.put(`/sales/${id}/refund`),
  checkout: (data) => api.post('/sales/checkout', data)
};

// Default export of the axios instance
export default api;