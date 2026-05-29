import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, Save, X, Edit2, Trash2, MoreHorizontal, MapPinned } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

// --- TABLE ROW COMPONENT (DESKTOP & TABLETS) ---
const PrescriptionRow = ({ id, localId, patient, doctor, date, status, onEdit, onDelete }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
    <td className="p-4 font-mono text-xs font-bold text-blue-600">{localId}</td>
    <td className="p-4">
      <p className="font-bold text-slate-800">{patient}</p>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Patient Record</p>
    </td>
    <td className="p-4">
      <p className="font-bold text-slate-700">{doctor}</p>
      <p className="text-[10px] text-slate-400 font-medium tracking-tight">Prescriber</p>
    </td>
    <td className="p-4 text-sm text-slate-500 font-medium">{date}</td>
    <td className="p-4">
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black ${
        status?.toLowerCase() === 'verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
      }`}>
        {status?.toLowerCase() === 'verified' ? <CheckCircle2 size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
        {(status || 'PENDING').toUpperCase()}
      </span>
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit()}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
          title="Edit Prescription"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
          title="Delete Entry"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

// --- MAIN PAGE ---
const PrescriptionsPage = () => {
  const user = useAuthStore((state) => state.user);
  const activeBranchName = user?.branchName || 'Nkoranza';
  
  const rawId = user?.branchId || "";
  const branchId = typeof rawId === 'string' && rawId.includes(':') 
    ? parseInt(rawId.split(':')[0], 10) 
    : parseInt(rawId, 10) || 1;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    doctorName: '',
    diagnosis: '',
    status: 'Pending',
  });

  const [pharmacyName, setPharmacyName] = useState('Minamo Pharmacy');

  useEffect(() => {
    const fetchPharmacyBrand = async () => {
      try {
        const res = await api.get('/settings/pharmacy');
        if (res.data && res.data.pharmacyName) {
          setPharmacyName(res.data.pharmacyName);
        }
      } catch (err) {
        console.log("Error loading pharmacy branding details inside dashboard context");
      }
    };
    fetchPharmacyBrand();
  }, []);

  const fetchPrescriptions = async () => {
    if (!branchId || isNaN(branchId)) return;
    try {
      const res = await api.get(`/prescription/branch/${branchId}`);
      setPrescriptions(res.data || []);
    } catch (err) {
      toast.error('Failed to load branch data');
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [branchId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (prescription) => {
    setForm({
      patientName: prescription.patientName,
      doctorName: prescription.doctorName,
      diagnosis: prescription.diagnosis,
      status: prescription.status,
    });
    setEditingId(prescription.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    
    try {
      await api.delete(`/prescription/${id}`);
      toast.success("Prescription deleted");
      fetchPrescriptions();
    } catch (err) {
      toast.error("Could not delete record");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/prescription/${editingId}`, {
          ...form,
          branch: { id: branchId }
        });
        toast.success('Prescription updated');
      } else {
        await api.post('/prescription', {
          ...form,
          branch: { id: branchId }
        });
        toast.success('Prescription recorded');
      }

      setIsAdding(false);
      setEditingId(null);
      setForm({ patientName: '', doctorName: '', diagnosis: '', status: 'Pending' });
      fetchPrescriptions(); 
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAdding) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div>
            <div className="flex flex-col mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {pharmacyName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center">
              <FileText className="mr-2 text-blue-600 flex-shrink-0" size={24} />
              {editingId ? 'Edit Prescription' : 'New Prescription'}
            </h2>
            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-0.5">
              <MapPinned size={12} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{activeBranchName} (ID: {branchId})</span>
            </div>
          </div>
          <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full flex-shrink-0">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Patient Name</label>
               <input name="patientName" value={form.patientName} onChange={handleChange} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl sm:rounded-2xl outline-none font-medium text-sm sm:text-base" required />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Doctor Name</label>
               <input name="doctorName" value={form.doctorName} onChange={handleChange} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl sm:rounded-2xl outline-none font-medium text-sm sm:text-base" required />
            </div>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Diagnosis</label>
             <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl sm:rounded-2xl outline-none h-28 sm:h-32 resize-none font-medium text-sm sm:text-base" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Status</label>
             <select name="status" value={form.status} onChange={handleChange} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl sm:rounded-2xl outline-none appearance-none font-medium text-sm sm:text-base bg-no-repeat bg-right">
                <option value="Pending">Pending Validation</option>
                <option value="Verified">Verified / Approved</option>
             </select>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl sm:rounded-2xl font-bold flex justify-center items-center shadow-xl disabled:opacity-50 transition-all transform active:scale-95 text-sm sm:text-base">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" /> : <Save className="mr-2" size={18} />}
            {editingId ? 'Update Record' : 'Complete Prescription'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 sm:px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-col mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {pharmacyName}
            </span>
            <div className="flex items-center gap-1.5 text-blue-600 mt-0.5">
              <MapPinned size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{activeBranchName} Branch</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">Prescriptions</h2>
          <p className="text-sm text-slate-500 font-medium">Review and confirm prescription script protocols</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center shadow-lg transition-all transform active:scale-95 h-[48px] sm:h-[52px] text-sm sm:text-base">
          <FileText className="mr-2" size={18} /> New Entry
        </button>
      </div>

      {/* DESKTOP LAYOUT (VISIBLE ON LARGE VIEWPORTS) */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
              <th className="p-6">ID</th>
              <th>Patient Details</th>
              <th>Doctor / MD</th>
              <th>Date Issued</th>
              <th>Current Status</th>
              <th className="p-6 text-right"><MoreHorizontal size={16} className="inline opacity-50" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <PrescriptionRow
                  key={p.id}
                  id={p.id}
                  localId={`#${p.branchLocalId}`}
                  patient={p.patientName}
                  doctor={p.doctorName}
                  date={p.issueDate || new Date(p.createdAt).toLocaleDateString()}
                  status={p.status}
                  onEdit={() => handleEditClick(p)}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <tr><td colSpan="6" className="p-24 text-center opacity-30 font-bold">No Branch Records Found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LAYOUT (CARDS BASELINE) */}
      <div className="block md:hidden space-y-4">
        {prescriptions.length > 0 ? (
          prescriptions.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  #{p.branchLocalId}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${
                  p.status?.toLowerCase() === 'verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {p.status?.toLowerCase() === 'verified' ? <CheckCircle2 size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                  {(p.status || 'PENDING').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Patient</p>
                  <p className="font-bold text-slate-800 break-words">{p.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Doctor</p>
                  <p className="font-bold text-slate-700 break-words">{p.doctorName}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-medium">
                  {p.issueDate || new Date(p.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleEditClick(p)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-slate-100"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-slate-50 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-slate-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center border rounded-2xl opacity-40 font-bold text-sm">
            No Branch Records Found
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionsPage;