
import React, { useState, useRef } from 'react';
import { User, Role } from '../types';
import { CHOIR_DATA } from '../constants';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    choirId: CHOIR_DATA[0].id, 
    avatar: '' 
  });

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedChoirName = CHOIR_DATA.find(c => c.id === formData.choirId)?.name.toUpperCase() || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? {
        ...u,
        name: formData.name,
        email: formData.email || u.email,
        choirId: formData.choirId,
        avatar: formData.avatar || u.avatar
      } : u));
      setEditingId(null);
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s/g, '')}@esperanza.com`,
        role: Role.DIRECTOR,
        choirId: formData.choirId,
        avatar: formData.avatar
      };
      setUsers([...users, newUser]);
    }

    setFormData({ name: '', email: '', choirId: CHOIR_DATA[0].id, avatar: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setSelectedUserId(null); 
    setFormData({
      name: user.name,
      email: user.email,
      choirId: user.choirId || CHOIR_DATA[0].id,
      avatar: user.avatar || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de revocar el acceso a este director? Esta acción no se puede deshacer.')) {
      setUsers(users.filter(u => u.id !== id));
      if (editingId === id) setEditingId(null);
      if (selectedUserId === id) setSelectedUserId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', choirId: CHOIR_DATA[0].id, avatar: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (selectedUser) {
    const sede = CHOIR_DATA.find(c => c.id === selectedUser.choirId);
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-12 pb-20">
        <button onClick={() => setSelectedUserId(null)} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:translate-x-[-5px] transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Regresar a la Lista
        </button>
        <div className="bg-white dark:bg-card-dark rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-3xl overflow-hidden">
          <div className="h-64 bg-gradient-to-r from-primary via-[#60a5fa] to-secondary relative">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
            <div className="absolute -bottom-20 left-16 flex items-end gap-8">
              <div className="size-48 rounded-[3rem] bg-white dark:bg-midnight p-3 shadow-2xl border-4 border-white dark:border-slate-900">
                <div className="size-full rounded-[2.2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} className="size-full object-cover" alt={selectedUser.name} />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
                  )}
                </div>
              </div>
              <div className="mb-6 flex flex-col gap-1">
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                    DIRECTOR DE {sede?.name.toUpperCase()}
                 </h1>
                 <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    {selectedUser.name}
                 </p>
              </div>
            </div>
          </div>
          <div className="pt-32 p-16 grid grid-cols-12 gap-16">
             <div className="col-span-12 lg:col-span-7 space-y-12">
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-4xl border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsable</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white uppercase">{selectedUser.name}</p>
                   </div>
                   <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-4xl border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargo Oficial</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white truncate">DIRECTOR DE {sede?.name.toUpperCase()}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-20">
      <div className="flex flex-col gap-3">
        <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Gestión de <span className="text-vivid-gradient">Directiva</span></h2>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-lg uppercase tracking-tight">Panel de Control de Identidades y Accesos</p>
      </div>
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4">
          <div className={`bg-white dark:bg-card-dark p-10 rounded-[3.5rem] border-2 transition-all shadow-2xl sticky top-10 ${editingId ? 'border-secondary/50 ring-4 ring-secondary/5' : 'border-slate-200 dark:border-white/5'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div onClick={() => fileInputRef.current?.click()} className={`size-32 rounded-full border-4 border-dashed bg-slate-50 dark:bg-midnight flex items-center justify-center cursor-pointer overflow-hidden group transition-all relative ${editingId ? 'border-secondary/40' : 'border-slate-200 dark:border-slate-700 hover:border-secondary'}`}>
                  {formData.avatar ? <img src={formData.avatar} className="size-full object-cover" alt="Preview" /> : <div className="flex flex-col items-center text-slate-400 group-hover:text-secondary"><span className="material-symbols-outlined text-3xl">add_a_photo</span></div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <div className="space-y-4">
                <select value={formData.choirId} onChange={(e) => setFormData({...formData, choirId: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary/30">
                  {CHOIR_DATA.map(choir => <option key={choir.id} value={choir.id}>{choir.name}</option>)}
                </select>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary/30" placeholder="Nombre completo del director" />
              </div>
              <button type="submit" className={`w-full py-5 text-white font-black rounded-3xl shadow-xl uppercase tracking-widest text-[11px] mt-4 ${editingId ? 'bg-secondary text-midnight' : 'bg-primary'}`}>
                {editingId ? 'Actualizar Director' : 'Habilitar Director'}
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-card-dark rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase text-secondary tracking-[0.3em] border-b border-slate-200 dark:border-white/5">
                <th className="px-10 py-6">Estructura Directiva</th>
                <th className="px-10 py-6">Sede Oficial</th>
                <th className="px-10 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.filter(u => u.role === Role.DIRECTOR).map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                      <div className="size-16 rounded-2xl bg-slate-200 dark:bg-midnight overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {user.avatar ? <img src={user.avatar} className="size-full object-cover" alt={user.name} /> : <span className="material-symbols-outlined text-3xl">person</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900 dark:text-white uppercase truncate tracking-tighter group-hover:text-primary transition-colors">
                          DIRECTOR DE {CHOIR_DATA.find(c => c.id === user.choirId)?.name.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{user.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-[11px] font-black px-5 py-2 bg-primary text-white border border-primary/20 rounded-2xl uppercase shadow-lg shadow-primary/20">
                      {CHOIR_DATA.find(c => c.id === user.choirId)?.name || 'Sin Sede'}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(user)} className="size-12 rounded-2xl bg-white dark:bg-midnight text-primary border border-slate-200 dark:border-white/5 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-md"><span className="material-symbols-outlined">edit</span></button>
                      <button onClick={() => handleDelete(user.id)} className="size-12 rounded-2xl bg-white dark:bg-midnight text-red-500 border border-slate-200 dark:border-white/5 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-md"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
