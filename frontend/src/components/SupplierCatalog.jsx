import React, { useState } from 'react';
import { Package, Search, Plus, Loader2, Check } from 'lucide-react';

const SupplierCatalog = ({ supplierId, procurement }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    catalog = [], 
    isCatalogLoading = false, 
    addToBasket,
    basket = [] 
  } = procurement || {};

  if (!supplierId) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Please select a supplier to view items
        </p>
      </div>
    );
  }

  if (isCatalogLoading) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-blue-500" size={24} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
          Fetching Inventory...
        </p>
      </div>
    );
  }

  const filteredCatalog = catalog.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-slate-50 rounded-2xl p-2 flex items-center border border-slate-200 focus-within:border-blue-400 transition-colors">
        <Search size={18} className="text-slate-400 ml-2" />
        <input 
          placeholder="Quick search products..." 
          className="bg-transparent p-2 outline-none w-full text-sm font-medium text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Catalog List */}
      <div className="max-h-[450px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredCatalog.length > 0 ? (
          filteredCatalog.map((item) => {
            const isInBasket = basket.some(basketItem => basketItem.id === item.id);
            
            // ✅ FIX: Accessing supplyPrice which is the standard in your procurement hooks
            // Adding a fallback to item.price just in case
            const displayPrice = item.supplyPrice || item.price || 0;

            return (
              <div 
                key={item.id} 
                className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    <Package size={18} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{item.name}</p>
                    {/* Displaying the Supply Price */}
                    <p className="text-blue-600 font-black text-[11px] flex items-center gap-1">
                      ₵{Number(displayPrice).toFixed(2)} 
                      <span className="text-slate-300 font-medium font-sans">/ unit</span>
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Ensure we pass the whole item so the basket gets the supplyPrice too
                    addToBasket(item); 
                  }}
                  disabled={isInBasket}
                  className={`p-2 rounded-xl transition-all active:scale-90 shadow-sm ${
                    isInBasket 
                    ? 'bg-green-50 text-green-600 cursor-default' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                  title={isInBasket ? "Added to Basket" : "Add to Order"}
                >
                  {isInBasket ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl">
            No items matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCatalog;