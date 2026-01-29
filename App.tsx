
import React, { useState, useEffect } from 'react';
import { Shift, AuthSession } from './types';
import { MockBackend } from './services/mockBackend';
import { DEFAULT_TAX_RATE, TAX_STORAGE_KEY } from './constants';
import { useShifts } from './hooks/useShifts';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FilterPanel from './components/FilterPanel';
import ShiftCard from './components/ShiftCard';
import FinancialSummary from './components/FinancialSummary';
import IncomeHistory from './components/IncomeHistory';
import ScheduleUploader from './components/ScheduleUploader';
import Marketplace from './components/Marketplace';
import EmployerDashboard from './components/EmployerDashboard';
import Login from './components/Login';

type View = 'SCHEDULE' | 'SELF_SCHEDULE' | 'EMPLOYER';
type ScheduleTab = 'UPCOMING' | 'HISTORY';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(MockBackend.getSession());
  const [currentView, setCurrentView] = useState<View>('SCHEDULE');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('UPCOMING');
  const [showUploader, setShowUploader] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const [taxRate, setTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem(TAX_STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_TAX_RATE;
  });

  const {
    upcomingShifts,
    pastShifts,
    groupedUpcoming,
    filters,
    refreshSchedule
  } = useShifts(session, taxRate);

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

  if (!session) return <Login onLogin={setSession} />;

  return (
    <div className="min-h-screen bg-wish-950 font-sans text-gray-100 flex flex-col selection:bg-wish-accent selection:text-white">
      <Header 
        session={session} 
        onLogout={handleLogout} 
      />

      <main className="max-w-3xl mx-auto px-5 pt-6 pb-44 space-y-8 flex-grow w-full overflow-x-hidden">
        {currentView === 'SCHEDULE' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-grow flex bg-wish-900/50 p-1 rounded-2xl border border-wish-800 backdrop-blur-sm shadow-inner overflow-hidden">
                <button onClick={() => setScheduleTab('UPCOMING')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'UPCOMING' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Upcoming</button>
                <button onClick={() => setScheduleTab('HISTORY')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'HISTORY' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Archive</button>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-wish-accent border-wish-accent text-white shadow-lg shadow-indigo-500/30' : 'bg-wish-900 border-wish-800 text-gray-500 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </button>
            </div>

            {showFilters && <FilterPanel {...filters} />}

            {scheduleTab === 'UPCOMING' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <FinancialSummary shifts={upcomingShifts} taxRate={taxRate} onTaxChange={setTaxRate} />
                <div className="mt-8 space-y-8">
                  {upcomingShifts.length === 0 ? (
                    <div className="text-center py-24 px-10 bg-wish-900/40 border-2 border-dashed border-wish-800 rounded-[3rem] flex flex-col items-center animate-in zoom-in duration-700">
                      <div className="w-20 h-20 bg-wish-800/50 rounded-full flex items-center justify-center mb-6 text-4xl">🗓️</div>
                      <h3 className="text-2xl font-black text-white mb-2">{filters.searchQuery ? "No Matches" : "Empty Schedule"}</h3>
                      <button onClick={() => { filters.setSearchQuery(''); setCurrentView('SELF_SCHEDULE'); }} className="bg-wish-accent text-white px-8 py-4 rounded-2xl text-sm font-black mt-6 uppercase tracking-wider active:scale-95 transition-all">{filters.searchQuery ? "Clear Search" : "Self-Schedule"}</button>
                    </div>
                  ) : (
                    (Object.entries(groupedUpcoming) as [string, Shift[]][]).map(([month, monthShifts]) => (
                      <div key={month}>
                        <div className="flex items-center gap-4 mb-6"><h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{month}</h2><div className="h-px flex-grow bg-gradient-to-r from-wish-800 to-transparent"></div></div>
                        <div className="space-y-4">{monthShifts.map(s => <ShiftCard key={s.id} shift={s} onDelete={handleDeleteShift} taxRate={taxRate} />)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <h2 className="text-2xl font-black text-white mb-6">Income History</h2>
                 <IncomeHistory shifts={pastShifts} taxRate={taxRate} />
                 <div className="mt-8 space-y-4">
                   {pastShifts.map(s => <div key={s.id} className="opacity-60 grayscale-[50%] hover:grayscale-0 transition-all"><ShiftCard shift={s} onDelete={handleDeleteShift} taxRate={taxRate} /></div>)}
                 </div>
              </div>
            )}
          </>
        )}

        {currentView === 'SELF_SCHEDULE' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><Marketplace onNotify={handleNotify} taxRate={taxRate} userId={session.user.id} /></div>}
        {currentView === 'EMPLOYER' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><EmployerDashboard onNotify={handleNotify} user={session.user} /></div>}

        <footer className="mt-12 mb-8 text-center space-y-4">
          <div className="flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Miles A. Moore | Outside We Stand Eternally, LLC</p>
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic leading-none">A self scheduling concept for CSC security</p>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <span className="text-[8px] bg-wish-800 border border-wish-700 text-gray-500 px-2 py-1 rounded-md font-black tracking-widest uppercase">v1.2.1 Final</span>
            <button 
              onClick={() => setShowLog(true)}
              className="text-[9px] font-black text-wish-accent uppercase tracking-widest hover:text-white transition-colors underline decoration-2 underline-offset-4"
            >
              Changelog
            </button>
          </div>
        </footer>
      </main>

      <BottomNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenUploader={() => setShowUploader(true)}
      />

      {notification && <div className="fixed bottom-32 left-6 right-6 z-50 animate-in slide-in-from-bottom-12 duration-500"><div className="bg-wish-accent text-white px-8 py-5 rounded-[2rem] shadow-xl text-center font-black text-sm border border-white/20">{notification}</div></div>}
      
      {showUploader && <ScheduleUploader onImport={handleImport} onClose={() => setShowUploader(false)} />}

      {/* Changelog Modal */}
      {showLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-wish-900 border border-wish-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wish-accent via-indigo-500 to-wish-accent"></div>
             
             <button onClick={() => setShowLog(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>

             <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tighter italic">Update Log</h2>
             <p className="text-[10px] text-wish-accent font-black uppercase tracking-[0.2em] mb-6">Project Finalization v1.2.1</p>

             <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">v1.2.1 - Animation Cleanup</h3>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed">Removed continuous pulsing and bouncing animations for a cleaner, more focused user experience. Entrance animations remain for tactile feedback.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white/50 uppercase tracking-widest">v1.2.0 - Thumb-Reach</h3>
                  <p className="text-[10px] text-gray-600 font-bold leading-relaxed">Relocated all primary sync actions to a central floating FAB for mobile ergonomics.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white/50 uppercase tracking-widest">v1.1.0 - Architecture</h3>
                  <p className="text-[10px] text-gray-600 font-bold leading-relaxed">Modularized state with hooks and extracted sub-components for improved maintainability.</p>
                </div>
             </div>

             <button 
                onClick={() => setShowLog(false)}
                className="w-full bg-wish-accent text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mt-8 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
             >
               Close Log
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
