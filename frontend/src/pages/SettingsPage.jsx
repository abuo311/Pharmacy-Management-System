import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Store, Bell, Loader2, Tag, Plus, Trash2, X, MapPin, Palette, Check, Building2, Mail, Phone, Clock, FileText, Edit2 } from 'lucide-react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pharmacy"); // Default view set to Pharmacy Identity

  // Data State
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // --- PHARMACY PROFILE IDENTITY STATE ---
  const [pharmacyDetails, setPharmacyDetails] = useState({
    pharmacyName: '',
    contactEmail: '',
    phoneNumber: '',
    addressLocation: '',
    taxIdentificationNumber: '',
    currencySymbol: 'GHS',
    logoData: '',
    motto: '',
    workingDays: '',
    workingHours: ''
  });

  // App Theme Preferences State
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('app-ui-theme') || 'theme-blue';
  });

  // Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Form States
  const [newCategory, setNewCategory] = useState({ name: '', color: 'bg-blue-100 text-blue-600' });
  const [newBranch, setNewBranch] = useState({ name: '', location: '', type: 'Retail', active: true });
  
  // --- NEW EDIT BRANCH INLINE TOGGLE VIEW STATE ---
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editBranchForm, setEditBranchForm] = useState({ name: '', location: '', type: 'Retail', active: true });

  const colorOptions = [
    { label: 'Blue', value: 'bg-blue-100 text-blue-600' },
    { label: 'Emerald', value: 'bg-emerald-100 text-emerald-600' },
    { label: 'Purple', value: 'bg-purple-100 text-purple-600' },
    { label: 'Rose', value: 'bg-rose-100 text-rose-600' },
    { label: 'Amber', value: 'bg-amber-100 text-amber-600' }
  ];

  // System Layout Core Themes Configurations
  const uiThemeOptions = [
    { id: 'theme-blue', name: 'Classic Blue', baseColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', textColor: 'text-blue-600' },
    { id: 'theme-emerald', name: 'Organic Emerald', baseColor: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-700', textColor: 'text-emerald-600' },
    { id: 'theme-purple', name: 'Royal Purple', baseColor: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', textColor: 'text-purple-600' },
    { id: 'theme-slate', name: 'Midnight Charcoal', baseColor: 'bg-slate-800', hoverColor: 'hover:bg-slate-900', textColor: 'text-slate-800' }
  ];

  // Find currently active theme config details helper
  const currentThemeConfig = uiThemeOptions.find(t => t.id === activeTheme) || uiThemeOptions[0];

  useEffect(() => {
    fetchPharmacySettings();
    fetchCategories();
    fetchBranches();
  }, []);

  // Actively update layout context configurations when theme is changed
  useEffect(() => {
    const root = document.documentElement;
    uiThemeOptions.forEach(theme => root.classList.remove(theme.id));
    root.classList.add(activeTheme);
    localStorage.setItem('app-ui-theme', activeTheme);
  }, [activeTheme]);

  // --- API CALLS ---
  const fetchPharmacySettings = async () => {
    try {
      const res = await api.get('/settings/pharmacy');
      if (res.data) setPharmacyDetails(res.data);
    } catch (err) {
      toast.error("Failed to load pharmacy profile branding details");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { toast.error("Failed to load categories"); }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) { toast.error("Failed to load branches"); }
  };

  // --- ACTIONS ---
  const handleUpdatePharmacyDetails = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/settings/pharmacy', pharmacyDetails);
      toast.success("Pharmacy configurations saved cleanly!");
      window.dispatchEvent(new Event('pharmacyDetailsChanged'));
    } catch (err) {
      toast.error("Error saving store branding details context layout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file image size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPharmacyDetails(prev => ({ ...prev, logoData: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/categories', newCategory);
      toast.success(`${newCategory.name} added!`);
      setIsCatModalOpen(false);
      setNewCategory({ name: '', color: 'bg-blue-100 text-blue-600' });
      fetchCategories();
    } catch (err) { toast.error("Error creating category"); }
    finally { setIsLoading(false); }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/branches', newBranch);
      toast.success(`${newBranch.name} branch registered!`);
      setIsBranchModalOpen(false);
      setNewBranch({ name: '', location: '', type: 'Retail', active: true });
      fetchBranches();
    } catch (err) { toast.error("Error creating branch"); }
    finally { setIsLoading(false); }
  };

  const handleUpdateBranch = async (e, id) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/branches/${id}`, editBranchForm);
      toast.success("Branch ledger changes saved!");
      setEditingBranchId(null);
      fetchBranches();
    } catch (err) {
      toast.error("Could not complete branch info modification");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingBranch = (branch) => {
    setEditingBranchId(branch.id);
    setEditBranchForm({
      name: branch.name,
      location: branch.location,
      type: branch.type || 'Retail',
      active: branch.active !== undefined ? branch.active : true
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category removed");
      fetchCategories();
    } catch (err) { toast.error("Cannot delete category with active products"); }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success("Branch removed");
      if (editingBranchId === id) setEditingBranchId(null);
      fetchBranches();
    } catch (err) { toast.error("Could not remove branch"); }
  };

  const getThemeButtonStyles = (tabId) => {
    if (activeTab === tabId) {
      return `${currentThemeConfig.baseColor} text-white shadow-lg`;
    }
    return 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50';
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-160px)] md:h-[calc(100vh-160px)] p-4 md:p-6">
      {/* Sidebar Navigation */}
      <div className="flex flex-row overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 md:w-64 shrink-0 no-scrollbar snap-x">
        <button onClick={() => setActiveTab("pharmacy")} className={`snap-center shrink-0 w-auto md:w-full flex items-center justify-center md:justify-start gap-3 p-3 md:p-4 rounded-2xl font-bold transition-all text-sm md:text-base ${getThemeButtonStyles("pharmacy")}`}>
          <Building2 size={20} /> <span className="whitespace-nowrap">Store Identity</span>
        </button>
        <button onClick={() => setActiveTab("categories")} className={`snap-center shrink-0 w-auto md:w-full flex items-center justify-center md:justify-start gap-3 p-3 md:p-4 rounded-2xl font-bold transition-all text-sm md:text-base ${getThemeButtonStyles("categories")}`}>
          <Tag size={20} /> <span className="whitespace-nowrap">Categories</span>
        </button>
        <button onClick={() => setActiveTab("branches")} className={`snap-center shrink-0 w-auto md:w-full flex items-center justify-center md:justify-start gap-3 p-3 md:p-4 rounded-2xl font-bold transition-all text-sm md:text-base ${getThemeButtonStyles("branches")}`}>
          <Store size={20} /> <span className="whitespace-nowrap">Branches</span>
        </button>
        <button onClick={() => setActiveTab("preferences")} className={`snap-center shrink-0 w-auto md:w-full flex items-center justify-center md:justify-start gap-3 p-3 md:p-4 rounded-2xl font-bold transition-all text-sm md:text-base ${getThemeButtonStyles("preferences")}`}>
          <Palette size={20} /> <span className="whitespace-nowrap">Theme Settings</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">

        {/* PHARMACY STORE IDENTITY TAB */}
        {activeTab === 'pharmacy' && (
          <form onSubmit={handleUpdatePharmacyDetails} className="flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div>
                <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                  <Building2 className={currentThemeConfig.textColor} size={20} /> Pharmacy Identity Settings
                </h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Configure metadata used on cross-system billing modules</p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full sm:w-auto`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Details
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              
              {/* BRAND IMAGE LOGO FILE UPLOADER FIELD */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center sm:text-left">
                <div className="shrink-0 w-20 h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {pharmacyDetails.logoData ? (
                    <img src={pharmacyDetails.logoData} alt="Pharmacy Corporate Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 w-full">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Official Brand Emblem</span>
                  <p className="text-[11px] text-slate-400 font-bold mb-2">Accepts transparent web files under 2MB</p>
                  <input type="file" accept="image/*" id="logo-file-input" className="hidden" onChange={handleLogoUpload} />
                  <label htmlFor="logo-file-input" className={`cursor-pointer text-center px-4 py-1.5 rounded-lg text-xs font-black text-white ${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} transition-colors w-full sm:w-auto max-w-xs`}>
                    Choose Image File
                  </label>
                </div>
              </div>

              {/* PHARMACY CORPORATE BRAND NAME */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Pharmacy Corporate Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input required type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.pharmacyName} onChange={e => setPharmacyDetails({...pharmacyDetails, pharmacyName: e.target.value})} />
                </div>
              </div>

              {/* BRAND CORPORATE MOTTO */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Pharmacy Slogan / Motto</label>
                <input type="text" placeholder="e.g., Your Health, Our Shared Priority" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                  value={pharmacyDetails.motto || ''} onChange={e => setPharmacyDetails({...pharmacyDetails, motto: e.target.value})} />
              </div>

              {/* OPERATIONAL WORKING DAYS */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Operating Business Days</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input required type="text" placeholder="e.g., Monday - Saturday" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.workingDays || ''} onChange={e => setPharmacyDetails({...pharmacyDetails, workingDays: e.target.value})} />
                </div>
              </div>

              {/* OPERATIONAL TIME HOURS */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Operating Business Hours</label>
                <input required type="text" placeholder="e.g., 8:00 AM - 10:00 PM" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                  value={pharmacyDetails.workingHours || ''} onChange={e => setPharmacyDetails({...pharmacyDetails, workingHours: e.target.value})} />
              </div>

              {/* CONTACT SUPPORT NUMBER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Contact Phone Line</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input required type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.phoneNumber} onChange={e => setPharmacyDetails({...pharmacyDetails, phoneNumber: e.target.value})} />
                </div>
              </div>

              {/* ADMINISTRATIVE EMAIL */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input required type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.contactEmail} onChange={e => setPharmacyDetails({...pharmacyDetails, contactEmail: e.target.value})} />
                </div>
              </div>

              {/* BASE LOCAL CURRENCY SYMBOL CONFIGURATION */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Primary System Currency Symbol</label>
                <select className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors cursor-pointer"
                  value={pharmacyDetails.currencySymbol} onChange={e => setPharmacyDetails({...pharmacyDetails, currencySymbol: e.target.value})}>
                  <option value="GHS">Ghanaian Cedi (GHS)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              {/* CORPORATE TAX CODE (TIN) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tax Identification Number (TIN)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input type="text" placeholder="GHA-XXXXXX-X" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.taxIdentificationNumber || ''} onChange={e => setPharmacyDetails({...pharmacyDetails, taxIdentificationNumber: e.target.value})} />
                </div>
              </div>

              {/* STREET LOCATION ADDRESS */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Headquarters Street Address Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input required type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-slate-400 transition-colors"
                    value={pharmacyDetails.addressLocation} onChange={e => setPharmacyDetails({...pharmacyDetails, addressLocation: e.target.value})} />
                </div>
              </div>

            </div>
          </form>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <>
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Tag className={currentThemeConfig.textColor} size={20} /> Category Management
              </h3>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className={`${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white px-5 py-2 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto`}
              >
                <Plus size={18} /> Add Category
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${cat.color}`}>{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.productCount || 0} Products Linked</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BRANCHES TAB */}
        {activeTab === 'branches' && (
          <>
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Store className={currentThemeConfig.textColor} size={20} /> Branch Locations
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className={`${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white px-5 py-2 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto`}
              >
                <Plus size={18} /> New Branch
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => {
                const isEditing = editingBranchId === branch.id;
                
                return (
                  <div key={branch.id} className={`p-5 rounded-2xl border transition-all duration-200 ${isEditing ? 'border-slate-300 bg-white shadow-md ring-2 ring-slate-100' : 'border-slate-100 bg-slate-50/50 group'}`}>
                    
                    {/* INLINE EDIT FORM VIEW MODE */}
                    {isEditing ? (
                      <form onSubmit={(e) => handleUpdateBranch(e, branch.id)} className="space-y-3">
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Modify Branch Settings</span>
                          <button type="button" onClick={() => setEditingBranchId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        
                        <input 
                          required 
                          type="text" 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-slate-400 transition-colors"
                          value={editBranchForm.name} 
                          onChange={(e) => setEditBranchForm({ ...editBranchForm, name: e.target.value })} 
                        />
                        
                        <input 
                          required 
                          type="text" 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-slate-400 transition-colors"
                          value={editBranchForm.location} 
                          onChange={(e) => setEditBranchForm({ ...editBranchForm, location: e.target.value })} 
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-[11px] cursor-pointer"
                            value={editBranchForm.type} 
                            onChange={(e) => setEditBranchForm({ ...editBranchForm, type: e.target.value })}
                          >
                            <option value="Retail">Retail</option>
                            <option value="Hub">Hub</option>
                          </select>
                          
                          <select 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-[11px] cursor-pointer"
                            value={editBranchForm.active ? "true" : "false"} 
                            onChange={(e) => setEditBranchForm({ ...editBranchForm, active: e.target.value === "true" })}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className={`w-full ${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors mt-1`}
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                          Save Adjustments
                        </button>
                      </form>
                    ) : (
                      
                      /* STANDARD READ VIEW MODE */
                      <div className="flex flex-col h-full justify-between gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm">{branch.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {branch.location}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => startEditingBranch(branch)} 
                              className="text-slate-400 hover:text-blue-600 p-1"
                              title="Edit Inline"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBranch(branch.id)} 
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${branch.type === 'Hub' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {branch.type || 'Retail'}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${branch.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PREFERENCES & SYSTEM THEME TAB */}
        {activeTab === 'preferences' && (
          <>
            <div className="p-4 md:p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Palette className="text-slate-700" size={20} /> Theme Settings & Styling
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Choose your overall system dashboard brand appearance preference</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uiThemeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setActiveTheme(theme.id);
                      localStorage.setItem('app-ui-theme', theme.id);
                      window.dispatchEvent(new Event('appThemeChanged'));
                      toast.success(`${theme.name} theme activated`);
                    }}
                    className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${activeTheme === theme.id ? 'border-slate-800 bg-slate-50 shadow-sm ring-2 ring-slate-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg ${theme.baseColor}`} />
                      <span className="font-bold text-sm text-slate-700">{theme.name}</span>
                    </div>
                    {activeTheme === theme.id && (
                      <div className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Live Dynamic Preview</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${currentThemeConfig.baseColor} shrink-0`} />
                  <p className="text-xs text-slate-600 font-medium">
                    Main dashboard panels, tracking metrics badges, and system interaction buttons will adapt to this profile setup option layout automatically.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">New Category</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <input required type="text" placeholder="Category Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setNewCategory({ ...newCategory, color: opt.value })} className={`p-3 rounded-xl text-xs font-black border-2 transition-all ${opt.value} ${newCategory.color === opt.value ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-60'}`}>{opt.label}</button>
                ))}
              </div>
              <button type="submit" disabled={isLoading} className={`w-full ${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors`}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isBranchModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">New Branch Registration</h2>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Branch Identifier Name</label>
                <input required type="text" placeholder="e.g., Minamo Pharmacy Main" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Geographic Street Location</label>
                <input required type="text" placeholder="e.g., Techiman Station" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" value={newBranch.location} onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Operational Branch Profile Type</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-black text-sm cursor-pointer" value={newBranch.type} onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}>
                  <option value="Retail">Retail Storefront</option>
                  <option value="Hub">Centralized Warehousing Hub</option>
                </select>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full ${currentThemeConfig.baseColor} ${currentThemeConfig.hoverColor} text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors mt-2`}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Register Branch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;