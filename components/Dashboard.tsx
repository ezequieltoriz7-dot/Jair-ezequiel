import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TimeFilter, AttendanceRecord, Member, ViewType } from '../types';
import { CHOIR_DATA } from '../constants';

interface DashboardProps {
  reports: AttendanceRecord[];
  members: Member[];
  onNavigateToChoir: (choirId: string, view: ViewType) => void;
  onViewAllMembers: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reports, members, onNavigateToChoir, onViewAllMembers }) => {
  const [filter, setFilter] = useState<TimeFilter>(TimeFilter.TODAY);
  const [showMemberSummary, setShowMemberSummary] = useState(false);

  const stats = useMemo(() => {
    const presentCount = reports.filter(r => r.present).length;
    const totalRecords = reports.length;
    const ratio = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    return {
      presence: ratio,
      memberCount: members.length, 
      sedeCount: CHOIR_DATA.length, 
      growth: totalRecords > 0 ? "+Real" : "S/D"
    };
  }, [reports, members]);

  const memberDetails = useMemo(() => {
    return {
      men: members.filter(m => m.gender === 'Hombre').length,
      women: members.filter(m => m.gender === 'Mujer').length,
      sopranos: members.filter(m => m.voiceType === 'Soprano').length,
      contraltos: members.filter(m => m.voiceType === 'Contralto').length,
      tenors: members.filter(m => m.voiceType === 'Tenor').length,
      bajos: members.filter(m => m.voiceType === 'Bajo').length,
      unasigned: members.filter(m => m.voiceType === 'Por asignar').length,
    };
  }, [members]);

  const choirRankingReal = useMemo(() => {
    return CHOIR_DATA.map(choir => {
      const choirMembers = members.filter(m => m.choirId === choir.id);
      const choirMemberIds = new Set(choirMembers.map(m => m.id));
      const choirReports = reports.filter(r => choirMemberIds.has(r.memberId));
      
      const attendance = choirReports.length > 0 
        ? Math.round((choirReports.filter(r => r.present).length / choirReports.length) * 100)
        : 0;
      
      const sent = choirReports.length > 0;
      return { ...choir, attendance, sent };
    }).sort((a, b) => b.attendance - a.attendance);
  }, [reports, members]);

  const weekendChartData = useMemo(() => {
    const start = new Date('2026-01-31T00:00:00'); 
    const end = new Date('2026-04-06T23:59:59'); 
    const data = [];
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day === 6 || day === 0) {
        const dateStr = current.toISOString().split('T')[0];
        const dayReports = reports.filter(r => r.date === dateStr);
        const dayPresence = dayReports.length > 0 ? Math.round((dayReports.filter(r => r.present).length / dayReports.length) * 100) : 0;
        data.push({
          date: dateStr,
          val: dayPresence,
          name: `${day === 6 ? 'Sáb' : 'Dom'} ${current.getDate()}`
        });
      }
      // Fix: current.setDate() expects an argument. Use getDate() to retrieve current day and increment.
      current.setDate(current.getDate() + 1);
    }
    return data;
  }, [reports]);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            VISTA <span className="text-primary">MÁXIMA</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Análisis Institucional Pro</p>
        </div>
        
        <div className="flex bg-white dark:bg-card-dark p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-white/5">
          {Object.values(TimeFilter).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                filter === f ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary to-blue-800 p-8 lg:p-12 rounded-5xl text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 size-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-10">
            <span className="material-symbols-outlined text-4xl opacity-50">query_stats</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">Asistencia Global</p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl lg:text-9xl font-black tracking-tighter">{stats.presence}%</span>
                <span className="text-xl font-bold opacity-60 uppercase">Efectiva</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowMemberSummary(true)} 
          className="bg-white dark:bg-card-dark p-8 rounded-5xl shadow-lg border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:scale-[1.02] transition-all group"
        >
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
             <span className="material-symbols-outlined text-3xl">diversity_3</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Miembros</p>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{stats.memberCount}</span>
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
            </div>
          </div>
        </button>

        <button 
          onClick={onViewAllMembers}
          className="bg-white dark:bg-card-dark p-8 rounded-5xl shadow-lg border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:scale-[1.02] transition-all group"
        >
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
             <span className="material-symbols-outlined text-3xl">church</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sedes</p>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{stats.sedeCount}</span>
              <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark p-8 lg:p-12 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5">
          <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-10">Historial Semanal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekendChartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="#0EA5E9" strokeWidth={3} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-8 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-8">Estatus Sedes</h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {choirRankingReal.map(choir => (
              <div key={choir.id} onClick={() => onNavigateToChoir(choir.id, ViewType.REPORTS)} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:border-primary/30 border border-transparent transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center font-black text-white ${choir.sent ? 'bg-primary' : 'bg-slate-300'}`}>
                    {choir.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{choir.name}</span>
                    <span className={`text-[9px] font-bold uppercase ${choir.sent ? 'text-primary' : 'text-slate-400'}`}>{choir.sent ? 'REPORTE OK' : 'PENDIENTE'}</span>
                  </div>
                </div>
                <span className="text-sm font-black text-primary">{choir.attendance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL RESUMEN DE MIEMBROS */}
      {showMemberSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowMemberSummary(false)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-card-dark rounded-[3rem] shadow-3xl overflow-hidden p-8 lg:p-12 border border-white/10 animate-in zoom-in-95 duration-300">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Censo <span className="text-primary">Institucional</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desglose de Identidades y Voces</p>
              </div>
              <button onClick={() => setShowMemberSummary(false)} className="size-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-4xl border border-blue-100 dark:border-blue-800/20 text-center group transition-all">
                <span className="material-symbols-outlined text-blue-500 mb-2">woman</span>
                <p className="text-4xl font-black text-blue-600 leading-none">{memberDetails.women}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Mujeres</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-midnight rounded-4xl border border-slate-200 dark:border-white/5 text-center group transition-all">
                <span className="material-symbols-outlined text-slate-500 mb-2">man</span>
                <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{memberDetails.men}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Hombres</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Balance de Registro Vocal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Sopranos', count: memberDetails.sopranos, color: 'bg-primary' },
                  { name: 'Contraltos', count: memberDetails.contraltos, color: 'bg-vibrant-pink' },
                  { name: 'Tenores', count: memberDetails.tenors, color: 'bg-secondary dark:bg-white/20' },
                  { name: 'Bajos', count: memberDetails.bajos, color: 'bg-midnight dark:bg-white/10' },
                  { name: 'Por asignar', count: memberDetails.unasigned, color: 'bg-slate-200 dark:bg-white/5' }
                ].map((voice) => (
                  <div key={voice.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${voice.color}`}></div>
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">{voice.name}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{voice.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setShowMemberSummary(false)}
              className="w-full mt-10 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all"
            >
              Cerrar Resumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;