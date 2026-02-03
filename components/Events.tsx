
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = userRole === Role.ADMIN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1500000) {
        alert("La imagen es muy pesada. Por favor usa una imagen de menos de 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    try {
      if (editingId) {
        onUpdateEvent({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        onAddEvent({ id: crypto.randomUUID(), ...formData });
      }
      setFormData({ name: '', date: '', time: '', location: '', imageUrl: '', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert("Error al guardar. Imagen demasiado grande para la memoria del navegador.");
    }
  };

  const handleEditClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setEditingId(event.id);
    setFormData({
      name: event.name || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || 'Sede Principal',
      imageUrl: event.imageUrl || '',
      description: event.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que desea eliminar esta fecha institucional?")) {
      onDeleteEvent(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', date: '', time: '', location: '', imageUrl: '', description: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 lg:space-y-20 pb-20 max-w-[1400px] mx-auto">
      {/* Header Centrado Reducido en móvil */}
      <div className="flex flex-col items-center text-center gap-1.5 lg:gap-4 px-2">
        <h2 className="text-xl lg:text-7xl font-black tracking-tighter text-primary dark:text-white uppercase leading-tight lg:leading-none">
          Agenda <span className="text-secondary">Monumental</span>
        </h2>
        <div className="h-0.5 w-16 lg:w-32 bg-primary rounded-full"></div>
        <p className="text-slate-500 dark:text-slate-400 text-[8px] lg:text-xl font-bold uppercase tracking-[0.1em] lg:tracking-[0.25em]">
          {isAdmin ? 'Gestión Programación' : 'Eventos y Ensayos'}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-4 lg:gap-16`}>
        {/* Formulario Reducido en móvil */}
        {isAdmin && (
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className={`bg-white dark:bg-card-dark p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border transition-all shadow-lg sticky top-24 ${editingId ? 'border-secondary ring-4 ring-secondary/5' : 'border-slate-200 dark:border-white/5'}`}>
              <h3 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5 ${editingId ? 'text-secondary' : 'text-primary'}`}>
                <span className="material-symbols-outlined text-base">
                  {editingId ? 'edit_calendar' : 'calendar_add_on'}
                </span>
                {editingId ? 'Editando' : 'Programar'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[6px] font-black uppercase text-slate-500 mb-0.5 tracking-widest ml-0.5">Título</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-md lg:rounded-2xl p-2.5 text-[10px] font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="block text-[6px] font-black uppercase text-slate-500 mb-0.5 tracking-widest ml-0.5">Fecha</label>
                      <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-md lg:rounded-2xl p-2.5 text-[8px] font-bold" />
                   </div>
                   <div>
                      <label className="block text-[6px] font-black uppercase text-slate-500 mb-0.5 tracking-widest ml-0.5">Hora</label>
                      <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 dark:bg-midnight border-none rounded-md lg:rounded-2xl p-2.5 text-[8px] font-bold" />
                   </div>
                </div>
                <button type="submit" className={`w-full py-2.5 lg:py-5 text-white font-black rounded-lg lg:rounded-[2rem] shadow-md uppercase tracking-widest text-[9px] transition-all active:scale-95 ${editingId ? 'bg-secondary text-midnight' : 'bg-primary'}`}>
                  {editingId ? 'Listo' : 'Publicar'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Eventos (Más compacta en móviles) */}
        <div className={`${isAdmin ? 'lg:col-span-8' : 'col-span-12'} space-y-4 lg:space-y-10`}>
          {events.length === 0 ? (
            <div className="py-12 bg-white dark:bg-card-dark rounded-xl lg:rounded-[4rem] border border-slate-200 dark:border-white/5 flex flex-col items-center text-slate-400 shadow-sm mx-auto max-w-2xl">
               <span className="material-symbols-outlined text-4xl mb-2 opacity-20">calendar_today</span>
               <p className="font-black uppercase tracking-[0.1em] text-[9px]">Vacío</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isAdmin ? 'grid-cols-1' : 'md:grid-cols-2'} gap-3 lg:gap-10`}>
              {sortedEvents.map(event => {
                const eventDate = new Date(event.date + 'T12:00:00');
                return (
                  <div 
                    key={event.id} 
                    onClick={() => onViewEvent(event)}
                    className={`bg-white dark:bg-card-dark p-3.5 lg:p-10 rounded-xl lg:rounded-[3.5rem] border transition-all shadow-sm dark:shadow-none flex flex-col items-center text-center gap-3 lg:gap-6 group cursor-pointer hover:border-primary/50 hover:scale-[1.005] active:scale-95 ${editingId === event.id ? 'border-secondary ring-1 ring-secondary/10' : 'border-slate-100 dark:border-white/5'}`}
                  >
                     {/* Fecha Reducida */}
                     <div className={`size-14 lg:size-24 rounded-xl lg:rounded-[2rem] flex flex-col items-center justify-center text-white shadow-md transition-transform group-hover:rotate-1 ${editingId === event.id ? 'bg-secondary text-midnight' : 'bg-primary'}`}>
                        <span className="text-[7px] lg:text-[10px] font-black uppercase opacity-70 tracking-widest leading-none">
                           {eventDate.toLocaleString('es', {month: 'short'})}
                        </span>
                        <span className="text-xl lg:text-4xl font-black leading-none mt-0.5">{eventDate.getDate()}</span>
                     </div>

                     {/* Información Principal Reducida */}
                     <div className="flex flex-col items-center gap-1 lg:gap-3 w-full">
                        <h4 className="text-sm lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight px-0.5 truncate w-full">
                           {event.name}
                        </h4>
                        
                        <div className="flex flex-wrap items-center justify-center gap-1.5 lg:gap-4">
                           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 dark:bg-white/5 rounded-full text-[7px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">
                              <span className="material-symbols-outlined text-primary text-[10px] lg:text-base">schedule</span> 
                              {event.time || '10:00'}
                           </div>
                           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 dark:bg-white/5 rounded-full text-[7px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">
                              <span className="material-symbols-outlined text-primary text-[10px] lg:text-base">location_on</span> 
                              {event.location || 'Sede'}
                           </div>
                        </div>
                     </div>

                     {/* Miniatura Reducida */}
                     {event.imageUrl && (
                       <div className="w-full aspect-[3/1] lg:aspect-video rounded-lg lg:rounded-[2.5rem] overflow-hidden border lg:border-4 border-white dark:border-slate-800 shadow-md mt-0">
                         <img src={event.imageUrl} className="size-full object-cover transition-transform duration-700 group-hover:scale-102" alt="Evento" />
                       </div>
                     )}

                     {/* Acciones Reducidas */}
                     {isAdmin && (
                       <div className="flex gap-1.5 w-full border-t border-slate-50 dark:border-white/5 pt-3 lg:pt-6 justify-center">
                          <button onClick={(e) => handleEditClick(e, event)} className="px-2.5 lg:px-6 py-1.5 lg:py-3 rounded-md lg:rounded-2xl bg-slate-50 dark:bg-white/5 text-primary flex items-center gap-1 font-black uppercase text-[7px] lg:text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                             <span className="material-symbols-outlined text-xs lg:text-lg">edit</span>
                             Edit
                          </button>
                          <button onClick={(e) => handleDeleteClick(e, event.id)} className="px-2.5 lg:px-6 py-1.5 lg:py-3 rounded-md lg:rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center gap-1 font-black uppercase text-[7px] lg:text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
                             <span className="material-symbols-outlined text-xs lg:text-lg">delete</span>
                             Del
                          </button>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
