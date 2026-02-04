import { createClient } from '@supabase/supabase-js'
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

// --- CONFIGURACIÓN DE SUPABASE ---
const supabaseUrl = 'https://nlfzzchyeflxvmnwbtsr.supabase.co'
const supabaseKey = 'sb_publishable_ATzSIJf-if8qMZVGMkqCWg_qYjJpcen'
const supabase = createClient(supabaseUrl, supabaseKey)

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

  // --- NUEVO: CARGAR DATOS DESDE LA NUBE AL INICIAR ---
  useEffect(() => {
    const loadFromCloud = async () => {
      const { data: cloudChoirs } = await supabase.from('coros').select('*');
      if (cloudChoirs && cloudChoirs.length > 0) {
        setChoirs(cloudChoirs);
      }
    };
    loadFromCloud();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { isInitialized.current = true; }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // --- MODIFICADO: AHORA GUARDA EN SUPABASE ---
  const handleUpdateChoirPhoto = async (choirId: string, photoUrl: string) => {
    const updatedChoirs = choirs.map(c => c.id === choirId ? { ...c, imageUrl: photoUrl } : c);
    setChoirs(updatedChoirs);
    
    // Guardar en la nube
    const { error } = await supabase.from('coros').upsert(updatedChoirs);
    if (error) console.error("Error guardando en la nube:", error.message);
  };

  const handleUpdateProfileAvatar = (newAvatar: string) => {
    if (!user) return;
    const updatedUser = { ...user, avatar: newAvatar };
    setUser(updatedUser);
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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-midnight font-

export default App;
