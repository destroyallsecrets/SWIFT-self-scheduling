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
    <div className="min-h-screen bg-wish-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-wish-accent rounded-[2rem] flex items-center justify-center font-black text-4xl text-white shadow-2xl shadow-indigo-500/30 mx-auto mb-6 transform rotate-3">S</div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Swift</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Operational Workforce Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-wish-900/50 p-8 rounded-[3rem] border border-wish-800 shadow-2xl backdrop-blur-sm">
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
    </div>
  );
};

export default Login;