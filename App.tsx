import React, { useState, useEffect, useMemo } from 'react';
import { Shift } from './types';
import { MockBackend } from './services/mockBackend';
import ShiftCard from './components/ShiftCard';
import FinancialSummary from './components/FinancialSummary';
import IncomeHistory from './components/IncomeHistory';
import ScheduleUploader from './components/ScheduleUploader';
import Marketplace from './components/Marketplace';
import EmployerDashboard from './components/EmployerDashboard';

type View = 'SCHEDULE' | 'MARKETPLACE' | 'EMPLOYER';
type ScheduleTab = 'UPCOMING' | 'HISTORY';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('SCHEDULE');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('UPCOMING');
  const [shifts, setShifts] = useState<Shift[]>([]); 
  const [showUploader, setShowUploader] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshSchedule = async () => {
    const data = await MockBackend.getMySchedule();
    setShifts(data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  };

  useEffect(() => {
    refreshSchedule();
  }, [currentView]);

  const handleNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImport = async (newShifts: Shift[]) => {
    await MockBackend.syncManualShifts(newShifts);
    refreshSchedule();
    handleNotify(`Added ${newShifts.length} shifts!`);
  };

  const clearSchedule = () => {
    if (window.confirm("Reset all data?")) {
      MockBackend.reset();
      refreshSchedule();
      handleNotify("Database Reset");
    }
  };

  // Split shifts into Upcoming and Past
  const { upcomingShifts, pastShifts } = useMemo(() => {
    const now = new Date();
    // A shift is 'past' if its end date is before now
    const past = shifts.filter(s => new Date(s.endDate) < now).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Newest past first
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

  return (
    <div className="min-h-screen bg-wish-950 font-sans text-gray-100 flex flex-col selection:bg-wish-accent selection:text-white">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 glass border-b border-wish-700/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-wish-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">S</div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">SWIFT</h1>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Indianapolis</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {currentView === 'SCHEDULE' && scheduleTab === 'UPCOMING' && (
               <button 
                onClick={() => setShowUploader(true)}
                className="bg-wish-accent hover:bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-all"
               >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-8 flex-grow w-full overflow-x-hidden">
        
        {currentView === 'SCHEDULE' && (
          <>
            {/* Segmented Control */}
            <div className="flex bg-wish-900/50 p-1 rounded-xl border border-wish-800 backdrop-blur-sm">
              <button 
                onClick={() => setScheduleTab('UPCOMING')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scheduleTab === 'UPCOMING' ? 'bg-wish-800 text-white shadow-sm border border-wish-700/50' : 'text-gray-500 hover:text-gray-300'}`}
              >
                UPCOMING
              </button>
              <button 
                onClick={() => setScheduleTab('HISTORY')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scheduleTab === 'HISTORY' ? 'bg-wish-800 text-white shadow-sm border border-wish-700/50' : 'text-gray-500 hover:text-gray-300'}`}
              >
                HISTORY & INCOME
              </button>
            </div>

            {scheduleTab === 'UPCOMING' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <section className="mb-8">
                  <FinancialSummary shifts={shifts} />
                </section>

                <section className="space-y-8 pb-12">
                  {upcomingShifts.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-wish-900 border border-wish-800 rounded-[2.5rem]">
                      <div className="text-5xl mb-6 grayscale opacity-50">🗓️</div>
                      <h3 className="text-xl font-extrabold text-white mb-2">Build Your Schedule</h3>
                      <p className="text-gray-500 text-sm mb-8 px-4 leading-relaxed font-medium">Sync your existing schedule or claim new shifts from the marketplace.</p>
                      <button onClick={() => setCurrentView('MARKETPLACE')} className="bg-wish-accent/10 text-wish-accent px-6 py-3 rounded-2xl text-sm font-bold border border-wish-accent/20 active:scale-95 transition-all">Go to Marketplace</button>
                    </div>
                  ) : (
                    (Object.entries(groupedUpcomingShifts) as [string, Shift[]][]).map(([month, monthShifts]) => (
                      <div key={month}>
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">
                            {month}
                          </h2>
                          <div className="h-px flex-grow bg-wish-800"></div>
                        </div>
                        <div className="space-y-4">
                          {monthShifts.map(shift => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </section>
                
                <div className="flex justify-center pt-8">
                  <button onClick={clearSchedule} className="text-[10px] font-bold text-gray-700 uppercase tracking-widest hover:text-red-500 transition-colors">Reset App Data</button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 {/* Income Archive View */}
                 <div className="mb-8">
                    <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                       <span>Monthly Statements</span>
                       <span className="text-xs font-bold text-gray-500 bg-wish-800 px-2 py-1 rounded-md border border-wish-700/50">ARCHIVE</span>
                    </h2>
                    <IncomeHistory shifts={pastShifts} />
                 </div>

                 {pastShifts.length > 0 && (
                   <div className="space-y-4 pb-12">
                     <div className="flex items-center gap-4 mb-4 mt-8">
                        <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">
                          Past Shift Log
                        </h2>
                        <div className="h-px flex-grow bg-wish-800"></div>
                     </div>
                     {pastShifts.map(shift => (
                       <div key={shift.id} className="opacity-75 hover:opacity-100 transition-opacity">
                         <ShiftCard shift={shift} />
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </>
        )}

        {currentView === 'MARKETPLACE' && (
          <div className="animate-in slide-in-from-right duration-300">
            <Marketplace onNotify={handleNotify} />
          </div>
        )}

        {currentView === 'EMPLOYER' && (
           <div className="animate-in slide-in-from-right duration-300">
            <EmployerDashboard onNotify={handleNotify} />
           </div>
        )}

      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-wish-700/50 pb-safe z-40">
        <div className="max-w-3xl mx-auto flex justify-around px-4 pt-3 pb-2">
          <button 
            onClick={() => setCurrentView('SCHEDULE')}
            className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'SCHEDULE' ? 'text-wish-accent' : 'text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${currentView === 'SCHEDULE' ? 'bg-wish-accent/10' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'SCHEDULE' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Schedule</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('MARKETPLACE')}
            className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'MARKETPLACE' ? 'text-wish-accent' : 'text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${currentView === 'MARKETPLACE' ? 'bg-wish-accent/10' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'MARKETPLACE' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
          </button>

          <button 
            onClick={() => setCurrentView('EMPLOYER')}
            className={`flex flex-col items-center gap-1.5 p-2 w-full transition-all duration-300 ${currentView === 'EMPLOYER' ? 'text-wish-accent' : 'text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${currentView === 'EMPLOYER' ? 'bg-wish-accent/10' : ''}`}>
              <svg className="w-6 h-6" fill={currentView === 'EMPLOYER' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Business</span>
          </button>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-28 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-3xl shadow-2xl shadow-emerald-500/20 text-center font-bold text-sm">
            {notification}
          </div>
        </div>
      )}

      {/* Modals */}
      {showUploader && (
        <ScheduleUploader 
          onImport={handleImport} 
          onClose={() => setShowUploader(false)} 
        />
      )}
    </div>
  );
};

export default App;