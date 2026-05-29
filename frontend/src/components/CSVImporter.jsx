import React, { useRef, useState } from 'react';
import { FileUp, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore'; // Import your store

const CSVImporter = ({ branchId, onComplete }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get token directly from your Zustand store
  const token = useAuthStore((state) => state.token);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!token) {
      toast.error("Session missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);

    try {
      await axios.post('http://localhost:8080/api/medicines/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          // Priority: use passed branchId, then store branchId, fallback to 1
          'X-Branch-Id': branchId || 1 
        }
      });

      toast.success("Medicines imported successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Import failed:", err);
      const status = err.response?.status;
      if (status === 403) toast.error("Access Denied: Admin role required.");
      else if (status === 401) toast.error("Session expired. Please log in again.");
      else toast.error("Import failed. Check CSV format.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "name", "manufacturer", "expiry_date", "price", "selling_price", 
      "stock_level", "min_alert_level", "prescription_required", 
      "shelf_location", "category_name", "branch_name", "supplier_name"
    ];
    
    const sampleData = [
      "Amoxicillin,GSK,2027-12-31,15.50,25.00,100,10,1,Shelf-A1,Antibiotics,Benito Pharma,PharmaWholesale Ltd"
    ];

    const csvContent = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "medicine_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={downloadTemplate}
        className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-dashed border-slate-300"
      >
        <Download size={14} /> Template
      </button>

      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      
      <button 
        disabled={isUploading}
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase shadow-md shadow-indigo-100 disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="animate-spin" size={14} /> : <FileUp size={14} />}
        {isUploading ? "Importing..." : "Import CSV"}
      </button>
    </div>
  );
};

export default CSVImporter;