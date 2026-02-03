
import React, { useRef, useMemo } from 'react';
import { User, Member, AttendanceRecord, ChoirData } from '../types';

interface DirectorProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateAvatar: (newAvatar: string) => void;
  onImportData: (data: any) => void;
  onExportData: () => void;
  members: Member[];
  reports: AttendanceRecord[];
  choirs: ChoirData[];
}

const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ 
  user, onClose, onUpdateAvatar, onImportData, onExportData, members, reports, choirs 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const choir = choirs.find(c => c.id === user.choirId);

  const stats = useMemo(() => {
    if (!user.choirId) return null;
    const choirMembers = members.filter(m => m.choirId === user.choirId);
    const choirMemberIds = new Set(choirMembers.map(m => m.id));
    const choirReports = reports.filter(r => choirMemberIds.has(r.memberId));
    
    const attendance = choirReports.length > 0 
      ? Math.round((choirReports.filter(r => r.present).length / choirReports.length) * 100)
      : 0;

    return {
      totalMembers: choirMembers.length,
      attendance,
      voices: {
        Soprano: choirMembers.filter(m => m.voiceType === 'Soprano').length,
        Contralto: choirMembers.filter(m => m.voiceType === 'Contralto').length,
        Tenor: choirMembers.filter(m => m.voiceType === 'Tenor').length,
        Bajo: choirMembers.filter(m => m.voiceType === 'Bajo').length,
      }
    };
  }, [user.choirId, members, reports]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 400, 400);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        onUpdateAvatar(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImportData(data);
        } catch (error) {
          alert("El archivo no es válido.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white dark:bg-card-dark rounded-[4rem] shadow-3xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10">
        
        <div className="h-40 bg-gradient-to-r from-primary via-vibrant-pink to-secondary relative">
           <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
           <button onClick={onClose} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all">
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        <div className="px-12 pb-16 relative">
           <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 -mt-20">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="size-44 lg:size-52 rounded-[3rem] bg-white dark:bg-midnight p-3 shadow-3xl border-4 border-white dark:border-slate-900 relative group cursor-pointer"
              >
                 <div className="size-full rounded-[2.2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
                    {user.avatar ? (
                      <img src={user.avatar} className="size-full object-cover" alt={user.name} />
                    ) : (
                      <span className="text-7xl font-black text-slate-300">{user.name.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
                    </div>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 text-center lg:text-left space-y-2">
                 <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.name}</h2>
                 <p className="text-primary font-black uppercase tracking-[0.2em] text-sm">
                   {user.role === 'ADMIN' ? 'Administrador Maestro' : `Director de ${choir?.name || 'Sede Institucional'}`}
                 </p>
              </div>
           </div>

           <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">sync</span>
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Pasarela de Sincronización</h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-6 font-bold uppercase leading-relaxed">
                Usa estas herramientas para pasar tus fotos y datos de un dispositivo a otro (Ej. de PC a Celular).
              </p>
              <div className="flex flex-wrap gap-4">
                 <button onClick={onExportData} className="flex-1 min-w-[180px] py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    Exportar Base de Datos
                 </button>
                 <button onClick={() => importInputRef.current?.click()} className="flex-1 min-w-[180px] py-4 bg-secondary text-white dark:text-black dark:bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                    Importar Base de Datos
                 </button>
                 <input type="file" ref={importInputRef} accept=".json" onChange={handleImportFile} className="hidden" />
              </div>
           </div>

           <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-4xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Eficiencia de Sede</p>
                 <p className="text-5xl font-black text-primary leading-none">{stats?.attendance || 0}%</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-4xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fuerza de Canto</p>
                 <p className="text-5xl font-black text-slate-900 dark:text-white leading-none">{stats?.totalMembers || 0}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Miembros Activos</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-4xl border border-slate-100 dark:border-white/5 space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribución Vocal</p>
                 {stats && Object.entries(stats.voices).map(([voice, count]) => (
                   <div key={voice} className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                      <span className="text-slate-500">{voice}</span>
                      <span className="text-primary">{count}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorProfileModal;
