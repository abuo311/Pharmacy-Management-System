import React, { useState } from 'react';
import { Calendar, Loader2, CheckCircle2, Clock, Plus, ReceiptText, PackageCheck } from 'lucide-react';
import { useProcurement } from '../hooks/useProcurement';
import toast from 'react-hot-toast';

const SupplierOrders = ({ supplierId, branchId }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    orders = [], 
    isOrdersLoading, 
    submitOrderAsync, 
    receiveOrderAsync 
  } = useProcurement(supplierId, branchId);

  const handleGenerateOrder = async () => {
    try {
      await toast.promise(submitOrderAsync(), {
        loading: 'Generating Purchase Order...',
        success: 'Order Created successfully!',
        error: (err) => err.response?.data?.message || 'Failed to create order.',
      });
      setIsCreating(false);
    } catch (err) { 
      console.error("Order Creation Error:", err); 
    }
  };

  const handleReceive = async (orderId) => {
    try {
      await toast.promise(receiveOrderAsync(orderId), {
        loading: 'Verifying shipment & updating inventory...',
        success: 'Stock incremented successfully!',
        error: (err) => err.response?.data?.message || 'Failed to update stock levels.',
      });
    } catch (err) { 
      console.error("Receive Error:", err); 
    }
  };

  if (isOrdersLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Ledger...</p>
    </div>
  );

  // ✅ FIX: Matches the uppercase strings saved in SupplierService.java
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const inTransitCount = orders.filter(o => o.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/10 p-5 rounded-[2rem] border border-emerald-500/20 flex justify-between items-center">
          <div>
            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Delivered</p>
            <p className="text-2xl font-black text-emerald-400">{deliveredCount}</p>
          </div>
          <CheckCircle2 className="text-emerald-500/30" size={24} />
        </div>
        <div className="bg-amber-50/10 p-5 rounded-[2rem] border border-amber-500/20 flex justify-between items-center">
          <div>
            <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">In Transit</p>
            <p className="text-2xl font-black text-amber-400">{inTransitCount}</p>
          </div>
          <Clock className="text-amber-500/30" size={24} />
        </div>
      </div>

      {/* Orders List */}
      <div className="max-h-[380px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {orders.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-700 rounded-[2rem]">
            <ReceiptText className="mx-auto text-slate-700 mb-2" size={32} />
            <p className="text-[10px] font-black text-slate-500 uppercase">No prior orders found</p>
          </div>
        ) : (
          [...orders].reverse().map((order) => (
            <div key={order.id} className="p-5 rounded-[2rem] border border-slate-800 bg-slate-800/50 hover:border-blue-500/50 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={12} />
                  <span className="text-[9px] font-black uppercase">
                    {/* ✅ Uses createdAt to match backend LocalDateTime field */}
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'Just Now'}
                  </span>
                </div>
                <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                  order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {order.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-black text-white leading-none mb-1">
                    PO-#{order.id?.toString().padStart(4, '0') || 'NEW'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 mb-3">
                    Items: {order.items?.length || 0}
                  </p>
                  
                  {/* ✅ button only appears for IN_TRANSIT orders */}
                  {order.status === 'IN_TRANSIT' && (
                    <button 
                      onClick={() => handleReceive(order.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-[9px] font-black uppercase shadow-md active:scale-95"
                    >
                      <PackageCheck size={14} /> Mark Received
                    </button>
                  )}
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Total Pay</p>
                    <p className="font-black text-white text-xl tracking-tight">
                        ₵{(order.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2">
        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)} 
            disabled={!supplierId}
            className="w-full bg-white text-slate-900 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> New Purchase Order
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setIsCreating(false)} 
              className="py-4 rounded-3xl font-black text-[10px] uppercase bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleGenerateOrder} 
              className="py-4 rounded-3xl font-black text-[10px] uppercase bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              Confirm & Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;