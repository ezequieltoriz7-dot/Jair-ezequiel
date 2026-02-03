
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Choruses from './components/Choruses';
import Reports from './components/Reports';
import Events from './components/Events';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { ViewType, Member, AttendanceRecord, Event, User, Role, ChoirData } from './types';
import { CHOIR_DATA } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminChoirFilter, setAdminChoirFilter] = useState<string | null>(null);
  
  const [choirs, setChoirs] = useState<ChoirData[]>(CHOIR_DATA);

  const [allUsers, setAllUsers] = useState<User[]>([
    { id: 'u1', name: 'Julio Peña', email: 'bicentenario@director.com', role: Role.DIRECTOR, choirId: '1' },
    { id: 'u2', name: 'Director Bucerias', email: 'bucerias@director.com', role: Role.DIRECTOR, choirId: '2' },
    { id: 'u3', name: 'Director El Guamuchil', email: 'guamuchil@director.com', role: Role.DIRECTOR, choirId: '3' },
    { id: 'u4', name: 'Director El Porvenir', email: 'porvenir@director.com', role: Role.DIRECTOR, choirId: '4' },
    { id: 'u5', name: 'Director La Peñita', email: 'penita@director.com', role: Role.DIRECTOR, choirId: '5' },
    { id: 'u6', name: 'Director Mezcales', email: 'mezcales@director.com', role: Role.DIRECTOR, choirId: '6' },
  ]);

  const initialEvents: Event[] = useMemo(() => {
    const start = new Date('2026-01-31T12:00:00');
    const end = new Date('2026-04-06T12:00:00');
    const evs: Event[] = [];
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day === 6 || day === 0) {
        const dateStr = current.toISOString().split('T')[0];
        evs.push({
          id: `auto-${dateStr}`,
          name: day === 6 ? 'Ensayo General Sabatino' : 'Ensayo General Dominical',
          date: dateStr,
          time: '10:00',
          location: 'Sede Principal'
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return evs;
  }, []);

  const [members, setMembers] = useState<Member[]>([
    { id: '1', firstName: 'Juan Pablo', lastName: 'Gómez', email: 'juan@monumental.com', choirId: '6', voiceType: 'Tenor', gender: 'Hombre' },
    { id: '2', firstName: 'Ana María', lastName: 'Pérez', email: 'ana@monumental.com', choirId: '10', voiceType: 'Soprano', gender: 'Mujer' },
    { id: '3', firstName: 'Luis Eduardo', lastName: 'López', email: 'luis@monumental.com', choirId: '1', voiceType: 'Bajo', gender: 'Hombre' },
    { id: '4', firstName: 'Marta Elena', lastName: 'Ramírez', email: 'marta@monumental.com', choirId: '6', voiceType: 'Contralto', gender: 'Mujer' },
    { id: '5', firstName: 'Ricardo', lastName: 'Sánchez', email: 'ricardo@monumental.com', choirId: '2', voiceType: 'Bajo', gender: 'Hombre' },
    { id: '6', firstName: 'Isabella', lastName: 'Torres', email: 'isabella@monumental.com', choirId: '4', voiceType: 'Soprano', gender: 'Mujer' },
    { id: '7', firstName: 'Fernando', lastName: 'Ruiz', email: 'fernando@monumental.com', choirId: '11', voiceType: 'Tenor', gender: 'Hombre' },
    { id: '8', firstName: 'Sofía', lastName: 'Castro', email: 'sofia@monumental.com', choirId: '8', voiceType: 'Contralto', gender: 'Mujer' }
  ]);
  
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [reports, setReports] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('umbral_session');
      if (savedUser) setUser(JSON.parse(savedUser));
      
      const savedChoirs = localStorage.getItem('umbral_choirs');
      if (savedChoirs) setChoirs(JSON.parse(savedChoirs));
      
      const savedEvents = localStorage.getItem('umbral_events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));

      const savedUsers = localStorage.getItem('umbral_users');
      if (savedUsers) setAllUsers(JSON.parse(savedUsers));
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('umbral_events', JSON.stringify(events));
    } catch (e) {
      console.warn("Límite de memoria excedido", e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('umbral_users', JSON.stringify(allUsers));
    } catch (e) {}
  }, [allUsers]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('umbral_session', JSON.stringify(loggedUser));
    setCurrentView(loggedUser.role === Role.ADMIN ? ViewType.DASHBOARD : ViewType.CHORUSES);
  };

  const handleLogout = () => {
    setUser(null);
    setAdminChoirFilter(null);
    localStorage.removeItem('umbral_session');
  };

  const handleUpdateChoirPhoto = (choirId: string, photoUrl: string) => {
    const updatedChoirs = choirs.map(c => c.id === choirId ? { ...c, imageUrl: photoUrl } : c);
    setChoirs(updatedChoirs);
    try {
      localStorage.setItem('umbral_choirs', JSON.stringify(updatedChoirs));
    } catch(e) {}
  };

  const saveReport = (recs: AttendanceRecord[]) => {
    const eventId = recs[0]?.eventId;
    setReports(prev => [...prev.filter(r => r.eventId !== eventId), ...recs]);
  };

  const handleNavigateToChoir = (choirId: string, view: ViewType) => {
    setAdminChoirFilter(choirId);
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const handleViewAllMembers = () => {
    setAdminChoirFilter(null);
    setCurrentView(ViewType.CHORUSES);
    setIsSidebarOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const effectiveChoirId = user.role === Role.ADMIN ? adminChoirFilter : user.choirId;
  const filteredMembers = effectiveChoirId 
    ? members.filter(m => m.choirId === effectiveChoirId)
    : members;

  const getSedeName = (id: string | null) => choirs.find(c => c.id === id)?.name || id;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] dark:bg-midnight font-sans transition-colors duration-700">
      <Sidebar 
        currentView={currentView} 
        setView={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto relative bg-[#f1f5f9]/40 dark:bg-black/10">
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden p-6 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-xl">music_note</span>
             </div>
             <span className="font-black text-sm tracking-tighter dark:text-white uppercase">EL UMBRAL</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="size-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>

        {user.role === Role.ADMIN && adminChoirFilter && currentView !== ViewType.DASHBOARD && (
          <div className="fixed top-0 lg:left-80 right-0 bg-primary/20 backdrop-blur-xl border-b border-primary/30 px-6 lg:px-12 py-3 z-40 flex justify-between items-center animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
               <div className="size-2 bg-primary rounded-full animate-pulse"></div>
               <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-primary dark:text-white truncate max-w-[150px] lg:max-w-none">
                 Sede: <span className="bg-primary text-white px-2 py-1 rounded-lg ml-1 font-display">{getSedeName(adminChoirFilter)}</span>
               </p>
            </div>
            <button 
              onClick={() => { setAdminChoirFilter(null); setCurrentView(ViewType.DASHBOARD); }}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-vibrant-pink hover:bg-vibrant-pink hover:text-white px-3 py-2 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              <span className="hidden sm:inline">Panel Global</span>
            </button>
          </div>
        )}

        <div className={`p-6 lg:p-16 max-w-[1700px] mx-auto ${adminChoirFilter && currentView !== ViewType.DASHBOARD ? 'pt-20 lg:pt-28' : ''}`}>
          {currentView === ViewType.DASHBOARD && <Dashboard reports={reports} members={members} onNavigateToChoir={handleNavigateToChoir} onViewAllMembers={handleViewAllMembers} />}
          {currentView === ViewType.CHORUSES && (
            <Choruses 
              members={filteredMembers} 
              choirs={choirs}
              directors={allUsers.filter(u => u.role === Role.DIRECTOR)}
              onAddMember={(m) => setMembers(prev => [...prev, m])} 
              onDeleteMember={(id) => setMembers(prev => prev.filter(m => m.id !== id))} 
              onUpdateChoirPhoto={handleUpdateChoirPhoto}
              userRole={user.role} 
              userChoirId={effectiveChoirId || undefined}
            />
          )}
          {currentView === ViewType.REPORTS && <Reports members={filteredMembers} events={events} onSaveReport={saveReport} />}
          {currentView === ViewType.EVENTS && (
            <Events 
              events={events} 
              userRole={user.role}
              onAddEvent={(e) => setEvents(prev => [...prev, e])} 
              onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} 
              onUpdateEvent={handleUpdateEvent}
            />
          )}
          {currentView === ViewType.USER_MANAGEMENT && (
            <UserManagement 
              users={allUsers} 
              setUsers={setAllUsers} 
            />
          )}
        </div>

        {/* Global Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="size-14 lg:size-16 bg-secondary text-midnight rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-card-dark">
            <span className="material-symbols-outlined text-2xl lg:text-3xl font-black">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden size-14 bg-primary text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-card-dark"
          >
            <span className="material-symbols-outlined text-2xl font-black">navigation</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
