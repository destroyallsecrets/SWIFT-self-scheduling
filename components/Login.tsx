import React, { useState } from 'react';
import { AuthSession } from '../types';
import { MockBackend } from '../services/mockBackend';

interface LoginProps {
  onLogin: (session: AuthSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('staff@csc.com'); // Default for dev ease
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await MockBackend.login(email, password);
      onLogin(session);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wish-950 flex flex-col items-center justify-between p-6 animate-in fade-in duration-700">
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-wish-accent rounded-[2rem] flex items-center justify-center font-black text-4xl text-white shadow-2xl shadow-indigo-500/30 mx-auto mb-6 transform rotate-3">S</div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Swift</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Operational Workforce Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 bg-wish-900/50 p-8 rounded-[3rem] border border-wish-800 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Credential Identity</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white focus:border-wish-accent outline-none font-bold placeholder-gray-600 transition-all"
              placeholder="name@csc.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Secure Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white focus:border-wish-accent outline-none font-bold placeholder-gray-600 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-widest py-2">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-wish-accent hover:bg-indigo-600 text-white font-black py-5 rounded-2xl text-sm shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all uppercase tracking-widest mt-4"
          >
            {loading ? 'Authenticating...' : 'Establish Connection'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Dev Sandbox Credentials:</p>
          <div className="flex justify-center gap-4">
             <button onClick={() => { setEmail('staff@csc.com'); setPassword('password123'); }} className="text-[9px] text-wish-accent font-black hover:underline">STAFF ACCOUNT</button>
             <button onClick={() => { setEmail('manager@csc.com'); setPassword('password123'); }} className="text-[9px] text-indigo-400 font-black hover:underline">MANAGER ACCOUNT</button>
          </div>
        </div>
      </div>

      {/* Intellectual Property Credits Footer */}
      <footer className="w-full max-w-sm mt-12 mb-4 text-center space-y-3 opacity-40 hover:opacity-100 transition-opacity">
        <div className="h-px w-12 bg-wish-800 mx-auto"></div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] leading-relaxed">
          Developed by Miles A. Moore<br/>
          Outside We Stand Eternally, LLC
        </p>
        <p className="text-[9px] text-gray-600 font-bold italic">
          "A self scheduling concept for CSC security"
        </p>
        <a 
          href="https://github.com/OutsideWeStandEternally" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-black text-wish-accent uppercase tracking-widest hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Source Repository
        </a>
      </footer>
    </div>
  );
};

export default Login;