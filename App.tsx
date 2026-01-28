import React, { useState, useEffect, useMemo } from 'react';
import { Shift, User, AuthSession } from './types';
import { MockBackend } from './services/mockBackend';
import ShiftCard from './components/ShiftCard';
import FinancialSummary from './components/FinancialSummary';
import IncomeHistory from './components/IncomeHistory';
import ScheduleUploader from './components/ScheduleUploader';
import Marketplace from './components/Marketplace';
import EmployerDashboard from './components/EmployerDashboard';
import Login from './components/Login';
import { DEFAULT_TAX_RATE, TAX_STORAGE_KEY } from './constants';

type View = 'SCHEDULE' | 'SELF_SCHEDULE' | 'EMPLOYER';
type ScheduleTab = 'UPCOMING' | 'HISTORY';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(MockBackend.getSession());
  const [currentView, setCurrentView] = useState<View>('SCHEDULE');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('UPCOMING');
  const [shifts, setShifts] = useState<Shift[]>([]); 
  const [showUploader, setShowUploader] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [taxRate, setTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem(TAX_STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_TAX_RATE;
  });

  const refreshSchedule = async () => {
    if (!session?.user) return;
    const data = await MockBackend.getMySchedule(session.user.id);
    setShifts(data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  };

  useEffect(() => {
    if (session) {
      refreshSchedule();
    }
  }, [currentView, session]);

  useEffect(() => {
    localStorage.setItem(TAX_STORAGE_KEY, taxRate.toString());
  }, [taxRate]);

  const handleNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImport = async (newShifts: Shift[]) => {
    if (!session?.user) return;
    await MockBackend.syncManualShifts(newShifts, session.user.id);
    refreshSchedule();
    handleNotify(`Added ${newShifts.length} shifts!`);
  };

  const handleDeleteShift = async (shiftId: string) => {
    const all = JSON.parse(localStorage.getItem('swift_dev_shifts_v2') || '[]');
    const updated = all.filter((s: Shift) => s.id !== shiftId);
    localStorage.setItem('swift_dev_shifts_v2', JSON.stringify(updated));
    refreshSchedule();
    handleNotify("Shift Removed");
  };

  const handleLogout = () => {
    MockBackend.logout();
    setSession(null);
    setCurrentView('SCHEDULE');
  };

  const clearSchedule = () => {
    if (window.confirm("Clear your entire local schedule and history?")) {
      MockBackend.reset();
      refreshSchedule();
      handleNotify("Schedule Cleared");
      setSession(null);
    }
  };

  const { upcomingShifts, pastShifts } = useMemo(() => {
    const now = new Date();
    const past = shifts.filter(s => new Date(s.endDate) < now).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const upcoming = shifts.filter(s => new Date(s.endDate) >= now);
    return { upcomingShifts: upcoming, pastShifts: past };
  }, [shifts]);

  const groupedUpcomingShifts = useMemo<{ [key: string]: Shift[] }>(() => {
    const groups: { [key: string]: Shift[] } = {};
    upcomingShifts.forEach(shift => {
      const date = new Date(shift.startDate);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(shift);
    });
    return groups;
  }, [upcomingShifts]);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="min-h-screen bg-wish-950 font-sans text-gray-100 flex flex-col selection:bg-wish-accent selection:text-white">
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
             <button onClick={handleLogout} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest border border-wish-800 px-3 py-2 rounded-xl">
               Sign Out
             </button>
             {currentView === 'SCHEDULE' && (
               <>
                 <button onClick={() => setShowUploader(true)} className="bg-wish-accent hover:bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-all">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 pt-6 pb-44 space-y-8 flex-grow w-full overflow-x-hidden">
        {currentView === 'SCHEDULE' && (
          <>
            <div className="flex bg-wish-900/50 p-1 rounded-2xl border border-wish-800 backdrop-blur-sm shadow-inner">
              <button onClick={() => setScheduleTab('UPCOMING')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'UPCOMING' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Upcoming</button>
              <button onClick={() => setScheduleTab('HISTORY')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'HISTORY' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Archive</button>
            </div>

            {scheduleTab === 'UPCOMING' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <section className="mb-8">
                  <FinancialSummary shifts={upcomingShifts} taxRate={taxRate} onTaxChange={setTaxRate} />
                </section>
                <section className="space-y-8">
                  {upcomingShifts.length === 0 ? (
                    <div className="text-center py-24 px-10 bg-wish-900/40 border-2 border-dashed border-wish-800 rounded-[3rem] flex flex-col items-center">
                      <div className="w-20 h-20 bg-wish-800/50 rounded-full flex items-center justify-center mb-6 text-4xl animate-bounce">🗓️</div>
                      <h3 className="text-2xl font-black text-white mb-2">Empty Schedule</h3>
                      <button onClick={() => setCurrentView('SELF_SCHEDULE')} className="w-full max-w-[200px] bg-wish-accent text-white py-4 rounded-2xl text-sm font-black mt-6 uppercase tracking-wider">Self-Schedule</button>
                    </div>
                  ) : (
                    (Object.entries(groupedUpcomingShifts) as [string, Shift[]][]).map(([month, monthShifts]) => (
                      <div key={month}>
                        <div className="flex items-center gap-4 mb-6">
                          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{month}</h2>
                          <div className="h-px flex-grow bg-gradient-to-r from-wish-800 to-transparent"></div>
                        </div>
                        <div className="space-y-4">
                          {monthShifts.map(shift => (
                            <ShiftCard key={shift.id} shift={shift} onDelete={handleDeleteShift} taxRate={taxRate} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="mb-8">
                    <h2 className="text-2xl font-black text-white mb-6">Income History</h2>
                    <IncomeHistory shifts={pastShifts} taxRate={taxRate} />
                 </div>
                 {pastShifts.length > 0 && (
                   <div className="space-y-4">
                     {pastShifts.map(shift => (
                       <div key={shift.id} className="opacity-60 grayscale-[50%] hover:grayscale-0 transition-all">
                         <ShiftCard shift={shift} onDelete={handleDeleteShift} taxRate={taxRate} />
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </>
        )}

        {currentView === 'SELF_SCHEDULE' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><Marketplace onNotify={handleNotify} taxRate={taxRate} userId={session.user.id} /></div>}
        {currentView === 'EMPLOYER' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><EmployerDashboard onNotify={handleNotify} user={session.user} /></div>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-wish-700 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] pb-safe z-40 transition-transform duration-500">
        <div className="max-w-3xl mx-auto flex justify-around px-4 pt-4 pb-3">
          <button onClick={() => setCurrentView('SCHEDULE')} className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'SCHEDULE' ? 'text-wish-accent scale-110' : 'text-gray-600 opacity-60'}`}>
            <div className={`p-2 rounded-2xl ${currentView === 'SCHEDULE' ? 'bg-wish-accent/15' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'SCHEDULE' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">My Schedule</span>
          </button>
          <button onClick={() => setCurrentView('SELF_SCHEDULE')} className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'SELF_SCHEDULE' ? 'text-wish-accent scale-110' : 'text-gray-600 opacity-60'}`}>
            <div className={`p-2 rounded-2xl ${currentView === 'SELF_SCHEDULE' ? 'bg-wish-accent/15' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'SELF_SCHEDULE' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Self-Schedule</span>
          </button>
          <button onClick={() => setCurrentView('EMPLOYER')} className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'EMPLOYER' ? 'text-wish-accent scale-110' : 'text-gray-600 opacity-60'}`}>
            <div className={`p-2 rounded-2xl ${currentView === 'EMPLOYER' ? 'bg-wish-accent/15' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'EMPLOYER' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Admin</span>
          </button>
        </div>
      </nav>

      {notification && (
        <div className="fixed bottom-32 left-6 right-6 z-50 animate-in slide-in-from-bottom-12 duration-500">
          <div className="bg-wish-accent text-white px-8 py-5 rounded-[2rem] shadow-xl text-center font-black text-sm border border-white/20">
            {notification}
          </div>
        </div>
      )}

      {showUploader && <ScheduleUploader onImport={handleImport} onClose={() => setShowUploader(false)} />}
    </div>
  );
};

export default App;