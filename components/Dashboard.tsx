
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

  const stats = useMemo(() => {
    const presentCount = reports.filter(r => r.present).length;
    const ratio = reports.length > 0 ? Math.round((presentCount / reports.length) * 100) : 88;
    return {
      presence: ratio,
      memberCount: members.length, 
      sedeCount: CHOIR_DATA.length, 
      growth: "+14.2%"
    };
  }, [reports, members]);

  const choirStatus = useMemo(() => {
    return CHOIR_DATA.map(choir => {
      const hasReports = reports.some(r => {
        const member = members.find(m => m.id === r.memberId);
        return member?.choirId === choir.id;
      });
      return { ...choir, sent: hasReports };
    });
  }, [reports, members]);

  const scrollToRanking = () => {
    const element = document.getElementById('ranking-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Lógica de datos generada para fines de semana desde 31/01/2026 hasta 06/04/2026
  const weekendChartData = useMemo(() => {
    const start = new Date('2026-01-31T12:00:00');
    const end = new Date('2026-04-06T12:00:00');
    const data = [];
    
    let current = new Date(start);
    let baseVal = 420;

    while (current <= end) {
      const day = current.getDay();
      // Solo Sábados (6) y Domingos (0)
      if (day === 6 || day === 0) {
        const dateStr = current.toISOString().split('T')[0];
        const dayName = day === 6 ? 'Sáb' : 'Dom';
        
        // Simulación de crecimiento orgánico en los datos
        baseVal += Math.floor(Math.random() * 40) - 10;

        data.push({
          date: dateStr,
          val: baseVal,
          name: `${dayName} ${current.getDate()}/${current.getMonth() + 1}`,
          fullLabel: `Fin de semana - ${current.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return data;
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 space-y-10 pb-20 text-slate-900 dark:text-white">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-6xl font-black tracking-tighter mb-2">
            VISTA <span className="text-vivid-gradient">MÁXIMA</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-lg uppercase tracking-tight">Análisis Institucional de Alto Impacto</p>
        </div>
        
        <div className="flex bg-white dark:bg-card-dark p-2 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5">
          {Object.values(TimeFilter).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
                filter === f 
                  ? 'bg-primary text-white shadow-xl shadow-primary/40' 
                  : 'text-slate-500 hover:text-primary dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#4d82bc] to-[#0f172a] p-10 rounded-5xl text-white shadow-3xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 size-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-5xl opacity-80">analytics</span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">En Tiempo Real</span>
            </div>
            <div className="mt-12">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] mb-2 opacity-90 text-white/90">Eficiencia de Asistencia</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black tracking-tighter text-white">{stats.presence}%</span>
                <span className="text-2xl font-bold text-[#ecd6c0]">↑ {stats.growth}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onViewAllMembers}
          className="bg-white dark:bg-card-dark p-10 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:scale-[1.02] transition-all group hover:border-primary active:scale-95"
        >
          <div className="size-16 rounded-3xl bg-vibrant-pink/10 flex items-center justify-center text-vibrant-pink group-hover:bg-primary group-hover:text-white transition-all shadow-lg group-hover:shadow-primary/40">
            <span className="material-symbols-outlined text-3xl fill-1">diversity_3</span>
          </div>
          <div className="text-left">
            <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-1">Membresía Global</h3>
            <div className="flex items-center justify-between">
              <span className="text-5xl font-black">{stats.memberCount}</span>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">arrow_forward</span>
            </div>
          </div>
        </button>

        <button 
          onClick={scrollToRanking}
          className="bg-white dark:bg-card-dark p-10 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:scale-[1.02] transition-all group hover:border-secondary active:scale-95"
        >
          <div className="size-16 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-midnight transition-all shadow-lg group-hover:shadow-secondary/40">
            <span className="material-symbols-outlined text-3xl fill-1">stars</span>
          </div>
          <div className="text-left">
            <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-1">Impacto Social</h3>
            <div className="flex items-center justify-between">
              <span className="text-5xl font-black">{stats.sedeCount}</span>
              <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">keyboard_double_arrow_down</span>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark p-12 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between mb-12">
             <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter">Compromiso en Fin de Semana</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Asistencia exclusiva Sábados y Domingos (Ene - Abr 2026)</p>
             </div>
             <div className="flex gap-2 items-center">
                <div className="size-3 bg-primary rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">En Vivo</span>
             </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekendChartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d82bc" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4d82bc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} 
                  dy={20} 
                  interval={1}
                />
                <Tooltip 
                  labelStyle={{ color: '#4d82bc', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
                  contentStyle={{ backgroundColor: '#030712', border: 'none', borderRadius: '24px', color: '#fff', padding: '16px' }} 
                  itemStyle={{ color: '#d8af97', fontWeight: 'bold' }}
                  labelFormatter={(value, payload) => payload[0]?.payload?.fullLabel || value}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#4d82bc" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-12 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5 flex flex-col">
          <h4 className="text-2xl font-black uppercase tracking-tighter mb-1">Monitor de Reportes</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Estado de cumplimiento por sede</p>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[450px] custom-scrollbar">
            {choirStatus.map((choir) => (
              <div 
                key={choir.id}
                onClick={() => onNavigateToChoir(choir.id, ViewType.REPORTS)}
                className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-transparent hover:border-primary/40 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg bg-gradient-to-br ${choir.sent ? 'from-vibrant-pink to-primary' : 'from-slate-400 to-slate-600'}`}>
                    {choir.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight">{choir.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${choir.sent ? 'text-primary' : 'text-slate-500'}`}>
                      {choir.sent ? 'Reporte Recibido' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className={`size-8 rounded-full flex items-center justify-center transition-all ${choir.sent ? 'bg-primary text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-sm font-black">
                    {choir.sent ? 'verified' : 'priority_high'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-midnight font-black rounded-3xl hover:scale-105 transition-all uppercase tracking-[0.2em] text-[11px] shadow-lg">
            Generar Circular de Aviso
          </button>
        </div>
      </div>

      <div id="ranking-section" className="bg-white dark:bg-card-dark p-12 rounded-5xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h4 className="text-2xl font-black uppercase tracking-tighter mb-10">Ranking de Sedes — <span className="text-secondary">Acceso a Miembros</span></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CHOIR_DATA.slice(0, 6).map((choir, idx) => (
              <div 
                key={choir.id} 
                onClick={() => onNavigateToChoir(choir.id, ViewType.CHORUSES)}
                className="relative p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-transparent hover:border-secondary/60 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="size-10 bg-white dark:bg-midnight rounded-2xl flex items-center justify-center text-sm font-black text-secondary shadow-md border border-secondary/20">
                    {idx + 1}
                  </span>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asistencia</p>
                    <p className="text-xl font-black text-primary dark:text-secondary">{choir.attendance}%</p>
                  </div>
                </div>
                <h5 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{choir.name}</h5>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                    style={{ width: `${choir.attendance}%` }}
                  ></div>
                </div>
                <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Inspeccionar Nómina</span>
                   <span className="material-symbols-outlined text-primary text-xl animate-pulse">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
