
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
    alert("Acta sellada correctamente.");
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">Libro de <span className="text-primary">Actas</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Responsable: {currentUser.name}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
        {isReportAlreadySent ? (
          <div className="p-16 text-center flex flex-col items-center gap-6 bg-slate-50 dark:bg-slate-900/40">
             <div className="size-20 rounded-full bg-primary text-slate-50 flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-4xl font-black">verified</span>
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Acta Sellada</h3>
                <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">Sincronización completa con la base central</p>
             </div>
             <button onClick={() => setSelectedEventId('')} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-8 py-3 rounded-xl font-black uppercase text-xs text-slate-900 dark:text-slate-100 hover:border-primary transition-all">Firmar otra Acta</button>
          </div>
        ) : (
          <>
            <div className="p-8 lg:p-10 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6 bg-slate-50 dark:bg-white/5">
              <div className="flex flex-col gap-2 min-w-[300px] flex-1">
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-4">Seleccionar Evento</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl font-black p-4 text-sm text-slate-900 dark:text-slate-100 uppercase"
                >
                  <option value="" disabled>Seleccione el evento institucional...</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name.toUpperCase()} — {e.date}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-black text-primary leading-none">{Object.values(presenceMap).filter(v => v).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Presentes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-300 dark:text-slate-600 leading-none">{members.length - Object.values(presenceMap).filter(v => v).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Faltas</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <div key={member.id} onClick={() => togglePresence(member.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${presenceMap[member.id] ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
                    <div className="flex flex-col">
                       <span className={`text-sm font-black uppercase tracking-tight ${presenceMap[member.id] ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{member.firstName} {member.lastName}</span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{member.voiceType}</span>
                    </div>
                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${presenceMap[member.id] ? 'bg-primary text-slate-50 scale-110 shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-300'}`}>
                       <span className="material-symbols-outlined text-lg font-black">{presenceMap[member.id] ? 'check' : 'circle'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                onClick={() => setSelectedEventId('')}
                className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-500 font-black rounded-2xl border border-slate-200 dark:border-white/10 uppercase tracking-widest text-xs hover:text-red-600 transition-all"
              >
                Cancelar
              </button>
              <button 
                disabled={!selectedEventId || members.length === 0} 
                onClick={handleSave} 
                className="px-12 py-4 bg-primary text-slate-50 font-black rounded-2xl shadow-premium disabled:opacity-50 uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
              >
                Firmar y Sellar Acta
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
