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

const Dashboard: React.FC<DashboardProps> = ({ 
  reports = [], // Valor por defecto para evitar errores si es undefined
  members = [], 
  onNavigateToChoir, 
  onViewAllMembers 
}) => {
  const [filter, setFilter] = useState<TimeFilter>(TimeFilter.TODAY);
  const [showMemberSummary, setShowMemberSummary] = useState(false);

  // 1. Validación de seguridad: Si no hay datos, mostramos un estado de carga o vacío
  // Esto evita que el resto de los useMemo fallen.
  const stats = useMemo(() => {
    if (!Array.isArray(reports)) return { presence: 0, memberCount: 0, sedeCount: 0, growth: "S/D" };
    
    const presentCount = reports.filter(r => r?.present).length;
    const totalRecords = reports.length;
    const ratio = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    return {
      presence: ratio,
      memberCount: members?.length || 0, 
      sedeCount: CHOIR_DATA?.length || 0, 
      growth: totalRecords > 0 ? "+Real" : "S/D"
    };
  }, [reports, members]);

  const choirRankingReal = useMemo(() => {
    if (!CHOIR_DATA) return [];
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
    // Definimos fechas seguras
    const data = [];
    const start = new Date('2026-01-31T00:00:00'); 
    const end = new Date('2026-04-06T23:59:59'); 
    let current = new Date(start);

    // Evitar bucles infinitos con una condición de seguridad extra (max 200 iteraciones)
    let safetyNet = 0;
    while (current <= end && safetyNet < 200) {
      safetyNet++;
      const day = current.getDay();
      if (day === 6 || day === 0) {
        const dateStr = current.toISOString().split('T')[0];
        const dayReports = reports.filter(r => r.date === dateStr);
        const dayPresence = dayReports.length > 0 
          ? Math.round((dayReports.filter(r => r.present).length / dayReports.length) * 100) 
          : 0;

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

  // Si no hay datos críticos, mostramos un loader simple en lugar de romper la app
  if (!reports || !members) {
    return <div className="p-10 text-center font-bold">Cargando análisis...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">
            VISTA <span className="text-primary">MÁXIMA</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">Análisis Institucional Pro</p>
        </div>
        
        <div className="flex bg-white dark:bg-card-dark p-2 rounded-2xl shadow-md border border-slate-200 dark:border-white/5">
          {/* Usamos un fallback por si TimeFilter no está cargado */}
          {Object.values(TimeFilter || {}).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as TimeFilter)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                filter === f ? 'bg-primary text-slate-50 shadow-lg' : 'text-slate-400 hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-primary p-10 rounded-[2.5rem] text-slate-50 shadow-premium relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <span className="material-symbols-outlined text-4xl opacity-40">query_stats</span>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-100 opacity-80 mb-2">Asistencia Global</p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl lg:text-8xl font-black tracking-tighter">{stats.presence}%</span>
                <span className="text-lg font-bold opacity-60 uppercase">Efectiva</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowMemberSummary(true)} 
          className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:border-primary transition-all group"
        >
          <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-50 transition-all">
             <span className="material-symbols-outlined text-3xl">diversity_3</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Miembros</p>
            <span className="text-4xl font-black text-slate-900 dark:text-slate-100 leading-none">{stats.memberCount}</span>
          </div>
        </button>

        <button 
          onClick={onViewAllMembers}
          className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between hover:border-primary transition-all group"
        >
          <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-50 transition-all">
             <span className="material-symbols-outlined text-3xl">church</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sedes</p>
            <span className="text-4xl font-black text-slate-900 dark:text-slate-100 leading-none">{stats.sedeCount}</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark p-10 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5">
          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100 mb-8">Historial de Auditoría</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekendChartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0
