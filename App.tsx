
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Choruses from './components/Choruses';
import Reports from './components/Reports';
import Events from './components/Events';
import EventDetails from './components/EventDetails';
import MemberProfile from './components/MemberProfile';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import QualityAnalytics from './components/QualityAnalytics';
import RawData from './components/RawData';
import DirectorProfileModal from './components/DirectorProfileModal';
import { ViewType, Member, AttendanceRecord, Event, User, Role, ChoirData } from './types';
import { CHOIR_DATA, INITIAL_EVENTS, INITIAL_MEMBERS } from './constants';

const APP_STORAGE_KEY = 'umbral_analitica_v3_core';
const syncChannel = new BroadcastChannel('umbral_sync_channel');

const Persistence = {
  save: (key: string, data: any) => {
    try {
      if (data === null || data === undefined) return;
      localStorage.setItem(`${APP_STORAGE_KEY}_${key}`, JSON.stringify(data));
    } catch (e) { 
      console.error(`Error de persistencia en ${key}:`, e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("La base de datos está llena. Por favor, reduce el tamaño de las imágenes o elimina registros antiguos.");
      }
    }
  },
  load: <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`${APP_STORAGE_KEY}_${key}`);
      if (saved) return JSON.parse(saved);
      return defaultValue;
    } catch (e) { return defaultValue; }
  },
  exportData: () => {
    const data = {
      users: Persistence.load('users', []),
      choirs: Persistence.load('choirs', []),
      members: Persistence.load('members', []),
      reports: Persistence.load('reports', []),
      events: Persistence.load('events', [])
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `respaldo_umbral_db_${new Date().getTime()}.json`; a.click();
  }
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => Persistence.load('dark_mode', false));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [adminChoirFilter, setAdminChoirFilter] = useState<string | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<Event | null>(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Member | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [previousView, setPreviousView] = useState<ViewType>(ViewType.CHORUSES);

  const isInitialized = useRef(false);

  // Estados maestros con carga desde persistencia
  const [user, setUser] = useState<User | null>(() => Persistence.load('session', null));
  const [choirs, setChoirs] = useState<ChoirData[]>(() => Persistence.load('choirs', CHOIR_DATA));
  const [events, setEvents] = useState<Event[]>(() => Persistence.load('events', INITIAL_EVENTS));
  const [allUsers, setAllUsers] = useState<User[]>(() => Persistence.load('users', [
    { id: 'u-admin', name: 'Administrador Maestro', email: 'admin@umbral.com', role: Role.ADMIN },
    { id: 'u-1', name: 'Director Bicentenario', email: 'bic@umbral.com', role: Role.DIRECTOR, choirId: '1' },
    { id: 'u-6', name: 'Director Mezcales', email: 'mez@umbral.com', role: Role.DIRECTOR, choirId: '6' }
  ]));
  const [members, setMembers] = useState<Member[]>(() => Persistence.load('members', INITIAL_MEMBERS));
  const [reports, setReports] = useState<AttendanceRecord[]>(() => Persistence.load('reports', []));

  useEffect(() => {
    const timer = setTimeout(() => { isInitialized.current = true; }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Efecto de Guardado Automático
  useEffect(() => {
    if (!isInitialized.current) return;
    Persistence.save('session', user);
    Persistence.save('users', allUsers);
    Persistence.save('events', events);
    Persistence.save('members', members);
    Persistence.save('reports', reports);
    Persistence.save('choirs', choirs);
    Persistence.save('dark_mode', isDarkMode);
    syncChannel.postMessage('update');
  }, [user, allUsers, events, members, reports, choirs, isDarkMode]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleUpdateChoirPhoto = (choirId: string, photoUrl: string) => {
    setChoirs(prev => prev.map(c => c.id === choirId ? { ...c, imageUrl: photoUrl } : c));
  };

  const handleUpdateProfileAvatar = (newAvatar: string) => {
    if (!user) return;
    const updatedUser = { ...user, avatar: newAvatar };
    setUser(updatedUser);
    // Asegurar que se guarde en la lista global de directores
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, avatar: newAvatar } : u));
  };

  const handleImportData = (newData: any) => {
    if (newData.users) setAllUsers(newData.users);
    if (newData.choirs) setChoirs(newData.choirs);
    if (newData.members) setMembers(newData.members);
    if (newData.reports) setReports(newData.reports);
    if (newData.events) setEvents(newData.events);
    alert("Base de datos sincronizada y guardada.");
  };

  const handleLogin = (loggedUser: User) => {
    const existing = allUsers.find(u => u.id === loggedUser.id);
    const final = existing ? { ...loggedUser, ...existing } : loggedUser;
    if (!existing) setAllUsers(prev => [...prev, loggedUser]);
    setUser(final);
    setCurrentView(final.role === Role.ADMIN ? ViewType.DASHBOARD : ViewType.CHORUSES);
  };

  const handleLogout = () => { setUser(null); setCurrentView(ViewType.DASHBOARD); setIsProfileModalOpen(false); };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-midnight font-sans transition-colors duration-700">
      <Sidebar 
        currentView={(currentView === ViewType.MEMBER_PROFILE || currentView === ViewType.EVENT_DETAILS) ? previousView : currentView} 
        setView={(view) => { if (view === ViewType.CHORUSES && user.role === Role.ADMIN) setAdminChoirFilter(null); setCurrentView(view); setIsSidebarOpen(false); }} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="lg:hidden p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">music_note</span>
             </div>
             <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tighter">EL UMBRAL</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="size-11 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>

        <div className="px-4 py-6 lg:p-16 max-w-[1700px] mx-auto">
          {currentView === ViewType.DASHBOARD && <Dashboard reports={reports} members={members} onNavigateToChoir={(cid, v) => { setAdminChoirFilter(cid); setCurrentView(v); }} onViewAllMembers={() => { setAdminChoirFilter(null); setCurrentView(ViewType.CHORUSES); }} />}
          {currentView === ViewType.CHORUSES && (
            <Choruses 
              members={members} 
              choirs={choirs}
              reports={reports}
              directors={allUsers.filter(u => u.role === Role.DIRECTOR)}
              onAddMember={(m) => setMembers(prev => [...prev, m])} 
              onDeleteMember={(id) => setMembers(prev => prev.filter(m => m.id !== id))} 
              onUpdateChoirPhoto={handleUpdateChoirPhoto}
              onViewMember={(m) => { setPreviousView(currentView); setSelectedMemberForProfile(m); setCurrentView(ViewType.MEMBER_PROFILE); }}
              userRole={user.role} 
              userChoirId={user.role === Role.ADMIN ? (adminChoirFilter || undefined) : user.choirId}
              currentUser={user}
            />
          )}
          {currentView === ViewType.REPORTS && <Reports members={members.filter(m => user.role === Role.ADMIN ? (adminChoirFilter ? m.choirId === adminChoirFilter : true) : m.choirId === user.choirId)} events={events} onSaveReport={(recs) => setReports(prev => [...prev, ...recs])} reports={reports} currentUser={user} />}
          {currentView === ViewType.EVENTS && <Events events={events} userRole={user.role} onAddEvent={(e) => setEvents(prev => [...prev, e])} onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} onUpdateEvent={(e) => setEvents(prev => prev.map(ev => ev.id === e.id ? e : ev))} onViewEvent={(e) => { setPreviousView(ViewType.EVENTS); setSelectedEventForDetails(e); setCurrentView(ViewType.EVENT_DETAILS); }} />}
          {currentView === ViewType.EVENT_DETAILS && selectedEventForDetails && <EventDetails event={selectedEventForDetails} onBack={() => setCurrentView(previousView)} />}
          {currentView === ViewType.MEMBER_PROFILE && selectedMemberForProfile && <MemberProfile member={selectedMemberForProfile} reports={reports} events={events} choir={choirs.find(c => c.id === selectedMemberForProfile.choirId)!} onBack={() => setCurrentView(previousView)} />}
          {currentView === ViewType.USER_MANAGEMENT && <UserManagement users={allUsers} setUsers={setAllUsers} />}
          {currentView === ViewType.ANALYTICS && <QualityAnalytics reports={reports} choirs={choirs} members={members} events={events} userRole={user.role} />}
          {currentView === ViewType.RAW_DATA && <RawData reports={reports} members={members} choirs={choirs} events={events} users={allUsers} onMemberClick={(m) => { setPreviousView(currentView); setSelectedMemberForProfile(m); setCurrentView(ViewType.MEMBER_PROFILE); }} />}
        </div>

        {isProfileModalOpen && user && <DirectorProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onUpdateAvatar={handleUpdateProfileAvatar} onImportData={handleImportData} onExportData={Persistence.exportData} members={members} reports={reports} choirs={choirs} />}

        <button onClick={() => setIsDarkMode(!isDarkMode)} className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <span className="material-symbols-outlined text-2xl font-black">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </main>
    </div>
  );
};

export default App;
