
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
      current.setDate(current.getDate() + 1);
    }
    return data;
  }, [reports]);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">
            VISTA <span className="text-primary">MÁXIMA</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs lg:text-sm mt-2">Análisis Institucional Pro</p>
        </div>
        
        <div className="flex justify-center bg-white dark:bg-card-dark p-1.5 lg:p-2 rounded-2xl shadow-md border border-slate-200 dark:border-white/5">
          {Object.values(TimeFilter).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 lg:px-6 py-2 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                filter === f ? 'bg-primary text-slate-50 shadow-lg' : 'text-slate-400 hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-primary p-8 lg:p-10 rounded-[2.5rem] text-slate-50 shadow-premium relative overflow-hidden">
          <div className="relative z-10 space-y-6 lg:space-y-8">
            <span className="material-symbols-outlined text-3xl lg:text-4xl opacity-40">query_stats</span>
            <div>
              <p className="text-xs lg:text-sm font-black uppercase tracking-widest text-slate-100 opacity-80 mb-2">Asistencia Global</p>
              <div className="flex items-baseline gap-2 lg:gap-4">
                <span className="text-5xl lg:text-8xl font-black tracking-tighter">{stats.presence}%</span>
                <span className="text-sm lg:text-lg font-bold opacity-60 uppercase">Efectiva</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowMemberSummary(true)} 
          className="bg-white dark:bg-card-dark p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:border-primary transition-all group min-h-[160px]"
        >
          <div className="size-12 lg:size-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-50 transition-all">
             <span className="material-symbols-outlined text-2xl lg:text-3xl">diversity_3</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Miembros</p>
            <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 leading-none">{stats.memberCount}</span>
          </div>
        </button>

        <button 
          onClick={onViewAllMembers}
          className="bg-white dark:bg-card-dark p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:border-primary transition-all group min-h-[160px]"
        >
          <div className="size-12 lg:size-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-50 transition-all">
             <span className="material-symbols-outlined text-2xl lg:text-3xl">church</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sedes</p>
            <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 leading-none">{stats.sedeCount}</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5">
          <h3 className="text-base lg:text-xl font-black uppercase text-slate-900 dark:text-slate-100 mb-6 lg:mb-8">Historial de Auditoría</h3>
          <div className="h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekendChartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="val" stroke="#1E40AF" strokeWidth={4} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
          <h3 className="text-base lg:text-lg font-black uppercase text-slate-900 dark:text-slate-100 mb-6">Estatus de Sedes</h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[400px]">
            {choirRankingReal.map(choir => (
              <div key={choir.id} onClick={() => onNavigateToChoir(choir.id, ViewType.REPORTS)} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`size-8 lg:size-10 rounded-xl flex items-center justify-center font-black text-[10px] lg:text-xs text-slate-50 ${choir.sent ? 'bg-primary' : 'bg-slate-300'}`}>
                    {choir.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs lg:text-sm font-black text-slate-900 dark:text-slate-100 uppercase truncate max-w-[100px] lg:max-w-[120px]">{choir.name}</span>
                    <span className={`text-[9px] lg:text-[10px] font-bold uppercase ${choir.sent ? 'text-primary' : 'text-slate-400'}`}>{choir.sent ? 'AL DÍA' : 'PENDIENTE'}</span>
                  </div>
                </div>
                <span className="text-sm lg:text-base font-black text-primary">{choir.attendance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
