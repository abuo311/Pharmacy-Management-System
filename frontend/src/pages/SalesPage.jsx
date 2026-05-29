import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Trash2, Loader2, MapPin, Plus, Minus, UserPlus, Zap, Lock, X, LayoutGrid, List, Building2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSales } from '../hooks/useSales';
import useAuthStore from '../store/useAuthStore';
import ReceiptModal from '../components/ReceiptModal';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const SalesPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const activeBranchName = user?.branchName || 'Main Branch';

  // Normalize Branch ID
  const rawBranchId = user?.branchId || '1';
  const activeBranchId =
    typeof rawBranchId === 'string' && rawBranchId.includes(':')
      ? parseInt(rawBranchId.split(':')[0], 10)
      : parseInt(rawBranchId, 10) || 1;

  const { medicines, isLoading, checkoutMutation } = useSales(activeBranchId);

  // POS States
  const [pharmacyName, setPharmacyName] = useState("PharmaWeb");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false); // 📱 Mobile Cart Sheet Toggle

  // Registration Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch Global Pharmacy Branding
  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside sales context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  // 1. Fetch Shared Customer Data
  const { data: allCustomers = [] } = useQuery({
    queryKey: ['customers', activeBranchId],
    queryFn: async () => {
      const res = await api.get('/customers', {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  // 2. Registration Mutation
  const registerMutation = useMutation({
    mutationFn: async (newCustomer) => {
      const res = await api.post('/customers/register', newCustomer, {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Member Onboarded!');
      queryClient.invalidateQueries({ queryKey: ['customers', activeBranchId] });
      setSelectedCustomerId(data.id);
      setIsRegModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
    },
    onError: (error) => toast.error(error.response?.data || 'Registration failed')
  });

  const handleRegSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Name is required");
    registerMutation.mutate(formData);
  };

  // Medicine Filtering Logic
  const filteredMedicines = useMemo(() => {
    return (medicines || []).filter(med => {
      const isNameMatch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;
      return isNameMatch && !(expiryDate && expiryDate < today);
    });
  }, [medicines, searchTerm]);

  const addToCart = (medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      updateQuantity(medicine.id, 1);
    } else if ((medicine.stockLevel || 0) > 0) {
      setCart(prev => [...prev, { ...medicine, cartQuantity: 1, sellingPrice: medicine.sellingPrice || 0 }]);
      toast.success(`${medicine.name} added`, { id: medicine.id, duration: 1000 });
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = (item.cartQuantity || 1) + delta;
        if (newQty < 1 || newQty > (item.stockLevel || 0)) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQuantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  const handleCompleteSale = (discount) => {
    if (isProcessing || !cart.length) return;
    setIsProcessing(true);

    // --- CRITICAL REFACTOR: Flattened customer object structure to match Backend DTO requirements ---
    const saleData = {
      totalAmount: Math.max(0, subtotal - discount),
      discount,
      paymentMethod: "CASH",
      branchId: activeBranchId,
      customerId: selectedCustomerId ? Number(selectedCustomerId) : null, // Flattened payload variable
      items: cart.map(item => ({ 
        medicine: { id: item.id }, 
        quantity: item.cartQuantity, 
        unitPrice: item.sellingPrice 
      }))
    };

    checkoutMutation.mutate(saleData, {
      onSuccess: () => {
        setIsReceiptOpen(false);
        setCart([]);
        setSelectedCustomerId("");
        setIsProcessing(false);
        setIsMobileCartOpen(false);
        toast.success("Sale Authorized");
        queryClient.invalidateQueries({ queryKey: ['customers', activeBranchId] });
      },
      onError: () => setIsProcessing(false)
    });
  };

  return (
    <div className="flex flex-col xl:flex-row w-full h-[calc(100vh-80px)] bg-slate-50 overflow-hidden relative">

      {/* LEFT COLUMN: Inventory Grid & Search Engine */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden w-full">
        <header className="mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Point of Sale</h1>

            {/* BRAND IDENTITY ACCENT HEADER */}
            <div className="flex flex-row items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm w-fit">
              <div className="flex items-center space-x-1.5 border-r border-slate-100 pr-2.5">
                <Building2 className="text-blue-600" size={13} />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pharmacyName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="text-slate-400" size={11} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activeBranchName}</span>
              </div>
            </div>
          </div>

          {/* VIEW TOGGLE SWITCH */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </header>

        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex items-center mb-4 sm:mb-6 focus-within:border-blue-400/70 transition-colors duration-200">
          <Search className="text-slate-400 mr-3 sm:mr-4" size={20} />
          <input
            type="text"
            placeholder="Search catalog by medicine descriptor name..."
            className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm sm:text-base placeholder-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTROLLER CONTAINER FOR INVENTORY CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto pb-24 xl:pb-10 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              No active products match search definitions.
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW LAYOUT (Fluid columns formatted with elegant micro-interactions) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredMedicines.map((med) => (
                <button
                  key={med.id}
                  disabled={med.stockLevel <= 0}
                  onClick={() => addToCart(med)}
                  className={`p-5 rounded-[2rem] border transition-all text-left bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-95 duration-300 flex flex-col justify-between h-32 relative overflow-hidden group border-b-4 ${med.stockLevel <= 0 ? 'opacity-40 bg-slate-100 cursor-not-allowed border-slate-200' : 'border-slate-100 hover:border-blue-500'}`}
                >
                  {/* Subtle inner background gradient accent card ornament shape */}
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-blue-600 opacity-[0.01] group-hover:opacity-[0.04] transition-all duration-300 scale-70 group-hover:scale-125" />

                  <h4 className="font-black text-slate-800 text-xs sm:text-sm line-clamp-2 w-full leading-snug tracking-tight group-hover:text-blue-600 transition-colors duration-200 z-10">{med.name}</h4>
                  <div className="flex justify-between items-end mt-2 w-full z-10">
                    <span className="text-blue-600 font-black text-base sm:text-lg tracking-tight">₵{med.sellingPrice.toFixed(2)}</span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg transition-all duration-300 ${med.stockLevel > 10 ? 'text-slate-400 bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600' : 'text-rose-600 bg-rose-50'}`}>
                      {med.stockLevel} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* COMPACT LIST VIEW LAYOUT */
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="p-3 sm:p-4 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                    <th className="p-3 sm:p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                    <th className="p-3 sm:p-4 pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((med) => (
                    <tr
                      key={med.id}
                      onClick={() => med.stockLevel > 0 && addToCart(med)}
                      className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer transition-colors ${med.stockLevel <= 0 ? 'opacity-40 bg-slate-100/50' : ''}`}
                    >
                      <td className="p-3 sm:p-4 pl-6 font-bold text-slate-700 text-xs sm:text-sm">{med.name}</td>
                      <td className="p-3 sm:p-4 font-black text-blue-600 text-xs sm:text-sm text-right">₵{med.sellingPrice.toFixed(2)}</td>
                      <td className="p-3 sm:p-4 pr-6 text-right">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${med.stockLevel > 10 ? 'bg-slate-50 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>
                          {med.stockLevel} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING ACTION FLOATER BUTTON FOR MOBILE DRAWER CART TRACKER */}
      <button
        onClick={() => setIsMobileCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 xl:hidden bg-slate-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border border-slate-800"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {totalItemsCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-rose-500 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {totalItemsCount}
            </span>
          )}
        </div>
        <span className="font-black text-xs tracking-wider uppercase pr-1">View Cart</span>
      </button>

      {/* RIGHT SIDEBAR COLUMN: CHECKOUT ENGINE */}
      <div className={`
        fixed inset-y-0 right-0 z-50 xl:relative xl:z-0
        w-full sm:w-[440px] xl:w-[420px] 2xl:w-[450px]
        bg-white border-l border-slate-100 flex flex-col h-full shadow-2xl transition-transform duration-500 ease-in-out
        ${isMobileCartOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
      `}>
        {/* SIDEBAR CONTAINER HEADER */}
        <div className="p-4 sm:p-6 flex items-center justify-between xl:block shrink-0">
          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] text-white flex items-center gap-3 flex-1 xl:w-full shadow-lg">
            <ShoppingCart size={18} />
            <h3 className="font-black text-sm sm:text-lg italic tracking-wider">CHECKOUT PANEL</h3>
          </div>
          {/* Close Cart Sheet Trigger for Screen Layout Viewports below XL break */}
          <button
            onClick={() => setIsMobileCartOpen(false)}
            className="xl:hidden ml-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SIDEBAR INNER SCROLLABLE WORKSPACE COMPONENT LAYER */}
        <div className="flex-1 px-4 sm:px-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Context</label>
            <div className="flex gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex-1 bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold text-slate-700 outline-none border border-slate-100/70"
              >
                <option value="">Walk-in Customer</option>
                {allCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.debtBalance > 0 ? `(₵${c.debtBalance.toFixed(2)})` : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsRegModalOpen(true)}
                className="bg-slate-50 border border-slate-100 px-4 rounded-xl sm:rounded-2xl text-slate-400 hover:text-blue-600 transition-colors"
              >
                <UserPlus size={18} />
              </button>
            </div>
          </div>

          {/* RENDERING ITEMS EMBEDDED IN BASKET ENGINE CURRENT STATE */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-300 font-bold text-xs italic">
                Cart empty. Tap available items to add.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-100/70 shadow-inner">
                  <div className="flex-1 truncate pr-3">
                    <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                    <p className="text-blue-600 font-black text-[10px]">₵{item.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200">
                      <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-0.5 text-xs font-black hover:text-blue-600 transition-colors">-</button>
                      <span className="px-1 font-black text-[11px] text-slate-700">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-0.5 text-xs font-black hover:text-blue-600 transition-colors">+</button>
                    </div>
                    <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS AND ACCUMULATED CHECKOUT BILL CALCULATIONS SUMMARY CONTAINER */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">₵{subtotal.toFixed(2)}</span>
          </div>
          <button
            disabled={!cart.length || isProcessing}
            onClick={() => setIsReceiptOpen(true)}
            className="w-full py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase text-xs sm:text-sm tracking-wider shadow-xl shadow-blue-600/10 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Confirm Transaction"}
          </button>
        </div>
      </div>

      {/* QUICK REGISTRATION CONTAINER DIALOG BLOCK */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quick Register</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch: {activeBranchName}</p>
              </div>
              <button onClick={() => setIsRegModalOpen(false)} className="text-slate-300 hover:text-slate-600 p-1">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRegSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <input
                  placeholder="Full Name" required
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-slate-300"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Phone Number" required
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-slate-300"
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <input
                  placeholder="Email (Optional)" type="email"
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-slate-300"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <textarea
                placeholder="Residential Address"
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white h-20 sm:h-24 resize-none transition-all placeholder-slate-300"
                value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <button
                type="submit" disabled={registerMutation.isPending}
                className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex justify-center items-center"
              >
                {registerMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Complete Onboarding"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal Overlay Display Module Wrapper */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <ReceiptModal
            cart={cart.map(item => ({ ...item, price: item.sellingPrice }))}
            total={subtotal}
            customerName={allCustomers.find(c => c.id == selectedCustomerId)?.name || "Walk-in"}
            userName={user?.name}
            branchName={activeBranchName}
            isProcessing={isProcessing}
            onConfirm={handleCompleteSale}
            onCancel={() => setIsReceiptOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SalesPage;