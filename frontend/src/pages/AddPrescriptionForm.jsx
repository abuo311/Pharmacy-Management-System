import React, { useState, useEffect } from 'react';
import { FileText, Save, X, MapPinned, User, Stethoscope, ClipboardList, Activity, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore';

const AddPrescriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const activeBranchName = user?.branchName || 'Nkoranza';
  const rawId = user?.branchId || "";
  const branchId = typeof rawId === 'string' && rawId.includes(':') 
    ? parseInt(rawId.split(':')[0], 10) 
    : parseInt(rawId, 10) || 1;

  const [form, setForm] = useState({
    patientName: '',
    doctorName: '',
    notes: '',
    status: 'Pending',
  });
  
  const [loading, setLoading] = useState(false);
  const [pharmacyName, setPharmacyName] = useState('Minamo Pharmacy');

  // Load global pharmacy branding dynamically
  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside add prescription context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      branchId: branchId,
      issueDate: new Date().toISOString().split('T')[0],
      diagnosis: form.notes 
    };

    try {
      await api.post('/prescriptions', payload);
      toast.success('Prescription added successfully');
      navigate('/prescriptions');
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 animate-in fade-in zoom-in-95 duration-200">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-50">
        <div>
          <div className="flex flex-col mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {pharmacyName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600 flex-shrink-0" size={26} />
            Add Prescription
          </h2>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-1">
            <MapPinned size={12} className="text-blue-500 flex-shrink-0" />
            <span>Routing to {activeBranchName} Branch (ID: {branchId})</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/prescriptions')}
          className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-all duration-200"
          title="Cancel and Go Back"
        >
          <X size={20} />
        </button>
      </div>

      {/* ACTION FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: PATIENT & DOCTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-1">
              <User size={12} className="text-blue-500" /> Patient Name
            </label>
            <input
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
              placeholder="e.g. Kwame Asante"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-1">
              <Stethoscope size={12} className="text-blue-500" /> Prescriber / Doctor
            </label>
            <input
              name="doctorName"
              value={form.doctorName}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
              placeholder="e.g. Dr. Ellen Mensah"
              required
            />
          </div>
        </div>

        {/* ROW 2: CLINICAL NOTES */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-1">
            <ClipboardList size={12} className="text-blue-500" /> Clinical Notes / Diagnosis
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none h-32 resize-none font-medium text-slate-700 transition-all placeholder:text-slate-300"
            placeholder="Type medications, diagnosis details, dosage pacing, or special branch intake directives..."
          />
        </div>

        {/* ROW 3: STATUS PICKER */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-1">
            <Activity size={12} className="text-blue-500" /> Validation Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50/80 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer transition-all"
            >
              <option value="Pending">Pending Verification Ledger</option>
              <option value="Verified">Verified & Approved for Dispensing</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ROW 4: SUBMIT TRIGGER */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4.5 sm:py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all duration-300 transform active:scale-[0.98] flex justify-center items-center gap-2 text-base"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                <span>Save Script Entry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrescriptionPage;