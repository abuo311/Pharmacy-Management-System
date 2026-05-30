import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, Loader2, Building2, Activity, ShieldCheck, TrendingUp } from 'lucide-react';
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

  // Color options registry with adjusted clear opacities for image contrast visibility
  const themeColorMap = {
    'theme-blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500', text: 'text-blue-600', disabled: 'disabled:bg-blue-400', overlay: 'from-blue-600/30 via-slate-950/80 to-slate-950/95' },
    'theme-emerald': { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500', text: 'text-emerald-600', disabled: 'disabled:bg-emerald-400', overlay: 'from-emerald-600/30 via-slate-950/80 to-slate-950/95' },
    'theme-purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500', text: 'text-purple-600', disabled: 'disabled:bg-purple-400', overlay: 'from-purple-600/30 via-slate-950/80 to-slate-950/95' },
    'theme-slate': { bg: 'bg-slate-800', hover: 'hover:bg-slate-900', ring: 'focus:ring-slate-500', text: 'text-slate-800', disabled: 'disabled:bg-slate-600', overlay: 'from-slate-700/30 via-slate-950/85 to-slate-950/95' }
  };

  const theme = themeColorMap[activeTheme] || themeColorMap['theme-blue'];

  // --- FETCH LOCAL THEMES AND IDENTITY METADATA ---
  useEffect(() => {
    const storedTheme = localStorage.getItem('app-ui-theme') || 'theme-blue';
    setActiveTheme(storedTheme);
    document.documentElement.classList.add(storedTheme);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4 sm:p-6 selection:bg-blue-500 selection:text-white">

      {/* IMMERSIVE GLOBAL PICTURE BACKGROUND COMPONENT */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1631549916768-4119b295f266?q=80&w=1600&auto=format&fit=crop"
          alt="Pharmacist Staff and Drugs Background"
          className="w-full h-full object-cover opacity-90 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className={`absolute inset-0 bg-gradient-to-tr ${theme.overlay}`} />
        <div className="absolute inset-0 bg-slate-950/10" />
      </div>

      {/* --- FLOATING BACKGROUND MOCKUP VISUALS --- */}
      {/* Floating Stock Tracker Mockup Card */}
      <div className="hidden xl:flex absolute top-[15%] left-[10%] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <TrendingUp size={20} />
        </div>
        <div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Stock Valuation</p>
          <h4 className="text-white font-black text-base">₵142,850.00</h4>
        </div>
      </div>

      {/* Floating Live Integrity Sync Mockup Card */}
      <div className="hidden xl:flex absolute bottom-[15%] right-[10%] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl items-center gap-4 animate-in fade-in slide-in-from-top-8 duration-1000 delay-500">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl animate-pulse">
          <Activity size={20} />
        </div>
        <div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Sync Integrity</p>
          <h4 className="text-white font-black text-sm flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Operational
          </h4>
        </div>
      </div>

      {/* CENTERED LOGIN FORM CONTAINER CARD */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 z-10 animate-in fade-in zoom-in-95 duration-500">

        <div className="text-center mb-8">
          {/* DYNAMIC LOGO CONTAINER */}
          <div className={`${brandInfo.logo ? 'bg-white p-1' : theme.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md overflow-hidden border border-slate-200 transform hover:rotate-6 transition-transform duration-300`}>
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center animate-bounce">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
            <input
              {...register("username", { required: "Username is required" })}
              className={`w-full border rounded-xl p-3.5 text-sm font-bold bg-slate-50/50 outline-none transition-all ${errors.username ? 'border-red-400 focus:ring-2 focus:ring-red-100' : `border-slate-200 focus:bg-white ${theme.ring}`}`}
              placeholder="e.g. admin"
            />
            {errors.username && <p className="text-red-500 text-xs font-bold mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full border rounded-xl p-3.5 text-sm font-bold bg-slate-50/50 outline-none transition-all ${errors.password ? 'border-red-400 focus:ring-2 focus:ring-red-100' : `border-slate-200 focus:bg-white ${theme.ring}`}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${theme.bg} text-white py-4 rounded-xl font-black text-sm ${theme.hover} ${theme.disabled} transition-all flex items-center justify-center shadow-lg active:scale-[0.99] mt-2 relative overflow-hidden group`}
          >
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:animate-[shine_0.8s_ease-in-out]" />
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

        {/* FOOTER METADATA DESCRIPTIONS */}
        <div className="mt-8 text-center border-t border-slate-100 pt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 {brandInfo.name}</p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;