import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Save, Pill, MapPin, Loader2 } from 'lucide-react';
import { medicineApi, categoryApi } from '../api/axiosConfig'; 
import toast from 'react-hot-toast';

const MedicineForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const queryClient = useQueryClient();
  const activeBranchId = 1; 

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    price: '',
    sellingPrice: '',
    stockLevel: 0,
    minAlertLevel: 5,
    expiryDate: '',
    shelfLocation: '',
    prescriptionRequired: false,
    category: { id: '' }
  });

  const formatForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll({
        headers: { 'X-Branch-Id': activeBranchId }
      });
      const data = res.data?.content || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category load failed", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories(); 
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name || '',
          manufacturer: initialData.manufacturer || '',
          price: initialData.price || initialData.supplyPrice || '',
          sellingPrice: initialData.sellingPrice || '',
          stockLevel: initialData.stockLevel || 0,
          minAlertLevel: initialData.minAlertLevel || 5,
          expiryDate: formatForInput(initialData.expiryDate),
          shelfLocation: initialData.shelfLocation || '',
          prescriptionRequired: initialData.prescriptionRequired || false,
          category: { id: initialData.category?.id || '' }
        });
      } else {
        setFormData({
          name: '', manufacturer: '', price: '', sellingPrice: '',
          stockLevel: 0, minAlertLevel: 5, expiryDate: '',
          shelfLocation: '', prescriptionRequired: false, category: { id: '' }
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      price: Number(formData.price),
      sellingPrice: Number(formData.sellingPrice || formData.price),
      category: { id: Number(formData.category.id) }
    };

    try {
      const config = { headers: { 'X-Branch-Id': activeBranchId } };
      if (initialData) {
        await medicineApi.updateMedicine(initialData.id, payload, config);
        toast.success("Medicine updated successfully!");
      } else {
        await medicineApi.saveMedicine(payload, config);
        toast.success("Added to branch inventory!");
      }

      await queryClient.invalidateQueries({ queryKey: ['medicines', activeBranchId] });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      {/* Sidebar Container - flex flex-col is the key here */}
      <div className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* FIXED HEADER */}
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
              <Pill size={20} />
            </div>
            <div>
              <h3 className="text-slate-800 font-black text-xl tracking-tight">
                {initialData ? 'Edit Product' : 'New Medicine'}
              </h3>
              <div className="flex items-center gap-1 text-blue-600">
                <MapPin size={10} />
                <span className="text-[9px] font-black uppercase tracking-tighter">Branch Scope: Nkoranza</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* SCROLLABLE FORM BODY */}
        <form id="medicine-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Product Name</label>
              <input required type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Manufacturer</label>
              <input type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.manufacturer}
                onChange={e => setFormData({...formData, manufacturer: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
              <select required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.category?.id || ''}
                onChange={e => setFormData({ ...formData, category: { id: e.target.value } })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Shelf Location</label>
              <input type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.shelfLocation}
                onChange={e => setFormData({...formData, shelfLocation: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Supply Price (GHS)</label>
              <input required type="number" step="0.01"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest ml-1">Selling Price (GHS)</label>
              <input required type="number" step="0.01"
                className="w-full px-4 py-3 bg-emerald-50/30 border-emerald-100 text-emerald-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-50 outline-none transition-all"
                value={formData.sellingPrice}
                onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expiry Date</label>
              <input type="date" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest ml-1">Stock Level</label>
              <input type="number"
                className="w-full px-4 py-3 bg-blue-50/30 border-blue-100 text-blue-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                value={formData.stockLevel}
                onChange={e => setFormData({...formData, stockLevel: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Prescription Required</span>
            <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.prescriptionRequired}
              onChange={e => setFormData({...formData, prescriptionRequired: e.target.checked})}
            />
          </div>
        </form>

        {/* FIXED FOOTER - Always visible at the bottom */}
        <footer className="p-8 border-t border-slate-100 flex gap-4 bg-white shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">
            Discard
          </button>
          <button type="submit" form="medicine-form" disabled={loading}
            className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-slate-300">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Processing...' : (initialData ? 'Update Product' : 'Register Medicine')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MedicineForm;