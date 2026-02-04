
import React, { useState, useMemo } from 'react';
import { Member, AttendanceRecord, Event, User, Role } from '../types';

interface ReportsProps {
  members: Member[];
  events: Event[];
  onSaveReport: (records: AttendanceRecord[]) => void;
  reports: AttendanceRecord[];
  currentUser: User;
}

const Reports: React.FC<ReportsProps> = ({ members, events, onSaveReport, reports, currentUser }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const selectedEvent = events.find(e => e.id === selectedEventId);
  
  const isReportAlreadySent = useMemo(() => {
    if (!selectedEventId || !currentUser.choirId) return false;
    return reports.some(r => {
      const member = members.find(m => m.id === r.memberId);
      return r.eventId === selectedEventId && member?.choirId === currentUser.choirId;
    });
  }, [reports, selectedEventId, currentUser.choirId, members]);

  const myHistory = useMemo(() => {
    if (!currentUser.choirId) return [];
    const grouped: Record<string, { eventName: string, date: string, count: number, total: number }> = {};
    reports.forEach(r => {
      const member = members.find(m => m.id === r.memberId);
      if (member?.choirId === currentUser.choirId) {
        if (!grouped[r.eventId]) {
          const ev = events.find(e => e.id === r.eventId);
          grouped[r.eventId] = { eventName: ev?.name || 'Evento Desconocido', date: r.date, count: 0, total: 0 };
        }
        grouped[r.eventId].total++;
        if (r.present) grouped[r.eventId].count++;
      }
    });
    return Object.values(grouped);
  }, [reports, currentUser.choirId, members, events]);

  const togglePresence = (memberId: string) => {
    if (isReportAlreadySent) return;
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
    setPresenceMap({});
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Libro de <span className="text-primary">Asistencia</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Sede: {currentUser.name}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
        {isReportAlreadySent ? (
          <div className="p-16 text-center flex flex-col items-center gap-6 bg-emerald-50 dark:bg-emerald-950/20">
             <div className="size-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl">
               <span className="material-symbols-outlined text-4xl font-black">verified</span>
             </div>
             <div>
                <h3 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">Reporte Enviado</h3>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">El acta ha sido sellada digitalmente</p>
             </div>
             <button onClick={() => setSelectedEventId('')} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-10 py-4 rounded-2xl font-black uppercase text-[10px] text-slate-900 dark:text-white hover:scale-105 transition-all shadow-sm">Firmar otra Acta</button>
          </div>
        ) : (
          <>
            <div className="p-8 lg:p-10 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6 bg-slate-50 dark:bg-white/5">
              <div className="flex flex-col gap-2 min-w-[300px] flex-1">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Evento a Reportar</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl font-black p-4 text-[11px] text-slate-900 dark:text-white uppercase"
                >
                  <option value="" disabled>Seleccione el acta...</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name.toUpperCase()} ({e.date})</option>)}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center"><p className="text-3xl font-black text-primary leading-none">{Object.values(presenceMap).filter(v => v).length}</p><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Presentes</p></div>
                <div className="text-center"><p className="text-3xl font-black text-slate-300 leading-none">{members.length - Object.values(presenceMap).filter(v => v).length}</p><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Ausentes</p></div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map(member => (
                  <div key={member.id} onClick={() => togglePresence(member.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${presenceMap[member.id] ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-black uppercase tracking-tight ${presenceMap[member.id] ? 'text-primary' : 'text-slate-900 dark:text-slate-200'}`}>{member.firstName} {member.lastName}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{member.voiceType}</span>
                    </div>
                    <div className={`size-8 rounded-xl flex items-center justify-center ${presenceMap[member.id] ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}>
                       <span className="material-symbols-outlined text-sm font-black">{presenceMap[member.id] ? 'check' : 'circle'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                onClick={() => setSelectedEventId('')}
                className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-500 font-black rounded-2xl border border-slate-200 dark:border-white/10 uppercase tracking-widest text-[9px] hover:text-red-500 transition-all"
              >
                CANCELAR
              </button>
              <button 
                disabled={!selectedEventId || members.length === 0} 
                onClick={handleSave} 
                className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
              >
                SELLAR ACTA DE ASISTENCIA
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
