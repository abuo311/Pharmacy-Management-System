import { create } from 'zustand';

const useInventoryStore = create((set) => ({
  medicines: [],
  lowStockCount: 0,
  
  setMedicines: (data) => set({ 
    medicines: data,
    // Fix: Use 'stockLevel' and 'minAlertLevel' to match your Backend Model
    lowStockCount: data.filter(m => m.stockLevel <= (m.minAlertLevel || 10)).length 
  }),

  addMedicine: (medicine) => set((state) => {
    const newMedicines = [...state.medicines, medicine];
    return {
      medicines: newMedicines,
      lowStockCount: newMedicines.filter(m => m.stockLevel <= (m.minAlertLevel || 10)).length
    };
  }),
}));

export default useInventoryStore;