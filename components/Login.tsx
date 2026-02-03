
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
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 overflow-hidden font-sans">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-[-10%] left-[-10%] size-[50%] bg-primary/20 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] size-[50%] bg-secondary/10 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-12">
            <div className="mb-8 p-4 bg-secondary/10 rounded-3xl gold-glow">
              <span className="material-symbols-outlined text-4xl text-secondary fill-1">shield_person</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tighter mb-2">Portal <span className="text-gold-gradient">Elite</span></h2>
            <p className="text-slate-500 text-sm font-medium">El Umbral De La Esperanza</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-secondary/60 tracking-[0.3em] text-center">Identidad de Usuario</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg text-center font-bold focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-white/10"
                  placeholder="Admin o SedeDr"
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-[11px] font-bold text-red-400 text-center animate-shake">
                {error}
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-secondary text-midnight font-extrabold rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-xl gold-glow uppercase tracking-widest text-[12px]">
              Ingresar al Dashboard
            </button>
          </form>

          <div className="mt-16 text-center">
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.5em]">Seguridad Institucional v2.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
