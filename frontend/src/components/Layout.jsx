import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Pill, ShoppingCart, History, LogOut,
  MapPin, Users, UserRoundCog, FileBarChart, Truck, FileText, Settings,
  ChevronLeft, ChevronRight, PackageSearch, Lock, Building2
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axiosConfig';

/**
 * Helper component for individual Sidebar links with injected theme dynamic properties
 */
const SidebarItem = ({ to, icon: Icon, label, isCollapsed, themeStyles }) => {
  const playHoverSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.05;
    audio.play().catch(() => {});
  };

  return (
    <NavLink
      to={to}
      onMouseEnter={isCollapsed ? playHoverSound : undefined}
      className={({ isActive }) =>
        `flex items-center p-3 mb-2 rounded-xl transition-all duration-500 group relative ${
          isActive
            ? `${themeStyles.activeBg} text-white shadow-lg ${themeStyles.shadowColor}`
            : `${themeStyles.navHoverText} ${themeStyles.navHoverBg}`
        } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`
      }
    >
      <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isCollapsed ? 'w-12 scale-110' : 'w-6 mr-3'}`}>
        <Icon size={isCollapsed ? 24 : 20} strokeWidth={2.5} />
      </div>
      {!isCollapsed && (
        <span className="font-bold text-sm whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2">
          {label}
        </span>
      )}
    </NavLink>
  );
};

const Layout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setBranch = useAuthStore((state) => state.setBranch);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [branches, setBranches] = useState([]);
  
  // --- SYSTEM BRAND IDENTITY STATES ---
  const [brandInfo, setBrandInfo] = useState({ name: "PharmaWeb", logo: "" });

  // Track layout local theme profile context
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('app-ui-theme') || 'theme-blue';
  });

  // Keep theme and global name details synchronized live with settings panels via events
  useEffect(() => {
    const handleThemeUpdate = () => {
      setActiveTheme(localStorage.getItem('app-ui-theme') || 'theme-blue');
    };

    const fetchBrandData = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setBrandInfo({
            name: res.data.pharmacyName,
            logo: res.data.logoData || ""
          });
        }
      } catch (err) {
        console.log("Error loading layout branding details info profile details config options");
      }
    };

    // Initial triggers
    fetchBrandData();

    // Listeners fired from other actions or forms
    window.addEventListener('storage', handleThemeUpdate);
    window.addEventListener('appThemeChanged', handleThemeUpdate);
    window.addEventListener('pharmacySettingsUpdated', fetchBrandData); // Handles instant refreshes on form submit

    return () => {
      window.removeEventListener('storage', handleThemeUpdate);
      window.removeEventListener('appThemeChanged', handleThemeUpdate);
      window.removeEventListener('pharmacySettingsUpdated', fetchBrandData);
    };
  }, []);

  // Theme styling token definition properties mapper
  const getThemeClasses = () => {
    switch (activeTheme) {
      case 'theme-emerald':
        return {
          sidebarBg: 'bg-emerald-950 border-emerald-900',
          borderAccent: 'border-emerald-900',
          textAccent: 'text-emerald-400',
          bgAccent: 'bg-emerald-600',
          bgHover: 'hover:bg-emerald-500',
          activeBg: 'bg-emerald-600',
          shadowColor: 'shadow-emerald-500/30',
          ringColor: 'ring-emerald-500/20',
          navHoverBg: 'hover:bg-emerald-900/60 hover:text-white',
          navHoverText: 'text-emerald-200/60'
        };
      case 'theme-purple':
        return {
          sidebarBg: 'bg-purple-950 border-purple-900',
          borderAccent: 'border-purple-900',
          textAccent: 'text-purple-400',
          bgAccent: 'bg-purple-600',
          bgHover: 'hover:bg-purple-500',
          activeBg: 'bg-purple-600',
          shadowColor: 'shadow-purple-500/30',
          ringColor: 'ring-purple-500/20',
          navHoverBg: 'hover:bg-purple-900/60 hover:text-white',
          navHoverText: 'text-purple-200/60'
        };
      case 'theme-slate':
        return {
          sidebarBg: 'bg-slate-900 border-slate-800',
          borderAccent: 'border-slate-800',
          textAccent: 'text-slate-400',
          bgAccent: 'bg-slate-700',
          bgHover: 'hover:bg-slate-600',
          activeBg: 'bg-slate-700',
          shadowColor: 'shadow-slate-500/30',
          ringColor: 'ring-slate-500/20',
          navHoverBg: 'hover:bg-slate-800 hover:text-white',
          navHoverText: 'text-slate-400'
        };
      case 'theme-blue':
      default:
        return {
          sidebarBg: 'bg-slate-900 border-slate-800',
          borderAccent: 'border-slate-800',
          textAccent: 'text-blue-500',
          bgAccent: 'bg-blue-600',
          bgHover: 'hover:bg-blue-700',
          activeBg: 'bg-blue-600',
          shadowColor: 'shadow-blue-500/40',
          ringColor: 'ring-blue-600/20',
          navHoverBg: 'hover:bg-slate-800 hover:text-white',
          navHoverText: 'text-slate-400'
        };
    }
  };

  const themeStyles = getThemeClasses();

  useEffect(() => {
    if (!user) return;
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches');
        setBranches(response.data || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, [user?.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleBranchChange = (e) => {
    const selectedId = parseInt(e.target.value);
    if (selectedId && selectedId !== user?.branchId) {
      const selectedBranch = branches.find(b => b.id === selectedId);
      if (selectedBranch) {
        setBranch({ branchId: selectedBranch.id, branchName: selectedBranch.name });
      }
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.replace('/', '');
    if (!path) return 'Dashboard Overview';
    const titles = {
      sales: 'Point of Sale',
      'sales-history': 'Transaction Logs',
      inventory: 'Inventory Management',
      procurement: 'Inventory Procurement',
      customers: 'Customer Directory',
      users: 'Staff Management',
      reports: 'Business Reports',
      suppliers: 'Supplier Directory',
      prescriptions: 'Prescription Validation',
      settings: 'System Settings'
    };
    return titles[path] || 'Pharmacy Management';
  };

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        Loading System Context...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} ${themeStyles.sidebarBg} p-4 flex flex-col shadow-2xl z-50 transition-all duration-500 border-r relative`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-10 ${themeStyles.bgAccent} ${themeStyles.bgHover} text-white p-1 rounded-full border-2 border-slate-50 hover:scale-110 transition-all z-[60]`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* BRAND LOGO AND HEADER SECTION */}
        <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'px-2 gap-3'}`}>
          <div className={`shrink-0 ${brandInfo.logo ? 'bg-white p-0.5' : themeStyles.bgAccent} w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden`}>
            {brandInfo.logo ? (
              <img src={brandInfo.logo} alt="Brand Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-white" size={18} />
            )}
          </div>
          
          {!isCollapsed && (
            <h1 className="text-white text-base font-black tracking-tight uppercase leading-tight break-words flex-1">
              {brandInfo.name}
            </h1>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          <SidebarItem to="/sales" icon={ShoppingCart} label="Point of Sale" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          
          {hasAnyRole(['ADMIN', 'MANAGER', 'PHARMACIST']) && (
             <SidebarItem to="/inventory" icon={Pill} label="Inventory" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          )}

          {hasAnyRole(['ADMIN', 'MANAGER', 'PHARMACIST']) && (
            <>
              <SidebarItem to="/procurement" icon={PackageSearch} label="Procurement" isCollapsed={isCollapsed} themeStyles={themeStyles} />
              <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" isCollapsed={isCollapsed} themeStyles={themeStyles} />
            </>
          )}

          <SidebarItem to="/sales-history" icon={History} label="Sales History" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          <SidebarItem to="/customers" icon={Users} label="Customers" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          
          {hasAnyRole(['ADMIN', 'PHARMACIST']) && (
            <SidebarItem to="/prescriptions" icon={FileText} label="Prescriptions" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          )}
          
          {hasAnyRole(['ADMIN', 'MANAGER']) && (
            <SidebarItem to="/reports" icon={FileBarChart} label="Reports" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          )}

          {hasRole('ADMIN') && (
            <SidebarItem to="/users" icon={UserRoundCog} label="Staff" isCollapsed={isCollapsed} themeStyles={themeStyles} />
          )}

          <SidebarItem to="/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} themeStyles={themeStyles} />
        </nav>

        <div className={`pt-4 border-t ${themeStyles.borderAccent}`}>
          <div className={`flex items-center px-2 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className={`w-10 h-10 rounded-xl ${themeStyles.bgAccent} flex items-center justify-center text-white font-black uppercase ring-2 ${themeStyles.ringColor}`}>
              {user?.username?.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="ml-3 text-sm overflow-hidden">
                <p className="text-white font-bold truncate">{user?.username}</p>
                <p className={`${themeStyles.textAccent} text-[10px] uppercase font-black tracking-wider`}>{user?.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex flex-col">
            <h3 className="text-slate-800 font-black text-lg">{getPageTitle()}</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {new Date().toDateString()}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
              <MapPin size={16} className={`${themeStyles.textAccent} mr-2`} />
              {hasRole('ADMIN') ? (
                <select
                  className="bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer"
                  value={user?.branchId || ""}
                  onChange={handleBranchChange}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-black text-slate-700">
                  {user?.branchName || "Main Branch"}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;