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
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500 box-border overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1.5 sm:space-y-2 w-full sm:w-auto">
          {/* BRAND IDENTITY ACCENT BADGES */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 w-full sm:w-fit">
            <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-2 sm:pr-2.5">
              <Building2 className="text-blue-600 flex-shrink-0" size={13} />
              <span className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
                {pharmacyName} B2B
              </span>
            </div>
            <div className="flex items-center space-x-1 min-w-0 flex-1 sm:flex-initial">
              <MapPin className="text-slate-400 flex-shrink-0" size={11} />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {activeBranchName} Center
              </span>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">Suppliers Directory</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl flex-shrink-0">
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
            className="flex-1 sm:flex-initial bg-blue-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10 whitespace-nowrap"
          >
            <Plus size={16} className="mr-1.5 sm:mr-2 flex-shrink-0" /> New Vendor
          </button>
        </div>
      </div>

      {/* Main Core Content Layout Routing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-24 space-y-4 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm p-4 text-center">
          <Loader2 className="animate-spin text-blue-600" size={32} sm={36} />
          <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest truncate max-w-full px-2">
            Accessing Enterprise Directory...
          </p>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === 'table' ? (
            /* WRAPPED DATA MATRIX TABLE WRAPPER CONTAINER */
            <div className="w-full bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto p-1 sm:p-2 custom-scrollbar">
              <div className="min-w-full inline-block align-middle">
                <SupplierTable 
                  data={suppliers || []} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </div>
            </div>
          ) : (
            /* PREMIUM CATALOG METRIC VENDOR CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
              {(suppliers || []).map(vendor => (
                <div 
                  key={vendor.id} 
                  className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group w-full min-w-0"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-slate-50 group-hover:bg-blue-50/40 transition-colors pointer-events-none" />
                  
                  <div className="min-w-0">
                    {/* Card Header Profile Details */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="inline-block bg-slate-100 text-slate-500 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          ID: #{vendor.id}
                        </span>
                        <h3 className="font-black text-base sm:text-lg text-slate-800 tracking-tight leading-snug pt-0.5 truncate">
                          {vendor.companyName}
                        </h3>
                      </div>
                      <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl transition-colors flex-shrink-0">
                        <ExternalLink size={14} />
                      </div>
                    </div>

                    {/* Meta Contact Item Stacks */}
                    <div className="space-y-2.5 my-4 sm:my-5 pt-3 border-t border-slate-50 min-w-0">
                      {vendor.contactName && (
                        <div className="flex items-center text-xs text-slate-500 font-medium min-w-0">
                          <span className="w-16 sm:w-20 text-[9px] sm:text-[10px] font-bold uppercase text-slate-300 tracking-wider flex-shrink-0">Contact</span>
                          <span className="text-slate-700 font-bold truncate flex-1">{vendor.contactName}</span>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-slate-500 min-w-0">
                        <span className="w-16 sm:w-20 text-[9px] sm:text-[10px] font-bold uppercase text-slate-300 tracking-wider flex-shrink-0">Phone</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold truncate flex-1">
                          <Phone size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{vendor.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 min-w-0">
                        <span className="w-16 sm:w-20 text-[9px] sm:text-[10px] font-bold uppercase text-slate-300 tracking-wider flex-shrink-0">Email</span>
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold truncate flex-1">
                          <Mail size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{vendor.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Management Quick-Action Row Layout */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50/80 w-full">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-bold text-xs transition-colors min-w-0"
                    >
                      <Edit3 size={13} className="flex-shrink-0" /> <span className="truncate">Edit Profile</span>
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2 sm:p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors flex-shrink-0"
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