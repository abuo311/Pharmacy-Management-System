import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import api from '../api/axiosConfig';
import { useMedicine } from '../hooks/useMedicine';
import useAuthStore from '../store/useAuthStore';
import MedicineTable from '../features/inventory/MedicineTable';
import Modal from '../components/Modal';
import AddMedicineForm from '../components/AddMedicineForm'; 
import AdjustStockForm from '../features/inventory/AdjustStockForm';
import StockHistoryModal from '../features/inventory/StockHistoryModal';
import CSVImporter from '../components/CSVImporter'; 
import { Search, Plus, Loader2, AlertTriangle, MapPin, Building2 } from 'lucide-react';

const InventoryPage = () => {
  const queryClient = useQueryClient();
  
  // --- CONTEXT ---
  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Main Branch';

  // --- STATE ---
  const [pharmacyName, setPharmacyName] = useState("PharmaWeb");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // --- FETCH PHARMACY GLOBAL BRANDING ---
  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside inventory context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  // --- DATA FETCHING ---
  const { medicines, isLoading, deleteMedicine } = useMedicine(activeBranchId);

  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories', activeBranchId],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
    retry: 1
  });

  // --- LOGIC ---
  const filteredData = (medicines || []).filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = med.category?.name || "Uncategorized";
    const matchesCategory = filterCategory === "All" || categoryName === filterCategory;
    
    const isLow = med.stockLevel <= (med.minAlertLevel || 10);
    const matchesLowStock = showOnlyLowStock ? isLow : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleOpenEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleOpenAdjust = (medicine) => {
    setSelectedMedicine(medicine);
    setIsAdjustModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will delete the item from this branch's inventory.")) {
      try {
        await deleteMedicine(id);
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2">
          {/* BRAND IDENTITY ACCENT BADGES */}
          <div className="flex flex-row items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm w-fit">
            <div className="flex items-center space-x-1.5 border-r border-slate-100 pr-2.5">
              <Building2 className="text-blue-600" size={13} />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pharmacyName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="text-slate-400" size={11} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activeBranchName}</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Inventory Catalog
          </h2>
          <p className="text-slate-400 font-bold text-xs">
            Displaying {filteredData.length} trackable products in location
          </p>
        </div>

        {/* Action button grouping layout wrapper */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <CSVImporter 
            branchId={activeBranchId} 
            onComplete={() => queryClient.invalidateQueries(['medicines', activeBranchId])} 
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center shadow-xl shadow-blue-600/10 active:scale-95 transition-all text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus size={16} className="mr-1.5 sm:mr-2" /> Add Medicine
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm items-center w-full">
        
        {/* Search Bar Input Context Wrapper */}
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder={`Search central catalog by descriptor...`}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl outline-none font-bold text-sm text-slate-700 focus:border-blue-400 focus:bg-white transition-all placeholder-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Group Grid container */}
        <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs border transition-all uppercase tracking-wider ${
              showOnlyLowStock
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={14} /> Low Stock
          </button>

          <select
            className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 font-black text-xs text-slate-600 uppercase tracking-wider outline-none cursor-pointer hover:border-slate-300 w-full lg:w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categoriesLoading ? (
              <option disabled>Loading Options...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* MAIN CONTENT AREA TABLE WRAPPER CONTAINER */}
      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Fetching branch stocks data...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto min-w-full block custom-scrollbar">
            <MedicineTable
              data={filteredData}
              onAdjust={handleOpenAdjust}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onViewHistory={(med) => {
                setSelectedMedicine(med);
                setIsHistoryModalOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Medicine">
        <AddMedicineForm onCancel={() => setIsModalOpen(false)} onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Medicine Details">
        <AddMedicineForm
          initialData={selectedMedicine}
          onCancel={() => { setIsEditModalOpen(false); setSelectedMedicine(null); }}
          onSuccess={() => { setIsEditModalOpen(false); setSelectedMedicine(null); }}
        />
      </Modal>

      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Adjust Branch Stock">
        {selectedMedicine && (
          <AdjustStockForm
            medicine={selectedMedicine}
            onCancel={() => setIsAdjustModalOpen(false)}
            onSuccess={() => setIsAdjustModalOpen(false)}
          />
        )}
      </Modal>

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => { setIsHistoryModalOpen(false); setSelectedMedicine(null); }}
        medicine={selectedMedicine}
      />
    </div>
  );
};

export default InventoryPage;