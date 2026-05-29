import React, { useMemo, useState, useEffect } from 'react';
import { 
  Pill, TrendingUp, MapPin, AlertTriangle, Loader2, 
  BarChart3, PackageX, PackagePlus, CalendarClock, Activity, Building2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useMedicine } from '../hooks/useMedicine';
import { saleApi } from '../api/medicineApi';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore';

const formatGHS = (amount) => `₵${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const StatCard = ({ icon: Icon, label, value, color, subtext, borderHoverColor }) => (
  <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 border-b-4 ${borderHoverColor}`}>
    {/* Subtle background glow element on hover */}
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${color} opacity-[0.02] group-hover:opacity-[0.07] transition-all duration-500 scale-75 group-hover:scale-125`} />
    
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-1.5">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
        {subtext && (
          <div className="flex items-center space-x-1">
            <span className={`w-1 h-1 rounded-full ${color}`} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{subtext}</p>
          </div>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl ${color} bg-opacity-[0.08] group-hover:bg-opacity-100 text-slate-700 transition-all duration-300 transform group-hover:rotate-6`}>
        <Icon className={`${color.replace('bg-', 'text-')} group-hover:text-white transition-colors duration-300`} size={22} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;
  const activeBranchName = user?.branchName || 'Nkoranza';
  
  const [pharmacyName, setPharmacyName] = useState("PharmaWeb");
  const { medicines, isLoading: medLoading } = useMedicine(activeBranchId);

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', activeBranchId],
    queryFn: () => saleApi.getAllSales(activeBranchId).then(res => res.data)
  });

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

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dailyTotal = sales
        .filter(s => s.saleDate?.startsWith(date) && s.status !== 'REFUNDED')
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        revenue: dailyTotal
      };
    });
  }, [sales]);

  // Expanded Inventory Stats
  const stats = useMemo(() => {
    if (!medicines || !Array.isArray(medicines)) 
        return { totalValue: 0, expired: 0, lowStock: 0, count: 0, outOfStock: 0, overStock: 0, nearExpiry: 0 };
    
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    return medicines.reduce((acc, med) => {
      const unitCost = med.price || med.supplyPrice || 0;
      const stock = med.stockLevel || 0;
      const minLevel = med.minAlertLevel || 10;
      const maxLevel = med.maxAlertLevel || 100;
      const expiry = med.expiryDate ? new Date(med.expiryDate) : null;

      acc.totalValue += (unitCost * stock);
      acc.count++;

      // Stock logic
      if (stock === 0) acc.outOfStock++;
      else if (stock <= minLevel) acc.lowStock++;
      else if (stock >= maxLevel) acc.overStock++;

      // Expiry logic
      if (expiry && expiry < now) acc.expired++;
      else if (expiry && expiry < ninetyDaysFromNow) acc.nearExpiry++;

      return acc;
    }, { totalValue: 0, expired: 0, lowStock: 0, count: 0, outOfStock: 0, overStock: 0, nearExpiry: 0 });
  }, [medicines]);

  if (medLoading || salesLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Syncing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* TOP COMPACT IDENTITY BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white w-fit px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2 border-b sm:border-b-0 sm:border-r border-slate-100 pb-2 sm:pb-0 sm:pr-3">
          <Building2 className="text-blue-600" size={16} />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider break-words max-w-xs">
            {pharmacyName}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="text-slate-400" size={14} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Location Branch: <span className="text-blue-600 font-black">{activeBranchName}</span>
          </p>
        </div>
      </div>

      {/* TOP ROW STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} label="Inventory Value" value={formatGHS(stats.totalValue)} color="bg-emerald-600" borderHoverColor="hover:border-emerald-500" subtext="Current valuation" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} color="bg-amber-600" borderHoverColor="hover:border-amber-500" subtext="Reorder point reached" />
        <StatCard icon={PackageX} label="Out of Stock" value={stats.outOfStock} color="bg-rose-600" borderHoverColor="hover:border-rose-500" subtext="Urgent action required" />
        <StatCard icon={CalendarClock} label="Near Expiry" value={stats.nearExpiry} color="bg-indigo-600" borderHoverColor="hover:border-indigo-500" subtext="Expiring within 90 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Revenue Performance</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">7-Day Sales Trend</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(value) => `₵${value}`} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => [formatGHS(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISTRIBUTION & ANALYTICS */}
        <div className="space-y-6">
            {/* OVERSTOCK CARD */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group border-b-4 hover:border-purple-500">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <PackagePlus size={18} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Overstock Items</p>
                    </div>
                </div>
                <h4 className="text-3xl font-black text-slate-800 tracking-tight">{stats.overStock}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Exceeding maximum stock thresholds
                </p>
            </div>

            {/* HEALTH METER */}
            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 border-b-4 hover:border-blue-500">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Inventory Health</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Activity size={16} className="animate-pulse" />
                    </div>
                </div>
                <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {(((stats.count - (stats.lowStock + stats.outOfStock + stats.expired)) / stats.count) * 100).toFixed(1)}%
                </p>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-3 shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${((stats.count - (stats.lowStock + stats.outOfStock + stats.expired)) / stats.count) * 100}%` }} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 mt-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total SKUs: <span className="text-slate-700">{stats.count}</span></div>
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-wider text-right">Expired: <span>{stats.expired}</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;