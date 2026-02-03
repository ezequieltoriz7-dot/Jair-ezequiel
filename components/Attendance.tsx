
import React, { useState, useMemo } from 'react';
import { Member, AttendanceRecord } from '../types';

interface AttendanceProps {
  members: Member[];
  onSaveReport: (records: AttendanceRecord[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ members, onSaveReport }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 5 || day === 6; // Sábado o Domingo (Ajuste según necesidad, 6=Sábado, 0=Domingo en JS)
    // Nota: d.getDay() devuelve 0 para Domingo, 6 para Sábado.
  }, [selectedDate]);

  const isValidDate = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6; // Sábado o Domingo
  };

  const togglePresence = (memberId: string) => {
    setPresenceMap(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const handleSave = () => {
    if (!isValidDate()) {
      alert("La asistencia solo se puede reportar Sábados y Domingos.");
      return;
    }
    const newRecords: AttendanceRecord[] = members.map(m => ({
      date: selectedDate,
      memberId: m.id,
      present: !!presenceMap[m.id]
    }));
    onSaveReport(newRecords);
    alert("¡Reporte guardado con éxito!");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-4xl font-black tracking-tight dark:text-white">Reporte de Asistencia</h2>
        <p className="text-[#758a60] dark:text-[#a1b48d] text-lg">Marca la presencia de los miembros en los ensayos de fin de semana.</p>
      </div>

      <div className="bg-white dark:bg-[#1f2915] rounded-3xl border border-border-light dark:border-border-dark shadow-xl overflow-hidden">
        <div className="p-8 border-b border-border-light dark:border-border-dark flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#758a60] tracking-widest">Fecha de Ensayo</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background-light dark:bg-[#2d3a22] border-none rounded-xl font-bold p-3 text-sm focus:ring-2 focus:ring-primary"
            />
            {!isValidDate() && (
              <span className="text-[10px] text-red-500 font-bold">* Selecciona un Sábado o Domingo</span>
            )}
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-black">{Object.values(presenceMap).filter(v => v).length}</p>
              <p className="text-[10px] font-bold text-[#758a60] uppercase">Presentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-red-500">{members.length - Object.values(presenceMap).filter(v => v).length}</p>
              <p className="text-[10px] font-bold text-[#758a60] uppercase">Ausentes</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto">
          {members.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <span className="material-symbols-outlined text-4xl text-[#758a60]">person_off</span>
               <p className="text-[#758a60] font-medium">No hay miembros para listar. Agrega algunos en 'Mis Coros'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => togglePresence(member.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    presenceMap[member.id] 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'bg-background-light dark:bg-[#2d3a22] border-transparent hover:border-gray-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${presenceMap[member.id] ? 'text-black dark:text-primary' : ''}`}>
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-[10px] text-[#758a60]">Miembro Activo</span>
                  </div>
                  <div className={`size-10 rounded-full flex items-center justify-center transition-all ${
                    presenceMap[member.id] ? 'bg-primary text-black scale-110' : 'bg-gray-200 dark:bg-white/10 text-[#758a60]'
                  }`}>
                    <span className="material-symbols-outlined">
                      {presenceMap[member.id] ? 'check' : 'close'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-border-light dark:border-border-dark flex justify-end">
          <button 
            disabled={members.length === 0 || !isValidDate()}
            onClick={handleSave}
            className="px-10 py-4 bg-primary text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale"
          >
            GUARDAR REPORTE SEMANAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
