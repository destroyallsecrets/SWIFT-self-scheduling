import React, { useState, useEffect } from 'react';
import { Shift, User } from '../types';
import { MockBackend } from '../services/mockBackend';
import ShiftCard from './ShiftCard';

interface EmployerDashboardProps {
  onNotify: (msg: string) => void;
  user: User;
}

const PRESET_ASSIGNMENTS = [
  "Outside",
  "Main Staff",
  "Suites",
  "Event Level"
];

const VENUE_PRESETS = [
  "Lucas Oil Stadium",
  "Gainbridge Fieldhouse",
  "TCU Amphitheater",
  "Indianapolis Motor Speedway",
  "Victory Field"
];

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNotify, user }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
  
  // Form State
  const [jobName, setJobName] = useState('Main Staff');
  const [venueName, setVenueName] = useState('Lucas Oil Stadium');
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [date, setDate] = useState('2026-06-01');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('23:00');
  const [submitting, setSubmitting] = useState(false);

  const fetchShifts = async () => {
    const data = await MockBackend.getManagerOverview(user.id);
    setShifts(data.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  };

  useEffect(() => {
    fetchShifts();
  }, [user.id]);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role !== 'MANAGER') {
      onNotify('Manager permissions required');
      return;
    }
    setSubmitting(true);

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    try {
      await MockBackend.postMarketplaceShift({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        jobName: jobName.startsWith('Security:') ? jobName : `Security: ${jobName}`,
        venueName,
        address: isCustomVenue ? customAddress : 'Indianapolis, IN'
      }, user.id);
      onNotify('Security Posting Published');
      fetchShifts();
      // Reset some fields
      if (isCustomVenue) {
        setIsCustomVenue(false);
        setCustomAddress('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (shift: Shift) => {
    await MockBackend.approveWorker(shift.id);
    onNotify(`Approved for ${shift.jobName}`);
    fetchShifts();
  };

  const pendingRequests = shifts.filter(s => s.status === 'REQUESTED');
  const activeShifts = shifts.filter(s => s.status === 'AVAILABLE' || s.status === 'CONFIRMED');

  if (user.role !== 'MANAGER') {
    return (
      <div className="text-center py-20 bg-wish-900 border border-wish-800 rounded-[3rem] p-10">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-white font-black text-xl mb-2">Access Restricted</h2>
        <p className="text-gray-500 text-sm">The Admin panel is reserved for Managers. Please contact your supervisor for deployment access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-wish-800 p-1.5 rounded-2xl flex text-xs font-bold border border-wish-700 shadow-inner">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'create' ? 'bg-wish-700 text-white shadow-lg border border-wish-600' : 'text-gray-500 hover:text-white'}`}
        >
          Dispatch Gigs
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 rounded-xl transition-all relative ${activeTab === 'requests' ? 'bg-wish-700 text-white shadow-lg border border-wish-600' : 'text-gray-500 hover:text-white'}`}
        >
          Approvals 
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-wish-950">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="bg-wish-900 border border-wish-800 rounded-[2.5rem] p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Post Security Detail</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational Workforce Management</p>
            </div>
          </div>

          <form onSubmit={handleCreateShift} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Sector Assignment</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ASSIGNMENTS.map(role => (
                  <button 
                    key={role}
                    type="button"
                    onClick={() => setJobName(role)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${jobName === role ? 'bg-wish-accent/20 border-wish-accent text-white' : 'bg-wish-800 border-wish-700 text-gray-500 hover:border-gray-600'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                required
                value={jobName}
                onChange={e => setJobName(e.target.value)}
                className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white focus:border-wish-accent outline-none font-bold"
                placeholder="Custom sector name..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Venue Location</label>
                <button 
                  type="button"
                  onClick={() => {
                    setIsCustomVenue(!isCustomVenue);
                    if (!isCustomVenue) setVenueName('');
                    else setVenueName(VENUE_PRESETS[0]);
                  }}
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${isCustomVenue ? 'bg-wish-accent border-wish-accent text-white' : 'border-wish-700 text-gray-500'}`}
                >
                  {isCustomVenue ? 'Use Presets' : 'Custom Location'}
                </button>
              </div>

              {!isCustomVenue ? (
                <select 
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white font-bold focus:border-wish-accent outline-none appearance-none cursor-pointer"
                >
                  {VENUE_PRESETS.map(v => <option key={v}>{v}</option>)}
                </select>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <input 
                    type="text" 
                    required
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white focus:border-wish-accent outline-none font-bold"
                    placeholder="Venue Name (e.g. Skyline Event Center)"
                  />
                  <input 
                    type="text" 
                    required
                    value={customAddress}
                    onChange={e => setCustomAddress(e.target.value)}
                    className="w-full bg-wish-800 border border-wish-700 rounded-2xl p-4 text-white focus:border-wish-accent outline-none font-bold text-xs"
                    placeholder="Street Address, City, State"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-wish-950/50 p-4 rounded-3xl border border-wish-800">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-white text-xs focus:border-wish-accent outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Start (24h)</label>
                <input 
                  type="time" 
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-white text-xs focus:border-wish-accent outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">End (24h)</label>
                <input 
                  type="time" 
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-wish-800 border border-wish-700 rounded-xl p-3 text-white text-xs focus:border-wish-accent outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-wish-accent hover:bg-indigo-600 text-white font-black py-5 rounded-[2rem] text-sm shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              {submitting ? 'Broadcasting...' : 'Publish to Marketplace'}
            </button>
          </form>

          <div className="mt-10 border-t border-wish-800 pt-8">
            <h3 className="text-gray-500 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">Deployment History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
              {activeShifts.length === 0 ? <p className="text-gray-600 italic text-xs text-center py-4">No security details active.</p> : 
                activeShifts.slice(-8).reverse().map(shift => (
                  <div key={shift.id} className="text-[11px] p-4 bg-wish-800/50 rounded-2xl border border-wish-800 flex justify-between items-center group hover:border-wish-700 transition-colors">
                    <div className="flex flex-col">
                       <span className="text-white font-bold">{shift.jobName}</span>
                       <span className="text-gray-500 text-[9px] uppercase font-black tracking-tighter mt-0.5 truncate max-w-[150px]">{shift.venueName}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] tracking-widest uppercase border ${shift.status === 'CONFIRMED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                      {shift.status}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
           {pendingRequests.length === 0 ? (
             <div className="text-center py-20 bg-wish-900 border border-wish-800 rounded-[3rem] flex flex-col items-center">
               <div className="w-16 h-16 bg-wish-800/50 rounded-full flex items-center justify-center text-3xl mb-4">👮</div>
               <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No pending staff requests</p>
             </div>
           ) : (
             pendingRequests.map(shift => (
               <ShiftCard 
                 key={shift.id} 
                 shift={shift} 
                 actionType="APPROVE"
                 onAction={handleApprove}
                 taxRate={0.22} 
               />
             ))
           )}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;