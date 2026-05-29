import React, { useState, useEffect } from 'react';
import { 
  Plus, Loader2, Building2, LayoutGrid, List, MapPin, Mail, Phone, ExternalLink, Edit3, Trash2 
} from 'lucide-react';
import Modal from '../components/Modal';
import AddSupplierForm from '../components/AddSupplierForm';
import SupplierTable from '../components/SupplierTable'; 
import { useSuppliers } from '../hooks/useSuppliers';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axiosConfig';

const SuppliersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewMode, setViewMode] = useState('table'); 
  const [pharmacyName, setPharmacyName] = useState("Minamo");
  
  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Main Branch';
  
  const { suppliers, isLoading, deleteSupplier } = useSuppliers(activeBranchId);

  // --- FETCH PHARMACY GLOBAL BRANDING ---
  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside suppliers context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier); 
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this vendor from this branch's directory?")) {
      try {
        await deleteSupplier.mutateAsync(id);
      } catch (error) {
        // Error toast is handled in the query hook
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-1 sm:p-4 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2">
          {/* BRAND IDENTITY ACCENT BADGES */}
          <div className="flex flex-row items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
            <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-2.5">
              <Building2 className="text-blue-600" size={13} />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pharmacyName} B2B</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="text-slate-400" size={11} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activeBranchName} Center</span>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Suppliers Directory</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10 whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> New Vendor
          </button>
        </div>
      </div>

      {/* Main Core Content Layout Routing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Accessing Enterprise Directory...</p>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === 'table' ? (
            /* WRAPPED DATA MATRIX TABLE WRAPPER CONTAINER */
            <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
              <SupplierTable 
                data={suppliers || []} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </div>
          ) : (
            /* PREMIUM CATALOG METRIC VENDOR CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(suppliers || []).map(vendor => (
                <div 
                  key={vendor.id} 
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-slate-50 group-hover:bg-blue-50/40 transition-colors pointer-events-none" />
                  
                  <div>
                    {/* Card Header Profile Details */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          ID: #{vendor.id}
                        </span>
                        <h3 className="font-black text-lg text-slate-800 tracking-tight leading-snug pt-1">
                          {vendor.companyName}
                        </h3>
                      </div>
                      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl transition-colors">
                        <ExternalLink size={15} />
                      </div>
                    </div>

                    {/* Meta Contact Item Stacks */}
                    <div className="space-y-2.5 my-5 pt-2 border-t border-slate-50">
                      {vendor.contactName && (
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                          <span className="w-20 text-[10px] font-bold uppercase text-slate-300 tracking-wider">Contact</span>
                          <span className="text-slate-700 font-bold">{vendor.contactName}</span>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-slate-500">
                        <span className="w-20 text-[10px] font-bold uppercase text-slate-300 tracking-wider">Phone</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <Phone size={12} className="text-slate-400" />
                          <span>{vendor.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <span className="w-20 text-[10px] font-bold uppercase text-slate-300 tracking-wider">Email</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold max-w-[180px] truncate">
                          <Mail size={12} className="text-slate-400" />
                          <span className="truncate">{vendor.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Management Quick-Action Row Layout */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50/80 w-full">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Edit3 size={13} /> Edit Profile
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Remove Supplier"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shared Register/Update Modal Sheet Component Wrapper */}
      <Modal 
        isOpen={isModalOpen || !!editingSupplier} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }} 
        title={editingSupplier ? "Update Corporate Vendor" : "Register Corporate Vendor"}
      >
        <AddSupplierForm 
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }} 
          branchId={activeBranchId} 
          initialData={editingSupplier} 
        />
      </Modal>
    </div>
  );
};

export default SuppliersPage;