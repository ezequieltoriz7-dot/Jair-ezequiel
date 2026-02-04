
import React from 'react';
import { Event } from '../types';

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onBack }) => {
  const eventDate = new Date(event.date + 'T12:00:00');
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700 max-w-6xl mx-auto space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
      >
        <span className="material-symbols-outlined text-sm font-black group-hover:-translate-x-1 transition-transform">arrow_back</span> 
        Regresar a la Cartelera
      </button>

      <div className="bg-white dark:bg-card-dark rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-3xl overflow-hidden">
        <div className="relative h-[400px] lg:h-[550px] w-full overflow-hidden">
          {event.imageUrl ? (
            <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.name} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-[#60a5fa] to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-9xl text-white/20">event</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent"></div>
          
          <div className="absolute bottom-12 left-12 right-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="px-4 py-1.5 bg-secondary text-midnight text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Evento Oficial
                 </span>
                 {diffDays > 0 && (
                   <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                      Faltan {diffDays} días
                   </span>
                 )}
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                {event.name}
              </h1>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 text-center min-w-[120px]">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Día</p>
                <p className="text-3xl font-black text-white">{eventDate.getDate()}</p>
                <p className="text-[10px] font-black text-secondary uppercase">{eventDate.toLocaleString('es', {month: 'long'})}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-12 lg:p-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Detalles del Programa</h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
                {event.description || "Este evento forma parte de la programación oficial de Coros Monumentales 'El Umbral'. Se requiere puntualidad y vestimenta institucional completa. Los directores de sede deberán reportar la asistencia al finalizar la jornada."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-start gap-5">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horario de Inicio</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{event.time || '10:00 AM'}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-3xl">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sede de Encuentro</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{event.location || 'Sede Principal'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Avisos Importantes</h4>
              <ul className="space-y-4">
                <li className="flex gap-4">
                   <span className="material-symbols-outlined text-secondary fill-1">info</span>
                   <span className="text-xs text-slate-500 font-bold">Llegar 15 minutos antes para vocalización grupal.</span>
                </li>
                <li className="flex gap-4">
                   <span className="material-symbols-outlined text-secondary fill-1">check_circle</span>
                   <span className="text-xs text-slate-500 font-bold">Uso obligatorio de Gafete Institucional.</span>
                </li>
                <li className="flex gap-4">
                   <span className="material-symbols-outlined text-secondary fill-1">menu_book</span>
                   <span className="text-xs text-slate-500 font-bold">Traer repertorio 'Sinfonía de Esperanza' impreso.</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-6 bg-primary text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.2em] text-xs hover:scale-[1.03] active:scale-95 transition-all">
              Añadir a mi Calendario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
