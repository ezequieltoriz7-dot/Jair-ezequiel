
import React, { useState, useRef, useMemo } from 'react';
import { Member, Role, ChoirData, User } from '../types';

interface ChorusesProps {
  members: Member[];
  choirs: ChoirData[];
  directors: User[];
  onAddMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onUpdateChoirPhoto: (choirId: string, photoUrl: string) => void;
  userRole: Role;
  userChoirId?: string;
}

const Choruses: React.FC<ChorusesProps> = ({ 
  members, 
  choirs,
  directors,
  onAddMember, 
  onDeleteMember, 
  onUpdateChoirPhoto,
  userRole, 
  userChoirId 
}) => {
  const isAdmin = userRole === Role.ADMIN;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentChoirId = isAdmin ? (userChoirId || choirs[0].id) : userChoirId;
  const currentChoir = choirs.find(c => c.id === currentChoirId);

  const choirDirector = useMemo(() => {
    return directors.find(d => d.choirId === currentChoirId);
  }, [directors, currentChoirId]);

  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    choirId: currentChoirId || '',
    voiceType: 'Soprano' as Member['voiceType'],
    gender: 'Mujer' as Member['gender']
  });

  const getVoiceColor = (voice: string) => {
    switch(voice) {
      case 'Soprano': return 'from-[#84b6f4] to-[#4d82bc] shadow-blue-400/20';
      case 'Contralto': return 'from-[#c4dafa] to-[#84b6f4] shadow-blue-200/20';
      case 'Tenor': return 'from-[#d8af97] to-[#84b6f4] shadow-tan-400/20';
      case 'Bajo': return 'from-[#4d82bc] to-[#0f172a] shadow-primary/20';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentChoirId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateChoirPhoto(currentChoirId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    const newMember: Member = {
      id: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || `${formData.firstName.toLowerCase()}@esperanza.com`,
      choirId: isAdmin ? formData.choirId : (userChoirId || ''),
      voiceType: formData.voiceType,
      gender: formData.gender
    };

    onAddMember(newMember);
    setFormData({ ...formData, firstName: '', lastName: '', email: '' });
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8 lg:space-y-12">
      {/* Banner Principal - Responsivo */}
      <div className="relative h-64 lg:h-80 w-full rounded-3xl lg:rounded-[4rem] overflow-hidden shadow-2xl group border-4 border-white dark:border-white/5">
        {currentChoir?.imageUrl ? (
          <img 
            src={currentChoir.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt={currentChoir.name} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-card-dark dark:to-midnight flex flex-col items-center justify-center text-slate-400 p-6 text-center">
             <span className="material-symbols-outlined text-6xl lg:text-8xl mb-4">church</span>
             <p className="font-black uppercase tracking-widest text-[10px] lg:text-sm">Sin fotografía de la sede</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-12 flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10 w-full pr-12 lg:pr-24">
          <div className="flex flex-col gap-1">
             <span className="text-secondary font-black uppercase tracking-[0.4em] text-[8px] lg:text-[10px] drop-shadow-md flex items-center gap-2">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Sede Activa
             </span>
             <h2 className="text-3xl lg:text-6xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-2xl">
                <span className="text-vivid-gradient">{currentChoir?.name || '---'}</span>
             </h2>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 bg-white/10 backdrop-blur-xl p-4 lg:p-6 rounded-2xl lg:rounded-4xl border border-white/20 mb-1 max-w-max">
             <div className="text-right">
                <p className="text-[8px] lg:text-[9px] font-black text-white/60 uppercase tracking-widest">Gente</p>
                <p className="text-lg lg:text-2xl font-black text-white">{members.length}</p>
             </div>
             <div className="size-1 w-px bg-white/20 h-6 lg:h-8"></div>
             <div className="text-right">
                <p className="text-[8px] lg:text-[9px] font-black text-white/60 uppercase tracking-widest">Director</p>
                <p className="text-xs lg:text-sm font-black text-secondary uppercase tracking-tighter truncate max-w-[100px] lg:max-w-[150px]">{choirDirector?.name || 'Vacante'}</p>
             </div>
          </div>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 lg:top-8 lg:right-8">
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
             <button onClick={() => fileInputRef.current?.click()} className="size-12 lg:w-auto lg:h-auto lg:px-6 lg:py-3 bg-white/90 hover:bg-white text-midnight font-black rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95">
               <span className="material-symbols-outlined text-lg">add_a_photo</span>
               <span className="hidden lg:inline">{currentChoir?.imageUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Formulario de Registro */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white dark:bg-card-dark p-6 lg:p-10 rounded-3xl lg:rounded-5xl shadow-2xl border border-slate-200 dark:border-white/5 sticky top-24">
            <h3 className="text-[10px] lg:text-[11px] font-black text-primary dark:text-secondary uppercase tracking-[0.4em] mb-8 lg:mb-12 flex items-center gap-3">
              <span className="material-symbols-outlined text-xl lg:text-2xl fill-1">person_add</span>
              Nueva Inscripción
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <input type="text" placeholder="Nombres" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-2xl p-4 lg:p-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-500" />
              <input type="text" placeholder="Apellidos" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-2xl p-4 lg:p-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-500" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] lg:text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-2 tracking-widest">Voz</label>
                  <select value={formData.voiceType} onChange={(e) => setFormData({...formData, voiceType: e.target.value as any})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-xl lg:rounded-2xl p-4 text-xs lg:text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20">
                    <option>Soprano</option><option>Contralto</option><option>Tenor</option><option>Bajo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] lg:text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-2 tracking-widest">Género</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-xl lg:rounded-2xl p-4 text-xs lg:text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20">
                    <option>Mujer</option><option>Hombre</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 lg:py-6 bg-primary text-white font-black rounded-2xl lg:rounded-3xl hover:scale-[1.03] active:scale-95 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px] lg:text-[12px] mt-2">Registrar Miembro</button>
            </form>
          </div>
        </div>

        {/* Lista de Miembros - Responsiva */}
        <div className="lg:col-span-8 order-1 lg:order-2 bg-white dark:bg-card-dark rounded-3xl lg:rounded-5xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <div className="p-6 lg:p-10 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
             <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">Nómina de Miembros</h3>
             <div className="hidden sm:flex gap-4">
                <span className="flex items-center gap-2 text-[8px] lg:text-[10px] font-black text-primary uppercase"><div className="size-2 bg-primary rounded-full"></div> Voces</span>
             </div>
          </div>
          
          {/* Vista para Celulares (Tarjetas) */}
          <div className="lg:hidden p-4 space-y-4">
            {choirDirector && (
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 p-5 rounded-2xl border-2 border-secondary/30 relative">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-midnight font-black text-xl shadow-lg">
                    {choirDirector.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{choirDirector.name}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary">Director de Sede</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-secondary">
                  <span className="material-symbols-outlined text-xl fill-1">verified</span>
                </div>
              </div>
            )}
            
            {members.map(member => (
              <div key={member.id} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl bg-gradient-to-br ${getVoiceColor(member.voiceType)} flex items-center justify-center font-black text-white text-lg shadow-md`}>
                    {member.firstName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{member.firstName} {member.lastName}</span>
                    <div className="flex gap-2">
                       <span className="text-[8px] font-black uppercase text-primary">{member.voiceType}</span>
                       <span className="text-[8px] font-black uppercase text-slate-400">|</span>
                       <span className="text-[8px] font-black uppercase text-slate-400">{member.gender}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onDeleteMember(member.id)} className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                   <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
            
            {members.length === 0 && !choirDirector && (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Sin registros registrados</p>
              </div>
            )}
          </div>

          {/* Vista para Escritorio (Tabla) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-left">
                  <th className="px-10 py-6">Perfil</th>
                  <th className="px-10 py-6">Tesitura</th>
                  <th className="px-10 py-6 text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {choirDirector && (
                  <tr className="bg-gradient-to-r from-secondary/10 to-transparent border-l-8 border-secondary group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                         <div className="size-16 rounded-2xl bg-gradient-to-br from-secondary to-[#ecd6c0] flex items-center justify-center font-black text-midnight text-2xl shadow-2xl">
                            {choirDirector.name.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{choirDirector.name}</span>
                               <span className="bg-secondary text-midnight text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">Director</span>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-midnight dark:bg-white text-white dark:text-midnight text-[11px] font-black uppercase tracking-widest">
                          <span className="material-symbols-outlined text-sm fill-1">star</span>
                          Director
                       </span>
                    </td>
                    <td className="px-10 py-8 text-center text-slate-300">
                       <span className="material-symbols-outlined">lock</span>
                    </td>
                  </tr>
                )}

                {members.map(member => (
                  <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                         <div className={`size-14 rounded-2xl bg-gradient-to-br ${getVoiceColor(member.voiceType)} flex items-center justify-center font-black text-white text-xl shadow-lg`}>
                            {member.firstName.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">{member.firstName} {member.lastName}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{member.gender}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r ${getVoiceColor(member.voiceType)} text-white text-[11px] font-black uppercase tracking-widest shadow-xl`}>
                          {member.voiceType}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <button onClick={() => onDeleteMember(member.id)} className="size-12 rounded-2xl border-2 border-slate-200 dark:border-white/5 text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center mx-auto">
                         <span className="material-symbols-outlined text-xl">delete</span>
                       </button>
                    </td>
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
