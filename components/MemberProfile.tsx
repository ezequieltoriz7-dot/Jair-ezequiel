
import React, { useMemo } from 'react';
import { Member, AttendanceRecord, Event, ChoirData } from '../types';

interface MemberProfileProps {
  member: Member;
  reports: AttendanceRecord[];
  events: Event[];
  choir: ChoirData;
  onBack: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ member, reports, events, choir, onBack }) => {
  const myReports = useMemo(() => {
    return reports
      .filter(r => r.memberId === member.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, member.id]);

  const stats = useMemo(() => {
    const presentCount = myReports.filter(r => r.present).length;
    const total = myReports.length;
    const ratio = total > 0 ? Math.round((presentCount / total) * 100) : 0;
    
    // LÓGICA DE ALERTA: 3 o más faltas consecutivas (empezando desde el más reciente)
    let consecutiveAbsences = 0;
    for (const r of myReports) {
      if (!r.present) {
        consecutiveAbsences++;
      } else {
        break; // Se rompe la racha si hay una asistencia
      }
    }

    return {
      present: presentCount,
      absent: total - presentCount,
      ratio,
      needsFollowUp: consecutiveAbsences >= 3,
      streak: consecutiveAbsences
    };
  }, [myReports]);

  const history = useMemo(() => {
    return myReports.map(report => {
      const event = events.find(e => e.id === report.eventId);
      return {
        ...report,
        eventName: event?.name || 'Evento Institucional'
      };
    });
  }, [myReports, events]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:-translate-x-1 transition-transform">
        <span className="material-symbols-outlined">arrow_back</span> Regresar a la Lista
      </button>

      <div className="bg-white dark:bg-card-dark rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="h-40 lg:h-56 bg-gradient-to-r from-primary via-vibrant-pink to-secondary relative">
           <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="px-10 lg:px-16 pb-16 relative">
           <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 -mt-20 lg:-mt-24">
              <div className="size-40 lg:size-48 rounded-[3rem] bg-white dark:bg-midnight p-3 shadow-3xl border-4 border-white dark:border-slate-900">
                 <div className="size-full rounded-[2.2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 overflow-hidden">
                    <span className="material-symbols-outlined text-7xl">person</span>
                 </div>
              </div>
              <div className="flex-1 text-center lg:text-left space-y-2">
                 <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                       {member.firstName} {member.lastName}
                    </h2>
                    {stats.needsFollowUp && (
                      <div className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce shadow-lg shadow-red-500/20">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Seguimiento Requerido
                      </div>
                    )}
                 </div>
                 <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">{member.email}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-10 bg-slate-50 dark:bg-midnight rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Efectividad Total</p>
                 <p className="text-6xl font-black text-primary">{stats.ratio}%</p>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-midnight rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col justify-center gap-6">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asistencias</span>
                    <span className="text-2xl font-black text-emerald-500">{stats.present}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inasistencias</span>
                    <span className="text-2xl font-black text-red-500">{stats.absent}</span>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-midnight rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede Actual</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{choir.name}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuerda</span>
                    <span className="text-xs font-black text-primary uppercase">{member.voiceType}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Género</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{member.gender}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark p-12 lg:p-16 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">
         <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">Cronología de Auditoría</h3>
         <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-6">
                    <div className={`size-12 rounded-2xl flex items-center justify-center text-white shadow-md ${record.present ? 'bg-emerald-500' : 'bg-red-400'}`}>
                       <span className="material-symbols-outlined text-2xl">
                          {record.present ? 'check_circle' : 'cancel'}
                       </span>
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{record.eventName}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{record.date}</p>
                    </div>
                 </div>
                 <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    record.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                 }`}>
                    {record.present ? 'Presente' : 'Ausente'}
                 </span>
              </div>
            ))}

            {history.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-4xl">
                 <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">history</span>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No existen registros de auditoría para este miembro</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default MemberProfile;
