import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, User, Phone, Mail, MapPin, Tag, Loader2, ChevronDown, Activity, Briefcase } from 'lucide-react';
import { useSuppliers, useSupplierCategories } from '../hooks/useSuppliers';

const supplierSchema = z.object({
  companyName: z.string().min(2, "Required"),
  supplierType: z.string().min(1, "Required"), 
  contactPerson: z.string().min(2, "Required"),
  phone: z.string().min(10, "Invalid phone"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  category: z.string().min(1, "Select category"),
  address: z.string().min(5, "Required"),
  status: z.string().default("Active")
});

const AddSupplierForm = ({ onSuccess, branchId, initialData }) => {
  const { createSupplier, updateSupplier } = useSuppliers(branchId);
  const { data: categories = [], isLoading: isLoadingCats } = useSupplierCategories(branchId);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { status: "Active", category: "", supplierType: "DISTRIBUTOR" }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        // CRITICAL FIX: If supplierType is missing in the DB record, 
        // fallback to category value so the dropdown updates visually.
        supplierType: initialData.supplierType || initialData.category || 'DISTRIBUTOR',
        phone: initialData.phone || initialData.phoneNumber || '', 
        status: initialData.status || 'Active'
      });
    } else {
      // Clear form when switching from Edit to New
      reset({ status: "Active", category: "", supplierType: "DISTRIBUTOR" });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const mutation = initialData ? updateSupplier : createSupplier;
    
    // Ensure ID is passed explicitly for the update mutation
    mutation.mutate({ ...data, id: initialData?.id, branchId }, {
      onSuccess: () => {
        reset();
        onSuccess();
      },
    });
  };

  const isPending = createSupplier.isPending || updateSupplier?.isPending;
  const currentStatus = watch("status");

  const inputClass = "w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all font-semibold text-slate-700 text-[11px] focus:border-blue-400 focus:bg-white";
  const labelClass = "text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 block ml-1";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-300";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-1 max-w-xl mx-auto">
      <div className="grid grid-cols-12 gap-x-3 gap-y-2.5">
        
        {/* Company Name */}
        <div className="col-span-12 lg:col-span-7">
          <label className={labelClass}>Company Name</label>
          <div className="relative">
            <Building2 className={iconClass} size={14} />
            <input {...register("companyName")} placeholder="e.g. Kinapharma Ltd" className={inputClass} />
          </div>
          {errors.companyName && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1">{errors.companyName.message}</p>}
        </div>

        {/* Supplier Role - Now dynamically linked */}
        <div className="col-span-12 lg:col-span-5">
          <label className={labelClass}>Supplier Role</label>
          <div className="relative">
            <Briefcase className={iconClass} size={14} />
            <select {...register("supplierType")} className={`${inputClass} appearance-none pr-8`}>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="IMPORTER">Importer</option>
              <option value="WHOLESALER">Wholesaler</option>
              <option value="RETAILER">Retailer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={12} />
          </div>
          {errors.supplierType && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1">{errors.supplierType.message}</p>}
        </div>

        {/* Account Status */}
        <div className="col-span-6">
          <label className={labelClass}>Status</label>
          <div className="relative">
            <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentStatus === 'Active' ? 'text-green-500' : 'text-red-400'}`} size={14} />
            <select {...register("status")} className={`${inputClass} appearance-none pr-8 ${currentStatus === 'Active' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={12} />
          </div>
        </div>

        {/* Category */}
        <div className="col-span-6">
          <label className={labelClass}>Supplier Category</label>
          <div className="relative">
            <Tag className={iconClass} size={14} />
            <select {...register("category")} disabled={isLoadingCats} className={`${inputClass} appearance-none pr-8`}>
              <option value="">{isLoadingCats ? 'Loading...' : 'Select Category'}</option>
              {categories.map((cat) => {
                const val = typeof cat === 'string' ? cat : (cat.name || cat.id);
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={12} />
          </div>
          {errors.category && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1">{errors.category.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="col-span-6">
          <label className={labelClass}>Phone Number</label>
          <div className="relative">
            <Phone className={iconClass} size={14} />
            <input {...register("phone")} placeholder="024 XXXXXXX" className={inputClass} />
          </div>
          {errors.phone && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1">{errors.phone.message}</p>}
        </div>

        {/* Contact Person */}
        <div className="col-span-6">
          <label className={labelClass}>Contact Person</label>
          <div className="relative">
            <User className={iconClass} size={14} />
            <input {...register("contactPerson")} placeholder="Full Name" className={inputClass} />
          </div>
        </div>

        {/* Email Address */}
        <div className="col-span-12">
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <Mail className={iconClass} size={14} />
            <input {...register("email")} placeholder="vendor@company.com" className={inputClass} />
          </div>
        </div>

        {/* Office Address */}
        <div className="col-span-12">
          <label className={labelClass}>Office Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-slate-300" size={14} />
            <textarea {...register("address")} rows="2" placeholder="Full location address" className={`${inputClass} pl-9 pt-2 resize-none`} />
          </div>
          {errors.address && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1">{errors.address.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 border-t pt-3">
        <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300">
          {isPending ? <Loader2 className="animate-spin" size={14} /> : (initialData ? "Update Supplier Record" : "Register Supplier")}
        </button>
      </div>
    </form>
  );
};

export default AddSupplierForm;