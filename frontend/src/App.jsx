import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';

import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import LoginPage from './features/auth/LoginPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import CustomersPage from './pages/CustomersPage';
import UsersPage from './pages/UsersPage';
import ProcurementPage from './components/ProcurementPage';
import ReportsPage from './pages/ReportsPage';
import SuppliersPage from './pages/SuppliersPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import SettingsPage from './pages/SettingsPage';
import AddPrescriptionForm from './pages/AddPrescriptionForm';

import { Loader2 } from 'lucide-react';

/**
 * ✅ Role Guard Component
 * Prevents unauthorized roles from accessing specific pages
 */
const RoleGuard = ({ allowedRoles, children }) => {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const ProtectedWrapper = ({ isAuthenticated, isReady }) => {
  if (isAuthenticated && !isReady) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  // ✅ Explicitly added logout hook listener reference from store instance
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isReady = !!user;
  const branchId = user?.branchId ?? null;

  // ✅ Enforce Logout & Clear Auth Session Store on Page Refresh / App Load
  useEffect(() => {
    // Clear the active session tracking values from localStorage persistence
    localStorage.removeItem('auth-storage'); 
    
    // Clear state smoothly using our extracted logout action
    logout();
  }, [logout]);

  // Global Theme Initialization Hook Sync
  useEffect(() => {
    const applyGlobalThemeToken = () => {
      const activeTheme = localStorage.getItem('app-ui-theme') || 'theme-blue';
      const root = document.documentElement;
      
      // Clear all possible theme class variations
      const themeProfiles = ['theme-blue', 'theme-emerald', 'theme-purple', 'theme-slate'];
      themeProfiles.forEach(t => root.classList.remove(t));
      
      // Mount the newly applied theme selector token class
      root.classList.add(activeTheme);
    };

    // Initialize layout class on startup
    applyGlobalThemeToken();

    // Listen across components for theme customization events
    window.addEventListener('storage', applyGlobalThemeToken);
    window.addEventListener('appThemeChanged', applyGlobalThemeToken);
    
    return () => {
      window.removeEventListener('storage', applyGlobalThemeToken);
      window.removeEventListener('appThemeChanged', applyGlobalThemeToken);
    };
  }, []);

  if (isAuthenticated && !isReady) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* AUTH */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
        />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedWrapper isAuthenticated={isAuthenticated} isReady={isReady} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales-history" element={<SalesHistoryPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/prescriptions/new" element={<AddPrescriptionForm />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Procurement restricted to Admin/Pharmacist/Manager */}
          <Route 
            path="/procurement" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PHARMACIST', 'MANAGER']}>
                <ProcurementPage branchId={branchId} />
              </RoleGuard>
            } 
          />

          {/* Suppliers restricted to Admin/Pharmacist/Manager */}
          <Route 
            path="/suppliers" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PHARMACIST', 'MANAGER']}>
                <SuppliersPage />
              </RoleGuard>
            } 
          />

          {/* Reports restricted to Admin/Manager only */}
          <Route 
            path="/reports" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                <ReportsPage />
              </RoleGuard>
            } 
          />

          {/* User Management strictly Admin only */}
          <Route 
            path="/users" 
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <UsersPage />
              </RoleGuard>
            } 
          />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;