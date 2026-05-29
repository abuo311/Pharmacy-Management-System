import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, AlertCircle, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const SalesInterface = ({ medicines, onCheckoutSuccess }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Filter medicines
  const filteredMedicines = medicines.filter(m => 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) && 
    m.stockLevel > 0
  );

  // 2. Add to Cart Logic
  const addToCart = (medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      updateQuantity(medicine.id, 1);
    } else {
      setCart([...cart, { ...medicine, cartQuantity: 1 }]);
      if (medicine.prescriptionRequired) {
        toast.custom((t) => (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-3 text-amber-800 text-xs font-bold shadow-lg">
            <AlertCircle size={18} /> Prescription required for {medicine.name}
          </div>
        ));
      }
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stockLevel) {
          toast.error(`Only ${item.stockLevel} units available`);
          return item;
        }
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      toast.success("Transaction Complete!");
      setCart([]);
      if (onCheckoutSuccess) onCheckoutSuccess();
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-2 h-[calc(100vh-40px)]">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 flex flex-col h-full">
        {/* Fixed Search Bar Area */}
        <div className="relative group mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search medicine or category..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 bg-white shadow-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🚀 SCROLLABLE MEDICINE GRID */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
            {filteredMedicines.map(med => (
              <div key={med.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md hover:border-blue-100 transition-all group h-fit">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-800">{med.name}</h4>
                    {med.prescriptionRequired && <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">Rx Only</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{med.category?.name || med.category}</p>
                  <p className="text-blue-600 font-black mt-2">₵ {med.price.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold ${med.stockLevel < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {med.stockLevel} left
                  </span>
                  <button 
                    onClick={() => addToCart(med)}
                    className="bg-slate-50 text-slate-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-50 h-fit sticky top-0 flex flex-col max-h-full">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center text-slate-800">
            <ShoppingCart className="mr-2 text-blue-600" size={24} />
            <h3 className="font-black text-xl tracking-tight">Cart</h3>
          </div>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
            {cart.reduce((acc, item) => acc + item.cartQuantity, 0)} Units
          </span>
        </div>

        {/* SCROLLABLE CART ITEMS */}
        <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-400 font-bold text-sm">No items in cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-sm leading-tight">{item.name}</p>
                    <p className="text-blue-600 font-black text-xs">₵{(item.cartQuantity * item.price).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="font-black text-slate-800 text-sm w-4 text-center">
                            {item.cartQuantity}
                        </span>
                        <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        ₵{item.price}/unit
                    </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-dashed border-slate-200 pt-6 shrink-0">
          <div className="flex justify-between items-center pt-2">
            <span className="font-black text-slate-900 text-lg">Total</span>
            <span className="font-black text-blue-600 text-2xl">₵ {total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0 || isProcessing}
          className={`w-full mt-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shrink-0 ${
            cart.length > 0 
            ? 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-[0.98]' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Sale'}
        </button>
      </div>
    </div>
  );
};

export default SalesInterface;