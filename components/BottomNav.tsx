
import React from 'react';

type View = 'SCHEDULE' | 'SELF_SCHEDULE' | 'EMPLOYER';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onOpenUploader: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, onOpenUploader }) => {
  const tabs = [
    { id: 'SCHEDULE' as View, label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'SELF_SCHEDULE' as View, label: 'Gigs', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'EMPLOYER' as View, label: 'Admin', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
  ];

  const isScheduleView = currentView === 'SCHEDULE';

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-wish-700 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] pb-safe z-40">
      <div className="max-w-3xl mx-auto flex justify-around items-center px-4 pt-4 pb-3 relative">
        
        {/* Floating "Sync" Action Button */}
        <div 
          className={`absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-500 transform ${
            isScheduleView ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'
          }`}
        >
          <button 
            onClick={onOpenUploader}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="relative w-16 h-16">
              {/* Removed continuous Pulse Ring to keep interface professional and less distracting */}
              
              <div className="relative w-16 h-16 bg-wish-accent text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.5)] border-4 border-wish-950 active:scale-90 active:shadow-none transition-all z-10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wish-accent drop-shadow-md">Sync Shift</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setCurrentView(tab.id)} 
              className={`flex flex-col items-center gap-1.5 p-2 w-24 transition-all duration-300 ${
                isActive ? 'text-white scale-110' : 'text-gray-600 opacity-60'
              }`}
            >
              <div className={`p-2 rounded-2xl ${isActive ? 'bg-wish-accent/15' : ''}`}>
                <svg className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                </svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
