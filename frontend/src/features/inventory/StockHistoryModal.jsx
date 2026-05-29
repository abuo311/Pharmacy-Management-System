import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import useAuthStore from '../../store/useAuthStore';
import { X, ArrowUpCircle, ArrowDownCircle, Info, Calendar, User, Package, MapPin, ClipboardList, ShoppingBag } from 'lucide-react';

const StockHistoryModal = ({ medicine, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Nkoranza';

  useEffect(() => {
    if (isOpen && medicine?.id) {
      setLoading(true);
      
      // Fetching both Manual Adjustments AND Received Orders
      Promise.all([
        api.get(`/stock-adjustments/medicine/${medicine.id}`, {
          headers: { 'X-Branch-Id': activeBranchId }
        }),
        api.get(`/orders/medicine/${medicine.id}/delivered`, {
            params: { branchId: activeBranchId }
        })
      ])
      .then(([adjustmentRes, orderRes]) => {
        // 1. Process Manual Adjustments
        const adjustments = Array.isArray(adjustmentRes.data) ? adjustmentRes.data.map(adj => ({
            ...adj,
            displayType: 'ADJUSTMENT',
            date: adj.adjustmentDate || adj.createdAt,
            source: 'MANUAL'
        })) : [];

        // 2. Process Received Orders (Procurement)
        const orders = Array.isArray(orderRes.data) ? orderRes.data.map(order => ({
            id: order.id,
            type: 'RESTOCK',
            displayType: 'PROCUREMENT',
            // Find specific quantity for this medicine from the order items
            quantity: order.items?.find(i => i.medicine?.id === medicine.id)?.quantity || 0,
            reason: `Received from ${order.supplier?.companyName || 'Supplier'}`,
            date: order.updatedAt || order.createdAt,
            performedBy: { username: 'SYSTEM' },
            source: 'ORDER'
        })) : [];

        // 3. Merge and Sort by Date (Newest first)
        const combined = [...adjustments, ...orders].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        setHistory(combined);
      })
      .catch(err => {
        console.error("Audit Ledger Sync Error:", err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
    }
  }, [isOpen, medicine?.id, activeBranchId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-GB', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Stock Audit Ledger</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                  {medicine?.name}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin size={10} />
                  <span className="text-[9px] font-bold uppercase">{activeBranchName} Branch</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <Info className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-black text-sm uppercase">No Audit History Found</p>
              <p className="text-slate-400 text-xs mt-1">Receive a new order to see stock changes here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((adj, idx) => (
                <div key={adj.id || idx} className="relative pl-8 pb-4 group">
                  {idx !== history.length - 1 && (
                    <div className="absolute left-[13px] top-[30px] bottom-0 w-[2px] bg-slate-100" />
                  )}
                  
                  <div className={`absolute left-0 top-1 p-1 rounded-full z-10 ${
                    adj.quantity > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {adj.source === 'ORDER' ? <ShoppingBag size={20} /> : (adj.quantity > 0 ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />)}
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${
                          adj.source === 'ORDER' ? 'bg-blue-600 text-white' : (adj.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                        }`}>
                          {adj.source === 'ORDER' ? `PO-#${adj.id?.toString().padStart(4, '0')}` : adj.displayType}
                        </span>
                        {adj.source === 'ORDER' && (
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Verified Delivery</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold">{formatDate(adj.date)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">
                          {adj.quantity > 0 ? '+' : ''}{adj.quantity} units
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {adj.source === 'ORDER' ? adj.reason : `"${adj.reason}"`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <User size={10} className="text-blue-500" />
                          <span className="text-[9px] font-black uppercase text-slate-500">
                            {adj.performedBy?.username || adj.performed_by?.username || 'SYSTEM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Compliance Audit<br/><span className="text-blue-600">Sync Mode: Procurement + Manual</span>
          </p>
          <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;