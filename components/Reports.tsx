
import React, { useState } from 'react';
import { Member, AttendanceRecord, Event } from '../types';

interface ReportsProps {
  members: Member[];
  events: Event[];
  onSaveReport: (records: AttendanceRecord[]) => void;
}

const Reports: React.FC<ReportsProps> = ({ members, events, onSaveReport }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const togglePresence = (memberId: string) => {
    setPresenceMap(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const handleSave = () => {
    if (!selectedEventId) return;
    const newRecords: AttendanceRecord[] = members.map(m => ({
      id: crypto.randomUUID(),
      eventId: selectedEventId,
      memberId: m.id,
      present: !!presenceMap[m.id],
      date: selectedEvent?.date || ''
    }));
    onSaveReport(newRecords);
    alert("Protocolo de asistencia archivado correctamente.");
    setPresenceMap({});
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col gap-3">
        <h2 className="text-5xl font-extrabold tracking-tighter text-primary dark:text-white uppercase">Libro de <span className="text-secondary">Asistencia</span></h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Validación oficial de la participación vocal por sede.</p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-border-dark flex flex-wrap items-center justify-between gap-10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex flex-col gap-3 min-w-[400px]">
            <label className="text-[10px] font-black uppercase text-secondary tracking-[0.3em]">Selección de Acta / Evento</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-bold p-4 text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary shadow-sm"
            >
              <option value="" disabled>Seleccione el evento protocolar...</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name} — {e.date}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-12 border-l border-slate-200 dark:border-slate-700 pl-12">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-primary dark:text-white">{Object.values(presenceMap).filter(v => v).length}</p>
              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-slate-300 dark:text-slate-600">{members.length - Object.values(presenceMap).filter(v => v).length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ausentes</p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <div 
                key={member.id} 
                onClick={() => togglePresence(member.id)}
                className={`p-6 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  presenceMap[member.id] 
                    ? 'bg-secondary/5 border-secondary shadow-sm' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-bold uppercase tracking-tight ${presenceMap[member.id] ? 'text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-200'}`}>
                    {member.firstName} {member.lastName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Integrante Oficial</span>
                </div>
                <div className={`size-10 rounded-full flex items-center justify-center transition-all ${
                  presenceMap[member.id] ? 'bg-secondary text-primary shadow-lg shadow-secondary/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'
                }`}>
                  <span className="material-symbols-outlined text-lg font-black">
                    {presenceMap[member.id] ? 'verified' : 'circle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-border-dark flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-400">
             <span className="material-symbols-outlined text-sm">info</span>
             <p className="text-[10px] font-bold uppercase tracking-widest">Este reporte tiene carácter de declaración oficial.</p>
          </div>
          <button 
            disabled={!selectedEventId || members.length === 0}
            onClick={handleSave}
            className="px-16 py-5 bg-primary text-secondary font-black rounded-lg hover:bg-black active:scale-95 transition-all shadow-xl disabled:opacity-50 uppercase tracking-[0.25em] text-[10px]"
          >
            Sellar Asistencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
