import React from 'react';
import { Plus, Minus, Trash2, Send, Loader2 } from 'lucide-react'; // Added Loader2
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';

const NewOrderWorkflow = ({ supplierId, branchId, catalog, onBack }) => {
  const { 
    basket, 
    addToBasket, 
    updateQuantity, 
    removeFromBasket, 
    submitOrder // This should be the mutation object from useMutation
  } = usePurchaseOrder(supplierId, branchId);

  const total = basket.reduce((sum, item) => sum + (item.supplyPrice * item.quantity), 0);

  // Determine loading and trigger states safely
  const isPending = submitOrder?.isLoading || submitOrder?.isPending;

  const handleDispatch = () => {
    if (basket.length === 0) return;
    
    // Check if your hook returns .mutate directly or inside an object
    if (typeof submitOrder === 'function') {
      submitOrder();
    } else if (submitOrder?.mutate) {
      submitOrder.mutate();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Step 1: Select from Catalog */}
        <section>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available in Catalog</p>
          <div className="grid grid-cols-1 gap-2">
            {catalog.map(item => (
              <button 
                key={item.id}
                type="button"
                onClick={() => addToBasket(item)}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-400 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-black text-slate-800">{item.productName}</p>
                  <p className="text-[10px] font-bold text-blue-500">₵{item.supplyPrice.toFixed(2)}</p>
                </div>
                <Plus size={18} className="text-slate-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: The Basket */}
        {basket.length > 0 && (
          <section className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Order Summary</p>
            <div className="space-y-3">
              {basket.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-blue-50">
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">{item.productName}</p>
                    <p className="text-[10px] font-bold text-slate-400">Total: ₵{(item.supplyPrice * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="p-1 hover:text-blue-600"
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="px-2 text-xs font-black">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="p-1 hover:text-blue-600"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFromBasket(item.id)} 
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer: Grand Total and Submit */}
      <div className="pt-6 border-t border-slate-100 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-black text-slate-400 uppercase">Grand Total</span>
          <span className="text-2xl font-black text-slate-900">₵{total.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onBack} 
            className="flex-1 py-4 font-black text-xs uppercase text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={basket.length === 0 || isPending}
            onClick={handleDispatch}
            className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Send size={16}/> 
                <span>Dispatch Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderWorkflow;