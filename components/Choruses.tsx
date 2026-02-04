
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Member, Role, ChoirData, User, AttendanceRecord } from '../types';

interface ChorusesProps {
  members: Member[];
  choirs: ChoirData[];
  directors: User[];
  reports: AttendanceRecord[]; 
  onAddMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onUpdateChoirPhoto: (choirId: string, photoUrl: string) => void;
  onViewMember: (member: Member) => void;
  userRole: Role;
  userChoirId?: string;
  currentUser: User;
}

const Choruses: React.FC<ChorusesProps> = ({ 
  members, 
  choirs,
  directors,
  reports,
  onAddMember, 
  onDeleteMember, 
  onUpdateChoirPhoto,
  onViewMember,
  userRole, 
  userChoirId,
  currentUser
}) => {
  const isAdmin = userRole === Role.ADMIN;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChoirId, setSelectedChoirId] = useState<string | null>(null);
  const choirPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      setSelectedChoirId(userChoirId || null);
    } else {
      setSelectedChoirId(userChoirId || choirs[0]?.id || null);
    }
  }, [userChoirId, isAdmin, choirs]);
  
  const getRealAttendance = (choirId: string) => {
    const choirMembers = members.filter(m => m.choirId === choirId);
    const choirMemberIds = new Set(choirMembers.map(m => m.id));
    const choirReports = reports.filter(r => choirMemberIds.has(r.memberId));
    if (choirReports.length === 0) return 0;
    return Math.round((choirReports.filter(r => r.present).length / choirReports.length) * 100);
  };

  const filteredChoirs = useMemo(() => choirs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())), [choirs, searchTerm]);
  const currentChoir = choirs.find(c => c.id === selectedChoirId);
  const currentMembers = members.filter(m => m.choirId === selectedChoirId);
  
  // Lógica mejorada: Primero buscamos si el usuario logueado es el director de esta sede
  const currentDirector = useMemo(() => {
    if (!selectedChoirId) return null;
    
    // Si yo soy el director de esta sede, usar mis datos actualizados (incluyendo foto)
    if (String(currentUser.choirId) === String(selectedChoirId)) {
      return currentUser;
    }
    
    // Si no soy yo, buscar en la lista global
    return directors.find(d => String(d.choirId) === String(selectedChoirId));
  }, [directors, selectedChoirId, currentUser]);
  
  const choirAttendance = useMemo(() => {
    return selectedChoirId ? getRealAttendance(selectedChoirId) : 0;
  }, [selectedChoirId, members, reports]);

  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    voiceType: 'Soprano' as Member['voiceType'], 
    gender: 'Mujer' as Member['gender'] 
  });

  const getVoiceColor = (voice: string) => {
    switch(voice) {
      case 'Soprano': return 'from-primary/80 to-primary';
      case 'Contralto': return 'from-sky-600 to-primary';
      case 'Tenor': return 'from-secondary/60 to-secondary';
      case 'Bajo': return 'from-black to-slate-800';
      case 'Por asignar': return 'from-slate-300 to-slate-400';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
        else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.4));
      };
    });
  };

  const handleChoirPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedChoirId) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        onUpdateChoirPhoto(selectedChoirId, compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !selectedChoirId) return;
    onAddMember({ 
        id: crypto.randomUUID(), 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        email: formData.email || `${formData.firstName.toLowerCase()}@esperanza.com`, 
        choirId: selectedChoirId, 
        voiceType: formData.voiceType, 
        gender: formData.gender 
    });
    setFormData({ ...formData, firstName: '', lastName: '', email: '' });
  };

  if (isAdmin && !selectedChoirId) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4 lg:space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-0 lg:space-y-2">
            <h2 className="text-xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none text-center md:text-left">Sedes <span className="text-primary">Portal</span></h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[7px] lg:text-sm text-center md:text-left">Gestión de Unidades Corales</p>
          </div>
          <div className="relative group w-full md:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs lg:text-base">search</span>
            <input type="text" placeholder="Buscar sede..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-white/5 rounded-lg py-1.5 lg:py-4 pl-8 pr-3 text-[10px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20" />
          </div>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredChoirs.map((choir) => (
            <div key={choir.id} onClick={() => setSelectedChoirId(choir.id)} className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-all">
              <div className="h-24 bg-slate-100 dark:bg-midnight flex items-center justify-center overflow-hidden">
                {choir.imageUrl ? (
                    <img src={choir.imageUrl} className="w-full h-full object-cover" alt={choir.name} />
                ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300">church</span>
                )}
              </div>
              <div className="p-6">
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">{choir.name}</h4>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-white/5">
                  <span className="text-xs font-black text-primary">{getRealAttendance(choir.id)}%</span>
                  <span className="text-xs font-black text-slate-400">{members.filter(m => m.choirId === choir.id).length} Miembros</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {isAdmin && (
          <button 
            onClick={() => setSelectedChoirId(null)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_back</span> 
            Regresar a Sedes
          </button>
        )}
      </div>
      
      <div className="relative h-48 lg:h-72 w-full rounded-[3rem] overflow-hidden shadow-lg border-4 border-white dark:border-white/5">
        {currentChoir?.imageUrl ? (
            <img src={currentChoir.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Sede" />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900"></div>
        )}
        <div className="absolute inset-0 bg-black/30 lg:bg-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 flex flex-col gap-1">
           <div className="flex items-center gap-3">
              <h2 className="text-3xl lg:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{currentChoir?.name || '---'}</h2>
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col items-center">
                 <span className="text-white text-[10px] lg:text-xs font-black">{choirAttendance}%</span>
                 <span className="text-white/60 text-[6px] lg:text-[8px] font-black uppercase tracking-widest leading-none">Eficiencia</span>
              </div>
           </div>
           <p className="text-white/60 text-[8px] lg:text-xs font-black uppercase tracking-[0.3em]">Estado: <span className="text-primary">{currentChoir?.status || 'Activo'}</span></p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => choirPhotoInputRef.current?.click()}
            className="absolute top-8 right-8 size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-xl"
          >
             <span className="material-symbols-outlined text-2xl">add_a_photo</span>
          </button>
        )}
        <input type="file" ref={choirPhotoInputRef} className="hidden" accept="image/*" onChange={handleChoirPhotoChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white dark:bg-card-dark p-10 rounded-[3rem] shadow-lg border border-slate-200 dark:border-white/5 h-fit">
          <h3 className="text-[11px] font-black text-primary uppercase tracking-widest mb-8">Inscribir Integrante</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Identidad</label>
               <input type="text" placeholder="Nombres" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white mb-3" />
               <input type="text" placeholder="Apellidos" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Voz</label>
                  <select value={formData.voiceType} onChange={(e) => setFormData({...formData, voiceType: e.target.value as any})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white">
                    <option>Soprano</option>
                    <option>Contralto</option>
                    <option>Tenor</option>
                    <option>Bajo</option>
                    <option>Por asignar</option>
                  </select>
               </div>
               <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Género</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white">
                    <option>Mujer</option><option>Hombre</option>
                  </select>
               </div>
            </div>
            
            <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[10px] mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Guardar Miembro</button>
          </form>
        </div>
        
        <div className="lg:col-span-8 bg-white dark:bg-card-dark rounded-[3rem] shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Miembros Registrados</h3>
            <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest">{currentMembers.length} Total</span>
          </div>

          {/* TARJETA DEL DIRECTOR FIJADA EN TODAS LAS SEDES */}
          <div className="px-4 lg:px-8 mt-6">
            <div className="p-4 lg:p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-[2rem] lg:rounded-[2.5rem] border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 group shadow-sm transition-all hover:border-primary/40">
               <div className="flex items-center gap-4 lg:gap-6">
                  <div className="size-16 lg:size-20 rounded-[1.5rem] lg:rounded-[1.8rem] bg-slate-900 dark:bg-slate-800 overflow-hidden border-2 border-primary/30 shadow-2xl shrink-0 flex items-center justify-center">
                      {currentDirector?.avatar ? (
                        <img src={currentDirector.avatar} className="size-full object-cover" alt={currentDirector.name} />
                      ) : (
                        <span className="text-xl lg:text-3xl font-black text-white opacity-40">{currentDirector?.name?.charAt(0) || '?'}</span>
                      )}
                  </div>
                  <div className="flex flex-col text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-[8px] lg:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dirección de Sede</span>
                        <span className="material-symbols-outlined text-primary text-sm fill-1">verified</span>
                      </div>
                      <span className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                        {currentDirector ? currentDirector.name : "Pendiente de Asignación"}
                      </span>
                  </div>
               </div>
               <div className="hidden md:flex flex-col items-end pr-4">
                  <div className="px-4 py-1.5 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Responsable</div>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto px-2 mt-4">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5 text-left">Miembro</th>
                  <th className="px-8 py-5 text-left">Voz</th>
                  <th className="px-8 py-5 text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {currentMembers.map(member => (
                  <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-8 py-5">
                      <button onClick={() => onViewMember(member)} className="flex items-center gap-4 hover:translate-x-1 transition-transform group/name text-left">
                         <div className={`size-12 rounded-2xl bg-gradient-to-br ${getVoiceColor(member.voiceType)} flex items-center justify-center font-black text-white shadow-sm`}>{member.firstName.charAt(0)}</div>
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase group-hover/name:text-primary transition-colors">{member.firstName} {member.lastName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.gender}</span>
                         </div>
                      </button>
                    </td>
                    <td className="px-8 py-5"><span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{member.voiceType}</span></td>
                    <td className="px-8 py-5 text-center"><button onClick={() => onDeleteMember(member.id)} className="size-10 rounded-xl border border-slate-100 dark:border-white/5 text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"><span className="material-symbols-outlined">delete</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Choruses;
