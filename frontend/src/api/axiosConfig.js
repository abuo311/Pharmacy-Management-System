import axios from 'axios';

// 1. Base Axios instance
const api = axios.create({
  baseURL: 'https://pharmacy-management-system-t64r.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // ✅ Changed from localStorage to sessionStorage to align with the updated Zustand auth engine
    const authData = sessionStorage.getItem('pharmacy-auth-storage');

    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        const state = parsedData?.state;

        // ✅ TOKEN HANDLING
        const token = state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("🔑 TOKEN SENT"); 
        }

        // ✅ BRANCH HANDLING
        const branchId = 
          state?.user?.assignedBranch?.id || 
          state?.user?.branchId || 
          1; 

        if (branchId) {
          config.headers['X-Branch-Id'] = branchId.toString(); 
          console.log(`[Minamo Debug] Branch ID: ${branchId}`);
        }

      } catch (err) {
        console.error("❌ Interceptor parsing error:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. API MODULES

// Updated medicineApi to include a generic GET helper
export const medicineApi = {
  getInventory: () => api.get('/medicines'),
  getLowStock: () => api.get('/medicines/alerts/low-stock'),
  saveMedicine: (data) => api.post('/medicines', data),
  updateMedicine: (id, data) => api.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
  // Helper for direct URL calls used in hooks
  get: (url, config) => api.get(url, config)
};

// ✅ ADDED: orderApi to fix the "requested module does not provide an export" error
export const orderApi = {
  getMedicineHistory: (medicineId, branchId) => 
    api.get(`/orders/medicine/${medicineId}/delivered`, { params: { branchId } })
};

export const stockAdjustmentApi = {
  getHistory: (medicineId) => api.get(`/stock-adjustments/medicine/${medicineId}`),
  processAdjustment: (data) => api.post('/stock-adjustments/process', data),
};

export const procurementApi = {
  receiveOrder: (orderId) => api.post(`/suppliers/orders/${orderId}/receive`),
  getOrders: () => api.get('/suppliers/orders'),
  createOrder: (data) => api.post('/suppliers/orders', data),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const customerApi = {
  getAll: () => api.get('/customers')
};

export default api;