
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
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Libro de <span className="text-primary">Asistencia</span></h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-tight">Validación oficial por sede</p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
        {isReportAlreadySent ? (
          <div className="p-16 text-center flex flex-col items-center gap-6 bg-emerald-50 dark:bg-emerald-950/20">
             <span className="material-symbols-outlined text-6xl text-emerald-500 font-black">verified</span>
             <h3 className="text-2xl font-black text-emerald-600 uppercase">Reporte enviado con éxito</h3>
             <button onClick={() => setSelectedEventId('')} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-8 py-3 rounded-2xl font-black uppercase text-[10px] text-slate-900 dark:text-white">Seleccionar otro evento</button>
          </div>
        ) : (
          <>
            <div className="p-8 lg:p-10 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6 bg-slate-50 dark:bg-white/5">
              <div className="flex flex-col gap-2 min-w-[300px]">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acta / Evento</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl font-bold p-3.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="" disabled className="text-slate-900">Seleccione el evento...</option>
                  {events.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.name} ({e.date})</option>)}
                </select>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center"><p className="text-3xl font-black text-primary">{Object.values(presenceMap).filter(v => v).length}</p><p className="text-[9px] font-black text-slate-400 uppercase">Presentes</p></div>
                <div className="text-center"><p className="text-3xl font-black text-slate-300">{members.length - Object.values(presenceMap).filter(v => v).length}</p><p className="text-[9px] font-black text-slate-400 uppercase">Ausentes</p></div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <div key={member.id} onClick={() => togglePresence(member.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${presenceMap[member.id] ? 'bg-primary/5 border-primary' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${presenceMap[member.id] ? 'text-primary' : 'text-slate-900 dark:text-slate-200'}`}>{member.firstName} {member.lastName}</span>
                    <div className={`size-8 rounded-full flex items-center justify-center ${presenceMap[member.id] ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}><span className="material-symbols-outlined text-sm font-black">{presenceMap[member.id] ? 'verified' : 'circle'}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex justify-end">
              <button disabled={!selectedEventId || members.length === 0} onClick={handleSave} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl disabled:opacity-50 uppercase tracking-widest text-[10px]">Sellar Acta</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
