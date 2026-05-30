import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Pill, ShoppingCart, History, LogOut,
  MapPin, Users, UserRoundCog, FileBarChart, Truck, FileText, Settings,
  ChevronLeft, ChevronRight, PackageSearch, Building2, Menu, X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axiosConfig';

const SidebarItem = ({ to, icon: Icon, label, isCollapsed, themeStyles, onCloseMobile }) => {
  const playHoverSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.05;
    audio.play().catch(() => {});
  };

  return (
    <NavLink
      to={to}
      onClick={onCloseMobile}
      onMouseEnter={isCollapsed ? playHoverSound : undefined}
      className={({ isActive }) =>
        `flex items-center p-3 mb-2 rounded-xl transition-all duration-500 group relative ${
          isActive
            ? `${themeStyles.activeBg} text-white shadow-lg ${themeStyles.shadowColor}`
            : `${themeStyles.navHoverText} ${themeStyles.navHoverBg}`
        } ${isCollapsed ? 'md:justify-center md:px-0' : 'px-3'}`
      }
    >
      <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isCollapsed ? 'md:w-12 md:scale-110' : 'w-6 mr-3'}`}>
        <Icon size={isCollapsed ? 24 : 20} strokeWidth={2.5} />
      </div>
      <span className={`font-bold text-sm whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 ${isCollapsed ? 'md:hidden' : 'block'}`}>
        {label}
      </span>
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [brandInfo, setBrandInfo] = useState({ name: "PharmaWeb", logo: "" });

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('app-ui-theme') || 'theme-blue';
  });

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
        console.log("Error loading layout branding details");
      }
    };

    fetchBrandData();

    window.addEventListener('storage', handleThemeUpdate);
    window.addEventListener('appThemeChanged', handleThemeUpdate);
    window.addEventListener('pharmacySettingsUpdated', fetchBrandData);

    return () => {
      window.removeEventListener('storage', handleThemeUpdate);
      window.removeEventListener('appThemeChanged', handleThemeUpdate);
      window.removeEventListener('pharmacySettingsUpdated', fetchBrandData);
    };
  }, []);

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

  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-wider text-xs">
        Loading System Context...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* 1. MOBILE BACKDROP GLASS OVERLAY */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* 2. SIDEBAR NAVIGATION CONTAINER */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 p-4 flex flex-col shadow-2xl transition-all duration-500 border-r
        md:static md:translate-x-0
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'} 
        ${themeStyles.sidebarBg}
      `}>
        
        {/* Collapse Toggle Control Trigger */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-10 ${themeStyles.bgAccent} ${themeStyles.bgHover} text-white p-1 rounded-full border-2 border-slate-50 hover:scale-110 transition-all z-[60]`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 top-5 text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800 bg-slate-900 md:hidden transition-colors"
        >
          <X size={18} />
        </button>

        {/* BRAND LOGO AND HEADER SECTION */}
        <div className={`mb-10 mt-2 md:mt-0 flex items-center ${isCollapsed ? 'md:justify-center' : 'px-2 gap-3'}`}>
          <div className={`shrink-0 ${brandInfo.logo ? 'bg-white p-0.5' : themeStyles.bgAccent} w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden`}>
            {brandInfo.logo ? (
              <img src={brandInfo.logo} alt="Brand Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-white" size={18} />
            )}
          </div>
          
          <h1 className={`text-white text-base font-black tracking-tight uppercase leading-tight break-words flex-1 ${isCollapsed ? 'md:hidden' : 'block'}`}>
            {brandInfo.name}
          </h1>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 overflow-y-auto pr-1 select-none [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-md">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          <SidebarItem to="/sales" icon={ShoppingCart} label="Point of Sale" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          
          {hasAnyRole(['ADMIN', 'MANAGER', 'PHARMACIST']) && (
             <SidebarItem to="/inventory" icon={Pill} label="Inventory" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          )}

          {hasAnyRole(['ADMIN', 'MANAGER', 'PHARMACIST']) && (
            <>
              <SidebarItem to="/procurement" icon={PackageSearch} label="Procurement" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
              <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
            </>
          )}

          <SidebarItem to="/sales-history" icon={History} label="Sales History" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          <SidebarItem to="/customers" icon={Users} label="Customers" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          
          {hasAnyRole(['ADMIN', 'PHARMACIST']) && (
            <SidebarItem to="/prescriptions" icon={FileText} label="Prescriptions" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          )}
          
          {hasAnyRole(['ADMIN', 'MANAGER']) && (
            <SidebarItem to="/reports" icon={FileBarChart} label="Reports" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          )}

          {hasRole('ADMIN') && (
            <SidebarItem to="/users" icon={UserRoundCog} label="Staff" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
          )}

          <SidebarItem to="/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} themeStyles={themeStyles} onCloseMobile={() => setIsMobileOpen(false)} />
        </nav>
      </aside>

      {/* 3. APP INNER SCREEN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* RESPONSIVE UNIQUE TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Hamburger Trigger */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 md:hidden hover:bg-slate-100 transition-colors shrink-0"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col min-w-0">
              <h3 className="text-slate-800 font-black text-sm sm:text-lg truncate">{getPageTitle()}</h3>
              <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
                {new Date().toDateString()}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: UTILITIES + PREMIUM USER PROFILE MENU */}
          <div className="flex items-center gap-4 shrink-0 relative">
            {/* Branch Selector Badge */}
            <div className="flex items-center bg-slate-50 border border-slate-200 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl max-w-[140px] sm:max-w-none">
              <MapPin size={14} className={`${themeStyles.textAccent} mr-1 sm:mr-2 shrink-0`} />
              {hasRole('ADMIN') ? (
                <select
                  className="bg-transparent text-xs sm:text-sm font-black text-slate-700 outline-none cursor-pointer min-w-0"
                  value={user?.branchId || ""}
                  onChange={handleBranchChange}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs sm:text-sm font-black text-slate-700 truncate">
                  {user?.branchName || "Main Branch"}
                </span>
              )}
            </div>

            {/* Profile Element Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className={`w-9 h-9 rounded-full ${themeStyles.bgAccent} flex items-center justify-center text-white font-black uppercase ring-2 ${themeStyles.ringColor} shrink-0 text-sm`}>
                  {user?.username?.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-slate-800 font-bold text-xs truncate max-w-[100px]">{user?.username}</p>
                  <p className="text-slate-400 text-[9px] uppercase font-black tracking-wider">{user?.role}</p>
                </div>
              </button>

              {/* Dynamic User Dropdown Actions Popover */}
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 sm:hidden">
                      <p className="text-slate-800 font-bold text-sm truncate">{user?.username}</p>
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider">{user?.role}</p>
                    </div>
                    
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center px-4 py-3 text-rose-500 hover:bg-rose-50 font-bold text-xs transition-colors gap-2.5"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTAINER VIEWPORT FOR CHILDREN */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;