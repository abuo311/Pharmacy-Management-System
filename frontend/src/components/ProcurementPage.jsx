import React, { useState, useMemo, useEffect } from 'react';
import { useProcurement } from '../hooks/useProcurement';
import { useSuppliers } from '../hooks/useSuppliers'; 
import useAuthStore from '../store/useAuthStore';
import SupplierCatalog from './SupplierCatalog';
import SupplierBasket from './SupplierBasket';
import SupplierOrders from './SupplierOrders';
import api from '../api/axiosConfig';
import { Building2, Truck, AlertCircle, Loader2, MapPin, ReceiptText } from 'lucide-react';

const ProcurementPage = ({ branchId }) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [pharmacyName, setPharmacyName] = useState("Minamo");
  const [resolvedBranchName, setResolvedBranchName] = useState("");
  
  const memoBranchId = useMemo(() => Number(branchId), [branchId]);

  // --- IDENTITY CONTEXT ---
  const currentUser = useAuthStore((state) => state.user);

  // Fetch dynamic list of suppliers
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers(memoBranchId);

  // This hook powers the catalog, basket, and orders
  const procurement = useProcurement(selectedSupplierId, memoBranchId);

  // --- FETCH IDENTITY META (PHARMACY BRAND & BRANCH NAME) ---
  useEffect(() => {
    // 1. Resolve Branch Name based on passed props
    if (currentUser?.branchId === memoBranchId && currentUser?.branchName) {
      setResolvedBranchName(currentUser.branchName);
    } else {
      // Fallback API resolution if viewing a non-primary branch context
      const fetchBranchMeta = async () => {
        try {
          const res = await api.get(`/branches/${memoBranchId}`);
          if (res.data && res.data.name) {
            setResolvedBranchName(res.data.name);
          } else {
            setResolvedBranchName(`Branch Loc #${memoBranchId}`);
          }
        } catch (err) {
          setResolvedBranchName(`Branch Loc #${memoBranchId}`);
        }
      };
      fetchBranchMeta();
    }

    // 2. Fetch Global Pharmacy Branding
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside procurement context");
      }
    };
    fetchPharmacyBrand();
  }, [memoBranchId, currentUser]);

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2.5">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
              <Building2 size={22} />
            </div>
            Inventory Procurement
          </h1>
          
          {/* BRAND IDENTITY ACCENT HEADER */}
          <div className="flex flex-row items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
            <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-2.5">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{pharmacyName} Hub</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="text-slate-400" size={11} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {resolvedBranchName ? resolvedBranchName : `Loading Location...`}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Supplier Selector */}
        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-200/70 focus-within:border-blue-400 focus-within:bg-white transition-all duration-200 shadow-inner w-full lg:w-auto min-w-[320px]">
          <div className="p-2 bg-white rounded-xl shadow-sm text-slate-500">
            <Truck size={16} />
          </div>
          <div className="flex flex-col flex-1 pr-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Supply Logistics Partner</span>
            
            {isSuppliersLoading ? (
              <div className="flex items-center pt-0.5">
                <Loader2 size={12} className="animate-spin text-blue-600 mr-2" />
                <span className="text-xs font-bold text-slate-400">Loading Vendors...</span>
              </div>
            ) : (
              <select 
                className="bg-transparent outline-none text-sm font-black text-blue-600 cursor-pointer w-full mt-0.5 appearance-none"
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                value={selectedSupplierId}
              >
                <option value="" className="text-slate-400 font-medium">Select distributed vendor...</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier.id} value={supplier.id} className="text-slate-700 font-bold">
                    {supplier.companyName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Content View State Routing */}
      {!selectedSupplierId ? (
        /* EMPTY STATE ACTION PLACEMENT */
        <div className="bg-white border border-slate-100 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center shadow-sm min-h-[450px]">
          <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-5 border border-slate-100 group relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <AlertCircle className="text-slate-300 z-10" size={28} />
          </div>
          <h2 className="text-slate-700 font-black text-sm uppercase tracking-[0.15em]">Select a supplier partner</h2>
          <p className="text-slate-400 text-xs mt-2 font-bold max-w-sm leading-relaxed">
            Choose an authorized logistics company supplier from the hub filter panel to access stock catalogs and authorize procurement purchase orders.
          </p>
        </div>
      ) : (
        /* WORKSPACE TRIPLE COLUMN ENGINE GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel Column: Supplier Catalog */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[600px] hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fulfillment Index
                </h3>
                <span className="text-base font-black text-slate-800 tracking-tight mt-0.5">Supplier Catalog</span>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider">
                {procurement.catalog?.length || 0} PRODUCTS
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <SupplierCatalog 
                supplierId={selectedSupplierId} 
                procurement={procurement} 
              />
            </div>
          </div>

          {/* Center Panel Column: Procurement Basket */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[600px] hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Staging Framework
              </h3>
              <span className="text-base font-black text-slate-800 tracking-tight mt-0.5">Procurement Basket</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <SupplierBasket procurement={procurement} />
            </div>
          </div>

          {/* Right Panel Column: Premium Dark Mode Order History Ledger */}
          <div className="md:col-span-2 lg:col-span-4 bg-slate-950 p-5 sm:p-6 rounded-[2.5rem] shadow-xl flex flex-col min-h-[600px] border border-slate-900 relative overflow-hidden group">
            {/* Design accents */}
            <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-blue-600/10 blur-3xl group-hover:bg-blue-600/15 transition-all duration-500 pointer-events-none" />
            
            <div className="mb-6 pb-4 border-b border-slate-900 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Audit Stream
                </h3>
                <span className="text-base font-black text-white tracking-tight mt-0.5">Recent Ledger</span>
              </div>
              <div className="p-2 bg-slate-900 text-slate-400 rounded-xl border border-slate-800">
                <ReceiptText size={15} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 z-10 text-slate-300">
              <SupplierOrders 
                supplierId={selectedSupplierId} 
                branchId={memoBranchId} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;