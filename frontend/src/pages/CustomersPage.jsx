import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserPlus, Search, Phone, MapPin, Loader2, UserCheck, X, 
  CreditCard, Wallet, Award, MapPinned, Gift, LayoutGrid, List 
} from 'lucide-react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore'; 
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  
  // ✅ Get authenticated user context details
  const user = useAuthStore((state) => state.user);
  const activeBranchName = user?.branchName || 'Nkoranza';

  // ✅ Safely normalize branch ID tracking values
  const rawBranchId = user?.branchId || '1';
  const activeBranchId =
    typeof rawBranchId === 'string' && rawBranchId.includes(':')
      ? parseInt(rawBranchId.split(':')[0], 10)
      : parseInt(rawBranchId, 10) || 1;

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  
  const [royaltyCustomer, setRoyaltyCustomer] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // ✅ Local state configuration tracking backend configurations
  const [pharmacyName, setPharmacyName] = useState('Minamo Pharmacy');

  // Dynamically load the global pharmacy name from back-end settings context
  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside dashboard context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  // 2. Fetch Customers Data (Scoped via Normalized X-Branch-Id Header)
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', activeBranchId],
    queryFn: async () => {
      const res = await api.get('/customers', {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  // 3. Registration Mutation
  const registerMutation = useMutation({
    mutationFn: async (newCustomer) => {
      const res = await api.post('/customers/register', newCustomer, {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Customer registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers', activeBranchId] });
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data || 'Registration failed');
    }
  });

  // 4. Debt Payment Mutation
  const payDebtMutation = useMutation({
    mutationFn: async ({ id, amount }) => {
      const res = await api.put(`/customers/${id}/pay-debt?amount=${amount}`, {}, {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers', activeBranchId] });
      setSelectedCustomer(null);
      setPaymentAmount("");
    },
    onError: (error) => {
      toast.error(error.response?.data || 'Payment failed');
    }
  });

  // 5. Royalty Points Redemption Mutation
  const redeemRoyaltiesMutation = useMutation({
    mutationFn: async ({ id, points }) => {
      const res = await api.put(`/customers/${id}/redeem-royalties?points=${points}`, {}, {
        headers: { 'X-Branch-Id': activeBranchId }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Royalty points successfully redeemed!');
      queryClient.invalidateQueries({ queryKey: ['customers', activeBranchId] });
      setRoyaltyCustomer(null);
      setPointsToRedeem("");
    },
    onError: (error) => {
      toast.error(error.response?.data || 'Redemption failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Customer name is required");
    registerMutation.mutate(formData);
  };

  // Filter lists based safely on criteria strings
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  // Helper function to extract points safely regardless of backend property naming configurations
  const getPoints = (customer) => {
    return customer?.loyaltyPoints ?? customer?.loyaltyPointsBalance ?? 0;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 box-border overflow-x-hidden">
      
      {/* Top Banner Navigation & Context Control Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-full sm:w-auto">
          {/* ✅ Displays Main Pharmacy Name & Active Branch Meta */}
          <div className="flex flex-col mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[280px] sm:max-w-none">
              {pharmacyName}
            </span>
            <div className="flex items-center gap-1.5 text-blue-600 mt-0.5">
              <MapPinned size={13} className="flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">{activeBranchName} Branch</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">Customer Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block mt-0.5">Manage local members, balance ledgers, and reward tiers</p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* VIEW MODE TOGGLE SWITCH BUTTON CONTAINER */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl gap-0.5 items-center flex-shrink-0">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid Cards Layout"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Compact Row List"
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10 whitespace-nowrap"
          >
            <UserPlus size={16} className="flex-shrink-0" /> Register Member
          </button>
        </div>
      </div>

      {/* Global Search Interface bar */}
      <div className="bg-white p-1 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center group focus-within:border-blue-500 transition-all">
        <div className="p-2 sm:p-3 flex-shrink-0">
          <Search className="text-slate-400 group-focus-within:text-blue-500" size={18} />
        </div>
        <input 
          type="text" 
          placeholder={`Search customers in ${activeBranchName}...`} 
          className="w-full outline-none font-bold text-sm sm:text-base text-slate-700 p-2 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Container Content Segment Frame */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm text-center p-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Loading Database...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 border-2 border-dashed border-slate-200 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white p-4 sm:p-6 text-center">
          <p className="text-base sm:text-lg font-black text-slate-700 mb-1">No customers found</p>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mb-4 max-w-sm">There are no members registered to the {activeBranchName} branch matching your criteria yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] sm:text-xs font-black text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all"
          >
            + Add First Customer
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ORIGINAL GRID LAYOUT MODE - RESPONSIVELY ADAPTED */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm group relative overflow-hidden flex flex-col justify-between w-full min-w-0">
              <div>
                <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                    <UserCheck size={24} sm={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 min-w-0">
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-tighter border border-emerald-100 whitespace-nowrap">Verified Member</span>
                    {getPoints(customer) > 500 && (
                      <span className="bg-amber-50 text-amber-600 text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase flex items-center gap-1 border border-amber-100 whitespace-nowrap">
                        <Award size={10} className="flex-shrink-0" /> VIP Tier
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6 min-w-0">
                  <h3 className="font-black text-slate-800 text-lg sm:text-xl mb-1 sm:mb-1.5 tracking-tight truncate">{customer.name}</h3>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center text-slate-400 text-xs font-bold gap-2 min-w-0">
                      <Phone size={12} className="text-blue-400 flex-shrink-0" /> <span className="truncate">{customer.phone || 'No Phone Registered'}</span>
                    </div>
                    <div className="flex items-center text-slate-400 text-xs font-bold gap-2 min-w-0">
                      <MapPin size={12} className="text-blue-400 flex-shrink-0" /> <span className="truncate">{customer.address || 'Address not set'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-50 w-full">
                  <div className="bg-blue-50/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col justify-between min-w-0">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">Royalty Points</p>
                      <p className="font-black text-blue-600 text-base sm:text-lg flex items-baseline gap-0.5 truncate">
                        {getPoints(customer)} <span className="text-[9px] sm:text-[10px] text-blue-300 font-bold">pts</span>
                      </p>
                    </div>
                    {getPoints(customer) > 0 && (
                      <button 
                        onClick={() => setRoyaltyCustomer(customer)}
                        className="mt-2 text-[9px] sm:text-[10px] font-black text-blue-600 bg-white border border-blue-200 py-1 px-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1 min-w-0"
                      >
                        <Gift size={10} className="flex-shrink-0"/> <span className="truncate">Redeem</span>
                      </button>
                    )}
                  </div>
                  
                  <div className={`${customer.debtBalance > 0 ? 'bg-rose-50/50 border border-rose-100/50' : 'bg-emerald-50/50'} p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col justify-between min-w-0`}>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">Debt Balance</p>
                      <p className={`font-black text-base sm:text-lg truncate ${customer.debtBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₵{(customer.debtBalance || 0).toFixed(2)}
                      </p>
                    </div>
                    {customer.debtBalance > 0 && (
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="mt-2 text-[9px] sm:text-[10px] font-black text-rose-600 bg-white border border-rose-200 py-1 px-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1 min-w-0"
                      >
                        <CreditCard size={10} className="flex-shrink-0"/> <span className="truncate">Pay Debt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* COMPACT LIST ROW TABLE LAYOUT MODE - RESPONSIVELY ISOLATED WITH OVERFLOW-X */
        <div className="w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 overflow-x-auto shadow-sm custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="p-4 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Loyalty Points</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Debt Balance</th>
                <th className="p-4 pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions Ledger</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800 text-sm">{customer.name}</p>
                    <p className="text-slate-400 text-[11px] font-medium max-w-[180px] truncate">{customer.address || 'No address set'}</p>
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-600">{customer.phone || '—'}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center bg-blue-50 text-blue-700 font-black text-xs px-2.5 py-1 rounded-lg gap-1">
                      {getPoints(customer)} pts
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-black text-sm ${customer.debtBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₵{(customer.debtBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-center gap-2">
                      {getPoints(customer) > 0 && (
                        <button 
                          onClick={() => setRoyaltyCustomer(customer)}
                          className="text-[10px] font-black text-blue-600 bg-blue-50/50 py-1.5 px-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                        >
                          <Gift size={12}/> Redeem
                        </button>
                      )}
                      {customer.debtBalance > 0 ? (
                        <button 
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-[10px] font-black text-rose-600 bg-rose-50 py-1.5 px-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1"
                        >
                          <CreditCard size={12}/> Settle Debt
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-xl cursor-default">
                          Clear
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REGISTRATION MODAL - MOBILE ADAPTED RADIUS & PADDING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">New Member</h3>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">Registering to {activeBranchName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 p-1 sm:p-2 flex-shrink-0">
                <X size={24} sm={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Full Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Kwesi Mensah"
                  className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Phone</label>
                  <input 
                    type="text"
                    placeholder="024 XXX XXXX"
                    className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-blue-500 text-sm sm:text-base"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Email</label>
                  <input 
                    type="email"
                    placeholder="optional@mail.com"
                    className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-blue-500 text-sm sm:text-base"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Residential Address</label>
                <textarea 
                  placeholder="House No, Landmark, City..."
                  className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-blue-500 h-24 sm:h-28名 resize-none text-sm sm:text-base"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm"
              >
                {registerMutation.isPending ? <Loader2 className="animate-spin" /> : "Complete Member Onboarding"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE DEBT MODAL - MOBILE ADAPTED RADIUS & PADDING */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Settle Debt</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-300 hover:text-slate-600 flex-shrink-0">
                <X size={24} sm={28} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-rose-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-100 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Paying for</p>
                <p className="font-black text-rose-900 text-sm sm:text-base truncate">{selectedCustomer.name}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">
                  Amount to Pay
                </label>
                <div className="relative">
                  <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-base sm:text-lg">₵</span>
                  <input 
                    type="number" 
                    className="w-full p-4 sm:p-5 pl-10 sm:pl-12 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none font-black text-rose-600 focus:border-rose-500 text-xl sm:text-2xl"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <p className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-black text-rose-500 uppercase flex justify-between">
                  <span>Current Balance:</span>
                  <span>₵{selectedCustomer.debtBalance?.toFixed(2)}</span>
                </p>
              </div>

              <button 
                onClick={() => payDebtMutation.mutate({ id: selectedCustomer.id, amount: paymentAmount })}
                disabled={!paymentAmount || payDebtMutation.isPending}
                className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-rose-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 text-xs sm:text-sm"
              >
                {payDebtMutation.isPending ? <Loader2 className="animate-spin" /> : <><Wallet size={16}/> Post Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REDEEM ROYALTIES MODAL - MOBILE ADAPTED RADIUS & PADDING */}
      {royaltyCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Redeem Royalties</h3>
              <button onClick={() => setRoyaltyCustomer(null)} className="text-slate-300 hover:text-slate-600 flex-shrink-0">
                <X size={24} sm={28} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Redeeming points for</p>
                <p className="font-black text-blue-900 text-sm sm:text-base truncate">{royaltyCustomer.name}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">
                  Points to Deduct
                </label>
                <input 
                  type="number" 
                  className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl outline-none font-black text-blue-600 focus:border-blue-500 text-xl sm:text-2xl"
                  placeholder="0"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                />
                <p className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-black text-blue-500 uppercase flex justify-between">
                  <span>Available Points:</span>
                  <span>{getPoints(royaltyCustomer)} pts</span>
                </p>
              </div>

              <button 
                onClick={() => {
                  if (parseInt(pointsToRedeem, 10) > getPoints(royaltyCustomer)) {
                    return toast.error("Insufficient loyalty points balance");
                  }
                  redeemRoyaltiesMutation.mutate({ id: royaltyCustomer.id, points: pointsToRedeem });
                }}
                disabled={!pointsToRedeem || redeemRoyaltiesMutation.isPending}
                className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100 text-xs sm:text-sm"
              >
                {redeemRoyaltiesMutation.isPending ? <Loader2 className="animate-spin" /> : <><Gift size={16}/> Confirm Deduction</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;