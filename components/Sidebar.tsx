
import React from 'react';
import { ViewType, Role, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, isOpen, onClose }) => {
  const isAdmin = user?.role === Role.ADMIN;

  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Panel Global', icon: 'space_dashboard', roles: [Role.ADMIN], color: 'text-secondary' },
    { id: ViewType.CHORUSES, label: 'Mi Sede', icon: 'mic_external_on', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-pink' },
    { id: ViewType.REPORTS, label: 'Libro de Actas', icon: 'auto_stories', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-cyan' },
    { id: ViewType.EVENTS, label: 'Cartelera', icon: 'confirmation_number', roles: [Role.ADMIN, Role.DIRECTOR], color: 'text-vibrant-green' },
    { id: ViewType.USER_MANAGEMENT, label: 'Directiva', icon: 'admin_panel_settings', roles: [Role.ADMIN], color: 'text-primary' },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || Role.DIRECTOR));

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white/95 dark:bg-midnight/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex flex-col p-8 h-full z-50 transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-3xl' : '-translate-x-full'}`}>
        <div className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-gradient-to-br from-secondary via-vibrant-pink to-primary rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
               <span className="material-symbols-outlined text-white font-black text-2xl">music_note</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">EL UMBRAL</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Sinfonía de Datos</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden size-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-500 group relative overflow-hidden ${
                currentView === item.id
                  ? 'bg-primary text-white dark:bg-white dark:text-midnight shadow-2xl scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
              }`}
            >
              {currentView === item.id && (
                <div className={`absolute left-0 top-0 w-1.5 h-full ${item.color.replace('text', 'bg')}`}></div>
              )}
              <span className={`material-symbols-outlined text-2xl ${currentView === item.id ? 'fill-1' : `group-hover:${item.color}`}`}>
                {item.icon}
              </span>
              <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 mt-auto">
          <div className="p-5 bg-white dark:bg-white/5 rounded-4xl border border-slate-200 dark:border-white/5 mb-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-2xl bg-secondary relative overflow-hidden flex items-center justify-center text-white font-black text-lg shadow-xl border-2 border-white dark:border-slate-800">
                 {user?.avatar ? (
                   <img src={user.avatar} className="size-full object-cover" alt={user.name} />
                 ) : (
                   user?.name.charAt(0)
                 )}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase">{user?.name}</p>
                <p className="text-[10px] text-secondary font-black tracking-widest uppercase">
                  ID: {user?.role}
                </p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Salir del Sistema
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
