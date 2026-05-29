import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, Loader2, Building2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/axiosConfig';

const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  
  // --- SYSTEM BRAND IDENTITY STATES ---
  const [brandInfo, setBrandInfo] = useState({ name: "PharmaWeb", logo: "" });
  const [activeTheme, setActiveTheme] = useState("theme-blue");

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Color options registry to match active configurations across form elements dynamically
  const themeColorMap = {
    'theme-blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500', text: 'text-blue-600', disabled: 'disabled:bg-blue-400' },
    'theme-emerald': { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500', text: 'text-emerald-600', disabled: 'disabled:bg-emerald-400' },
    'theme-purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500', text: 'text-purple-600', disabled: 'disabled:bg-purple-400' },
    'theme-slate': { bg: 'bg-slate-800', hover: 'hover:bg-slate-900', ring: 'focus:ring-slate-500', text: 'text-slate-800', disabled: 'disabled:bg-slate-600' }
  };

  const theme = themeColorMap[activeTheme] || themeColorMap['theme-blue'];

  // --- FETCH LOCAL THEMES AND IDENTITY METADATA ---
  useEffect(() => {
    // 1. Pull localized app stylesheet token
    const storedTheme = localStorage.getItem('app-ui-theme') || 'theme-blue';
    setActiveTheme(storedTheme);
    document.documentElement.classList.add(storedTheme);

    // 2. Fetch business brand details anonymously (unprotected public GET endpoint)
    const fetchBrandData = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data) {
          setBrandInfo({
            name: res.data.pharmacyName || "PharmaWeb",
            logo: res.data.logoData || ""
          });
        }
      } catch (err) {
        console.log("Using local design configuration defaults");
      }
    };
    
    fetchBrandData();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await api.post('/auth/login', {
        username: data.username,
        password: data.password
      });

      const { token, ...user } = response.data;
      login(user, token);
      console.log("Login successful! Token and Role stored.");
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || error.response?.data || "Server connection failed.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 transition-colors duration-300">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          {/* DYNAMIC LOGO CONTAINER */}
          <div className={`${brandInfo.logo ? 'bg-white p-1' : theme.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md overflow-hidden border border-slate-100`}>
            {brandInfo.logo ? (
              <img src={brandInfo.logo} alt="Corporate Identity logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-white" size={28} />
            )}
          </div>
          
          {/* DYNAMIC BUSINESS NAME */}
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            {brandInfo.name.split(' ')[0]}
            <span className={theme.text}>
              {brandInfo.name.split(' ').slice(1).join(' ') || ' Web'}
            </span>
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1">Sign in to access system dashboard</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
            <input 
              {...register("username", { required: "Username is required" })}
              className={`w-full border rounded-xl p-3 text-sm font-bold bg-slate-50/50 outline-none transition-all ${errors.username ? 'border-red-400 focus:ring-2 focus:ring-red-100' : `border-slate-200 ${theme.ring}`}`} 
              placeholder="e.g. admin"
            />
            {errors.username && <p className="text-red-500 text-xs font-bold mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full border rounded-xl p-3 text-sm font-bold bg-slate-50/50 outline-none transition-all ${errors.password ? 'border-red-400 focus:ring-2 focus:ring-red-100' : `border-slate-200 ${theme.ring}`}`} 
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full ${theme.bg} text-white py-3.5 rounded-xl font-black text-sm ${theme.hover} ${theme.disabled} transition-all flex items-center justify-center shadow-lg active:scale-[0.99]`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 {brandInfo.name}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;