import React from 'react';
import { Phone, Mail, MapPin, Trash2, Edit, Building2 } from 'lucide-react';

// Unified configuration for dynamic role badges
const ROLE_CONFIG = {
  MANUFACTURER: { label: "Manufacturer", styles: "bg-blue-50 text-blue-600 border-blue-100" },
  DISTRIBUTOR: { label: "Distributor", styles: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  WHOLESALER: { label: "Wholesaler", styles: "bg-purple-50 text-purple-600 border-purple-100" },
  IMPORTER: { label: "Importer", styles: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  RETAILER: { label: "Retailer", styles: "bg-orange-50 text-orange-600 border-orange-100" }
};

const SupplierTable = ({ data, onEdit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
        <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Suppliers Registered for this Branch</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company & Role</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((supplier) => {
            // Determine the configuration based on supplierType
            const role = ROLE_CONFIG[supplier.supplierType] || { 
              label: supplier.supplierType || 'Distributor', 
              styles: "bg-slate-50 text-slate-500 border-slate-100" 
            };

            return (
              <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-black text-slate-800 leading-tight">{supplier.companyName}</p>
                  {/* Dynamic Badge Implementation */}
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md mt-1.5 inline-block border ${role.styles}`}>
                    {role.label}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-700">{supplier.contactPerson || 'N/A'}</p>
                  <div className="flex items-center text-[10px] text-slate-400 mt-1">
                    <MapPin size={10} className="mr-1" />
                    <span className="truncate max-w-[150px]">{supplier.address}</span>
                  </div>
                </td>
                <td className="px-6 py-5 space-y-1">
                  <div className="flex items-center text-xs font-bold text-slate-600">
                    <Phone size={12} className="mr-2 text-slate-400" /> {supplier.phone}
                  </div>
                  <div className="flex items-center text-xs font-medium text-slate-400">
                    <Mail size={12} className="mr-2" /> {supplier.email || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    supplier.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(supplier)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(supplier.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;