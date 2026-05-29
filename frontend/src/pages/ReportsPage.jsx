import React, { useState, useEffect, useMemo } from 'react';
import { Download, PieChart, Wallet, Tag } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsPage = () => {
  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Main Branch';
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  
  const { data: apiResponse, isLoading: isSummaryLoading } = useReports(activeBranchId, period);
  const [transactions, setTransactions] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const fetchDetailedSales = async () => {
      setIsDataLoading(true);
      try {
        const response = await api.get('/sales', { 
          params: { branchId: activeBranchId, period: period } 
        });
        const data = response.data.content || response.data || [];
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch detailed sales:", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDetailedSales();
  }, [activeBranchId, period]);

  // ✅ FIXED: Robust Category Breakdown Calculation
  const categoryData = useMemo(() => {
    const breakdown = {};
    
    transactions.forEach(sale => {
      if (!sale || sale.status === 'REFUNDED') return;

      const items = sale.items || [];
      items.forEach(item => {
        // Support multiple nesting patterns for category names
        const catName = item.medicine?.category?.name || 
                        item.categoryName || 
                        'General';

        // Ensure math uses Numbers to fix the ₵0 issue
        const price = Number(item.unitPrice || item.medicine?.sellingPrice || 0);
        const qty = Number(item.quantity || 0);
        const itemRevenue = price * qty;
        
        if (!breakdown[catName]) {
          breakdown[catName] = { name: catName, revenue: 0, count: 0 };
        }
        breakdown[catName].revenue += itemRevenue;
        breakdown[catName].count += qty;
      });
    });

    return Object.values(breakdown).sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  const derivedDailyProfit = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.reduce((acc, sale) => {
      const saleDateStr = sale.saleDate?.split('T')[0];
      if (saleDateStr === todayStr && sale.status !== 'REFUNDED') {
        const saleProfit = (sale.items || []).reduce((sum, item) => {
          const sell = Number(item.unitPrice || item.medicine?.sellingPrice || 0);
          const cost = Number(item.medicine?.price || 0); 
          return sum + ((sell - cost) * (item.quantity || 0));
        }, 0);
        return acc + saleProfit;
      }
      return acc;
    }, 0);
  }, [transactions]);

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      return toast.error("No transaction details found for export.");
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`FINANCIAL REPORT - ${activeBranchName}`, 14, 20);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Report Period: ${period} | Total Records: ${transactions.length}`, 14, 30);

      const tableRows = transactions.map(t => [
        t.saleDate ? new Date(t.saleDate).toLocaleDateString() : 'N/A',
        t.id || 'N/A',
        `GHS ${Number(t.totalAmount || 0).toFixed(2)}`, 
        t.status || 'COMPLETED'
      ]);

      autoTable(doc, {
        head: [['Date', 'Transaction ID', 'Revenue', 'Status']],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        margin: { top: 40 }
      });

      doc.save(`PharmaWeb_Report_${period}.pdf`);
      toast.success("PDF Exported Successfully");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Export failed.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 p-3 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Business Reports</h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium uppercase tracking-widest">{activeBranchName} — {period}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="month" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            className="border-2 p-2 rounded-xl text-sm font-bold text-slate-600 outline-none w-full sm:w-auto" 
          />
          <button 
            onClick={handleExport} 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center hover:bg-black transition-all w-full sm:w-auto"
          >
            <Download size={18} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Revenue" value={apiResponse?.totalRevenue} isLoading={isSummaryLoading} />
        <StatCard title="Total Cost" value={apiResponse?.totalCost} isLoading={isSummaryLoading} />
        <StatCard title="Today's Profit" value={derivedDailyProfit} isLoading={isDataLoading} />
        <StatCard title="Monthly Profit" value={apiResponse?.netProfit} isLoading={isSummaryLoading} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black text-slate-800 flex items-center uppercase text-xs tracking-widest">
              <Tag size={16} className="mr-2 text-blue-600" /> Revenue by Category
            </h4>
          </div>
          
          <div className="space-y-4">
            {isDataLoading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-2xl w-full" />)
            ) : categoryData.length > 0 ? (
              categoryData.map((cat, idx) => (
                <div key={cat.name} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                    <span className="text-xs font-black text-slate-900">
                       ₵{cat.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-blue-600' : 'bg-slate-400'}`}
                      style={{ width: `${(cat.revenue / (apiResponse?.totalRevenue || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic text-center py-10">No category data available.</p>
            )}
          </div>
        </div>

        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-100">
          <div className="relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl w-fit mb-6">
              <PieChart size={24} />
            </div>
            <h5 className="font-black text-xl mb-2">Profit Insight</h5>
            <p className="text-blue-100 text-sm leading-relaxed">
              Your highest performing category is <span className="font-bold text-white">
                {categoryData[0]?.name || 'N/A'}
              </span>, contributing to {categoryData[0] ? ((categoryData[0].revenue / (apiResponse?.totalRevenue || 1)) * 100).toFixed(1) : 0}% of total revenue.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-tighter">Avg Daily Profit</span>
              <span className="font-black text-lg">₵{((apiResponse?.netProfit || 0) / 30).toFixed(2)}</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, isLoading, highlight }) => (
  <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-300 ${
    highlight 
    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
    : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-300'
  }`}>
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      {title}
    </p>
    <div className="mt-3 md:mt-4">
      {isLoading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter">
          ₵{Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h3>
      )}
    </div>
  </div>
);

export default ReportsPage;