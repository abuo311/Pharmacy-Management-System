import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, MapPin, Loader2, UserCheck, ShieldAlert, Trash2, Edit3, Power, PowerOff } from 'lucide-react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

// --- Sub-component: Staff Form ---
const StaffForm = ({ onSubmit, onCancel, isLoading, initialData = null, branches = [] }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    username: '',
    password: '',
    role: 'PHARMACIST',
    status: 'ACTIVE',
    branchId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.branchId) return toast.error("Please assign a branch");
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
        <input 
          required
          type="text" 
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-medium"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
          <input 
            required
            type="text" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-medium"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password {initialData && "(Optional)"}</label>
          <input 
            required={!initialData}
            type="password" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-medium"
            placeholder={initialData ? "Leave blank to keep current" : "••••••••"}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</label>
          <select 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold cursor-pointer"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="PHARMACIST">Pharmacist</option>
            <option value="ADMIN">Administrator</option>
            <option value="CASHIER">Cashier</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</label>
          <select 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold cursor-pointer"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Deactivated</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Branch</label>
        <select 
          required
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold cursor-pointer"
          value={formData.branchId}
          onChange={(e) => setFormData({...formData, branchId: e.target.value})}
        >
          <option value="">Select Branch</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3 pt-6">
        <button type="button" onClick={onCancel} className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-xs">
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 uppercase text-xs flex justify-center items-center"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : initialData ? "Update Staff" : "Create Account"}
        </button>
      </div>
    </form>
  );
};

// --- Main UsersPage Component ---
const UsersPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const activeBranchId = user?.branchId || 1;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', activeBranchId],
    queryFn: async () => (await api.get('/users', { params: { branchId: activeBranchId } })).data
  });

  const createMutation = useMutation({
    mutationFn: (newUser) => api.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Staff account created');
      setIsAddModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedUser) => api.put(`/users/${updatedUser.id}`, updatedUser, { params: { branchId: activeBranchId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Staff updated');
      setEditingUser(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`, { params: { branchId: activeBranchId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Staff deleted successfully');
    }
  });

  const handleDelete = (staff) => {
    // PROTECT ADMINS FROM DELETION
    if (staff.role === 'ADMIN') {
      return toast.error("System Administrators cannot be deleted. Please deactivate the account instead.");
    }

    if (window.confirm(`Are you sure you want to permanently delete ${staff.name}?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Staff Directory</h2>
          <p className="text-slate-500 font-medium">Managing users for branch: {branches.find(b => b.id === activeBranchId)?.name || '...'}</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center">
          <UserPlus size={18} className="mr-2" /> Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className={`group flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 ${u.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${u.status === 'INACTIVE' ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-lg tracking-tight">{u.name}</h4>
                      {u.status === 'INACTIVE' && <span className="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                        <Shield size={10} className="mr-1" /> {u.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={() => setEditingUser(u)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Staff">
                    <Edit3 size={18} />
                  </button>
                  
                  {/* Conditional Delete Button Styling */}
                  <button 
                    onClick={() => handleDelete(u)} 
                    className={`p-3 rounded-xl transition-all ${u.role === 'ADMIN' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                    disabled={u.role === 'ADMIN'}
                    title={u.role === 'ADMIN' ? "Admins cannot be deleted" : "Delete Staff"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Staff">
        <StaffForm 
          branches={branches}
          onSubmit={(data) => createMutation.mutate(data)} 
          onCancel={() => setIsAddModalOpen(false)} 
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit Staff Member">
        {editingUser && (
          <StaffForm 
            initialData={{...editingUser, branchId: editingUser.assignedBranch?.id || ''}}
            branches={branches}
            onSubmit={(data) => updateMutation.mutate(data)} 
            onCancel={() => setEditingUser(null)} 
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;