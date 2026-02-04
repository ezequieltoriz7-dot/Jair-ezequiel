
import React, { useState, useRef, useMemo } from 'react';
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
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
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

  // Algoritmo de recorte inteligente para evitar estiramiento
  const processAndCropImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 600; // Resolución final del avatar
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calcular el recorte cuadrado central
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        // Dibujar solo el cuadrado central en el lienzo de destino
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
        setIsAdjusting(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhotoAdjustment = async () => {
    if (tempPhoto) {
      const croppedPhoto = await processAndCropImage(tempPhoto);
      onUpdateAvatar(croppedPhoto);
      setIsAdjusting(false);
      setTempPhoto(null);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      {/* VENTANA DE AJUSTE DE FOTO (CROP OVERLAY) */}
      {isAdjusting && tempPhoto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-[3.5rem] p-10 shadow-3xl border border-white/10 text-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Ajustar Fotografía</h3>
            
            <div className="size-64 mx-auto rounded-full overflow-hidden border-8 border-primary/20 shadow-2xl mb-8 relative">
               <img src={tempPhoto} className="size-full object-cover" alt="Previsualización" />
               <div className="absolute inset-0 border-[16px] border-black/20 rounded-full pointer-events-none"></div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 leading-relaxed px-4">
              La imagen se ha centrado automáticamente para evitar estiramientos. ¿Deseas guardar este ajuste?
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => { setIsAdjusting(false); setTempPhoto(null); }} 
                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmPhotoAdjustment} 
                className="flex-1 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Guardar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card-dark rounded-[3.5rem] shadow-3xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10 custom-scrollbar">
        
        <div className="h-32 lg:h-40 bg-gradient-to-r from-primary via-vibrant-pink to-secondary relative shrink-0">
           <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
           <button 
             onClick={onClose} 
             className="absolute top-6 right-6 size-12 lg:size-14 rounded-2xl bg-white text-primary flex items-center justify-center hover:scale-110 transition-all shadow-2xl z-20"
             aria-label="Cerrar"
           >
              <span className="material-symbols-outlined text-3xl font-black">close</span>
           </button>
        </div>

        <div className="px-6 lg:px-12 pb-12 relative">
           <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:gap-10 -mt-16 lg:-mt-20">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="size-32 lg:size-52 rounded-[2.5rem] lg:rounded-[3rem] bg-white dark:bg-midnight p-2 shadow-3xl border-4 border-white dark:border-slate-900 relative group cursor-pointer"
              >
                 <div className="size-full rounded-[1.8rem] lg:rounded-[2.2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
                    {user.avatar ? (
                      <img src={user.avatar} className="size-full object-cover" alt={user.name} />
                    ) : (
                      <span className="text-5xl lg:text-7xl font-black text-slate-300">{user.name.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                    </div>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelection} />
              </div>
              <div className="flex-1 text-center lg:text-left space-y-1">
                 <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{user.name}</h2>
                 <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] lg:text-sm">
                   {user.role === 'ADMIN' ? 'Administrador Maestro' : `Director de ${choir?.name || 'Sede Institucional'}`}
                 </p>
              </div>
           </div>

           <div className="mt-10 p-6 lg:p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">sync</span>
                <h3 className="text-[10px] lg:text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Pasarela de Sincronización</h3>
              </div>
              <p className="text-[9px] lg:text-[10px] text-slate-500 mb-6 font-bold uppercase leading-relaxed">
                Herramientas para migrar tus datos entre dispositivos (Ej. de PC a Móvil).
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                 <button onClick={onExportData} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    Exportar Datos
                 </button>
                 <button onClick={() => importInputRef.current?.click()} className="flex-1 py-4 bg-secondary text-white dark:text-black dark:bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                    Importar Datos
                 </button>
                 <input type="file" ref={importInputRef} accept=".json" onChange={handleImportFile} className="hidden" />
              </div>
           </div>

           <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <div className="p-6 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eficiencia Sede</p>
                 <p className="text-4xl lg:text-5xl font-black text-primary leading-none">{stats?.attendance || 0}%</p>
              </div>
              <div className="p-6 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fuerza de Canto</p>
                 <p className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-none">{stats?.totalMembers || 0}</p>
                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Activos</p>
              </div>
              <div className="p-6 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Distribución</p>
                 {stats && Object.entries(stats.voices).map(([voice, count]) => (
                   <div key={voice} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                      <span className="text-slate-500">{voice}</span>
                      <span className="text-primary">{count}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="mt-10 border-t border-slate-100 dark:border-white/5 pt-8">
              <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-3xl border border-slate-200 dark:border-white/10 uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
              >
                CERRAR VENTANA DE PERFIL
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorProfileModal;
