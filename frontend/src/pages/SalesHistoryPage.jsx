import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Clock, User, ChevronRight, RotateCcw, X, ShoppingBag, Loader2, MapPin, Printer, TrendingUp
} from 'lucide-react';
import { saleApi } from '../api/medicineApi';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

const SalesHistoryPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("Minamo");
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Receipt_${selectedSale?.transactionId || 'Sale'}`,
  });

  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Nkoranza';

  // --- FETCH PHARMACY GLOBAL BRANDING ---
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

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', activeBranchId],
    queryFn: async () => {
      const res = await saleApi.getAllSales();
      const data = res.data;
      const rawSales = Array.isArray(data) ? data : (data?.content || []);
      return rawSales;
    }
  });

  const refundMutation = useMutation({
    mutationFn: (saleId) => saleApi.processRefund(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', activeBranchId] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success("Refund processed and stock restored!");
      setShowRefundModal(false);
      setSelectedSale(null);
    },
    onError: () => toast.error("Failed to process refund.")
  });

  // --- EXTRACT CUSTOMER NAME SAFELY ---
  const getCustomerName = (sale) => {
    if (!sale) return "Walk-in Customer";
    if (sale.customer) {
      if (typeof sale.customer === 'object') {
        return sale.customer.name || sale.customer.fullName || sale.customer.companyName || "Walk-in Customer";
      }
      if (typeof sale.customer === 'string') return sale.customer;
    }
    return sale.customerName || sale.clientName || sale.customer_name || "Walk-in Customer";
  };

  // --- EXTRACT CUSTOMER PHONE SAFELY ---
  const getCustomerPhone = (sale) => {
    if (!sale) return "No Contact";
    if (sale.customer && typeof sale.customer === 'object') {
      return sale.customer.phone || sale.customer.phoneNumber || sale.customer.mobile || "No Contact";
    }
    return sale.customerPhone || sale.phone || "No Contact";
  };

  const stats = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    const todayStr = localDate.toISOString().split('T')[0];

    const todaysSales = sales.filter(s => {
      if (!s.saleDate) return false;
      return s.saleDate.startsWith(todayStr);
    });

    const totalRev = todaysSales.reduce((acc, s) =>
      s.status === 'COMPLETED' || !s.status ? acc + (s.totalAmount || 0) : acc, 0
    );

    const totalRefunded = sales.reduce((acc, s) =>
      s.status === 'REFUNDED' ? acc + (s.totalAmount || 0) : acc, 0
    );

    return { totalRev, totalRefunded, count: sales.length };
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const search = searchTerm.toLowerCase();
      const customerName = getCustomerName(sale).toLowerCase();
      const customerPhone = getCustomerPhone(sale).toLowerCase();
      const transactionId = String(sale.transactionId || sale.id).toLowerCase();

      return (
        transactionId.includes(search) ||
        customerName.includes(search) ||
        customerPhone.includes(search)
      );
    });
  }, [sales, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return (
    <div className="flex flex-col h-[80vh] items-center justify-center space-y-4 w-full">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
        Fetching {activeBranchName} Records...
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 relative h-full p-1 sm:p-4 animate-in fade-in duration-500 w-full max-w-[1700px] mx-auto overflow-x-hidden">

      {/* PRINT RECEIPT BASKET TEMPLATE */}
      <div style={{ display: 'none' }}>
        <div ref={invoiceRef} className="p-8 text-black bg-white" style={{ width: '80mm', fontFamily: 'monospace' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{pharmacyName}</h2>
            <p style={{ fontSize: '10px' }}>{activeBranchName.toUpperCase()} BRANCH</p>
            <p style={{ fontSize: '10px' }}>{formatDate(selectedSale?.saleDate)}</p>
          </div>
          <div style={{ fontSize: '10px', marginBottom: '5px' }}>
            <p>ID: {selectedSale?.transactionId || selectedSale?.id}</p>
            <p>CUSTOMER: {getCustomerName(selectedSale).toUpperCase()}</p>
          </div>
          <table style={{ width: '100%', fontSize: '10px', marginTop: '10px' }}>
            <thead style={{ borderBottom: '1px solid black' }}>
              <tr>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedSale?.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.medicine?.name}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₵{(item.quantity * (item.priceAtSale || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid black', marginTop: '10px', paddingTop: '5px', textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold' }}>Total: ₵{selectedSale?.totalAmount?.toFixed(2)}</p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '8px', marginTop: '20px' }}>THANK YOU FOR YOUR PATRONAGE</p>
        </div>
      </div>

      {/* Top Banner Identity Segment */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm w-full">
        <div className="space-y-1.5">
          <div className="flex flex-row items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
            <div className="flex items-center space-x-1 border-r border-slate-200 pr-2.5">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{pharmacyName} OS</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <MapPin size={11} />
              <span className="text-[10px] font-black uppercase tracking-wider">{activeBranchName} Branch</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Financial Audits Ledger</h2>
        </div>
        <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-blue-100 shadow-sm self-stretch sm:self-auto text-center">
          Live Audit Sync
        </span>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Net Revenue</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">₵{stats.totalRev.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Branch Volume</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">{stats.count} Invoices</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-inner">
            <RotateCcw size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed Refunds</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">₵{stats.totalRefunded.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-h-[580px]">
        
        {/* LEFT COMPONENT LAYER: SCROLLABLE INVOICES ROW */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/40">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Transaction ID, customer name or phone..."
                className="w-full bg-white border border-slate-200/80 py-2.5 pl-11 pr-4 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Invoice Metadata</th>
                  <th className="px-6 py-4">Client Demographics</th>
                  <th className="px-6 py-4 text-blue-600">Settled Amount</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.map((sale) => {
                  const currentCustomerName = getCustomerName(sale);
                  const isWalkIn = currentCustomerName === "Walk-in Customer";
                  
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className={`group cursor-pointer transition-all duration-150 ${selectedSale?.id === sale.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-xs tracking-tight">#{sale.transactionId || `INV-${sale.id}`}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} className="text-slate-300" /> {formatDate(sale.saleDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className={`text-xs font-black ${isWalkIn ? 'text-slate-400 italic' : 'text-blue-600'}`}>
                          {currentCustomerName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {getCustomerPhone(sale)}
                        </p>
                      </td>
                      <td className="px-6 py-4.5 font-black text-xs text-slate-800">₵{(sale.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${sale.status === 'REFUNDED'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {sale.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COMPONENT LAYER: ACTION COMPONENT SIDEBAR SUMMARY */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[2.5rem] shadow-xl p-6 sm:p-7 flex flex-col text-white relative overflow-hidden border border-slate-900 group">
          <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-blue-600/10 blur-3xl group-hover:bg-blue-600/15 transition-all duration-500 pointer-events-none" />

          {selectedSale ? (
            <>
              <div className="relative z-10 border-b border-slate-900 pb-5 mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                    <User size={15} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest">Sale Summary</h4>
                    <p className={`text-base font-black tracking-tight truncate max-w-[200px] ${getCustomerName(selectedSale) === 'Walk-in Customer' ? 'text-slate-500 italic' : 'text-white'}`}>
                      {getCustomerName(selectedSale)}
                    </p>
                  </div>
                </div>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider">Originating Nodes: {activeBranchName}</p>
              </div>

              {/* Basket Listing Scroll Layer */}
              <div className="flex-1 overflow-y-auto space-y-3.5 custom-scrollbar pr-1 z-10 max-h-[340px]">
                {selectedSale.items?.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-900 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-black text-slate-200 tracking-tight">{item.medicine?.name}</p>
                      <p className="text-xs font-black text-blue-400">
                        ₵{(item.quantity * (item.priceAtSale || 0)).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      {item.quantity} Pack(s) • ₵{(item.priceAtSale || 0).toFixed(2)} unit index
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Button Execution Layer Footer */}
              <div className="mt-auto pt-6 border-t border-slate-900 space-y-4 z-10 bg-transparent">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest pb-0.5">Actual Remitted</span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">₵{(selectedSale.totalAmount || 0).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePrint()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/10"
                  >
                    <Printer size={14} /> Print
                  </button>
                  {selectedSale.status !== 'REFUNDED' && (
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-rose-600/20 text-rose-500 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-800 hover:border-rose-900/50 active:scale-95"
                    >
                      <RotateCcw size={14} /> Return
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 my-auto py-20">
              <ShoppingBag size={52} className="mb-3 text-slate-700" />
              <p className="font-black text-[10px] uppercase tracking-[0.25em] text-center text-slate-500">Select audit node invoice</p>
            </div>
          )}
        </div>
      </div>

      {/* REFUND CONFIRMATION DIALOG MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="p-1.5 bg-rose-100 rounded-lg">
                  <RotateCcw size={16} />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest">Process Stock Return</h3>
              </div>
              <button 
                onClick={() => setShowRefundModal(false)} 
                className="text-slate-400 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 font-medium leading-relaxed">
                <p>You are authorizing a formal refund payload for transaction identity <strong className="text-slate-800">#{selectedSale?.transactionId || selectedSale?.id}</strong>.</p>
                <p className="mt-1.5">Completing this process voids invoice metrics, marks balances as refunded, and reinstates inventory quantities.</p>
              </div>
              
              <button
                disabled={refundMutation.isPending}
                onClick={() => refundMutation.mutate(selectedSale.id)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-rose-600/10 flex items-center justify-center"
              >
                {refundMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={14} /> Reallocating Components...
                  </>
                ) : 'Confirm Refund & Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;