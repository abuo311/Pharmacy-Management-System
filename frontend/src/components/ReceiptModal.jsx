import React, { useState } from 'react';
import { Printer, CheckCircle, MapPin, Tag, Activity, Loader2, ArrowLeft } from 'lucide-react';

const ReceiptModal = ({ 
  cart = [], 
  total = 0, 
  onConfirm, 
  onCancel, 
  isProcessing, 
  customerName, 
  userName,
  branchName 
}) => {
  const [discount, setDiscount] = useState(0);

  const subtotal = Number(total || 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const pharmaLevy = discountedSubtotal * 0.02;
  const finalTotal = discountedSubtotal + pharmaLevy;

  const transactionDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const safeCart = Array.isArray(cart) ? cart : [];

  return (
    <div className="bg-white p-0 flex flex-col max-h-[90vh] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { background: white; }
          .no-print { display: none !important; }
          .print-container { width: 100% !important; padding: 5mm !important; }
          .receipt-scroll { max-height: none !important; overflow: visible !important; }
        }
      `}} />

      <div className="print-container receipt-scroll overflow-y-auto px-6 py-6 flex-grow space-y-4 custom-scrollbar">
        {/* Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200">
          <div className="flex justify-center mb-2">
            <div className="bg-slate-900 text-white p-2 rounded-xl no-print">
              <Activity size={20} />
            </div>
          </div>
          <h3 className="font-black text-xl text-slate-800 tracking-tight uppercase">
            {branchName || 'Pharmacy Receipt'}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-1 mt-1">
            <MapPin size={10} /> Official Transaction
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-[11px] py-2">
          <div>
            <span className="text-slate-400 font-black uppercase text-[8px] tracking-widest block">Pharmacist</span>
            <p className="font-bold text-slate-700 truncate">{userName || 'Staff'}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-black uppercase text-[8px] tracking-widest block">Patient</span>
            <p className="font-bold text-slate-700 truncate">{customerName || 'Walk-in'}</p>
          </div>
          <div className="col-span-2 border-t border-slate-50 pt-2 text-slate-400 font-bold text-[9px] italic text-center">
            {transactionDate}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>Description</span>
            <span>Total</span>
          </div>
          <div className="space-y-2">
            {safeCart.length > 0 ? (
              safeCart.map((item, index) => {
                const itemPrice = Number(item.price || item.unitPrice || 0);
                const itemQty = Number(item.cartQuantity || 1);
                
                return (
                  <div key={item.id || index} className="flex justify-between items-start text-[11px]">
                    <div className="flex flex-col max-w-[70%]">
                      <span className="font-black text-slate-800 leading-tight uppercase">{item.name || 'Unknown Item'}</span>
                      <span className="text-[9px] text-slate-500 font-bold">
                        {itemQty} x ₵{itemPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-black text-slate-900 font-mono text-[12px]">
                      ₵{(itemPrice * itemQty).toFixed(2)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-2 text-slate-400 text-[10px]">No items in cart</div>
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="pt-4 border-t border-dashed border-slate-200 space-y-2">
          <div className="flex justify-between text-[11px] text-slate-600 font-bold">
            <span>Subtotal</span>
            <span className="font-mono">₵{subtotal.toFixed(2)}</span>
          </div>

          <div className="no-print bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-3 focus-within:border-blue-300 transition-all">
            <Tag size={12} className="text-blue-500" />
            <div className="flex-1 flex items-center">
                <span className="text-[10px] font-black text-slate-400 mr-1">₵</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent text-[11px] font-black w-full outline-none text-slate-700"
                  placeholder="0.00"
                />
            </div>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-[11px] text-rose-600 font-black italic">
              <span>Less Discount</span>
              <span className="font-mono">-₵{Number(discount).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-[11px] text-slate-600 font-bold">
            <span>Pharma Levy (2%)</span>
            <span className="font-mono">₵{pharmaLevy.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t-2 border-double border-slate-900">
            <span className="font-black text-slate-900 text-xs tracking-tighter">GRAND TOTAL</span>
            <span className="text-2xl font-black text-blue-600 font-mono">₵{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-800 italic uppercase tracking-widest">Quick Recovery!</p>
          <p className="text-[8px] text-slate-400 mt-1 font-bold">Ref: POS-{Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print p-6 bg-slate-50 border-t border-slate-100 space-y-3">
        <div className="flex gap-3">
          <button 
            disabled={isProcessing}
            onClick={onCancel} 
            className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-slate-200 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          <button 
            onClick={() => {
              // Safety check to prevent the error in Screenshot (34).png
              if (typeof onConfirm === 'function') {
                onConfirm(discount);
              } else {
                console.error("onConfirm prop is missing or not a function");
              }
            }} 
            disabled={isProcessing}
            className="flex-[2] py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:bg-slate-400"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            {isProcessing ? 'Processing...' : 'Authorize Sale'}
          </button>
        </div>

        <button 
          disabled={isProcessing}
          onClick={() => window.print()} 
          className="w-full py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <Printer size={14} /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;