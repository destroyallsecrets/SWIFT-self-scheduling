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
import { calculateDurationHours, calculateEarnings } from './utils/calculations';

type View = 'SCHEDULE' | 'SELF_SCHEDULE' | 'EMPLOYER';
type ScheduleTab = 'UPCOMING' | 'HISTORY';
type SortOption = 'date-desc' | 'date-asc' | 'earnings' | 'duration';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(MockBackend.getSession());
  const [currentView, setCurrentView] = useState<View>('SCHEDULE');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('UPCOMING');
  const [shifts, setShifts] = useState<Shift[]>([]); 
  const [showUploader, setShowUploader] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Filter/Sort State
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const [taxRate, setTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem(TAX_STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_TAX_RATE;
  });

  const refreshSchedule = async () => {
    if (!session?.user) return;
    const data = await MockBackend.getMySchedule(session.user.id);
    setShifts(data);
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

  // Processing shifts based on filters and sort
  const processedShifts = useMemo(() => {
    let filtered = [...shifts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.jobName.toLowerCase().includes(q) || 
        s.venueName.toLowerCase().includes(q)
      );
    }

    if (filterDateStart) {
      filtered = filtered.filter(s => new Date(s.startDate) >= new Date(filterDateStart));
    }
    if (filterDateEnd) {
      filtered = filtered.filter(s => new Date(s.startDate) <= new Date(filterDateEnd));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'earnings':
          const earnA = calculateEarnings(calculateDurationHours(a.startDate, a.endDate), taxRate).net;
          const earnB = calculateEarnings(calculateDurationHours(b.startDate, b.endDate), taxRate).net;
          return earnB - earnA;
        case 'duration':
          const durA = calculateDurationHours(a.startDate, a.endDate);
          const durB = calculateDurationHours(b.startDate, b.endDate);
          return durB - durA;
        case 'date-desc':
        default:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

    return filtered;
  }, [shifts, searchQuery, sortBy, filterDateStart, filterDateEnd, taxRate]);

  const { upcomingShifts, pastShifts } = useMemo(() => {
    const now = new Date();
    const past = processedShifts.filter(s => new Date(s.endDate) < now);
    const upcoming = processedShifts.filter(s => new Date(s.endDate) >= now);
    
    if (sortBy === 'date-desc' && scheduleTab === 'UPCOMING') {
       upcoming.reverse(); 
    }

    return { upcomingShifts: upcoming, pastShifts: past };
  }, [processedShifts, scheduleTab, sortBy]);

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
            <div className="flex items-center gap-2">
              <div className="flex-grow flex bg-wish-900/50 p-1 rounded-2xl border border-wish-800 backdrop-blur-sm shadow-inner overflow-hidden">
                <button onClick={() => setScheduleTab('UPCOMING')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'UPCOMING' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Upcoming</button>
                <button onClick={() => setScheduleTab('HISTORY')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${scheduleTab === 'HISTORY' ? 'bg-wish-800 text-white border border-wish-700/50' : 'text-gray-500'}`}>Archive</button>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-wish-accent border-wish-accent text-white shadow-lg shadow-indigo-500/30' : 'bg-wish-900 border-wish-800 text-gray-500 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            {showFilters && (
              <div className="bg-wish-900/80 border border-wish-800 p-6 rounded-[2.5rem] space-y-5 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Search Gigs</label>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search Job or Venue..."
                      className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none focus:border-wish-accent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Sort Order</label>
                    <select 
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as SortOption)}
                      className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none focus:border-wish-accent transition-all appearance-none cursor-pointer"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="earnings">Highest Pay</option>
                      <option value="duration">Longest Shift</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">From Date</label>
                    <input 
                      type="date" 
                      value={filterDateStart}
                      onChange={e => setFilterDateStart(e.target.value)}
                      className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">To Date</label>
                    <input 
                      type="date" 
                      value={filterDateEnd}
                      onChange={e => setFilterDateEnd(e.target.value)}
                      className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSortBy('date-desc');
                    setFilterDateStart('');
                    setFilterDateEnd('');
                  }}
                  className="w-full py-2 text-[10px] font-black text-gray-500 uppercase hover:text-red-400 transition-colors tracking-[0.2em]"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {scheduleTab === 'UPCOMING' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <section className="mb-8">
                  <FinancialSummary shifts={upcomingShifts} taxRate={taxRate} onTaxChange={setTaxRate} />
                </section>
                <section className="space-y-8">
                  {upcomingShifts.length === 0 ? (
                    <div className="text-center py-24 px-10 bg-wish-900/40 border-2 border-dashed border-wish-800 rounded-[3rem] flex flex-col items-center">
                      <div className="w-20 h-20 bg-wish-800/50 rounded-full flex items-center justify-center mb-6 text-4xl animate-bounce">🗓️</div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        {searchQuery ? "No Matches" : "Empty Schedule"}
                      </h3>
                      <button onClick={() => { setSearchQuery(''); setCurrentView('SELF_SCHEDULE'); }} className="w-full max-w-[200px] bg-wish-accent text-white py-4 rounded-2xl text-sm font-black mt-6 uppercase tracking-wider">
                        {searchQuery ? "Clear Search" : "Self-Schedule"}
                      </button>
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
                 {pastShifts.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                       <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No matching history found.</p>
                    </div>
                 )}
              </div>
            )}
          </>
        )}

        {currentView === 'SELF_SCHEDULE' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><Marketplace onNotify={handleNotify} taxRate={taxRate} userId={session.user.id} /></div>}
        {currentView === 'EMPLOYER' && <div className="animate-in slide-in-from-right-8 fade-in duration-500"><EmployerDashboard onNotify={handleNotify} user={session.user} /></div>}

        <footer className="mt-12 mb-8 text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
            Miles A. Moore | Outside We Stand Eternally, LLC
          </p>
          <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic">
            A self scheduling concept for CSC security
          </p>
        </footer>
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