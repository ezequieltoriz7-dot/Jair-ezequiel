
import React, { useState, useRef } from 'react';
import { Event, Role } from '../types';

interface EventsProps {
  events: Event[];
  userRole: Role;
  onAddEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ events, userRole, onAddEvent, onDeleteEvent, onUpdateEvent }) => {
  const [formData, setFormData] = useState({ name: '', date: '', time: '', location: '', imageUrl: '' });
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
      setFormData({ name: '', date: '', time: '', location: '', imageUrl: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert("Error al guardar. Imagen demasiado grande para la memoria del navegador.");
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      name: event.name || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || 'Sede Principal',
      imageUrl: event.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', date: '', time: '', location: '', imageUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 lg:space-y-12 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tighter text-primary dark:text-white uppercase leading-tight">
          Agenda <span className="text-secondary">Monumental</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-lg font-bold uppercase tracking-tight">
          {isAdmin ? 'Gestión de Programación' : 'Eventos y Ensayos Especiales'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Formulario de Evento */}
        {isAdmin && (
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className={`bg-white dark:bg-card-dark p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] border-2 transition-all shadow-2xl sticky top-24 ${editingId ? 'border-secondary' : 'border-slate-200 dark:border-white/5'}`}>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3 ${editingId ? 'text-secondary' : 'text-primary'}`}>
                <span className="material-symbols-outlined text-xl">
                  {editingId ? 'edit_calendar' : 'calendar_add_on'}
                </span>
                {editingId ? 'Editando Evento' : 'Nueva Fecha'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-2">Título</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20" placeholder="Ej. Ensayo General" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-2">Fecha</label>
                      <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-xl p-4 text-[10px] font-bold" />
                   </div>
                   <div>
                      <label className="block text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-2">Hora</label>
                      <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-100 dark:bg-midnight border-none rounded-xl p-4 text-[10px] font-bold" />
                   </div>
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-2">Imagen</label>
                  <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative ${formData.imageUrl ? 'border-primary' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-midnight'}`}>
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-slate-400">add_photo_alternate</span>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <button type="submit" className={`w-full py-5 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] ${editingId ? 'bg-secondary text-midnight' : 'bg-primary'}`}>
                  {editingId ? 'Guardar Cambios' : 'Publicar Evento'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="w-full py-3 text-slate-500 font-black uppercase text-[9px] tracking-widest">Cancelar</button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Lista de Eventos */}
        <div className={`lg:col-span-8 order-1 lg:order-2 space-y-6 lg:space-y-8`}>
          {events.length === 0 ? (
            <div className="py-20 bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center text-slate-400">
               <span className="material-symbols-outlined text-5xl mb-4">event_busy</span>
               <p className="font-black uppercase tracking-widest text-[10px]">No hay eventos programados</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isAdmin ? '' : 'sm:grid-cols-2'} gap-6 lg:gap-8`}>
              {sortedEvents.map(event => {
                const eventDate = new Date(event.date + 'T12:00:00');
                return (
                  <div key={event.id} className={`bg-white dark:bg-card-dark p-6 lg:p-8 rounded-3xl lg:rounded-[3.5rem] border transition-all shadow-xl flex flex-col sm:flex-row items-center gap-6 group ${editingId === event.id ? 'border-secondary ring-2 ring-secondary/20' : 'border-slate-200 dark:border-white/5'}`}>
                     <div className="flex flex-row sm:flex-row items-center gap-5 w-full">
                        {/* Fecha Estilizada */}
                        <div className={`size-16 lg:size-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0 ${editingId === event.id ? 'bg-secondary text-midnight' : 'bg-primary'}`}>
                           <span className="text-[8px] lg:text-[10px] font-black uppercase opacity-70">
                              {eventDate.toLocaleString('es', {month: 'short'})}
                           </span>
                           <span className="text-2xl lg:text-3xl font-black leading-none">{eventDate.getDate()}</span>
                        </div>

                        {/* Detalles */}
                        <div className="flex flex-col min-w-0 flex-1">
                           <h4 className="text-sm lg:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{event.name}</h4>
                           <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-2 text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                 <span className="material-symbols-outlined text-secondary text-xs lg:text-sm">schedule</span> {event.time || '10:00 AM'}
                              </div>
                              <div className="flex items-center gap-2 text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                 <span className="material-symbols-outlined text-secondary text-xs lg:text-sm">location_on</span> {event.location || 'Sede Principal'}
                              </div>
                           </div>
                        </div>

                        {/* Poster Pequeño */}
                        {event.imageUrl && (
                          <div className="size-16 lg:size-20 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md hidden xs:block">
                            <img src={event.imageUrl} className="size-full object-cover" alt="Poster" />
                          </div>
                        )}
                     </div>

                     {/* Botones de Acción (Admin) */}
                     {isAdmin && (
                       <div className="flex sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-white/5 pt-4 sm:pt-0 sm:pl-6">
                          <button onClick={() => handleEditClick(event)} className="flex-1 sm:size-10 rounded-xl bg-slate-100 dark:bg-white/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                             <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => onDeleteEvent(event.id)} className="flex-1 sm:size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                             <span className="material-symbols-outlined text-lg">delete</span>
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
