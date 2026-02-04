import React, { useState, useRef } from 'react';
import { Event, Role } from '../types';

interface EventsProps {
  events: Event[];
  userRole: Role;
  onAddEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (event: Event) => void;
  onViewEvent: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ events, userRole, onAddEvent, onDeleteEvent, onUpdateEvent, onViewEvent }) => {
  const [formData, setFormData] = useState({ name: '', date: '', time: '', location: '', imageUrl: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = userRole === Role.ADMIN;

  // Función de compresión estandarizada para la base de datos local
  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Resolución optimizada para pósters
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Calidad balanceada
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: compressed }));
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    if (editingId) {
      onUpdateEvent({ id: editingId, ...formData });
      setEditingId(null);
    } else {
      onAddEvent({ id: crypto.randomUUID(), ...formData });
    }
    setFormData({ name: '', date: '', time: '', location: '', imageUrl: '', description: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert("Evento guardado en la base de datos.");
  };

  const handleEditClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setEditingId(event.id);
    // Fix: Explicitly map event properties to ensure description is never undefined and id is not included in formData
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || '',
      description: event.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col items-center text-center gap-4">
        <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          Agenda <span className="text-primary">Monumental</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm italic">Programación y Eventos Oficiales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {isAdmin && (
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl sticky top-24">
              <h3 className="text-xs font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_add_on</span>
                {editingId ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl bg-slate-50 dark:bg-midnight border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative"
                >
                   {formData.imageUrl ? (
                     <img src={formData.imageUrl} className="size-full object-cover" alt="Preview" />
                   ) : (
                     <div className="text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">add_photo_alternate</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Subir Póster</p>
                     </div>
                   )}
                   {isCompressing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-black uppercase">Optimizando...</div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                <input type="text" required placeholder="Título del Evento" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-xl p-4 text-sm font-bold" />
                
                <div className="grid grid-cols-2 gap-3">
                   <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="bg-slate-50 dark:bg-midnight border-none rounded-xl p-4 text-xs font-bold" />
                   <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="bg-slate-50 dark:bg-midnight border-none rounded-xl p-4 text-xs font-bold" />
                </div>
                
                <input type="text" placeholder="Ubicación / Sede" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-xl p-4 text-sm font-bold" />
                
                <button type="submit" disabled={isCompressing} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] hover:scale-102 active:scale-95 transition-all">
                  {editingId ? 'Guardar Cambios' : 'Publicar Evento'}
                </button>
                {editingId && <button type="button" onClick={() => setEditingId(null)} className="w-full py-2 text-slate-400 font-black text-[9px] uppercase">Cancelar Edición</button>}
              </form>
            </div>
          </div>
        )}

        <div className={`${isAdmin ? 'lg:col-span-8' : 'col-span-12'} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {sortedEvents.map(event => (
            <div key={event.id} onClick={() => onViewEvent(event)} className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-lg overflow-hidden flex flex-col group cursor-pointer hover:border-primary/40 transition-all">
               <div className="h-48 overflow-hidden relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.name} />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center">
                       <span className="material-symbols-outlined text-5xl text-white/20">event</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                     {new Date(event.date + 'T12:00:00').toLocaleDateString('es', {day: 'numeric', month: 'short'})}
                  </div>
               </div>
               <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 truncate">{event.name}</h4>
                  <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 mt-auto">
                     <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-base">schedule</span> {event.time}</span>
                     <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-base">location_on</span> {event.location}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-white/5">
                       <button onClick={(e) => handleEditClick(e, event)} className="flex-1 py-2 bg-slate-100 dark:bg-white/5 text-primary text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Editar</button>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) onDeleteEvent(event.id); }} className="flex-1 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
                    </div>
                  )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;