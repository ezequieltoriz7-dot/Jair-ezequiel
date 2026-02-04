
import React, { useState } from 'react';
import { Role, User } from '../types';
import { CHOIR_DATA } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username === 'Admin') {
      onLogin({
        id: 'u-admin',
        name: 'Administrador',
        email: 'admin@esperanza.com',
        role: Role.ADMIN
      });
      return;
    }

    if (username.endsWith('Dr')) {
      const sedeNameInput = username.slice(0, -2).toLowerCase().replace(/\s/g, '');
      const foundChoir = CHOIR_DATA.find(choir => {
        const sanitizedChoirName = choir.name.toLowerCase().replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return sanitizedChoirName === sedeNameInput;
      });

      if (foundChoir) {
        onLogin({
          id: `u-${foundChoir.id}`,
          name: `Director ${foundChoir.name}`,
          email: `${foundChoir.id}@director.com`,
          role: Role.DIRECTOR,
          choirId: foundChoir.id
        });
        return;
      }
    }
    setError('Usuario no registrado');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-100 dark:from-midnight dark:via-midnight dark:to-slate-900 flex items-center justify-center p-6 overflow-hidden font-sans">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] size-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] size-[50%] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-3xl border border-white dark:border-white/5 shadow-premium p-10 lg:p-16 rounded-[3.5rem] flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-6 p-5 bg-primary/10 rounded-3xl shadow-sm border border-primary/20">
              <span className="material-symbols-outlined text-4xl text-primary fill-1">music_note</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase">
              BIENVE<span className="text-primary">NIDOS</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-black uppercase tracking-[0.2em] leading-relaxed">
              Coro Monumental de<br/>Bahía de Banderas
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] text-center">Acceso Directivo</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-midnight border border-slate-200 dark:border-white/10 rounded-3xl px-8 py-5 text-slate-900 dark:text-white text-xl text-center font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="Usuario"
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl text-[11px] font-black text-red-500 text-center animate-shake">
                {error.toUpperCase()}
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[12px]">
              Ingresar al Sistema
            </button>
          </form>

          <div className="mt-12 flex items-center gap-3">
            <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
            <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Gestión Coral Pro v3.0</p>
            <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
