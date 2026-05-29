import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, PackageCheck, Loader2, Info } from 'lucide-react';

const SupplierBasket = ({ procurement }) => {
  const { 
    basket = [], 
    removeFromBasket, 
    updateQuantity, 
    updatePrice, // ✅ Added for custom pricing support
    submitOrder, 
    isSubmitting 
  } = procurement || {};

  // ✅ FIX: Use supplyPrice (or fallback to price) for total calculation
  const subtotal = basket.reduce((acc, item) => {
    const unitPrice = item.supplyPrice || item.price || 0;
    return acc + (unitPrice * (item.quantity || 1));
  }, 0);

  if (basket.length === 0) {
    return (
      <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center min-h-[400px] bg-slate-50/30">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <ShoppingCart className="text-slate-200" size={32} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Basket is Empty
        </p>
        <p className="text-[9px] text-slate-300 mt-2 italic">Add products from the catalog to start a PO</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Info size={14} className="text-blue-500" />
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
          Reviewing {basket.length} line items for procurement
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {basket.map((item) => (
          <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-blue-200 transition-all shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-slate-800 truncate">{item.name}</p>
              
              {/* ✅ FIX: Display supplyPrice and allow editing if needed */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-bold text-blue-600 italic">₵</span>
                <input 
                  type="number"
                  value={item.supplyPrice || item.price || 0}
                  onChange={(e) => updatePrice(item.id, e.target.value)}
                  className="text-[10px] font-black text-blue-600 bg-transparent border-b border-transparent hover:border-blue-200 focus:border-blue-500 outline-none w-16"
                />
                <span className="text-slate-300 text-[10px]">/ unit</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
                <button 
                  type="button"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                >
                  <Minus size={12} />
                </button>
                
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) updateQuantity(item.id, val);
                  }}
                  className="w-10 text-center bg-transparent text-xs font-black text-slate-800 focus:outline-none"
                />

                <button 
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <button 
                type="button"
                onClick={() => removeFromBasket(item.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span>Items Count</span>
            <span>{basket.reduce((total, item) => total + item.quantity, 0)} Units</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">₵{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={submitOrder}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Processing...
            </>
          ) : (
            <>
              <PackageCheck size={18} /> Confirm & Generate Purchase Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SupplierBasket;