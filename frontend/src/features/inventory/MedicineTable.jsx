import React from 'react';
import { Edit, Trash2, RefreshCw, MapPin, AlertCircle, Building2, ShieldCheck, History, Tag, Landmark, Truck } from 'lucide-react';

const MedicineTable = ({ data = [], onAdjust, onEdit, onDelete, onViewHistory }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Medicine & Manufacturer</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Categorization</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Stock Status</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Pricing (₵)</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Expiry</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-400 font-medium italic">
                  No inventory found for this branch.
                </td>
              </tr>
            ) : (
              data.map((med) => {
                const stock = Number(med.stockLevel) || 0;
                const minAlert = Number(med.minAlertLevel) || 10;
                const supplyPrice = Number(med.supplyPrice || med.price) || 0;
                const sellingPrice = Number(med.sellingPrice) || 0;
                const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;
                const isExpired = expiryDate && expiryDate < new Date().setHours(0,0,0,0);

                // --- ROBUST CATEGORY EXTRACTION ---
                const categoryDisplay = med.category?.name || 
                                       med.categoryName || 
                                       (typeof med.category === 'string' ? med.category : 'Uncategorized');

                // --- ROBUST SUPPLIER EXTRACTION ---
                const supplierDisplay = med.supplier?.companyName || 
                                       med.supplier?.name || 
                                       med.supplierName || 
                                       (typeof med.supplier === 'string' ? med.supplier : 'No Supplier');

                // --- ROBUST MANUFACTURER EXTRACTION ---
                const manufacturerDisplay = typeof med.manufacturer === 'object' 
                  ? (med.manufacturer?.name || med.manufacturer?.companyName) 
                  : (med.manufacturer || 'Unknown Mfr');

                return (
                  <tr key={med.id || Math.random()} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 tracking-tight">{med.name}</p>
                          {med.prescriptionRequired && (
                            <span title="Prescription Required" className="text-blue-600 bg-blue-50 p-0.5 rounded">
                              <ShieldCheck size={14} />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            <Building2 size={10} className="text-slate-300" />
                            {manufacturerDisplay}
                          </div>
                          <span className="text-slate-200 text-[10px]">|</span>
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 font-black tracking-tighter">
                            <Landmark size={10} />
                            BR-{med.branch?.id || med.branchId || '??'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="w-fit px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {categoryDisplay}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 truncate max-w-[120px]">
                          <Truck size={10} className="text-slate-300" />
                          {supplierDisplay}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            stock === 0 ? 'bg-rose-100 text-rose-600' : 
                            (stock <= minAlert) ? 'bg-amber-100 text-amber-600 animate-pulse' : 
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {stock} UNITS
                          </span>
                        </div>
                        {med.shelfLocation && (
                          <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <MapPin size={10} className="mr-1 text-slate-300" />
                            {med.shelfLocation}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center text-xs font-bold text-slate-700">
                          <Tag size={10} className="mr-1 text-emerald-500" />
                          <span className="text-[10px] text-slate-400 font-medium mr-1">Sell:</span>
                          ₵{sellingPrice.toFixed(2)}
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                          <span className="mr-1">Buy:</span>
                          ₵{supplyPrice.toFixed(2)}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className={`flex flex-col ${isExpired ? 'text-rose-500' : 'text-slate-600'}`}>
                        <span className="text-xs font-black">
                          {expiryDate ? expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        {isExpired && (
                          <span className="text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                            <AlertCircle size={10} /> EXPIRED
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {/* ✅ Removed opacity-0 group-hover:opacity-100 to make buttons permanently visible */}
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button onClick={() => onViewHistory?.(med)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Stock History">
                          <History size={18} />
                        </button>
                        <button onClick={() => onAdjust?.(med)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Adjust Stock">
                          <RefreshCw size={18} />
                        </button>
                        <button onClick={() => onEdit?.(med)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Details">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => onDelete?.(med.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all" title="Delete Medicine">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineTable;