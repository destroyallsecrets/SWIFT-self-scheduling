import React, { useState } from 'react';
import { Shift } from '../types';

interface ScheduleUploaderProps {
  onImport: (shifts: Shift[]) => void;
  onClose: () => void;
}

const PRESET_VENUES = [
  "Lucas Oil Stadium",
  "Gainbridge Fieldhouse",
  "TCU Amphitheater",
  "Indy Motor Speedway",
  "Victory Field",
  "Convention Center"
];

const PRESET_ASSIGNMENTS = [
  "Outside",
  "Main Staff",
  "Suites",
  "Event Level"
];

const ScheduleUploader: React.FC<ScheduleUploaderProps> = ({ onImport, onClose }) => {
  const [jobName, setJobName] = useState('Main Staff');
  const [venueName, setVenueName] = useState('Lucas Oil Stadium');
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('23:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const newShift: Shift = {
      id: crypto.randomUUID(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      jobName: jobName.startsWith('Security:') ? jobName : `Security: ${jobName || "General Staff"}`,
      venueName: venueName || "Local Venue",
      address: isCustomVenue ? (customAddress || "Indianapolis, IN") : "Indianapolis, IN",
      status: 'CONFIRMED',
      source: 'MANUAL'
    };

    onImport([newShift]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-end justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-wish-950 w-full max-w-xl rounded-t-[3rem] border-t border-wish-700 shadow-2xl relative animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[95vh]">
        <div className="w-12 h-1.5 bg-wish-800 rounded-full mx-auto my-4 flex-shrink-0"></div>

        <div className="px-6 pb-12 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Sync Shift</h2>
              <p className="text-[10px] text-wish-accent font-black uppercase tracking-[0.2em] mt-1">CSC Security Division</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-wish-900 rounded-full flex items-center justify-center text-gray-500 border border-wish-800 active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-3 ml-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Security Assignment</label>
                <span className="text-[9px] font-black text-wish-accent bg-wish-accent/10 px-2 py-0.5 rounded-full border border-wish-accent/20">POST ONLY</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_ASSIGNMENTS.map(role => (
                  <button 
                    key={role}
                    type="button"
                    onClick={() => setJobName(role)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black tracking-tight transition-all border ${jobName === role ? 'bg-wish-accent border-wish-accent text-white shadow-lg shadow-indigo-500/30' : 'bg-wish-900 border-wish-800 text-gray-500 hover:text-gray-300'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              
              <input 
                type="text" 
                placeholder="Custom Sector Detail..."
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full bg-wish-900 border border-wish-800 focus:border-wish-accent p-4 text-sm font-bold text-white outline-none transition-all rounded-2xl"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3 ml-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Event Venue</label>
                <button 
                  type="button"
                  onClick={() => {
                    setIsCustomVenue(!isCustomVenue);
                    if (!isCustomVenue) setVenueName('');
                    else setVenueName(PRESET_VENUES[0]);
                  }}
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${isCustomVenue ? 'bg-wish-accent border-wish-accent text-white' : 'border-wish-700 text-gray-500'}`}
                >
                  {isCustomVenue ? 'Use Presets' : 'Custom'}
                </button>
              </div>

              {!isCustomVenue ? (
                <div className="flex flex-wrap gap-2">
                  {PRESET_VENUES.map(venue => (
                    <button 
                      key={venue}
                      type="button"
                      onClick={() => setVenueName(venue)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${venueName === venue ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-wish-900 border-wish-800 text-gray-400'}`}
                    >
                      {venue}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <input 
                    type="text" 
                    required
                    placeholder="Venue Name..."
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-wish-900 border border-wish-800 focus:border-wish-accent p-4 text-sm font-bold text-white outline-none transition-all rounded-2xl"
                  />
                  <input 
                    type="text" 
                    placeholder="Address (Optional)..."
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full bg-wish-900 border border-wish-800 focus:border-wish-accent p-4 text-xs font-bold text-white outline-none transition-all rounded-2xl"
                  />
                </div>
              )}
            </section>

            <section className="bg-wish-900 p-6 rounded-[2.5rem] border border-wish-800 shadow-inner">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 ml-2 text-center">Deployment Window (24h)</label>
              <div className="space-y-6">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-wish-800 p-5 rounded-2xl text-white font-black outline-none border border-wish-700 focus:border-wish-accent transition-all text-center"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase ml-2">Clock In</span>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-wish-800 p-5 rounded-2xl text-white font-mono font-black outline-none border border-wish-700 focus:border-wish-accent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase ml-2">Clock Out</span>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-wish-800 p-5 rounded-2xl text-white font-mono font-black outline-none border border-wish-700 focus:border-wish-accent transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button 
              type="submit"
              className="w-full bg-wish-accent hover:bg-indigo-500 text-white font-black py-6 rounded-[2.5rem] text-lg shadow-2xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Add to Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploader;