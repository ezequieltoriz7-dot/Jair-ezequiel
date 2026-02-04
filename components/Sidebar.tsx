
import React from 'react';
import { ViewType, Role, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, isOpen, onClose, onProfileClick }) => {
  const isAdmin = user?.role === Role.ADMIN;

  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Panel Global', icon: 'space_dashboard', roles: [Role.ADMIN], color: 'text-primary' },
    { id: ViewType.ANALYTICS, label: 'Calidad Pro', icon: 'query_stats', roles: [Role.ADMIN], color: 'text-vibrant-pink' },
    { id: ViewType.CHORUSES, label: isAdmin ? 'Sedes' : 'Mi Sede', icon: 'mic_external_on', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-pink' },
    { id: ViewType.REPORTS, label: 'Libro de Actas', icon: 'auto_stories', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-cyan' },
    { id: ViewType.EVENTS, label: 'Cartelera', icon: 'confirmation_number', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-green' },
    { id: ViewType.RAW_DATA, label: 'Base de Datos', icon: 'database', roles: [Role.ADMIN], color: 'text-primary' },
    { id: ViewType.USER_MANAGEMENT, label: 'Directiva', icon: 'admin_panel_settings', roles: [Role.ADMIN], color: 'text-primary' },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || Role.DIRECTOR));

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-white/5 flex flex-col p-8 h-full z-50 transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-3xl' : '-translate-x-full'}`}>
        <div className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
               <span className="material-symbols-outlined text-white font-black text-2xl">music_note</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-slate-100 leading-none uppercase">EL UMBRAL</h1>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Analítica Pro</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
                currentView === item.id
                  ? 'bg-primary text-slate-50 shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${currentView === item.id ? 'fill-1 text-slate-50' : `group-hover:${item.color}`}`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-tight uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 mt-auto">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => { onProfileClick(); onClose(); }}
              className="w-full flex items-center gap-4 mb-4 hover:bg-white dark:hover:bg-white/5 p-2 rounded-2xl transition-all group"
            >
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-slate-50 font-black text-lg shadow-md overflow-hidden shrink-0">
                 {user?.avatar ? <img src={user.avatar} className="size-full object-cover" alt={user.name} /> : user?.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate uppercase">{user?.name}</p>
                <p className="text-xs text-primary font-bold uppercase tracking-widest">{user?.role}</p>
              </div>
            </button>
            <button onClick={onLogout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
