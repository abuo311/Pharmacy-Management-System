import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig'; 
import { useMedicine } from '../hooks/useMedicine';
import { Loader2, ShieldCheck, MapPin, Truck, Layers } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, "Required"),
  manufacturer: z.string().min(1, "Required"),
  price: z.coerce.number().min(0.01), 
  sellingPrice: z.coerce.number().min(0.01),
  stockLevel: z.coerce.number().min(0),
  minAlertLevel: z.coerce.number().min(1),
  expiryDate: z.string().min(1, "Required"),
  shelfLocation: z.string().min(1, "Required"),
  categoryId: z.string().min(1, "Required"),
  supplierId: z.string().min(1, "Required"),
  prescriptionRequired: z.boolean().default(false),
});

const AddMedicineForm = ({ onCancel, onSuccess, initialData = null }) => {
  const isEditMode = !!initialData;
  const authData = JSON.parse(localStorage.getItem('pharmacy-auth-storage'));
  const userBranchId = authData?.state?.user?.assignedBranch?.id;
  const displayBranchId = initialData?.branch?.id || initialData?.branchId || userBranchId || 1;

  const { addMedicine, updateMedicine } = useMedicine(displayBranchId);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { prescriptionRequired: false, stockLevel: 0, minAlertLevel: 10 }
  });

  const watchedCategoryId = useWatch({ control, name: 'categoryId' });
  const watchedSupplierId = useWatch({ control, name: 'supplierId' });

  useEffect(() => {
    const loadAndPopulate = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          api.get('/categories'),
          api.get('/suppliers')
        ]);
        setCategories(catRes.data || []);
        setSuppliers(supRes.data || []);

        if (initialData) {
          reset({
            ...initialData,
            expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : "",
            categoryId: initialData.category?.id?.toString() || initialData.categoryId?.toString() || "",
            supplierId: initialData.supplier?.id?.toString() || initialData.supplierId?.toString() || "",
            price: initialData.price || initialData.supplyPrice,
            sellingPrice: initialData.sellingPrice || initialData.selling_price
          });
        }
      } catch (err) { console.error("Initialization error", err); }
    };
    loadAndPopulate();
  }, [initialData, reset]);

  const selectedCategory = categories.find(c => c.id.toString() === watchedCategoryId)?.name || 'None';
  const selectedSupplier = suppliers.find(s => s.id.toString() === watchedSupplierId)?.name || 
                           suppliers.find(s => s.id.toString() === watchedSupplierId)?.companyName || 'None';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateMedicine({ id: initialData.id, data, branchId: displayBranchId });
      } else {
        await addMedicine(data);
      }
      toast.success("Inventory Updated");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded p-1 text-[11px] bg-slate-50 font-semibold focus:border-blue-400 outline-none transition-all";
  const labelClass = "font-bold text-slate-400 uppercase text-[9px] mb-0.5 block";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-x-3 gap-y-2 p-1 max-w-xl mx-auto">
      {/* Name and Manufacturer */}
      <div className="col-span-7">
        <label className={labelClass}>Medicine Name</label>
        <input {...register("name")} className={inputClass} placeholder="e.g. Paracetamol" />
        {errors.name && <p className="text-red-500 text-[8px] mt-0.5">{errors.name.message}</p>}
      </div>
      <div className="col-span-5">
        <label className={labelClass}>Manufacturer</label>
        <input {...register("manufacturer")} className={inputClass} />
      </div>

      {/* Dropdowns */}
      <div className="col-span-6">
        <label className={labelClass}>Category</label>
        <select {...register("categoryId")} className={inputClass}>
          <option value="">Select...</option>
          {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
        </select>
      </div>
      <div className="col-span-6">
        <label className={labelClass}>Supplier</label>
        <select {...register("supplierId")} className={inputClass}>
          <option value="">Select...</option>
          {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.companyName || s.name}</option>)}
        </select>
      </div>

      {/* Pricing and Location */}
      <div className="col-span-3">
        <label className={labelClass}>Supply ₵</label>
        <input type="number" step="0.01" {...register("price")} className={`${inputClass} bg-white text-blue-600`} />
      </div>
      <div className="col-span-3">
        <label className={labelClass}>Sell ₵</label>
        <input type="number" step="0.01" {...register("sellingPrice")} className={`${inputClass} bg-white text-emerald-600`} />
      </div>
      <div className="col-span-6">
        <label className={labelClass}>Shelf Location</label>
        <input {...register("shelfLocation")} className={inputClass} placeholder="e.g. A-12" />
      </div>

      {/* Stock and Expiry */}
      <div className="col-span-3">
        <label className={labelClass}>Stock</label>
        <input type="number" {...register("stockLevel")} className={inputClass} />
      </div>
      <div className="col-span-3">
        <label className={labelClass}>Min Alert</label>
        <input type="number" {...register("minAlertLevel")} className={inputClass} />
      </div>
      <div className="col-span-6">
        <label className={labelClass}>Expiry Date</label>
        <input type="date" {...register("expiryDate")} className={inputClass} />
      </div>

      {/* Status Bar & Summary Box */}
      <div className="col-span-7 flex items-center gap-2 p-1.5 bg-amber-50 rounded border border-amber-100">
        <ShieldCheck size={14} className="text-amber-600 shrink-0" />
        <div className="flex-1">
           <p className="text-[9px] font-black text-amber-900 uppercase leading-none">Prescription</p>
           <p className="text-[8px] text-amber-700 leading-tight">Regulatory control enabled</p>
        </div>
        <input type="checkbox" {...register("prescriptionRequired")} className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600" />
      </div>
      
      <div className="col-span-5 bg-blue-50 rounded p-1.5 border border-blue-100 flex flex-col justify-center text-[8px]">
        <div className="flex justify-between items-center border-b border-blue-100 mb-1 pb-0.5">
            <span className="font-bold text-blue-400">CONTEXT</span>
            <span className="font-black text-blue-700">BR-{displayBranchId}</span>
        </div>
        <p className="text-blue-500 truncate"><b>CAT:</b> {selectedCategory}</p>
        <p className="text-blue-500 truncate"><b>SUP:</b> {selectedSupplier}</p>
      </div>

      {/* Buttons */}
      <div className="col-span-12 flex justify-end gap-2 mt-1 border-t pt-2">
        <button type="button" onClick={onCancel} className="text-slate-400 font-bold uppercase text-[9px] hover:text-slate-600 px-2">Cancel</button>
        <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-5 py-1.5 rounded font-black uppercase text-[9px] shadow flex items-center gap-2 transition-all active:scale-95">
          {loading ? <Loader2 className="animate-spin" size={12} /> : (isEditMode ? "Save Changes" : "Register Item")}
        </button>
      </div>
    </form>
  );
};

export default AddMedicineForm;