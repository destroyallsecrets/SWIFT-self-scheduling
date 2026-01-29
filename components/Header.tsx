
import React from 'react';
import { AuthSession } from '../types';

interface HeaderProps {
  session: AuthSession;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onLogout }) => (
  <header className="sticky top-0 z-40 glass border-b border-wish-700/50 px-6 py-4">
    <div className="max-w-3xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-wish-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">S</div>
        <div>
          <h1 className="text-lg font-black tracking-tighter leading-none">SWIFT</h1>
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{session.user.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onLogout} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest border border-wish-800 px-3 py-2 rounded-xl">Sign Out</button>
      </div>
    </div>
  </header>
);

export default Header;
