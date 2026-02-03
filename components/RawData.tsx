
import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Member, ChoirData, Event, User } from '../types';

interface RawDataProps {
  reports: AttendanceRecord[];
  members: Member[];
  choirs: ChoirData[];
  events: Event[];
  users: User[];
  onMemberClick: (member: Member) => void;
}

const RawData: React.FC<RawDataProps> = ({ reports, members, choirs, events, users, onMemberClick }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState({
    date: '', choir: '', name: '', gender: '', voice: '', status: '', location: '', director: ''
  });

  const denormalizedData = useMemo(() => {
    return reports.map(report => {
      const member = members.find(m => m.id === report.memberId);
      const event = events.find(e => e.id === report.eventId);
      const choir = choirs.find(c => c.id === member?.choirId);
      const director = users.find(u => u.choirId === choir?.id);

      return {
        id: report.id,
        memberObject: member, // Referencia al objeto completo para el clic
        date: event?.date || report.date || '---',
        choir: choir?.name || '---',
        name: member ? `${member.firstName} ${member.lastName}` : '---',
        gender: member?.gender || '---',
        voice: member?.voiceType || '---',
        status: report.present ? 'ASISTIÓ' : 'FALTA',
        location: event?.location || '---',
        director: director?.name || 'S/D'
      };
    });
  }, [reports, members, choirs, events, users]);

  const filteredData = useMemo(() => {
    return denormalizedData.filter(row => {
      const matchesGlobal = Object.values(row).some(val => 
        String(val).toLowerCase().includes(globalFilter.toLowerCase())
      );
      const matchesColumn = (
        row.date.toLowerCase().includes(filters.date.toLowerCase()) &&
        row.choir.toLowerCase().includes(filters.choir.toLowerCase()) &&
        row.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        row.gender.toLowerCase().includes(filters.gender.toLowerCase()) &&
        row.voice.toLowerCase().includes(filters.voice.toLowerCase()) &&
        row.status.toLowerCase().includes(filters.status.toLowerCase()) &&
        row.location.toLowerCase().includes(filters.location.toLowerCase()) &&
        row.director.toLowerCase().includes(filters.director.toLowerCase())
      );
      return matchesGlobal && matchesColumn;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [denormalizedData, globalFilter, filters]);

  return (
    <div className="animate-in fade-in duration-700 space-y-6 pb-20">
      <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Base de Datos <span className="text-primary">Maestra</span></h2>
        <div className="flex gap-3 w-full md:w-auto">
          <input type="text" placeholder="Buscar..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="flex-1 md:w-64 bg-slate-50 dark:bg-midnight border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-midnight border-b border-slate-200 sticky top-0 z-10">
              {['date', 'choir', 'name', 'gender', 'voice', 'status', 'location', 'director'].map((key) => (
                <th key={key} className="p-3 border-r border-slate-200">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key === 'status' ? 'Estatus' : key.toUpperCase()}</span>
                    <input type="text" value={filters[key as keyof typeof filters]} onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))} className="text-[10px] p-1.5 bg-white dark:bg-slate-800 border-slate-200 rounded font-bold text-slate-900 dark:text-white" placeholder="..." />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01]">
                <td className="p-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-r">{row.date}</td>
                <td className="p-3 text-[11px] font-black text-slate-900 dark:text-white border-r uppercase">{row.choir}</td>
                <td className="p-3 text-[11px] font-black text-slate-900 dark:text-white border-r uppercase">
                   <button 
                     onClick={() => row.memberObject && onMemberClick(row.memberObject)}
                     className="text-primary hover:underline hover:scale-105 transition-all text-left uppercase font-black"
                   >
                     {row.name}
                   </button>
                </td>
                <td className="p-3 text-[10px] font-bold text-slate-500 border-r">{row.gender}</td>
                <td className="p-3 text-[10px] font-bold text-slate-500 border-r">{row.voice}</td>
                <td className="p-3 border-r">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black ${row.status === 'ASISTIÓ' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{row.status}</span>
                </td>
                <td className="p-3 text-[11px] font-bold text-slate-500 border-r uppercase truncate max-w-[150px]">{row.location}</td>
                <td className="p-3 text-[10px] font-black text-primary uppercase">{row.director}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawData;
