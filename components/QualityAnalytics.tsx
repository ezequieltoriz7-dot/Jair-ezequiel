
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { AttendanceRecord, ChoirData, Member, Event, Role } from '../types';

interface QualityAnalyticsProps {
  reports: AttendanceRecord[];
  choirs: ChoirData[];
  members: Member[];
  events: Event[];
  userRole: Role;
}

const QualityAnalytics: React.FC<QualityAnalyticsProps> = ({ reports, choirs, members, events, userRole }) => {
  const sortedEvents = useMemo(() => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [events]);
  const [selectedEventId, setSelectedEventId] = useState<string>(sortedEvents[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  const currentEventStats = useMemo(() => {
    if (!selectedEventId) return null;
    const eventReports = reports.filter(r => r.eventId === selectedEventId && r.present);
    const presentMembers = eventReports.map(r => members.find(m => m.id === r.memberId)).filter(Boolean) as Member[];
    
    return {
      total: presentMembers.length,
      voices: [
        { name: 'Sopranos', count: presentMembers.filter(m => m.voiceType === 'Soprano').length, color: '#0EA5E9' },
        { name: 'Contraltos', count: presentMembers.filter(m => m.voiceType === 'Contralto').length, color: '#0369A1' },
        { name: 'Tenores', count: presentMembers.filter(m => m.voiceType === 'Tenor').length, color: '#0F172A' },
        { name: 'Bajos', count: presentMembers.filter(m => m.voiceType === 'Bajo').length, color: '#475569' },
      ],
      gender: {
        men: presentMembers.filter(m => m.gender === 'Hombre').length,
        women: presentMembers.filter(m => m.gender === 'Mujer').length,
      },
      sedes: choirs.map(c => {
        const count = eventReports.filter(r => {
          const m = members.find(mem => mem.id === r.memberId);
          return m?.choirId === c.id;
        }).length;
        return { name: c.name, count };
      }).filter(s => s.count > 0)
    };
  }, [reports, members, choirs, selectedEventId]);

  const voiceDistribution = useMemo(() => {
    if (currentEventStats) {
      return currentEventStats.voices.map(v => ({ name: v.name, value: v.count }));
    }
    return [];
  }, [currentEventStats]);

  const performanceData = useMemo(() => {
    return choirs.map(choir => {
      const choirMembers = members.filter(m => m.choirId === choir.id);
      const choirMemberIds = new Set(choirMembers.map(m => m.id));
      const choirReports = reports.filter(r => choirMemberIds.has(r.memberId));
      const attendanceCount = choirReports.filter(r => r.present).length;
      const totalPossible = choirReports.length;
      const percentage = totalPossible > 0 ? Math.round((attendanceCount / totalPossible) * 100) : 0;
      return { name: choir.name, attendance: percentage };
    }).sort((a, b) => b.attendance - a.attendance);
  }, [reports, choirs, members]);

  const COLORS = ['#0EA5E9', '#0369A1', '#000000', '#64748b'];

  return (
    <div className="animate-in fade-in duration-1000 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-card-dark p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
        <div>
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-3">
              CALIDAD <span className="text-primary">PRO</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg uppercase tracking-tight">Análisis de Impacto Institucional</p>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[300px]">
           <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Evento de Auditoría</label>
           <select 
             value={selectedEventId}
             onChange={(e) => setSelectedEventId(e.target.value)}
             className="bg-slate-50 dark:bg-midnight border-slate-200 dark:border-white/10 rounded-full px-6 py-4 text-xs font-black text-slate-900 dark:text-white focus:ring-primary shadow-sm uppercase"
           >
              {sortedEvents.map(e => <option key={e.id} value={e.id}>{e.name} ({e.date})</option>)}
           </select>
        </div>
      </header>

      {/* SECCIÓN NUEVA: RESUMEN DETALLADO DE JORNADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 flex flex-col justify-between h-48">
           <span className="material-symbols-outlined text-3xl opacity-50">groups</span>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Jornada</p>
              <p className="text-5xl font-black">{currentEventStats?.total || 0}</p>
           </div>
        </div>
        
        <div className="p-8 bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-lg flex flex-col justify-between h-48">
           <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-3xl text-primary">man</span>
              <span className="material-symbols-outlined text-3xl text-primary/30">woman</span>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hombres / Mujeres</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{currentEventStats?.gender.men || 0}</span>
                 <span className="text-sm font-bold text-slate-400">/</span>
                 <span className="text-4xl font-black text-primary">{currentEventStats?.gender.women || 0}</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 p-8 bg-white dark:bg-card-dark rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-lg flex items-center justify-around gap-4 h-48">
           {currentEventStats?.voices.map((v, i) => (
             <div key={v.name} className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{v.count}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{v.name}</p>
                <div className="h-1 w-6 mx-auto rounded-full mt-2" style={{ backgroundColor: COLORS[i] }}></div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-card-dark p-8 lg:p-12 rounded-5xl shadow-lg border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Eficiencia por Sede (%)</h3>
             <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase rounded-full hover:bg-primary hover:text-white transition-all">
                Ver Ranking Sedes
             </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b20" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: 'none', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#0EA5E9' }}
                />
                <Bar dataKey="attendance" radius={[12, 12, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attendance > 90 ? '#0EA5E9' : '#0369A1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-card-dark p-8 lg:p-12 rounded-5xl shadow-lg border border-slate-200 dark:border-white/5 flex flex-col">
          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter mb-8">Balance Vocal Jornada</h3>
          <div className="h-[250px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={voiceDistribution.length > 0 ? voiceDistribution : [{name: 'Sin datos', value: 1}]} 
                  cx="50%" cy="50%" 
                  innerRadius={65} 
                  outerRadius={95} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {voiceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {voiceDistribution.length === 0 && <Cell fill="#f1f5f9" />}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
             {voiceDistribution.map((v, i) => (
               <div key={v.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                     <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">{v.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{v.value} Miembros</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white dark:bg-card-dark rounded-5xl shadow-3xl overflow-hidden p-10 lg:p-16 border border-white/10 animate-in zoom-in-95 duration-300">
            <header className="flex justify-between items-center mb-10">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ranking por <span className="text-primary">Sede</span></h3>
               <button onClick={() => setIsModalOpen(false)} className="size-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </header>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
               {currentEventStats?.sedes.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all">
                     <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{s.name}</span>
                     <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-primary">{s.count}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presentes</span>
                     </div>
                  </div>
               ))}
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-10 py-5 bg-primary text-white font-black rounded-3xl uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
            >
              Cerrar Resumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAnalytics;
