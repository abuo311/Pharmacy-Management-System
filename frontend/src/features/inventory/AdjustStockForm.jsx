import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, MinusCircle, Loader2, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const AdjustStockForm = ({ medicine, onCancel, onSuccess }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { 
      type: 'add', 
      amount: 1, 
      reason: 'RESTOCK',
      note: ''
    }
  });

  const currentType = watch('type');

  useEffect(() => {
    if (currentType === 'add') {
      setValue('reason', 'RESTOCK');
    } else {
      setValue('reason', 'DAMAGE');
    }
  }, [currentType, setValue]);

  const adjustmentMutation = useMutation({
    mutationFn: async (data) => {
      const finalQuantity = data.type === 'subtract' ? -Math.abs(data.amount) : Math.abs(data.amount);
      const payload = {
        medicine: { id: medicine.id },
        quantity: finalQuantity,
        type: data.reason, 
        reason: data.note || `Manual ${data.type} adjustment`,
      };
      const response = await api.post('/stock-adjustments', payload);
      return response.data;
    },
  // Inside AdjustStockForm.jsx
onSuccess: () => {
  toast.success('Stock adjusted successfully');
  
  // Use the branch-specific key to ensure the current view refreshes
  queryClient.invalidateQueries({ 
    queryKey: ['medicines', Number(medicine.branch?.id || branchId)] 
  });

  if (onSuccess) onSuccess();
},
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to adjust stock';
      toast.error(msg);
    }
  });

  const onSubmit = (data) => {
    if (data.type === 'subtract' && data.amount > medicine.stockLevel) {
      toast.error(`Cannot subtract more than current stock (${medicine.stockLevel})`);
      return;
    }
    adjustmentMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Compact Medicine Info Header */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Product</p>
          <p className="text-sm font-black text-slate-800 leading-tight">{medicine.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current</p>
          <p className={`text-base font-black ${medicine.stockLevel <= medicine.minAlertLevel ? 'text-amber-600' : 'text-blue-600'}`}>
            {medicine.stockLevel || 0} <span className="text-[9px] text-slate-400">units</span>
          </p>
        </div>
      </div>

      {/* Compact Adjustment Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <label className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
          currentType === 'add' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'
        }`}>
          <input {...register('type')} type="radio" value="add" className="hidden" />
          <PlusCircle size={20} className={currentType === 'add' ? 'text-blue-600' : 'text-slate-300'} />
          <span className={`mt-1 text-[10px] font-black uppercase tracking-widest ${currentType === 'add' ? 'text-blue-700' : 'text-slate-400'}`}>Add</span>
        </label>

        <label className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
          currentType === 'subtract' ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-white hover:border-slate-200'
        }`}>
          <input {...register('type')} type="radio" value="subtract" className="hidden" />
          <MinusCircle size={20} className={currentType === 'subtract' ? 'text-red-500' : 'text-slate-300'} />
          <span className={`mt-1 text-[10px] font-black uppercase tracking-widest ${currentType === 'subtract' ? 'text-red-700' : 'text-slate-400'}`}>Reduce</span>
        </label>
      </div>

      <div className="space-y-3">
        {/* Compact Quantity Input */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 mb-1">Quantity</label>
            <input 
              type="number" 
              {...register('amount', { required: true, valueAsNumber: true, min: 1 })}
              className={`w-full p-2.5 rounded-lg border font-black text-sm outline-none transition-all ${
                errors.amount ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          
          {/* Compact Reason Selection */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 mb-1">Reason</label>
            <select {...register('reason')} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-bold text-xs text-slate-700 bg-white">
              {currentType === 'add' ? (
                <>
                  <option value="RESTOCK">Restock</option>
                  <option value="RETURN">Return</option>
                </>
              ) : (
                <>
                  <option value="DAMAGE">Damage</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="RESTOCK">Correction</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Compact Note */}
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 mb-1">Notes</label>
          <input 
            type="text" 
            {...register('note')}
            placeholder="e.g. Batch #402"
            className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-medium text-xs"
          />
        </div>
      </div>

      {/* Compact Warnings */}
      {currentType === 'subtract' && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
          <Info size={12} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[9px] font-bold text-amber-800 uppercase tracking-tighter leading-tight">
            Audit trail will be logged for this reduction.
          </p>
        </div>
      )}

      {/* Compact Actions */}
      <div className="flex gap-3 pt-1">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 py-2.5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={adjustmentMutation.isPending}
          className={`flex-[2] py-2.5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
            currentType === 'add' ? 'bg-blue-600 shadow-blue-100' : 'bg-red-600 shadow-red-100'
          } disabled:opacity-50`}
        >
          {adjustmentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
        </button>
      </div>
    </form>
  );
};

export default AdjustStockForm;